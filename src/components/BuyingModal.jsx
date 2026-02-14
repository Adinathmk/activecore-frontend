import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const CheckoutModal = ({ isOpen, onClose, cartItems, totalAmount }) => {
  const [paymentType, setPaymentType] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const { currentUser } = useAuth();
  const navigate=useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) setCurrentStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateStep(currentStep)) return;

  // Helper: Update product stock after order
  const updateProductStock = async (items) => {
    for (const item of items) {
      try {
        const { data: product } = await axiosInstance.get(`/products/${item.id}`);
        const newCount = Math.max(0, (product.count || 0) - item.quantity);
        await axiosInstance.patch(`/products/${item.id}`, { count: newCount});
      } catch (err) {
        console.error(`Failed to update stock for ${item.name}:`, err);
      }
    }
  };

  // ✅ COD PAYMENT
  if (paymentType === "cod") {
    try {
      const { data } = await axiosInstance.get(`/users/${currentUser.id}`);
      const orderData = {
        orderId: `COD-${Date.now()}`,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          type: item.type,
          quantity: item.quantity,
          price: item.price,
          gst: (item.price * item.quantity * 0.18).toFixed(2),
          total: ((item.price * item.quantity) * 1.18).toFixed(2),
          image:item.images[0]
        })),
        totalAmount: totalAmount,
        date: new Date().toISOString(),
        status: "Pending",
        paymentId: null,
      };

      // Save order to user
      await axiosInstance.patch(`/users/${currentUser.id}`, {
        orders: [...(data.orders || []), orderData],
      });

      // ✅ Reduce stock for each product
      await updateProductStock(cartItems);

      toast.success("Order placed successfully with COD!");
      navigate("/orders");
      onClose();
    } catch (error) {
      console.error("Error saving COD order:", error);
      toast.error("Order failed!");
    }
    return;
  }

  // ✅ ONLINE PAYMENT VIA RAZORPAY
  if (!window.Razorpay) {
    toast.error("Razorpay SDK not loaded!");
    return;
  }

  const options = {
    key: "rzp_test_edrzdb8Gbx5U5M",
    amount: Math.round(totalAmount * 100),
    currency: "INR",
    name: "ActiveCore",
    description: "Test Transaction",
    handler: async function (response) {
      toast.success("Order Placed successfully!");
      try {
        const { data } = await axiosInstance.get(`/users/${currentUser.id}`);
        const orderData = {
          orderId: response.razorpay_payment_id,
          items: cartItems.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            type: item.type,
            price: item.price,
            gst: (item.price * item.quantity * 0.18).toFixed(2),
            total: ((item.price * item.quantity) * 1.18).toFixed(2),
            image:item.images[0]
          })),
          totalAmount: totalAmount,
          date: new Date().toISOString(),
          status: "Pending",
          paymentId: response.razorpay_payment_id,
        };

        await axiosInstance.patch(`/users/${currentUser.id}`, {
          orders: [...(data.orders || []), orderData],
        });

        // ✅ Reduce stock for each product
        await updateProductStock(cartItems);

        navigate("/orders");
        onClose();
      } catch (error) {
        console.error("Error saving order:", error);
        toast.error("Order saving failed.");
      }
    },
    prefill: {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      contact: formData.phone,
    },
    theme: { color: "#2563EB" },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};


  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.zipCode.trim()) newErrors.zipCode = 'PIN code is required';
      if (!formData.country) newErrors.country = 'Country is required';
      if (!paymentType) newErrors.paymentType = 'Payment method required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mt-6">
            {[1, 2].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-500'
                }`}>{step}</div>
                {step < 2 && <div className={`w-12 h-0.5 mx-2 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-300'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 text-sm text-gray-600">
            <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : ''}>Shipping</span>
            <span className="mx-4">•</span>
            <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : ''}>Review</span>
          </div>
        </div>

        {/* Form */}
        <div className="overflow-y-auto max-h-[60vh] ">
          <form onSubmit={handleSubmit} className="p-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Shipping Information</h3>

                {/* Shipping Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors" />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${errors.address ? 'border-red-500' : 'border-gray-300'}`} />
                  {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${errors.city ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <input type="text" name="state" value={formData.state} onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${errors.state ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code *</label>
                    <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${errors.zipCode ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.zipCode && <p className="text-red-500 text-sm">{errors.zipCode}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                    <select name="country" value={formData.country} onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${errors.country ? 'border-red-500' : 'border-gray-300'}`}>
                      <option value="">Select Country</option>
                      <option value="IN">India</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                    {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Payment method</h3>
                  <div className="flex justify-between flex-wrap gap-2">
                    {['cod', 'upi', 'cards', 'netBanking', 'wallet'].map((method) => (
                      <div key={method} className='border px-3 py-1 flex gap-1.5 rounded-lg border-gray-300 items-center'>
                        <input type='radio' id={method} name='paymentType' value={method}
                          checked={paymentType === method}
                          onChange={(e) => setPaymentType(e.target.value)} />
                        <label htmlFor={method}>{method.toUpperCase()}</label>
                      </div>
                    ))}
                  </div>
                  {errors.paymentType && <p className="text-red-500 text-sm mt-1">{errors.paymentType}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Review Your Order</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Order Summary</h4>
                  {cartItems?.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200">
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-800">
                        ₹{(item.price * item.quantity).toFixed(2)} + {((item.price * item.quantity) * 0.18).toFixed(2)}
                      </p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3 font-semibold text-gray-800">
                    <span>Total</span>
                    <span>₹{totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Shipping Address</h4>
                  <p className="text-gray-600">
                    {formData.firstName} {formData.lastName}<br />
                    {formData.address}<br />
                    {formData.city}, {formData.state} {formData.zipCode}<br />
                    {formData.country}
                  </p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex justify-between">
            <button
              type="button"
              onClick={currentStep === 1 ? onClose : handlePreviousStep}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>
            <button
              type="button"
              onClick={currentStep === 2 ? handleSubmit : handleNextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {currentStep === 2 ? 'Place Order' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;

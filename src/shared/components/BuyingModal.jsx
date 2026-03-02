import React, { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { checkoutOrderAPI } from '@/features/orders/api/order.api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Package: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  MapPin: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  CreditCard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  Shield: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
};

// ─── Payment Method Data ───────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: 'cod',   label: 'Cash on Delivery', icon: '💵', desc: 'Pay when delivered' },
  { id: 'cards', label: 'Online Payment',   icon: '💳', desc: 'Credit / Debit / Netbanking (via Stripe)' },
];

// ─── Inline Styles ─────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap');

  .checkout-overlay {
    position: fixed; inset: 0;
    background: rgba(10,8,6,0.75);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    padding: 16px; z-index: 9999;
    animation: overlayIn 0.25s ease;
  }
  @keyframes overlayIn { from { opacity:0 } to { opacity:1 } }

  .checkout-card {
    font-family: 'DM Sans', sans-serif;
    background: #faf9f7;
    border-radius: 20px;
    width: 100%; max-width: 780px;
    max-height: 92vh;
    display: flex; flex-direction: column;
    overflow: hidden;
    box-shadow: 0 32px 80px -8px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08);
    animation: cardIn 0.35s cubic-bezier(0.34,1.4,0.64,1);
  }
  @keyframes cardIn { from { opacity:0; transform:translateY(24px) scale(0.97) } to { opacity:1; transform:none } }

  .checkout-header {
    background: #1a1410;
    padding: 28px 32px 24px;
    flex-shrink: 0;
  }
  .checkout-header-top {
    display: flex; align-items: center; justify-content: space-between;
  }
  .checkout-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 500;
    color: #f5f0e8;
    letter-spacing: -0.02em;
  }
  .checkout-subtitle {
    font-size: 13px; color: #8a7f73; margin-top: 2px;
  }
  .close-btn {
    width: 36px; height: 36px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #8a7f73; cursor: pointer;
    transition: all 0.2s;
  }
  .close-btn:hover { background: rgba(255,255,255,0.1); color: #f5f0e8; }

  /* Steps */
  .steps-row {
    display: flex; align-items: center; gap: 8px;
    margin-top: 24px;
  }
  .step-pill {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 14px 7px 7px;
    border-radius: 100px;
    border: 1px solid rgba(255,255,255,0.08);
    transition: all 0.3s;
    cursor: default;
  }
  .step-pill.active {
    background: rgba(212,180,132,0.15);
    border-color: rgba(212,180,132,0.3);
  }
  .step-num {
    width: 24px; height: 24px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 600;
    background: rgba(255,255,255,0.06);
    color: #8a7f73;
    transition: all 0.3s;
  }
  .step-pill.done .step-num {
    background: #c9a96e; color: #1a1410;
  }
  .step-pill.active .step-num {
    background: #c9a96e; color: #1a1410;
  }
  .step-label {
    font-size: 12px; font-weight: 500; color: #8a7f73;
    transition: color 0.3s;
  }
  .step-pill.active .step-label, .step-pill.done .step-label { color: #c9a96e; }
  .step-connector {
    flex: 1; height: 1px;
    background: linear-gradient(90deg, rgba(201,169,110,0.4), rgba(201,169,110,0.1));
    transition: opacity 0.3s;
  }
  .step-connector.inactive { opacity: 0.3; }

  /* Body */
  .checkout-body {
    overflow-y: auto; flex: 1;
    padding: 32px;
    scrollbar-width: thin;
    scrollbar-color: #e0d5c5 transparent;
  }
  .checkout-body::-webkit-scrollbar { width: 5px; }
  .checkout-body::-webkit-scrollbar-thumb { background: #e0d5c5; border-radius: 9px; }

  /* Section heading */
  .section-heading {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 20px;
  }
  .section-heading-icon {
    width: 32px; height: 32px;
    background: #1a1410;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    color: #c9a96e;
  }
  .section-heading h3 {
    font-family: 'Playfair Display', serif;
    font-size: 17px; font-weight: 500;
    color: #1a1410; letter-spacing: -0.01em;
  }

  /* Field */
  .field-group { display: flex; flex-direction: column; gap: 5px; }
  .field-label {
    font-size: 11px; font-weight: 600;
    color: #8a7f73;
    text-transform: uppercase; letter-spacing: 0.06em;
  }
  .field-input {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    padding: 11px 14px;
    background: #fff;
    border: 1.5px solid #e8e2d8;
    border-radius: 10px;
    color: #1a1410;
    outline: none;
    transition: all 0.2s;
    width: 100%; box-sizing: border-box;
  }
  .field-input:focus {
    border-color: #c9a96e;
    box-shadow: 0 0 0 3px rgba(201,169,110,0.12);
  }
  .field-input.error { border-color: #e05c5c; }
  .field-input::placeholder { color: #c4bcb0; }
  .field-error { font-size: 11px; color: #e05c5c; margin-top: 2px; }

  /* Grid layouts */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .grid-span2 { grid-column: span 2; }

  @media (max-width: 600px) {
    .grid-2 { grid-template-columns: 1fr; }
    .grid-4 { grid-template-columns: 1fr 1fr; }
    .checkout-body { padding: 20px; }
    .checkout-header { padding: 20px; }
  }

  /* Divider */
  .divider {
    height: 1px; background: #ede8e0;
    margin: 28px 0;
  }

  /* Payment methods */
  .payment-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;
  }
  @media (max-width: 600px) { .payment-grid { grid-template-columns: 1fr; } }
  .payment-option {
    display: flex; flex-direction: column; align-items: flex-start;
    gap: 8px; padding: 20px;
    background: #fff;
    border: 1.5px solid #e8e2d8;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }
  .payment-option:hover { 
    border-color: #c9a96e; 
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(201,169,110,0.08);
  }
  .payment-option.selected {
    border-color: #c9a96e;
    background: linear-gradient(135deg, #fffdf9, #fff8ee);
    box-shadow: 0 8px 24px rgba(201,169,110,0.15);
  }
  .payment-option .check-badge {
    position: absolute; top: 16px; right: 16px;
    width: 22px; height: 22px;
    background: #c9a96e; border-radius: 50%;
    display: none; align-items: center; justify-content: center;
    color: #fff;
    box-shadow: 0 4px 12px rgba(201,169,110,0.3);
  }
  .payment-option.selected .check-badge { display: flex; animation: scaleIn 0.3s cubic-bezier(0.34,1.4,0.64,1); }
  @keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .payment-icon { font-size: 28px; line-height: 1; margin-bottom: 4px; }
  .payment-label { font-size: 14px; font-weight: 600; color: #1a1410; letter-spacing: -0.01em; }
  .payment-desc { font-size: 12px; color: #8a7f73; text-align: left; opacity: 0.8; }

  /* Review */
  .review-card {
    background: #fff;
    border: 1px solid #e8e2d8;
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 16px;
  }
  .review-card-header {
    padding: 14px 18px;
    background: #1a1410;
    display: flex; align-items: center; gap: 8px;
  }
  .review-card-header span {
    font-size: 12px; font-weight: 600;
    color: #c9a96e;
    text-transform: uppercase; letter-spacing: 0.08em;
  }
  .review-card-body { padding: 18px; }

  .order-item {
    display: flex; justify-content: space-between; align-items: flex-start;
    padding: 12px 0;
    border-bottom: 1px solid #f0ebe3;
  }
  .order-item:last-of-type { border-bottom: none; }
  .item-name { font-size: 14px; font-weight: 500; color: #1a1410; }
  .item-qty { font-size: 12px; color: #8a7f73; margin-top: 2px; }
  .item-price { font-size: 14px; font-weight: 600; color: #1a1410; text-align: right; }
  .item-tax { font-size: 11px; color: #8a7f73; }

  .total-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 14px 0 0;
    margin-top: 8px;
    border-top: 2px solid #1a1410;
  }
  .total-label { font-family: 'Playfair Display', serif; font-size: 16px; color: #1a1410; }
  .total-amount { font-size: 20px; font-weight: 600; color: #1a1410; }

  .address-text { font-size: 14px; color: #4a4035; line-height: 1.7; }
  .address-name { font-weight: 600; color: #1a1410; }

  .payment-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: #f5f0e8; border: 1px solid #e0d5c5;
    padding: 6px 12px; border-radius: 100px;
    font-size: 12px; font-weight: 500; color: #1a1410;
    margin-top: 8px;
  }

  /* Trust bar */
  .trust-bar {
    display: flex; align-items: center; justify-content: center; gap: 20px;
    padding: 10px 18px; margin-top: 20px;
    background: #f5f0e8; border-radius: 10px;
  }
  .trust-item {
    display: flex; align-items: center; gap: 6px;
    font-size: 11px; color: #8a7f73;
  }
  .trust-item svg { color: #c9a96e; }

  /* Footer */
  .checkout-footer {
    background: #fff;
    border-top: 1px solid #e8e2d8;
    padding: 20px 32px;
    display: flex; justify-content: space-between; align-items: center;
    flex-shrink: 0;
  }
  .btn-ghost {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 500;
    padding: 11px 22px;
    background: transparent;
    border: 1.5px solid #d8d0c4;
    border-radius: 10px;
    color: #4a4035;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-ghost:hover { border-color: #1a1410; color: #1a1410; }
  .btn-primary {
    font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 600;
    padding: 11px 28px;
    background: #1a1410;
    border: none; border-radius: 10px;
    color: #c9a96e;
    cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; gap: 8px;
    letter-spacing: 0.01em;
  }
  .btn-primary:hover { background: #2e2318; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(26,20,16,0.25); }
  .btn-primary:active { transform: none; }
  .btn-primary.loading { opacity: 0.7; cursor: not-allowed; transform: none !important; }

  .footer-total { text-align: right; }
  .footer-total-label { font-size: 11px; color: #8a7f73; }
  .footer-total-amount { font-size: 18px; font-weight: 600; color: #1a1410; }
`;

// ─── Field Component ──────────────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
  <div className="field-group">
    <label className="field-label">{label}</label>
    {children}
    {error && <span className="field-error">{error}</span>}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const CheckoutModal = ({ isOpen, onClose, cartItems = [], totalAmount = 0, isDirectBuy = false }) => {
  const [paymentType, setPaymentType] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zipCode: '', country: '',
  });
  const [errors, setErrors] = useState({});

  // Pre-fill from user if available
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => {
        const address = currentUser.address || {};
        const fullNameParts = (address.full_name || "").split(" ");
        const defaultFirstName = fullNameParts[0] || currentUser.first_name || "";
        const defaultLastName = fullNameParts.slice(1).join(" ") || currentUser.last_name || "";
        const fullAddress = [address.address_line_1, address.address_line_2].filter(Boolean).join(", ");

        return {
          ...prev,
          email: currentUser.email || '',
          firstName: defaultFirstName,
          lastName: defaultLastName,
          phone: address.phone_number || '',
          address: fullAddress || '',
          city: address.city || '',
          state: address.state || '',
          zipCode: address.postal_code || '',
          country: address.country || '',
        };
      });
    }
  }, [currentUser]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.firstName.trim()) e.firstName = 'Required';
    if (!formData.lastName.trim()) e.lastName = 'Required';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) e.email = 'Invalid email';
    if (!formData.address.trim()) e.address = 'Required';
    if (!formData.city.trim()) e.city = 'Required';
    if (!formData.state.trim()) e.state = 'Required';
    if (!formData.zipCode.trim()) e.zipCode = 'Required';
    if (!formData.country) e.country = 'Required';
    if (!paymentType) e.paymentType = 'Select a payment method';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleContinue = () => { if (validate()) setCurrentStep(2); };
  const handleBack = () => setCurrentStep(1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const addr = {
        first_name: formData.firstName, last_name: formData.lastName,
        email: formData.email, phone: formData.phone,
        street_address: formData.address, city: formData.city,
        state: formData.state, postal_code: formData.zipCode, country: formData.country,
      };
      const payload = { shipping_address: addr, billing_address: addr };
      if (isDirectBuy && cartItems.length > 0) {
        payload.variant_id = cartItems[0].variant_id || cartItems[0].id;
        payload.quantity = cartItems[0].quantity || 1;
      }
      const order = await checkoutOrderAPI(payload);
      onClose();
      if (paymentType === 'cod') {
        toast.success('Order placed successfully!');
        navigate('/orders');
      } else {
        navigate(`/payment/${order.id}`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedPayment = PAYMENT_METHODS.find(m => m.id === paymentType);
  const subtotal = totalAmount / 1.18;
  const tax = totalAmount - subtotal;

  return (
    <>
      <style>{styles}</style>
      <div className="checkout-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="checkout-card">

          {/* ── Header ── */}
          <div className="checkout-header">
            <div className="checkout-header-top">
              <div>
                <div className="checkout-title">Checkout</div>
                <div className="checkout-subtitle">Complete your purchase securely</div>
              </div>
              <button className="close-btn" onClick={onClose}><Icon.Close /></button>
            </div>

            <div className="steps-row">
              {[
                { n: 1, label: 'Shipping & Payment' },
                { n: 2, label: 'Review & Confirm' },
              ].map((s, i) => (
                <React.Fragment key={s.n}>
                  <div className={`step-pill ${currentStep === s.n ? 'active' : currentStep > s.n ? 'done' : ''}`}>
                    <div className="step-num">
                      {currentStep > s.n ? <Icon.Check /> : s.n}
                    </div>
                    <span className="step-label">{s.label}</span>
                  </div>
                  {i < 1 && <div className={`step-connector ${currentStep <= 1 ? 'inactive' : ''}`} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* ── Body ── */}
          <div className="checkout-body">

            {/* Step 1 */}
            {currentStep === 1 && (
              <div>
                {/* Shipping */}
                <div className="section-heading">
                  <div className="section-heading-icon"><Icon.MapPin /></div>
                  <div>
                    <h3>Shipping Address</h3>
                  </div>
                </div>

                <div className="grid-2" style={{ marginBottom: 16 }}>
                  <Field label="First Name *" error={errors.firstName}>
                    <input className={`field-input${errors.firstName ? ' error' : ''}`} name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" />
                  </Field>
                  <Field label="Last Name *" error={errors.lastName}>
                    <input className={`field-input${errors.lastName ? ' error' : ''}`} name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" />
                  </Field>
                </div>

                <div className="grid-2" style={{ marginBottom: 16 }}>
                  <Field label="Email *" error={errors.email}>
                    <input className={`field-input${errors.email ? ' error' : ''}`} type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" />
                  </Field>
                  <Field label="Phone">
                    <input className="field-input" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 98765 43210" />
                  </Field>
                </div>

                <Field label="Street Address *" error={errors.address}>
                  <input className={`field-input${errors.address ? ' error' : ''}`} name="address" value={formData.address} onChange={handleInputChange} placeholder="123, MG Road, Apartment 4B" style={{ marginBottom: 16 }} />
                </Field>

                <div className="grid-4" style={{ marginBottom: 4 }}>
                  <Field label="City *" error={errors.city}>
                    <input className={`field-input${errors.city ? ' error' : ''}`} name="city" value={formData.city} onChange={handleInputChange} placeholder="Mumbai" />
                  </Field>
                  <Field label="State *" error={errors.state}>
                    <input className={`field-input${errors.state ? ' error' : ''}`} name="state" value={formData.state} onChange={handleInputChange} placeholder="Maharashtra" />
                  </Field>
                  <Field label="PIN Code *" error={errors.zipCode}>
                    <input className={`field-input${errors.zipCode ? ' error' : ''}`} name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="400001" />
                  </Field>
                  <Field label="Country *" error={errors.country}>
                    <div className="relative">
                      <select 
                        className={`field-input appearance-none bg-transparent relative z-10 w-full cursor-pointer ${errors.country ? ' error' : ''}`} 
                        name="country" 
                        value={formData.country} 
                        onChange={handleInputChange}
                        style={{ paddingRight: '36px' }}
                      >
                        <option value="" disabled hidden>Select Country</option>
                        <option value="IN">India (IN)</option>
                        <option value="US">United States (US)</option>
                        <option value="CA">Canada (CA)</option>
                        <option value="UK">United Kingdom (UK)</option>
                        <option value="AU">Australia (AU)</option>
                        <option value="AE">United Arab Emirates (AE)</option>
                        <option value="SG">Singapore (SG)</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#8a7f73]">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </Field>
                </div>

                <div className="divider" />

                {/* Payment */}
                <div className="section-heading">
                  <div className="section-heading-icon"><Icon.CreditCard /></div>
                  <div><h3>Payment Method</h3></div>
                </div>

                <div className="payment-grid">
                  {PAYMENT_METHODS.map(m => (
                    <div
                      key={m.id}
                      className={`payment-option${paymentType === m.id ? ' selected' : ''}`}
                      onClick={() => { setPaymentType(m.id); if (errors.paymentType) setErrors(p => ({ ...p, paymentType: '' })); }}
                    >
                      <div className="check-badge"><Icon.Check /></div>
                      <span className="payment-icon">{m.icon}</span>
                      <span className="payment-label">{m.label}</span>
                      <span className="payment-desc">{m.desc}</span>
                    </div>
                  ))}
                </div>
                {errors.paymentType && <p className="field-error" style={{ marginTop: 8 }}>{errors.paymentType}</p>}

                <div className="trust-bar" style={{ marginTop: 24 }}>
                  <div className="trust-item"><Icon.Shield /><span>256-bit SSL Encrypted</span></div>
                  <div className="trust-item" style={{ color: '#c4bcb0' }}>|</div>
                  <div className="trust-item"><Icon.Shield /><span>PCI-DSS Compliant</span></div>
                  <div className="trust-item" style={{ color: '#c4bcb0' }}>|</div>
                  <div className="trust-item"><Icon.Shield /><span>Secure Checkout</span></div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <div>
                <div className="section-heading">
                  <div className="section-heading-icon"><Icon.Package /></div>
                  <div><h3>Review Your Order</h3></div>
                </div>

                {/* Order Items */}
                <div className="review-card">
                  <div className="review-card-header">
                    <Icon.Package />
                    <span>Order Items</span>
                  </div>
                  <div className="review-card-body">
                    {cartItems?.map((item, i) => {
                      const itemName = item.name || item.product_name || 'Item';
                      const itemPrice = parseFloat(item.price || item.unit_price || 0);
                      const base = itemPrice * (item.quantity || 1);
                      const itemTax = (base * 0.18).toFixed(2);
                      return (
                        <div className="order-item" key={i}>
                          <div>
                            <div className="item-name">{itemName}</div>
                            <div className="item-qty">Qty: {item.quantity || 1}</div>
                          </div>
                          <div className="item-price">
                            ₹{(base * 1.18).toFixed(2)}
                            <div className="item-tax">incl. ₹{itemTax} GST</div>
                          </div>
                        </div>
                      );
                    })}
                    <div className="total-row">
                      <span className="total-label">Total</span>
                      <span className="total-amount">₹{totalAmount?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping & Payment */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="review-card">
                    <div className="review-card-header">
                      <Icon.MapPin />
                      <span>Shipping Address</span>
                    </div>
                    <div className="review-card-body">
                      <p className="address-text">
                        <span className="address-name">{formData.firstName} {formData.lastName}</span><br />
                        {formData.address}<br />
                        {formData.city}, {formData.state} — {formData.zipCode}<br />
                        {formData.country}
                      </p>
                    </div>
                  </div>
                  <div className="review-card">
                    <div className="review-card-header">
                      <Icon.CreditCard />
                      <span>Payment</span>
                    </div>
                    <div className="review-card-body">
                      {selectedPayment && (
                        <div>
                          <div className="payment-badge">
                            <span>{selectedPayment.icon}</span>
                            <span>{selectedPayment.label}</span>
                          </div>
                          <p className="address-text" style={{ marginTop: 8 }}>{selectedPayment.desc}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="checkout-footer">
            <button className="btn-ghost" onClick={currentStep === 1 ? onClose : handleBack}>
              {currentStep === 1 ? 'Cancel' : '← Back'}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {currentStep === 2 && (
                <div className="footer-total">
                  <div className="footer-total-label">Order Total</div>
                  <div className="footer-total-amount">₹{totalAmount?.toFixed(2)}</div>
                </div>
              )}
              {currentStep === 1 ? (
                <button className="btn-primary" onClick={handleContinue}>
                  Continue <Icon.ChevronRight />
                </button>
              ) : (
                <button className={`btn-primary${loading ? ' loading' : ''}`} onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Placing Order…' : 'Place Order'}
                  {!loading && <Icon.ChevronRight />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutModal;
import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Phone,
  User,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  MapPin,
  CreditCard,
  Calendar
} from "lucide-react";

// ---------- Order Status Badge ----------
export const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    Pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    Confirmed: { color: "bg-indigo-100 text-indigo-800", icon: CheckCircle },
    Processing: { color: "bg-blue-100 text-blue-800", icon: Package },
    Shipped: { color: "bg-purple-100 text-purple-800", icon: Truck },
    Delivered: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    Cancelled: { color: "bg-red-100 text-red-800", icon: XCircle },
    Failed: { color: "bg-red-100 text-red-800", icon: XCircle },
    Refunded: { color: "bg-gray-100 text-gray-800", icon: Clock },
  };

  const config = statusConfig[status] || statusConfig.Pending;
  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      <IconComponent size={12} />
      {status}
    </span>
  );
};

// ---------- Order Details Modal ----------
function OrderDetailsModal({ order, user, isOpen, onClose, onUpdateStatus }) {
  // We format the initial status to PascalCase so it matches the select options if order.status is UPPERCASE
  const formatStatus = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";

  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    setSelectedStatus(formatStatus(order?.status));
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "initial";
    }
    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "initial";
    };
  }, [isOpen, order]);

  if (!isOpen || !order || !user) return null;

 const handleStatusUpdate = () => {
    // UpperCase the selectedStatus for the backend comparison/submission
    const backendStatus = selectedStatus.toUpperCase();
    const orderStatusStr = order.status.toUpperCase();
    if (backendStatus !== orderStatusStr) {
      onUpdateStatus(order.id || order.orderId, selectedStatus);      
    }
    onClose();
  };

  // Backend transitions
  const ALLOWED_TRANSITIONS = {
    PENDING: ["CONFIRMED", "FAILED", "CANCELLED"],
    CONFIRMED: ["PROCESSING", "CANCELLED"],
    PROCESSING: ["SHIPPED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [],
    FAILED: [],
    CANCELLED: [],
    REFUNDED: [],
  };

  const currentStatusUpper = order.status ? order.status.toUpperCase() : "PENDING";
  const allowedNextStatusesUpper = ALLOWED_TRANSITIONS[currentStatusUpper] || [];
  
  // The selectable options are exactly the current status + the allowed next statuses
  const availableOptionsUpper = [currentStatusUpper, ...allowedNextStatusesUpper];
  
  // Map back to PascalCase for the UI dropdown
  const statusOptions = availableOptionsUpper.map(formatStatus);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 px-2 sm:px-4 md:px-4 py-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl relative flex flex-col max-h-full overflow-hidden mx-2 my-auto">
        
        {/* Header */}
        <div className="px-5 sm:px-6 md:px-8 py-5 sm:py-6 border-b border-gray-100 bg-white flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Order Details
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
              <p className="text-sm font-medium text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-md">
                Order ID: {order.id || order.orderId}
              </p>
              {order.placed_at && (
                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                  <Calendar size={14} /> Placed on: {new Date(order.placed_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <OrderStatusBadge status={order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()}/>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 shadow-sm transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 md:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            
            {/* Left Column: Order Items */}
            <div className="lg:col-span-7 space-y-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Package className="text-gray-500" size={18}/>
                Purchased Items
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-md overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                      <img
                        src={item.primary_image_url || item.image}
                        alt={item.product_name || item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">{item.product_name || item.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs sm:text-sm text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-100">Size: {item.variant_size || item.type}</p>
                        <p className="text-xs sm:text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="flex items-end mt-2">
                        <span className="font-semibold text-gray-900">
                          ₹{(item.final_unit_price || item.price) * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Customer & Details */}
            <div className="lg:col-span-5 space-y-6 sm:space-y-8">
              
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <User className="text-gray-500" size={18}/> Customer Information
                </h3>
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden divide-y divide-gray-200">
                  <div className="flex items-center gap-3 p-3">
                    <User className="text-gray-400 flex-shrink-0" size={18} />
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Name</p>
                      <p className="font-medium text-gray-900 text-sm">
                           {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.name || "Unknown"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3">
                    <Mail className="text-gray-400 flex-shrink-0" size={18} />
                    <div className="overflow-hidden">
                      <p className="text-xs text-gray-500 mb-0.5">Email</p>
                      <p className="font-medium text-gray-900 break-all text-sm">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  {(user.phone || user.phone_number) && (
                    <div className="flex items-center gap-3 p-3">
                     <Phone className="text-gray-400 flex-shrink-0" size={18} />
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                        <p className="font-medium text-gray-900 text-sm">{user.phone || user.phone_number}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Address Information */}
              {(order.shipping_address || order.billing_address) && (
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <MapPin className="text-gray-500" size={18}/> Addresses
                  </h3>
                  <div className="space-y-3">
                    {order.shipping_address && (
                      <div className="bg-gray-50 p-3 shadow-sm border border-gray-200 rounded-lg">
                        <div className="flex gap-3 items-start">
                          <MapPin className="text-gray-400 mt-0.5 flex-shrink-0" size={18} />
                          <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">Shipping Address</p>
                            <p className="font-medium text-gray-900 text-sm mb-1">
                              {order.shipping_address.first_name} {order.shipping_address.last_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.shipping_address.street_address}<br/>
                              {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}<br/>
                              {order.shipping_address.country}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {order.billing_address && (
                      <div className="bg-gray-50 p-3 shadow-sm border border-gray-200 rounded-lg">
                        <div className="flex gap-3 items-start">
                          <MapPin className="text-gray-400 mt-0.5 flex-shrink-0" size={18} />
                          <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">Billing Address</p>
                            <p className="font-medium text-gray-900 text-sm mb-1">
                              {order.billing_address.first_name} {order.billing_address.last_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.billing_address.street_address}<br/>
                              {order.billing_address.city}, {order.billing_address.state} {order.billing_address.postal_code}<br/>
                              {order.billing_address.country}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Details */}
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <CreditCard className="text-gray-500" size={18}/> Payment Information
                </h3>
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden divide-y divide-gray-200">
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-600">Method</span>
                    </div>
                    <span className="font-medium text-gray-900 text-sm">{order.payment_method || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={order.is_paid ? "text-green-500" : "text-gray-400"} size={16} />
                      <span className="text-sm text-gray-600">Status</span>
                    </div>
                    <span className={`font-medium text-sm ${order.is_paid ? "text-green-600" : "text-yellow-600"}`}>
                      {order.is_paid ? "Paid" : "Pending"}
                    </span>
                  </div>
                  {order.payment_reference && (
                    <div className="p-3 bg-gray-50 flex flex-col gap-1">
                      <span className="text-xs text-gray-500">Reference ID</span>
                      <span className="font-mono text-xs text-gray-800 break-all">{order.payment_reference}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <CheckCircle className="text-gray-500" size={18}/> Order Summary
                </h3>
                <div className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 p-4 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      ₹
                      {order.subtotal_amount || order.items.reduce(
                        (sum, item) => sum + (item.final_unit_price || item.price) * item.quantity,
                        0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-gray-900">
                      ₹{order.shipping_amount || "0.00"}
                    </span>
                  </div>
                  {order.discount_amount && parseFloat(order.discount_amount) > 0 && (
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">
                        -₹{order.discount_amount}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">GST</span>
                    <span className="font-medium text-gray-900">
                      ₹
                      {order.tax_amount || order.items.reduce(
                        (sum, item) => sum + parseFloat(item.gst || 0),
                        0
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">₹{order.total_amount || order.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Status Update Block */}
              <div>
                 <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
                 <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="flex-1 p-2.5 bg-white border border-gray-300 text-gray-800 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-colors text-sm"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={selectedStatus.toUpperCase() === order.status.toUpperCase()}
                    className="px-5 py-2.5 bg-black text-white text-sm sm:text-base rounded-lg hover:bg-gray-800 shadow-md transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    Update
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 sm:px-6 md:px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm sm:text-base bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsModal;

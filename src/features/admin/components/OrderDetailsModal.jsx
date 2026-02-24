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
} from "lucide-react";

// ---------- Order Status Badge ----------
export const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    Pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    Processing: { color: "bg-blue-100 text-blue-800", icon: Package },
    Shipped: { color: "bg-purple-100 text-purple-800", icon: Truck },
    Delivered: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    Cancelled: { color: "bg-red-100 text-red-800", icon: XCircle },
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
  const [selectedStatus, setSelectedStatus] = useState(order?.status || "");

  useEffect(() => {
    setSelectedStatus(order?.status || "")
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
  }, [isOpen]);

  if (!isOpen || !order || !user) return null;

 const handleStatusUpdate = () => {
    if (selectedStatus !== order.status) {
      onUpdateStatus(order.orderId, selectedStatus);      
    }
    onClose();
  };

  const statusOptions = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 px-3 sm:px-4 py-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl shadow-2xl p-6 relative mx-2 my-auto overflow-y-auto scrollbar-none max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-3 text-gray-400 hover:text-gray-600 bg-white rounded-full p-1.5 shadow-sm"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Order Details
            </h2>
            <p className="text-sm text-gray-600">Order ID: {order.orderId}</p>
          </div>
          <div className="mr-10 mt-4">
            <OrderStatusBadge status={order.status}/>
          </div>
          
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Items */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Order Items</h3>
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600">{item.type}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </span>
                    <span className="font-medium text-gray-900">
                      ₹{item.price*item.quantity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order & Customer Information */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Customer Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                  <User className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{user.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                  <Mail className="text-gray-400" size={18} />
                  <div>
                    <p className="text-xs text-gray-600">Email</p>
                    <p className="font-medium text-gray-900 break-all">
                      {user.email}
                    </p>
                  </div>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                    <Phone className="text-gray-400" size={18} />
                    <div>
                      <p className="text-xs text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900">{user.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
              <div className="space-y-2 p-3 bg-gray-50 rounded-lg border">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>
                    ₹
                    {order.items.reduce(
                      (sum, item) => sum + item.price * item.quantity,
                      0
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST:</span>
                  <span>
                    ₹
                    {order.items.reduce(
                      (sum, item) => sum + parseFloat(item.gst || 0),
                      0
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span>₹{order.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Status Update */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={selectedStatus === order.status}
                className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 pt-6 mt-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsModal;

import {
  X,
  Mail,
  Phone,
  User,
  Shield,
  ShoppingBag,
  Heart,
  Package,
} from "lucide-react";
import React, { useEffect } from "react";

function UserDetailsModal({ user, isOpen, onClose, onBlockUser }) {
  useEffect(() => {
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

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 px-3 sm:px-4 py-4 overflow-y-auto">
      <div
        className="bg-white w-full max-w-lg shadow-2xl 
                   p-6 relative mx-2 my-auto 
                   overflow-y-auto scrollbar-none max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 bg-white rounded-full p-1.5 shadow-sm"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <h2 className="text-xl font-semibold text-gray-800 mb-5">
          User Details
        </h2>

        {/* User Info */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
            <User className="text-white" size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-600">{user.role}</p>
          </div>
        </div>

        {/* Info Sections */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <Mail className="text-gray-400" size={20} />
            <div>
              <p className="text-xs text-gray-600">Email</p>
              <p className="font-medium text-gray-900 break-all">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <Phone className="text-gray-400" size={20} />
            <div>
              <p className="text-xs text-gray-600">Phone</p>
              <p className="font-medium text-gray-900">
                {user.phone || "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <Shield className="text-gray-400" size={20} />
            <div>
              <p className="text-xs text-gray-600">Status</p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {user.status}
              </span>
            </div>
          </div>
        </div>

        {/* Show this only if NOT Admin */}
        {user.role !== "Admin" && (
          <>
            {/* User Statistics */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-gray-900 mb-4">
                User Statistics
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Heart className="mx-auto text-blue-600 mb-1" size={20} />
                  <p className="text-2xl font-bold text-gray-900">
                    {user.wishlist?.length || 0}
                  </p>
                  <p className="text-xs text-gray-600">Wishlist</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <ShoppingBag
                    className="mx-auto text-green-600 mb-1"
                    size={20}
                  />
                  <p className="text-2xl font-bold text-gray-900">
                    {user.cart?.length || 0}
                  </p>
                  <p className="text-xs text-gray-600">Cart Items</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Package className="mx-auto text-purple-600 mb-1" size={20} />
                  <p className="text-2xl font-bold text-gray-900">
                    {user.orders?.length || 0}
                  </p>
                  <p className="text-xs text-gray-600">Orders</p>
                </div>
              </div>
            </div>

          </>
        )}

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 my-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium"
          >
            Close
          </button>
          {user.role !== "Admin" && (
            <button
              onClick={() => {
                onBlockUser(user.id);
              }}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 font-medium text-white ${
                user.status === "Blocked"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {user.status === "Blocked" ? "Unblock User" : "Block User"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDetailsModal;

import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext';
import { ShoppingBag, X, Package, Calendar, CreditCard, MapPin } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

function Orders() {
    const [isViewAll, setViewAll] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);

    const getStatusColor = (status) => {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Processing':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Shipped':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Delivered':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

    const handleOrderClick = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await axiosInstance.get(`/users?id=${currentUser.id}`);
                if (data && data.length > 0) {
                    setOrders(data[0].orders);
                }
            } catch (err) {
                console.error('Error fetching user:', err);
                toast.error('Failed to load user data');
            }
        };
        if (currentUser?.id) fetchUser();
    }, [currentUser?.id]);

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:mx-30 md:my-10 mx-10 my-5">
                <div className="flex items-center gap-2 mb-6 justify-center">
                    <ShoppingBag size={20} className="text-gray-700" />
                    <h2 className="text-xl font-semibold text-gray-900">
                        Recent Orders
                    </h2>
                </div>

                {isViewAll && <>
                    <div className="space-y-4">
                        {orders?.length > 0 ? (
                            [...orders].reverse().map((order) => (
                                <div
                                    key={order.orderId}
                                    onClick={() => handleOrderClick(order)}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                            <ShoppingBag size={18} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">
                                                {order.orderId}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Placed on {new Date(order.date).toISOString().split("T")[0]}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">
                                            ₹{order.totalAmount}
                                        </p>
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                                order.status
                                            )}`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center">
                                No recent orders found
                            </p>
                        )}
                    </div>

                    <button className="w-full mt-6 py-3 text-center text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium "
                        onClick={() => setViewAll(false)}>
                        View Less Orders
                    </button></>}

                {!isViewAll && <>
                    <div className="space-y-4">
                        {orders?.length > 0 ? (
                            [...orders].reverse().slice(0, 5).map((order) => (
                                <div
                                    key={order.orderId}
                                    onClick={() => handleOrderClick(order)}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                            <ShoppingBag size={18} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">
                                                {order.orderId}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Placed on {new Date(order.date).toISOString().split("T")[0]}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">
                                            ₹{order.totalAmount}
                                        </p>
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                                order.status
                                            )}`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center">
                                No recent orders found
                            </p>
                        )}
                    </div>

                    <button className="w-full mt-6 py-3 text-center text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium "
                        onClick={() => setViewAll(true)}>
                        View All Orders
                    </button></>}
            </div>

            {/* Order Details Modal */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <Package className="text-blue-600" size={24} />
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Order Details
                                    </h2>
                                    <p className="text-sm text-gray-600">
                                        {selectedOrder.orderId}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Order Status & Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Calendar size={18} className="text-gray-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Order Date</p>
                                        <p className="font-medium text-gray-900">
                                            {new Date(selectedOrder.date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <CreditCard size={18} className="text-gray-600" />
                                    <div>
                                        <p className="text-sm text-gray-600">Payment</p>
                                        <p className="font-medium text-gray-900">
                                            {selectedOrder.paymentId ? 'Paid Online' : 'Cash on Delivery'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex justify-center">
                                <span
                                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                                        selectedOrder.status
                                    )}`}
                                >
                                    {selectedOrder.status}
                                </span>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Order Items ({selectedOrder.items.length})
                                </h3>
                                <div className="space-y-4">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                                <p className="text-sm text-gray-600">{item.type}</p>
                                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">₹{item.total}</p>
                                                <p className="text-sm text-gray-600">₹{item.price} × {item.quantity}</p>
                                                <p className="text-xs text-gray-500">Includes GST: ₹{item.gst}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="border-t border-gray-200 pt-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="text-gray-900">
                                            ₹{selectedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">GST</span>
                                        <span className="text-gray-900">
                                            ₹{selectedOrder.items.reduce((sum, item) => sum + parseFloat(item.gst), 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                                        <span className="text-gray-900">Total Amount</span>
                                        <span className="text-gray-900">₹{selectedOrder.totalAmount}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Information */}
                            {selectedOrder.paymentId && (
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">Payment Information</h4>
                                    <p className="text-sm text-gray-600">
                                        Payment ID: {selectedOrder.paymentId}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={closeModal}
                                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Orders
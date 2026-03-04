import React, { useState, useEffect } from "react";
import { Search, Filter, Eye, Download } from "lucide-react";
import OrderDetailsModal, { OrderStatusBadge} from '@/features/admin/components/OrderDetailsModal';
import { fetchAdminOrdersApi, updateAdminOrderStatusApi, fetchAdminOrderStatsApi } from '@/features/admin/api/admin.api';

function ManageOrders() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusCounts, setStatusCounts] = useState({
    All: 0, Pending: 0, Confirmed: 0, Processing: 0,
    Shipped: 0, Delivered: 0, Cancelled: 0, Failed: 0, Refunded: 0
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchOrders = async (search = "", status = "All") => {
    try {
      const res = await fetchAdminOrdersApi(search, status);
      const fetchedOrders = res.data?.results || res.data || [];
      setOrders(fetchedOrders);
      setFilteredOrders(fetchedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const res = await fetchAdminOrderStatsApi();
      const statsData = res.data || [];
      
      const counts = {
        All: 0, Pending: 0, Confirmed: 0, Processing: 0,
        Shipped: 0, Delivered: 0, Cancelled: 0, Failed: 0, Refunded: 0
      };

      let total = 0;
      statsData.forEach(item => {
        const itemStatusLower = item.status?.toLowerCase();
        let uiKey = "";
        if (itemStatusLower === "pending") uiKey = "Pending";
        else if (itemStatusLower === "confirmed") uiKey = "Confirmed";
        else if (itemStatusLower === "processing") uiKey = "Processing";
        else if (itemStatusLower === "shipped") uiKey = "Shipped";
        else if (itemStatusLower === "delivered") uiKey = "Delivered";
        else if (itemStatusLower === "cancelled") uiKey = "Cancelled";
        else if (itemStatusLower === "failed") uiKey = "Failed";
        else if (itemStatusLower === "refunded") uiKey = "Refunded";

        if (uiKey) {
          counts[uiKey] = item.count;
          total += item.count;
        }
      });
      counts.All = total;
      setStatusCounts(counts);

    } catch(err) {
      console.error("Error fetching stats:", err);
    }
  }

  useEffect(() => {
    fetchOrders(debouncedSearch, statusFilter);
  }, [debouncedSearch, statusFilter]);

  // Fetch the total independent counts once on load, and potentially whenever a status explicitly updates completely.
  useEffect(() => {
    fetchOrderStats();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      // 1️⃣ Update UI instantly
      const backendStatus = newStatus.toUpperCase();
      const uiStatus = newStatus; // e.g. "Delivered"

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          (order.id === orderId || order.orderId === orderId) ? { ...order, status: backendStatus } : order
        )
      );

      // 2️⃣ Send PATCH request 
      await updateAdminOrderStatusApi(orderId, { new_status: backendStatus });
      fetchOrders();
      fetchOrderStats(); // update the independent stat cards

      console.log("✅ Order status updated successfully!");
    } catch (error) {
      console.error("❌ Error updating order:", error);
      
      // Revert UI update on error by refetching orders
      fetchOrders();
    }
  };



  const exportOrders = () => {
    const csvContent = [
      ["Order ID", "Customer", "Email", "Total Amount", "Status", "Date"],
      ...filteredOrders.map((order) => {
        const addr = order.shipping_address || order.billing_address || {};
        return [
          order.id || order.orderId,
          addr.first_name ? `${addr.first_name} ${addr.last_name || ''}` : "Unknown",
          addr.email || "",
          `₹${order.total_amount || order.totalAmount}`,
          order.status,
          new Date(order.placed_at || order.date).toLocaleDateString(),
        ];
      }),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // statusCounts is now maintained by the independent stats API call

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
          <p className="text-gray-600">View and manage all customer orders</p>
        </div>
        <button
          onClick={exportOrders}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div
            key={status}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              statusFilter === status
                ? "bg-blue-50 border-blue-300 ring-2 ring-blue-200"
                : "bg-white border-gray-200 hover:bg-gray-50"
            }`}
            onClick={() => setStatusFilter(status)}
          >
            <p className="text-sm font-medium text-gray-600 capitalize">
              {status}
            </p>
            <p className="text-2xl font-bold text-gray-900">{count}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search orders by customer name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id || order.orderId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{ (order.id || order.orderId || "").toString().slice(-8) }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.shipping_address?.first_name ? `${order.shipping_address.first_name} ${order.shipping_address.last_name || ''}` : "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.shipping_address?.email || "No Email"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(order.placed_at || order.date || order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ₹{order.total_amount || order.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <OrderStatusBadge status={order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()} />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsModalOpen(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      >
                        <Eye size={16} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          user={selectedOrder.shipping_address || selectedOrder.billing_address || {}}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpdateStatus={(orderId, newStatus) => 
            handleUpdateStatus(selectedOrder.id || selectedOrder.orderId, newStatus)
          }
        />
      )}
    </div>
  );
}

export default ManageOrders;

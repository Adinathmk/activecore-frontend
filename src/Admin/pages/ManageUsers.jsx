import { Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import UserDetailsModal from '../components/UserDetailsModal';


function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Fetch users from backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/users');
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Filtering logic
  useEffect(() => {
    let data = users;

    // Search filter
    if (searchTerm.trim() !== '') {
      const searchKey = searchTerm.toLowerCase().replace(/[^a-z0-9]/g, '');
      data = data.filter(
        (user) =>
          user.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(searchKey) ||
          user.email.toLowerCase().replace(/[^a-z0-9]/g, '').includes(searchKey)
      );
    }

    // Role filter
    if (roleFilter !== 'All Roles') {
      data = data.filter(
        (user) => user.role.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    setFilteredUsers(data);
  }, [searchTerm, users, roleFilter]);

  // ✅ Delete user
  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // ✅ Block / Unblock user
  const handleBlock = async (id) => {
    try {
      // Find the current user
      const user = users.find((u) => u.id === id);
      if (!user) return;

      // Determine new status
      const newStatus = user.status === 'Blocked' ? 'Active' : 'Blocked';

      // Update on backend
      await axiosInstance.patch(`/users/${id}`, { status: newStatus });

      // Update locally
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, status: newStatus } : u
        )
      );
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  // ✅ Open user details modal
  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  // ✅ Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="bg-white min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="font-bold text-2xl lg:text-3xl text-gray-900">
                Manage Users
              </h1>
              <p className="text-gray-600 mt-1">
                View, search, and manage registered users
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-50 rounded-xl p-4 md:p-6 border border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Search Users
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    id="search"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-white"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Role
                </label>
                <select
                  className="w-full px-4 py-3 rounded-lg text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200 bg-white appearance-none"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option>All Roles</option>
                  <option>Admin</option>
                  <option>User</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase">
                      Name
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase">
                      Email
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase">
                      Role
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase">
                      Status
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase">
                      Details
                    </th>
                    <th className="text-center p-4 font-semibold text-gray-700 text-sm uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <Search size={48} className="text-gray-300 mb-3" />
                          <p className="text-lg font-medium">No users found</p>
                          <p className="text-sm">
                            Try adjusting your search or filter criteria
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="p-4 font-medium text-gray-900">{user.name}</td>
                        <td className="p-4 text-gray-700">{user.email}</td>
                        <td className="p-4 text-gray-700">{user.role}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <button 
                            className="text-blue-700 hover:text-blue-900 cursor-pointer transition-colors duration-200 font-medium"
                            onClick={() => handleViewDetails(user)}
                          >
                            View
                          </button>
                        </td>
                        <td className="p-4">
                          {
                          user.role==='Admin'
                          ?  <div className='flex justify-center text-gray-500 font-medium'>
                              <span >Your Account</span>
                            </div>
                          :
                          <div className="flex flex-wrap gap-2 justify-center">
                            <button
                              className={`cursor-pointer px-3 transition-all duration-200 text-sm font-medium 
                                ${
                                  user.status === 'Blocked'
                                    ? 'text-green-700 hover:text-green-900'
                                    : 'text-orange-500 hover:text-orange-900'
                                }`}
                              onClick={() => handleBlock(user.id)}
                            >
                              {user.status === 'Blocked' ? 'Unblock' : 'Block'}
                            </button>
                            <button
                              className="cursor-pointer px-3 transition-all duration-200 text-sm font-medium text-red-500 hover:text-red-600"
                              onClick={() => handleDelete(user.id)}
                            >
                              Delete
                            </button>
                          </div>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {!loading && filteredUsers.length > 0 && (
          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <span>
              Showing {filteredUsers.length} of {users.length} users
            </span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              Total: {users.length}
            </span>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={closeModal}
        onBlockUser={handleBlock}
      />
    </div>
  );
}

export default ManageUsers;
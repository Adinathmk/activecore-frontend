import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Edit, Camera, Check,
  ShoppingBag, HelpCircle, Package, Clock, CheckCircle, XCircle
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'react-toastify';

const UserProfile = () => {

  const { currentUser, updateProfile } = useAuth();
  const [previewImage, setPreviewImage] = useState(null);
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    orders: [],
    address: {
      full_name: "",
      phone_number: "",
      address_line_1: "",
      address_line_2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
    }
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setUserData((prev) => ({
        ...prev,
        first_name: currentUser.first_name || "",
        last_name: currentUser.last_name || "",
        phone_number: currentUser.phone_number || "",
        email: currentUser.email || "",
        address: {
          full_name: currentUser.address?.full_name || "",
          phone_number: currentUser.address?.phone_number || "",
          address_line_1: currentUser.address?.address_line_1 || "",
          address_line_2: currentUser.address?.address_line_2 || "",
          city: currentUser.address?.city || "",
          state: currentUser.address?.state || "",
          postal_code: currentUser.address?.postal_code || "",
          country: currentUser.address?.country || "",
        }
      }));
    }
  }, [currentUser]);

  const handleAddressChange = (field, value) => {
    setUserData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const handleInputChange = (field, value) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleImageChange = (e) => {
      const file = e.target.files[0];

      if (file) {
        setUserData((prev) => ({
          ...prev,
          profile_image_file: file,
        }));

        // 🔥 Create preview
        const previewURL = URL.createObjectURL(file);
        setPreviewImage(previewURL);
      }
  };
const handleSave = async () => {
  try {
    const formData = new FormData();

    formData.append("first_name", userData.first_name);
    formData.append("last_name", userData.last_name);
    formData.append("phone_number", userData.phone_number);
    formData.append("address.full_name", userData.address.full_name);
    formData.append("address.phone_number", userData.address.phone_number);
    formData.append("address.address_line_1", userData.address.address_line_1);
    formData.append("address.address_line_2", userData.address.address_line_2);
    formData.append("address.city", userData.address.city);
    formData.append("address.state", userData.address.state);
    formData.append("address.postal_code", userData.address.postal_code);
    formData.append("address.country", userData.address.country);

    if (userData.profile_image_file) {
      formData.append("profile_image", userData.profile_image_file);
    }

    await updateProfile(formData);

    setIsEditing(false);

    // 🔥 Clear preview after successful save
    setPreviewImage(null);

  } catch (err) {
    console.error(err);
    toast.error("Failed to update profile");
  }
};

  const getOrderStats = () => {
    const orders = userData.orders || [];
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order =>
      order.status === 'Processing' || order.status === 'Pending'
    ).length;
    const deliveredOrders = orders.filter(order =>
      order.status === 'Delivered'
    ).length;
    const cancelledOrders = orders.filter(order =>
      order.status === 'Cancelled'
    ).length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    return {
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalSpent
    };
  };

  const orderStats = getOrderStats();

  const getUserInitials = () => {
    const name = `${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`.trim();
    if (!name) return "U";

    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your account information and order history
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Personal Information
                </h2>
                <button
                  onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  {isEditing ? (
                    <>
                      <Check size={16} />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit size={16} />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-6">

                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                      {previewImage ? (
                        // 🔥 Show preview while editing
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : currentUser?.profile_image ? (
                        // 🔥 Show backend image when not editing
                        <img
                          src={currentUser.profile_image}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        // 🔥 Fallback to initials
                        <div className="w-full h-full flex items-center justify-center text-white font-semibold text-3xl bg-gradient-to-br from-purple-500 to-blue-500">
                          {getUserInitials()}
                        </div>
                      )}
                    </div>
                    {isEditing && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="profileUpload"
                        onChange={handleImageChange}
                      />

                      <label
                        htmlFor="profileUpload"
                        className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                      >
                        <Camera size={16} className="text-gray-600" />
                      </label>
                    </>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {(userData.first_name + " " + userData.last_name).trim() || 'User'}
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={userData.first_name}
                        onChange={(e) =>
                          handleInputChange('first_name', e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <User size={20} className="text-gray-400" />
                        <span className="text-gray-900">
                          {userData.first_name || 'Not provided'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={userData.last_name}
                        onChange={(e) =>
                          handleInputChange('last_name', e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <User size={20} className="text-gray-400" />
                        <span className="text-gray-900">
                          {userData.last_name || 'Not provided'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                      <Mail size={20} className="text-gray-400" />
                      <span className="text-gray-900">
                        {userData.email || 'Not provided'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={userData.phone_number}
                        onChange={(e) =>
                          handleInputChange('phone_number', e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <Phone size={20} className="text-gray-400" />
                        <span className="text-gray-900">
                          {userData.phone_number || 'Not provided'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Address Card */}
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
  <h2 className="text-xl font-semibold text-gray-900 mb-6">
    Address Information
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

    {/* Full Name */}
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Full Name
      </label>
      {isEditing ? (
        <input
          type="text"
          value={userData.address.full_name}
          onChange={(e) =>
            handleAddressChange("full_name", e.target.value)
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      ) : (
        <div className="flex items-center p-3 rounded-xl bg-gray-50 min-h-[48px]">
          <span className="text-gray-900">
            {userData.address.full_name || "Not provided"}
          </span>
        </div>
      )}
    </div>

    {/* Phone */}
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Address Phone
      </label>
      {isEditing ? (
        <input
          type="tel"
          value={userData.address.phone_number}
          onChange={(e) =>
            handleAddressChange("phone_number", e.target.value)
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      ) : (
        <div className="flex items-center p-3 rounded-xl bg-gray-50 min-h-[48px]">
          <span className="text-gray-900">
            {userData.address.phone_number || "Not provided"}
          </span>
        </div>
      )}
    </div>

    {/* Address Line 1 */}
    <div className="space-y-2 md:col-span-2">
      <label className="block text-sm font-medium text-gray-700">
        Address Line 1
      </label>
      {isEditing ? (
        <input
          type="text"
          value={userData.address.address_line_1}
          onChange={(e) =>
            handleAddressChange("address_line_1", e.target.value)
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      ) : (
        <div className="flex items-center p-3 rounded-xl bg-gray-50 min-h-[48px]">
          <span className="text-gray-900">
            {userData.address.address_line_1 || "Not provided"}
          </span>
        </div>
      )}
    </div>

    {/* Address Line 2 */}
    <div className="space-y-2 md:col-span-2">
      <label className="block text-sm font-medium text-gray-700">
        Address Line 2
      </label>
      {isEditing ? (
        <input
          type="text"
          value={userData.address.address_line_2}
          onChange={(e) =>
            handleAddressChange("address_line_2", e.target.value)
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      ) : (
        <div className="flex items-center p-3 rounded-xl bg-gray-50 min-h-[48px]">
          <span className="text-gray-900">
            {userData.address.address_line_2 || "Not provided"}
          </span>
        </div>
      )}
    </div>

    {/* City */}
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        City
      </label>
      {isEditing ? (
        <input
          type="text"
          value={userData.address.city}
          onChange={(e) =>
            handleAddressChange("city", e.target.value)
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      ) : (
        <div className="flex items-center p-3 rounded-xl bg-gray-50 min-h-[48px]">
          <span className="text-gray-900">
            {userData.address.city || "Not provided"}
          </span>
        </div>
      )}
    </div>

    {/* State */}
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        State
      </label>
      {isEditing ? (
        <input
          type="text"
          value={userData.address.state}
          onChange={(e) =>
            handleAddressChange("state", e.target.value)
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      ) : (
        <div className="flex items-center p-3 rounded-xl bg-gray-50 min-h-[48px]">
          <span className="text-gray-900">
            {userData.address.state || "Not provided"}
          </span>
        </div>
      )}
    </div>

    {/* Postal Code */}
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Postal Code
      </label>
      {isEditing ? (
        <input
          type="text"
          value={userData.address.postal_code}
          onChange={(e) =>
            handleAddressChange("postal_code", e.target.value)
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      ) : (
        <div className="flex items-center p-3 rounded-xl bg-gray-50 min-h-[48px]">
          <span className="text-gray-900">
            {userData.address.postal_code || "Not provided"}
          </span>
        </div>
      )}
    </div>

    {/* Country */}
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Country
      </label>
      {isEditing ? (
        <input
          type="text"
          value={userData.address.country}
          onChange={(e) =>
            handleAddressChange("country", e.target.value)
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      ) : (
        <div className="flex items-center p-3 rounded-xl bg-gray-50 min-h-[48px]">
          <span className="text-gray-900">
            {userData.address.country || "Not provided"}
          </span>
        </div>
      )}
    </div>

  </div>
</div>

          </div>

          <div className="space-y-6">

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Account Overview
              </h3>

              <div className="space-y-4">

                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <ShoppingBag size={18} className="text-gray-600" />
                    <span className="text-gray-600">Total Orders</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {orderStats.totalOrders}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-yellow-600" />
                    <span className="text-gray-600">Pending Orders</span>
                  </div>
                  <span className="font-semibold text-yellow-600">
                    {orderStats.pendingOrders}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-green-600" />
                    <span className="text-gray-600">Delivered Orders</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    {orderStats.deliveredOrders}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <XCircle size={18} className="text-red-600" />
                    <span className="text-gray-600">Cancelled Orders</span>
                  </div>
                  <span className="font-semibold text-red-600">
                    {orderStats.cancelledOrders}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Package size={18} className="text-blue-600" />
                    <span className="text-gray-600">Total Spent</span>
                  </div>
                  <span className="font-semibold text-blue-600">
                    ₹{orderStats.totalSpent.toLocaleString()}
                  </span>
                </div>

              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle size={20} className="text-blue-600" />
                <h3 className="font-semibold text-gray-900">Need Help?</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Our support team is here to help you with any questions.
              </p>
              <button className="w-full bg-white text-gray-900 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 border border-blue-200 shadow-sm">
                Contact Support
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
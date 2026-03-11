import React, { useState, useEffect } from "react";
import { Send, Users, User, Search, Bell, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { fetchAdminUsersApi } from "@/features/admin/api/admin.api";
import { sendGlobalNotificationRequest, sendUserNotificationRequest } from "@/features/notifications/api/notification.api";

const ManageNotifications = () => {
    const [globalMessage, setGlobalMessage] = useState("");
    const [targetedMessage, setTargetedMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [sendingGlobal, setSendingGlobal] = useState(false);
    const [sendingTargeted, setSendingTargeted] = useState(false);

    // Fetch users for targeting
    const fetchUsers = async (search = "") => {
        try {
            setLoadingUsers(true);
            const { data } = await fetchAdminUsersApi(search);
            setUsers(data?.results || data);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load users");
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchUsers(searchTerm);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleSendGlobal = async (e) => {
        e.preventDefault();
        if (!globalMessage.trim()) return toast.error("Please enter a message");

        try {
            setSendingGlobal(true);
            await sendGlobalNotificationRequest(globalMessage);
            toast.success("Broadcast sent to all users!");
            setGlobalMessage("");
        } catch (error) {
            toast.error("Failed to send broadcast");
        } finally {
            setSendingGlobal(false);
        }
    };

    const handleSendTargeted = async (e) => {
        e.preventDefault();
        if (!selectedUser) return toast.error("Please select a user");
        if (!targetedMessage.trim()) return toast.error("Please enter a message");

        try {
            setSendingTargeted(true);
            await sendUserNotificationRequest(selectedUser.id, targetedMessage);
            toast.success(`Notification sent to ${selectedUser.first_name || selectedUser.email}`);
            setTargetedMessage("");
            setSelectedUser(null);
            setSearchTerm("");
        } catch (error) {
            toast.error("Failed to send targeted notification");
        } finally {
            setSendingTargeted(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Manage Notifications</h1>
                    <p className="text-gray-600 mt-1">Broadcast announcements or message individual users.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Global Broadcast Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-50 bg-gradient-to-r from-purple-50 to-blue-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-600 rounded-lg">
                                    <Users className="text-white w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg text-gray-900">Global Broadcast</h2>
                                    <p className="text-xs text-purple-700 font-medium uppercase tracking-wider">Sends to every registered user</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <form onSubmit={handleSendGlobal} className="flex-1 flex flex-col">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Message Payload</label>
                                <textarea
                                    value={globalMessage}
                                    onChange={(e) => setGlobalMessage(e.target.value)}
                                    placeholder="Enter your announcement here..."
                                    className="flex-1 w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all min-h-[150px] text-gray-800 placeholder-gray-400"
                                />
                                <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-100 flex gap-3 text-orange-800 text-sm">
                                    <Info className="w-5 h-5 flex-shrink-0" />
                                    <p>Caution: This will trigger a real-time push notification for all active users immediately.</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={sendingGlobal || !globalMessage.trim()}
                                    className="mt-6 w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-200 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                                >
                                    {sendingGlobal ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <><Send className="w-4 h-4" /> Dispatch Broadcast</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Targeted Messaging Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-50 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg">
                                    <User className="text-white w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg text-gray-900">Targeted Notification</h2>
                                    <p className="text-xs text-blue-700 font-medium uppercase tracking-wider">Send to a specific individual</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            {/* User Search & Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Target User</label>
                                {!selectedUser ? (
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Search by name or email..."
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                        {searchTerm && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-20 max-h-[200px] overflow-y-auto overflow-x-hidden">
                                                {loadingUsers ? (
                                                    <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                                                ) : users.length === 0 ? (
                                                    <div className="p-4 text-center text-sm text-gray-500">No users found</div>
                                                ) : (
                                                    users.map(u => (
                                                        <button
                                                            key={u.id}
                                                            onClick={() => {
                                                                setSelectedUser(u);
                                                                setSearchTerm("");
                                                            }}
                                                            className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3 border-b border-gray-50 last:border-0"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                                                                {u.first_name?.[0] || u.email[0]}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-semibold text-gray-900 truncate">{u.first_name} {u.last_name}</p>
                                                                <p className="text-xs text-gray-500 truncate">{u.email}</p>
                                                            </div>
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                <User className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-blue-900">{selectedUser.first_name} {selectedUser.last_name}</p>
                                                <p className="text-xs text-blue-700">{selectedUser.email}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedUser(null)}
                                            className="text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-1"
                                        >
                                            Change
                                        </button>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSendTargeted} className="flex-1 flex flex-col">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                                <textarea
                                    value={targetedMessage}
                                    onChange={(e) => setTargetedMessage(e.target.value)}
                                    placeholder="Enter your private message..."
                                    disabled={!selectedUser}
                                    className="flex-1 w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[150px] text-gray-800 placeholder-gray-400 disabled:bg-gray-50"
                                />
                                <button
                                    type="submit"
                                    disabled={sendingTargeted || !targetedMessage.trim() || !selectedUser}
                                    className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
                                >
                                    {sendingTargeted ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        <><Bell className="w-4 h-4" /> Send Notification</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageNotifications;

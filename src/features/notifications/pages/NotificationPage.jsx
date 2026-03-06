import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchNotifications
} from "../notificationSlice";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck, Info } from "lucide-react";
// Remove missing shadcn imports

const NotificationPage = () => {
  const dispatch = useDispatch();
  const { list, loading, unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl min-h-[70vh]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">Manage your alerts and updates</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading && list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
            <div className="p-4 bg-white rounded-full mb-4 shadow-sm">
              <Info className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">No notifications yet</h3>
            <p className="text-gray-500">We'll notify you when something important happens.</p>
          </div>
        ) : (
          list.map((notification) => (
            <div 
              key={notification.id} 
              className="transition-all duration-200 border-l-4 rounded-xl overflow-hidden bg-white border border-gray-100 border-l-purple-600 shadow-sm"
            >
              <div className="p-4 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-purple-50">
                  <Bell className="w-5 h-5 text-purple-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400 ml-auto">
                      {notification.created_at ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true }) : "Just now"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 font-medium">
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPage;

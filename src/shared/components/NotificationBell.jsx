import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Bell, ExternalLink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
// Removed unnecessary clearNotifications import

export default function NotificationBell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { list, unreadCount } = useSelector((state) => state.notifications);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    // If mobile view (less than sm breakpoint which is 640px in Tailwind), navigate directly
    if (window.innerWidth < 640) {
      setIsOpen(false); // Ensure it's closed
      navigate('/notifications');
      return;
    }

    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Just opening might not mark them as read depending on UX choice.
      // We'll let them click a button to mark all as read inside or do it automatically.
      // Let's keep the button like the user example requested.
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="cursor-pointer text-gray-600 hover:text-purple-600 transition-all duration-300 p-2 hover:bg-purple-50 rounded-lg relative group"
      >
        <Bell size={22} className="group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-orange-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg shadow-red-500/40 ring-2 ring-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute -right-4 sm:right-0 top-full mt-2 hidden sm:block w-[calc(100vw-32px)] sm:w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 animate-in slide-in-from-top-2 duration-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>

          <div className="max-h-80 overflow-y-auto w-full">
            {list.length === 0 ? (
              <div className="py-8 text-center text-gray-500 flex flex-col items-center justify-center">
                <Bell size={32} className="text-gray-300 mb-2" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {list.map((n, index) => (
                  <li
                    key={index}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-sm text-gray-800 font-medium">{n.message || n.title || "Notification"}</p>
                    {n.description && <p className="text-xs text-gray-500 mt-1">{n.description}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <Link 
              to="/notifications" 
              onClick={() => setIsOpen(false)}
              className="text-xs text-purple-600 hover:text-purple-700 font-semibold flex items-center justify-center py-1 group transition-all"
            >
              View all notifications
              <ExternalLink size={12} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

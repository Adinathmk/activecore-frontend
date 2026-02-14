import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function SideBar() {
  const {pathname}=useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const navigate=useNavigate()
  const{logoutUser}=useAuth()

   useEffect(() => {
    const matchedItem = menuItems.find((item) => pathname.includes(item.url));
    setActiveItem(matchedItem ? matchedItem.id : "");
  }, [pathname]);
  

  // Check screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
  if (isMobile && !isCollapsed) {
    document.body.style.overflow = "hidden"; 
  } else {
    document.body.style.overflow = "auto"; 
  }
  return () => {
    document.body.style.overflow = "auto";
  };
}, [isMobile, isCollapsed]);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard ,url:'/dashboard'},
    { id: "products", label: "Products", icon: Package ,url:'/manageProducts'},
    { id: "orders", label: "Orders", icon: ShoppingCart ,url:'/manageOrders'},
    { id: "customers", label: "Customers", icon: Users ,url:'/manageUsers'},
  ];

  return (
    <>
    {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 backdrop-blur-sm  z-10 transition-opacity"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    <div
      className={`
        sticky top-0 h-screen flex flex-col
        bg-white border-r border-gray-200
        transition-all duration-300 ease-in-out
        ${isCollapsed ? "w-16" : "w-64"}
        z-50
      `}
    >
      
      {/* Header */}
      <div className="flex py-6 items-center justify-between px-4  border-b border-gray-100">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">            
             <img src="/fav_icon1.png" className="w-7 h-6 "></img>
              <h1 className="font-bold text-xl text-gray-800">ActiveCore</h1>
            
          </div>
         
        )}
        <button
          onClick={toggleCollapse}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
        >
          {isCollapsed ? (
            <ChevronRight size={20} className="text-gray-600" />
          ) : (
            <ChevronLeft size={20} className="text-gray-600" />
          )}
        </button>
      </div>

      {/* Scrollable Menu Section */}
      <div
        className={`flex-1 overflow-y-none scrollbar-none ${
          isCollapsed ? "p-1" : "p-4"
        } space-y-1`}
      >
        {menuItems.map((item) => {
          const Icon = item.icon; 
          return (
            <button
              key={item.id}
              className={`
                w-full flex items-center rounded-xl px-3 py-3
                transition-all duration-200 group relative
                ${
                  activeItem === item.id
                    ? "bg-gradient-to-r from-blue-50 to-blue-25 border border-blue-100 text-blue-600 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
                }
                ${isCollapsed ? "justify-center" : "justify-start"}
              `}
              onClick={() => {setActiveItem(item.id);navigate(item.url)}}
            >
              <Icon
                size={20}
                className={`${
                  activeItem === item.id
                    ? "text-blue-600"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              />
              {!isCollapsed && (
                <span className="ml-3 font-medium text-sm">{item.label}</span>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Logout Section */}
      <div
        className={`mt-auto border-t border-gray-100 ${
          isCollapsed ? "px-0" : "px-4"
        }`}
      >
        <button
          className={`
            flex items-center w-full rounded-xl px-3 py-3
            text-gray-600 hover:bg-gray-50 hover:text-gray-900
            transition-all duration-200 group cursor-pointer
            ${isCollapsed ? "justify-center" : "justify-start"}
          `}
          onClick={logoutUser}
        >
          <LogOut
            size={20}
            className="text-gray-400 group-hover:text-red-600"
          />
          {!isCollapsed && (
            <span className="ml-3 font-medium text-sm group-hover:text-red-600">
              Logout
            </span>
          )}
          
        </button>
      </div>
    </div>
    </>
    
  );
}

export default SideBar;

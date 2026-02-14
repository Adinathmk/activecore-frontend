import React from "react";
import SideBar from "../components/SideBar";
import { Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Sticky Sidebar */}
      <aside className="flex-shrink-0">
        <SideBar />
      </aside>

      {/* Scrollable Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;

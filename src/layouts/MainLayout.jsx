// src/layouts/MainLayout.jsx
import { Navigate, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import PremiumFooter from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";

export default function MainLayout() {
  const { currentUser } = useAuth();
  if(currentUser?.role==='Admin'){
    return <Navigate to="/dashboard" replace />
  }
  return (
    <>
        <Navbar />
        <Outlet />
        <PremiumFooter/>
    </>
  );
}

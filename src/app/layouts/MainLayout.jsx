// src/layouts/MainLayout.jsx
import { Navigate, Outlet } from "react-router-dom";
import Navbar from '@/shared/components/Navbar';
import PremiumFooter from '@/shared/components/Footer';
import { useAuth } from '@/features/auth/hooks/AuthContext';

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

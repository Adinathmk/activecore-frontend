import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Navigate, Outlet } from 'react-router-dom'

function ProtectLogin() {
  const { currentUser } = useAuth();
  
  if (currentUser) {
    if (currentUser.role === 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
}

export default ProtectLogin
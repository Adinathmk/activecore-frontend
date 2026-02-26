import React from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Navigate, Outlet } from 'react-router-dom'

function ProtectAdmin() {
    const{currentUser}=useAuth()
    if(currentUser?.role!=='Admin'){
        return <Navigate to='/'/>
    }
    return <Outlet/>
}

export default ProtectAdmin
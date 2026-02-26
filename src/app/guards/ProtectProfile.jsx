import React from 'react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Navigate, Outlet } from 'react-router-dom'

function ProtectProfile() {
    const{currentUser}=useAuth()
    if(!currentUser){
        return <Navigate to='/'/>
    }
    return <Outlet/>
}

export default ProtectProfile
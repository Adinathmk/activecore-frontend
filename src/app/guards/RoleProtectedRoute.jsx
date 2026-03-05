import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import GymLoader from "@/shared/components/GymLoader";

function RoleProtectedRoute({ allowedRoles }) {
  const { user, loadingUser } = useSelector((state) => state.auth);

  if (loadingUser) {
    return <GymLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role?.toLowerCase())) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}

export default RoleProtectedRoute;
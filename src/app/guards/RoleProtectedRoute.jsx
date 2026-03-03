import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

function RoleProtectedRoute({ allowedRoles }) {
  const { user, loadingUser } = useSelector((state) => state.auth);

  if (loadingUser) {
    return <div>Loading...</div>;
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
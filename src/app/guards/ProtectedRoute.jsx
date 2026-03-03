import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const { user, loadingUser } = useSelector((state) => state.auth);

  if (loadingUser) {
    return <div>Loading...</div>; // or spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
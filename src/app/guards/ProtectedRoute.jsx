import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import GymLoader from "@/shared/components/GymLoader";

function ProtectedRoute() {
  const { user, loadingUser } = useSelector((state) => state.auth);

  if (loadingUser) {
    return <GymLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import GymLoader from "@/shared/components/GymLoader";

function PublicOnlyRoute() {
  const { user, loadingUser } = useSelector((state) => state.auth);

  if (loadingUser) {
    return <GymLoader />;
  }

  if (user) {
    const role = user.role?.toLowerCase();

    if (role === "admin") {
      return <Navigate to="/dashboard" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default PublicOnlyRoute;
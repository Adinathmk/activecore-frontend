import { Navigate, Outlet } from "react-router-dom";

function PublicOnlyRoute() {
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

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
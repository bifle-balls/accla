// frontend/routes/PrivateRoute.tsx
import { Navigate, Outlet } from "react-router-dom";

interface PrivateRouteProps {
  allowedRoles: string[];
}

function PrivateRoute({ allowedRoles }: PrivateRouteProps) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || !role) {
    // not logged in
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // logged in but wrong role (e.g., registrar trying to open admin page)
    return <Navigate to="/" replace />;
  }

  // authorized
  return <Outlet />;
}

export default PrivateRoute;

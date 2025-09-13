import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: JSX.Element;
  role: string;
}

function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const storedRole = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  // if no token or wrong role → kick user to login
  if (!token || storedRole !== role) {
    return <Navigate to="/login" replace />;
  }

  // otherwise render the dashboard
  return children;
}

export default ProtectedRoute;

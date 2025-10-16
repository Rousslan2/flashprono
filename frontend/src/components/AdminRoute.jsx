import { Navigate } from "react-router-dom";
import { isAuthenticated, getUser } from "../hooks/useAuth";

export default function AdminRoute({ children }) {
  const authed = isAuthenticated();
  const user = getUser();

  if (!authed || !user?.isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
}

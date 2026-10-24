import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "../utils/auth";

// Reads the user saved at login (see utils/auth.js).
function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}

// Sends visitors without a login to /login. Pass role="student" to limit a section to one role.
export default function ProtectedRoute({ role }) {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  const user = getSavedUser();
  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

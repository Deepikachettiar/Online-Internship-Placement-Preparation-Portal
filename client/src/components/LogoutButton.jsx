import { useNavigate } from "react-router-dom";
import useAuth from "../context/useAuth";

export default function LogoutButton({ onLogout }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();

    if (onLogout) {
      onLogout();
    }

    navigate("/login", { replace: true });
  }

  return (
    <button type="button" onClick={handleLogout}>
      Logout
    </button>
  );
}
import { useNavigate } from "react-router-dom";
import { clearSession } from "../utils/auth";

export default function LogoutButton({ onLogout }) {
  const navigate = useNavigate();

  function handleLogout() {
    clearSession();
    if (onLogout) onLogout();
    navigate("/login");
  }

  return (
    <button type="button" onClick={handleLogout}>
      Logout
    </button>
  );
}

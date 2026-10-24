import { useState } from "react";
import AuthContext from "./authContext";
import { clearSession, getToken, saveSession } from "../utils/auth";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken());

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  function login(newToken, newUser) {
    saveSession(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    clearSession();
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
import { createContext, useContext, useState } from "react";
import client from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vv_user")); } catch { return null; }
  });

  function login(token, userData) {
    localStorage.setItem("vv_token", token);
    localStorage.setItem("vv_user", JSON.stringify(userData));
    client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("vv_token");
    localStorage.removeItem("vv_user");
    delete client.defaults.headers.common["Authorization"];
    setUser(null);
  }

  // Restore token on mount
  const token = localStorage.getItem("vv_token");
  if (token && !client.defaults.headers.common["Authorization"]) {
    client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

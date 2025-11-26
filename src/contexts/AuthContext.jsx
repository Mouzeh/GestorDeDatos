import React, { createContext, useState, useContext, useEffect } from "react";
import { authService } from "../services/supabase/auth";

const AuthContext = createContext();

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const [requiresMFA, setRequiresMFA] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

  // ===============================================================
  // 🔄 Cargar sesión activa
  // ===============================================================
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (!token) {
        setLoading(false);
        return;
      }

      const userData = await authService.getCurrentUser();
      setUser(userData);

    } catch (error) {
      console.error("❌ Error checking auth:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // ===============================================================
  // 🔐 LOGIN
  // ===============================================================
  const login = async (email, password) => {
    setLoading(true);

    try {
      const result = await authService.login(email, password);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // ======================================
      // 🔥 SI TIENE MFA (BACKEND ya envió el correo)
      // ======================================
      if (result.requiresMFA) {
        setRequiresMFA(true);
        setPendingEmail(result.email);
        return { success: true, requiresMFA: true };
      }

      // 🔓 Login normal sin MFA
      setUser(result.user);

      if (result.token) {
        localStorage.setItem("token", result.token);
        setToken(result.token);
      }

      return { success: true, requiresMFA: false };

    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // ===============================================================
  // 🔐 VERIFICAR MFA (email OTP)
  // ===============================================================
  const verifyEmailOTP = async (code) => {
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/mfa/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: pendingEmail,
          code
        })
      });

      const json = await res.json();

      if (!json.success)
        return { success: false, error: json.error };

      // 🔓 MFA OK → cargar usuario real
      const userData = await authService.getCurrentUser();
      setUser(userData);

      // Recuperar token real
      const session = await authService.checkSession();
      const sessionToken = session?.data?.session?.access_token;

      if (sessionToken) {
        localStorage.setItem("token", sessionToken);
        setToken(sessionToken);
      } else {
        console.warn("⚠ No se pudo obtener token luego del MFA");
      }

      // Limpiar estado MFA
      setRequiresMFA(false);
      setPendingEmail("");

      return { success: true };

    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // ===============================================================
  // 🚪 LOGOUT
  // ===============================================================
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
      setRequiresMFA(false);
      setPendingEmail("");
    }
  };

  const value = {
    user,
    token,
    login,
    verifyEmailOTP,
    logout,
    loading,
    requiresMFA
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

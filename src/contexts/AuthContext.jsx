// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { authService } from "../services/supabase/auth";
import { supabase } from "../config/supabase";

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
  // ✔ Función interna: cargar usuario + rol real desde BD
  // ===============================================================
  const loadUserWithRole = useCallback(async (authUser) => {
    if (!authUser) return null;

    try {
      const { data: perfil, error } = await supabase
        .from("usuarios")
        .select(
          `
          id,
          email,
          nombre,
          rol_id,
          roles (
            nombre_rol
          )
        `
        )
        .eq("id", authUser.id)
        .single();

      if (error) {
        console.warn("⚠ No se pudo cargar rol:", error.message);
        return { ...authUser, rol: null };
      }

      return {
        ...authUser,
        nombre: perfil.nombre,
        rol: perfil.roles?.nombre_rol || null,
      };
    } catch (e) {
      console.error("❌ Error cargando rol:", e);
      return { ...authUser, rol: null };
    }
  }, []);

  // ===============================================================
  // 🔄 CHECK AUTH — Optimizado para evitar el warning
  // ===============================================================
  const checkAuth = useCallback(async () => {
    try {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const authUser = await authService.getCurrentUser();

      if (!authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const fullUser = await loadUserWithRole(authUser);
      setUser(fullUser);

    } catch (error) {
      console.error("❌ Error en checkAuth:", error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, loadUserWithRole]);

  // Ejecutar al iniciar
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ===============================================================
  // 🔐 LOGIN
  // ===============================================================
  const login = async (email, password) => {
    setLoading(true);

    try {
      const result = await authService.login(email, password);

      if (!result.success) return result;

      // 🔥 Requiere MFA
      if (result.requiresMFA) {
        setRequiresMFA(true);
        setPendingEmail(result.email);
        return { success: true, requiresMFA: true };
      }

      // 🔓 Login normal
      const fullUser = await loadUserWithRole(result.user);
      setUser(fullUser);

      if (result.token) {
        localStorage.setItem("token", result.token);
        setToken(result.token);
      }

      return { success: true, requiresMFA: false };

    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ===============================================================
  // 🔐 VERIFICAR MFA OTP
  // ===============================================================
  const verifyEmailOTP = async (code) => {
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/mfa/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, code }),
      });

      const json = await res.json();

      if (!json.success) {
        return { success: false, error: json.error };
      }

      // 🔓 MFA OK → obtener sesión real
      const authUser = await authService.getCurrentUser();
      const fullUser = await loadUserWithRole(authUser);

      setUser(fullUser);

      const session = await authService.checkSession();
      const sessionToken = session?.data?.session?.access_token;

      if (sessionToken) {
        localStorage.setItem("token", sessionToken);
        setToken(sessionToken);
      }

      // limpiar estados MFA
      setRequiresMFA(false);
      setPendingEmail("");

      return { success: true };

    } catch (err) {
      return { success: false, error: err.message };
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
    requiresMFA,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

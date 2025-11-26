import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/supabase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // ==========================================================
  //  🔄 Cargar usuario si hay token guardado
  // ==========================================================
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
      console.error('Error checking auth:', error);
      logout(); // limpiar token inválido
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  //  🔐 LOGIN con token correcto
  // ==========================================================
  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await authService.login(email, password);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // ✔ GUARDAR TOKEN REAL
      localStorage.setItem("token", result.token);
      setToken(result.token);

      // ✔ GUARDAR USER
      setUser(result.user);

      return {
        success: true,
        requiresMFA: result.requiresMFA,
      };

    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  //  🔐 MFA
  // ==========================================================
  const verifyMFA = async (code) => {
    setLoading(true);
    try {
      const result = await authService.verifyMFA(code);
      if (result.success) {
        setUser(result.user);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  //  🚪 LOGOUT
  // ==========================================================
  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
  };

  const value = {
    user,
    token,
    login,
    verifyMFA,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// src/components/auth/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, requiresMFA, token } = useAuth();

  // ===========================================================
  // ⏳ Loading global
  // ===========================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // ===========================================================
  // ❌ No existe sesión → redirigir a login
  // ===========================================================
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // ===========================================================
  // 🔐 MFA pendiente → redirigir a formulario MFA
  // ===========================================================
  if (requiresMFA) {
    return <Navigate to="/mfa" replace />;
  }

  // ===========================================================
  // ⏳ Rol aún no cargado
  // ===========================================================
  if (!user.rol) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-green-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando permisos...</p>
        </div>
      </div>
    );
  }

  // ===========================================================
  // ❌ El rol NO está permitido
  // ===========================================================
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">
            Tu rol <strong>{user.rol}</strong> no tiene permisos para esta sección.
          </p>
        </div>
      </div>
    );
  }

  // ===========================================================
  // ✔ Todo OK → cargar componente
  // ===========================================================
  return children;
};

export default ProtectedRoute;

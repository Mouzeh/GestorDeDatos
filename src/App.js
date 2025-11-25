import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import CertificateManager from './components/certificados/CertificateManager';
import Reports from './components/reportes/Reports';
import UserManager from './components/usuarios/UserManager';

// 👉 IMPORT para probar la conexión con Supabase
import { testSupabaseConnection } from './utils/testSupabase';

import './index.css';

function App() {

  // Ejecutar prueba de conexión al iniciar la app
  useEffect(() => {
    testSupabaseConnection();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">

          <Routes>

            {/* Login público */}
            <Route path="/login" element={<Login />} />

            {/* Dashboard */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Certificados */}
            <Route
              path="/certificados"
              element={
                <ProtectedRoute allowedRoles={['admin', 'corredor']}>
                  <CertificateManager />
                </ProtectedRoute>
              }
            />

            {/* Reportes */}
            <Route
              path="/reportes"
              element={
                <ProtectedRoute allowedRoles={['admin', 'auditor']}>
                  <Reports />
                </ProtectedRoute>
              }
            />

            {/* Usuarios (solo rol admin) */}
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManager />
                </ProtectedRoute>
              }
            />

          </Routes>

        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

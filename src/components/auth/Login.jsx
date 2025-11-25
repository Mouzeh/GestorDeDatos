import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Key, AlertCircle, CheckCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [success, setSuccess] = useState('');

  const { login, verifyMFA } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await login(email, password);
    
    if (result.success) {
      if (result.requiresMFA) {
        setMfaRequired(true);
        setSuccess('Credenciales válidas. Verifica tu identidad con MFA.');
      } else {
        setSuccess('Inicio de sesión exitoso. Redirigiendo...');
        setTimeout(() => navigate('/'), 1000);
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleMFAVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await verifyMFA(mfaCode);
    
    if (result.success) {
      setSuccess('Verificación MFA exitosa. Redirigiendo...');
      setTimeout(() => navigate('/'), 1000);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  if (mfaRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 animate-fade-in-up">
          <div className="card bg-gradient-to-br from-white to-gray-50 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Key className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verificación en Dos Pasos
            </h2>
            <p className="text-gray-600 mb-6">
              Ingresa el código de 6 dígitos de tu aplicación de autenticación
            </p>
            
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 animate-fade-in-up">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-800 text-sm font-medium">{success}</p>
                </div>
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleMFAVerify}>
              <div className="relative">
                <Key className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="input-field pl-12 text-center text-xl font-mono tracking-widest"
                  maxLength={6}
                  required
                />
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in-up">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800 text-sm font-medium">{error}</p>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading || mfaCode.length !== 6}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Verificar Identidad</span>
                  </>
                )}
              </button>
            </form>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500">
              ¿Problemas con MFA?{' '}
              <button className="text-red-600 hover:text-red-700 font-medium">
                Contactar soporte
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in-up">
        {/* Tarjeta de login */}
        <div className="card bg-gradient-to-br from-white to-gray-50">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Gestor Tributario
            </h2>
            <p className="text-gray-600 mb-2">Sistema de Certificados</p>
            <div className="bg-red-50 border border-red-200 rounded-full px-4 py-1 inline-block mb-8">
              <span className="text-red-700 text-sm font-semibold">INACAP Valdivia</span>
            </div>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 animate-fade-in-up">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800 text-sm font-medium">{success}</p>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12"
                  placeholder="usuario@inacap.cl"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in-up">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Ingresar al Sistema</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Información adicional */}
        <div className="text-center space-y-3">
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="card-hover p-3">
              <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600">🔒</span>
              </div>
              <p className="text-gray-600 font-medium">Seguro</p>
            </div>
            <div className="card-hover p-3">
              <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600">⚡</span>
              </div>
              <p className="text-gray-600 font-medium">Rápido</p>
            </div>
            <div className="card-hover p-3">
              <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600">📊</span>
              </div>
              <p className="text-gray-600 font-medium">Confiable</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            Sistema certificado © 2024 INACAP Valdivia
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
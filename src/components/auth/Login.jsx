import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, Key } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");

  const [mfaRequired, setMfaRequired] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { login, verifyEmailOTP } = useAuth();
  const navigate = useNavigate();

  // ============================================================
  // 🔐 LOGIN NORMAL → SI TIENE MFA, ESPERAMOS EL OTP ENVIADO
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const result = await login(email, password);

    if (result.success) {
      if (result.requiresMFA) {
        setMfaRequired(true);
        setSuccess("El código fue enviado a tu correo.");
      } else {
        setSuccess("Inicio de sesión exitoso. Redirigiendo...");
        setTimeout(() => navigate("/"), 1000);
      }
    } else {
      setError(result.error || "Error al iniciar sesión");
    }

    setLoading(false);
  };

  // ============================================================
  // 🔐 VALIDAR MFA — usa verifyEmailOTP DEL CONTEXT
  // ============================================================
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await verifyEmailOTP(mfaCode);

    if (res.success) {
      setSuccess("Código verificado. Redirigiendo...");
      setTimeout(() => navigate("/"), 900);
    } else {
      setError(res.error || "Código incorrecto");
    }

    setLoading(false);
  };

  // ============================================================
  // 🟩 PANTALLA MFA
  // ============================================================
  if (mfaRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-md w-full space-y-8 card">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Key className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Verificación MFA</h2>
            <p className="text-gray-600 mt-2">Ingresa el código enviado a tu correo</p>
          </div>

          {success && (
            <div className="bg-green-50 border border-green-200 px-4 py-3 rounded-xl">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <input
              type="text"
              value={mfaCode}
              onChange={(e) =>
                setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="input-field text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
            />

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading || mfaCode.length !== 6}
            >
              {loading ? "Verificando..." : "Validar código"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ============================================================
  // 🟥 PANTALLA NORMAL DE LOGIN
  // ============================================================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-md w-full space-y-8 card">

        <div className="text-center">
          <div className="w-20 h-20 bg-red-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Gestor Tributario</h2>
          <p className="text-gray-600">Sistema de Certificados</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 px-4 py-3 rounded-xl">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field pl-12"
              placeholder="usuario@correo.cl"
            />
          </div>

          <div className="relative">
            <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pl-12"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Verificando..." : "Ingresar"}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;

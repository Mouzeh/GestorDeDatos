// src/components/auth/MFASetup.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { mfaService } from '../../services/supabase/mfa';
import { Shield, CheckCircle, AlertCircle, Copy, Download, Key } from 'lucide-react';

const MFASetup = ({ onComplete, onCancel }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (step === 1) {
      initializeMFA();
    }
  }, []);

  const initializeMFA = async () => {
    setLoading(true);
    try {
      const result = await mfaService.setupMFA(user.id, user.email);
      
      if (result.success) {
        setQrCode(result.qrCode);
        setSecret(result.secret);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await mfaService.enableMFA(user.id, verificationCode);
      
      if (result.success) {
        setSuccess('¡MFA configurado correctamente!');
        
        // Generar códigos de respaldo
        const codesResult = await mfaService.generateRecoveryCodes(user.id);
        if (codesResult.success) {
          setRecoveryCodes(codesResult.codes);
          setStep(3);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setSuccess('Secreto copiado al portapapeles');
    setTimeout(() => setSuccess(''), 2000);
  };

  const downloadRecoveryCodes = () => {
    const text = recoveryCodes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inacap-recovery-codes.txt';
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card max-w-lg w-full animate-fade-in-up">
        
        {/* PASO 1: Escanear QR */}
        {step === 1 && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Configurar Autenticación en Dos Pasos
              </h2>
              <p className="text-gray-600">
                Paso 1: Escanea el código QR con tu app de autenticación
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <>
                {qrCode && (
                  <div className="mb-6">
                    <div className="bg-white p-4 rounded-2xl border-2 border-gray-200 inline-block mx-auto">
                      <img src={qrCode} alt="QR Code" className="w-64 h-64 mx-auto" />
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-2">
                    O ingresa este código manualmente:
                  </p>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 bg-white px-4 py-2 rounded-lg font-mono text-sm border border-gray-300">
                      {secret}
                    </code>
                    <button
                      onClick={copySecret}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
                      title="Copiar código"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    📱 Apps recomendadas: Google Authenticator, Microsoft Authenticator, Authy
                  </p>
                </div>

                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-green-800 text-sm">{success}</p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={onCancel}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="btn-primary flex-1"
                  >
                    Continuar
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* PASO 2: Verificar código */}
        {step === 2 && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Key className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verificar Configuración
              </h2>
              <p className="text-gray-600">
                Paso 2: Ingresa el código de 6 dígitos de tu app
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de verificación
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="input-field text-center text-2xl font-mono tracking-widest"
                maxLength={6}
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                className="btn-secondary flex-1"
              >
                Atrás
              </button>
              <button
                onClick={handleVerifyCode}
                disabled={loading || verificationCode.length !== 6}
                className="btn-primary flex-1"
              >
                {loading ? 'Verificando...' : 'Verificar'}
              </button>
            </div>
          </>
        )}

        {/* PASO 3: Códigos de respaldo */}
        {step === 3 && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Códigos de Respaldo
              </h2>
              <p className="text-gray-600">
                Guarda estos códigos en un lugar seguro
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-yellow-800 font-medium mb-2">
                ⚠️ Importante:
              </p>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>Cada código solo puede usarse una vez</li>
                <li>Guárdalos en un lugar seguro (no digital)</li>
                <li>Úsalos si pierdes acceso a tu app de autenticación</li>
              </ul>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-3">
                {recoveryCodes.map((code, index) => (
                  <code key={index} className="bg-gray-50 px-3 py-2 rounded-lg font-mono text-sm text-center">
                    {code}
                  </code>
                ))}
              </div>
            </div>

            <button
              onClick={downloadRecoveryCodes}
              className="btn-secondary w-full mb-4 flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Códigos</span>
            </button>

            <button
              onClick={onComplete}
              className="btn-primary w-full"
            >
              Finalizar Configuración
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default MFASetup;
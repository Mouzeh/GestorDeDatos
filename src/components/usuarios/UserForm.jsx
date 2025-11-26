// src/components/usuarios/UserForm.jsx
import React, { useState } from 'react';
import { Shield, Mail, User, Lock, XCircle, Eye, EyeOff } from 'lucide-react';

const UserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    rol: user?.rol || 'corredor',
    estado: user?.estado || 'activo',
    mfaHabilitado: user?.mfaHabilitado || false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar contraseña SOLO para usuarios nuevos
    if (!user) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 8) {
        newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'Debe contener al menos una mayúscula';
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = 'Debe contener al menos un número';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirma tu contraseña';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Preparar datos para enviar
    const dataToSend = {
      nombre: formData.nombre.trim(),
      email: formData.email.trim().toLowerCase(),
      rol: formData.rol,
      estado: formData.estado,
      mfaHabilitado: formData.mfaHabilitado
    };

    // Incluir contraseña solo para usuarios nuevos
    if (!user && formData.password) {
      dataToSend.password = formData.password;
    }

    onSave(dataToSend);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in-up">
      <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {user ? 'Actualiza la información del usuario' : 'Completa todos los campos requeridos'}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, nombre: e.target.value }));
                  if (errors.nombre) setErrors(prev => ({ ...prev, nombre: '' }));
                }}
                className={`input-field pl-12 ${errors.nombre ? 'border-red-500 focus:ring-red-200' : ''}`}
                placeholder="Ej: Juan Pérez González"
              />
            </div>
            {errors.nombre && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {errors.nombre}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, email: e.target.value }));
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
                className={`input-field pl-12 ${errors.email ? 'border-red-500 focus:ring-red-200' : ''}`}
                placeholder="usuario@inacap.cl"
                disabled={!!user}
              />
            </div>
            {errors.email && (
              <p className="text-red-600 text-sm mt-1 flex items-center">
                <span className="mr-1">⚠️</span>
                {errors.email}
              </p>
            )}
            {user && (
              <p className="text-gray-500 text-xs mt-1">
                ℹ️ El email no puede ser modificado
              </p>
            )}
          </div>

          {/* Contraseña (solo para nuevo usuario) */}
          {!user && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, password: e.target.value }));
                      if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                    }}
                    className={`input-field pl-12 pr-12 ${errors.password ? 'border-red-500 focus:ring-red-200' : ''}`}
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.password}
                  </p>
                )}
                <div className="mt-2 space-y-1">
                  <p className={`text-xs flex items-center ${
                    formData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {formData.password.length >= 8 ? '✓' : '○'} Mínimo 8 caracteres
                  </p>
                  <p className={`text-xs flex items-center ${
                    /[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {/[A-Z]/.test(formData.password) ? '✓' : '○'} Al menos una mayúscula
                  </p>
                  <p className={`text-xs flex items-center ${
                    /[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {/[0-9]/.test(formData.password) ? '✓' : '○'} Al menos un número
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                      if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }}
                    className={`input-field pl-12 pr-12 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : ''}`}
                    placeholder="Repite la contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.confirmPassword}
                  </p>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-green-600 text-sm mt-1 flex items-center">
                    <span className="mr-1">✓</span>
                    Las contraseñas coinciden
                  </p>
                )}
              </div>
            </>
          )}

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rol de Usuario
            </label>
            <select
              value={formData.rol}
              onChange={(e) => setFormData(prev => ({ ...prev, rol: e.target.value }))}
              className="input-field"
            >
              <option value="corredor">Corredor</option>
              <option value="auditor">Auditor</option>
              <option value="admin">Administrador</option>
            </select>
            <p className="text-gray-500 text-xs mt-1">
              Define los permisos del usuario en el sistema
            </p>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado de la Cuenta
            </label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
              className="input-field"
            >
              <option value="activo">✓ Activo</option>
              <option value="suspendido">✗ Suspendido</option>
            </select>
          </div>

          {/* MFA Toggle */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.mfaHabilitado}
                      onChange={(e) => setFormData(prev => ({ ...prev, mfaHabilitado: e.target.checked }))}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      formData.mfaHabilitado ? 'bg-red-600' : 'bg-gray-300'
                    }`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        formData.mfaHabilitado ? 'transform translate-x-7' : 'transform translate-x-1'
                      }`} />
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700 block">
                      Autenticación en Dos Pasos (MFA)
                    </span>
                    <span className="text-xs text-gray-500">
                      Requiere código de verificación al iniciar sesión
                    </span>
                  </div>
                </label>
              </div>
              
              <Shield className={`w-6 h-6 ml-3 ${
                formData.mfaHabilitado ? 'text-red-600' : 'text-gray-400'
              }`} />
            </div>
          </div>

          {/* Botones */}
          <div className="flex space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
            >
              {user ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default UserForm;
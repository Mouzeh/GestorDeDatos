// src/components/ui/Header.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Shield, Menu, X } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ============================================
  // 🎯 NAVEGACIÓN PERSONALIZADA POR ROL
  // ============================================

  const getNavigationByRole = () => {
    const baseNavigation = [
      { name: 'Dashboard', href: '/', roles: ['admin', 'corredor', 'auditor'], icon: '📊' }
    ];

    const adminNavigation = [
      ...baseNavigation,
      { name: 'Gestión Usuarios', href: '/usuarios', roles: ['admin'], icon: '👥' },
      { name: 'Certificados', href: '/certificados', roles: ['admin'], icon: '📁' },
      { name: 'Auditoría', href: '/reportes', roles: ['admin'], icon: '🔍' }
    ];

    const corredorNavigation = [
      ...baseNavigation,
      { name: 'Carga Masiva', href: '/certificados', roles: ['corredor'], icon: '📁' },
      { name: 'Mis Certificados', href: '/certificados', roles: ['corredor'], icon: '📋' }
    ];

    const auditorNavigation = [
      ...baseNavigation,
      { name: 'Reportes', href: '/reportes', roles: ['auditor'], icon: '📊' },
      { name: 'Auditoría', href: '/reportes', roles: ['auditor'], icon: '🔍' },
      { name: 'Certificados', href: '/certificados', roles: ['auditor'], icon: '👁️' }
    ];

    switch(user?.rol) {
      case 'admin':
        return adminNavigation;
      case 'corredor':
        return corredorNavigation;
      case 'auditor':
        return auditorNavigation;
      default:
        return baseNavigation;
    }
  };

  const navigation = getNavigationByRole();

  // ============================================
  // 🎨 COLORES POR ROL
  // ============================================

  const getRoleColor = () => {
    switch(user?.rol) {
      case 'admin':
        return 'from-red-600 to-red-700';
      case 'corredor':
        return 'from-blue-600 to-blue-700';
      case 'auditor':
        return 'from-green-600 to-green-700';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  const getRoleBadge = () => {
    switch(user?.rol) {
      case 'admin':
        return { text: 'Administrador', color: 'bg-red-100 text-red-800' };
      case 'corredor':
        return { text: 'Corredor', color: 'bg-blue-100 text-blue-800' };
      case 'auditor':
        return { text: 'Auditor', color: 'bg-green-100 text-green-800' };
      default:
        return { text: user?.rol, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <>
      {/* Badge Superior con Rol */}
      <div className={`bg-gradient-to-r ${getRoleColor()} text-white py-2 px-4 text-sm font-semibold text-center flex items-center justify-center space-x-2`}>
        <Shield className="w-4 h-4" />
        <span>INACAP Valdivia - Sistema de Gestión Tributaria</span>
        <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
          {roleBadge.text}
        </span>
      </div>

      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-lg shadow-soft py-2' : 'bg-white py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* Logo */}
            <div className="flex items-center space-x-4 animate-slide-in-left">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${getRoleColor()} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Gestor Tributario
                  </h1>
                  <p className={`text-xs font-semibold ${roleBadge.color} px-2 py-0.5 rounded-full`}>
                    {roleBadge.text}
                  </p>
                </div>
              </div>
            </div>

            {/* Navegación Desktop */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigation.map((item, index) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    location.pathname === item.href
                      ? `bg-gradient-to-r ${getRoleColor()} text-white shadow-md`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>

            {/* Usuario y Logout */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 bg-gray-50 rounded-2xl px-4 py-2">
                <div className={`w-8 h-8 bg-gradient-to-br ${getRoleColor()} rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-md`}>
                  <User className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.nombre}</p>
                  <span className={`text-xs ${roleBadge.color} px-2 py-0.5 rounded-full font-medium`}>
                    {roleBadge.text}
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className={`flex items-center space-x-2 bg-gradient-to-r ${getRoleColor()} text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>

              {/* Menú Móvil */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú Móvil Expandido */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-soft animate-fade-in-up">
            <div className="px-4 py-3 space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                    location.pathname === item.href
                      ? `bg-gradient-to-r ${getRoleColor()} text-white`
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
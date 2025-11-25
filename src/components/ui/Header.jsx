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

  const navigation = [
    { name: 'Dashboard', href: '/', roles: ['admin', 'corredor', 'auditor'], icon: '📊' },
    { name: 'Carga Masiva', href: '/certificados', roles: ['admin', 'corredor'], icon: '📁' },
    { name: 'Panel Auditoría', href: '/reportes', roles: ['admin', 'auditor'], icon: '🔍' },
    { name: 'Gestión Usuarios', href: '/usuarios', roles: ['admin'], icon: '👥' },
    
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.rol)
  );

  return (
    <>
      {/* Badge INACAP Valdivia */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-1 px-4 text-xs font-semibold text-center animate-fade-in-up">
        INACAP Valdivia - Sistema de Gestión Tributaria
      </div>

      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-lg shadow-soft py-2' : 'bg-white py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo y marca */}
            <div className="flex items-center space-x-4 animate-slide-in-left">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Gestor Tributario
                  </h1>
                  <p className="text-xs text-gray-500">Sistema Certificado</p>
                </div>
              </div>
            </div>

            {/* Navegación desktop */}
            <nav className="hidden md:flex items-center space-x-1">
              {filteredNavigation.map((item, index) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    location.pathname === item.href
                      ? 'bg-red-50 text-red-700 shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </nav>

            {/* Información del usuario */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 bg-gray-50 rounded-2xl px-4 py-2 animate-fade-in-up">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-md">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.nombre}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.rol}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>

              {/* Botón menú móvil */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-soft animate-fade-in-up">
            <div className="px-4 py-3 space-y-2">
              {filteredNavigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                    location.pathname === item.href
                      ? 'bg-red-50 text-red-700'
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
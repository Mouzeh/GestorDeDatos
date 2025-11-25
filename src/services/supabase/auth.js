import { supabase } from '../../config/supabase';

export const authService = {
  async login(email, password) {
    try {
      console.log('🔐 Intentando login con:', email);
      
      // Para desarrollo, usar mock mientras configuramos Supabase Auth
      if (email === 'admin@inacap.cl' && password === 'admin123') {
        return {
          success: true,
          user: {
            id: '1',
            email: 'admin@inacap.cl',
            nombre: 'Administrador Sistema',
            rol: 'admin'
          },
          token: 'mock-token-admin',
          requiresMFA: false
        };
      }
      
      if (email === 'corredor@inacap.cl' && password === 'corredor123') {
        return {
          success: true,
          user: {
            id: '2',
            email: 'corredor@inacap.cl',
            nombre: 'Juan Corredor',
            rol: 'corredor'
          },
          token: 'mock-token-corredor',
          requiresMFA: false
        };
      }
      
      if (email === 'auditor@inacap.cl' && password === 'auditor123') {
        return {
          success: true,
          user: {
            id: '3',
            email: 'auditor@inacap.cl',
            nombre: 'María Auditor',
            rol: 'auditor'
          },
          token: 'mock-token-auditor',
          requiresMFA: false
        };
      }

      return {
        success: false,
        error: 'Credenciales inválidas'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async verifyMFA(code) {
    try {
      // Mock MFA verification
      if (code === '123456') {
        return {
          success: true,
          user: {
            id: '1',
            email: 'admin@inacap.cl',
            nombre: 'Administrador Sistema',
            rol: 'admin'
          },
          token: 'mock-token-mfa-verified'
        };
      }
      
      return {
        success: false,
        error: 'Código MFA inválido'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async logout() {
    try {
      console.log('🚪 Cerrando sesión...');
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      console.error('Error en logout:', error);
      return { success: false, error: error.message };
    }
  },

  async getCurrentUser() {
    try {
      // Mock para desarrollo
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
};
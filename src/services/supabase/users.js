// src/services/supabase/users.js
import { supabase } from '../../config/supabase';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const usersService = {

  /**
   * ==================================================
   * 🔑 Obtener token JWT
   * ==================================================
   */
  async getAuthToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  },

  /**
   * ==================================================
   * 🆕 Crear usuario vía API
   * ==================================================
   */
  async createUser(userData) {
    try {
      console.log('🆕 Enviando creación de usuario al backend...', userData);

      if (!userData.password) {
        throw new Error('La contraseña es requerida para crear un usuario');
      }

      const token = await this.getAuthToken();
      if (!token) throw new Error('No estás autenticado');

      const response = await fetch(`${API_URL}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          nombre: userData.nombre,
          rol: userData.rol,
          estado: userData.estado || 'activo',
          mfaHabilitado: userData.mfaHabilitado || false
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear usuario');
      }

      console.log('✅ Usuario creado exitosamente en backend');
      return { success: true, user: result.user };

    } catch (error) {
      console.error('❌ Error en createUser:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * ==================================================
   * 📄 Obtener TODOS los usuarios (sin filtros)
   * ==================================================
   */
  async getUsers() {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          *,
          roles:rol_id (
            id,
            nombre_rol,
            descripcion,
            permisos
          )
        `)
        .order('creado_en', { ascending: false });

      if (error) throw error;

      const users = data.map(user => ({
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.roles?.nombre_rol || "Sin rol",
        estado: user.activo ? "activo" : "suspendido",
        mfaHabilitado: user.mfa_habilitado,
        ultimoAcceso: user.ultimo_acceso,
        fechaRegistro: user.creado_en
      }));

      return { success: true, users };

    } catch (error) {
      console.error('❌ Error obteniendo usuarios:', error);
      return { success: false, error: error.message, users: [] };
    }
  },

  /**
   * ==================================================
   * ✏ Actualizar usuario
   * ==================================================
   */
  async updateUser(userId, userData) {
    try {
      console.log('📝 Actualizando usuario:', userId);

      const updates = {
        nombre: userData.nombre,
        activo: userData.estado === 'activo',
        estado: userData.estado
      };

      if (userData.mfaHabilitado !== undefined) {
        updates.mfa_habilitado = userData.mfaHabilitado;
      }

      if (userData.rol) {
        const { data: role, error: roleError } = await supabase
          .from('roles')
          .select('id')
          .eq('nombre_rol', userData.rol)
          .single();

        if (roleError) throw roleError;
        updates.rol_id = role.id;
      }

      const { data, error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id', userId)
        .select(`
          *,
          roles:rol_id (
            id,
            nombre_rol,
            permisos
          )
        `)
        .single();

      if (error) throw error;

      return {
        success: true,
        user: {
          id: data.id,
          nombre: data.nombre,
          email: data.email,
          rol: data.roles?.nombre_rol,
          estado: data.activo ? 'activo' : 'suspendido',
          mfaHabilitado: data.mfa_habilitado
        }
      };

    } catch (error) {
      console.error('❌ Error actualizando usuario:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * ==================================================
   * 🗑 Eliminar usuario
   * ==================================================
   */
  async deleteUser(userId) {
    try {
      console.log('🗑️ Eliminando usuario:', userId);

      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      return { success: true, message: 'Usuario eliminado correctamente' };
    } catch (error) {
      console.error('❌ Error eliminando usuario:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * ==================================================
   * 🔑 Reset password
   * ==================================================
   */
  async requestPasswordReset(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      return { success: true, message: 'Email enviado para restablecer contraseña' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

import { supabase } from '../../config/supabase';

export const usersService = {
  async getUsers(filters = {}) {
    try {
      let query = supabase
        .from('usuarios')
        .select(`
          *,
          roles:rol_id (*)
        `);

      if (filters.rol) {
        query = query.eq('roles.nombre_rol', filters.rol);
      }
      if (filters.estado !== undefined) {
        query = query.eq('activo', filters.estado);
      }

      const { data, error } = await query.order('creado_en', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        users: data.map(user => ({
          ...user,
          rol: user.roles?.nombre_rol
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        users: []
      };
    }
  },

  async createUser(userData) {
    try {
      // First create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password || 'tempPassword123',
        email_confirm: true
      });

      if (authError) throw authError;

      // Get role ID
      const { data: role } = await supabase
        .from('roles')
        .select('id')
        .eq('nombre_rol', userData.rol)
        .single();

      // Create user profile
      const { data: profile, error: profileError } = await supabase
        .from('usuarios')
        .insert({
          id: authData.user.id,
          email: userData.email,
          nombre: userData.nombre,
          rol_id: role.id,
          mfa_secret: userData.mfaHabilitado ? 'demo-secret' : null
        })
        .select(`
          *,
          roles:rol_id (*)
        `)
        .single();

      if (profileError) throw profileError;

      return {
        success: true,
        user: {
          ...profile,
          rol: profile.roles?.nombre_rol
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async updateUser(userId, userData) {
    try {
      const updates = {
        nombre: userData.nombre,
        mfa_secret: userData.mfaHabilitado ? 'demo-secret' : null,
        activo: userData.estado === 'activo'
      };

      // Update role if changed
      if (userData.rol) {
        const { data: role } = await supabase
          .from('roles')
          .select('id')
          .eq('nombre_rol', userData.rol)
          .single();

        updates.rol_id = role.id;
      }

      const { data, error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id', userId)
        .select(`
          *,
          roles:rol_id (*)
        `)
        .single();

      if (error) throw error;

      return {
        success: true,
        user: {
          ...data,
          rol: data.roles?.nombre_rol
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async deleteUser(userId) {
    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Also delete auth user
      await supabase.auth.admin.deleteUser(userId);

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};
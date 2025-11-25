import { supabase } from '../../config/supabase';

export const authService = {
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Get user profile with role
      const { data: profile, error: profileError } = await supabase
        .from('usuarios')
        .select(`
          *,
          roles:rol_id (*)
        `)
        .eq('id', data.user.id)
        .single();

      if (profileError) throw profileError;

      return {
        success: true,
        user: {
          id: profile.id,
          email: profile.email,
          nombre: profile.nombre,
          rol: profile.roles?.nombre_rol || 'corredor'
        },
        token: data.session.access_token,
        requiresMFA: !!profile.mfa_secret
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
      // Implement MFA verification logic
      // This would typically involve checking against the stored MFA secret
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuario no autenticado');

      // For demo purposes, accept any 6-digit code
      if (code.length === 6 && /^\d+$/.test(code)) {
        const { data: profile } = await supabase
          .from('usuarios')
          .select(`
            *,
            roles:rol_id (*)
          `)
          .eq('id', user.id)
          .single();

        return {
          success: true,
          user: {
            id: profile.id,
            email: profile.email,
            nombre: profile.nombre,
            rol: profile.roles?.nombre_rol || 'corredor'
          },
          token: 'mfa-verified-token' // In real app, this would be a new JWT
        };
      } else {
        throw new Error('Código MFA inválido');
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('usuarios')
      .select(`
        *,
        roles:rol_id (*)
      `)
      .eq('id', user.id)
      .single();

    return profile ? {
      id: profile.id,
      email: profile.email,
      nombre: profile.nombre,
      rol: profile.roles?.nombre_rol || 'corredor'
    } : null;
  }
};
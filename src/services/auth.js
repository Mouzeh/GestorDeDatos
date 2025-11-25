import { supabase } from '../../config/supabase';

export const authService = {
  async login(email, password) {
    try {
      // 1. Realizar login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // 2. Esperar a que Supabase actualice la sesión internamente
      await new Promise(resolve => setTimeout(resolve, 300));

      // 3. Obtener usuario REAL desde la sesión
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("No se pudo obtener el usuario desde la sesión");

      // 4. Obtener su perfil desde la tabla personalizada
      const { data: profile, error: profileError } = await supabase
        .from('usuarios')
        .select(`
          *,
          roles:rol_id (*)
        `)
        .eq('id', user.id)
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
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('Usuario no autenticado');

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
          token: 'mfa-verified-token'
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
    // 1. Obtener la sesión
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // 2. Leer perfil del usuario
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

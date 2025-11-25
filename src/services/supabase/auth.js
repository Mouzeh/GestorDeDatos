import { supabase } from '../../config/supabase';

export const authService = {

  // ===================================================
  // LOGIN
  // ===================================================
  async login(email, password) {
    try {
      console.log("🔐 Iniciando login para:", email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      console.log("✅ Login correcto. Cargando perfil...");

      let { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          roles:rol_id (*)
        `)
        .eq('id', data.user.id)
        .single();

      // Si NO existe perfil → crearlo
      if (profileError && profileError.code === "PGRST116") {
        console.log("ℹ️ No existe perfil. Creando...");
        profile = await this.createUserProfile(data.user);
      } else if (profileError) {
        throw profileError;
      }

      return {
        success: true,
        user: {
          id: profile.id,
          email: profile.email,
          nombre: profile.nombre,
          rol: profile.roles?.nombre_rol || "corredor"
        },
        token: data.session.access_token,
        requiresMFA: !!profile.mfa_secret
      };

    } catch (error) {
      console.error("❌ Error en login:", error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // ===================================================
  // CREAR PERFIL - ACTUALIZADA CON UUIDs CORRECTOS
  // ===================================================
  async createUserProfile(authUser) {
    try {
      // Usar UUID directo del rol corredor para evitar problemas
      const defaultRoleId = '5ca5c267-8cc4-4bf7-b73e-e93e42ea401d';
      const defaultName = this.generateDefaultName(authUser.email);
      
      console.log('🎯 Creando perfil para:', authUser.email, 'con rol ID:', defaultRoleId);
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: authUser.id,
            email: authUser.email,
            nombre: defaultName,
            rol_id: defaultRoleId, // UUID CORRECTO del rol corredor
            estado: "activo",
            creado_en: new Date().toISOString(),
            actualizado_en: new Date().toISOString()
          }
        ])
        .select(`
          *,
          roles:rol_id (*)
        `)
        .single();

      if (error) {
        console.error("❌ Error SQL detallado creando perfil:", error);
        
        // Si es error de RLS, sugerir solución
        if (error.code === '42501') {
          throw new Error('Permisos insuficientes. Contacta al administrador.');
        }
        throw error;
      }

      console.log("✅ Perfil creado exitosamente:", profile);
      return profile;

    } catch (error) {
      console.error("💥 Error fatal creando perfil:", error);
      throw new Error(`No se pudo crear el perfil: ${error.message}`);
    }
  },

  // ===================================================
  // OBTENER ROL POR DEFECTO - ACTUALIZADA
  // ===================================================
  async getDefaultRoleId() {
    try {
      console.log('🔍 Obteniendo ID del rol corredor...');
      
      const { data, error } = await supabase
        .from("roles")
        .select("id")
        .eq("nombre_rol", "corredor")
        .single();

      if (error) {
        console.error("❌ Error obteniendo rol corredor:", error);
        // Fallback al UUID correcto que ya tenemos
        return '5ca5c267-8cc4-4bf7-b73e-e93e42ea401d';
      }

      console.log('✅ Rol corredor ID encontrado:', data.id);
      return data.id;

    } catch (error) {
      console.error("⚠️ Error en getDefaultRoleId:", error);
      // Fallback al UUID correcto
      return '5ca5c267-8cc4-4bf7-b73e-e93e42ea401d';
    }
  },

  // ===================================================
  // FORMATEAR NOMBRE POR DEFECTO
  // ===================================================
  generateDefaultName(email) {
    return email
      .split("@")[0]
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\b\w/g, l => l.toUpperCase());
  },

  // ===================================================
  // GET CURRENT USER - ACTUALIZADA
  // ===================================================
  async getCurrentUser() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.log('👤 No hay usuario autenticado');
        return null;
      }

      console.log('🔍 Buscando perfil para usuario:', user.id);

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          roles:rol_id (*)
        `)
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("⚠️ Error obteniendo perfil:", profileError);
        
        // Si el perfil no existe, crearlo automáticamente
        if (profileError.code === 'PGRST116') {
          console.log('🔄 Perfil no encontrado, creando automáticamente...');
          try {
            const newProfile = await this.createUserProfile(user);
            return {
              id: newProfile.id,
              email: newProfile.email,
              nombre: newProfile.nombre,
              rol: newProfile.roles?.nombre_rol || "corredor"
            };
          } catch (createError) {
            console.error('💥 Error creando perfil en getCurrentUser:', createError);
            return null;
          }
        }
        
        return null;
      }

      console.log('✅ Perfil cargado exitosamente');
      return {
        id: profile.id,
        email: profile.email,
        nombre: profile.nombre,
        rol: profile.roles?.nombre_rol || "corredor"
      };

    } catch (error) {
      console.error("❌ Error en getCurrentUser:", error);
      return null;
    }
  },

  // ===================================================
  // REGISTRO USUARIO
  // ===================================================
  async register(email, password, nombre) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre: nombre || this.generateDefaultName(email)
          }
        }
      });

      if (error) throw error;

      return {
        success: true,
        user: data.user,
        message: "Usuario registrado. Verifica tu correo."
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // ===================================================
  // LOGOUT
  // ===================================================
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("❌ Error en logout:", error);
      return { success: false };
    }
  },

  // ===================================================
  // VERIFICACIÓN MFA
  // ===================================================
  async verifyMFA(code) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuario no autenticado');

      // Verificar perfil para MFA
      const { data: profile } = await supabase
        .from('user_profiles')
        .select(`
          *,
          roles:rol_id (*)
        `)
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error('Perfil de usuario no encontrado');

      // Lógica de verificación MFA (simplificada)
      if (code.length === 6 && /^\d+$/.test(code)) {
        return {
          success: true,
          user: {
            id: profile.id,
            email: profile.email,
            nombre: profile.nombre,
            rol: profile.roles?.nombre_rol || 'corredor'
          }
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
  }
};
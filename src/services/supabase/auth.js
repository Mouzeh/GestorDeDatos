import { supabase } from '../../config/supabase';

export const authService = {

  // ===================================================
  // LOGIN - COMPLETAMENTE CORREGIDO para usar 'usuarios'
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

      // ✅ CORREGIDO: Usar 'usuarios' en lugar de 'user_profiles'
      let { data: profile, error: profileError } = await supabase
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
        .eq('id', data.user.id)
        .single();

      // Si NO existe perfil → crearlo
      if (profileError && profileError.code === "PGRST116") {
        console.log("ℹ️ No existe perfil. Creando...");
        profile = await this.createUserProfile(data.user);
      } else if (profileError) {
        console.error("❌ Error obteniendo perfil:", profileError);
        throw profileError;
      }

      // Actualizar último acceso
      await this.updateLastAccess(profile.id);

      return {
        success: true,
        user: {
          id: profile.id,
          email: profile.email,
          nombre: profile.nombre,
          rol: profile.roles?.nombre_rol || "corredor",
          permisos: profile.roles?.permisos || [],
          estado: profile.estado,
          activo: profile.activo
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
  // CREAR PERFIL - COMPLETAMENTE CORREGIDO para usar 'usuarios'
  // ===================================================
  async createUserProfile(authUser) {
    try {
      console.log('🎯 Creando perfil para:', authUser.email);
      
      // Obtener el ID del rol corredor dinámicamente
      const defaultRoleId = await this.getDefaultRoleId();
      const defaultName = this.generateDefaultName(authUser.email);
      
      console.log('📋 Datos del nuevo perfil:', {
        id: authUser.id,
        email: authUser.email,
        nombre: defaultName,
        rol_id: defaultRoleId
      });
      
      // ✅ CORREGIDO: Usar 'usuarios' en lugar de 'user_profiles'
      const { data: profile, error } = await supabase
        .from('usuarios')
        .insert([
          {
            id: authUser.id,
            email: authUser.email,
            nombre: defaultName,
            rol_id: defaultRoleId,
            estado: "activo",
            activo: true
          }
        ])
        .select(`
          *,
          roles:rol_id (
            id,
            nombre_rol,
            descripcion,
            permisos
          )
        `)
        .single();

      if (error) {
        console.error("❌ Error SQL detallado creando perfil:", error);
        
        // Manejar errores específicos
        if (error.code === '42501') {
          throw new Error('Error de permisos RLS. Verifica las políticas de seguridad.');
        }
        if (error.code === '23505') {
          throw new Error('El usuario ya existe en la base de datos.');
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
  // OBTENER ROL POR DEFECTO
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
        throw new Error('No se encontró el rol "corredor". Verifica que exista en la tabla roles.');
      }

      console.log('✅ Rol corredor ID encontrado:', data.id);
      return data.id;

    } catch (error) {
      console.error("⚠️ Error crítico en getDefaultRoleId:", error);
      throw error;
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
  // GET CURRENT USER - COMPLETAMENTE CORREGIDO para usar 'usuarios'
  // ===================================================
  async getCurrentUser() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.log('👤 No hay usuario autenticado');
        return null;
      }

      console.log('🔍 Buscando perfil para usuario:', user.id);

      // ✅ CORREGIDO: Usar 'usuarios' en lugar de 'user_profiles'
      const { data: profile, error: profileError } = await supabase
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
              rol: newProfile.roles?.nombre_rol || "corredor",
              permisos: newProfile.roles?.permisos || [],
              estado: newProfile.estado,
              activo: newProfile.activo
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
        rol: profile.roles?.nombre_rol || "corredor",
        permisos: profile.roles?.permisos || [],
        estado: profile.estado,
        activo: profile.activo
      };

    } catch (error) {
      console.error("❌ Error en getCurrentUser:", error);
      return null;
    }
  },

  // ===================================================
  // VERIFICACIÓN MFA - COMPLETAMENTE CORREGIDO para usar 'usuarios'
  // ===================================================
  async verifyMFA(code) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuario no autenticado');

      // ✅ CORREGIDO: Usar 'usuarios' en lugar de 'user_profiles'
      const { data: profile } = await supabase
        .from('usuarios')
        .select(`
          *,
          roles:rol_id (
            id,
            nombre_rol,
            permisos
          )
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
            rol: profile.roles?.nombre_rol || 'corredor',
            permisos: profile.roles?.permisos || []
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
  },

  // ===================================================
  // ACTUALIZAR ÚLTIMO ACCESO
  // ===================================================
  async updateLastAccess(userId) {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ ultimo_acceso: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.error("⚠️ Error actualizando último acceso:", error);
      }
    } catch (error) {
      console.error("⚠️ Error en updateLastAccess:", error);
    }
  },

  // ===================================================
  // LOGOUT
  // ===================================================
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log("✅ Sesión cerrada exitosamente");
      return { success: true };
      
    } catch (error) {
      console.error("❌ Error en logout:", error);
      return { 
        success: false,
        error: error.message 
      };
    }
  },

  // ===================================================
  // VERIFICAR ESTADO DE SESIÓN
  // ===================================================
  async checkSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      return {
        isAuthenticated: !!session,
        session
      };
    } catch (error) {
      console.error("❌ Error verificando sesión:", error);
      return {
        isAuthenticated: false,
        session: null
      };
    }
  }
};
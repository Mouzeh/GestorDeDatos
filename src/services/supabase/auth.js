import { supabase } from '../../config/supabase';

// 🔥 URL DEL BACKEND REAL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

export const authService = {

  // ===================================================
  // 🔐 LOGIN → maneja MFA si está habilitado
  // ===================================================
  async login(email, password) {
    try {
      console.log("🔐 Iniciando login para:", email);

      // 1. Autenticación en Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      const authUser = data.user;

      // 2. Obtener perfil desde BD
      const { data: profile, error: profileError } = await supabase
        .from("usuarios")
        .select(`
          *,
          roles:rol_id(id, nombre_rol, permisos)
        `)
        .eq("id", authUser.id)
        .single();

      // Si el perfil NO existe → crearlo
      if (profileError && profileError.code === "PGRST116") {
        const newProfile = await this.createUserProfile(authUser);
        return {
          success: true,
          requiresMFA: false,
          user: newProfile,
          token: data.session.access_token
        };
      }

      if (profileError) throw profileError;

      // 3. SI NO tiene MFA → login directo
      if (!profile.mfa_habilitado) {
        return {
          success: true,
          requiresMFA: false,
          user: profile,
          token: data.session.access_token
        };
      }

      // 4. MFA HABILITADO → enviar OTP al correo
      console.log("📨 Enviando OTP a:", profile.email);

      const otpResponse = await this.generateEmailOTP(profile.id, profile.email);

      if (!otpResponse.success) {
        return { success: false, error: otpResponse.error };
      }

      return {
        success: true,
        requiresMFA: true,
        email: profile.email,
        userId: profile.id
      };

    } catch (error) {
      console.error("❌ Error Login:", error);
      return { success: false, error: error.message };
    }
  },

  // ===================================================
  // 🔥 GENERAR OTP: Guardar en BD + Enviar al backend real
  // ===================================================
  async generateEmailOTP(userId, email) {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log("🔢 OTP generado:", otp);

      // 1) Guardar OTP en base de datos
      const { error: updateError } = await supabase
        .from("usuarios")
        .update({
          otp_code: otp,
          otp_expires: new Date(Date.now() + 5 * 60000).toISOString()
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      // 2) Enviar OTP al backend para que mande correo
      const res = await fetch(`${API_URL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp })
      });

      const json = await res.json();

      if (!json.success) {
        console.error("❌ Backend no pudo enviar correo:", json.error);
        return { success: false, error: "Error enviando correo MFA" };
      }

      console.log("📧 OTP enviado exitosamente");
      return { success: true };

    } catch (error) {
      console.error("❌ Error generando OTP:", error);
      return { success: false, error: error.message };
    }
  },

  // ===================================================
  // 🔑 VERIFICAR MFA
  // ===================================================
  async verifyMFA(email, code) {
    try {
      const { data: profile, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", email)
        .single();

      if (error) throw error;

      if (!profile.otp_code)
        throw new Error("No se generó MFA para este usuario");

      if (profile.otp_code !== code)
        throw new Error("Código incorrecto");

      if (new Date(profile.otp_expires) < new Date())
        throw new Error("El código MFA expiró");

      // Limpiar código
      await supabase
        .from("usuarios")
        .update({ otp_code: null, otp_expires: null })
        .eq("id", profile.id);

      console.log("🔓 MFA verificado correctamente");

      return { success: true };

    } catch (error) {
      console.error("❌ Error verificando MFA:", error);
      return { success: false, error: error.message };
    }
  },

  // ===================================================
  // 👤 GET CURRENT USER
  // ===================================================
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("usuarios")
        .select(`
          *,
          roles:rol_id(id, nombre_rol, permisos)
        `)
        .eq("id", user.id)
        .single();

      return profile;

    } catch (error) {
      console.error("❌ Error getCurrentUser:", error);
      return null;
    }
  },

  // ===================================================
  // 🏷️ CREAR PERFIL AUTOMÁTICAMENTE
  // ===================================================
  async createUserProfile(authUser) {
    const defaultRoleId = await this.getDefaultRoleId();
    const defaultName = this.generateDefaultName(authUser.email);

    const { data: profile, error } = await supabase
      .from("usuarios")
      .insert([{
        id: authUser.id,
        email: authUser.email,
        nombre: defaultName,
        rol_id: defaultRoleId,
        estado: "activo",
        activo: true
      }])
      .select("*")
      .single();

    if (error) throw error;

    return profile;
  },

  async getDefaultRoleId() {
    const { data } = await supabase
      .from("roles")
      .select("id")
      .eq("nombre_rol", "corredor")
      .single();

    return data.id;
  },

  generateDefaultName(email) {
    return email
      .split("@")[0]
      .replace(/[^a-zA-Z0-9]/g, " ")
      .replace(/\b\w/g, l => l.toUpperCase());
  },

  async logout() {
    await supabase.auth.signOut();
    return { success: true };
  },

  async checkSession() {
    return await supabase.auth.getSession();
  }
};

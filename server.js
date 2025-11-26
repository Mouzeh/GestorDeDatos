require('dotenv').config({ path: '.env.backend' });
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ===========================================================
// 🔐 GLOBAL — Guardar OTP en memoria
// ===========================================================
global.MFA_CODE = {}; // { email: { code: '123456', expires: timestamp } }

// ===========================================================
// 🔐 SUPABASE ADMIN (SERVICE ROLE KEY) — SIN RLS
// ===========================================================
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// ===========================================================
// 📧 CONFIGURACIÓN SMTP GMAIL
// ===========================================================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS_APP,
  },
});

// ===========================================================
// 📧 FUNCIÓN PARA ENVIAR OTP
// ===========================================================
async function sendMFAEmail(email, otp) {
  if (!otp) throw new Error("OTP vacío");

  return transporter.sendMail({
    from: `"Sistema Tributario" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🔐 Código MFA de acceso",
    html: `
      <h2>Tu código de verificación</h2>
      <p style="font-size: 28px; font-weight: bold;">${otp}</p>
      <p>Este código expirará en 5 minutos.</p>
    `,
  });
}

// ===========================================================
// 📧 ENVIAR OTP
// ===========================================================
app.post("/api/send-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!otp) return res.json({ success: false, error: "OTP vacío" });

    global.MFA_CODE[email] = {
      code: otp,
      expires: Date.now() + 5 * 60 * 1000,
    };

    await sendMFAEmail(email, otp);

    return res.json({ success: true });

  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
});

// ===========================================================
// 🔐 LOGIN
// ===========================================================
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return res.json({ success: false, error: error.message });

    const { data: profile } = await supabaseAdmin
      .from("usuarios")
      .select("*, roles:rol_id(nombre_rol)")
      .eq("id", data.user.id)
      .single();

    return res.json({
      success: true,
      user: profile,
      token: data.session.access_token,
      requiresMFA: profile.mfa_habilitado,
    });

  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
});

// ===========================================================
// 🔐 VERIFICAR MFA
// ===========================================================
app.post("/api/mfa/verify", async (req, res) => {
  try {
    const { email, code } = req.body;
    const saved = global.MFA_CODE[email];

    if (!saved)
      return res.json({ success: false, error: "No existe MFA para este usuario" });

    if (Date.now() > saved.expires)
      return res.json({ success: false, error: "Código expirado" });

    if (saved.code !== code)
      return res.json({ success: false, error: "Código incorrecto" });

    delete global.MFA_CODE[email];

    return res.json({ success: true });

  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
});

// ===========================================================
// 🛡 VERIFY ADMIN (middleware)
// ===========================================================
async function verifyAdmin(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ success: false, error: "No autorizado" });

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return res.status(401).json({ success: false, error: "Token inválido" });

    const { data: perfil } = await supabaseAdmin
      .from("usuarios")
      .select("roles:rol_id(nombre_rol)")
      .eq("id", user.id)
      .single();

    if (perfil?.roles?.nombre_rol !== "admin") {
      return res.status(403).json({ success: false, error: "No eres admin" });
    }

    next();

  } catch (error) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
}

// ===========================================================
// 🆕 **GET LISTA DE USUARIOS (ADMIN PANEL)** — FIX FINAL
// ===========================================================
app.get("/api/admin/users", verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("usuarios")
      .select(`
        id,
        email,
        nombre,
        rol_id,
        activo,
        mfa_habilitado,
        estado,
        roles:rol_id ( nombre_rol )
      `);

    if (error) {
      console.error("❌ Error Supabase:", error);
      return res.json({ success: false, error: error.message });
    }

    const usuarios = data.map(u => ({
      id: u.id,
      email: u.email,
      nombre: u.nombre,
      rol: u.roles?.nombre_rol || "sin-rol",
      estado: u.activo ? "activo" : "suspendido",
      mfaHabilitado: u.mfa_habilitado
    }));

    return res.json({
      success: true,
      users: usuarios,
    });

  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
});

// ===========================================================
// 🆕 CREAR USUARIO (ADMIN PANEL)
// ===========================================================
app.post("/api/admin/users", verifyAdmin, async (req, res) => {
  try {
    const { email, password, nombre, rol, mfa_habilitado } = req.body;

    const { data: authUser, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) return res.json({ success: false, error: error.message });

    const { data: roleData } = await supabaseAdmin
      .from("roles")
      .select("id")
      .eq("nombre_rol", rol)
      .single();

    await supabaseAdmin.from("usuarios").insert({
      id: authUser.user.id,
      email,
      nombre,
      rol_id: roleData.id,
      mfa_habilitado,
      activo: true,
      estado: "activo",
    });

    return res.json({ success: true });

  } catch (error) {
    return res.json({ success: false, error: error.message });
  }
});

// ===========================================================
app.listen(PORT, () =>
  console.log(`🚀 API running on http://localhost:${PORT}`)
);

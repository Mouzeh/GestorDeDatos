// server.js - API Backend para operaciones admin
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3001;

// Cliente Supabase con Service Role Key (SOLO BACKEND)
const supabaseAdmin = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Middleware
app.use(cors());
app.use(express.json());

// ====================================
// 🔐 MIDDLEWARE DE AUTENTICACIÓN ADMIN
// ====================================
async function verifyAdmin(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Verificar que sea admin
    const { data: profile } = await supabaseAdmin
      .from('usuarios')
      .select('roles:rol_id(nombre_rol)')
      .eq('id', user.id)
      .single();

    if (profile?.roles?.nombre_rol !== 'admin') {
      return res.status(403).json({ error: 'Requiere permisos de administrador' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// ====================================
// 🆕 CREAR USUARIO
// ====================================
app.post('/api/admin/users', verifyAdmin, async (req, res) => {
  try {
    const { email, password, nombre, rol, mfaHabilitado } = req.body;

    console.log('🆕 Creando usuario:', email);

    if (!email || !password || !nombre || !rol) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: email, password, nombre, rol'
      });
    }

    // PREVENIR EMAIL DUPLICADO EN AUTH
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    if (existingUsers?.users.some(u => u.email === email)) {
      return res.status(400).json({
        error: 'El correo ya está registrado en Supabase Auth'
      });
    }

    // 1. Crear usuario en Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nombre, rol }
    });

    if (authError) {
      console.error('❌ Error en Auth:', authError);
      return res.status(400).json({ error: authError.message });
    }

    console.log('✅ Usuario creado en Auth:', authData.user.id);

    // 2. Obtener ID del rol
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('nombre_rol', rol)
      .single();

    if (roleError || !roleData) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return res.status(400).json({ error: `Rol "${rol}" no encontrado` });
    }

    // 3. Crear perfil en tabla usuarios (SIN DUPLICAR)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('usuarios')
      .upsert({
        id: authData.user.id,
        email,
        nombre,
        rol_id: roleData.id,
        estado: 'activo',
        activo: true,
        mfa_habilitado: mfaHabilitado || false
      })
      .select(`
        *,
        roles:rol_id (
          id,
          nombre_rol,
          permisos
        )
      `)
      .single();

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return res.status(400).json({ error: profileError.message });
    }

    console.log('✅ Usuario creado completamente');

    res.json({
      success: true,
      user: {
        id: profile.id,
        nombre: profile.nombre,
        email: profile.email,
        rol: profile.roles?.nombre_rol,
        estado: profile.estado,
        mfaHabilitado: profile.mfa_habilitado
      }
    });

  } catch (error) {
    console.error('💥 Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ====================================
// 📄 LISTAR USUARIOS  ← ← ← (FALTABA)
// ====================================
app.get('/api/admin/users', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .select(`
        id,
        email,
        nombre,
        estado,
        activo,
        mfa_habilitado,
        roles:rol_id (nombre_rol)
      `)
      .order('nombre', { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      users: data.map(u => ({
        id: u.id,
        email: u.email,
        nombre: u.nombre,
        rol: u.roles?.nombre_rol,
        estado: u.estado,
        activo: u.activo,
        mfaHabilitado: u.mfa_habilitado
      }))
    });

  } catch (error) {
    console.error("❌ Error listando usuarios:", error);
    res.status(500).json({ error: error.message });
  }
});

// ====================================
// 📝 ACTUALIZAR USUARIO
// ====================================
app.put('/api/admin/users/:userId', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { nombre, rol, estado, mfaHabilitado } = req.body;

    const updates = {
      nombre,
      activo: estado === 'activo',
      estado,
      mfa_habilitado: mfaHabilitado
    };

    if (rol) {
      const { data: roleData } = await supabaseAdmin
        .from('roles')
        .select('id')
        .eq('nombre_rol', rol)
        .single();

      if (roleData) updates.rol_id = roleData.id;
    }

    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .update(updates)
      .eq('id', userId)
      .select(`
        *,
        roles:rol_id (nombre_rol)
      `)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      user: {
        id: data.id,
        nombre: data.nombre,
        email: data.email,
        rol: data.roles?.nombre_rol,
        estado: data.estado,
        mfaHabilitado: data.mfa_habilitado
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====================================
// 🗑️ ELIMINAR USUARIO
// ====================================
app.delete('/api/admin/users/:userId', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    await supabaseAdmin.from('usuarios').delete().eq('id', userId);

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) console.warn('⚠️ Usuario eliminado de BD pero no de Auth');

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====================================
// 🔑 CAMBIAR CONTRASEÑA
// ====================================
app.post('/api/admin/users/:userId/reset-password', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) throw error;

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====================================
// 🏥 HEALTH CHECK
// ====================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor admin corriendo en http://localhost:${PORT}`);
  console.log(`🔐 Usando Supabase: ${process.env.REACT_APP_SUPABASE_URL}`);
});

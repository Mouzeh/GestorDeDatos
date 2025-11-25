// test-auth-simple.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthSimple() {
  console.log('🧪 Probando autenticación (versión simple)...\n');

  try {
    // 1. Login
    console.log('1. 🔐 Probando login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@inacap.cl',
      password: 'admin123'
    });

    if (authError) {
      console.error('❌ Error en login:', authError.message);
      return false;
    }

    console.log('✅ Login exitoso');
    console.log('   Usuario ID:', authData.user.id);
    console.log('   Email:', authData.user.email);

    // 2. Verificar usuario usando una consulta DIRECTA (sin RLS recursiva)
    console.log('\n2. 🔍 Verificando usuario con consulta directa...');
    
    // Usar supabase.admin para evitar RLS temporalmente
    const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_KEY);
    
    const { data: usuarios, error: usuariosError } = await supabaseAdmin
      .from('usuarios')
      .select(`
        id,
        email,
        nombre,
        estado,
        activo,
        roles:rol_id (nombre_rol)
      `)
      .eq('id', authData.user.id);

    if (usuariosError) {
      console.error('❌ Error consultando usuarios:', usuariosError.message);
    } else if (usuarios.length === 0) {
      console.log('❌ Usuario no encontrado en tabla "usuarios"');
      console.log('💡 El trigger automático no funcionó. Creando manualmente...');
      
      await createUserManually(authData.user);
    } else {
      console.log('✅ Usuario encontrado en tabla "usuarios"');
      const usuario = usuarios[0];
      console.log('   Nombre:', usuario.nombre);
      console.log('   Rol:', usuario.roles?.nombre_rol);
      console.log('   Estado:', usuario.estado);
    }

    // 3. Verificar que puede acceder a otras tablas
    console.log('\n3. 📊 Probando acceso a certificados...');
    const { data: certificados, error: certError } = await supabase
      .from('certificados_tributarios')
      .select('count(*)')
      .single();

    if (certError) {
      console.error('❌ Error accediendo a certificados:', certError.message);
    } else {
      console.log('✅ Puede acceder a certificados_tributarios');
      console.log('   Total certificados:', certificados.count);
    }

    // 4. Logout
    console.log('\n4. 🚪 Logout...');
    await supabase.auth.signOut();
    console.log('✅ Sesión cerrada');

    console.log('\n🎉 ¡PRUEBA COMPLETADA!');
    console.log('✅ La autenticación básica funciona');
    console.log('⚠️  Pero necesitas corregir las políticas RLS');
    
    return true;

  } catch (error) {
    console.error('💥 Error fatal:', error);
    return false;
  }
}

async function createUserManually(authUser) {
  try {
    const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_KEY);
    
    // Obtener ID del rol admin
    const { data: role } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('nombre_rol', 'admin')
      .single();

    const { data: newUser, error } = await supabaseAdmin
      .from('usuarios')
      .insert({
        id: authUser.id,
        email: authUser.email,
        nombre: 'Administrador Sistema',
        rol_id: role.id,
        estado: 'activo',
        activo: true,
        creado_en: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creando usuario manualmente:', error.message);
      return false;
    }

    console.log('✅ Usuario creado manualmente en tabla "usuarios"');
    console.log('   ID:', newUser.id);
    return true;

  } catch (error) {
    console.error('💥 Error en creación manual:', error);
    return false;
  }
}

testAuthSimple().then(success => {
  if (success) {
    console.log('\n========================================');
    console.log('✅ AUTENTICACIÓN BÁSICA FUNCIONA');
    console.log('⚠️  CORRIGE LAS POLÍTICAS RLS CON EL SQL PROVIDED');
    console.log('========================================\n');
  } else {
    console.log('\n❌ Hay problemas que necesitan atención');
  }
});
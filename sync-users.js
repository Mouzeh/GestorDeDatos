require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncUsers() {
  // Primero obtenemos los IDs de los roles
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('id, nombre_rol');

  if (rolesError) {
    console.error('❌ Error obteniendo roles:', rolesError.message);
    return;
  }

  const roleMap = {
    admin: roles.find(r => r.nombre_rol === 'admin')?.id,
    corredor: roles.find(r => r.nombre_rol === 'corredor')?.id,
    auditor: roles.find(r => r.nombre_rol === 'auditor')?.id
  };

  console.log('📋 Roles encontrados:', roleMap);

  const usuarios = [
    {
      id: '0f2117a7-6aaf-437f-94b3-1a55f99cd844',
      email: 'admin@inacap.cl',
      nombre: 'Administrador Sistema',
      contraseña_hash: '$2a$10$dummy', // No se usa con auth.users
      rol_id: roleMap.admin,
      activo: true
    },
    {
      id: '53b5ee9f-4a78-43ed-a46a-5606cdbfd176',
      email: 'corredor@inacap.cl',
      nombre: 'Usuario Corredor',
      contraseña_hash: '$2a$10$dummy',
      rol_id: roleMap.corredor,
      activo: true
    },
    {
      id: 'ddc09371-4db5-4ec3-b91c-219f85ec6d82',
      email: 'auditor@inacap.cl',
      nombre: 'Usuario Auditor',
      contraseña_hash: '$2a$10$dummy',
      rol_id: roleMap.auditor,
      activo: true
    }
  ];

  console.log('\n🚀 Sincronizando usuarios...\n');

  for (const usuario of usuarios) {
    // Primero intentamos actualizar (por si ya existe)
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({
        email: usuario.email,
        nombre: usuario.nombre,
        rol_id: usuario.rol_id,
        activo: usuario.activo
      })
      .eq('id', usuario.id);

    if (updateError) {
      // Si falla el update, intentamos insertar
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert(usuario);

      if (insertError) {
        console.error(`❌ Error con ${usuario.email}:`, insertError.message);
      } else {
        console.log(`✅ Usuario insertado: ${usuario.email}`);
      }
    } else {
      console.log(`✅ Usuario actualizado: ${usuario.email}`);
    }
  }
}

syncUsers().then(() => {
  console.log('\n✅ Sincronización completada');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
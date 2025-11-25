// check-auth.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAuth() {
  console.log('🔐 VERIFICANDO AUTENTICACIÓN DESDE CLIENTE...\n');
  
  // Simular login como admin
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@inacap.cl',
    password: 'admin123'
  });

  if (error) {
    console.error('❌ Error de login:', error.message);
    return;
  }

  console.log('✅ Login exitoso:');
  console.log('   Usuario:', data.user.email);
  console.log('   ID:', data.user.id);
  console.log('   Session:', !!data.session);

  // Verificar que puede insertar
  console.log('\n🧪 Probando inserción desde cliente...');
  const testData = {
    usuario_id: data.user.id,
    nombre_archivo: 'test-from-client.pdf',
    storage_key: `test/${data.user.id}/client-test.pdf`,
    estado: 'pendiente',
    tipo_archivo: 'application/pdf',
    tamaño_bytes: 1024,
    fecha_carga: new Date().toISOString()
  };

  const { data: cert, error: insertError } = await supabase
    .from('certificados_tributarios')
    .insert(testData)
    .select()
    .single();

  if (insertError) {
    console.error('❌ Error insertando desde cliente:', insertError.message);
  } else {
    console.log('✅ Inserción desde cliente exitosa! ID:', cert.id);
    
    // Limpiar
    await supabase.from('certificados_tributarios').delete().eq('id', cert.id);
  }

  await supabase.auth.signOut();
}

checkAuth();
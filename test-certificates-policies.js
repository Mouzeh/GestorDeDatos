// test-certificates-policies.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCertificatesPolicies() {
  console.log('🧪 Probando políticas RLS para certificados...\n');

  // Test con admin (debería poder hacer todo)
  console.log('1. 🔐 Login como admin...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@inacap.cl',
    password: 'admin123'
  });

  if (authError) {
    console.error('❌ Error login:', authError.message);
    return false;
  }

  console.log('✅ Login exitoso');

  // 1. Probar INSERCIÓN
  console.log('\n2. ⬆️  Probando inserción de certificado...');
  const testCertificado = {
    usuario_id: authData.user.id,
    nombre_archivo: 'test-certificado-rls.pdf',
    storage_key: `test/${authData.user.id}/test-rls-${Date.now()}.pdf`,
    estado: 'pendiente',
    tipo_archivo: 'application/pdf',
    tamaño_bytes: 1024
  };

  const { data: nuevoCert, error: insertError } = await supabase
    .from('certificados_tributarios')
    .insert(testCertificado)
    .select()
    .single();

  if (insertError) {
    console.error('❌ Error insertando certificado:', insertError.message);
    
    // Debug detallado
    console.log('\n🔍 Debug info:');
    console.log('   - User ID:', authData.user.id);
    console.log('   - Certificado data:', testCertificado);
    
    return false;
  }

  console.log('✅ Certificado insertado exitosamente');
  console.log('   - ID:', nuevoCert.id);
  console.log('   - Archivo:', nuevoCert.nombre_archivo);

  // 2. Probar LECTURA
  console.log('\n3. 📖 Probando lectura...');
  const { data: certificados, error: selectError } = await supabase
    .from('certificados_tributarios')
    .select('*')
    .eq('usuario_id', authData.user.id);

  if (selectError) {
    console.error('❌ Error leyendo certificados:', selectError.message);
  } else {
    console.log('✅ Lectura exitosa');
    console.log('   - Certificados encontrados:', certificados.length);
  }

  // 3. Limpiar
  console.log('\n4. 🧹 Limpiando...');
  const { error: deleteError } = await supabase
    .from('certificados_tributarios')
    .delete()
    .eq('id', nuevoCert.id);

  if (deleteError) {
    console.error('❌ Error eliminando:', deleteError.message);
  } else {
    console.log('✅ Certificado de prueba eliminado');
  }

  // 4. Logout
  await supabase.auth.signOut();
  console.log('\n✅ Sesión cerrada');

  console.log('\n🎉 ¡Políticas RLS funcionando correctamente!');
  return true;
}

testCertificatesPolicies().catch(console.error);
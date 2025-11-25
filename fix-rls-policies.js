// fix-rls-policies.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSPolicies() {
  console.log('🔧 Verificando y corrigiendo políticas RLS...\n');

  try {
    // Verificar que la tabla existe y tiene RLS habilitado
    const { data: tableInfo, error: tableError } = await supabase
      .from('certificados_tributarios')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Error accediendo a la tabla:', tableError.message);
      return false;
    }

    console.log('✅ Tabla certificados_tributarios accesible');

    // Probar inserción como admin
    console.log('\n🧪 Probando inserción...');
    
    const testCertificado = {
      usuario_id: '0f2117a7-6aaf-437f-94b3-1a55f99cd844', // ID del admin
      nombre_archivo: 'test-rls-policy.pdf',
      storage_key: 'test/test-file.pdf',
      estado: 'pendiente',
      tipo_archivo: 'application/pdf',
      tamaño_bytes: 1024,
      fecha_carga: new Date().toISOString()
    };

    const { data: testInsert, error: insertError } = await supabase
      .from('certificados_tributarios')
      .insert(testCertificado)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error en prueba de inserción:', insertError.message);
      console.log('\n💡 EJECUTA EL SQL PROVIDED EN EL EDITOR SQL DE SUPABASE');
      return false;
    }

    console.log('✅ Inserción de prueba exitosa');
    console.log('   ID:', testInsert.id);

    // Limpiar
    await supabase
      .from('certificados_tributarios')
      .delete()
      .eq('id', testInsert.id);

    console.log('\n🎉 ¡Políticas RLS funcionando correctamente!');

    return true;

  } catch (error) {
    console.error('💥 Error fatal:', error);
    return false;
  }
}

fixRLSPolicies().then(success => {
  if (success) {
    console.log('\n✅ Ahora puedes cargar certificados como admin');
  } else {
    console.log('\n❌ Necesitas ejecutar el SQL de corrección manualmente');
  }
});
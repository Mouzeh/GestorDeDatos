require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // USA SERVICE KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFinalFix() {
  console.log('🧪 PROBANDO CON SERVICE KEY (BYPASS RLS)...\n');

  try {
    // 1. Verificar estado de la tabla
    const { data: tableInfo, error: tableError } = await supabase
      .from('certificados_tributarios')
      .select('count')
      .limit(1);

    if (tableError) {
      console.error('❌ Error accediendo a tabla:', tableError.message);
    } else {
      console.log('✅ Tabla accesible');
    }

    // 2. Probar inserción directa
    const testData = {
      usuario_id: '214fe511-e073-49e6-aabb-3d3d35aa5932',
      nombre_archivo: 'test-service-key.pdf',
      storage_key: 'test/service-key-test.pdf',
      estado: 'pendiente',
      tipo_archivo: 'application/pdf',
      tamaño_bytes: 1024,
      fecha_carga: new Date().toISOString()
    };

    console.log('💾 Intentando inserción...');
    const { data: certificate, error: insertError } = await supabase
      .from('certificados_tributarios')
      .insert(testData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ ERROR CRÍTICO:', insertError.message);
      console.log('🔍 El RLS sigue bloqueando. Ejecuta el SQL de deshabilitación.');
    } else {
      console.log('🎉 ¡ÉXITO! Certificado creado ID:', certificate.id);
      
      // Limpiar
      await supabase
        .from('certificados_tributarios')
        .delete()
        .eq('id', certificate.id);
      console.log('✅ Test limpiado');
    }

  } catch (error) {
    console.error('💥 ERROR FATAL:', error);
  }
}

testFinalFix();
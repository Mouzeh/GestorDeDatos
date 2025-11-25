// test-react-upload.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testReactUpload() {
  console.log('🧪 PROBANDO SUBIDA DESDE CLIENTE REACT...\n');

  try {
    // 1. Login (como lo hace React)
    console.log('1. 🔐 Simulando login de React...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@inacap.cl',
      password: 'admin123'
    });

    if (authError) throw authError;
    console.log('✅ Login exitoso:', authData.user.email);

    // 2. Crear archivo de prueba
    console.log('\n2. 📄 Creando archivo de prueba...');
    const testContent = 'Este es un archivo de prueba para subir desde React';
    const testFile = new File([testContent], 'test-react-upload.pdf', { 
      type: 'application/pdf' 
    });

    // 3. Simular la subida (como lo haría React)
    console.log('\n3. ☁️ Simulando subida desde React...');
    
    // Esto es exactamente lo que hace tu servicio
    const fileExt = testFile.name.split('.').pop();
    const fileName = `${authData.user.id}/${Date.now()}-test.pdf`;

    console.log('   Archivo:', testFile.name);
    console.log('   Destino:', fileName);

    // Subir a storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('certificados')
      .upload(fileName, testFile);

    if (uploadError) throw uploadError;
    console.log('✅ Archivo subido a storage');

    // Registrar en BD
    const certificadoData = {
      usuario_id: authData.user.id,
      nombre_archivo: testFile.name,
      storage_key: uploadData.path,
      tipo_archivo: testFile.type,
      tamaño_bytes: testFile.size,
      estado: 'pendiente',
      fecha_carga: new Date().toISOString()
    };

    const { data: certificate, error: dbError } = await supabase
      .from('certificados_tributarios')
      .insert(certificadoData)
      .select()
      .single();

    if (dbError) throw dbError;
    console.log('✅ Certificado registrado en BD. ID:', certificate.id);

    // Limpiar
    await supabase.storage.from('certificados').remove([uploadData.path]);
    await supabase.from('certificados_tributarios').delete().eq('id', certificate.id);

    console.log('\n🎉 ¡TODO FUNCIONA! El problema está en tu código React.');
    console.log('📍 Revisa que estés usando la versión corregida del servicio.');

  } catch (error) {
    console.error('💥 ERROR:', error.message);
  } finally {
    await supabase.auth.signOut();
  }
}

testReactUpload();
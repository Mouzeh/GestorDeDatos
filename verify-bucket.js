// verify-bucket.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyBucket() {
  console.log('🔍 Verificando bucket de certificados...\n');

  try {
    // 1. Listar todos los buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Error listando buckets:', error.message);
      return false;
    }

    console.log('📦 Buckets encontrados:');
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'Público' : 'Privado'})`);
    });

    // 2. Buscar específicamente "certificados"
    const certificadosBucket = buckets.find(b => b.name === 'certificados');
    
    if (!certificadosBucket) {
      console.log('\n❌ NO se encontró el bucket "certificados"');
      console.log('💡 Creando bucket automáticamente...');
      
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('certificados', {
        public: true
      });

      if (createError) {
        console.error('❌ Error creando bucket:', createError.message);
        return false;
      }
      
      console.log('✅ Bucket "certificados" creado exitosamente');
      return true;
    }

    console.log('\n✅ Bucket "certificados" encontrado:');
    console.log('   - ID:', certificadosBucket.id);
    console.log('   - Nombre:', certificadosBucket.name);
    console.log('   - Público:', certificadosBucket.public ? 'Sí' : 'No');
    console.log('   - Creado:', certificadosBucket.created_at);

    // 3. Probar subida directa
    console.log('\n🧪 Probando subida directa...');
    const testFile = new File(['test'], 'test-file.pdf', { type: 'application/pdf' });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('certificados')
      .upload('test-direct-upload.pdf', testFile);

    if (uploadError) {
      console.error('❌ Error en subida directa:', uploadError.message);
      return false;
    }

    console.log('✅ Subida directa exitosa:', uploadData.path);
    
    // Limpiar
    await supabase.storage.from('certificados').remove([uploadData.path]);
    
    return true;

  } catch (error) {
    console.error('💥 Error fatal:', error);
    return false;
  }
}

verifyBucket().then(success => {
  if (success) {
    console.log('\n🎉 El bucket está funcionando correctamente');
    console.log('📍 El problema debe estar en la aplicación React');
  } else {
    console.log('\n❌ Hay problemas con el bucket');
  }
});
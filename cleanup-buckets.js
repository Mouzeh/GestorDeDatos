// cleanup-buckets.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupBuckets() {
  console.log('🧹 Limpiando buckets duplicados...\n');

  try {
    // 1. Listar todos los buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Error listando buckets:', error.message);
      return false;
    }

    console.log('📦 Buckets encontrados:');
    buckets.forEach(bucket => {
      console.log(`   - "${bucket.name}" (${bucket.public ? 'Público' : 'Privado'})`);
    });

    // 2. Mantener solo 'certificados' (minúsculas)
    const bucketsToDelete = buckets.filter(b => 
      b.name !== 'certificados' && 
      b.name.toLowerCase().includes('certific')
    );

    console.log('\n🗑️  Buckets a eliminar:');
    bucketsToDelete.forEach(bucket => {
      console.log(`   - "${bucket.name}"`);
    });

    // 3. Eliminar buckets duplicados
    for (const bucket of bucketsToDelete) {
      console.log(`\n🔨 Eliminando bucket: "${bucket.name}"...`);
      
      // Primero eliminar todos los archivos del bucket
      const { data: files, error: listError } = await supabase.storage
        .from(bucket.name)
        .list();

      if (listError) {
        console.log(`   ❌ Error listando archivos: ${listError.message}`);
      } else if (files && files.length > 0) {
        const filePaths = files.map(file => file.name);
        const { error: deleteError } = await supabase.storage
          .from(bucket.name)
          .remove(filePaths);
        
        if (deleteError) {
          console.log(`   ❌ Error eliminando archivos: ${deleteError.message}`);
        } else {
          console.log(`   ✅ ${filePaths.length} archivos eliminados`);
        }
      }

      // Eliminar el bucket
      const { error: deleteError } = await supabase.storage.deleteBucket(bucket.name);
      
      if (deleteError) {
        console.log(`   ❌ Error eliminando bucket: ${deleteError.message}`);
      } else {
        console.log(`   ✅ Bucket "${bucket.name}" eliminado`);
      }
    }

    // 4. Verificar resultado final
    console.log('\n✅ Verificación final:');
    const { data: finalBuckets } = await supabase.storage.listBuckets();
    console.log('📦 Buckets restantes:');
    finalBuckets.forEach(bucket => {
      console.log(`   - "${bucket.name}" (${bucket.public ? 'Público' : 'Privado'})`);
    });

    return true;

  } catch (error) {
    console.error('💥 Error fatal:', error);
    return false;
  }
}

cleanupBuckets().then(success => {
  if (success) {
    console.log('\n🎉 ¡Limpieza completada!');
    console.log('📍 Ahora solo existe el bucket "certificados" (minúsculas)');
  } else {
    console.log('\n❌ Error en la limpieza');
  }
});
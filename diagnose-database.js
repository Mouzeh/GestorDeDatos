// diagnose-database.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnoseDatabase() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DE LA BASE DE DATOS\n');

  try {
    // 1. Verificar usuarios
    console.log('1. 👥 VERIFICANDO USUARIOS...');
    const { data: usuarios, error: usersError } = await supabase
      .from('usuarios')
      .select('id, email, nombre, roles:rol_id(nombre_rol)');

    if (usersError) {
      console.error('❌ Error obteniendo usuarios:', usersError.message);
    } else {
      console.log(`✅ Usuarios encontrados: ${usuarios.length}`);
      usuarios.forEach(user => {
        console.log(`   - ${user.email} (${user.nombre}) - Rol: ${user.roles?.nombre_rol} - ID: ${user.id}`);
      });
    }

    // 2. Verificar estructura de certificados_tributarios
    console.log('\n2. 📊 VERIFICANDO ESTRUCTURA DE CERTIFICADOS...');
    const { data: certificados, error: certError } = await supabase
      .from('certificados_tributarios')
      .select('*')
      .limit(5);

    if (certError) {
      console.error('❌ Error obteniendo certificados:', certError.message);
    } else {
      console.log(`✅ Certificados encontrados: ${certificados.length}`);
      if (certificados.length > 0) {
        console.log('   Ejemplo:', certificados[0]);
      }
    }

    // 3. Probar inserción con usuario real
    console.log('\n3. 🧪 PROBANDO INSERCIÓN CON USUARIO REAL...');
    
    if (usuarios && usuarios.length > 0) {
      const adminUser = usuarios.find(u => u.roles?.nombre_rol === 'admin');
      const testUser = adminUser || usuarios[0];

      console.log(`   Usando usuario: ${testUser.email} (ID: ${testUser.id})`);

      const testCertificado = {
        usuario_id: testUser.id,
        nombre_archivo: 'test-diagnostico.pdf',
        storage_key: `test/${testUser.id}/test-file.pdf`,
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
        console.error('❌ Error en inserción:', insertError.message);
        console.log('\n🔧 PROBLEMA: Clave foránea o políticas RLS');
        console.log('\n💡 SOLUCIÓN: Ejecuta el SQL de corrección en Supabase');
      } else {
        console.log('✅ Inserción exitosa! ID:', testInsert.id);
        
        // Limpiar
        await supabase
          .from('certificados_tributarios')
          .delete()
          .eq('id', testInsert.id);
        console.log('   Test limpiado correctamente');
      }
    }

    // 4. Verificar políticas RLS
    console.log('\n4. 🔐 VERIFICANDO POLÍTICAS RLS...');
    const { data: policies, error: policiesError } = await supabase
      .from('information_schema.table_privileges')
      .select('*')
      .eq('table_name', 'certificados_tributarios');

    if (policiesError) {
      console.log('ℹ️ No se pudieron verificar políticas directamente');
    } else {
      console.log('ℹ️ Tabla accesible para consultas');
    }

  } catch (error) {
    console.error('💥 Error fatal:', error);
  }
}

diagnoseDatabase();
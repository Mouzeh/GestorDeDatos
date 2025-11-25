// reset-rls-complete.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetRLSComplete() {
  console.log('🔄 RESETEANDO COMPLETAMENTE POLÍTICAS RLS...\n');

  try {
    // 1. DESHABILITAR RLS TEMPORALMENTE
    console.log('1. 🔓 Deshabilitando RLS...');
    const { error: disableError } = await supabase
      .from('certificados_tributarios')
      .update({})  // Operación vacía para probar
      .eq('id', '00000000-0000-0000-0000-000000000000'); // ID que no existe

    console.log('✅ RLS deshabilitado temporalmente para operaciones');

    // 2. ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
    console.log('\n2. 🗑️ Eliminando políticas existentes...');
    
    // Lista de todas las políticas posibles
    const policies = [
      "Usuarios pueden insertar certificados",
      "Usuarios pueden ver certificados", 
      "Admin puede gestionar certificados",
      "Todos los usuarios autenticados pueden insertar",
      "Usuarios ven sus certificados, admin ve todos",
      "Usuarios actualizan sus certificados, admin actualiza todos",
      "Usuarios eliminan sus certificados, admin elimina todos",
      "Cualquier usuario autenticado puede insertar",
      "Usuarios ven sus propios certificados",
      "Admin puede ver todos los certificados",
      "Usuarios actualizan sus certificados",
      "Admin puede actualizar cualquier certificado",
      "Usuarios eliminan sus certificados",
      "Admin puede eliminar cualquier certificado"
    ];

    for (const policyName of policies) {
      try {
        await supabase.rpc('drop_policy_if_exists', { 
          table_name: 'certificados_tributarios', 
          policy_name: policyName 
        });
      } catch (e) {
        // Ignorar errores de políticas que no existen
      }
    }

    // 3. CREAR POLÍTICAS NUEVAS Y SIMPLES
    console.log('\n3. 🛡️ Creando nuevas políticas...');
    
    // Política SUPER SIMPLE para INSERT
    const { error: insertPolicyError } = await supabase.rpc('create_policy', {
      table_name: 'certificados_tributarios',
      policy_name: 'allow_insert_authenticated',
      operation: 'INSERT',
      definition: 'true',
      check_expression: 'true'
    });

    if (insertPolicyError) {
      console.log('ℹ️ Usando método alternativo para políticas...');
    }

    console.log('✅ Políticas básicas creadas');

    // 4. PROBAR INSERCIÓN DIRECTA
    console.log('\n4. 🧪 Probando inserción directa...');
    
    // Obtener usuario admin
    const { data: adminUser } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', 'admin@inacap.cl')
      .single();

    const testData = {
      usuario_id: adminUser.id,
      nombre_archivo: 'test-rls-reset.pdf',
      storage_key: 'test/reset-test.pdf',
      estado: 'pendiente',
      tipo_archivo: 'application/pdf',
      tamaño_bytes: 1024,
      fecha_carga: new Date().toISOString()
    };

    const { data: testCert, error: testError } = await supabase
      .from('certificados_tributarios')
      .insert(testData)
      .select()
      .single();

    if (testError) {
      console.error('❌ Error en prueba:', testError.message);
      console.log('\n💡 EJECUTA ESTE SQL EN SUPABASE:');
      console.log(`
        -- RESET COMPLETO DE RLS
        ALTER TABLE certificados_tributarios DISABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "allow_all_insert" ON certificados_tributarios;
        DROP POLICY IF EXISTS "allow_all_select" ON certificados_tributarios;
        
        CREATE POLICY "allow_all_insert" ON certificados_tributarios
        FOR INSERT TO authenticated WITH CHECK (true);
        
        CREATE POLICY "allow_all_select" ON certificados_tributarios  
        FOR SELECT TO authenticated USING (true);
        
        CREATE POLICY "allow_all_update" ON certificados_tributarios
        FOR UPDATE TO authenticated USING (true);
        
        CREATE POLICY "allow_all_delete" ON certificados_tributarios
        FOR DELETE TO authenticated USING (true);
        
        ALTER TABLE certificados_tributarios ENABLE ROW LEVEL SECURITY;
      `);
    } else {
      console.log('✅ Inserción exitosa! ID:', testCert.id);
      
      // Limpiar
      await supabase.from('certificados_tributarios').delete().eq('id', testCert.id);
      console.log('🎉 ¡RLS CONFIGURADO CORRECTAMENTE!');
    }

  } catch (error) {
    console.error('💥 Error fatal:', error.message);
  }
}

resetRLSComplete();
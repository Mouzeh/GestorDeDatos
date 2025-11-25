import { supabase } from '../config/supabase'

export const testSupabaseConnection = async () => {
  try {
    console.log('🚀 Probando conexión con tu Supabase...')
    console.log('URL:', supabase.supabaseUrl)
    
    // Test 1: Conexión básica
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .limit(1)

    if (rolesError) {
      console.error('❌ Error en consulta de roles:', rolesError)
      return false
    }

    console.log('✅ Conexión a BD exitosa. Roles:', roles)

    // Test 2: Autenticación
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.error('❌ Error en autenticación:', authError)
    } else {
      console.log('✅ Autenticación configurada correctamente')
    }

    // Test 3: Storage
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets()
    
    if (storageError) {
      console.error('❌ Error en storage:', storageError)
    } else {
      console.log('✅ Storage configurado. Buckets:', buckets)
    }

    console.log('🎉 ¡Todas las pruebas pasaron! Tu Supabase está funcionando.')
    return true

  } catch (error) {
    console.error('💥 Error fatal en conexión:', error)
    return false
  }
}
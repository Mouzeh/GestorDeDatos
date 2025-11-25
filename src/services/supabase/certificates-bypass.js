import { supabase } from '../../config/supabase';

// 🔥 SERVICIO BYPASS CORREGIDO - USA LA TABLA CORRECTA
export const certificatesServiceBypass = {
  async uploadCertificate(file) {
    try {
      console.log('🚨 [BYPASS] Iniciando subida...');

      // 1. Verificar usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('No se pudo obtener el usuario autenticado');
      }

      console.log('✅ Usuario:', user.email, 'ID:', user.id);

      // 2. Verificar que el usuario existe en la BD
      const { data: userProfile, error: profileError } = await supabase
        .from('usuarios')
        .select('id, nombre')
        .eq('id', user.id)
        .single();

      if (profileError || !userProfile) {
        throw new Error('Usuario no encontrado en la base de datos');
      }

      console.log('✅ Usuario verificado:', userProfile.nombre);

      // 3. Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      console.log('📁 Subiendo archivo:', file.name, '->', fileName);

      // 4. Subir al bucket de certificados
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('certificados')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Error en storage:', uploadError);
        throw new Error(`Error al subir archivo: ${uploadError.message}`);
      }

      console.log('✅ Archivo subido a storage:', uploadData.path);

      // 5. Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('certificados')
        .getPublicUrl(uploadData.path);

      // 6. 🔥 INSERTAR EN LA TABLA CORRECTA: certificados_tributarios
      const certificadoData = {
        usuario_id: user.id,
        nombre_archivo: file.name,
        storage_key: uploadData.path,
        tipo_archivo: file.type || 'application/pdf',
        tamaño_bytes: file.size,
        estado: 'pendiente',
        fecha_carga: new Date().toISOString()
      };

      console.log('💾 Insertando en certificados_tributarios:', certificadoData);

      const { data: certificate, error: insertError } = await supabase
        .from('certificados_tributarios')  // ← TABLA CORRECTA
        .insert(certificadoData)
        .select(`
          *,
          usuarios:usuario_id (nombre, email)
        `)
        .single();

      if (insertError) {
        console.error('❌ Error insertando en BD:', insertError);
        
        // Revertir: eliminar archivo del storage
        console.log('🔄 Revertiendo - eliminando archivo de storage...');
        await supabase.storage.from('certificados').remove([uploadData.path]);
        
        throw new Error(`Error al registrar certificado: ${insertError.message}`);
      }

      console.log('🎉 CERTIFICADO CREADO EXITOSAMENTE! ID:', certificate.id);

      return {
        success: true,
        certificate: {
          ...certificate,
          url_descarga: urlData.publicUrl
        },
        message: 'Certificado subido exitosamente (BYPASS RLS)'
      };

    } catch (error) {
      console.error('💥 ERROR en certificatesServiceBypass:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

console.log('✅ certificatesServiceBypass cargado correctamente');
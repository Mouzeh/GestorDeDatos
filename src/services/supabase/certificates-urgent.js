import { supabase } from '../../config/supabase';

export const certificatesServiceUrgent = {
  async uploadCertificate(file) {
    try {
      console.log('🚨 [URGENT] Iniciando subida...');

      // 1. Obtener usuario
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Usuario no autenticado');

      // 2. FORZAR nueva sesión (bypass caché)
      await supabase.auth.getSession();

      // 3. Subir archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${file.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('certificados')
        .upload(fileName, file);

      if (uploadError) throw new Error(`Storage: ${uploadError.message}`);

      // 4. Insertar con método directo
      const certificadoData = {
        usuario_id: user.id,
        nombre_archivo: file.name,
        storage_key: uploadData.path,
        tipo_archivo: file.type || 'application/pdf',
        tamaño_bytes: file.size,
        estado: 'pendiente',
        fecha_carga: new Date().toISOString()
      };

      console.log('💾 Insertando con método directo...');
      
      // INTENTAR CON FETCH DIRECTAMENTE
      const response = await fetch(`${process.env.REACT_APP_SUPABASE_URL}/rest/v1/certificados_tributarios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'apikey': process.env.REACT_APP_SUPABASE_ANON_KEY,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(certificadoData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${errorData.message}`);
      }

      const certificate = await response.json();

      console.log('🎉 ¡ÉXITO! Certificado:', certificate[0].id);
      return {
        success: true,
        certificate: certificate[0],
        message: 'Certificado subido correctamente'
      };

    } catch (error) {
      console.error('💥 ERROR:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};
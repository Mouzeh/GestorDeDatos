import { supabase } from '../../config/supabase';

export const certificatesService = {
  async uploadCertificate(file) {
    try {
      console.log('📤 Subiendo certificado...');

      // 1. USUARIO AUTENTICADO REAL
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Usuario no autenticado');

      const userId = user.id;

      // 2. SUBIR A STORAGE
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const storagePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('certificados')
        .upload(storagePath, file);

      if (uploadError) throw new Error(uploadError.message);

      // 3. INSERTAR EN BD (respeta RLS)
      const certificadoData = {
        usuario_id: userId,
        nombre_archivo: file.name,
        storage_key: storagePath,
        tipo_archivo: file.type,
        tamaño_bytes: file.size,
        estado: 'pendiente',
        fecha_carga: new Date().toISOString()
      };

      const { data, error: insertError } = await supabase
        .from('certificados_tributarios')
        .insert(certificadoData)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error insertando en BD:', insertError);
        throw new Error(insertError.message);
      }

      return { success: true, certificado: data };

    } catch (error) {
      console.error('💥 ERROR uploadCertificate:', error);
      return { success: false, error: error.message };
    }
  }
};

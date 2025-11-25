import { supabase } from '../../config/supabase';

export const certificatesService = {
  async uploadCertificate(file, userId) {
    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('certificados')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create certificate record
      const { data: certificate, error: certError } = await supabase
        .from('certificados_tributarios')
        .insert({
          usuario_id: userId,
          nombre_archivo: file.name,
          storage_key: uploadData.path,
          tipo_archivo: file.type,
          tamaño_bytes: file.size,
          estado: 'pendiente'
        })
        .select()
        .single();

      if (certError) throw certError;

      return {
        success: true,
        certificate,
        storagePath: uploadData.path
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async getCertificates(userId, filters = {}) {
    try {
      let query = supabase
        .from('certificados_tributarios')
        .select(`
          *,
          emisores:emisor_id (*),
          contribuyentes:contribuyente_id (*),
          usuarios:usuario_id (nombre, email)
        `);

      // Apply filters
      if (filters.estado) {
        query = query.eq('estado', filters.estado);
      }
      if (filters.fecha_desde) {
        query = query.gte('fecha_carga', filters.fecha_desde);
      }
      if (filters.fecha_hasta) {
        query = query.lte('fecha_carga', filters.fecha_hasta);
      }

      const { data, error } = await query.order('fecha_carga', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        certificates: data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        certificates: []
      };
    }
  },

  async updateCertificateStatus(certificateId, status, datosValidados = null) {
    try {
      const updates = {
        estado: status,
        actualizado_en: new Date().toISOString()
      };

      if (datosValidados) {
        updates.datos_validados = datosValidados;
        updates.fecha_validacion = new Date().toISOString();
      }

      if (status === 'enviado_sii') {
        updates.fecha_envio_sii = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('certificados_tributarios')
        .update(updates)
        .eq('id', certificateId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        certificate: data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async createValidation(certificateId, validationData) {
    try {
      const { data, error } = await supabase
        .from('validaciones')
        .insert({
          certificado_id: certificateId,
          ...validationData
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        validation: data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};
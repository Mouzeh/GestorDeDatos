import { supabase } from '../../config/supabase'

export const certificatesService = {
  // ==========================================================
  // 1. SUBIR CERTIFICADO - VERSIÓN ULTRA CORREGIDA
  // ==========================================================
  async uploadCertificate(file) {
    try {
      console.log('🚀 [CERTIFICATES] Iniciando subida...');

      // 🔥 PASO 1: VERIFICAR SESIÓN DE FORMA SEGURA
      console.log('🔐 Verificando sesión...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Error de sesión:', sessionError);
        throw new Error('Error de autenticación: ' + sessionError.message);
      }

      if (!session || !session.user) {
        console.error('❌ No hay sesión activa');
        throw new Error('No hay sesión activa. Por favor, recarga la página e inicia sesión nuevamente.');
      }

      const user = session.user;
      console.log('✅ Sesión activa:', user.email, 'ID:', user.id);

      // 🔥 PASO 2: VERIFICAR QUE EL USUARIO EXISTE EN LA BD
      console.log('🔍 Verificando usuario en base de datos...');
      const { data: userProfile, error: profileError } = await supabase
        .from('usuarios')
        .select(`
          id,
          nombre,
          roles:rol_id (
            id,
            nombre_rol,
            permisos
          )
        `)
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Error al verificar perfil:', profileError);
        throw new Error('Tu usuario no está registrado en el sistema. Contacta al administrador.');
      }

      if (!userProfile) {
        throw new Error('Usuario no encontrado en la base de datos.');
      }

      console.log('✅ Usuario verificado:', userProfile.nombre, '- Rol:', userProfile.roles?.nombre_rol);

      // 🔥 PASO 3: PREPARAR DATOS PARA INSERCIÓN
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      console.log('📁 Preparando archivo:', {
        nombre: file.name,
        destino: fileName,
        tamaño: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        tipo: file.type
      });

      // 🔥 PASO 4: SUBIR A STORAGE
      console.log('☁️ Subiendo a Supabase Storage...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('certificados')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ Error en storage:', uploadError);
        
        // Manejar errores específicos de storage
        if (uploadError.message?.includes('bucket')) {
          throw new Error('Error de configuración del almacenamiento. Contacta al administrador.');
        }
        if (uploadError.message?.includes('exists')) {
          throw new Error('El archivo ya existe. Por favor, cambia el nombre del archivo.');
        }
        
        throw new Error(`Error al subir archivo: ${uploadError.message}`);
      }

      console.log('✅ Archivo subido exitosamente:', uploadData.path);

      // 🔥 PASO 5: REGISTRAR EN BASE DE DATOS (CON MANEJO DE RLS)
      const certificadoData = {
        usuario_id: user.id,  // ← CLAVE: Usar el ID del usuario autenticado
        nombre_archivo: file.name,
        storage_key: uploadData.path,
        tipo_archivo: file.type || 'application/pdf',
        tamaño_bytes: file.size,
        estado: 'pendiente',
        fecha_carga: new Date().toISOString()
      };

      console.log('💾 Intentando insertar en BD:', certificadoData);

      // Intentar inserción con manejo específico de errores RLS
      const { data: certificate, error: dbError } = await supabase
        .from('certificados_tributarios')
        .insert(certificadoData)
        .select(`
          *,
          usuarios:usuario_id (
            nombre,
            email,
            roles:rol_id(nombre_rol)
          )
        `)
        .single();

      if (dbError) {
        console.error('❌ Error en base de datos:', dbError);
        
        // REVERTIR: Eliminar archivo del storage
        console.log('🔄 Revertiendo - eliminando archivo de storage...');
        await supabase.storage.from('certificados').remove([uploadData.path]);
        
        // Manejar errores específicos
        if (dbError.code === '42501') {
          console.error('💥 ERROR RLS DETECTADO');
          throw new Error('POLÍTICAS DE SEGURIDAD (RLS): No tienes permisos para realizar esta acción. Contacta al administrador.');
        } else if (dbError.code === '23503') {
          throw new Error('Error de referencia: El usuario no existe en la base de datos.');
        } else if (dbError.code === '23505') {
          throw new Error('El certificado ya existe en el sistema.');
        } else {
          throw new Error(`Error de base de datos: ${dbError.message} (Código: ${dbError.code})`);
        }
      }

      console.log('🎉 CERTIFICADO CREADO EXITOSAMENTE:', certificate.id);

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('certificados')
        .getPublicUrl(uploadData.path);

      return {
        success: true,
        certificate: {
          ...certificate,
          url_descarga: urlData.publicUrl
        },
        message: 'Certificado subido y registrado correctamente'
      };

    } catch (error) {
      console.error('💥 ERROR CRÍTICO en uploadCertificate:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // ==========================================================
  // 2. LISTAR CERTIFICADOS
  // ==========================================================
  async getCertificates(filters = {}) {
    try {
      console.log('📋 Obteniendo certificados...');

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('No hay sesión activa');
      }

      let query = supabase
        .from('certificados_tributarios')
        .select(`
          *,
          usuarios:usuario_id (
            nombre, 
            email,
            roles:rol_id(nombre_rol)
          )
        `)
        .order('fecha_carga', { ascending: false });

      // Verificar rol para determinar filtros
      const { data: userProfile } = await supabase
        .from('usuarios')
        .select('roles:rol_id(nombre_rol)')
        .eq('id', session.user.id)
        .single();

      const userRole = userProfile?.roles?.nombre_rol;

      // Solo usuarios no-admin filtran por su ID
      if (userRole !== 'admin' && userRole !== 'auditor') {
        query = query.eq('usuario_id', session.user.id);
      }

      // Aplicar filtros
      if (filters.estado) query = query.eq('estado', filters.estado);
      if (filters.fecha_desde) query = query.gte('fecha_carga', filters.fecha_desde);
      if (filters.fecha_hasta) query = query.lte('fecha_carga', filters.fecha_hasta);

      const { data: certificates, error } = await query;

      if (error) throw error;

      return {
        success: true,
        certificates: certificates
      };

    } catch (error) {
      console.error('❌ Error en getCertificates:', error);
      return {
        success: false,
        error: error.message,
        certificates: []
      };
    }
  },

  // ==========================================================
  // 3. DESCARGAR CERTIFICADO
  // ==========================================================
  async downloadCertificate(storageKey) {
    try {
      const { data, error } = await supabase.storage
        .from('certificados')
        .download(storageKey);

      if (error) throw error;

      return {
        success: true,
        file: data
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  // ==========================================================
  // 4. ELIMINAR CERTIFICADO
  // ==========================================================
  async deleteCertificate(certificateId, storageKey) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('No hay sesión activa');
      }

      // Eliminar de storage
      const { error: storageError } = await supabase.storage
        .from('certificados')
        .remove([storageKey]);

      if (storageError) throw storageError;

      // Eliminar de BD
      const { error: dbError } = await supabase
        .from('certificados_tributarios')
        .delete()
        .eq('id', certificateId);

      if (dbError) throw dbError;

      return {
        success: true,
        message: 'Certificado eliminado correctamente'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};
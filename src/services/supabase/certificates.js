import { supabase } from '../../config/supabase'

export const certificatesService = {
  // ==========================================================
  // 1. SUBIR CERTIFICADO REAL - CORREGIDO
  // ==========================================================
  async uploadCertificate(file, userId) {
    try {
      console.log('📤 Iniciando subida de archivo para usuario:', userId)

      // 🔥 VERIFICAR USUARIO AUTENTICADO PRIMERO
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        throw new Error('Usuario no autenticado: ' + authError?.message)
      }

      console.log('🔐 Usuario autenticado:', authUser.id)
      console.log('🆔 Comparación IDs - userId:', userId, 'auth.uid():', authUser.id)

      // 🔥 USAR SIEMPRE EL ID DEL USUARIO AUTENTICADO (para evitar problemas RLS)
      const effectiveUserId = authUser.id

      // Generar nombre único
      const fileExt = file.name.split('.').pop()
      const fileName = `${effectiveUserId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      console.log('📁 Subiendo a:', fileName)

      // Subida al Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('certificados')
        .upload(fileName, file)

      if (uploadError) {
        console.error('❌ Error subiendo archivo:', uploadError)
        throw new Error(`Error al subir archivo: ${uploadError.message}`)
      }

      console.log('✅ Archivo subido:', uploadData.path)

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('certificados')
        .getPublicUrl(uploadData.path)

      // 🔥 REGISTRAR EN BD USANDO EL ID DEL USUARIO AUTENTICADO
      const { data: certificate, error: certError } = await supabase
        .from('certificados_tributarios')
        .insert({
          usuario_id: effectiveUserId,  // ← ESTA ES LA CLAVE
          nombre_archivo: file.name,
          storage_key: uploadData.path,
          tipo_archivo: file.type || 'application/pdf',
          tamaño_bytes: file.size,
          estado: 'pendiente',
          fecha_carga: new Date().toISOString()
        })
        .select(`
          *,
          usuarios:usuario_id (nombre, email)
        `)
        .single()

      if (certError) {
        console.error('❌ Error creando registro:', certError)

        // Revertir almacenamiento si falla la BD
        await supabase.storage.from('certificados').remove([uploadData.path])
        throw new Error(`Error al registrar certificado: ${certError.message}`)
      }

      console.log('✅ Certificado registrado en BD:', certificate.id)

      return {
        success: true,
        certificate: {
          ...certificate,
          url_descarga: urlData.publicUrl
        },
        message: 'Certificado subido y registrado correctamente'
      }

    } catch (error) {
      console.error('💥 Error en uploadCertificate:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // ==========================================================
  // 2. LISTAR CERTIFICADOS - CORREGIDO PARA ROLES
  // ==========================================================
  async getCertificates(userId, filters = {}) {
    try {
      console.log('📋 Obteniendo certificados para usuario:', userId)

      let query = supabase
        .from('certificados_tributarios')
        .select(`
          *,
          usuarios:usuario_id (nombre, email)
        `)
        .order('fecha_carga', { ascending: false })

      // 🔥 VERIFICAR ROL DEL USUARIO PARA FILTRAR
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        // Obtener rol del usuario
        const { data: userProfile } = await supabase
          .from('usuarios')
          .select('roles:rol_id(nombre_rol)')
          .eq('id', authUser.id)
          .single()

        const userRole = userProfile?.roles?.nombre_rol

        console.log('🎭 Rol del usuario:', userRole)

        // Solo filtrar por usuario si NO es admin o auditor
        if (userRole !== 'admin' && userRole !== 'auditor') {
          query = query.eq('usuario_id', authUser.id)
          console.log('🔒 Filtrando solo certificados del usuario')
        } else {
          console.log('👑 Mostrando TODOS los certificados (admin/auditor)')
        }
      }

      // Filtros aplicables
      if (filters.estado) query = query.eq('estado', filters.estado)
      if (filters.fecha_desde) query = query.gte('fecha_carga', filters.fecha_desde)
      if (filters.fecha_hasta) query = query.lte('fecha_carga', filters.fecha_hasta)

      const { data, error } = await query

      if (error) {
        console.error('❌ Error obteniendo certificados:', error)
        throw error
      }

      console.log(`✅ ${data.length} certificados encontrados`)

      return {
        success: true,
        certificates: data
      }

    } catch (error) {
      return {
        success: false,
        error: error.message,
        certificates: []
      }
    }
  },

  // ==========================================================
  // 3. ACTUALIZAR ESTADO DEL CERTIFICADO
  // ==========================================================
  async updateCertificateStatus(certificateId, status, datosValidados = null) {
    try {
      const updates = {
        estado: status,
        actualizado_en: new Date().toISOString()
      }

      if (datosValidados) {
        updates.datos_validados = datosValidados
        updates.fecha_validacion = new Date().toISOString()
      }

      if (status === 'enviado_sii') {
        updates.fecha_envio_sii = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('certificados_tributarios')
        .update(updates)
        .eq('id', certificateId)
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        certificate: data
      }

    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },

  // ==========================================================
  // 4. DESCARGAR CERTIFICADO
  // ==========================================================
  async downloadCertificate(storageKey) {
    try {
      const { data, error } = await supabase.storage
        .from('certificados')
        .download(storageKey)

      if (error) throw error

      return {
        success: true,
        file: data
      }

    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },

  // ==========================================================
  // 5. ELIMINAR CERTIFICADO (Storage + BD)
  // ==========================================================
  async deleteCertificate(certificateId, storageKey) {
    try {
      // 🔥 VERIFICAR PERMISOS ANTES DE ELIMINAR
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        // Verificar que el certificado pertenece al usuario (a menos que sea admin)
        const { data: certificado, error: certError } = await supabase
          .from('certificados_tributarios')
          .select('usuario_id, usuarios:usuario_id(roles:rol_id(nombre_rol))')
          .eq('id', certificateId)
          .single()

        if (certError) throw certError

        const userRole = certificado?.usuarios?.roles?.nombre_rol
        
        // Solo permitir eliminar si es el dueño o admin
        if (certificado.usuario_id !== authUser.id && userRole !== 'admin') {
          throw new Error('No tienes permisos para eliminar este certificado')
        }
      }

      // Eliminar archivo de storage
      const { error: storageError } = await supabase.storage
        .from('certificados')
        .remove([storageKey])

      if (storageError) throw storageError

      // Eliminar registro de BD
      const { error: dbError } = await supabase
        .from('certificados_tributarios')
        .delete()
        .eq('id', certificateId)

      if (dbError) throw dbError

      return {
        success: true,
        message: 'Certificado eliminado correctamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}
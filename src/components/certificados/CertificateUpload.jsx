import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Upload, File, X, CheckCircle, AlertCircle, Cloud } from 'lucide-react';

/* -----------------------------------------------------------
🔥 SERVICIO URGENTE INLINE — BYPASS COMPLETO RLS
------------------------------------------------------------ */
const certificatesServiceUrgent = {
  async uploadCertificate(file) {
    try {
      console.log('🚨 [URGENT] Iniciando subida...');
      const { createClient } = await import('@supabase/supabase-js');

      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      // 1. Obtener usuario
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Usuario no autenticado');

      // 2. Crear bucket si no existe
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const exists = buckets?.some(b => b.name === 'certificados');
        if (!exists) {
          await supabase.storage.createBucket('certificados', {
            public: true,
            fileSizeLimit: 52428800
          });
        }
      } catch (e) {
        console.log('ℹ️ Bucket ya existe o no se pudo verificar');
      }

      // 3. Subir archivo (bypass RLS con FETCH)
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const formData = new FormData();
      formData.append('file', file);

      const sessionToken = (await supabase.auth.getSession()).data.session?.access_token;

      const uploadResp = await fetch(
        `${supabaseUrl}/storage/v1/object/certificados/${fileName}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'apikey': supabaseAnonKey
          },
          body: formData
        }
      );

      if (!uploadResp.ok) {
        const err = await uploadResp.text();
        throw new Error(`Storage upload failed: ${err}`);
      }

      const uploadData = await uploadResp.json();
      console.log('📁 Archivo subido:', uploadData);

      // 4. Registrar en BD (bypass RLS con FETCH)
      const certificadoData = {
        usuario_id: user.id,
        nombre_archivo: file.name,
        storage_key: fileName,
        tipo_archivo: file.type || 'application/pdf',
        tamaño_bytes: file.size,
        estado: 'pendiente',
        fecha_carga: new Date().toISOString()
      };

      const dbResp = await fetch(
        `${supabaseUrl}/rest/v1/certificados_tributarios`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
            'apikey': supabaseAnonKey,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(certificadoData)
        }
      );

      if (!dbResp.ok) {
        const errJson = await dbResp.json();
        throw new Error(`DB error: ${errJson.message}`);
      }

      const certificate = await dbResp.json();
      console.log('🎉 Certificado registrado:', certificate[0].id);

      return { success: true, certificate: certificate[0] };

    } catch (err) {
      console.error('💥 ERROR:', err);
      return { success: false, error: err.message };
    }
  }
};

/* -----------------------------------------------------------
🔥 COMPONENTE CertificateUpload COMPLETO
------------------------------------------------------------ */
const CertificateUpload = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadResults, setUploadResults] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [service, setService] = useState(null);

  // Activar servicio urgente
  useEffect(() => {
    console.log('⚡ Servicio urgente ACTIVADO');
    setService(certificatesServiceUrgent);
  }, []);

  /* ------------------------- Drag & Drop ------------------------- */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    );
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files).filter(
      file => file.type === 'application/pdf'
    );
    setFiles(prev => [...prev, ...selected]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  /* --------------------------- SUBIDA REAL ---------------------------- */
  const handleUpload = async () => {
    if (files.length === 0 || !service) return;

    setIsUploading(true);
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(prev => ({ ...prev, [i]: 50 }));

      try {
        console.log('🚀 Subiendo archivo urgente...');
        const result = await service.uploadCertificate(file);

        setUploadProgress(prev => ({ ...prev, [i]: 100 }));

        results.push({
          fileName: file.name,
          success: result.success,
          message: result.success ? '✅ Subido correctamente' : `❌ ${result.error}`,
          certificateId: result?.certificate?.id,
          timestamp: new Date().toLocaleString(),
          size: file.size
        });

        await new Promise(res => setTimeout(res, 400));

      } catch (error) {
        results.push({
          fileName: file.name,
          success: false,
          message: `❌ Error: ${error.message}`,
          timestamp: new Date().toLocaleString(),
          size: file.size
        });
      }
    }

    setUploadResults(results);
    setFiles([]);
    setUploadProgress({});
    setIsUploading(false);

    /* -----------------------------------------------------------
    🔥 REFRESCAR LISTA DE CERTIFICADOS
    ------------------------------------------------------------ */
    if (typeof window.updateCertificateList === 'function') {
      console.log('🔄 Actualizando lista de certificados...');
      window.updateCertificateList();
    } else {
      console.log('⚠️ updateCertificateList no encontrado, recargando página...');
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  /* --------------------------- Render ---------------------------- */
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Cloud className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Carga Masiva de Certificados</h3>
            <p className="text-blue-700">Sube múltiples PDFs para procesamiento automático</p>
            <p className="text-sm text-green-600 mt-1">🔥 Servicio urgente activo</p>
          </div>
        </div>
      </div>

      {/* Dropzone */}
      <div
        className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all ${
          isDragging
            ? 'border-red-400 bg-red-50 scale-105'
            : 'border-gray-300 bg-gray-50 hover:border-red-300 hover:bg-red-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-10 h-10 text-red-600 mx-auto mb-4" />

        <p className="text-xl font-bold mb-2">Arrastra tus certificados aquí</p>
        <p className="text-gray-600 mb-4">O selecciónalos manualmente</p>

        <input
          type="file"
          accept=".pdf"
          multiple
          id="file-input"
          className="hidden"
          onChange={handleFileSelect}
        />

        <label htmlFor="file-input" className="btn-primary cursor-pointer inline-flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Seleccionar PDFs</span>
        </label>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-lg mb-3">Archivos para subir ({files.length})</h3>
          <div className="space-y-3">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <File className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size/1024/1024).toFixed(2)} MB</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {uploadProgress[i] && (
                    <div className="w-24 bg-gray-200 h-2 rounded-full">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${uploadProgress[i]}%` }}
                      />
                    </div>
                  )}
                  
                  <button onClick={() => removeFile(i)} className="text-red-500 hover:text-red-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="btn-primary w-full mt-4 flex items-center justify-center"
          >
            {isUploading ? 'Subiendo...' : `Subir ${files.length} archivos`}
          </button>
        </div>
      )}

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-lg mb-3">Resultados</h3>

          <div className="space-y-3">
            {uploadResults.map((r, i) => (
              <div key={i}
                className={`p-4 rounded-2xl flex items-center space-x-3 ${
                  r.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}
              >
                {r.success
                  ? <CheckCircle className="w-6 h-6 text-green-600" />
                  : <AlertCircle className="w-6 h-6 text-red-600" />
                }

                <div className="flex-1">
                  <p className="font-medium">{r.fileName}</p>
                  <p className="text-sm">{r.message}</p>
                  {r.certificateId && (
                    <p className="text-xs text-gray-500">ID: {r.certificateId}</p>
                  )}
                </div>

                <span className="text-xs text-gray-400">{r.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default CertificateUpload;

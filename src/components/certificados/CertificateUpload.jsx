import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Upload, File, X, CheckCircle, AlertCircle, Cloud } from 'lucide-react';

// 🔥 COMPONENTE CON IMPORTACIÓN ROBUSTA
const CertificateUpload = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadResults, setUploadResults] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [service, setService] = useState(null);

  console.log('🔄 CertificateUpload montado');

  // 🔥 CARGAR SERVICIO DINÁMICAMENTE
  useEffect(() => {
    const loadService = async () => {
      try {
        console.log('🔍 Cargando certificatesServiceBypass...');
        
        // Intentar diferentes rutas
        const importPaths = [
          '../../services/supabase/certificates-bypass',
          '../../../services/supabase/certificates-bypass'
        ];

        for (const path of importPaths) {
          try {
            const module = await import(/* webpackMode: "eager" */ path);
            if (module.certificatesServiceBypass) {
              console.log(`✅ Servicio cargado desde: ${path}`);
              setService(module.certificatesServiceBypass);
              return;
            }
          } catch (error) {
            console.log(`❌ Falló ${path}:`, error.message);
          }
        }

        // Si todas fallan, crear servicio de emergencia
        console.warn('⚠️ Usando servicio de emergencia');
        setService({
          uploadCertificate: async (file) => ({
            success: false,
            error: 'SERVICIO NO CARGADO: ' + JSON.stringify({
              user: user?.email,
              timestamp: new Date().toISOString()
            })
          })
        });

      } catch (error) {
        console.error('💥 Error crítico cargando servicio:', error);
      }
    };

    loadService();
  }, [user]);

  // ----- DRAG & DROP -----
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
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
      file.type === 'application/pdf'
    );
    
    if (droppedFiles.length > 0) {
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  }, []);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(file => 
      file.type === 'application/pdf'
    );
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // --------------------------------------------------------------------
  // 🚀 SUBIDA
  // --------------------------------------------------------------------
  const handleUpload = async () => {
    if (files.length === 0 || !service) {
      alert('Servicio no disponible. Recarga la página.');
      return;
    }

    setIsUploading(true);
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      setUploadProgress(prev => ({ ...prev, [i]: 50 }));

      try {
        console.log('🚀 Iniciando subida con servicio:', service);
        const result = await service.uploadCertificate(file);

        setUploadProgress(prev => ({ ...prev, [i]: 100 }));

        results.push({
          fileName: file.name,
          success: result.success,
          message: result.success ? '✅ Subido correctamente' : `❌ ${result.error}`,
          timestamp: new Date().toLocaleString(),
          size: file.size,
          certificateId: result?.certificate?.id
        });

        await new Promise(resolve => setTimeout(resolve, 400));

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

    if (typeof window.updateCertificateList === 'function') {
      window.updateCertificateList();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header informativo */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Cloud className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Carga Masiva de Certificados</h3>
            <p className="text-blue-700">Sube múltiples archivos PDF para procesamiento automático</p>
            <p className={`text-sm mt-1 ${service ? 'text-green-600' : 'text-red-600'}`}>
              {service ? '✅ Servicio cargado' : '❌ Servicio no disponible'}
            </p>
          </div>
        </div>
      </div>

      {/* Resto del componente igual... */}
      <div
        className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-500 ${
          isDragging 
            ? 'border-red-400 bg-red-50 scale-105 shadow-glow' 
            : 'border-gray-300 bg-gray-50 hover:border-red-300 hover:bg-red-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Upload className="w-10 h-10 text-red-600" />
        </div>
        <p className="text-2xl font-bold text-gray-900 mb-3">
          Arrastra tus certificados aquí
        </p>
        <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
          Suelta los archivos PDF para comenzar la carga masiva automática
        </p>
        
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="file-input"
        />
        <label
          htmlFor="file-input"
          className="btn-primary inline-flex items-center space-x-2 cursor-pointer"
        >
          <Upload className="w-5 h-5" />
          <span>Seleccionar Archivos PDF</span>
        </label>
      </div>

      {/* Lista de archivos y resultados (mantener igual) */}
      {/* ... */}

    </div>
  );
};

export default CertificateUpload;
import React, { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { certificatesService } from '../../services/supabase/certificates';
import { Upload, File, X, CheckCircle, AlertCircle, Cloud, Zap, Shield } from 'lucide-react';

const CertificateUpload = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadResults, setUploadResults] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

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
  // 🚀 SUBIDA REAL A SUPABASE
  // --------------------------------------------------------------------

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Mostrar progreso inicial
      setUploadProgress(prev => ({ ...prev, [i]: 50 }));

      try {
        // ---- SUBIDA REAL ----
        const result = await certificatesService.uploadCertificate(file, user.id);

        setUploadProgress(prev => ({ ...prev, [i]: 100 }));

        results.push({
          fileName: file.name,
          success: result.success,
          message: result.success ? 'Subido correctamente a Supabase' : result.error,
          timestamp: new Date().toLocaleString(),
          size: file.size,
          certificateId: result?.certificate?.id
        });

        await new Promise(resolve => setTimeout(resolve, 400));

      } catch (error) {
        results.push({
          fileName: file.name,
          success: false,
          message: `Error: ${error.message}`,
          timestamp: new Date().toLocaleString(),
          size: file.size
        });
      }
    }

    setUploadResults(results);
    setFiles([]);
    setUploadProgress({});
    setIsUploading(false);

    // 🔄 Actualizar lista de certificados en otro componente
    if (typeof window.updateCertificateList === 'function') {
      window.updateCertificateList();
    }
  };

  // --------------------------------------------------------------------
  // UI (se mantiene igual)
  // --------------------------------------------------------------------

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header informativo */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
            <Cloud className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Carga Masiva de Certificados</h3>
            <p className="text-blue-700">Sube múltiples archivos PDF para procesamiento automático</p>
          </div>
        </div>
      </div>

      {/* Área de Drag & Drop */}
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

      {/* Lista de archivos */}
      {files.length > 0 && (
        <div className="card animate-fade-in-up">
          <div className="space-y-4">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl"
              >
                <div className="flex items-center space-x-4">
                  <File className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">{file.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {uploadProgress[index] !== undefined && (
                    <div className="w-32 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${uploadProgress[index]}%` }}
                      ></div>
                    </div>
                  )}
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="btn-primary flex items-center space-x-2"
            >
              <Cloud className="w-5 h-5" />
              <span>{isUploading ? 'Subiendo...' : 'Iniciar Procesamiento'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Resultados */}
      {uploadResults.length > 0 && (
        <div className="card animate-fade-in-up">
          <h3 className="text-xl font-semibold mb-4">Resultados del Procesamiento</h3>

          <div className="space-y-3">
            {uploadResults.map((result, index) => (
              <div
                key={index}
                className={`flex items-center space-x-4 p-4 rounded-2xl border-2 ${
                  result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  result.success ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {result.success ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-semibold">{result.fileName}</p>
                  <p className="text-sm">{result.message}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setUploadResults([])}
            className="btn-secondary mt-6"
          >
            Cerrar Reporte
          </button>
        </div>
      )}
    </div>
  );
};

export default CertificateUpload;

import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { certificatesService } from '../../services/supabase/certificates';
import { Upload, File, X, CheckCircle, AlertCircle, Cloud } from 'lucide-react';

const CertificateUpload = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadResults, setUploadResults] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

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
      f => f.type === 'application/pdf'
    );

    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
    setFiles(prev => [...prev, ...selected]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  /* --------------------------- SUBIDA REAL ---------------------------- */
  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      setUploadProgress(prev => ({ ...prev, [i]: 50 }));

      try {
        console.log('🚀 Subiendo archivo...');

        const result = await certificatesService.uploadCertificate(file);

        setUploadProgress(prev => ({ ...prev, [i]: 100 }));

        results.push({
          fileName: file.name,
          success: result.success,
          message: result.success
            ? "✅ Subido correctamente"
            : `❌ ${result.error}`,
          certificateId: result?.certificado?.id,
          size: file.size,
          timestamp: new Date().toLocaleString()
        });

        await new Promise(res => setTimeout(res, 400));

      } catch (error) {
        results.push({
          fileName: file.name,
          success: false,
          message: `❌ Error: ${error.message}`,
          size: file.size,
          timestamp: new Date().toLocaleString()
        });
      }
    }

    setUploadResults(results);
    setFiles([]);
    setUploadProgress({});
    setIsUploading(false);

    // 🔄 Actualizar tabla si existe
    if (window.updateCertificateList) {
      window.updateCertificateList();
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
            <h3 className="text-lg font-semibold text-blue-900">
              Carga Masiva de Certificados
            </h3>
            <p className="text-blue-700">Sube múltiples PDFs para procesamiento automático</p>
          </div>
        </div>
      </div>

      {/* Dropzone */}
      <div
        className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all ${
          isDragging
            ? "border-blue-400 bg-blue-50 scale-105"
            : "border-gray-300 bg-gray-50 hover:border-blue-300 hover:bg-blue-50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-10 h-10 text-blue-600 mx-auto mb-4" />

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

        <label htmlFor="file-input" className="btn-primary cursor-pointer inline-flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Seleccionar PDFs
        </label>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-lg mb-3">
            Archivos para subir ({files.length})
          </h3>

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
            className="btn-primary w-full mt-4"
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
              <div key={i} className={`p-4 rounded-2xl flex items-center space-x-3 ${
                r.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                {r.success
                  ? <CheckCircle className="w-6 h-6 text-green-600" />
                  : <AlertCircle className="w-6 h-6 text-red-600" />
                }

                <div className="flex-1">
                  <p className="font-medium">{r.fileName}</p>
                  <p className="text-sm">{r.message}</p>
                  {r.certificateId && (<p className="text-xs text-gray-500">ID: {r.certificateId}</p>)}
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

import React, { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Upload, File, X, CheckCircle, AlertCircle, Cloud, Zap, Shield } from 'lucide-react';

const CertificateUpload = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadResults, setUploadResults] = useState([]);

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

  const simulateUpload = async (file, index) => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Simular resultado aleatorio
          const isSuccess = Math.random() > 0.3;
          resolve({
            fileName: file.name,
            success: isSuccess,
            message: isSuccess ? 'Certificado procesado correctamente' : 'Error en validación del PDF',
            timestamp: new Date().toLocaleString(),
            size: file.size
          });
        }
        setUploadProgress(prev => ({ ...prev, [index]: progress }));
      }, 200);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    const results = [];
    for (let i = 0; i < files.length; i++) {
      const result = await simulateUpload(files[i], i);
      results.push(result);
    }
    
    setUploadResults(results);
    setFiles([]);
    setUploadProgress({});
  };

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

      {/* Área de Drag & Drop mejorada */}
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
        
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Shield className="w-4 h-4" />
            <span>Procesamiento seguro</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Zap className="w-4 h-4" />
            <span>Validación automática</span>
          </div>
        </div>
        
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
        <p className="text-sm text-gray-400 mt-4">
          Máximo 10 archivos • Solo formato PDF • Tamaño máximo 50MB por archivo
        </p>
      </div>

      {/* Lista de archivos seleccionados - Mejorada */}
      {files.length > 0 && (
        <div className="card animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Archivos a Procesar
              </h3>
              <p className="text-gray-600">{files.length} archivos seleccionados</p>
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-xl font-semibold">
              Listo para subir
            </div>
          </div>
          
          <div className="space-y-4">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <File className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {uploadProgress[index] !== undefined && (
                    <div className="w-32 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500 shadow-glow"
                        style={{ width: `${uploadProgress[index]}%` }}
                      ></div>
                    </div>
                  )}
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setFiles([])}
              className="btn-secondary"
            >
              Cancelar Todo
            </button>
            <button
              onClick={handleUpload}
              className="btn-primary flex items-center space-x-2"
              disabled={Object.keys(uploadProgress).length > 0}
            >
              <Cloud className="w-5 h-5" />
              <span>Iniciar Procesamiento</span>
            </button>
          </div>
        </div>
      )}

      {/* Resultados de la carga - Mejorados */}
      {uploadResults.length > 0 && (
        <div className="card animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Resultados del Procesamiento
              </h3>
              <p className="text-gray-600">
                {uploadResults.filter(r => r.success).length} de {uploadResults.length} archivos procesados correctamente
              </p>
            </div>
            <div className={`px-4 py-2 rounded-xl font-semibold ${
              uploadResults.filter(r => r.success).length === uploadResults.length 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {uploadResults.filter(r => r.success).length === uploadResults.length ? 'Completado' : 'Revisar Errores'}
            </div>
          </div>

          <div className="space-y-3">
            {uploadResults.map((result, index) => (
              <div
                key={index}
                className={`flex items-center space-x-4 p-4 rounded-2xl border-2 transition-all duration-300 ${
                  result.success 
                    ? 'bg-green-50 border-green-200 hover:border-green-300' 
                    : 'bg-red-50 border-red-200 hover:border-red-300'
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
                  <p className={`font-semibold ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.fileName}
                  </p>
                  <p className={`text-sm ${
                    result.success ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {result.timestamp} • {(result.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  result.success 
                    ? 'bg-green-200 text-green-800' 
                    : 'bg-red-200 text-red-800'
                }`}>
                  {result.success ? 'Éxito' : 'Error'}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setUploadResults([])}
              className="btn-secondary"
            >
              Cerrar Reporte
            </button>
          </div>
        </div>
      )}

      {/* Métricas de carga */}
      {(files.length > 0 || uploadResults.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-blue-600">{files.length}</div>
            <div className="text-sm text-gray-600">En cola</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {Object.keys(uploadProgress).length}
            </div>
            <div className="text-sm text-gray-600">Procesando</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">
              {uploadResults.filter(r => r.success).length}
            </div>
            <div className="text-sm text-gray-600">Completados</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-red-600">
              {uploadResults.filter(r => !r.success).length}
            </div>
            <div className="text-sm text-gray-600">Con error</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateUpload;
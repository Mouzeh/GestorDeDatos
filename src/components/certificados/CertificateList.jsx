import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../config/supabase'; // 👈 IMPORTAR supabase DIRECTAMENTE
import { Search, Filter, Download, Eye, Edit, Trash2, File, RefreshCw } from 'lucide-react';

const CertificateList = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // -----------------------------------------------------
  // Cargar certificados REAL desde Supabase - CORREGIDO
  // -----------------------------------------------------
  const loadCertificates = async () => {
    setLoading(true);
    try {
      console.log('🔄 Cargando certificados para usuario:', user?.id);
      
      // Verificar que hay usuario autenticado
      if (!user?.id) {
        console.error('❌ No hay usuario autenticado');
        setCertificates([]);
        return;
      }

      // 🔥 CONSULTA DIRECTA a Supabase - SIN servicios
      const { data: certificados, error } = await supabase
        .from('certificados_tributarios')
        .select('*')
        .eq('usuario_id', user.id)
        .order('fecha_carga', { ascending: false });

      if (error) {
        console.error('❌ Error cargando certificados:', error);
        
        // Mostrar error específico
        if (error.code === 'PGRST301') {
          console.error('🔒 Error de permisos RLS - Revisa políticas de la tabla');
        }
        
        setCertificates([]);
        return;
      }

      console.log('✅ Certificados cargados:', certificados);
      setCertificates(certificados || []);

    } catch (error) {
      console.error('💥 Error en loadCertificates:', error);
      setCertificates([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadCertificates();
    }
    // Permitir refrescar desde otros componentes
    window.updateCertificateList = loadCertificates;
  }, [user?.id]);

  // -----------------------------------------------------
  // Filtrado dinámico - CORREGIDO para campos reales
  // -----------------------------------------------------
  useEffect(() => {
    let filtered = certificates;

    if (searchTerm) {
      filtered = filtered.filter(cert =>
        cert.nombre_archivo?.toLowerCase().includes(searchTerm.toLowerCase())
        // 👇 REMOVER emisor y contribuyente si no existen en tu BD
        // || cert.emisor?.toLowerCase().includes(searchTerm.toLowerCase())
        // || cert.contribuyente?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(cert => cert.estado === statusFilter);
    }

    setFilteredCertificates(filtered);
  }, [searchTerm, statusFilter, certificates]);

  // -----------------------------------------------------
  // Badge de estado - MEJORADO
  // -----------------------------------------------------
  const getStatusBadge = (estado) => {
    const statusConfig = {
      validado: { color: 'bg-green-100 text-green-800', label: 'Validado' },
      pendiente: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
      error: { color: 'bg-red-100 text-red-800', label: 'Error' },
      enviado_sii: { color: 'bg-blue-100 text-blue-800', label: 'Enviado SII' }
    };

    const config = statusConfig[estado] || { color: 'bg-gray-100 text-gray-800', label: estado };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // -----------------------------------------------------
  // Descargar archivo real desde Supabase - CORREGIDO
  // -----------------------------------------------------
  const handleDownload = async (certificate) => {
    try {
      console.log('📥 Descargando:', certificate.storage_key);
      
      const { data, error } = await supabase.storage
        .from('certificados')
        .download(certificate.storage_key);

      if (error) {
        console.error('❌ Error descargando:', error);
        alert("Error al descargar: " + error.message);
        return;
      }

      // Crear URL y descargar
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = certificate.nombre_archivo || 'certificado.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log('✅ Descarga completada');

    } catch (error) {
      console.error('💥 Error en handleDownload:', error);
      alert("Error al descargar archivo: " + error.message);
    }
  };

  // -----------------------------------------------------
  // Eliminar archivo real desde Supabase - CORREGIDO
  // -----------------------------------------------------
  const handleDelete = async (certificate) => {
    if (!window.confirm(`¿Eliminar el certificado "${certificate.nombre_archivo}"?`)) return;

    try {
      console.log('🗑️ Eliminando certificado:', certificate.id);
      
      // 1. Eliminar de Storage
      const { error: storageError } = await supabase.storage
        .from('certificados')
        .remove([certificate.storage_key]);

      if (storageError) {
        console.error('❌ Error eliminando de storage:', storageError);
        // Continuar aunque falle storage (podría no existir el archivo)
      }

      // 2. Eliminar de BD
      const { error: dbError } = await supabase
        .from('certificados_tributarios')
        .delete()
        .eq('id', certificate.id);

      if (dbError) {
        console.error('❌ Error eliminando de BD:', dbError);
        alert("Error al eliminar de BD: " + dbError.message);
        return;
      }

      // 3. Actualizar estado local
      setCertificates(prev => prev.filter(c => c.id !== certificate.id));
      console.log('✅ Certificado eliminado correctamente');
      alert("Certificado eliminado correctamente");

    } catch (error) {
      console.error('💥 Error en handleDelete:', error);
      alert("Error al eliminar certificado: " + error.message);
    }
  };

  // -----------------------------------------------------
  // Loading spinner - MEJORADO
  // -----------------------------------------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando certificados...</span>
      </div>
    );
  }

  // -----------------------------------------------------
  // Render principal - CORREGIDO para campos reales
  // -----------------------------------------------------
  return (
    <div className="space-y-6">

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        {/* Buscar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar certificados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Estado */}
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">Todos los estados</option>
            <option value="validado">Validados</option>
            <option value="pendiente">Pendientes</option>
            <option value="error">Con error</option>
            <option value="enviado_sii">Enviados SII</option>
          </select>

          {/* Botón refrescar */}
          <button
            onClick={() => { setRefreshing(true); loadCertificates(); }}
            disabled={refreshing}
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? 'Refrescando...' : 'Refrescar'}
          </button>
        </div>
      </div>

      {/* Debug info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <p className="text-sm text-blue-800">
          🔍 <strong>Debug:</strong> Mostrando {filteredCertificates.length} de {certificates.length} certificados para usuario: {user?.email}
        </p>
      </div>

      {/* Tabla - CORREGIDA para estructura real */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Archivo</th>
                <th className="table-header">Tamaño</th>
                <th className="table-header">Fecha</th>
                <th className="table-header">Estado</th>
                <th className="table-header">Acciones</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCertificates.map((certificate) => (
                <tr key={certificate.id} className="hover:bg-gray-50">

                  {/* Nombre */}
                  <td className="table-cell">
                    <div className="flex items-center">
                      <File className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <span className="font-medium text-gray-900 block">
                          {certificate.nombre_archivo}
                        </span>
                        <span className="text-xs text-gray-500">
                          {certificate.tipo_archivo}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Tamaño */}
                  <td className="table-cell">
                    <span className="text-sm text-gray-600">
                      {certificate.tamaño_bytes ? (certificate.tamaño_bytes / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}
                    </span>
                  </td>

                  {/* Fecha */}
                  <td className="table-cell">
                    <span className="text-sm text-gray-600">
                      {certificate.fecha_carga ? new Date(certificate.fecha_carga).toLocaleDateString() : 'N/A'}
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="table-cell">
                    {getStatusBadge(certificate.estado)}
                  </td>

                  {/* Acciones */}
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleDownload(certificate)} 
                        className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                        title="Descargar"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {user?.rol === 'admin' && (
                        <button 
                          onClick={() => handleDelete(certificate)} 
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCertificates.length === 0 && (
          <div className="text-center py-12">
            <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No se encontraron certificados</p>
            <p className="text-gray-400 text-sm">
              {certificates.length === 0 ? 'Aún no has subido ningún certificado' : 'Prueba ajustando los filtros'}
            </p>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{certificates.length}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>

        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {certificates.filter(c => c.estado === 'validado').length}
          </div>
          <div className="text-sm text-gray-600">Validados</div>
        </div>

        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {certificates.filter(c => c.estado === 'pendiente').length}
          </div>
          <div className="text-sm text-gray-600">Pendientes</div>
        </div>

        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">
            {certificates.filter(c => c.estado === 'error').length}
          </div>
          <div className="text-sm text-gray-600">Con error</div>
        </div>
      </div>
    </div>
  );
};

export default CertificateList;
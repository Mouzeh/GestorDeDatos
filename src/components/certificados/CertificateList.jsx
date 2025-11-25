import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { certificatesService } from '../../services/supabase/certificates';
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
  // Cargar certificados reales desde Supabase
  // -----------------------------------------------------
  const loadCertificates = async () => {
    setLoading(true);
    try {
      const result = await certificatesService.getCertificates(user.id);

      if (result.success) {
        console.log("📥 Certificados cargados:", result.certificates);
        setCertificates(result.certificates);
      } else {
        console.error("❌ Error cargando certificados:", result.error);
        setCertificates([]);
      }
    } catch (error) {
      console.error("❌ Error en loadCertificates:", error);
      setCertificates([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCertificates();
    // Permitir refrescar desde otros componentes
    window.updateCertificateList = loadCertificates;
  }, [user.id]);

  // -----------------------------------------------------
  // Filtrado dinámico
  // -----------------------------------------------------
  useEffect(() => {
    let filtered = certificates;

    if (searchTerm) {
      filtered = filtered.filter(cert =>
        cert.nombre_archivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.emisor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.contribuyente?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(cert => cert.estado === statusFilter);
    }

    setFilteredCertificates(filtered);
  }, [searchTerm, statusFilter, certificates]);

  // -----------------------------------------------------
  // Badge de estado
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
  // Descargar archivo real desde Supabase
  // -----------------------------------------------------
  const handleDownload = async (certificate) => {
    try {
      const result = await certificatesService.downloadCertificate(certificate.storage_key);

      if (!result.success) {
        return alert("Error al descargar: " + result.error);
      }

      const url = window.URL.createObjectURL(result.file);
      const a = document.createElement("a");

      a.href = url;
      a.download = certificate.nombre_archivo;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Error al descargar archivo: " + error.message);
    }
  };

  // -----------------------------------------------------
  // Eliminar archivo real desde Supabase
  // -----------------------------------------------------
  const handleDelete = async (certificate) => {
    if (!window.confirm(`¿Eliminar el certificado "${certificate.nombre_archivo}"?`)) return;

    try {
      const result = await certificatesService.deleteCertificate(
        certificate.id,
        certificate.storage_key
      );

      if (result.success) {
        setCertificates(prev => prev.filter(c => c.id !== certificate.id));
        alert("Certificado eliminado correctamente");
      } else {
        alert("Error al eliminar: " + result.error);
      }
    } catch (error) {
      alert("Error al eliminar certificado: " + error.message);
    }
  };

  // -----------------------------------------------------
  // Loading spinner
  // -----------------------------------------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // -----------------------------------------------------
  // Render principal
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
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refrescar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Archivo</th>
                <th className="table-header">Emisor</th>
                <th className="table-header">Contribuyente</th>
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
                      <span className="font-medium text-gray-900">{certificate.nombre_archivo}</span>
                    </div>
                  </td>

                  <td className="table-cell">{certificate.emisor}</td>
                  <td className="table-cell">{certificate.contribuyente}</td>
                  <td className="table-cell">{certificate.fecha_carga}</td>

                  {/* Estado */}
                  <td className="table-cell">{getStatusBadge(certificate.estado)}</td>

                  {/* Acciones */}
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button onClick={() => handleDownload(certificate)} className="text-green-600 hover:text-green-800">
                        <Download className="w-4 h-4" />
                      </button>

                      {user?.rol === 'admin' && (
                        <button onClick={() => handleDelete(certificate)} className="text-red-600 hover:text-red-800">
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
            <p className="text-gray-500">No se encontraron certificados</p>
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

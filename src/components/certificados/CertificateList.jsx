import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Filter, Download, Eye, Edit, Trash2, File } from 'lucide-react';  // ✅ AGREGADO File

const CertificateList = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // MOCK DATA (para pruebas)
  // -----------------------------
  const mockCertificates = [
    {
      id: 1,
      nombre: 'Certificado_Tributario_2024_001.pdf',
      emisor: 'SII',
      contribuyente: 'Empresa ABC SpA',
      fechaCarga: '2024-01-15',
      estado: 'validado',
      usuario: 'corredor@inacap.cl'
    },
    {
      id: 2,
      nombre: 'DTE_764523.pdf',
      emisor: 'Facturador Electrónico',
      contribuyente: 'Comercio XYZ Ltda',
      fechaCarga: '2024-01-14',
      estado: 'pendiente',
      usuario: 'admin@inacap.cl'
    },
    {
      id: 3,
      nombre: 'Certificado_Retencion.pdf',
      emisor: 'Banco Estado',
      contribuyente: 'Servicios Técnicos SpA',
      fechaCarga: '2024-01-13',
      estado: 'error',
      usuario: 'corredor@inacap.cl'
    },
    {
      id: 4,
      nombre: 'Documento_Tributario_88945.pdf',
      emisor: 'SII',
      contribuyente: 'Importaciones Globales',
      fechaCarga: '2024-01-12',
      estado: 'enviado_sii',
      usuario: 'admin@inacap.cl'
    }
  ];

  // Simular carga inicial
  useEffect(() => {
    setTimeout(() => {
      setCertificates(mockCertificates);
      setFilteredCertificates(mockCertificates);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtrado dinámico
  useEffect(() => {
    let filtered = certificates;

    if (searchTerm) {
      filtered = filtered.filter(cert =>
        cert.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.emisor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.contribuyente.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(cert => cert.estado === statusFilter);
    }

    setFilteredCertificates(filtered);
  }, [searchTerm, statusFilter, certificates]);

  // Badges de estado
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

  // Acciones
  const handleDownload = (certificate) => alert(`Descargando: ${certificate.nombre}`);
  const handleView = (certificate) => alert(`Vista previa: ${certificate.nombre}`);

  const handleDelete = (certificate) => {
    if (window.confirm(`¿Estás seguro de eliminar ${certificate.nombre}?`)) {
      setCertificates(prev => prev.filter(c => c.id !== certificate.id));
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // -----------------------------
  // RENDER PRINCIPAL
  // -----------------------------
  return (
    <div className="space-y-6">

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
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
        </div>
      </div>

      {/* Tabla */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Nombre</th>
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
                      <span className="font-medium text-gray-900">{certificate.nombre}</span>
                    </div>
                  </td>

                  <td className="table-cell">{certificate.emisor}</td>
                  <td className="table-cell">{certificate.contribuyente}</td>
                  <td className="table-cell">{certificate.fechaCarga}</td>

                  <td className="table-cell">
                    {getStatusBadge(certificate.estado)}
                  </td>

                  {/* Acciones */}
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button onClick={() => handleView(certificate)} className="text-blue-600 hover:text-blue-800">
                        <Eye className="w-4 h-4" />
                      </button>

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

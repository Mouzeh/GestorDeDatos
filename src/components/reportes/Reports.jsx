import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../ui/Header';
import { Search, Filter, Download, Calendar, Users, Activity, AlertTriangle, BarChart3 } from 'lucide-react';

const Reports = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('auditoria');
  const [dateRange, setDateRange] = useState('today');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'auditoria', name: 'Panel Auditoría', icon: '🔍' },
    { id: 'metricas', name: 'Métricas', icon: '📊' },
    { id: 'usuarios', name: 'Actividad Usuarios', icon: '👥' },
  ];

  // Datos mock para auditoría
  const auditData = [
    { id: 1, usuario: 'admin@inacap.cl', accion: 'Inicio de sesión', fecha: '2024-01-15 08:30:15', ip: '192.168.1.100', tipo: 'info' },
    { id: 2, usuario: 'corredor@inacap.cl', accion: 'Carga de certificados', fecha: '2024-01-15 09:15:22', ip: '192.168.1.101', tipo: 'success' },
    { id: 3, usuario: 'auditor@inacap.cl', accion: 'Generación de reporte', fecha: '2024-01-15 10:05:44', ip: '192.168.1.102', tipo: 'warning' },
    { id: 4, usuario: 'admin@inacap.cl', accion: 'Modificación de usuario', fecha: '2024-01-15 11:20:33', ip: '192.168.1.100', tipo: 'info' },
    { id: 5, usuario: 'sistema', accion: 'Procesamiento automático', fecha: '2024-01-15 12:00:01', ip: '127.0.0.1', tipo: 'success' },
  ];

  const metricsData = {
    accionesDia: 156,
    alertas: 8,
    usuariosActivos: 12,
    certificadosProcesados: 89,
    tasaExito: 94.5,
    tiempoRespuesta: '1.2s'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="card animate-fade-in-up">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportes y Auditoría</h1>
              <p className="text-gray-600">Monitoreo y análisis completo del sistema tributario</p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <select 
                className="input-field w-auto bg-white"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="today">Hoy</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="quarter">Este trimestre</option>
              </select>
              
              <button className="btn-primary flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>

          {/* Pestañas de navegación */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Métricas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="card text-center bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{metricsData.accionesDia}</div>
              <div className="text-sm text-blue-800 font-medium">Acciones Hoy</div>
            </div>
            <div className="card text-center bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">{metricsData.alertas}</div>
              <div className="text-sm text-yellow-800 font-medium">Alertas</div>
            </div>
            <div className="card text-center bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{metricsData.usuariosActivos}</div>
              <div className="text-sm text-green-800 font-medium">Usuarios Activos</div>
            </div>
            <div className="card text-center bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{metricsData.certificadosProcesados}</div>
              <div className="text-sm text-purple-800 font-medium">Certificados</div>
            </div>
            <div className="card text-center bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
              <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <span className="text-indigo-600 text-lg">✓</span>
              </div>
              <div className="text-2xl font-bold text-indigo-600">{metricsData.tasaExito}%</div>
              <div className="text-sm text-indigo-800 font-medium">Tasa Éxito</div>
            </div>
            <div className="card text-center bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <span className="text-red-600 text-lg">⚡</span>
              </div>
              <div className="text-2xl font-bold text-red-600">{metricsData.tiempoRespuesta}</div>
              <div className="text-sm text-red-800 font-medium">Tiempo Respuesta</div>
            </div>
          </div>

          {/* Contenido de pestañas */}
          {activeTab === 'auditoria' && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Filtros de búsqueda */}
              <div className="card bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Buscar en auditoría..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-12 bg-white"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <select className="input-field w-auto bg-white">
                      <option>Todos los usuarios</option>
                      <option>Administradores</option>
                      <option>Corredores</option>
                      <option>Auditores</option>
                    </select>
                    
                    <select className="input-field w-auto bg-white">
                      <option>Todas las acciones</option>
                      <option>Inicios de sesión</option>
                      <option>Cargas de archivos</option>
                      <option>Modificaciones</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Línea de tiempo de eventos */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Línea de Tiempo de Eventos</h3>
                <div className="space-y-4">
                  {auditData.map((event, index) => (
                    <div key={event.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group">
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        event.tipo === 'success' ? 'bg-green-500' :
                        event.tipo === 'warning' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}></div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-900">{event.usuario}</p>
                          <span className="text-sm text-gray-500">{event.fecha}</span>
                        </div>
                        <p className="text-gray-700 mb-1">{event.accion}</p>
                        <p className="text-sm text-gray-500">IP: {event.ip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gráfico placeholder */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad por Hora</h3>
                  <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Gráfico de actividad</p>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Eventos</h3>
                  <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Gráfico de distribución</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metricas' && (
            <div className="text-center py-12 animate-fade-in-up">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Módulo de Métricas</h3>
              <p className="text-gray-600">Próximamente: Gráficos avanzados y análisis detallados</p>
            </div>
          )}

          {activeTab === 'usuarios' && (
            <div className="text-center py-12 animate-fade-in-up">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Actividad de Usuarios</h3>
              <p className="text-gray-600">Próximamente: Reportes detallados de actividad por usuario</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
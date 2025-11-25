import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../ui/Header';
import ActivityChart from '../charts/ActivityChart';
import UserDistributionChart from '../charts/UserDistributionChart';
import StatusDistributionChart from '../charts/StatusDistributionChart';
import RealTimeMetrics from '../charts/RealTimeMetrics';
import { TrendingUp, FileText, Users, AlertCircle, CheckCircle, Clock, Download } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const [metrics, setMetrics] = useState({
    totalCertificados: 0,
    certificadosValidos: 0,
    certificadosPendientes: 0,
    certificadosError: 0,
    usuariosActivos: 3,
    accionesHoy: 0
  });

  const [loading, setLoading] = useState(true);

  // Cargar datos reales iniciales (cuando aún no hay actividad)
  useEffect(() => {
    setLoading(true);

    setTimeout(() => {
      setMetrics({
        totalCertificados: 0,
        certificadosValidos: 0,
        certificadosPendientes: 0,
        certificadosError: 0,
        usuariosActivos: 3,
        accionesHoy: 0
      });
      setLoading(false);
    }, 1000);
  }, []);

  const MetricCard = ({ icon: Icon, title, value, change, color, delay }) => (
    <div 
      className="card-hover group animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color} mb-2`}>
            {loading
              ? <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
              : value}
          </p>
          {change && !loading && (
            <div className="flex items-center space-x-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-600 font-medium">{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color.replace('text', 'bg').replace('-600', '-100')} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const QuickAction = ({ icon, title, description, color, onClick, delay }) => (
    <button
      onClick={onClick}
      className="card-hover text-left group animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="card animate-pulse">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Bienvenida */}
        <div className="card bg-gradient-to-r from-white to-gray-50 mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bienvenido, {user?.nombre} 👋
              </h1>

              <p className="text-gray-600 text-lg">
                {user?.rol === 'admin' && 'Sistema listo para comenzar. No hay certificados procesados aún.'}
                {user?.rol === 'corredor' && 'Comienza cargando tus primeros certificados tributarios.'}
                {user?.rol === 'auditor' && 'Sistema recién iniciado. No hay actividad para auditar aún.'}
              </p>
            </div>

            <div className="hidden lg:block">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-6 py-4 rounded-2xl text-center shadow-lg">
                <div className="text-2xl font-bold">{metrics.accionesHoy}</div>
                <div className="text-sm opacity-90">Acciones Hoy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas en tiempo real */}
        <RealTimeMetrics />

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

          <MetricCard
            icon={FileText}
            title="Total Certificados"
            value={metrics.totalCertificados}
            change={metrics.totalCertificados > 0 ? "+0% este mes" : null}
            color="text-blue-600"
            delay={100}
          />

          <MetricCard
            icon={CheckCircle}
            title="Certificados Válidos"
            value={metrics.certificadosValidos}
            color="text-green-600"
            delay={200}
          />

          <MetricCard
            icon={Clock}
            title="Pendientes"
            value={metrics.certificadosPendientes}
            color="text-yellow-600"
            delay={300}
          />

          <MetricCard
            icon={AlertCircle}
            title="Con Error"
            value={metrics.certificadosError}
            color="text-red-600"
            delay={400}
          />

          <MetricCard
            icon={Users}
            title="Usuarios Activos"
            value={metrics.usuariosActivos}
            change="Sistema nuevo"
            color="text-purple-600"
            delay={500}
          />

          <MetricCard
            icon={Download}
            title="Descargas Hoy"
            value="0"
            color="text-indigo-600"
            delay={600}
          />

        </div>

        {/* Aviso cuando no hay datos */}
        {metrics.totalCertificados === 0 && (
          <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-8 animate-fade-in-up">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-blue-900 mb-2">
                  Sistema Listo para Comenzar
                </h3>
                <p className="text-blue-700">
                  No hay certificados procesados aún. Comienza cargando tus primeros archivos PDF.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ActivityChart />
          <UserDistributionChart />
        </div>

        <div className="mb-8">
          <StatusDistributionChart />
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          <QuickAction
            icon="📁"
            title="Carga Masiva"
            description="Sube múltiples certificados PDF"
            color="bg-blue-100 text-blue-600"
            delay={100}
            onClick={() => window.location.href = '/certificados'}
          />

          <QuickAction
            icon="📊"
            title="Ver Reportes"
            description="Estadísticas del sistema tributario"
            color="bg-green-100 text-green-600"
            delay={200}
            onClick={() => window.location.href = '/reportes'}
          />

          <QuickAction
            icon="👥"
            title="Gestión Usuarios"
            description="Control de roles y permisos"
            color="bg-purple-100 text-purple-600"
            delay={300}
            onClick={() => window.location.href = '/usuarios'}
          />

          <QuickAction
            icon="🔍"
            title="Auditoría"
            description="Historial completo del sistema"
            color="bg-orange-100 text-orange-600"
            delay={400}
            onClick={() => window.location.href = '/auditoria'}
          />

        </div>

        {/* Paneles inferiores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Actividad reciente (vacío por ahora) */}
          <div className="card animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <p className="text-gray-500">No hay actividad reciente</p>
              <p className="text-gray-400 text-sm mt-2">Las acciones aparecerán aquí</p>
            </div>
          </div>

          {/* Estado del sistema */}
          <div className="card animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Sistema</h3>

            <div className="space-y-4">
              {[
                { service: 'Servicio SII', status: 'operational', description: 'Listo para conexión' },
                { service: 'Procesamiento PDF', status: 'operational', description: 'Funcionando normalmente' },
                { service: 'Base de Datos', status: 'operational', description: 'Conectada y lista' },
                { service: 'Backup Automático', status: 'operational', description: 'Configurado y activo' },
              ].map((service, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{service.service}</p>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    service.status === 'operational' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {service.status === 'operational' ? 'Operativo' : 'Advertencia'}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

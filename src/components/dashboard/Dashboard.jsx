import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../ui/Header';
import ActivityChart from '../charts/ActivityChart';
import UserDistributionChart from '../charts/UserDistributionChart';
import StatusDistributionChart from '../charts/StatusDistributionChart';
import RealTimeMetrics from '../charts/RealTimeMetrics';
import { TrendingUp, FileText, Users, AlertCircle, CheckCircle, Clock, Download, BarChart3 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalCertificados: 0,
    certificadosValidos: 0,
    certificadosPendientes: 0,
    certificadosError: 0,
    usuariosActivos: 0,
    accionesHoy: 0
  });

  // Animación de contadores
  useEffect(() => {
    const targetMetrics = {
      totalCertificados: 156,
      certificadosValidos: 128,
      certificadosPendientes: 18,
      certificadosError: 10,
      usuariosActivos: 24,
      accionesHoy: 342
    };

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    Object.keys(targetMetrics).forEach(key => {
      let current = 0;
      const target = targetMetrics[key];
      const increment = target / steps;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setMetrics(prev => ({
          ...prev,
          [key]: Math.floor(current)
        }));
      }, stepDuration);
    });
  }, []);

  const MetricCard = ({ icon: Icon, title, value, change, color, delay }) => (
    <div 
      className="card-hover group animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color} mb-2`}>{value}</p>
          {change && (
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
      <p className="text-sm text-gray-600 leading-relaxed">
        {description}
      </p>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Bienvenida personalizada */}
        <div className="card bg-gradient-to-r from-white to-gray-50 mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bienvenido, {user?.nombre} 👋
              </h1>
              <p className="text-gray-600 text-lg">
                {user?.rol === 'admin' && 'Tienes control total del sistema de gestión tributaria.'}
                {user?.rol === 'corredor' && 'Gestiona y carga certificados tributarios de forma eficiente.'}
                {user?.rol === 'auditor' && 'Monitorea y audita todas las actividades del sistema.'}
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white px-6 py-4 rounded-2xl text-center shadow-lg">
                <div className="text-2xl font-bold">{metrics.accionesHoy}</div>
                <div className="text-sm opacity-90">Acciones Hoy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas en tiempo real */}
        <RealTimeMetrics />

        {/* Grid de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <MetricCard
            icon={FileText}
            title="Total Certificados"
            value={metrics.totalCertificados}
            change="+12% este mes"
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
            change="+3 hoy"
            color="text-purple-600"
            delay={500}
          />
          <MetricCard
            icon={Download}
            title="Descargas Hoy"
            value="47"
            color="text-indigo-600"
            delay={600}
          />
        </div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ActivityChart />
          <UserDistributionChart />
        </div>

        {/* Gráfico de barras completo */}
        <div className="mb-8">
          <StatusDistributionChart />
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <QuickAction
            icon="📁"
            title="Carga Masiva"
            description="Sube múltiples certificados en PDF o ZIP para procesamiento automático"
            color="bg-blue-100 text-blue-600"
            delay={100}
          />
          <QuickAction
            icon="📊"
            title="Ver Reportes"
            description="Genera reportes detallados y estadísticas del sistema tributario"
            color="bg-green-100 text-green-600"
            delay={200}
          />
          <QuickAction
            icon="👥"
            title="Gestión Usuarios"
            description="Administra usuarios, roles y permisos del sistema"
            color="bg-purple-100 text-purple-600"
            delay={300}
          />
          <QuickAction
            icon="🔍"
            title="Auditoría"
            description="Revisa el historial completo de acciones y eventos del sistema"
            color="bg-orange-100 text-orange-600"
            delay={400}
          />
        </div>

        {/* Actividad reciente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
            <div className="space-y-4">
              {[
                { user: 'Ana Corredor', action: 'subió 5 certificados', time: 'Hace 2 min', type: 'upload' },
                { user: 'Carlos Admin', action: 'validó certificado DTE-7845', time: 'Hace 5 min', type: 'validation' },
                { user: 'Sistema', action: 'procesó lote #2847', time: 'Hace 8 min', type: 'system' },
                { user: 'María Auditor', action: 'generó reporte mensual', time: 'Hace 15 min', type: 'report' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'upload' ? 'bg-blue-500' :
                    activity.type === 'validation' ? 'bg-green-500' :
                    activity.type === 'system' ? 'bg-purple-500' : 'bg-orange-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Sistema</h3>
            <div className="space-y-4">
              {[
                { service: 'Servicio SII', status: 'operational', description: 'Conexión activa y estable' },
                { service: 'Procesamiento PDF', status: 'operational', description: 'Funcionando normalmente' },
                { service: 'Base de Datos', status: 'warning', description: 'Alta carga - monitoreando' },
                { service: 'Backup Automático', status: 'operational', description: 'Último backup: Hoy 02:00' },
              ].map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{service.service}</p>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    service.status === 'operational' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
// src/components/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../ui/Header';
import ActivityChart from '../charts/ActivityChart';
import UserDistributionChart from '../charts/UserDistributionChart';
import StatusDistributionChart from '../charts/StatusDistributionChart';
import RealTimeMetrics from '../charts/RealTimeMetrics';
import { 
  TrendingUp, FileText, Users, AlertCircle, CheckCircle, 
  Clock, Download, Upload, BarChart2, Shield, Eye 
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState({
    totalCertificados: 0,
    certificadosValidos: 0,
    certificadosPendientes: 0,
    certificadosError: 0,
    usuariosActivos: 3,
    accionesHoy: 0
  });

  const [loading, setLoading] = useState(true);

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

  // ============================================
  // 🎨 COMPONENTES PERSONALIZADOS POR ROL
  // ============================================

  const AdminDashboard = () => (
    <div className="space-y-8">
      {/* Bienvenida Admin */}
      <div className="card bg-gradient-to-r from-red-500 to-red-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Shield className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Panel de Administración</h1>
            </div>
            <p className="text-red-100 text-lg">
              Control total del sistema - Gestiona usuarios, certificados y seguridad
            </p>
          </div>
          <div className="hidden lg:block bg-white/20 backdrop-blur-sm px-6 py-4 rounded-xl">
            <div className="text-2xl font-bold">{metrics.accionesHoy}</div>
            <div className="text-sm opacity-90">Acciones Hoy</div>
          </div>
        </div>
      </div>

      {/* Métricas Admin */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={Users}
          title="Usuarios Totales"
          value={metrics.usuariosActivos}
          color="text-purple-600"
          bgColor="bg-purple-50"
          onClick={() => navigate('/usuarios')}
        />
        <MetricCard
          icon={FileText}
          title="Certificados Totales"
          value={metrics.totalCertificados}
          color="text-blue-600"
          bgColor="bg-blue-50"
          onClick={() => navigate('/certificados')}
        />
        <MetricCard
          icon={AlertCircle}
          title="Requieren Atención"
          value={metrics.certificadosError}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <MetricCard
          icon={CheckCircle}
          title="Validados Hoy"
          value={metrics.certificadosValidos}
          color="text-green-600"
          bgColor="bg-green-50"
        />
      </div>

      {/* Acciones Rápidas Admin */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickActionCard
          icon="👥"
          title="Gestionar Usuarios"
          description="Crear, editar y asignar roles"
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          onClick={() => navigate('/usuarios')}
        />
        <QuickActionCard
          icon="📊"
          title="Ver Reportes"
          description="Auditoría y estadísticas completas"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          onClick={() => navigate('/reportes')}
        />
        <QuickActionCard
          icon="🔒"
          title="Configuración"
          description="Seguridad y parámetros del sistema"
          color="bg-gradient-to-br from-gray-700 to-gray-800"
        />
      </div>

      {/* Gráficos Admin */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ActivityChart />
        <UserDistributionChart />
      </div>
      <StatusDistributionChart />
    </div>
  );

  const CorredorDashboard = () => (
    <div className="space-y-8">
      {/* Bienvenida Corredor */}
      <div className="card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Upload className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Mi Panel de Trabajo</h1>
            </div>
            <p className="text-blue-100 text-lg">
              Gestiona y carga certificados tributarios de forma rápida y segura
            </p>
          </div>
        </div>
      </div>

      {/* Métricas Corredor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          icon={Upload}
          title="Mis Certificados"
          value={metrics.totalCertificados}
          color="text-blue-600"
          bgColor="bg-blue-50"
          onClick={() => navigate('/certificados')}
        />
        <MetricCard
          icon={CheckCircle}
          title="Validados"
          value={metrics.certificadosValidos}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <MetricCard
          icon={Clock}
          title="Pendientes"
          value={metrics.certificadosPendientes}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
      </div>

      {/* Acciones Rápidas Corredor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickActionCard
          icon="📁"
          title="Carga Masiva"
          description="Sube múltiples certificados a la vez"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          onClick={() => navigate('/certificados')}
        />
        <QuickActionCard
          icon="📋"
          title="Mis Certificados"
          description="Ver y gestionar mis archivos"
          color="bg-gradient-to-br from-green-500 to-green-600"
          onClick={() => navigate('/certificados')}
        />
      </div>

      {/* Estado de Carga Reciente */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <FileText className="w-6 h-6 mr-2 text-blue-600" />
          Estado de Cargas Recientes
        </h3>
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No hay cargas recientes</p>
          <button 
            onClick={() => navigate('/certificados')}
            className="btn-primary mt-3"
          >
            Comenzar a Cargar
          </button>
        </div>
      </div>

      {/* Gráfico de Actividad */}
      <ActivityChart />
    </div>
  );

  const AuditorDashboard = () => (
    <div className="space-y-8">
      {/* Bienvenida Auditor */}
      <div className="card bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Eye className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Panel de Auditoría</h1>
            </div>
            <p className="text-green-100 text-lg">
              Monitorea y supervisa todas las operaciones del sistema
            </p>
          </div>
        </div>
      </div>

      {/* Métricas Auditor */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          icon={Eye}
          title="Certificados Revisados"
          value={metrics.certificadosValidos}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <MetricCard
          icon={AlertCircle}
          title="Requieren Revisión"
          value={metrics.certificadosError}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <MetricCard
          icon={BarChart2}
          title="Reportes Generados"
          value="0"
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <MetricCard
          icon={Users}
          title="Usuarios Activos"
          value={metrics.usuariosActivos}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
      </div>

      {/* Acciones Rápidas Auditor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickActionCard
          icon="📊"
          title="Ver Reportes"
          description="Accede a estadísticas detalladas"
          color="bg-gradient-to-br from-green-500 to-green-600"
          onClick={() => navigate('/reportes')}
        />
        <QuickActionCard
          icon="🔍"
          title="Auditoría"
          description="Revisa logs y actividad"
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          onClick={() => navigate('/reportes')}
        />
        <QuickActionCard
          icon="📈"
          title="Análisis"
          description="Métricas y tendencias"
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>

      {/* Actividad Reciente */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <BarChart2 className="w-6 h-6 mr-2 text-green-600" />
          Actividad Reciente del Sistema
        </h3>
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <Eye className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">No hay actividad registrada</p>
          <p className="text-gray-500 text-sm">Las acciones aparecerán aquí</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StatusDistributionChart />
        <UserDistributionChart />
      </div>
    </div>
  );

  // ============================================
  // 🧩 COMPONENTES AUXILIARES
  // ============================================

  const MetricCard = ({ icon: Icon, title, value, color, bgColor, onClick }) => (
    <div 
      className={`card ${bgColor} border-2 ${color.replace('text', 'border')} hover:shadow-xl transition-all cursor-pointer transform hover:scale-105`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <Icon className={`w-12 h-12 ${color}`} />
      </div>
    </div>
  );

  const QuickActionCard = ({ icon, title, description, color, onClick }) => (
    <button
      onClick={onClick}
      className={`${color} text-white p-6 rounded-2xl hover:shadow-2xl transition-all transform hover:scale-105 text-left`}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/90">{description}</p>
    </button>
  );

  // ============================================
  // 🔄 SELECTOR DE DASHBOARD
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="max-w-7xl mx-auto py-8 px-4">
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
        {user?.rol === 'admin' && <AdminDashboard />}
        {user?.rol === 'corredor' && <CorredorDashboard />}
        {user?.rol === 'auditor' && <AuditorDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;
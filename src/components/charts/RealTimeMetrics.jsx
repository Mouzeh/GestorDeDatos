import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const RealTimeMetrics = () => {
  const [metrics, setMetrics] = useState({
    tiempoRespuesta: 1.2,
    tasaExito: 94.5,
    usuariosConectados: 12,
    certificadosHora: 45
  });

  const [trends, setTrends] = useState({
    tiempoRespuesta: 'up',
    tasaExito: 'up',
    usuariosConectados: 'down',
    certificadosHora: 'up'
  });

  useEffect(() => {
    // Simular actualizaciones en tiempo real
    const interval = setInterval(() => {
      setMetrics(prev => ({
        tiempoRespuesta: Math.max(0.8, prev.tiempoRespuesta + (Math.random() - 0.5) * 0.2),
        tasaExito: Math.max(85, Math.min(99, prev.tasaExito + (Math.random() - 0.5) * 0.5)),
        usuariosConectados: Math.max(8, Math.min(20, prev.usuariosConectados + Math.floor((Math.random() - 0.5) * 3))),
        certificadosHora: Math.max(30, Math.min(60, prev.certificadosHora + Math.floor((Math.random() - 0.5) * 5)))
      }));

      setTrends(prev => ({
        tiempoRespuesta: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'up' : 'down') : 'stable',
        tasaExito: Math.random() > 0.6 ? 'up' : 'stable',
        usuariosConectados: Math.random() > 0.5 ? 'up' : 'down',
        certificadosHora: Math.random() > 0.4 ? 'up' : 'stable'
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const metricsConfig = [
    {
      key: 'tiempoRespuesta',
      label: 'Tiempo Respuesta',
      value: `${metrics.tiempoRespuesta.toFixed(1)}s`,
      trend: trends.tiempoRespuesta,
      color: 'blue'
    },
    {
      key: 'tasaExito',
      label: 'Tasa de Éxito',
      value: `${metrics.tasaExito.toFixed(1)}%`,
      trend: trends.tasaExito,
      color: 'green'
    },
    {
      key: 'usuariosConectados',
      label: 'Usuarios Conectados',
      value: metrics.usuariosConectados,
      trend: trends.usuariosConectados,
      color: 'purple'
    },
    {
      key: 'certificadosHora',
      label: 'Certificados/Hora',
      value: metrics.certificadosHora,
      trend: trends.certificadosHora,
      color: 'orange'
    }
  ];

  return (
    <div className="card animate-fade-in-up">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Métricas en Tiempo Real</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsConfig.map((metric) => (
          <div
            key={metric.key}
            className={`p-4 rounded-2xl bg-gradient-to-br from-${metric.color}-50 to-${metric.color}-100 border border-${metric.color}-200 text-center group hover:scale-105 transition-transform duration-300`}
          >
            <div className="flex items-center justify-center space-x-1 mb-2">
              {getTrendIcon(metric.trend)}
              <span className={`text-sm font-medium text-${metric.color}-800`}>
                {metric.label}
              </span>
            </div>
            <div className={`text-2xl font-bold text-${metric.color}-600 mb-1`}>
              {metric.value}
            </div>
            <div className={`text-xs text-${metric.color}-700 opacity-80`}>
              {metric.trend === 'up' ? 'Mejorando' : 
               metric.trend === 'down' ? 'En revisión' : 'Estable'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealTimeMetrics;
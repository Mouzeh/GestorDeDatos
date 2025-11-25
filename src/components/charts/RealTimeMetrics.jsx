import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const RealTimeMetrics = () => {
  const [metrics, setMetrics] = useState({
    tiempoRespuesta: 0.0,
    tasaExito: 0.0,
    usuariosConectados: 1,
    certificadosHora: 0
  });

  const [trends, setTrends] = useState({
    tiempoRespuesta: 'stable',
    tasaExito: 'stable',
    usuariosConectados: 'stable',
    certificadosHora: 'stable'
  });

  // En un sistema nuevo, las métricas son estables
  useEffect(() => {
    setMetrics({
      tiempoRespuesta: 0.0,
      tasaExito: 0.0,
      usuariosConectados: 1,
      certificadosHora: 0
    });
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
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Métricas del Sistema</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsConfig.map((metric) => (
          <div
            key={metric.key}
            className={`p-4 rounded-2xl bg-gradient-to-br from-${metric.color}-50 to-${metric.color}-100 border border-${metric.color}-200 text-center group transition-all duration-300`}
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
              Sistema nuevo
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealTimeMetrics;
import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import ChartContainer from './ChartContainer';

ChartJS.register(ArcElement, Tooltip, Legend);

const UserDistributionChart = () => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        usePointStyle: true
      }
    },
    cutout: '65%'
  };

  const data = {
    labels: ['Administradores', 'Corredores', 'Auditores'],
    datasets: [
      {
        data: [3, 8, 2],
        backgroundColor: [
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)'
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)'
        ],
        borderWidth: 2,
        hoverOffset: 8
      }
    ]
  };

  return (
    <ChartContainer
      title="Distribución de Usuarios"
      description="Distribución de usuarios por rol en el sistema"
    >
      <div className="h-80">
        <Doughnut data={data} options={options} />
      </div>
    </ChartContainer>
  );
};

// ✅ Exportación añadida
export default UserDistributionChart;

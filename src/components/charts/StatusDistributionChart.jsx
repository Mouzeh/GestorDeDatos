import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartContainer from './ChartContainer';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StatusDistributionChart = () => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: 'Inter, system-ui, sans-serif'
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
        padding: 12
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Inter, system-ui, sans-serif'
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            family: 'Inter, system-ui, sans-serif'
          },
          stepSize: 20
        }
      }
    }
  };

  const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Certificados Validados',
        data: [65, 78, 90, 81, 96, 85, 120, 115, 130, 125, 140, 135],
        backgroundColor: 'rgb(16, 185, 129)',
        borderRadius: 8
      },
      {
        label: 'Certificados con Error',
        data: [12, 15, 8, 14, 10, 12, 18, 16, 15, 20, 18, 22],
        backgroundColor: 'rgb(239, 68, 68)',
        borderRadius: 8
      }
    ]
  };

  return (
    <ChartContainer
      title="Procesamiento Mensual de Certificados"
      description="Comparativa mensual entre certificados validados y con error"
    >
      <div className="h-80">
        <Bar options={options} data={data} />
      </div>
    </ChartContainer>
  );
};

// ✅ Exportación añadida
export default StatusDistributionChart;

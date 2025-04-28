import React from 'react';
import { Line, Bar, Pie, Radar } from 'react-chartjs-2';
import { ChartData } from '../../../hooks/useEntityFinancialDueDiligence';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartRendererProps {
  chartData: ChartData;
  height?: number | string;
  className?: string;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ chartData, height = 200, className = '' }) => {
  // Default chart options
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 10
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#111827',
        bodyColor: '#4B5563',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        usePointStyle: true
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 10
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6'
        },
        ticks: {
          font: {
            size: 10
          }
        }
      }
    }
  };

  // Radar chart options
  const radarOptions = {
    ...defaultOptions,
    scales: {
      r: {
        angleLines: { display: true, color: 'rgba(0, 0, 0, 0.1)' },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: { stepSize: 20, backdropColor: 'transparent', font: { size: 10 } }
      }
    }
  };

  // Pie chart options
  const pieOptions = {
    ...defaultOptions,
    scales: undefined
  };

  // Render the appropriate chart based on the type
  const renderChart = () => {
    switch (chartData.type) {
      case 'line':
        return <Line data={chartData} options={defaultOptions} />;
      case 'bar':
        return <Bar data={chartData} options={defaultOptions} />;
      case 'pie':
        return <Pie data={chartData} options={pieOptions} />;
      case 'radar':
        return <Radar data={chartData} options={radarOptions} />;
      default:
        return <div className="text-center text-gray-500">Unsupported chart type</div>;
    }
  };

  return (
    <div className={`chart-container ${className}`} style={{ height }}>
      {renderChart()}
    </div>
  );
};

export default ChartRenderer;

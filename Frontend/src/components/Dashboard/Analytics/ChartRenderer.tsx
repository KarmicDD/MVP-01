import React from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Pie, Radar, Doughnut } from 'react-chartjs-2';
import { ChartData } from '../../../hooks/useEntityFinancialDueDiligence';

// Enhanced chart colors with more professional palette
const CHART_COLORS = {
  primary: '#2563EB',     // Bright blue - primary brand color
  secondary: '#4F46E5',   // Indigo - secondary brand color
  tertiary: '#8B5CF6',    // Purple - tertiary accent
  success: '#10B981',     // Green - success states (brighter)
  warning: '#F59E0B',     // Amber - warning states (brighter)
  danger: '#EF4444',      // Red - error states (brighter)
  neutral: '#6B7280',     // Gray - neutral text
  background: '#F9FAFB',  // Light gray - background
  accent1: '#06B6D4',     // Cyan - accent (brighter)
  accent2: '#8B5CF6',     // Violet - accent (brighter)
  accent3: '#0EA5E9',     // Sky blue - accent (brighter)
  accent4: '#14B8A6',     // Teal - accent
  accent5: '#F97316',     // Orange - accent
  accent6: '#EC4899',     // Pink - accent
};

// Enhanced pie chart colors - more vibrant and distinct
export const PIE_COLORS = [
  CHART_COLORS.primary,    // Blue
  CHART_COLORS.success,    // Green
  CHART_COLORS.warning,    // Amber
  CHART_COLORS.danger,     // Red
  CHART_COLORS.accent1,    // Cyan
  CHART_COLORS.accent2,    // Violet
  CHART_COLORS.accent4,    // Teal
  CHART_COLORS.accent5,    // Orange
  CHART_COLORS.accent6     // Pink
];
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
  // Enhanced default chart options
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
            size: 11,
            family: "'Inter', 'Helvetica', 'Arial', sans-serif",
            weight: 500
          },
          padding: 15,
          color: '#4B5563'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#111827',
        bodyColor: '#4B5563',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        cornerRadius: 8,
        titleFont: {
          size: 13,
          weight: 'bold' as const,
          family: "'Inter', 'Helvetica', 'Arial', sans-serif"
        },
        bodyFont: {
          size: 12,
          family: "'Inter', 'Helvetica', 'Arial', sans-serif"
        },
        displayColors: true,
        caretSize: 6
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', 'Helvetica', 'Arial', sans-serif"
          },
          color: '#6B7280',
          padding: 8
        }
      },
      y: {
        beginAtZero: true,
        border: {
          display: false
        },
        grid: {
          color: '#F3F4F6'
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', 'Helvetica', 'Arial', sans-serif"
          },
          color: '#6B7280',
          padding: 8
        }
      }
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 2
      },
      point: {
        radius: 4,
        hitRadius: 10,
        hoverRadius: 6,
        borderWidth: 2
      },
      bar: {
        borderRadius: 6
      }
    }
  };

  // Enhanced radar chart options with improved styling
  const radarOptions = {
    ...defaultOptions,
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.08)',
          lineWidth: 1
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          backdropColor: 'transparent',
          font: {
            size: 10,
            family: "'Inter', 'Helvetica', 'Arial', sans-serif"
          },
          color: '#9CA3AF',
          showLabelBackdrop: false,
          z: 1
        },
        pointLabels: {
          font: {
            size: 12,
            family: "'Inter', 'Helvetica', 'Arial', sans-serif",
            weight: 600
          },
          color: '#4B5563',
          padding: 10
        },
        grid: {
          circular: true,
          color: 'rgba(0, 0, 0, 0.03)',
          lineWidth: 1
        }
      }
    },
    plugins: {
      ...defaultOptions.plugins,
      legend: {
        ...defaultOptions.plugins.legend,
        display: false // Hide legend for radar charts
      },
      tooltip: {
        ...defaultOptions.plugins.tooltip,
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${context.raw}/100`;
          }
        }
      }
    },
    elements: {
      line: {
        borderWidth: 2,
        tension: 0.1,
        fill: true,
        backgroundColor: 'rgba(79, 70, 229, 0.2)'
      },
      point: {
        radius: 4,
        hitRadius: 10,
        hoverRadius: 6,
        borderWidth: 2,
        backgroundColor: '#fff'
      }
    }
  };

  // Enhanced pie chart options
  const pieOptions = {
    ...defaultOptions,
    scales: undefined,
    plugins: {
      ...defaultOptions.plugins,
      legend: {
        ...defaultOptions.plugins.legend,
        position: 'right' as const,
        labels: {
          ...defaultOptions.plugins.legend.labels,
          padding: 15
        }
      }
    },
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: '#fff'
      }
    },
    cutout: '0%'
  };

  // Enhanced horizontal bar chart options
  const horizontalBarOptions = {
    ...defaultOptions,
    indexAxis: 'y' as const,
    scales: {
      x: {
        beginAtZero: true,
        border: {
          display: false
        },
        grid: {
          color: '#F3F4F6'
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', 'Helvetica', 'Arial', sans-serif"
          },
          color: '#6B7280',
          padding: 8
        }
      },
      y: {
        border: {
          display: false
        },
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', 'Helvetica', 'Arial', sans-serif"
          },
          color: '#6B7280',
          padding: 8
        }
      }
    },
    elements: {
      bar: {
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#fff'
      }
    }
  };

  // Enhanced doughnut chart options
  const doughnutOptions = {
    ...pieOptions,
    cutout: '70%',
    plugins: {
      ...pieOptions.plugins,
      tooltip: {
        ...pieOptions.plugins.tooltip,
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      },
      legend: {
        ...pieOptions.plugins.legend,
        position: 'bottom' as const
      }
    },
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: '#fff'
      }
    }
  };

  // Render the appropriate chart based on the type
  const renderChart = () => {
    // Cast options to any to avoid TypeScript errors with chart.js types
    const options = defaultOptions as any;
    const hBarOptions = horizontalBarOptions as any;
    const pOptions = pieOptions as any;
    const dOptions = doughnutOptions as any;
    const rOptions = radarOptions as any;

    // Use type assertion to handle custom chart types
    const chartType = chartData.type as string;

    switch (chartType) {
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'horizontalBar':
        // Use Bar chart with horizontal options
        return <Bar data={chartData} options={hBarOptions} />;
      case 'pie':
        return <Pie data={chartData} options={pOptions} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={dOptions} />;
      case 'radar':
        return <Radar data={chartData} options={rOptions} />;
      default:
        return <div className="text-center text-gray-500">Unsupported chart type</div>;
    }
  };

  return (
    <motion.div
      className={`chart-container ${className}`}
      style={{ height }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {renderChart()}
    </motion.div>
  );
};

export default ChartRenderer;

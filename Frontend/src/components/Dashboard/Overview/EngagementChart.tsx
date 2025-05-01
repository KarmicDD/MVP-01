import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EngagementTrends } from '../../../types/Dashboard.types';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface EngagementChartProps {
  data: EngagementTrends;
  color: string;
}

const EngagementChart: React.FC<EngagementChartProps> = ({ data, color }) => {
  const [activeDataset, setActiveDataset] = useState<'documentViews' | 'documentDownloads' | 'matches'>('documentViews');

  // Prepare data for chart
  const prepareChartData = () => {
    // Get all unique dates across all datasets
    const allDates = new Set<string>();
    data.documentViews.forEach(item => allDates.add(item.date));
    data.documentDownloads.forEach(item => allDates.add(item.date));
    data.matches.forEach(item => allDates.add(item.date));

    // Sort dates
    const sortedDates = Array.from(allDates).sort();

    // Create datasets
    const datasets = [];

    // Only add the active dataset
    if (activeDataset === 'documentViews') {
      const viewsData = sortedDates.map(date => {
        const found = data.documentViews.find(item => item.date === date);
        return found ? found.count : 0;
      });

      datasets.push({
        label: 'Profile Views',
        data: viewsData,
        borderColor: `${color}`,
        backgroundColor: `${color}20`,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: `${color}`,
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: `${color}`,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      });
    } else if (activeDataset === 'documentDownloads') {
      const downloadsData = sortedDates.map(date => {
        const found = data.documentDownloads.find(item => item.date === date);
        return found ? found.count : 0;
      });

      datasets.push({
        label: 'Document Downloads',
        data: downloadsData,
        borderColor: '#10B981', // Green
        backgroundColor: '#10B98120',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#10B981',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      });
    } else if (activeDataset === 'matches') {
      const matchesData = sortedDates.map(date => {
        const found = data.matches.find(item => item.date === date);
        return found ? found.count : 0;
      });

      datasets.push({
        label: 'New Matches',
        data: matchesData,
        borderColor: '#F59E0B', // Amber
        backgroundColor: '#F59E0B20',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#F59E0B',
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#F59E0B',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      });
    }

    return {
      labels: sortedDates.map(date => {
        // Format date to be more readable (e.g., "Jan 15")
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets
    };
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: '#fff',
        titleColor: '#111827',
        bodyColor: '#4B5563',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 10,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        usePointStyle: true,
        callbacks: {
          labelPointStyle: () => ({
            pointStyle: 'circle' as const,
            rotation: 0
          }),
        }
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
          },
          color: '#9CA3AF'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6'
        },
        ticks: {
          precision: 0,
          font: {
            size: 10
          },
          color: '#9CA3AF'
        }
      }
    }
  };

  // Button style based on active state
  const getButtonStyle = (datasetName: typeof activeDataset) => {
    const isActive = activeDataset === datasetName;

    let bgColor, textColor, borderColor;

    if (isActive) {
      if (datasetName === 'documentViews') {
        bgColor = `${color}10`;
        textColor = color;
        borderColor = `${color}30`;
      } else if (datasetName === 'documentDownloads') {
        bgColor = '#ECFDF5'; // Light green
        textColor = '#10B981'; // Green
        borderColor = '#10B98130';
      } else {
        bgColor = '#FEF3C7'; // Light amber
        textColor = '#F59E0B'; // Amber
        borderColor = '#F59E0B30';
      }
    } else {
      bgColor = '#F9FAFB'; // Light gray
      textColor = '#6B7280'; // Gray
      borderColor = '#E5E7EB'; // Light gray border
    }

    return {
      backgroundColor: bgColor,
      color: textColor,
      borderColor: borderColor
    };
  };

  return (
    <div>
      {/* Chart type selector */}
      <div className="flex space-x-2 mb-4">
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
          className="px-3 py-1.5 text-xs font-medium rounded-md border transition-colors"
          style={getButtonStyle('documentViews')}
          onClick={() => setActiveDataset('documentViews')}
        >
          Profile Views
        </motion.button>
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
          className="px-3 py-1.5 text-xs font-medium rounded-md border transition-colors"
          style={getButtonStyle('documentDownloads')}
          onClick={() => setActiveDataset('documentDownloads')}
        >
          Document Downloads
        </motion.button>
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ y: 0 }}
          className="px-3 py-1.5 text-xs font-medium rounded-md border transition-colors"
          style={getButtonStyle('matches')}
          onClick={() => setActiveDataset('matches')}
        >
          Matches
        </motion.button>
      </div>

      {/* Chart */}
      <div className="h-64">
        <Line data={prepareChartData()} options={options} />
      </div>
    </div>
  );
};

export default EngagementChart;

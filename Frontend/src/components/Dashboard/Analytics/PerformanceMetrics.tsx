import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiEye, FiUsers, FiMessageSquare, FiFileText, FiInfo } from 'react-icons/fi';
import { colours } from '../../../utils/colours';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PerformanceMetricsProps {
  role: string;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ role }) => {
  // Primary color based on role
  const primaryColor = role === 'startup' ? colours.primaryBlue : '#10B981';
  const secondaryColor = role === 'startup' ? colours.indigo400 : '#34D399';

  // Mock data for profile views chart
  const profileViewsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Profile Views',
        data: [65, 78, 52, 91, 43, 56, 61, 87, 106, 120, 115, 142],
        borderColor: primaryColor,
        backgroundColor: `${primaryColor}15`,
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#111827',
        bodyColor: '#4B5563',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        usePointStyle: true,
        callbacks: {
          labelPointStyle: function () {
            return {
              pointStyle: 'circle',
              rotation: 0
            };
          }
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

  // Mock data for engagement metrics
  const engagementData = {
    labels: ['Messages', 'Document Views', 'Connections', 'Bookmarks'],
    datasets: [
      {
        label: 'Last Month',
        data: [28, 42, 18, 34],
        backgroundColor: secondaryColor,
        borderRadius: 6
      },
      {
        label: 'This Month',
        data: [35, 50, 24, 42],
        backgroundColor: primaryColor,
        borderRadius: 6
      }
    ]
  };

  // Bar chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#111827',
        bodyColor: '#4B5563',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 10
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#F3F4F6'
        }
      }
    }
  };

  // KPI metrics
  const kpiMetrics = [
    {
      title: 'Profile Completion',
      value: '92%',
      change: '+8%',
      trend: 'up',
      icon: <FiUsers />
    },
    {
      title: 'Match Rate',
      value: '68%',
      change: '+12%',
      trend: 'up',
      icon: <FiTrendingUp />
    },
    {
      title: 'Response Time',
      value: '3.2h',
      change: '-0.8h',
      trend: 'down',
      icon: <FiMessageSquare />
    },
    {
      title: 'Document Uploads',
      value: '8',
      change: '+2',
      trend: 'up',
      icon: <FiFileText />
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                <span className="text-lg" style={{ color: primaryColor }}>{metric.icon}</span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${metric.trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                }`}>
                {metric.trend === 'up' ? <FiTrendingUp size={12} className="mr-1" /> : <FiTrendingDown size={12} className="mr-1" />}
                {metric.change}
              </div>
            </div>

            <h3 className="mt-4 text-sm font-medium text-gray-500">{metric.title}</h3>
            <div className="mt-1">
              <h2 className="text-2xl font-bold text-gray-800">{metric.value}</h2>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile views chart */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Profile Views</h2>
              <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                <FiInfo size={16} className="text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">Tracking profile visibility over time</p>
          </div>

          <div className="p-5">
            <div className="h-72">
              <Line data={profileViewsData} options={lineChartOptions} />
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <span className="font-medium text-gray-800">142</span> views this month
              </div>
              <div className="text-sm text-green-600 font-medium flex items-center">
                <FiTrendingUp size={14} className="mr-1" />
                23% increase
              </div>
            </div>
          </div>
        </motion.div>

        {/* Engagement metrics */}
        <motion.div
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Engagement Metrics</h2>
              <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                <FiInfo size={16} className="text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">Monthly comparison of key engagement indicators</p>
          </div>

          <div className="p-5">
            <div className="h-72">
              <Bar data={engagementData} options={barChartOptions} />
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <span className="font-medium text-gray-800">151</span> total engagements
              </div>
              <div className="text-sm text-green-600 font-medium flex items-center">
                <FiTrendingUp size={14} className="mr-1" />
                18% increase
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Additional metrics section */}
      <motion.div
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Performance Insights</h2>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <FiInfo size={18} />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-blue-800">Profile Optimization</h3>
                <p className="text-sm text-blue-600 mt-1">
                  Adding more detailed financial projections could increase your match rate by up to 15%.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-green-50 border border-green-100">
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <FiTrendingUp size={18} />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-green-800">Engagement Growth</h3>
                <p className="text-sm text-green-600 mt-1">
                  Your response time has improved by 20% this month, leading to higher engagement rates.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-100">
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                <FiEye size={18} />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-yellow-800">Visibility Opportunity</h3>
                <p className="text-sm text-yellow-600 mt-1">
                  Updating your industry keywords could help you appear in 30% more relevant searches.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PerformanceMetrics;

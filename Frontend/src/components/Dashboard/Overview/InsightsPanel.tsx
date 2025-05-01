import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTrendingUp, FiAlertCircle, FiInfo, FiCheckCircle,
  FiFileText, FiUsers, FiSearch, FiLoader, FiRefreshCw
} from 'react-icons/fi';
import { colours } from '../../../utils/colours';
import { Insight } from '../../../types/Dashboard.types';

interface InsightsPanelProps {
  insights: Insight[];
  role: string;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({
  insights,
  role,
  loading = false,
  error = null,
  onRefresh
}) => {
  const primaryColor = role === 'startup' ? colours.startup.primary : colours.investor.primary;
  const primaryGradient = role === 'startup' ? colours.startup.gradient : colours.investor.gradient;

  // Get icon based on insight type
  const getIcon = (type: string, iconName: string) => {
    switch (iconName) {
      case 'trending-up':
        return <FiTrendingUp />;
      case 'file-text':
        return <FiFileText />;
      case 'users':
        return <FiUsers />;
      case 'search':
        return <FiSearch />;
      default:
        switch (type) {
          case 'positive':
            return <FiCheckCircle />;
          case 'negative':
            return <FiAlertCircle />;
          case 'action':
            return <FiInfo />;
          default:
            return <FiInfo />;
        }
    }
  };

  // Get color based on insight type
  const getColor = (type: string) => {
    switch (type) {
      case 'positive':
        return '#10B981'; // Green
      case 'negative':
        return '#EF4444'; // Red
      case 'action':
        return primaryColor;
      default:
        return '#6B7280'; // Gray
    }
  };

  // Get background color based on insight type
  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'positive':
        return '#ECFDF5'; // Light green
      case 'negative':
        return '#FEF2F2'; // Light red
      case 'action':
        return role === 'startup' ? '#EFF6FF' : '#F0FDF4'; // Light blue or light green
      default:
        return '#F9FAFB'; // Light gray
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: primaryColor }}>AI Insights</h2>
        {onRefresh && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
            style={{ color: primaryColor }}
            aria-label="Refresh insights"
          >
            <FiRefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10"
          >
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 relative">
                <div className="absolute inset-0 rounded-full border-2 border-t-transparent border-blue-500 animate-spin"></div>
                <div className="absolute inset-1 rounded-full border-2 border-t-transparent border-blue-300 animate-spin" style={{ animationDirection: 'reverse' }}></div>
              </div>
              <p className="mt-3 text-sm font-medium text-gray-600">Generating insights...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-700"
        >
          <div className="flex items-start">
            <FiAlertCircle className="mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="font-medium">Error loading insights</p>
              <p className="text-sm">{error}</p>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="mt-2 text-sm font-medium text-red-600 hover:text-red-800 flex items-center"
                >
                  <FiRefreshCw size={14} className="mr-1" /> Try again
                </button>
              )}
            </div>
          </div>
        </motion.div>
      ) : insights.length === 0 && !loading ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-gray-50 border border-gray-100 text-center"
        >
          <p className="text-gray-500">No insights available yet</p>
          {onRefresh && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="mt-3 px-3 py-1.5 rounded-lg text-white font-medium shadow-sm text-sm inline-flex items-center"
              style={{ background: primaryGradient }}
              onClick={onRefresh}
            >
              <FiRefreshCw size={14} className="mr-1.5" /> Generate Insights
            </motion.button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="p-3.5 rounded-lg border shadow-sm"
              style={{
                backgroundColor: getBackgroundColor(insight.type),
                borderColor: `${getColor(insight.type)}30`
              }}
            >
              <div className="flex items-start">
                <motion.div
                  className="w-9 h-9 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                  style={{
                    backgroundColor: `${getColor(insight.type)}20`,
                    color: getColor(insight.type)
                  }}
                  whileHover={{ scale: 1.1 }}
                >
                  {getIcon(insight.type, insight.icon)}
                </motion.div>
                <div>
                  <h3 className="font-medium" style={{ color: getColor(insight.type) }}>
                    {insight.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{insight.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InsightsPanel;

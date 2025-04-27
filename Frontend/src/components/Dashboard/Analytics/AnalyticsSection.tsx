import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBarChart2, FiPieChart, FiTrendingUp, FiUsers, FiFileText, FiFilter } from 'react-icons/fi';
import { colours } from '../../../utils/colours';
import PerformanceMetrics from './PerformanceMetrics';
import BeliefSystemAnalytics from './BeliefSystemAnalytics';
import FinancialAnalytics from './FinancialAnalytics';

interface AnalyticsSectionProps {
  userProfile?: {
    role: string;
    userId?: string;
  } | null;
  selectedMatchId?: string | null;
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ userProfile, selectedMatchId }) => {
  const [activeTab, setActiveTab] = useState('belief');
  const role = userProfile?.role || 'startup';
  
  // Primary color based on role
  const primaryColor = role === 'startup' ? colours.primaryBlue : '#10B981';
  const primaryLight = role === 'startup' ? '#EBF5FF' : '#ECFDF5';
  const primaryText = role === 'startup' ? 'text-blue-600' : 'text-green-600';
  const primaryBg = role === 'startup' ? 'bg-blue-50' : 'bg-green-50';
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  // Analytics tabs
  const tabs = [
    { id: 'belief', label: 'Belief System Analysis', icon: <FiUsers /> },
    { id: 'financial', label: 'Financial Due Diligence', icon: <FiBarChart2 /> },
    { id: 'performance', label: 'Performance Metrics', icon: <FiTrendingUp /> }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header section */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Comprehensive analysis and insights for informed decision-making.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center">
            <button className="mr-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <FiFilter size={18} className="text-gray-500" />
            </button>
            <select 
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              defaultValue="last30days"
            >
              <option value="last7days">Last 7 days</option>
              <option value="last30days">Last 30 days</option>
              <option value="last90days">Last 90 days</option>
              <option value="lastyear">Last year</option>
              <option value="alltime">All time</option>
            </select>
          </div>
        </div>
      </motion.div>
      
      {/* Tabs navigation */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? primaryBg
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={{ 
                color: activeTab === tab.id ? primaryColor : undefined,
                backgroundColor: activeTab === tab.id ? primaryLight : undefined
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
      
      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'belief' && (
          <motion.div
            key="belief"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <BeliefSystemAnalytics 
              userProfile={userProfile as any} 
              selectedMatchId={selectedMatchId} 
            />
          </motion.div>
        )}
        
        {activeTab === 'financial' && (
          <motion.div
            key="financial"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <FinancialAnalytics 
              userProfile={userProfile as any} 
              selectedMatchId={selectedMatchId} 
            />
          </motion.div>
        )}
        
        {activeTab === 'performance' && (
          <motion.div
            key="performance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PerformanceMetrics role={role} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AnalyticsSection;

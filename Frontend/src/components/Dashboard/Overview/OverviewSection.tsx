import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrendingUp, FiUsers, FiBarChart2, FiFileText, FiActivity, FiArrowUp, FiArrowDown, FiRefreshCw } from 'react-icons/fi';
import { colours } from '../../../utils/colours';
import StatCard from './StatCard';
import RecentMatches from './RecentMatches';
import ActivityTimeline from './ActivityTimeline';
import UpcomingTasks from './UpcomingTasks';
import { dashboardService } from '../../../services/api';
import { DashboardData } from '../../../types/Dashboard.types';
import { useNavigate } from 'react-router-dom';

interface OverviewSectionProps {
  userProfile?: {
    role: string;
    name?: string;
  } | null;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({ userProfile }) => {
  const role = userProfile?.role || 'startup';
  const navigate = useNavigate();

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getAllDashboardData();
      setDashboardData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
      setLoading(false);
    }
  };

  // Function to refresh dashboard data
  const refreshData = async () => {
    try {
      setRefreshing(true);
      const data = await dashboardService.getAllDashboardData();
      setDashboardData(data);
      setRefreshing(false);
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
      setRefreshing(false);
    }
  };

  // Function to navigate to matches section
  const navigateToMatches = () => {
    navigate('/dashboard', { state: { activeTab: 'matches' } });
  };

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

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-3xl mb-4"
          style={{ color: role === 'startup' ? colours.primaryBlue : '#10B981' }}
        >
          <FiRefreshCw />
        </motion.div>
        <p className="text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-red-500 text-3xl mb-4">
          <FiActivity />
        </div>
        <p className="text-gray-700 mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all hover:shadow-md"
          style={{
            background: role === 'startup'
              ? colours.primaryGradient
              : 'linear-gradient(135deg, #10B981, #059669)'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Define primary color based on role
  const primaryColor = role === 'startup' ? colours.startup.primary : colours.investor.primary;
  const primaryGradient = role === 'startup' ? colours.startup.gradient : colours.investor.gradient;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome section with refresh button */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden"
        style={{
          borderColor: role === 'startup' ? colours.startup.border : colours.investor.border,
          background: role === 'startup' ? 'linear-gradient(to right, rgba(239, 246, 255, 0.6), rgba(219, 234, 254, 0.3))' : 'linear-gradient(to right, rgba(240, 253, 244, 0.6), rgba(220, 252, 231, 0.3))'
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{
          background: primaryGradient,
          borderRadius: '0 0 0 100%',
          filter: 'blur(20px)'
        }}></div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between relative z-10">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1F2937' }}>
              Welcome back, {userProfile?.name || 'User'}
            </h1>
            <p className="text-gray-600 mt-1 font-light">
              Here's what's happening with your {role === 'startup' ? 'startup' : 'investments'} today.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2.5 rounded-lg text-white font-medium shadow-sm transition-all hover:shadow-md flex items-center"
              style={{
                background: primaryGradient,
                boxShadow: `0 4px 14px ${primaryColor}25`
              }}
              onClick={navigateToMatches}
            >
              {role === 'startup' ? 'Find Investors' : 'Discover Startups'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={refreshing ? { rotate: 360 } : {}}
              transition={refreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
              onClick={refreshData}
              disabled={refreshing}
              className="ml-3 p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-all"
              style={{ color: primaryColor }}
            >
              <FiRefreshCw size={18} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Match Rate"
          value={`${dashboardData?.stats.matchRate || 0}%`}
          change={+12} // Placeholder change value
          icon={<FiUsers />}
          color={primaryColor}
        />
        <StatCard
          title="Profile Views"
          value={`${dashboardData?.stats.profileViews || 0}`}
          change={+28} // Placeholder change value
          icon={<FiBarChart2 />}
          color={primaryColor}
        />
        <StatCard
          title="Compatibility Score"
          value={`${dashboardData?.stats.compatibilityScore || 0}%`}
          change={-3} // Placeholder change value
          icon={<FiActivity />}
          color={primaryColor}
        />
        <StatCard
          title="Documents"
          value={`${dashboardData?.stats.documentCount || 0}`}
          change={+2} // Placeholder change value
          icon={<FiFileText />}
          color={primaryColor}
        />
      </motion.div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent matches */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <RecentMatches
            role={role}
            matches={dashboardData?.recentMatches || []}
          />
        </motion.div>

        {/* Activity timeline and tasks */}
        <motion.div variants={itemVariants} className="space-y-6">
          <ActivityTimeline
            role={role}
            activities={dashboardData?.activities || []}
          />
          <UpcomingTasks
            role={role}
            tasks={dashboardData?.tasks || []}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OverviewSection;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTrendingUp, FiUsers, FiBarChart2, FiFileText, FiActivity,
  FiArrowUp, FiArrowDown, FiRefreshCw, FiPieChart, FiCheckCircle,
  FiAlertCircle, FiInfo, FiSearch, FiTarget
} from 'react-icons/fi';
import { colours } from '../../../utils/colours';
import StatCard from './StatCard';
import RecentMatches from './RecentMatches';
import ActivityTimeline from './ActivityTimeline';
import TaskManager from './TaskManager';
import InsightsPanel from './InsightsPanel';
import EngagementChart from './EngagementChart';
import { dashboardService } from '../../../services/api';
import { DashboardData, Insight } from '../../../types/Dashboard.types';
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

  // State for component-specific loading
  const [insightsLoading, setInsightsLoading] = useState<boolean>(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [tasksLoading, setTasksLoading] = useState<boolean>(false);

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

  // Function to refresh insights only
  const refreshInsights = async () => {
    try {
      setInsightsLoading(true);
      setInsightsError(null);
      const response = await dashboardService.getInsights();

      if (dashboardData && response) {
        setDashboardData({
          ...dashboardData,
          insights: response
        });
      }
    } catch (err: any) {
      console.error('Error refreshing insights:', err);
      setInsightsError(err.response?.data?.message || 'Failed to load insights. Please try again.');
    } finally {
      setInsightsLoading(false);
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

  // Define primary color based on role
  const primaryColor = role === 'startup' ? colours.startup.primary : colours.investor.primary;
  const primaryGradient = role === 'startup' ? colours.startup.gradient : colours.investor.gradient;

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] py-12">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-b-transparent animate-spin"
            style={{ borderColor: `${primaryColor}30`, borderTopColor: 'transparent', borderBottomColor: 'transparent' }}></div>
          <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-b-transparent animate-spin"
            style={{ borderColor: primaryColor, borderTopColor: 'transparent', borderBottomColor: 'transparent', animationDirection: 'reverse', animationDuration: '1s' }}></div>
        </div>
        <h3 className="text-xl font-semibold mb-2 text-gray-800">Loading Your Dashboard</h3>
        <p className="text-gray-500 max-w-md text-center">
          We're gathering your latest data, insights, and personalized recommendations...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
          <FiAlertCircle size={32} className="text-red-500" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-gray-800">Unable to Load Dashboard</h3>
        <p className="text-gray-600 max-w-md mb-6">{error}</p>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchDashboardData}
          className="px-5 py-2.5 rounded-lg text-white font-medium shadow-sm transition-all hover:shadow-md flex items-center"
          style={{
            background: role === 'startup'
              ? colours.startup.gradient
              : colours.investor.gradient
          }}
        >
          <FiRefreshCw className="mr-2" /> Try Again
        </motion.button>
      </div>
    );
  }

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
              aria-label={role === 'startup' ? 'Find Investors' : 'Discover Startups'}
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
          change={dashboardData?.analytics?.changes?.matchRate?.percentageChange || 0}
          icon={<FiUsers />}
          color={primaryColor}
          tooltip="Percentage of potential matches that meet your compatibility threshold"
          loading={refreshing}
        />
        <StatCard
          title="Profile Views"
          value={`${dashboardData?.stats.profileViews || 0}`}
          change={dashboardData?.analytics?.changes?.documentViews?.percentageChange || 0}
          icon={<FiBarChart2 />}
          color={primaryColor}
          tooltip="Number of times your profile has been viewed by others"
          loading={refreshing}
        />
        <StatCard
          title="Compatibility Score"
          value={`${dashboardData?.stats.compatibilityScore || 0}%`}
          change={dashboardData?.analytics?.changes?.compatibilityScore?.percentageChange || 0}
          icon={<FiActivity />}
          color={primaryColor}
          tooltip="Average compatibility score across all your matches"
          loading={refreshing}
        />
        <StatCard
          title="Profile Completion"
          value={`${dashboardData?.stats.profileCompletionPercentage || 0}%`}
          change={dashboardData?.analytics?.changes?.profileCompletion?.percentageChange || 0}
          icon={<FiCheckCircle />}
          color={primaryColor}
          tooltip="Percentage of your profile that has been completed"
          loading={refreshing}
        />
      </motion.div>

      {/* Secondary Stats row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Engagements"
          value={`${dashboardData?.stats.totalEngagements || 0}`}
          icon={<FiTarget />}
          color={primaryColor}
          size="small"
          tooltip="Total number of interactions with your profile and documents"
          loading={refreshing}
        />
        <StatCard
          title="Documents"
          value={`${dashboardData?.stats.documentCount || 0}`}
          icon={<FiFileText />}
          color={primaryColor}
          size="small"
          tooltip="Number of documents you've uploaded"
          loading={refreshing}
        />
        <StatCard
          title="Engagement Rate"
          value={`${dashboardData?.stats.engagementRate || 0}`}
          icon={<FiPieChart />}
          color={primaryColor}
          size="small"
          tooltip="Measure of how actively your profile is being engaged with"
          loading={refreshing}
        />
      </motion.div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Matches, Engagement Chart, and Task Manager */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          {/* Recent matches */}
          <RecentMatches
            role={role}
            matches={dashboardData?.recentMatches || []}
          />

          {/* Engagement Chart */}
          {dashboardData?.analytics?.engagementTrends && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4" style={{ color: primaryColor }}>Engagement Trends</h2>
              <EngagementChart
                data={dashboardData.analytics.engagementTrends}
                color={primaryColor}
              />
            </div>
          )}

          {/* Task Manager - Moved below Engagement Chart */}
          <TaskManager
            role={role}
            tasks={dashboardData?.tasks || []}
            onTasksUpdated={refreshData}
          />
        </motion.div>

        {/* Right column - Insights and Activity */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* AI Insights */}
          <InsightsPanel
            insights={dashboardData?.insights || []}
            role={role}
            loading={insightsLoading || refreshing}
            error={insightsError}
            onRefresh={refreshInsights}
          />

          {/* Activity timeline */}
          <ActivityTimeline
            role={role}
            activities={dashboardData?.activities || []}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OverviewSection;

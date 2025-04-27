import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiUsers, FiBarChart2, FiFileText, FiActivity, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { colours } from '../../../utils/colours';
import StatCard from './StatCard';
import RecentMatches from './RecentMatches';
import ActivityTimeline from './ActivityTimeline';
import UpcomingTasks from './UpcomingTasks';

interface OverviewSectionProps {
  userProfile?: {
    role: string;
    name?: string;
  } | null;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({ userProfile }) => {
  const role = userProfile?.role || 'startup';

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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome section */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome back, {userProfile?.name || 'User'}
            </h1>
            <p className="text-gray-500 mt-1">
              Here's what's happening with your {role === 'startup' ? 'startup' : 'investments'} today.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              className="px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all hover:shadow-md"
              style={{
                background: role === 'startup'
                  ? colours.primaryGradient
                  : 'linear-gradient(135deg, #10B981, #059669)'
              }}
            >
              {role === 'startup' ? 'Find Investors' : 'Discover Startups'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Match Rate"
          value="68%"
          change={+12}
          icon={<FiUsers />}
          color={role === 'startup' ? colours.primaryBlue : '#10B981'}
        />
        <StatCard
          title="Profile Views"
          value="142"
          change={+28}
          icon={<FiBarChart2 />}
          color={role === 'startup' ? colours.primaryBlue : '#10B981'}
        />
        <StatCard
          title="Compatibility Score"
          value="76%"
          change={-3}
          icon={<FiActivity />}
          color={role === 'startup' ? colours.primaryBlue : '#10B981'}
        />
        <StatCard
          title="Documents"
          value="8"
          change={+2}
          icon={<FiFileText />}
          color={role === 'startup' ? colours.primaryBlue : '#10B981'}
        />
      </motion.div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent matches */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <RecentMatches role={role} />
        </motion.div>

        {/* Activity timeline */}
        <motion.div variants={itemVariants} className="space-y-6">
          <ActivityTimeline role={role} />
          <UpcomingTasks role={role} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OverviewSection;

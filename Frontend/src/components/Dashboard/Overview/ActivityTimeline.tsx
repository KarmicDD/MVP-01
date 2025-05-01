import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiUser, FiFileText, FiBarChart2, FiMessageSquare, FiCheckCircle, FiDownload, FiActivity } from 'react-icons/fi';
import { colours } from '../../../utils/colours';
import { Activity } from '../../../types/Dashboard.types';
import { useNavigate } from 'react-router-dom';

interface ActivityTimelineProps {
  role: string;
  activities?: Activity[];
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ role, activities: propActivities }) => {
  const navigate = useNavigate();

  // Get icon component based on activity type
  const getIconComponent = (type: string) => {
    switch (type) {
      case 'profile_view':
        return <FiUser />;
      case 'document_upload':
        return <FiFileText />;
      case 'document_download':
        return <FiDownload />;
      case 'analysis_complete':
        return <FiBarChart2 />;
      case 'message':
        return <FiMessageSquare />;
      case 'match':
        return <FiCheckCircle />;
      default:
        return <FiActivity />;
    }
  };

  // Use provided activities or fallback to mock data
  const activities = propActivities && propActivities.length > 0 ? propActivities.map(activity => ({
    ...activity,
    icon: getIconComponent(activity.type)
  })) : [
    {
      id: '1',
      type: 'profile_view',
      title: role === 'startup' ? 'Investor viewed your profile' : 'Startup viewed your profile',
      entity: role === 'startup' ? 'Growth Capital Fund' : 'TechNova Solutions',
      time: new Date().toISOString(),
      formattedTime: '2 hours ago',
      icon: <FiUser />,
      color: '#3e60e9'
    },
    {
      id: '2',
      type: 'document_upload',
      title: 'You uploaded a new document',
      entity: 'Financial Projections.pdf',
      time: new Date().toISOString(),
      formattedTime: 'Yesterday',
      icon: <FiFileText />,
      color: '#10B981'
    },
    {
      id: '3',
      type: 'analysis_complete',
      title: 'Analysis completed',
      entity: 'Belief System Analysis',
      time: new Date().toISOString(),
      formattedTime: '2 days ago',
      icon: <FiBarChart2 />,
      color: '#8B5CF6'
    },
    {
      id: '4',
      type: 'message',
      title: role === 'startup' ? 'New message from investor' : 'New message from startup',
      entity: role === 'startup' ? 'Angel Investors Network' : 'HealthAI',
      time: new Date().toISOString(),
      formattedTime: '3 days ago',
      icon: <FiMessageSquare />,
      color: '#EC4899'
    },
    {
      id: '5',
      type: 'match',
      title: 'New match found',
      entity: role === 'startup' ? 'Venture Capital Partners' : 'GreenTech Innovations',
      time: new Date().toISOString(),
      formattedTime: '1 week ago',
      icon: <FiCheckCircle />,
      color: '#F59E0B'
    }
  ];

  // Define colors based on role
  const primaryColor = role === 'startup' ? colours.startup.primary : colours.investor.primary;
  const borderColor = role === 'startup' ? colours.startup.border : colours.investor.border;

  // Navigate to activity section (placeholder for now)
  const navigateToActivity = () => {
    // This would navigate to an activity or notifications page
    // For now, just log the action
    console.log('Navigate to activity section');
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md border overflow-hidden"
      style={{
        borderColor: 'rgba(0,0,0,0.06)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), 0 2px 6px rgba(0, 0, 0, 0.02)'
      }}
    >
      <div className="p-5 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800" style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>Recent Activity</h2>
          <motion.button
            whileHover={{ x: 3, color: role === 'startup' ? '#3b82f6' : '#10b981' }}
            whileTap={{ scale: 0.98 }}
            onClick={navigateToActivity}
            className="text-sm font-medium flex items-center transition-colors duration-200"
            style={{ color: primaryColor }}
          >
            View all
            <FiArrowRight size={14} className="ml-1" />
          </motion.button>
        </div>
      </div>

      <div className="p-5">
        {activities.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500">No recent activity</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div
              className="absolute top-0 left-4 bottom-0 w-0.5"
              style={{
                background: `linear-gradient(to bottom, ${primaryColor}30, ${primaryColor}05)`,
                borderRadius: '999px'
              }}
            ></div>

            {/* Timeline items */}
            <div className="space-y-5">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  className="relative pl-10 group"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 2 }}
                >
                  {/* Timeline dot */}
                  <motion.div
                    className="absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center z-10"
                    style={{
                      backgroundColor: `${activity.color}15`,
                      color: activity.color,
                      boxShadow: `0 0 0 3px ${activity.color}05, 0 2px 4px rgba(0,0,0,0.05)`,
                      transition: 'all 0.2s ease'
                    }}
                    whileHover={{
                      scale: 1.1,
                      boxShadow: `0 0 0 4px ${activity.color}10, 0 3px 6px rgba(0,0,0,0.1)`
                    }}
                  >
                    {activity.icon}
                  </motion.div>

                  <div
                    className="group-hover:bg-gray-50 p-3 rounded-lg transition-all duration-200"
                    style={{
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                      transform: 'translateZ(0)'
                    }}
                  >
                    <h3 className="text-sm font-medium text-gray-800" style={{ fontWeight: 500, letterSpacing: '-0.01em' }}>
                      {activity.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{activity.entity}</p>
                    <p className="text-xs text-gray-400 mt-1" style={{ fontWeight: 400 }}>{activity.formattedTime}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;

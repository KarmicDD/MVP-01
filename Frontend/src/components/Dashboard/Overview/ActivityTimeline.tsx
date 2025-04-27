import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiUser, FiFileText, FiBarChart2, FiMessageSquare, FiCheckCircle } from 'react-icons/fi';
import { colours } from '../../../utils/colours';

interface ActivityTimelineProps {
  role: string;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ role }) => {
  // Mock data for activity timeline
  const activities = [
    {
      id: '1',
      type: 'profile_view',
      title: role === 'startup' ? 'Investor viewed your profile' : 'Startup viewed your profile',
      entity: role === 'startup' ? 'Growth Capital Fund' : 'TechNova Solutions',
      time: '2 hours ago',
      icon: <FiUser />,
      color: '#3e60e9'
    },
    {
      id: '2',
      type: 'document_upload',
      title: 'You uploaded a new document',
      entity: 'Financial Projections.pdf',
      time: 'Yesterday',
      icon: <FiFileText />,
      color: '#10B981'
    },
    {
      id: '3',
      type: 'analysis_complete',
      title: 'Analysis completed',
      entity: 'Belief System Analysis',
      time: '2 days ago',
      icon: <FiBarChart2 />,
      color: '#8B5CF6'
    },
    {
      id: '4',
      type: 'message',
      title: role === 'startup' ? 'New message from investor' : 'New message from startup',
      entity: role === 'startup' ? 'Angel Investors Network' : 'HealthAI',
      time: '3 days ago',
      icon: <FiMessageSquare />,
      color: '#EC4899'
    },
    {
      id: '5',
      type: 'match',
      title: 'New match found',
      entity: role === 'startup' ? 'Venture Capital Partners' : 'GreenTech Innovations',
      time: '1 week ago',
      icon: <FiCheckCircle />,
      color: '#F59E0B'
    }
  ];
  
  // Primary color based on role
  const primaryColor = role === 'startup' ? colours.primaryBlue : '#10B981';
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
          <a 
            href="#view-all" 
            className="text-sm font-medium flex items-center"
            style={{ color: primaryColor }}
          >
            View all
            <FiArrowRight size={14} className="ml-1" />
          </a>
        </div>
      </div>
      
      <div className="p-5">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-0 left-4 bottom-0 w-0.5 bg-gray-100"></div>
          
          {/* Timeline items */}
          <div className="space-y-5">
            {activities.map((activity, index) => (
              <motion.div 
                key={activity.id}
                className="relative pl-10"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Timeline dot */}
                <div 
                  className="absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center z-10"
                  style={{ backgroundColor: `${activity.color}15`, color: activity.color }}
                >
                  {activity.icon}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-800">{activity.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{activity.entity}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityTimeline;

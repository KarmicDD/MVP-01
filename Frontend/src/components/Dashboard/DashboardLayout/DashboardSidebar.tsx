import React from 'react';
import { motion } from 'framer-motion';
import { FiX, FiHome, FiUsers, FiBarChart2, FiFileText, FiSettings, FiMessageSquare, FiHelpCircle, FiUser } from 'react-icons/fi';
import { colours } from '../../../utils/colours';
import { Logo } from '../../Auth/Logo';

interface SidebarProps {
  userProfile?: {
    role: string;
    name?: string;
    avatar?: string;
    companyName?: string;
  } | null;
  onClose: () => void;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardSidebar: React.FC<SidebarProps> = ({
  userProfile,
  onClose,
  onLogout,
  activeTab,
  setActiveTab
}) => {
  // Log the user profile data received by the component
  console.log('DashboardSidebar received userProfile:', userProfile);

  const role = userProfile?.role || 'startup';

  // Define primary color based on role
  const primaryColor = role === 'startup' ? colours.primaryBlue : '#10B981';

  // Navigation items
  const navItems = [
    { icon: <FiHome size={20} />, label: 'Overview', id: 'overview' },
    { icon: <FiUsers size={20} />, label: 'Matches', id: 'matches' },
    { icon: <FiBarChart2 size={20} />, label: 'Analytics', id: 'analytics' },
    { icon: <FiFileText size={20} />, label: 'Documents', id: 'documents' },
    { icon: <FiMessageSquare size={20} />, label: 'Messages', id: 'messages' },
    { icon: <FiSettings size={20} />, label: 'Settings', id: 'settings' },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 flex items-center justify-between border-b border-gray-100">
        <Logo Title="KarmicDD" />
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <FiX size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center px-4 py-3 rounded-lg transition-all w-full text-left ${activeTab === item.id
                ? `bg-${role === 'startup' ? 'blue' : 'green'}-50 text-${role === 'startup' ? 'blue' : 'green'}-600`
                : 'text-gray-600 hover:bg-gray-50'
                }`}
              style={{
                color: activeTab === item.id ? primaryColor : undefined,
                backgroundColor: activeTab === item.id ? `${role === 'startup' ? '#EBF5FF' : '#ECFDF5'}` : undefined
              }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="mr-3">{item.icon}</span>
              <span className="font-medium">{item.label}</span>

              {/* Active indicator */}
              {activeTab === item.id && (
                <motion.div
                  className="ml-auto w-1.5 h-6 rounded-full"
                  style={{ backgroundColor: primaryColor }}
                  layoutId="activeIndicator"
                />
              )}
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Help section */}
      <div className="p-4 border-t border-gray-100">
        <motion.button
          onClick={() => setActiveTab('help')}
          className="flex items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-all w-full text-left"
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiHelpCircle size={20} className="mr-3" />
          <span className="font-medium">Help & Support</span>
        </motion.button>
      </div>

      {/* User profile section */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center p-3 rounded-lg"
          style={{
            background: `${role === 'startup' ? colours.indigo50 : '#ECFDF5'}`,
            borderLeft: `3px solid ${primaryColor}`
          }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${role === 'startup' ? colours.indigo600 : '#059669'})` }}
          >
            {userProfile?.avatar ? (
              <img src={userProfile.avatar} alt={userProfile?.name || 'User'} className="w-full h-full object-cover" />
            ) : (
              <FiUser size={20} className="text-white" />
            )}
          </div>
          <div className="ml-3">
            <p className="font-medium" style={{ color: primaryColor }}>{userProfile?.name || userProfile?.companyName || 'User'}</p>
            <p className="text-xs text-gray-500 capitalize">{role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiBell, FiUser, FiSettings, FiLogOut, FiSearch, FiChevronDown, FiPlus, FiFileText, FiMessageSquare } from 'react-icons/fi';
import { colours } from '../../../utils/colours';
import DropdownPortal from './DropdownPortal';
import TutorialIcon from '../../Tutorial/TutorialIcon';

interface HeaderProps {
  toggleSidebar: () => void;
  userProfile?: {
    role: string;
    name?: string;
    avatar?: string;
    companyName?: string;
  } | null;
  onLogout: () => void;
}

const DashboardHeader: React.FC<HeaderProps> = ({ toggleSidebar, userProfile, onLogout }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Log the user profile data received by the component
  console.log('DashboardHeader received userProfile:', userProfile);

  const role = userProfile?.role || 'startup';

  // Define primary color based on role
  const primaryColor = role === 'startup' ? colours.primaryBlue : '#10B981';
  const primaryGradient = role === 'startup'
    ? `linear-gradient(135deg, ${colours.primaryBlue}, ${colours.indigo600})`
    : 'linear-gradient(135deg, #10B981, #059669)';

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200" style={{ position: 'relative', zIndex: 1000 }}>
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center">
          <motion.button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ color: primaryColor }}
          >
            <FiMenu size={22} />
          </motion.button>

          {/* Quick Actions */}
          <div className="hidden md:flex ml-4 relative">
            <div className="flex items-center space-x-2">
              <motion.button
                className="flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: `${primaryColor}15`,
                  color: primaryColor
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <FiPlus className="mr-1.5" size={16} />
                <span>New</span>
              </motion.button>

              <motion.button
                className="p-2 rounded-lg transition-colors"
                style={{
                  background: `${primaryColor}10`,
                  color: primaryColor
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Documents"
              >
                <FiFileText size={18} />
              </motion.button>

              <motion.button
                className="p-2 rounded-lg transition-colors"
                style={{
                  background: `${primaryColor}10`,
                  color: primaryColor
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Messages"
              >
                <FiMessageSquare size={18} />
              </motion.button>

              <TutorialIcon
                tutorialId="dashboard-tutorial"
                className="p-2 rounded-lg transition-colors"
                iconSize={18}
                color={primaryColor}
                tooltip="Show Dashboard Tutorial"
                style={{
                  background: `${primaryColor}10`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <div className="relative" style={{ zIndex: 9999 }}>
            <motion.button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiBell size={20} style={{ color: primaryColor }} />
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500"></span>
            </motion.button>

            <AnimatePresence>
              {notificationsOpen && (
                <DropdownPortal>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="fixed right-16 mt-2 w-80 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200"
                    style={{
                      borderColor: `${primaryColor}30`,
                      zIndex: 9999,
                      top: "60px" // Position it below the header
                    }}
                  >
                    <div className="p-3 border-b border-gray-100" style={{ borderColor: `${primaryColor}20` }}>
                      <h3 className="font-semibold" style={{ color: primaryColor }}>Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      <div className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer" style={{ borderColor: `${primaryColor}10` }}>
                        <p className="text-sm font-medium text-gray-800">New match found</p>
                        <p className="text-xs text-gray-500 mt-1">A new potential match has been identified for your profile.</p>
                        <p className="text-xs text-gray-400 mt-2">2 hours ago</p>
                      </div>
                      <div className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer" style={{ borderColor: `${primaryColor}10` }}>
                        <p className="text-sm font-medium text-gray-800">Analysis complete</p>
                        <p className="text-xs text-gray-500 mt-1">Your belief system analysis report is now ready to view.</p>
                        <p className="text-xs text-gray-400 mt-2">Yesterday</p>
                      </div>
                    </div>
                    <div className="p-2 text-center">
                      <button className="text-sm font-medium" style={{ color: primaryColor }}>
                        View all notifications
                      </button>
                    </div>
                  </motion.div>
                </DropdownPortal>
              )}
            </AnimatePresence>
          </div>

          {/* User menu */}
          <div className="relative" style={{ zIndex: 9999 }}>
            <motion.button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
                style={{ background: primaryGradient }}
              >
                {userProfile?.avatar ? (
                  <img src={userProfile.avatar} alt={userProfile.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <FiUser size={16} className="text-white" />
                )}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium" style={{ color: primaryColor }}>{userProfile?.name || userProfile?.companyName || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{role}</p>
              </div>
              <FiChevronDown size={16} style={{ color: primaryColor }} />
            </motion.button>

            <AnimatePresence>
              {userMenuOpen && (
                <DropdownPortal>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="fixed right-4 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200"
                    style={{
                      borderColor: `${primaryColor}30`,
                      zIndex: 9999,
                      top: "60px" // Position it below the header
                    }}
                  >
                    <div className="p-3 border-b border-gray-100" style={{ borderColor: `${primaryColor}20` }}>
                      <p className="font-medium" style={{ color: primaryColor }}>{userProfile?.name || userProfile?.companyName || 'User'}</p>
                      <p className="text-xs text-gray-500 capitalize">{role}</p>
                    </div>
                    <div className="py-1">
                      <a href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <FiUser size={16} className="mr-3" style={{ color: primaryColor }} />
                        Profile
                      </a>
                      <a href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <FiSettings size={16} className="mr-3" style={{ color: primaryColor }} />
                        Settings
                      </a>
                    </div>
                    <div className="py-1 border-t border-gray-100" style={{ borderColor: `${primaryColor}20` }}>
                      <button
                        onClick={onLogout}
                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <FiLogOut size={16} className="mr-3 text-red-500" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                </DropdownPortal>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

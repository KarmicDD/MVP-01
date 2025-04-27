import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiBell, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import { colours } from '../../../utils/colours';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/api';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import BackgroundPattern from './BackgroundPattern';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userProfile?: {
    role: string;
    name?: string;
    avatar?: string;
    companyName?: string;
  } | null;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  userProfile,
  activeTab = 'overview',
  setActiveTab = () => { }
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Define background colors based on role
  const role = userProfile?.role || 'startup';
  const bgGradient = role === 'startup'
    ? 'from-blue-50 to-indigo-50'
    : 'from-green-50 to-emerald-50';

  return (
    <div className={`flex h-screen overflow-hidden bg-gradient-to-br ${bgGradient}`}>
      {/* Background Pattern */}
      <BackgroundPattern role={role} />

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed inset-y-0 left-0 w-64 bg-white/90 backdrop-blur-sm border-r border-gray-200 shadow-lg lg:relative lg:shadow-none`}
            style={{ zIndex: 50 }}
          >
            <DashboardSidebar
              userProfile={userProfile}
              onClose={() => setSidebarOpen(false)}
              onLogout={handleLogout}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
          style={{ zIndex: 40 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          userProfile={userProfile}
          onLogout={handleLogout}
        />

        <main className={`flex-1 overflow-y-auto transition-all duration-200 ease-in-out ${sidebarOpen ? 'lg:ml-0' : 'ml-0'}`}>
          <div className="container mx-auto px-4 py-6 relative" style={{ zIndex: 1 }}>
            {/* Content container with subtle shadow and background */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6 border border-gray-100">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

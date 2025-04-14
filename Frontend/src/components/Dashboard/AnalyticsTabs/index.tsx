import React from 'react';
import { motion } from 'framer-motion';
import BeliefSystemAnalytics from '../Analytics/BeliefSystemAnalytics';
import FinancialDueDiligence from '../Analytics/FinancialDueDiligence';
import { UserProfile } from '../../../types/Dashboard.types';

interface AnalyticsTabsProps {
  analyticsTab: string;
  setAnalyticsTab: (tab: string) => void;
  userProfile: UserProfile;
  selectedMatchId: string | null;
  itemVariants: any;
}

const AnalyticsTabs: React.FC<AnalyticsTabsProps> = ({
  analyticsTab,
  setAnalyticsTab,
  userProfile,
  selectedMatchId,
  itemVariants
}) => {
  return (
    <motion.div
      key="analytics"
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            duration: 0.3,
            when: "beforeChildren",
            staggerChildren: 0.1
          }
        }
      }}
    >
      <motion.div variants={itemVariants} className="mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics Dashboard</h2>
          
          {/* Analytics tabs with improved UI */}
          <div className="mb-8 analytics-tabs">
            <nav className="flex space-x-1 overflow-x-auto scrollbar-hide">
              {[
                { id: 'belief', label: 'Belief System Analysis' },
                { id: 'financial', label: 'Financial Due Diligence' },
                { id: 'performance', label: 'Performance Metrics' },
                { id: 'coming-soon', label: 'More Coming Soon' }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setAnalyticsTab(tab.id)}
                  className={`px-4 py-3 font-medium text-sm transition-all rounded-lg ${analyticsTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {tab.label}
                </motion.button>
              ))}
            </nav>
          </div>
        </div>
      </motion.div>

      {/* Analytics content based on selected tab */}
      {analyticsTab === 'belief' && (
        <motion.div variants={itemVariants} className="belief-system-container">
          {userProfile && (
            <BeliefSystemAnalytics
              userProfile={{
                ...userProfile,
                role: userProfile.role as "startup" | "investor"
              }}
              selectedMatchId={selectedMatchId}
            />
          )}
        </motion.div>
      )}

      {analyticsTab === 'financial' && (
        <motion.div variants={itemVariants} className="financial-dd-container">
          {userProfile && (
            <FinancialDueDiligence
              userProfile={{
                ...userProfile,
                role: userProfile.role as "startup" | "investor"
              }}
              selectedMatchId={selectedMatchId}
            />
          )}
        </motion.div>
      )}

      {(analyticsTab === 'performance' || analyticsTab === 'coming-soon') && (
        <motion.div variants={itemVariants}>
          <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Coming Soon</h3>
            <p className="text-gray-600 mb-6">We're working hard to bring you more advanced analytics features.</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AnalyticsTabs;

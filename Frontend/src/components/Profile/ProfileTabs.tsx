import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { colours } from '../../utils/colours';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ProfileTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  userType?: 'startup' | 'investor' | null;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ tabs, activeTab, onTabChange, userType = 'startup' }) => {
  const activeColor = userType === 'startup' ? colours.indigo600 : 'emerald-600';

  // Memoize tab buttons to prevent re-creating on every render
  const tabButtons = useMemo(() =>
    tabs.map((tab) => {
      const isActive = tab.id === activeTab;
      return (
        <motion.button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            group relative inline-flex items-center py-2 sm:py-3 md:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap
            ${isActive
              ? `border-${activeColor} text-${activeColor}`
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
          `}
          aria-current={isActive ? 'page' : undefined}
          whileHover={{ y: isActive ? 0 : -1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <motion.span
            className={`mr-1 sm:mr-2 ${isActive ? `text-${activeColor}` : 'text-gray-400 group-hover:text-gray-500'}`}
            animate={{ scale: isActive ? 1.1 : 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {tab.icon}
          </motion.span>
          {tab.label}
          {isActive && (
            <motion.div
              className={`absolute bottom-0 left-0 right-0 h-0.5 bg-${activeColor}`}
              layoutId="activeTab"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </motion.button>
      );
    }), [tabs, activeTab, activeColor, onTabChange]
  );

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-2 sm:space-x-4 md:space-x-8 overflow-x-auto pb-1 scrollbar-hide">
        {tabButtons}
      </nav>
    </div>
  );
};

export default React.memo(ProfileTabs);

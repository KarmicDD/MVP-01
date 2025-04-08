import React, { useState } from 'react';
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
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${isActive 
                  ? `border-${colours.indigo600} text-${colours.indigo600}` 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={`mr-2 ${isActive ? `text-${colours.indigo600}` : 'text-gray-400 group-hover:text-gray-500'}`}>
                {tab.icon}
              </span>
              {tab.label}
              
              {isActive && (
                <motion.div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 bg-${colours.indigo600}`}
                  layoutId="activeTab"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default ProfileTabs;

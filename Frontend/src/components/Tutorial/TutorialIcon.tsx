import React from 'react';
import { motion } from 'framer-motion';
import { FiHelpCircle } from 'react-icons/fi';
import { useTutorial } from '../../hooks/useTutorial';
import { useTutorialContext } from '../../context/TutorialContext';

interface TutorialIconProps {
  tutorialId: string;
  className?: string;
  iconSize?: number;
  color?: string;
  hoverColor?: string;
  tooltip?: string;
  style?: React.CSSProperties;
}

/**
 * TutorialIcon component
 * A help icon that triggers a specific tutorial when clicked
 */
const TutorialIcon: React.FC<TutorialIconProps> = ({
  tutorialId,
  className = '',
  iconSize = 18,
  color = 'currentColor',
  hoverColor,
  tooltip = 'Show Tutorial',
  style
}) => {
  // Get the tutorial context directly to ensure we can force-show the tutorial
  const { showTutorial } = useTutorialContext();
  const { isCompleted } = useTutorial(tutorialId);

  // Create a direct function to open the tutorial that bypasses any checks
  const openTutorial = () => {
    console.log(`TutorialIcon: Force opening tutorial ${tutorialId}`);
    // Pass true to force show the tutorial even if it's completed or disabled
    showTutorial(tutorialId, true);
  };

  return (
    <motion.button
      className={`relative group flex items-center justify-center transition-colors ${className}`}
      onClick={openTutorial}
      aria-label="Open tutorial"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={tooltip}
      style={style}
    >
      <FiHelpCircle
        size={iconSize}
        className="transition-colors duration-200"
        style={{ color: color }}
        aria-label="Show tutorial"
      />

      {/* Pulse effect for new users */}
      {!isCompleted && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
      )}

      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 hidden group-hover:block">
        <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 overflow-hidden w-4 h-2">
            <div className="bg-gray-800 rotate-45 transform origin-top-left w-2 h-2 translate-x-1/2"></div>
          </div>
        </div>
      </div>
    </motion.button>
  );
};

export default TutorialIcon;

import React from 'react';
import { motion } from 'framer-motion';
import { FiHelpCircle } from 'react-icons/fi';
import { useTutorial } from '../../hooks/useTutorial';
import { useTutorialContext } from '../../context/TutorialContext';

interface TutorialButtonProps {
  tutorialId: string;
  className?: string;
  buttonText?: string;
  showIcon?: boolean;
  iconSize?: number;
  color?: string;
  hoverColor?: string;
  bgColor?: string;
  hoverBgColor?: string;
  tooltip?: string;
}

/**
 * TutorialButton component
 * A button that triggers a specific tutorial when clicked
 */
const TutorialButton: React.FC<TutorialButtonProps> = ({
  tutorialId,
  className = '',
  buttonText = 'Help',
  showIcon = true,
  iconSize = 18,
  color,
  hoverColor,
  bgColor,
  hoverBgColor,
  tooltip
}) => {
  // Get the tutorial context directly to ensure we can force-show the tutorial
  const { showTutorial } = useTutorialContext();
  const { isCompleted } = useTutorial(tutorialId);

  // Create a direct function to open the tutorial that bypasses any checks
  const openTutorial = () => {
    console.log(`TutorialButton: Force opening tutorial ${tutorialId}`);
    // Pass true to force show the tutorial even if it's completed or disabled
    showTutorial(tutorialId, true);
  };

  return (
    <motion.button
      className={`group relative flex items-center justify-center transition-all duration-200 ${className || 'px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm hover:shadow'}`}
      onClick={openTutorial}
      aria-label="Open tutorial"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      style={{
        backgroundColor: bgColor,
        color: color
      }}
      title={tooltip || `Show ${buttonText} tutorial`}
    >
      {showIcon && (
        <div className="relative">
          <FiHelpCircle
            size={iconSize}
            className={`transition-colors duration-200 ${buttonText ? 'mr-2' : ''}`}
          />

          {/* Pulse effect for new users */}
          {!isCompleted && (
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
          )}
        </div>
      )}

      {buttonText && <span className="font-medium">{buttonText}</span>}
    </motion.button>
  );
};

export default TutorialButton;

import React from 'react';
import { FiHelpCircle } from 'react-icons/fi';
import { useTutorial } from '../../hooks/useTutorial';

interface TutorialButtonProps {
  tutorialId: string;
  className?: string;
  buttonText?: string;
  showIcon?: boolean;
}

/**
 * TutorialButton component
 * A button that triggers a specific tutorial when clicked
 */
const TutorialButton: React.FC<TutorialButtonProps> = ({
  tutorialId,
  className = '',
  buttonText = 'Help',
  showIcon = true
}) => {
  const { openTutorial } = useTutorial(tutorialId);

  return (
    <button
      className={`flex items-center justify-center transition-colors ${className || 'px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700'}`}
      onClick={openTutorial}
      aria-label="Open tutorial"
    >
      {showIcon && <FiHelpCircle className={buttonText ? 'mr-2' : ''} />}
      {buttonText && <span>{buttonText}</span>}
    </button>
  );
};

export default TutorialButton;

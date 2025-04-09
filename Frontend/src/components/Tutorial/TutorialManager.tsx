import React, { useState, useEffect } from 'react';
import TutorialCards from './TutorialCards';
import TutorialButton from './TutorialButton';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center';
  element?: string;
  image?: string;
}

interface TutorialManagerProps {
  steps: TutorialStep[];
  tutorialId: string;
  buttonPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showOnFirstVisit?: boolean;
}

const TutorialManager: React.FC<TutorialManagerProps> = ({
  steps,
  tutorialId,
  buttonPosition = 'bottom-right',
  showOnFirstVisit = true
}) => {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Check if this tutorial has been completed before
    const hasCompletedTutorial = localStorage.getItem(`tutorial-${tutorialId}-completed`) === 'true';
    const hasSeenTutorial = localStorage.getItem(`tutorial-${tutorialId}-seen`) === 'true';

    // Show tutorial on first visit if enabled and not completed or seen before
    if (showOnFirstVisit && !hasCompletedTutorial && !hasSeenTutorial) {
      // Small delay to ensure the page is fully loaded
      const timer = setTimeout(() => {
        setIsTutorialOpen(true);
        // Mark as seen
        localStorage.setItem(`tutorial-${tutorialId}-seen`, 'true');
      }, 1000);

      return () => clearTimeout(timer);
    }

    // Always show the button
    setShowButton(true);
  }, [tutorialId, showOnFirstVisit]);

  const handleOpenTutorial = () => {
    setIsTutorialOpen(true);
  };

  const handleCloseTutorial = () => {
    setIsTutorialOpen(false);
  };

  const handleCompleteTutorial = () => {
    // This is handled in the TutorialCards component
  };

  // Define button position classes
  const buttonPositionClasses = {
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'top-right': 'fixed top-4 right-4',
    'top-left': 'fixed top-4 left-4'
  };

  return (
    <>
      {/* Tutorial Cards */}
      <TutorialCards
        steps={steps}
        isOpen={isTutorialOpen}
        onClose={handleCloseTutorial}
        onComplete={handleCompleteTutorial}
        tutorialId={tutorialId}
      />

      {/* Tutorial Button */}
      {showButton && !isTutorialOpen && (
        <div className={buttonPositionClasses[buttonPosition]}>
          <TutorialButton onClick={handleOpenTutorial} />
        </div>
      )}
    </>
  );
};

export default TutorialManager;

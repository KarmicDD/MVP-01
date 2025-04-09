import React, { useState, useEffect } from 'react';
import TutorialCards from './TutorialCards';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  image?: string;
}

interface TutorialCardsManagerProps {
  steps: TutorialStep[];
  tutorialId: string;
  showOnFirstVisit?: boolean;
}

const TutorialCardsManager: React.FC<TutorialCardsManagerProps> = ({
  steps,
  tutorialId,
  showOnFirstVisit = true
}) => {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [hasVisitedBefore, setHasVisitedBefore] = useState(false);

  useEffect(() => {
    // Check if this tutorial has been completed before
    const hasCompletedTutorial = localStorage.getItem(`tutorial-${tutorialId}-completed`) === 'true';
    setHasVisitedBefore(hasCompletedTutorial);

    // Show tutorial on first visit if enabled
    if (showOnFirstVisit && !hasCompletedTutorial) {
      // Small delay to ensure the page is fully loaded
      const timer = setTimeout(() => {
        setIsTutorialOpen(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [tutorialId, showOnFirstVisit]);

  const handleOpenTutorial = () => {
    setIsTutorialOpen(true);
  };

  const handleCloseTutorial = () => {
    setIsTutorialOpen(false);
  };

  const handleCompleteTutorial = () => {
    // This is handled in the TutorialCards component
    setHasVisitedBefore(true);
  };

  return (
    <>
      <TutorialCards
        steps={steps}
        isOpen={isTutorialOpen}
        onClose={handleCloseTutorial}
        onComplete={handleCompleteTutorial}
        tutorialId={tutorialId}
      />

      {/* Button to reopen tutorial */}
      {!isTutorialOpen && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 flex items-center justify-center"
            onClick={handleOpenTutorial}
            aria-label="Open Tutorial"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
};

export default TutorialCardsManager;

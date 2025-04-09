import { useState, useEffect } from 'react';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center';
  element?: string;
  image?: string;
}

interface TutorialOptions {
  tutorialId: string;
  steps: TutorialStep[];
  autoStart?: boolean;
  showOnlyOnce?: boolean;
}

export const useTutorial = ({ tutorialId, steps, autoStart = true, showOnlyOnce = true }: TutorialOptions) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(false);

  // Check if the tutorial has been completed before
  useEffect(() => {
    const completedTutorials = JSON.parse(localStorage.getItem('completedTutorials') || '{}');
    if (completedTutorials[tutorialId]) {
      setHasCompletedTutorial(true);
    }
  }, [tutorialId]);

  // Auto-start the tutorial if enabled and not completed
  useEffect(() => {
    if (autoStart && !hasCompletedTutorial) {
      // Small delay to ensure the UI is fully rendered
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [autoStart, hasCompletedTutorial]);

  const openTutorial = () => {
    setIsOpen(true);
  };

  const closeTutorial = () => {
    setIsOpen(false);
  };

  const completeTutorial = () => {
    if (showOnlyOnce) {
      // Mark this tutorial as completed
      const completedTutorials = JSON.parse(localStorage.getItem('completedTutorials') || '{}');
      completedTutorials[tutorialId] = true;
      localStorage.setItem('completedTutorials', JSON.stringify(completedTutorials));
      setHasCompletedTutorial(true);
    }
  };

  const resetTutorial = () => {
    // Remove this tutorial from completed list
    const completedTutorials = JSON.parse(localStorage.getItem('completedTutorials') || '{}');
    delete completedTutorials[tutorialId];
    localStorage.setItem('completedTutorials', JSON.stringify(completedTutorials));
    setHasCompletedTutorial(false);
  };

  return {
    isOpen,
    hasCompletedTutorial,
    openTutorial,
    closeTutorial,
    completeTutorial,
    resetTutorial,
    steps
  };
};

export default useTutorial;

import { useEffect } from 'react';
import { useTutorialContext } from '../context/TutorialContext';

interface UseTutorialOptions {
  autoStart?: boolean;
  showOnlyOnce?: boolean;
}

/**
 * Custom hook for using tutorials in components
 * @param tutorialId The ID of the tutorial to use
 * @param options Configuration options
 * @returns Tutorial control functions and state
 */
export const useTutorial = (tutorialId: string, options: UseTutorialOptions = {}) => {
  // Use a try-catch block to handle any potential errors with the context
  try {
    const {
      showTutorial,
      hideTutorial,
      nextStep,
      previousStep,
      markCompleted,
      activeTutorial,
      completedTutorials,
      currentStep,
      totalSteps,
      getCurrentTutorial,
      getCurrentStep,
      tutorials // Get tutorials here, from the same hook call
    } = useTutorialContext();

    const { autoStart = false, showOnlyOnce = true } = options;

    // Check if this tutorial is currently active
    const isActive = activeTutorial === tutorialId;

    // Check if this tutorial has been completed (with safety check)
    const isCompleted = Array.isArray(completedTutorials) && completedTutorials.includes(tutorialId);

    // Auto-start the tutorial if configured
    useEffect(() => {
      if (autoStart && !isActive && (!showOnlyOnce || !isCompleted)) {
        // Small delay to ensure the component is fully mounted and tutorials are registered
        const timer = setTimeout(() => {
          // Check if the tutorial exists before showing it
          if (tutorialId in (tutorials || {})) {
            showTutorial(tutorialId);
          } else {
            console.warn(`Auto-start: Tutorial with ID "${tutorialId}" not found. Make sure it's registered.`);
          }
        }, 1000); // Increased delay to ensure tutorials are registered

        return () => clearTimeout(timer);
      }
    }, [autoStart, isActive, isCompleted, showOnlyOnce, showTutorial, tutorialId, tutorials]);

    // Function to open this specific tutorial
    const openTutorial = () => {
      // Check if the tutorial exists in the context before showing it
      if (tutorialId in (tutorials || {})) {
        showTutorial(tutorialId);
      } else {
        console.warn(`Tutorial with ID "${tutorialId}" not found. Make sure it's registered.`);
      }
    };

    // Function to close this specific tutorial
    const closeTutorial = () => {
      if (isActive) {
        hideTutorial();
      }
    };

    // Function to complete this specific tutorial
    const completeTutorial = () => {
      markCompleted(tutorialId);
      hideTutorial();
    };

    // Function to reset this specific tutorial's completion status
    const resetTutorial = () => {
      // This is handled at the context level with resetTutorials
      // We would need to extend the context to support resetting individual tutorials
    };

    return {
      isActive,
      isCompleted,
      currentStep: isActive ? currentStep : 0,
      totalSteps: isActive ? totalSteps : 0,
      openTutorial,
      closeTutorial,
      completeTutorial,
      resetTutorial,
      nextStep: isActive ? nextStep : () => { },
      previousStep: isActive ? previousStep : () => { },
      tutorial: getCurrentTutorial(),
      step: getCurrentStep()
    };
  } catch (error) {
    console.error('Error in useTutorial hook:', error);

    // Return a fallback object with no-op functions
    return {
      isActive: false,
      isCompleted: false,
      currentStep: 0,
      totalSteps: 0,
      openTutorial: () => { },
      closeTutorial: () => { },
      completeTutorial: () => { },
      resetTutorial: () => { },
      nextStep: () => { },
      previousStep: () => { },
      tutorial: null,
      step: null
    };
  }
};

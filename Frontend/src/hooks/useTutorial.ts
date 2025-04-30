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
    // First check the context state
    const isCompletedInState = Array.isArray(completedTutorials) && completedTutorials.includes(tutorialId);

    // Also check localStorage directly as a fallback
    let isCompletedInStorage = false;
    try {
      const storedCompletedTutorials = localStorage.getItem('completedTutorials');
      if (storedCompletedTutorials) {
        const parsed = JSON.parse(storedCompletedTutorials);
        if (Array.isArray(parsed)) {
          isCompletedInStorage = parsed.includes(tutorialId);
        }
      }
    } catch (error) {
      console.error('Error checking localStorage for completed tutorials:', error);
    }

    // Consider the tutorial completed if it's marked as completed in either state or localStorage
    const isCompleted = isCompletedInState || isCompletedInStorage;

    // Auto-start the tutorial if configured
    useEffect(() => {
      if (autoStart && !isActive) {
        // Don't show if it's completed and showOnlyOnce is true
        if (showOnlyOnce && isCompleted) {
          console.log(`Auto-start: Tutorial "${tutorialId}" is already completed and showOnlyOnce is true.`);
          return;
        }

        // Small delay to ensure the component is fully mounted and tutorials are registered
        const timer = setTimeout(() => {
          // Check if the tutorial exists before showing it
          if (tutorialId in (tutorials || {})) {
            console.log(`Auto-start: Showing tutorial "${tutorialId}"`);
            // Don't force show for auto-start - respect the completed/disabled status
            showTutorial(tutorialId, false);
          } else {
            console.warn(`Auto-start: Tutorial with ID "${tutorialId}" not found. Make sure it's registered.`);
          }
        }, 1500); // Increased delay to ensure tutorials are registered

        return () => clearTimeout(timer);
      }
    }, [autoStart, isActive, isCompleted, showOnlyOnce, showTutorial, tutorialId, tutorials]);

    // Function to open this specific tutorial
    const openTutorial = () => {
      // Check if the tutorial exists in the context before showing it
      if (tutorialId in (tutorials || {})) {
        // Always show the tutorial when explicitly requested, even if completed
        console.log(`Explicitly opening tutorial: ${tutorialId}`);

        // Check if the tutorial is marked as completed in localStorage
        try {
          const storedCompletedTutorials = localStorage.getItem('completedTutorials');
          if (storedCompletedTutorials) {
            const parsed = JSON.parse(storedCompletedTutorials);
            if (Array.isArray(parsed) && parsed.includes(tutorialId)) {
              console.log(`Tutorial "${tutorialId}" is marked as completed in localStorage, but showing anyway since explicitly requested`);
            }
          }
        } catch (error) {
          console.error('Error checking localStorage for completed tutorials:', error);
        }

        // Force show the tutorial by directly setting it in the context
        // Pass true to force show the tutorial even if it's completed or disabled
        showTutorial(tutorialId, true);

        // Add a small delay to ensure the tutorial is shown
        setTimeout(() => {
          if (!activeTutorial) {
            console.log(`Retrying to open tutorial: ${tutorialId}`);
            showTutorial(tutorialId, true);
          }
        }, 100);
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
      console.log(`Explicitly completing tutorial: ${tutorialId}`);

      // First mark it as completed in the context
      markCompleted(tutorialId);

      // Also directly update localStorage as a backup
      try {
        const storedCompletedTutorials = localStorage.getItem('completedTutorials');
        let completedList = [];

        if (storedCompletedTutorials) {
          try {
            const parsed = JSON.parse(storedCompletedTutorials);
            if (Array.isArray(parsed)) {
              completedList = parsed;
            }
          } catch (parseError) {
            console.error('Error parsing completedTutorials from localStorage:', parseError);
          }
        }

        // Add this tutorial to the completed list if not already there
        if (!completedList.includes(tutorialId)) {
          completedList.push(tutorialId);
          localStorage.setItem('completedTutorials', JSON.stringify(completedList));
          console.log(`Directly updated localStorage completedTutorials:`, completedList);
        }
      } catch (error) {
        console.error('Error updating localStorage in completeTutorial:', error);
      }

      // Finally hide the tutorial
      hideTutorial();
    };

    // Function to reset this specific tutorial's completion status (disabled)
    const resetTutorial = () => {
      console.log('Tutorial reset functionality has been disabled');
      // No-op function - reset functionality has been removed
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

import React, { createContext, useState, useContext, useEffect } from 'react';

// Define the structure for tutorial steps
export interface TutorialStep {
  id: string;
  title: string;
  content: React.ReactNode | string;
  image?: string;
  video?: string;
  link?: {
    url: string;
    text?: string;
  };
}

// Define the structure for a complete tutorial
export interface Tutorial {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  triggeredBy?: string[];
  prerequisiteTutorials?: string[];
}

// Define the context type
interface TutorialContextType {
  activeTutorial: string | null;
  currentStep: number;
  totalSteps: number;
  completedTutorials: string[];
  disabledTutorials: string[];
  showTutorial: (tutorialId: string, forceShow?: boolean) => void;
  hideTutorial: () => void;
  nextStep: () => void;
  previousStep: () => void;
  markCompleted: (tutorialId: string) => void;
  disableTutorial: (tutorialId: string) => void;
  resetTutorials: () => void;
  tutorials: Record<string, Tutorial>;
  registerTutorials: (newTutorials: Record<string, Tutorial>) => void;
  getCurrentTutorial: () => Tutorial | null;
  getCurrentStep: () => TutorialStep | null;
}

// Create the context with default values
const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

// Create a provider component
export const TutorialProvider: React.FC<{ children: React.ReactNode, initialTutorials?: Record<string, Tutorial> }> = ({
  children,
  initialTutorials = {}
}) => {
  // State for tracking the active tutorial and current step
  const [activeTutorial, setActiveTutorial] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);
  const [disabledTutorials, setDisabledTutorials] = useState<string[]>([]);
  const [tutorials, setTutorials] = useState<Record<string, Tutorial>>(initialTutorials);

  // Load completed and disabled tutorials from localStorage on mount
  useEffect(() => {
    try {
      // Load completed tutorials
      const savedCompletedTutorials = localStorage.getItem('completedTutorials');
      console.log('Initial load - localStorage completedTutorials:', savedCompletedTutorials);

      if (savedCompletedTutorials) {
        try {
          const parsed = JSON.parse(savedCompletedTutorials);
          // Ensure it's an array
          if (Array.isArray(parsed)) {
            console.log('Setting completedTutorials from localStorage:', parsed);
            setCompletedTutorials(parsed);
          } else {
            console.error('Completed tutorials is not an array, resetting to empty array');
            setCompletedTutorials([]);
            // Fix the localStorage value
            localStorage.setItem('completedTutorials', JSON.stringify([]));
          }
        } catch (parseError) {
          console.error('Error parsing completedTutorials from localStorage:', parseError);
          setCompletedTutorials([]);
          // Fix the localStorage value
          localStorage.setItem('completedTutorials', JSON.stringify([]));
        }
      } else {
        // Initialize localStorage if it doesn't exist
        console.log('No completedTutorials in localStorage, initializing with empty array');
        localStorage.setItem('completedTutorials', JSON.stringify([]));
      }

      // Load disabled tutorials
      const savedDisabledTutorials = localStorage.getItem('disabledTutorials');
      console.log('Initial load - localStorage disabledTutorials:', savedDisabledTutorials);

      if (savedDisabledTutorials) {
        try {
          const parsed = JSON.parse(savedDisabledTutorials);
          // Ensure it's an array
          if (Array.isArray(parsed)) {
            console.log('Setting disabledTutorials from localStorage:', parsed);
            setDisabledTutorials(parsed);
          } else {
            console.error('Disabled tutorials is not an array, resetting to empty array');
            setDisabledTutorials([]);
            // Fix the localStorage value
            localStorage.setItem('disabledTutorials', JSON.stringify([]));
          }
        } catch (parseError) {
          console.error('Error parsing disabledTutorials from localStorage:', parseError);
          setDisabledTutorials([]);
          // Fix the localStorage value
          localStorage.setItem('disabledTutorials', JSON.stringify([]));
        }
      } else {
        // Initialize localStorage if it doesn't exist
        console.log('No disabledTutorials in localStorage, initializing with empty array');
        localStorage.setItem('disabledTutorials', JSON.stringify([]));
      }
    } catch (error) {
      console.error('Error loading tutorial state from localStorage:', error);
      // Reset to default values if there's an error
      setCompletedTutorials([]);
      setDisabledTutorials([]);

      // Try to reset localStorage
      try {
        localStorage.setItem('completedTutorials', JSON.stringify([]));
        localStorage.setItem('disabledTutorials', JSON.stringify([]));
      } catch (resetError) {
        console.error('Error resetting localStorage:', resetError);
      }
    }
  }, []);

  // Save completed tutorials to localStorage when they change
  useEffect(() => {
    if (Array.isArray(completedTutorials)) {
      try {
        console.log('Saving completedTutorials to localStorage:', completedTutorials);
        localStorage.setItem('completedTutorials', JSON.stringify(completedTutorials));

        // Verify the localStorage was updated correctly
        const storedValue = localStorage.getItem('completedTutorials');
        console.log(`Verification after state change - localStorage now contains:`, storedValue);

        // Parse and check if the stored value matches what we intended to save
        try {
          const parsedValue = JSON.parse(storedValue || '[]');
          if (!Array.isArray(parsedValue) || parsedValue.length !== completedTutorials.length) {
            console.warn('localStorage value does not match state after saving completedTutorials');
            // Try to fix it
            localStorage.setItem('completedTutorials', JSON.stringify(completedTutorials));
          }
        } catch (parseError) {
          console.error('Error parsing stored completedTutorials for verification:', parseError);
          // Try to fix it
          localStorage.setItem('completedTutorials', JSON.stringify(completedTutorials));
        }
      } catch (error) {
        console.error('Error saving completedTutorials to localStorage:', error);
      }
    }
  }, [completedTutorials]);

  // Save disabled tutorials to localStorage when they change
  useEffect(() => {
    if (Array.isArray(disabledTutorials)) {
      try {
        console.log('Saving disabledTutorials to localStorage:', disabledTutorials);
        localStorage.setItem('disabledTutorials', JSON.stringify(disabledTutorials));

        // Verify the localStorage was updated correctly
        const storedValue = localStorage.getItem('disabledTutorials');
        console.log(`Verification after state change - localStorage now contains:`, storedValue);

        // Parse and check if the stored value matches what we intended to save
        try {
          const parsedValue = JSON.parse(storedValue || '[]');
          if (!Array.isArray(parsedValue) || parsedValue.length !== disabledTutorials.length) {
            console.warn('localStorage value does not match state after saving disabledTutorials');
            // Try to fix it
            localStorage.setItem('disabledTutorials', JSON.stringify(disabledTutorials));
          }
        } catch (parseError) {
          console.error('Error parsing stored disabledTutorials for verification:', parseError);
          // Try to fix it
          localStorage.setItem('disabledTutorials', JSON.stringify(disabledTutorials));
        }
      } catch (error) {
        console.error('Error saving disabledTutorials to localStorage:', error);
      }
    }
  }, [disabledTutorials]);

  // Calculate total steps for the active tutorial
  const totalSteps = activeTutorial && tutorials[activeTutorial]
    ? tutorials[activeTutorial].steps.length
    : 0;

  // Function to show a tutorial
  const showTutorial = (tutorialId: string, forceShow: boolean = false) => {
    console.log(`Attempting to show tutorial: ${tutorialId}${forceShow ? ' (forced)' : ''}`);

    // Check localStorage directly for completedTutorials
    try {
      const storedCompletedTutorials = localStorage.getItem('completedTutorials');
      if (storedCompletedTutorials) {
        const parsedCompletedTutorials = JSON.parse(storedCompletedTutorials);
        console.log(`Found in localStorage - completedTutorials:`, parsedCompletedTutorials);

        // If this tutorial is in localStorage as completed, update our state to match
        if (Array.isArray(parsedCompletedTutorials) && parsedCompletedTutorials.includes(tutorialId)) {
          console.log(`Tutorial "${tutorialId}" found in localStorage as completed, updating state`);

          // Only update state if it doesn't already include this tutorial
          if (!completedTutorials.includes(tutorialId)) {
            setCompletedTutorials(prev =>
              Array.isArray(prev) ? [...prev, tutorialId] : [tutorialId]
            );
          }
        }
      }
    } catch (error) {
      console.error('Error checking localStorage for completed tutorials:', error);
    }

    // Don't show disabled tutorials (with safety check) unless forceShow is true
    if (!forceShow && Array.isArray(disabledTutorials) && disabledTutorials.includes(tutorialId)) {
      console.log(`Tutorial "${tutorialId}" is disabled and won't be shown. Use forceShow to override.`);
      return;
    }

    // Check if the tutorial exists - always show when explicitly requested
    if (tutorials && tutorialId in tutorials) {
      console.log(`Showing tutorial: ${tutorialId}`);

      // Force reset the current step first
      setCurrentStep(0);

      // Then set the active tutorial
      setActiveTutorial(tutorialId);

      // Log the tutorial that's being shown
      console.log(`Tutorial set to: ${tutorialId}, steps: ${tutorials[tutorialId].steps.length}`);
    } else {
      console.warn(`Tutorial with ID "${tutorialId}" not found. Available tutorials: ${Object.keys(tutorials || {}).join(', ')}`);
    }
  };

  // Function to hide the active tutorial
  const hideTutorial = () => {
    setActiveTutorial(null);
    setCurrentStep(0);
  };

  // Function to navigate to the next step
  const nextStep = () => {
    if (activeTutorial && currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      console.log(`Tutorial step advanced to ${currentStep + 1} of ${totalSteps}`);
    } else if (activeTutorial) {
      // If we're at the last step, mark the tutorial as completed and hide it
      console.log(`Tutorial "${activeTutorial}" completed - reached last step`);

      // Mark as completed and ensure it's saved to localStorage
      markCompleted(activeTutorial);

      // Log the current state of localStorage for debugging
      console.log('Current localStorage completedTutorials:', localStorage.getItem('completedTutorials'));

      // Add a small delay before hiding to ensure state is updated
      setTimeout(() => {
        // Double-check that localStorage was updated
        console.log('After completion, localStorage completedTutorials:', localStorage.getItem('completedTutorials'));

        // Hide the tutorial after ensuring localStorage is updated
        hideTutorial();
      }, 500); // Increased delay to ensure state updates
    }
  };

  // Function to navigate to the previous step
  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Function to mark a tutorial as completed
  const markCompleted = (tutorialId: string) => {
    try {
      // Safety check to ensure completedTutorials is an array
      if (!Array.isArray(completedTutorials)) {
        const newCompletedTutorials = [tutorialId];

        // Update state
        setCompletedTutorials(newCompletedTutorials);

        // Directly update localStorage to ensure it's saved immediately
        try {
          localStorage.setItem('completedTutorials', JSON.stringify(newCompletedTutorials));
          console.log(`Tutorial "${tutorialId}" marked as completed (initialized array)`);
          console.log(`Updated localStorage with completedTutorials:`, newCompletedTutorials);

          // Verify the localStorage was updated correctly
          const storedValue = localStorage.getItem('completedTutorials');
          console.log(`Verification - localStorage now contains:`, storedValue);
        } catch (storageError) {
          console.error('Error saving to localStorage:', storageError);
        }

        return;
      }

      if (!completedTutorials.includes(tutorialId)) {
        const newCompletedTutorials = [...completedTutorials, tutorialId];

        // Update state
        setCompletedTutorials(newCompletedTutorials);

        // Directly update localStorage to ensure it's saved immediately
        try {
          localStorage.setItem('completedTutorials', JSON.stringify(newCompletedTutorials));
          console.log(`Tutorial "${tutorialId}" marked as completed. All completed tutorials:`, newCompletedTutorials);
          console.log(`Updated localStorage with completedTutorials:`, newCompletedTutorials);

          // Verify the localStorage was updated correctly
          const storedValue = localStorage.getItem('completedTutorials');
          console.log(`Verification - localStorage now contains:`, storedValue);
        } catch (storageError) {
          console.error('Error saving to localStorage:', storageError);
        }
      } else {
        // Even if it's already in the array, let's ensure it's in localStorage
        try {
          localStorage.setItem('completedTutorials', JSON.stringify(completedTutorials));
          console.log(`Tutorial "${tutorialId}" was already marked as completed, ensuring localStorage is updated`);

          // Verify the localStorage was updated correctly
          const storedValue = localStorage.getItem('completedTutorials');
          console.log(`Verification - localStorage now contains:`, storedValue);
        } catch (storageError) {
          console.error('Error saving to localStorage:', storageError);
        }
      }
    } catch (error) {
      console.error('Error in markCompleted function:', error);

      // Fallback: try to directly update localStorage with just this tutorial ID
      try {
        const fallbackArray = [tutorialId];
        localStorage.setItem('completedTutorials', JSON.stringify(fallbackArray));
        setCompletedTutorials(fallbackArray);
        console.log('Used fallback method to mark tutorial as completed');
      } catch (fallbackError) {
        console.error('Even fallback method failed:', fallbackError);
      }
    }
  };

  // Function to mark a tutorial as disabled (don't show again)
  const disableTutorial = (tutorialId: string) => {
    // Safety check to ensure disabledTutorials is an array
    if (!Array.isArray(disabledTutorials)) {
      const newDisabledTutorials = [tutorialId];
      setDisabledTutorials(newDisabledTutorials);

      // Directly update localStorage to ensure it's saved immediately
      localStorage.setItem('disabledTutorials', JSON.stringify(newDisabledTutorials));

      console.log(`Tutorial "${tutorialId}" disabled (initialized array)`);
      console.log(`Updated localStorage with disabledTutorials:`, newDisabledTutorials);
      return;
    }

    if (!disabledTutorials.includes(tutorialId)) {
      const newDisabledTutorials = [...disabledTutorials, tutorialId];
      setDisabledTutorials(newDisabledTutorials);

      // Directly update localStorage to ensure it's saved immediately
      localStorage.setItem('disabledTutorials', JSON.stringify(newDisabledTutorials));

      console.log(`Tutorial "${tutorialId}" disabled. All disabled tutorials:`, newDisabledTutorials);
      console.log(`Updated localStorage with disabledTutorials:`, newDisabledTutorials);
    } else {
      console.log(`Tutorial "${tutorialId}" was already disabled`);
    }
  };

  // Function to reset all tutorials
  const resetTutorials = () => {
    setCompletedTutorials([]);
    setDisabledTutorials([]);
    localStorage.removeItem('completedTutorials');
    localStorage.removeItem('disabledTutorials');
  };

  // Function to register tutorials
  const registerTutorials = (newTutorials: Record<string, Tutorial>) => {
    // Only update if there are actual changes to avoid unnecessary re-renders
    setTutorials(prev => {
      // Check if we already have these tutorials registered
      const hasChanges = Object.keys(newTutorials).some(id =>
        !prev[id] || JSON.stringify(prev[id]) !== JSON.stringify(newTutorials[id])
      );

      // Only update state if there are changes
      return hasChanges ? { ...prev, ...newTutorials } : prev;
    });
  };

  // Function to get the current tutorial
  const getCurrentTutorial = (): Tutorial | null => {
    return activeTutorial ? tutorials[activeTutorial] || null : null;
  };

  // Function to get the current step
  const getCurrentStep = (): TutorialStep | null => {
    const tutorial = getCurrentTutorial();
    return tutorial && tutorial.steps[currentStep] ? tutorial.steps[currentStep] : null;
  };

  // Create the context value
  const contextValue: TutorialContextType = {
    activeTutorial,
    currentStep,
    totalSteps,
    completedTutorials,
    disabledTutorials,
    showTutorial,
    hideTutorial,
    nextStep,
    previousStep,
    markCompleted,
    disableTutorial,
    resetTutorials,
    tutorials,
    registerTutorials,
    getCurrentTutorial,
    getCurrentStep
  };

  return (
    <TutorialContext.Provider value={contextValue}>
      {children}
    </TutorialContext.Provider>
  );
};

// Custom hook for using the tutorial context
export const useTutorialContext = () => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorialContext must be used within a TutorialProvider');
  }
  return context;
};

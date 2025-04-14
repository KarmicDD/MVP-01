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
  showTutorial: (tutorialId: string) => void;
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
      const savedCompletedTutorials = localStorage.getItem('completedTutorials');
      if (savedCompletedTutorials) {
        const parsed = JSON.parse(savedCompletedTutorials);
        // Ensure it's an array
        if (Array.isArray(parsed)) {
          setCompletedTutorials(parsed);
        } else {
          console.error('Completed tutorials is not an array, resetting to empty array');
          setCompletedTutorials([]);
        }
      }

      const savedDisabledTutorials = localStorage.getItem('disabledTutorials');
      if (savedDisabledTutorials) {
        const parsed = JSON.parse(savedDisabledTutorials);
        // Ensure it's an array
        if (Array.isArray(parsed)) {
          setDisabledTutorials(parsed);
        } else {
          console.error('Disabled tutorials is not an array, resetting to empty array');
          setDisabledTutorials([]);
        }
      }
    } catch (error) {
      console.error('Error loading tutorial state from localStorage:', error);
      // Reset to default values if there's an error
      setCompletedTutorials([]);
      setDisabledTutorials([]);
    }
  }, []);

  // Save completed and disabled tutorials to localStorage when they change
  useEffect(() => {
    localStorage.setItem('completedTutorials', JSON.stringify(completedTutorials));
  }, [completedTutorials]);

  useEffect(() => {
    localStorage.setItem('disabledTutorials', JSON.stringify(disabledTutorials));
  }, [disabledTutorials]);

  // Calculate total steps for the active tutorial
  const totalSteps = activeTutorial && tutorials[activeTutorial]
    ? tutorials[activeTutorial].steps.length
    : 0;

  // Function to show a tutorial
  const showTutorial = (tutorialId: string) => {
    // Don't show disabled tutorials (with safety check)
    if (Array.isArray(disabledTutorials) && disabledTutorials.includes(tutorialId)) {
      console.log(`Tutorial "${tutorialId}" is disabled and won't be shown.`);
      return;
    }

    // Check if the tutorial exists
    if (tutorials && tutorialId in tutorials) {
      console.log(`Showing tutorial: ${tutorialId}`);
      setActiveTutorial(tutorialId);
      setCurrentStep(0);
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
    } else if (activeTutorial) {
      // If we're at the last step, mark the tutorial as completed and hide it
      markCompleted(activeTutorial);
      hideTutorial();
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
    // Safety check to ensure completedTutorials is an array
    if (!Array.isArray(completedTutorials)) {
      setCompletedTutorials([tutorialId]);
      return;
    }

    if (!completedTutorials.includes(tutorialId)) {
      setCompletedTutorials([...completedTutorials, tutorialId]);
    }
  };

  // Function to mark a tutorial as disabled (don't show again)
  const disableTutorial = (tutorialId: string) => {
    // Safety check to ensure disabledTutorials is an array
    if (!Array.isArray(disabledTutorials)) {
      setDisabledTutorials([tutorialId]);
      return;
    }

    if (!disabledTutorials.includes(tutorialId)) {
      setDisabledTutorials([...disabledTutorials, tutorialId]);
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
    setTutorials(prev => ({ ...prev, ...newTutorials }));
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

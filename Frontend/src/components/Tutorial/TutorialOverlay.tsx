import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TutorialCard from './TutorialCard';
import { useTutorialContext } from '../../context/TutorialContext';

/**
 * TutorialOverlay component
 * Creates a full-screen overlay that centers the tutorial card
 */
const TutorialOverlay: React.FC = () => {
  const {
    activeTutorial,
    hideTutorial,
    nextStep,
    previousStep,
    currentStep,
    totalSteps,
    getCurrentTutorial,
    getCurrentStep,
    markCompleted, // Now used for "Don't show again" functionality
    disableTutorial
  } = useTutorialContext();

  // Get the current tutorial and step
  const tutorial = getCurrentTutorial();
  const step = getCurrentStep();

  // If no active tutorial or step, don't render anything
  if (!activeTutorial || !tutorial || !step) {
    console.log('TutorialOverlay: No active tutorial or missing data', {
      activeTutorial,
      tutorialExists: tutorial ? 'yes' : 'no',
      stepExists: step ? 'yes' : 'no'
    });
    return null;
  }

  // Log that we're rendering the tutorial
  console.log(`Rendering tutorial: ${activeTutorial}, step ${currentStep + 1}/${totalSteps}`);

  return (
    <AnimatePresence>
      {activeTutorial && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm"
          style={{
            background: 'linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.8))',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`tutorial-title-${currentStep}`}
          onClick={(e) => {
            // Close tutorial when clicking outside the card
            if (e.target === e.currentTarget) {
              hideTutorial();
            }
          }}
        >
          <TutorialCard
            step={step}
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={nextStep}
            onPrevious={previousStep}
            onClose={hideTutorial}
            onDontShowAgain={() => {
              if (activeTutorial) {
                console.log(`User clicked "Don't show again" for tutorial: ${activeTutorial}`);

                try {
                  // First disable the tutorial (add to disabledTutorials)
                  disableTutorial(activeTutorial);

                  // Also mark it as completed
                  markCompleted(activeTutorial);

                  // Log the current state of localStorage for debugging
                  console.log('After "Don\'t show again", localStorage disabledTutorials:',
                    localStorage.getItem('disabledTutorials'));
                  console.log('After "Don\'t show again", localStorage completedTutorials:',
                    localStorage.getItem('completedTutorials'));

                  // Verify localStorage was updated correctly
                  setTimeout(() => {
                    try {
                      const completedTutorialsStr = localStorage.getItem('completedTutorials');
                      if (completedTutorialsStr) {
                        const completedTutorials = JSON.parse(completedTutorialsStr);
                        if (!Array.isArray(completedTutorials) || !completedTutorials.includes(activeTutorial)) {
                          console.warn('Tutorial not properly saved as completed in localStorage, forcing update');
                          // Force update localStorage directly
                          const updatedCompletedTutorials = Array.isArray(completedTutorials)
                            ? [...completedTutorials, activeTutorial]
                            : [activeTutorial];
                          localStorage.setItem('completedTutorials', JSON.stringify(updatedCompletedTutorials));
                        } else {
                          console.log('Verification successful: Tutorial marked as completed in localStorage');
                        }
                      } else {
                        console.warn('completedTutorials not found in localStorage, creating it');
                        localStorage.setItem('completedTutorials', JSON.stringify([activeTutorial]));
                      }
                    } catch (error) {
                      console.error('Error verifying localStorage updates:', error);
                    }
                  }, 300);

                  // Finally hide the tutorial after a delay to ensure localStorage is updated
                  setTimeout(() => {
                    hideTutorial();
                  }, 500);
                } catch (error) {
                  console.error('Error in onDontShowAgain handler:', error);
                  // Fallback: try to directly update localStorage
                  try {
                    const currentStr = localStorage.getItem('completedTutorials');
                    const current = currentStr ? JSON.parse(currentStr) : [];
                    const updated = Array.isArray(current) ? [...current, activeTutorial] : [activeTutorial];
                    localStorage.setItem('completedTutorials', JSON.stringify(updated));
                    console.log('Used fallback method to update localStorage');
                    hideTutorial();
                  } catch (fallbackError) {
                    console.error('Even fallback failed:', fallbackError);
                    hideTutorial();
                  }
                }
              }
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TutorialOverlay;

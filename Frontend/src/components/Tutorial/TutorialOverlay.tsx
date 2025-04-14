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
    // markCompleted, // Destructured but not used in this component
    disableTutorial
  } = useTutorialContext();

  // Get the current tutorial and step
  const tutorial = getCurrentTutorial();
  const step = getCurrentStep();

  // If no active tutorial or step, don't render anything
  if (!activeTutorial || !tutorial || !step) {
    return null;
  }

  return (
    <AnimatePresence>
      {activeTutorial && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
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
                disableTutorial(activeTutorial);
                hideTutorial();
              }
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TutorialOverlay;

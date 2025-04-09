import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiArrowRight, FiArrowLeft, FiHelpCircle } from 'react-icons/fi';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  image?: string;
}

interface TutorialCardsProps {
  steps: TutorialStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  tutorialId: string; // Unique ID for this tutorial to store in localStorage
}

const TutorialCards: React.FC<TutorialCardsProps> = ({
  steps,
  isOpen,
  onClose,
  onComplete,
  tutorialId
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showTutorialButton, setShowTutorialButton] = useState(true);

  const currentStep = steps[currentStepIndex];

  // Check if tutorial has been completed before
  useEffect(() => {
    const hasCompletedTutorial = localStorage.getItem(`tutorial-${tutorialId}-completed`) === 'true';
    if (hasCompletedTutorial) {
      setShowTutorialButton(true);
    }
  }, [tutorialId]);

  // Ensure the tutorial is only shown on first visit
  useEffect(() => {
    // If this is the first time opening the tutorial, mark it as seen
    if (isOpen) {
      localStorage.setItem(`tutorial-${tutorialId}-seen`, 'true');
    }

    // Check if tutorial has been seen before
    const hasSeenTutorial = localStorage.getItem(`tutorial-${tutorialId}-seen`) === 'true';
    if (hasSeenTutorial) {
      // If it's been seen, don't show it automatically next time
      localStorage.setItem(`tutorial-${tutorialId}-autoshow`, 'false');
    }
  }, [isOpen, tutorialId]);

  // Add keyboard shortcut to close tutorial with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleComplete = () => {
    // Save to localStorage that this tutorial has been completed
    localStorage.setItem(`tutorial-${tutorialId}-completed`, 'true');
    onComplete();
    onClose();
    setCurrentStepIndex(0);
    setShowTutorialButton(true);
  };

  const handleOpenTutorial = () => {
    setCurrentStepIndex(0);
    // Reset tutorial state
    localStorage.removeItem(`tutorial-${tutorialId}-completed`);
    // Show the tutorial
    onComplete(); // Reset completion status
    setTimeout(() => {
      // This ensures the tutorial opens properly
      onClose(); // Close current tutorial if open
      setTimeout(() => {
        // Reopen tutorial at first step
        onComplete(); // Reset completion status
      }, 50);
    }, 50);
  };

  if (!isOpen) {
    // Show only the tutorial button when closed
    return showTutorialButton ? (
      <div className="fixed bottom-4 right-4 z-50">
        <motion.button
          className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleOpenTutorial}
          aria-label="Open Tutorial"
        >
          <FiHelpCircle size={24} />
        </motion.button>
      </div>
    ) : null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto max-h-screen">
          {/* Semi-transparent overlay */}
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Tutorial card */}
          <motion.div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 my-4 max-h-[80vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-20"
              onClick={onClose}
            >
              <FiX size={24} />
            </button>

            {/* Card content */}
            <div className="p-6">
              {/* Progress indicator */}
              <div className="flex items-center mb-4">
                <span className="text-sm font-medium text-indigo-600">
                  {currentStepIndex + 1} of {steps.length}
                </span>
                <div className="ml-auto flex space-x-1">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 w-6 rounded-full ${index === currentStepIndex ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                    />
                  ))}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {currentStep.title}
              </h3>

              {/* Content */}
              <div className="text-gray-600 mb-6 prose max-w-none">
                <p>{currentStep.content}</p>
              </div>

              {/* Optional image */}
              {currentStep.image && (
                <div className="mb-6 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={currentStep.image}
                    alt={currentStep.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between mt-6">
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${currentStepIndex > 0
                    ? 'text-indigo-600 hover:bg-indigo-50'
                    : 'text-gray-300 cursor-default'
                    }`}
                  onClick={handlePrevious}
                  disabled={currentStepIndex === 0}
                >
                  <FiArrowLeft className="mr-2" />
                  Previous
                </button>

                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center"
                  onClick={handleNext}
                >
                  {currentStepIndex < steps.length - 1 ? (
                    <>
                      Next
                      <FiArrowRight className="ml-2" />
                    </>
                  ) : (
                    'Complete'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TutorialCards;

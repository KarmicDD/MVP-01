import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiArrowRight, FiCheckCircle, FiHelpCircle, FiInfo } from 'react-icons/fi';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left' | 'center';
  element?: string; // CSS selector for the element to highlight
  image?: string;
}

interface TutorialGuideProps {
  steps: TutorialStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  tutorialId: string; // Unique ID for this tutorial to store in localStorage
}

const TutorialGuide: React.FC<TutorialGuideProps> = ({ steps, isOpen, onClose, onComplete, tutorialId }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const currentStep = steps[currentStepIndex];

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

  // Find and highlight the element for the current step
  useEffect(() => {
    if (!isOpen || !currentStep.element) {
      setHighlightedElement(null);
      return;
    }

    const element = document.querySelector(currentStep.element) as HTMLElement;
    if (element) {
      setHighlightedElement(element);

      // Calculate element position
      const rect = element.getBoundingClientRect();
      setHighlightPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });

      // Calculate tooltip position based on step position preference
      const position = currentStep.position || 'bottom';
      let tooltipTop = 0;
      let tooltipLeft = 0;

      // Get viewport dimensions
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const tooltipHeight = 250; // Approximate height of tooltip
      const tooltipWidth = 300; // Approximate width of tooltip

      // Add safety margin to prevent tooltips from going off-screen
      const safetyMargin = 20;

      // Check if element is in viewport
      const elementInViewport = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= viewportHeight &&
        rect.right <= viewportWidth
      );

      // If element is not fully in viewport, scroll it into view
      if (!elementInViewport) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });

        // Wait for scrolling to complete before calculating position
        setTimeout(() => {
          const updatedRect = element.getBoundingClientRect();
          setHighlightPosition({
            top: updatedRect.top + window.scrollY,
            left: updatedRect.left + window.scrollX,
            width: updatedRect.width,
            height: updatedRect.height
          });
        }, 500);
      }

      switch (position) {
        case 'top':
          tooltipTop = rect.top + window.scrollY - tooltipHeight - 20;
          tooltipLeft = rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'right':
          tooltipTop = rect.top + window.scrollY + rect.height / 2 - tooltipHeight / 2;
          tooltipLeft = rect.left + window.scrollX + rect.width + 20;
          break;
        case 'bottom':
          tooltipTop = rect.bottom + window.scrollY + 20;
          tooltipLeft = rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'left':
          tooltipTop = rect.top + window.scrollY + rect.height / 2 - tooltipHeight / 2;
          tooltipLeft = rect.left + window.scrollX - tooltipWidth - 20;
          break;
        case 'center':
          tooltipTop = viewportHeight / 2 - tooltipHeight / 2;
          tooltipLeft = viewportWidth / 2 - tooltipWidth / 2;
          break;
      }

      // Check if tooltip would go off-screen and adjust if needed
      // Use the safety margin to ensure tooltips don't go off-screen

      // Check bottom edge - make sure tooltip doesn't go below viewport
      if (tooltipTop + tooltipHeight > viewportHeight + window.scrollY - safetyMargin) {
        // If bottom position, move to top if possible
        if (position === 'bottom' && rect.top - tooltipHeight - safetyMargin > 0) {
          tooltipTop = rect.top + window.scrollY - tooltipHeight - safetyMargin;
        } else {
          // Otherwise just place it within safety margin from bottom
          tooltipTop = viewportHeight + window.scrollY - tooltipHeight - safetyMargin;
        }
      }

      // Check top edge - make sure tooltip doesn't go above viewport
      if (tooltipTop < window.scrollY + safetyMargin) {
        // If top position, move to bottom if possible
        if (position === 'top' && rect.bottom + tooltipHeight + safetyMargin < viewportHeight) {
          tooltipTop = rect.bottom + window.scrollY + safetyMargin;
        } else {
          // Otherwise just place it within safety margin
          tooltipTop = window.scrollY + safetyMargin;
        }
      }

      // Check right edge - make sure tooltip doesn't go beyond right edge
      if (tooltipLeft + tooltipWidth > viewportWidth + window.scrollX - safetyMargin) {
        tooltipLeft = viewportWidth + window.scrollX - tooltipWidth - safetyMargin;
      }

      // Check left edge - make sure tooltip doesn't go beyond left edge
      if (tooltipLeft < window.scrollX + safetyMargin) {
        tooltipLeft = window.scrollX + safetyMargin;
      }

      // Additional check to ensure tooltip is always visible on small screens
      // If viewport height is too small, prioritize showing the tooltip at the top
      if (viewportHeight < tooltipHeight + 100) {
        tooltipTop = window.scrollY + safetyMargin;
      }

      setTooltipPosition({ top: tooltipTop, left: tooltipLeft });

      // IMPORTANT: Don't scroll the element into view automatically
      // This was causing issues with the tutorial going off-screen
      // element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isOpen, currentStep]);

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
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay */}
      <motion.div
        className="absolute inset-0 bg-black pointer-events-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ opacity: 0.5 }}
      />

      {/* Highlight cutout */}
      {highlightedElement && (
        <motion.div
          className="absolute bg-transparent border-2 border-indigo-500 rounded-md z-10 pointer-events-none"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: 1,
            scale: 1,
            top: highlightPosition.top,
            left: highlightPosition.left,
            width: highlightPosition.width,
            height: highlightPosition.height
          }}
          transition={{ duration: 0.3 }}
          style={{
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
          }}
        />
      )}

      {/* Tooltip */}
      <motion.div
        className="absolute bg-white rounded-lg shadow-xl p-5 w-80 pointer-events-auto z-20"
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: 1,
          y: 0,
          top: tooltipPosition.top,
          left: tooltipPosition.left
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Emergency close button - always visible at the top */}
        <div className="fixed top-4 right-4 z-50">
          <button
            className="bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 flex items-center justify-center"
            onClick={onClose}
          >
            <FiX size={24} />
          </button>
        </div>
        {/* Close button */}
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <FiX size={20} />
        </button>

        {/* Step indicator */}
        <div className="flex items-center mb-1">
          <span className="text-xs font-medium text-indigo-600">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
          <div className="ml-auto flex space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-5 rounded-full ${index === currentStepIndex ? 'bg-indigo-600' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
          <FiInfo className="mr-2 text-indigo-500" />
          {currentStep.title}
        </h3>

        {/* Content */}
        <p className="text-gray-600 mb-4">
          {currentStep.content}
        </p>

        {/* Optional image */}
        {currentStep.image && (
          <img
            src={currentStep.image}
            alt={currentStep.title}
            className="w-full h-auto rounded-md mb-4 border border-gray-200"
          />
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-4">
          <button
            className="px-3 py-1.5 text-gray-600 hover:text-gray-900 text-sm font-medium"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
          >
            {currentStepIndex > 0 ? 'Previous' : ''}
          </button>

          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center"
            onClick={handleNext}
          >
            {currentStepIndex < steps.length - 1 ? (
              <>Next <FiArrowRight className="ml-1" /></>
            ) : (
              <>Complete <FiCheckCircle className="ml-1" /></>
            )}
          </button>
        </div>
      </motion.div>

      {/* Help button to reopen tutorial */}
      <div className="fixed bottom-4 right-4 pointer-events-auto">
        <motion.button
          className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrentStepIndex(0)}
        >
          <FiHelpCircle size={24} />
        </motion.button>
      </div>
    </div>
  );
};

export default TutorialGuide;

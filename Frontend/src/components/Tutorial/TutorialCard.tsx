import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { TutorialStep } from '../../context/TutorialContext';
import TutorialControls from './TutorialControls';
import TutorialContent from './TutorialContent';

interface TutorialCardProps {
  step: TutorialStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  onDontShowAgain?: () => void;
}

/**
 * TutorialCard component
 * Displays a single tutorial step with navigation controls
 */
const TutorialCard: React.FC<TutorialCardProps> = ({
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onClose,
  onDontShowAgain
}) => {
  // Create a ref for the close button to manage focus
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
          onNext();
          break;
        case 'ArrowLeft':
          if (currentStep > 0) {
            onPrevious();
          }
          break;
        case 'Escape':
          onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentStep, onNext, onPrevious, onClose]);

  // Focus management - focus the close button when the tutorial opens
  useEffect(() => {
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, []);
  return (
    <motion.div
      className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-2xl w-full mx-4 border border-gray-100"
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 10 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling to overlay
      tabIndex={-1} // Make the card focusable for screen readers
      style={{
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        zIndex: 10000
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex justify-between items-center"
        style={{
          background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h2
          className="text-xl font-bold text-white flex items-center"
          id={`tutorial-title-${currentStep}`}
        >
          <span className="bg-white text-indigo-600 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mr-3">
            {currentStep + 1}
          </span>
          {step.title}
        </h2>
        <button
          ref={closeButtonRef}
          className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white/10"
          onClick={onClose}
          aria-label="Close tutorial"
          title="Close tutorial"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Content */}
      <TutorialContent step={step} />

      {/* Controls */}
      <TutorialControls
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={onNext}
        onPrevious={onPrevious}
        onClose={onClose}
        onDontShowAgain={onDontShowAgain}
      />
    </motion.div>
  );
};

export default TutorialCard;

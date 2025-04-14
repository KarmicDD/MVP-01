import React from 'react';
import { FiArrowLeft, FiArrowRight, FiX } from 'react-icons/fi';

interface TutorialControlsProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  onDontShowAgain?: () => void;
}

/**
 * TutorialControls component
 * Provides navigation buttons and progress indicator for tutorials
 */
const TutorialControls: React.FC<TutorialControlsProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onClose,
  onDontShowAgain
}) => {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
      {/* Progress indicator */}
      <div className="flex flex-col items-start space-y-2">
        <div className="text-sm text-gray-500">
          {currentStep + 1} of {totalSteps}
        </div>
        <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
        <div className="flex space-x-1 mt-1">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${index === currentStep ? 'bg-indigo-600' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center space-x-2">
        {!isFirstStep && (
          <button
            className="px-4 py-2 text-gray-700 hover:text-indigo-600 flex items-center transition-colors"
            onClick={onPrevious}
            aria-label="Previous step"
          >
            <FiArrowLeft className="mr-1" />
            <span>Previous</span>
          </button>
        )}

        {isLastStep ? (
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            onClick={onClose}
            aria-label="Finish tutorial"
          >
            <span>Finish</span>
          </button>
        ) : (
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
            onClick={onNext}
            aria-label="Next step"
          >
            <span>Next</span>
            <FiArrowRight className="ml-1" />
          </button>
        )}

        {!isLastStep && (
          <div className="flex items-center space-x-2">
            <button
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={onClose}
              aria-label="Skip tutorial"
            >
              <FiX />
            </button>
            {onDontShowAgain && (
              <button
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors underline"
                onClick={onDontShowAgain}
                aria-label="Don't show again"
              >
                Don't show again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorialControls;

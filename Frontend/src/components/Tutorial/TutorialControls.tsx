import React, { useMemo } from 'react';
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

  // Memoize step dots to avoid re-creating on each render
  const stepDots = useMemo(() =>
    Array.from({ length: totalSteps }).map((_, index) => (
      <button
        key={index}
        className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${index === currentStep
          ? 'bg-indigo-600 scale-125'
          : index < currentStep
            ? 'bg-indigo-300'
            : 'bg-gray-300'
          }`}
        onClick={() => {
          // Allow clicking on dots to navigate directly to that step
          if (index < currentStep) {
            // Go back multiple steps
            for (let i = 0; i < currentStep - index; i++) {
              onPrevious();
            }
          } else if (index > currentStep) {
            // Go forward multiple steps
            for (let i = 0; i < index - currentStep; i++) {
              onNext();
            }
          }
        }}
        aria-label={`Go to step ${index + 1}`}
        title={`Go to step ${index + 1}`}
      />
    )),
    [currentStep, totalSteps, onNext, onPrevious]
  );

  return (
    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
      {/* Progress dots */}
      <div className="flex justify-center mb-4">
        <div className="flex space-x-2">
          {stepDots}
        </div>
      </div>

      <div className="flex items-center justify-between">
        {/* Progress indicator */}
        <div className="flex flex-col items-start space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Step {currentStep + 1} of {totalSteps}
          </div>
          <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600"
              style={{
                width: `${((currentStep + 1) / totalSteps) * 100}%`,
                transition: 'width 0.3s ease-in-out'
              }}
            />
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center space-x-2">
          {!isFirstStep && (
            <button
              className="px-4 py-2 text-gray-700 hover:text-indigo-600 flex items-center transition-colors rounded-md hover:bg-gray-100"
              onClick={onPrevious}
              aria-label="Previous step"
            >
              <FiArrowLeft className="mr-1.5" />
              <span>Previous</span>
            </button>
          )}

          {isLastStep ? (
            <button
              className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-sm hover:shadow"
              onClick={() => {
                // When clicking Finish, we should also trigger the onDontShowAgain function
                // which will mark the tutorial as completed and disabled
                if (onDontShowAgain) {
                  console.log('Finish button clicked - marking tutorial as completed');
                  onDontShowAgain();
                } else {
                  // If no onDontShowAgain function is provided, just close
                  onClose();
                }
              }}
              aria-label="Finish tutorial"
            >
              <span className="font-medium">Finish</span>
            </button>
          ) : (
            <button
              className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center shadow-sm hover:shadow"
              onClick={onNext}
              aria-label="Next step"
            >
              <span className="font-medium">Next</span>
              <FiArrowRight className="ml-1.5" />
            </button>
          )}
        </div>
      </div>

      {/* Skip and Don't show again options */}
      <div className="flex justify-center mt-4 space-x-4">
        <button
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          onClick={onClose}
          aria-label="Skip tutorial"
        >
          Skip tutorial
        </button>
        {onDontShowAgain && (
          <button
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            onClick={onDontShowAgain}
            aria-label="Don't show again"
          >
            Don't show again
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(TutorialControls);

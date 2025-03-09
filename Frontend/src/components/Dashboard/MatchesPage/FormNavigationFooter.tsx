import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Loader } from 'lucide-react';

interface FormNavigationFooterProps {
    currentStep: number;
    isLoading: boolean;
    canProceed: boolean;
    onBack: () => void;
    onNext: () => void;
    onSubmit: () => void;
    isLastStep: boolean;
}

const FormNavigationFooter: React.FC<FormNavigationFooterProps> = ({
    currentStep,
    isLoading,
    canProceed,
    onBack,
    onNext,
    onSubmit,
    isLastStep
}) => {
    return (
        <footer className="bg-white border-t border-gray-200 py-4 px-6">
            <div className="max-w-3xl mx-auto flex justify-between">
                {currentStep > 1 ? (
                    <motion.button
                        className="px-4 py-2 border border-gray-300 rounded-lg flex items-center text-gray-700 hover:bg-gray-50"
                        onClick={onBack}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isLoading}
                    >
                        <ChevronLeft size={18} className="mr-1" />
                        Back
                    </motion.button>
                ) : (
                    <div /> // Empty div to maintain layout when back button is hidden
                )}

                {!isLastStep ? (
                    <motion.button
                        className={`px-6 py-2 rounded-lg flex items-center text-white ${canProceed && !isLoading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'
                            }`}
                        onClick={() => canProceed && !isLoading && onNext()}
                        whileHover={canProceed && !isLoading ? { scale: 1.05 } : {}}
                        whileTap={canProceed && !isLoading ? { scale: 0.95 } : {}}
                        disabled={!canProceed || isLoading}
                    >
                        Continue
                        <ChevronRight size={18} className="ml-1" />
                    </motion.button>
                ) : (
                    <motion.button
                        className={`px-6 py-2 rounded-lg flex items-center text-white ${isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        onClick={onSubmit}
                        whileHover={{ scale: isLoading ? 1 : 1.05 }}
                        whileTap={{ scale: isLoading ? 1 : 0.95 }}
                        disabled={isLoading}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {isLoading ? (
                            <>
                                <Loader size={18} className="animate-spin mr-2" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Check size={18} className="mr-2" />
                                Submit Profile
                            </>
                        )}
                    </motion.button>
                )}
            </div>
        </footer>
    );
};

export default FormNavigationFooter;
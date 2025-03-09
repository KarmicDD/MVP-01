import React from 'react';
import { motion } from 'framer-motion';

interface FormProgressProps {
    currentStep: number;
    totalSteps: number;
    userType: 'startup' | 'investor' | null;
}

const FormProgress: React.FC<FormProgressProps> = ({ currentStep, totalSteps, userType }) => {
    const calculateProgress = () => {
        return (currentStep / totalSteps) * 100;
    };

    const getStepLabel = () => {
        if (currentStep === 2) return 'Basic Information';
        if (currentStep === 3) return userType === 'startup' ? 'Company Pitch' : 'Investment Preferences';
        if (currentStep === 4) return 'Review';
        return '';
    };

    return (
        <motion.div
            className="w-full max-w-3xl mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                    Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm font-medium text-gray-700">
                    {getStepLabel()}
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <motion.div
                    className="bg-blue-600 h-2.5 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${calculateProgress()}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        </motion.div>
    );
};

export default FormProgress;
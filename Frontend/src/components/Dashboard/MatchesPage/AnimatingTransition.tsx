import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, TrendingUp } from 'lucide-react';

interface AnimatingTransitionProps {
    userType: 'startup' | 'investor' | null;
}

const AnimatingTransition: React.FC<AnimatingTransitionProps> = ({ userType }) => {
    return (
        <motion.div
            className="flex flex-col items-center justify-center p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="relative w-24 h-24"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
                <motion.div
                    className="absolute w-4 h-4 bg-blue-600 rounded-full"
                    style={{ top: 0, left: '50%', marginLeft: '-8px' }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                    className="absolute w-4 h-4 bg-blue-500 rounded-full"
                    style={{ top: '25%', right: 0, marginRight: '-8px' }}
                    animate={{ scale: [1.2, 1, 1.2] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                />
                <motion.div
                    className="absolute w-4 h-4 bg-blue-400 rounded-full"
                    style={{ bottom: 0, left: '50%', marginLeft: '-8px' }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                />
                <motion.div
                    className="absolute w-4 h-4 bg-blue-300 rounded-full"
                    style={{ top: '25%', left: 0, marginLeft: '-8px' }}
                    animate={{ scale: [1.2, 1, 1.2] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
                />

                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    {userType === 'startup' ? (
                        <Rocket size={32} className="text-blue-600" />
                    ) : (
                        <TrendingUp size={32} className="text-blue-600" />
                    )}
                </motion.div>
            </motion.div>

            <motion.div
                className="mt-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <motion.p className="text-xl font-medium text-blue-600 mb-2">
                    Preparing your {userType} journey
                </motion.p>
                <motion.p className="text-gray-500">
                    Setting up the perfect environment for your needs
                </motion.p>
            </motion.div>
        </motion.div>
    );
};

export default AnimatingTransition;
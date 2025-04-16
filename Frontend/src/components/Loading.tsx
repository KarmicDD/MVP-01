import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, TrendingUp, Sparkles, LucideLoader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    message?: string;
    submessage?: string;
    size?: 'small' | 'medium' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    message = "Loading data",
    submessage = "Please wait while we fetch your information",
    size = 'large'
}) => {
    const [currentIcon, setCurrentIcon] = useState<number>(0);
    const [loadingText, setLoadingText] = useState<string>(submessage);
    const loadingMessages = [
        "Please wait while we retrieve your profile information",
        "Loading your profile data",
        "Retrieving your account information",
        "Almost ready..."
    ];

    // Cycle between icons
    useEffect(() => {
        const iconTimer = setInterval(() => {
            setCurrentIcon(prev => (prev === 0 ? 1 : 0));
        }, 3000);

        return () => clearInterval(iconTimer);
    }, []);

    // Cycle loading messages
    useEffect(() => {
        const messageTimer = setInterval(() => {
            setLoadingText(prev => {
                const currentIndex = loadingMessages.indexOf(prev);
                const nextIndex = (currentIndex + 1) % loadingMessages.length;
                return loadingMessages[nextIndex];
            });
        }, 4000);

        return () => clearInterval(messageTimer);
    }, []);

    // Determine size-based classes
    const sizeClasses = {
        small: {
            container: "flex items-center justify-center",
            spinner: "w-5 h-5",
            hideElements: true
        },
        medium: {
            container: "flex flex-col items-center justify-center p-4",
            spinner: "w-10 h-10", // Reduced from w-12 h-12
            hideElements: false
        },
        large: {
            container: "flex flex-col items-center justify-center p-6",
            spinner: "w-16 h-16", // Reduced from w-20 h-20
            hideElements: false
        }
    };

    // For small size, just return a simple spinner
    if (size === 'small') {
        return (
            <div className="flex items-center justify-center">
                <LucideLoader2 className="text-indigo-600 animate-spin" size={16} />
                {message && <span className="ml-2 text-xs font-medium text-indigo-600">{message}</span>}
            </div>
        );
    }

    return (
        <motion.div
            className={sizeClasses[size].container}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Ambient background glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0) 70%)",
                    }}
                    animate={{
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full"
                        style={{
                            background: `rgba(59, 130, 246, ${0.3 + Math.random() * 0.4})`,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -100 - Math.random() * 50],
                            x: [0, (Math.random() - 0.5) * 40],
                            opacity: [0, 0.8, 0],
                            scale: [0, 1 + Math.random(), 0],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                            ease: "easeOut"
                        }}
                    />
                ))}
            </div>

            {/* Main spinner container */}
            <motion.div
                className={`relative ${sizeClasses[size].spinner} flex items-center justify-center`}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
            >
                {/* Outer ring with gradient */}
                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: `conic-gradient(from 0deg at 50% 50%,
              rgba(59, 130, 246, 0.8) 0%,
              rgba(59, 130, 246, 0.4) 25%,
              rgba(59, 130, 246, 0.1) 50%,
              rgba(59, 130, 246, 0.4) 75%,
              rgba(59, 130, 246, 0.8) 100%)`,
                        filter: "blur(3px)"
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />

                {/* Inner circle (glassy effect) */}
                <motion.div
                    className="absolute inset-2 rounded-full flex items-center justify-center"
                    style={{
                        background: "rgba(255, 255, 255, 0.9)",
                        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
                        backdropFilter: "blur(4px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                >
                    {/* Rotating orbiting dots */}
                    <motion.div
                        className="absolute inset-0"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    >
                        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-3 h-3 rounded-full"
                                style={{
                                    background: `rgba(59, 130, 246, ${0.8 - (i * 0.1)})`,
                                    boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
                                    top: '50%',
                                    left: '50%',
                                    marginLeft: '-6px',
                                    marginTop: '-6px',
                                    transformOrigin: '50% 50%',
                                    transform: `rotate(${angle}deg) translateX(54px)`
                                }}
                                animate={{
                                    scale: [1, 0.8, 1],
                                    opacity: [0.7, 1, 0.7]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.2
                                }}
                            />
                        ))}
                    </motion.div>

                    {/* Central icon container */}
                    <motion.div
                        className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
                        animate={{
                            boxShadow: ["0 0 0 rgba(59, 130, 246, 0.3)", "0 0 20px rgba(59, 130, 246, 0.6)", "0 0 0 rgba(59, 130, 246, 0.3)"]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <AnimatePresence mode="wait">
                            {currentIcon === 0 ? (
                                <motion.div
                                    key="rocket"
                                    initial={{ opacity: 0, scale: 0, rotate: -30 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    exit={{ opacity: 0, scale: 0, rotate: 30 }}
                                    transition={{ duration: 0.5 }}
                                    className="relative"
                                >
                                    <Rocket size={24} className="text-blue-600" />
                                    <motion.div
                                        className="absolute -top-3 -right-3"
                                        animate={{ rotate: [0, 15, -15, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Sparkles size={16} className="text-amber-400" />
                                    </motion.div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="trending"
                                    initial={{ opacity: 0, scale: 0, rotate: -30 }}
                                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                    exit={{ opacity: 0, scale: 0, rotate: 30 }}
                                    transition={{ duration: 0.5 }}
                                    className="relative"
                                >
                                    <TrendingUp size={24} className="text-blue-600" />
                                    <motion.div
                                        className="absolute -top-3 -right-3"
                                        animate={{ rotate: [0, 15, -15, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Sparkles size={16} className="text-amber-400" />
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Loading indicator at bottom */}
            <motion.div
                className="mt-2 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <LucideLoader2
                    size={16}
                    className="text-blue-500 mr-2 animate-spin"
                />
                <span className="text-xs font-medium text-blue-600">Loading...</span>
            </motion.div>

            {/* Message */}
            {!sizeClasses[size].hideElements && (
                <motion.div
                    className="mt-6 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <motion.p
                        className="text-lg font-medium bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2"
                    >
                        {message}
                    </motion.p>

                    <AnimatePresence mode="wait">
                        <motion.p
                            key={loadingText}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                            className="text-gray-500"
                        >
                            {loadingText}
                        </motion.p>
                    </AnimatePresence>
                </motion.div>
            )}
        </motion.div>
    );
};

// Provide both named and default exports for backward compatibility
export default LoadingSpinner;
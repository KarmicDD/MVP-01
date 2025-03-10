import React, { useEffect, useState, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Rocket, TrendingUp, Sparkles, ChevronRight, CircleCheck } from 'lucide-react';

interface AnimatingTransitionProps {
    userType: 'startup' | 'investor' | null;
    // New props for actual loading state
    isLoading?: boolean;
    loadingSteps?: Array<{ id: number, label: string, status: 'pending' | 'loading' | 'completed' | 'error' }>;
    onTransitionComplete?: () => void;
    minDisplayTime?: number; // Minimum time to show the animation in ms
}

const AnimatingTransition: React.FC<AnimatingTransitionProps> = ({
    userType,
    isLoading = true,
    loadingSteps,
    onTransitionComplete,
    minDisplayTime = 2000 // At least show for 2 seconds
}) => {
    const [progress, setProgress] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const iconControls = useAnimation();
    const [displayStartTime, setDisplayStartTime] = useState(Date.now());
    const [canExit, setCanExit] = useState(false);

    // Default loading steps if none provided
    const defaultSteps = [
        { id: 1, label: userType === 'startup' ? "Loading your startup profile" : "Loading your investor profile", status: 'loading' },
        { id: 2, label: "Preparing match algorithms", status: 'pending' },
        { id: 3, label: "Finalizing your dashboard", status: 'pending' },
    ];

    // Use provided steps or defaults
    const steps = loadingSteps || defaultSteps;

    // Calculate progress based on completed steps
    const calculateProgress = useCallback(() => {
        const completedCount = steps.filter(step => step.status === 'completed').length;
        const loadingCount = steps.filter(step => step.status === 'loading').length;
        const totalSteps = steps.length;

        // Completed steps count fully, loading steps count partially
        return Math.min(100, Math.round((completedCount / totalSteps) * 100 + (loadingCount / totalSteps) * 30));
    }, [steps]);

    // Update completed steps based on loadingSteps prop
    useEffect(() => {
        if (loadingSteps) {
            const completed = loadingSteps
                .filter(step => step.status === 'completed')
                .map(step => step.id);
            setCompletedSteps(completed);

            // Update progress based on step status
            setProgress(calculateProgress());
        }
    }, [loadingSteps, calculateProgress]);

    // Simulate progress if no loadingSteps provided
    useEffect(() => {
        if (!loadingSteps && isLoading) {
            const interval = setInterval(() => {
                setProgress(prev => {
                    // Progress more slowly toward the end to give time for real loading
                    const increment = prev < 70 ? (Math.random() * 15) : (Math.random() * 5);
                    const newProgress = Math.min(prev + increment, 90); // Only go to 90% automatically
                    return newProgress;
                });
            }, 600);

            return () => clearInterval(interval);
        } else if (!isLoading && !loadingSteps) {
            // When loading completes with no steps provided, go to 100%
            setProgress(100);
        }
    }, [isLoading, loadingSteps]);

    // Handle automatic step completion for simulated progress
    useEffect(() => {
        if (!loadingSteps) {
            if (progress >= 30 && !completedSteps.includes(1)) {
                setCompletedSteps(prev => [...prev, 1]);
            }
            if (progress >= 60 && !completedSteps.includes(2)) {
                setCompletedSteps(prev => [...prev, 2]);
            }
            if (progress >= 90 && !completedSteps.includes(3)) {
                setCompletedSteps(prev => [...prev, 3]);
            }
        }
    }, [progress, completedSteps, loadingSteps]);

    // Pulse animation for the icon
    useEffect(() => {
        iconControls.start({
            scale: [1, 1.1, 1],
            transition: { repeat: Infinity, duration: 2 }
        });
    }, [iconControls]);

    // Handle transition completion
    useEffect(() => {
        // If loading is complete and we've reached 100% progress
        if (!isLoading && progress >= 100) {
            const currentTime = Date.now();
            const elapsedTime = currentTime - displayStartTime;

            // Ensure we've displayed for at least the minimum time
            if (elapsedTime >= minDisplayTime) {
                setCanExit(true);
                if (onTransitionComplete) {
                    // Give a small delay to show the completed state
                    setTimeout(() => {
                        onTransitionComplete();
                    }, 500);
                }
            } else {
                // Wait until we've shown the animation for the minimum time
                const remainingTime = minDisplayTime - elapsedTime;
                setTimeout(() => {
                    setCanExit(true);
                    if (onTransitionComplete) {
                        onTransitionComplete();
                    }
                }, remainingTime);
            }
        }
    }, [isLoading, progress, displayStartTime, minDisplayTime, onTransitionComplete]);

    // When loading completes, ensure we reach 100%
    useEffect(() => {
        if (!isLoading && progress < 100) {
            // Quickly animate to 100% when loading is actually done
            const timer = setTimeout(() => {
                setProgress(100);
                // Mark all steps as completed
                setCompletedSteps(steps.map(step => step.id));
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [isLoading, progress, steps]);

    // Initial setup
    useEffect(() => {
        setDisplayStartTime(Date.now());
        return () => {
            // Clean up any timers if needed
        };
    }, []);

    return (
        <motion.div
            className="flex flex-col items-center justify-center min-h-[400px] p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-blue-400 rounded-full"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            opacity: 0.6,
                        }}
                        animate={{
                            y: [0, -100],
                            opacity: [0, 0.8, 0],
                            scale: [0, 1, 0],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 5,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                        }}
                    />
                ))}
            </div>

            {/* Main animation container */}
            <motion.div className="relative">
                {/* Outer ring */}
                <motion.div
                    className="w-36 h-36 rounded-full border-4 border-gray-100"
                    style={{
                        background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.4) 100%)",
                        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
                        backdropFilter: "blur(4px)",
                    }}
                />

                {/* Progress circle */}
                <svg className="absolute inset-0 w-36 h-36 -rotate-90" viewBox="0 0 100 100">
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        strokeWidth="4"
                        stroke="url(#gradient)"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: progress / 100 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#60a5fa" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                    </defs>
                </svg>

                {/* Rotating dots */}
                <motion.div
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                    {[0, 90, 180, 270].map((angle, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-3 h-3 bg-blue-500 rounded-full"
                            style={{
                                top: '50%',
                                left: '50%',
                                marginLeft: '-6px',
                                marginTop: '-6px',
                                transformOrigin: '50% 50%',
                                transform: `rotate(${angle}deg) translateX(60px)`
                            }}
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.7, 1, 0.7]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.5
                            }}
                        />
                    ))}
                </motion.div>

                {/* Central icon */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={iconControls}
                >
                    <div className="relative">
                        {userType === 'startup' ? (
                            <Rocket size={40} className="text-blue-600" />
                        ) : (
                            <TrendingUp size={40} className="text-blue-600" />
                        )}
                        <motion.div
                            className="absolute -top-2 -right-3"
                            animate={{
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Sparkles size={18} className="text-amber-400" />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Progress percentage */}
                <motion.div
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <motion.span
                        className="inline-block bg-white text-xs font-bold text-blue-600 py-1 px-3 rounded-full shadow-sm"
                        animate={{ opacity: 1 }}
                    >
                        {Math.round(progress)}%
                    </motion.span>
                </motion.div>
            </motion.div>

            {/* Text information */}
            <motion.div
                className="mt-12 text-center w-full max-w-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <motion.h2
                    className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-6"
                >
                    {userType === 'startup'
                        ? "Launching Your Startup Dashboard"
                        : "Setting Up Your Investor Workspace"}
                </motion.h2>

                {/* Progress steps */}
                <div className="space-y-3 mb-5">
                    {steps.map((step) => (
                        <motion.div
                            key={step.id}
                            className="flex items-center"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + step.id * 0.2 }}
                        >
                            <AnimatePresence mode="wait">
                                {step.status === 'completed' || completedSteps.includes(step.id) ? (
                                    <motion.div
                                        key="completed"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="w-6 h-6 mr-3 flex-shrink-0 flex items-center justify-center"
                                    >
                                        <CircleCheck size={20} className="text-green-500" />
                                    </motion.div>
                                ) : step.status === 'loading' ? (
                                    <motion.div
                                        key="loading"
                                        className="w-6 h-6 mr-3 flex-shrink-0 flex items-center justify-center"
                                    >
                                        <motion.div
                                            className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                duration: 1,
                                                repeat: Infinity,
                                                ease: "linear"
                                            }}
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="pending"
                                        className="w-6 h-6 mr-3 flex-shrink-0 flex items-center justify-center"
                                    >
                                        <ChevronRight size={16} className="text-blue-500" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <span className={`text-sm ${step.status === 'completed' || completedSteps.includes(step.id)
                                    ? 'text-gray-500 line-through'
                                    : step.status === 'loading'
                                        ? 'text-blue-700 font-medium'
                                        : 'text-gray-700'
                                }`}>
                                {step.label}
                            </span>
                        </motion.div>
                    ))}
                </div>

                <motion.p
                    className="text-gray-500 text-sm"
                    animate={{
                        opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                >
                    {!isLoading && progress >= 100
                        ? "Setup complete! Redirecting to dashboard..."
                        : "Building the perfect environment for your needs..."}
                </motion.p>
            </motion.div>
        </motion.div>
    );
};

export default AnimatingTransition;
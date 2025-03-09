import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, TrendingUp } from 'lucide-react';
import api from '../../../services/api';

interface UserData {
    role?: string;
}

interface UserTypeSelectionProps {
    userType: 'startup' | 'investor' | null;
    animateSelection: boolean;
    isAuthenticated: boolean;
    userData: UserData | null;
    API_BASE_URL: string;
    setUserType: (type: 'startup' | 'investor') => void;
    setAnimateSelection: (animate: boolean) => void;
    navigateStep: (direction: number) => void;
}

const UserTypeSelection: React.FC<UserTypeSelectionProps> = ({
    userType,
    animateSelection,
    isAuthenticated,
    userData,
    API_BASE_URL,
    setUserType,
    setAnimateSelection,
    navigateStep
}) => {

    const handleTypeSelection = (type: 'startup' | 'investor') => {
        if (!animateSelection && !userType) {
            setUserType(type);
            setAnimateSelection(true);

            // Only save user type to backend if authenticated and type not already set
            if (isAuthenticated && userData && !userData.role) {
                api.post(`${API_BASE_URL}/api/auth/update-role`, {
                    role: type
                }, { withCredentials: true }).catch(err => {
                    console.error("Failed to update role:", err);
                });
            }

            setTimeout(() => {
                setAnimateSelection(false);
                navigateStep(1);
            }, 900);
        }
    };

    return (
        <motion.div
            className="flex flex-col items-center justify-center w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <motion.div
                className="mb-10"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <motion.h2
                    className="text-3xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400"
                    initial={{ backgroundPosition: "0%" }}
                    animate={{ backgroundPosition: "100%" }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                >
                    Welcome to VentureMatch
                </motion.h2>
                <motion.p
                    className="text-gray-600 text-center max-w-lg mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Connect startups with the right investors and help great ideas find the capital they need to grow.
                </motion.p>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
                {/* Startup Tile */}
                <motion.div
                    className={`flex-1 p-8 border rounded-xl cursor-pointer transition-all ${userType === 'startup' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                    onClick={() => handleTypeSelection('startup')}
                    whileHover={{
                        scale: !userType ? 1.03 : 1,
                        boxShadow: !userType ? "0px 5px 15px rgba(0, 0, 0, 0.1)" : "none"
                    }}
                    whileTap={{ scale: !userType ? 0.98 : 1 }}
                    animate={animateSelection && userType === 'startup' ? {
                        scale: [1, 1.05, 1.1],
                        y: [0, -10, -20],
                        opacity: [1, 1, 0],
                        boxShadow: [
                            "0px 0px 0px rgba(59, 130, 246, 0)",
                            "0px 10px 25px rgba(59, 130, 246, 0.2)",
                            "0px 20px 35px rgba(59, 130, 246, 0.4)"
                        ]
                    } : {}}
                    transition={animateSelection && userType === 'startup' ? {
                        duration: 0.9,
                        ease: "easeOut"
                    } : {
                        duration: 0.2
                    }}
                >
                    <motion.div
                        className="flex flex-col items-center text-center"
                        initial={{ opacity: 1 }}
                        whileHover={{ opacity: 1 }}
                    >
                        <motion.div
                            className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4"
                            whileHover={{
                                backgroundColor: !userType ? "#bfdbfe" : "#dbeafe",
                                scale: !userType ? 1.1 : 1
                            }}
                        >
                            <motion.div
                                whileHover={{ rotate: !userType ? 10 : 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <Rocket size={28} className="text-blue-600" />
                            </motion.div>
                        </motion.div>
                        <h3 className="text-xl font-semibold mb-2">I'm a Startup</h3>
                        <p className="text-gray-600 text-sm">Looking for investment and growth opportunities</p>
                    </motion.div>
                </motion.div>

                {/* Investor Tile */}
                <motion.div
                    className={`flex-1 p-8 border rounded-xl cursor-pointer transition-all ${userType === 'investor' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                    onClick={() => handleTypeSelection('investor')}
                    whileHover={{
                        scale: !userType ? 1.03 : 1,
                        boxShadow: !userType ? "0px 5px 15px rgba(0, 0, 0, 0.1)" : "none"
                    }}
                    whileTap={{ scale: !userType ? 0.98 : 1 }}
                    animate={animateSelection && userType === 'investor' ? {
                        scale: [1, 1.05, 1.1],
                        y: [0, -10, -20],
                        opacity: [1, 1, 0],
                        boxShadow: [
                            "0px 0px 0px rgba(59, 130, 246, 0)",
                            "0px 10px 25px rgba(59, 130, 246, 0.2)",
                            "0px 20px 35px rgba(59, 130, 246, 0.4)"
                        ]
                    } : {}}
                    transition={animateSelection && userType === 'investor' ? {
                        duration: 0.9,
                        ease: "easeOut"
                    } : {
                        duration: 0.2
                    }}
                >
                    <motion.div
                        className="flex flex-col items-center text-center"
                        initial={{ opacity: 1 }}
                        whileHover={{ opacity: 1 }}
                    >
                        <motion.div
                            className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4"
                            whileHover={{
                                backgroundColor: !userType ? "#bfdbfe" : "#dbeafe",
                                scale: !userType ? 1.1 : 1
                            }}
                        >
                            <motion.div
                                whileHover={{ rotate: !userType ? 10 : 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <TrendingUp size={28} className="text-blue-600" />
                            </motion.div>
                        </motion.div>
                        <h3 className="text-xl font-semibold mb-2">I'm an Investor</h3>
                        <p className="text-gray-600 text-sm">Seeking promising startups to invest in</p>
                    </motion.div>
                </motion.div>
            </div>

            {/* Animation indicator message */}
            <AnimatePresence>
                {animateSelection && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-6 flex items-center"
                    >
                        <motion.div
                            animate={{
                                rotate: 360,
                                scale: [1, 1.1, 1]
                            }}
                            transition={{
                                rotate: { repeat: Infinity, duration: 1, ease: "linear" },
                                scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                            }}
                            className="mr-2"
                        >
                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                        </motion.div>
                        <p className="text-blue-600 font-medium">
                            Setting up your {userType} profile...
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Initial choice prompt - appears only when no selection made */}
            <AnimatePresence>
                {!userType && !animateSelection && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 text-gray-500 text-sm"
                    >
                        Select the option that best describes you
                    </motion.p>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default UserTypeSelection;
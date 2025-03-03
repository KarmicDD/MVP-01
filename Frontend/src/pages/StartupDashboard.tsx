import React from 'react';
import { motion } from 'framer-motion';
import { authService } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const StartupDashboard: React.FC = () => {
    const navigate = useNavigate();

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
    };

    const buttonVariants = {
        hover: { scale: 1.05, backgroundColor: "#3182CE" },
        tap: { scale: 0.95 }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/auth');
    };

    return (
        <motion.div
            className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <motion.div
                className="w-full max-w-4xl p-8 bg-white rounded-xl shadow-lg"
                variants={itemVariants}
            >
                <motion.h1
                    className="text-3xl font-bold text-center text-gray-800 mb-8"
                    variants={itemVariants}
                >
                    Startup Dashboard
                </motion.h1>

                <motion.div
                    className="flex flex-col space-y-6"
                    variants={itemVariants}
                >
                    {/* Dashboard content would go here */}
                    <motion.div
                        className="p-4 bg-blue-50 rounded-lg border border-blue-100"
                        variants={itemVariants}
                    >
                        <h2 className="font-semibold text-lg text-blue-800 mb-2">Welcome to your dashboard</h2>
                        <p className="text-gray-600">This is where you'll manage your startup activities and track progress.</p>
                    </motion.div>

                    <motion.button
                        className="self-end px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium shadow-sm transition-colors"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        onClick={handleLogout}
                    >
                        Logout
                    </motion.button>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
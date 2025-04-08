import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ddFacts, upcomingFeatures } from '../../constants/data';
import { FaArrowLeft, FaLightbulb, FaMoon, FaSun } from 'react-icons/fa';
import confetti from 'canvas-confetti';
import { colours } from '../../utils/colours';

interface ComingSoonProps {
    title?: string;
    subtitle?: string;
    description?: string; // For backward compatibility
    icon?: React.ReactNode; // New icon prop
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
    title = "Coming Soon!",
    subtitle = "We're working hard to bring you this feature.",
    description,
    icon // Optional icon
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const randomStart = Math.floor(Math.random() * ddFacts.length);
    const [currentFactIndex, setCurrentFactIndex] = useState(randomStart);
    const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
    const [showFact, setShowFact] = useState(true);
    const [darkMode, setDarkMode] = useState(true);

    // Use description if provided (for backward compatibility)
    const subtitleText = description || subtitle;

    // Get referring button from location state if available
    const referringButton = location.state?.from || 'this page';

    // Toggle dark mode
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Launch confetti when component mounts
    useEffect(() => {
        const launchConfetti = () => {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: [colours.gray600, '#f1c40f', '#e74c3c', '#2ecc71', '#9b59b6']
            });
        };

        launchConfetti();

        // Set interval to rotate facts
        const factInterval = setInterval(() => {
            setShowFact(false);
            setTimeout(() => {
                setCurrentFactIndex((prev) => (prev + 1) % ddFacts.length);
                setShowFact(true);
            }, 500); // Wait for exit animation to complete
        }, 8000);

        // Set interval to rotate features
        const featureInterval = setInterval(() => {
            setCurrentFeatureIndex((prev) => (prev + 1) % upcomingFeatures.length);
        }, 4000);

        return () => {
            clearInterval(factInterval);
            clearInterval(featureInterval);
        };
    }, []);

    const goBack = () => {
        navigate(-1);
    };

    // Determine theme-based colors
    const bgColor = darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-200';
    const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
    const textColor = darkMode ? 'text-gray-100' : 'text-gray-800';
    const subTextColor = darkMode ? 'text-gray-300' : 'text-gray-600';
    const sectionBg = darkMode ? 'bg-gray-700' : 'bg-gray-50';
    const tipsBg = darkMode ? 'bg-indigo-900' : 'bg-blue-50';
    const notifyBg = darkMode ? 'bg-amber-900' : 'bg-amber-50';
    const inputBg = darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200';
    const inputTextColor = darkMode ? 'text-white' : 'text-gray-800';

    return (
        <div className={`min-h-screen ${bgColor} p-8 relative transition-colors duration-300`}>
            {/* Navigation */}
            <div className="flex justify-between items-center max-w-6xl mx-auto">
                <motion.button
                    className={`flex items-center gap-2 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-none py-3 px-5 rounded-full font-semibold cursor-pointer shadow-md z-10 transition-colors duration-300`}
                    onClick={goBack}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FaArrowLeft className={darkMode ? 'text-white' : 'text-gray-700'} />
                    <span className={darkMode ? 'text-white' : 'text-gray-700'}>Back to Home</span>
                </motion.button>

                <motion.button
                    className={`flex items-center gap-2 ${darkMode ? 'bg-gray-800' : 'bg-white'} border-none py-3 px-5 rounded-full font-semibold cursor-pointer shadow-md z-10 transition-colors duration-300`}
                    onClick={toggleDarkMode}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {darkMode ? (
                        <>
                            <FaSun className="text-yellow-400" />
                            <span className="text-white">Light Mode</span>
                        </>
                    ) : (
                        <>
                            <FaMoon className="text-indigo-700" />
                            <span className="text-gray-700">Dark Mode</span>
                        </>
                    )}
                </motion.button>
            </div>

            {/* Main Content Container */}
            <motion.div
                className={`max-w-6xl mx-auto mt-12 ${cardBg} rounded-2xl shadow-xl overflow-hidden p-8 transition-colors duration-300`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                {/* Header Section */}
                <motion.div
                    className="text-center py-8 px-4 relative items-center justify-center"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    {/* Display icon if provided */}
                    {icon && (
                        <motion.div
                            className="mx-auto mb-6 flex justify-center items-center"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                        >
                            <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{
                                background: darkMode ? 'rgba(79, 70, 229, 0.2)' : 'rgba(79, 70, 229, 0.1)'
                            }}>
                                <div className="w-16 h-16 text-indigo-600">
                                    {icon}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <motion.h1
                        className="text-6xl font-extrabold mb-4 bg-gradient-to-r from-blue-600 via-purple-500 to-yellow-400 bg-clip-text text-transparent"
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        {title}
                    </motion.h1>
                    <motion.p
                        className={`text-xl ${subTextColor} max-w-2xl mx-auto transition-colors duration-300`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                    >
                        {subtitleText}
                    </motion.p>
                    <motion.div
                        className={`mt-6 text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.9 }}
                    >
                        You clicked: <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>{referringButton}</span>
                    </motion.div>
                </motion.div>

                {/* Rest of the component remains unchanged */}
                {/* Upcoming Features Section */}
                <motion.div
                    className={`my-8 p-8 ${sectionBg} rounded-xl transition-colors duration-300`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1 }}
                >
                    <h2 className={`text-center text-3xl font-bold ${textColor} mb-8 transition-colors duration-300`}>
                        Upcoming Features
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {upcomingFeatures.map((feature, index) => (
                            <motion.div
                                key={feature.id}
                                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-sm transition-all duration-300 border-2 flex flex-col items-center h-full ${index === currentFeatureIndex ? 'shadow-lg transform -translate-y-1' : ''
                                    }`}
                                style={{
                                    borderColor: index === currentFeatureIndex ? feature.color : 'transparent',
                                    backgroundColor: index === currentFeatureIndex
                                        ? (darkMode ? `${feature.color}33` : `${feature.color}11`)
                                        : (darkMode ? 'rgb(31, 41, 55)' : 'white')
                                }}
                                whileHover={{ scale: 1.05, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                                transition={{ duration: 0.3 }}
                            >
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                                    style={{ backgroundColor: feature.color }}
                                >
                                    <span className="text-2xl text-white">{feature.icon}</span>
                                </div>
                                <h3 className={`text-xl font-semibold mb-3 ${textColor} transition-colors duration-300`}>
                                    {feature.name}
                                </h3>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-center transition-colors duration-300`}>
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Did You Know Section */}
                <motion.div
                    className={`my-12 p-8 ${tipsBg} rounded-xl transition-colors duration-300`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                >
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <FaLightbulb className="text-yellow-500 text-3xl" />
                        <h2 className={`text-3xl font-bold ${textColor} m-0 transition-colors duration-300`}>Did You Know?</h2>
                    </div>

                    <AnimatePresence mode="wait">
                        {showFact && (
                            <motion.div
                                key={currentFactIndex}
                                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-md flex items-center gap-6 min-h-[120px] transition-colors duration-300`}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="text-5xl flex-shrink-0">{ddFacts[currentFactIndex].icon}</div>
                                <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed m-0 transition-colors duration-300`}>
                                    {ddFacts[currentFactIndex].fact}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Stay Updated Section */}
                <motion.div
                    className={`text-center p-8 ${notifyBg} rounded-xl mt-8 transition-colors duration-300`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                >
                    <h2 className={`text-3xl font-bold ${textColor} mb-2 transition-colors duration-300`}>
                        Stay Updated
                    </h2>
                    <p className={`text-lg ${subTextColor} mb-6 transition-colors duration-300`}>
                        Be the first to know when we launch!
                    </p>
                    <div className="flex max-w-lg mx-auto md:flex-row flex-col">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className={`flex-1 py-4 px-6 border-2 ${inputBg} rounded-full md:rounded-r-none outline-none text-base md:mb-0 mb-4 ${inputTextColor} transition-colors duration-300`}
                        />
                        <motion.button
                            className="py-4 px-8 border-none rounded-full md:rounded-l-none text-white font-semibold cursor-pointer transition-colors duration-300"
                            style={{ backgroundColor: colours.button }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Notify Me
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ComingSoon;
import React, { useState, useEffect } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { colours } from "../../utils/colours";
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { links } from '../../constants/data';
import { SectionName } from '../../constants/data';
import { authService } from '../../services/api'; // Import authService
import { useActiveSectionContext } from '../../context/active-section-hooks';

export const Navigation: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const { activeSection, setActiveSection, setTimeOfLastClick } = useActiveSectionContext();
    const isLoggedIn = authService.isAuthenticated(); // Check if user is logged in

    // Handle scroll event to change navbar style
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Common scroll settings for consistency
    const scrollSettings = {
        spy: true,
        smooth: true,
        offset: -70,
        duration: 800,
        easing: 'easeInOutQuart',
        onSetActive: (to: string) => {
            const sectionName = links.find(link => link.hash.substring(1) === to)?.name;
            if (sectionName) {
                setActiveSection(sectionName as SectionName);
            }
        }
    };

    const handleRedirect = (buttonName: string) => {
        navigate('/coming-soon', { state: { from: buttonName } });
    };

    const handleAuth = () => {
        navigate('/auth');
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/');
    };

    // Render auth buttons based on login state
    const renderAuthButtons = () => {
        if (isLoggedIn) {
            return (
                <motion.button
                    id="logout-btn"
                    className="px-5 py-2.5 rounded-lg font-medium text-base transition-all duration-300 shadow-md hover:shadow-lg"
                    style={{
                        background: `linear-gradient(135deg, ${colours.red400}, ${colours.red500})`,
                        color: colours.whiteText
                    }}
                    onClick={handleLogout}
                    whileHover={{
                        scale: 1.05,
                        boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.4)"
                    }}
                    whileTap={{ scale: 0.95 }}
                >
                    Log Out
                </motion.button>
            );
        } else {
            return (
                <>
                    <motion.a
                        href="#"
                        style={{ color: colours.gray600 }}
                        className="font-medium hover:text-indigo-600 text-base transition-colors duration-300"
                        onClick={(e) => {
                            e.preventDefault();
                            handleAuth();
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Sign In
                    </motion.a>

                    <motion.a
                        href="#"
                        className="px-5 py-2.5 rounded-lg font-medium text-base transition-all duration-300 shadow-md hover:shadow-lg"
                        style={{
                            background: colours.primaryGradient,
                            color: colours.whiteText
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/auth');
                        }}
                        whileHover={{
                            scale: 1.05,
                            boxShadow: "0 10px 25px -5px rgba(94, 66, 227, 0.4)"
                        }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Get Started
                    </motion.a>
                </>
            );
        }
    };

    // Render mobile auth buttons
    const renderMobileAuthButtons = () => {
        if (isLoggedIn) {
            return (
                <button
                    className="py-2 px-4 rounded-md font-medium text-center w-full"
                    style={{
                        background: `linear-gradient(135deg, ${colours.red400}, ${colours.red500})`,
                        color: colours.whiteText
                    }}
                    onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                    }}
                >
                    Log Out
                </button>
            );
        } else {
            return (
                <>
                    <a
                        href="#"
                        className="py-2 px-4 rounded-md font-medium"
                        style={{ color: colours.gray600 }}
                        onClick={(e) => {
                            e.preventDefault();
                            setIsMenuOpen(false);
                            handleAuth();
                        }}
                    >
                        Sign In
                    </a>

                    <a
                        href="#"
                        className="py-2 px-4 rounded-md font-medium text-center"
                        style={{
                            background: colours.primaryGradient,
                            color: colours.whiteText
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            setIsMenuOpen(false);
                            handleRedirect('Get Started');
                        }}
                    >
                        Get Started
                    </a>
                </>
            );
        }
    };

    return (
        <motion.nav
            className={`py-3 md:py-4 fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'shadow-md' : ''
                }`}
            style={{
                backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(8px)'
            }}
            initial={{ y: -70 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
            <div className="container mx-auto flex flex-wrap justify-between items-center px-4">
                <ScrollLink
                    to="hero"
                    {...scrollSettings}
                    className="font-bold text-xl md:text-2xl cursor-pointer flex items-center"
                    onClick={() => {
                        setTimeOfLastClick(Date.now());
                        setIsMenuOpen(false);
                    }}
                >
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <span style={{
                            background: colours.primaryGradient,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            KarmicDD
                        </span>
                    </motion.div>
                </ScrollLink>

                {/* Mobile menu button */}
                <motion.button
                    className="md:hidden rounded-md p-2 focus:outline-none"
                    style={{ backgroundColor: isMenuOpen ? colours.indigo50 : 'transparent' }}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    whileTap={{ scale: 0.95 }}
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke={colours.indigo600}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                    </svg>
                </motion.button>

                {/* Desktop menu */}
                <div className="hidden md:flex md:items-center md:space-x-8">
                    {links.map((link) => (
                        <ScrollLink
                            key={link.name}
                            to={link.hash.substring(1)}
                            {...scrollSettings}
                            className="relative font-medium hover:text-indigo-600 text-base cursor-pointer transition-colors duration-300 group"
                            style={{
                                color: activeSection === link.name ? colours.indigo600 : colours.gray600
                            }}
                            onClick={() => {
                                setTimeOfLastClick(Date.now());
                            }}
                        >
                            {link.name}
                            {activeSection === link.name && (
                                <motion.span
                                    className="absolute -bottom-1 left-0 w-full h-0.5 bg-indigo-600 rounded-full"
                                    layoutId="activeSection"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </ScrollLink>
                    ))}

                    {renderAuthButtons()}
                </div>

                {/* Mobile menu dropdown */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-lg border-t overflow-hidden"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex flex-col p-4 space-y-4">
                                {links.map((link) => (
                                    <ScrollLink
                                        key={link.name}
                                        to={link.hash.substring(1)}
                                        {...scrollSettings}
                                        className="py-2 px-4 rounded-md font-medium transition-colors duration-300"
                                        style={{
                                            color: activeSection === link.name ? colours.white : colours.gray600,
                                            backgroundColor: activeSection === link.name ? colours.indigo600 : 'transparent'
                                        }}
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            setTimeOfLastClick(Date.now());
                                        }}
                                    >
                                        {link.name}
                                    </ScrollLink>
                                ))}

                                {renderMobileAuthButtons()}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.nav>
    );
};
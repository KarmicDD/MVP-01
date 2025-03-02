// src/components/Landing/Navigation.tsx
import React, { useState } from 'react';
import { Link as ScrollLink } from 'react-scroll';
import { colours } from "../../utils/colours";
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useActiveSectionContext } from '../../context/active-section-context';
import { links } from '../../libs/data';
import { SectionName } from '../../libs/data';

export const Navigation: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [, setActiveLink] = useState('hero');
    const navigate = useNavigate();
    const { activeSection, setActiveSection, setTimeOfLastClick } = useActiveSectionContext();

    // Common scroll settings for consistency
    const scrollSettings = {
        spy: true,
        smooth: true,
        offset: -70,
        duration: 1000, // Increased duration for smoother scrolling (1 second)
        easing: 'easeInOutQuart', // Add easing function for more natural movement
        onSetActive: (to: string) => {
            setActiveLink(to);
            // Also update the context
            const sectionName = links.find(link => link.hash.substring(1) === to)?.name;
            if (sectionName) {
                setActiveSection(sectionName as SectionName);
            }
        }
    };

    const handleRedirect = (buttonName: string) => {
        navigate('/coming-soon', { state: { from: buttonName } });
    };

    return (
        <motion.nav
            className="p-2 md:p-4 shadow-sm fixed top-0 left-0 w-full z-10"
            style={{ backgroundColor: colours.white }}
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
        >
            <div className="container mx-auto flex flex-wrap justify-between items-center px-4">
                <ScrollLink
                    to="hero"
                    {...scrollSettings}
                    className="font-bold text-xl md:text-2xl cursor-pointer"
                    style={{ color: colours.indigo600 }}
                >
                    KarmicDD
                </ScrollLink>

                {/* Mobile menu button */}
                <button
                    className="md:hidden rounded-md p-2 hover:bg-gray-100 focus:outline-none"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                    </svg>
                </button>

                {/* Desktop menu */}
                <div className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row w-full md:w-auto items-start md:items-center md:space-x-6 mt-4 md:mt-0`}>
                    {links.map((link) => (
                        <ScrollLink
                            key={link.name}
                            to={link.hash.substring(1)} // Remove the # from the hash
                            {...scrollSettings}
                            className={`hover:text-indigo-600 text-sm md:text-base w-full md:w-auto py-2 md:py-0 cursor-pointer transition-colors duration-300 ${activeSection === link.name ? 'font-semibold' : ''
                                }`}
                            style={{
                                color: activeSection === link.name ? colours.indigo600 : colours.gray600
                            }}
                            onClick={() => {
                                setIsMenuOpen(false);
                                setTimeOfLastClick(Date.now());
                            }}
                        >
                            {link.name}
                        </ScrollLink>
                    ))}

                    <a
                        href="#"
                        style={{ color: colours.gray600 }}
                        className="hover:text-indigo-600 text-sm md:text-base w-full md:w-auto py-2 md:py-0"
                        onClick={(e) => {
                            e.preventDefault();
                            handleRedirect('Sign In');
                        }}
                    >
                        Sign In
                    </a>

                    <a
                        href="#"
                        className="px-4 py-2 rounded-md hover:bg-indigo-700 text-sm md:text-base mt-2 md:mt-0 w-full md:w-auto text-center transition-colors duration-300"
                        style={{ backgroundColor: colours.indigo600, color: colours.whiteText }}
                        onClick={(e) => {
                            e.preventDefault();
                            handleRedirect('Get Started');
                        }}
                    >
                        Get Started
                    </a>
                </div>
            </div>
        </motion.nav>
    );
};

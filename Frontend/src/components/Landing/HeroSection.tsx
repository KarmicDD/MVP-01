// ../src/components/Landing/HeroSection.tsx
import { colours } from "../../utils/colours";
import { motion } from 'framer-motion';
import { useSectionInView } from '../../hooks/useSectionInView'; // Import the hook
import React from 'react';
import { useNavigate } from "react-router-dom";

export const HeroSection: React.FC = () => {
    const ref = useSectionInView({ sectionName: 'Home', threshold: 0.7 }); // 0.75 threshold means 75% of the section must be in view
    const navigate = useNavigate();
    const handleRedirect = (buttonName: string) => {
        navigate('/coming-soon', { state: { from: buttonName } });
    };
    return (
        <motion.section
            id="hero"
            ref={ref} // Set the ref
            className="py-8 md:py-16 pt-16 md:pt-24"
            style={{ backgroundColor: colours.background }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.75 }}
        >
            <div className="container mx-auto flex flex-col md:flex-row items-center px-4">
                <div className="md:w-1/2 mb-6 md:mb-0 md:pr-6">
                    <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">Connecting Startups and Investors with Smart, Data-Driven Insights.</h1>
                    <p style={{ color: colours.gray600 }} className="mb-4 md:mb-6 text-sm md:text-base">Find the right investor or startup aligned with your vision and values.</p>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        <button
                            className="px-4 py-2 rounded-md hover:bg-indigo-700 text-sm md:text-base cursor-pointer w-full sm:w-auto text-center hover:scale-105 transition-transform duration-300"
                            style={{ backgroundColor: colours.indigo600, color: colours.whiteText }}
                            onClick={() => handleRedirect('Sign in as Startup')}
                        >
                            Sign in as Startup
                        </button>
                        <button
                            className="px-4 py-2 rounded-md hover:bg-indigo-50 text-sm md:text-base cursor-pointer w-full sm:w-auto text-center hover:scale-105 transition-transform duration-300"
                            style={{
                                border: `1px solid ${colours.indigo600}`,
                                color: colours.indigo600,
                            }}
                            onClick={() => handleRedirect('Sign in as Investor')}
                        >
                            Sign in as Investor
                        </button>
                    </div>
                </div>
                <div className="md:w-1/2">
                    <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/44b395bc45-d90da5911cae8f1eebf6.png" alt="Connecting Startups and Investors" className="rounded-lg shadow-lg w-full" />
                </div>
            </div>
        </motion.section>
    );
};

// src/components/Landing/HeroSection.tsx
import { colours } from "../../utils/colours";
import { motion } from 'framer-motion';
import { useSectionInView } from '../../hooks/useSectionInView';
import React from 'react';
import { useNavigate } from "react-router-dom";

export const HeroSection: React.FC = () => {
    const ref = useSectionInView({ sectionName: 'Home', threshold: 0.7 });
    const navigate = useNavigate();

    const handleRedirect = (buttonName: string) => {
        navigate('/coming-soon', { state: { from: buttonName } });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 70,
                damping: 15
            }
        }
    };

    const imageVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 50,
                delay: 0.4
            }
        }
    };

    return (
        <section
            id="hero"
            ref={ref}
            className="pt-28 md:pt-32 pb-16 md:pb-24 relative overflow-hidden"
            style={{
                background: `linear-gradient(135deg, ${colours.indigo50}, ${colours.background})`
            }}
        >
            {/* Background decorative elements */}
            <div className="absolute top-20 left-0 w-full h-full overflow-hidden z-0 opacity-20">
                <div className="absolute top-0 left-10 w-64 h-64 rounded-full"
                    style={{ background: colours.primaryGradient, filter: 'blur(80px)' }}></div>
                <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full"
                    style={{ background: colours.secondaryGradient, filter: 'blur(100px)' }}></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    className="flex flex-col md:flex-row items-center gap-10 md:gap-12"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div
                        className="md:w-1/2 md:pr-6"
                        variants={itemVariants}
                    >
                        <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight">
                            Connecting Startups and Investors with <span style={{ color: colours.indigo600 }}>Smart Insights</span>
                        </h1>
                        <p className="text-base md:text-lg mb-6 md:mb-8 max-w-xl" style={{ color: colours.gray600 }}>
                            Find the perfect match aligned with your vision and values through our data-driven platform designed for meaningful connections.
                        </p>
                        <motion.div
                            className="flex flex-col sm:flex-row gap-4"
                            variants={itemVariants}
                        >
                            <button
                                className="px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl text-base md:text-lg cursor-pointer w-full sm:w-auto text-center transform transition-all duration-300 hover:-translate-y-1"
                                style={{
                                    background: colours.primaryGradient,
                                    color: colours.whiteText
                                }}
                                onClick={() => handleRedirect('Sign in as Startup')}
                            >
                                Sign in as Startup
                            </button>
                            <button
                                className="px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow-md text-base md:text-lg cursor-pointer w-full sm:w-auto text-center transform transition-all duration-300 hover:-translate-y-1 bg-white"
                                style={{
                                    border: `1px solid ${colours.indigo600}`,
                                    color: colours.indigo600,
                                }}
                                onClick={() => handleRedirect('Sign in as Investor')}
                            >
                                Sign in as Investor
                            </button>
                        </motion.div>
                    </motion.div>
                    <motion.div
                        className="md:w-1/2 relative"
                        variants={imageVariants}
                    >
                        <div className="relative">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 transform rotate-1 scale-105 blur-sm"></div>
                            <img
                                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/44b395bc45-d90da5911cae8f1eebf6.png"
                                alt="Connecting Startups and Investors"
                                className="relative rounded-xl shadow-2xl w-full object-cover"
                            />
                            {/* Floating elements for visual interest */}
                            <motion.div
                                className="absolute -top-6 -right-6 bg-white p-4 rounded-lg shadow-lg hidden md:block"
                                animate={{
                                    y: [0, 10, 0],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 4,
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="font-medium text-sm">97% Match Rate</span>
                                </div>
                            </motion.div>
                            <motion.div
                                className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg hidden md:block"
                                animate={{
                                    y: [0, -10, 0],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 5,
                                    delay: 1
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ background: colours.indigo600 }}></div>
                                    <span className="font-medium text-sm">Value-Aligned</span>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Wave divider */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 md:h-24">
                    <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="#FFFFFF"></path>
                    <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="#FFFFFF"></path>
                    <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="#FFFFFF"></path>
                </svg>
            </div>
        </section>
    );
};
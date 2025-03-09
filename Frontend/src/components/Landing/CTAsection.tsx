import React from 'react';
import { colours } from "../../utils/colours";
import { motion } from "framer-motion";
import { useInView } from 'react-intersection-observer';
import { useSectionInView } from '../../hooks/useSectionInView';
import { useNavigate } from 'react-router-dom';

export const CTAsection: React.FC = () => {
    const sectionRef = useSectionInView({ sectionName: 'Contact', threshold: 0.1 });
    const navigate = useNavigate();

    const handleRedirect = () => {
        navigate('/coming-soon', { state: { from: 'Sign Up Now' } });
    };

    // Create a separate ref for animation triggering
    const [animationRef, animationInView] = useInView({
        threshold: 0.3,
        triggerOnce: true
    });

    // Combine refs
    const combinedRef = (el: HTMLElement | null) => {
        if (el) {
            sectionRef(el);
            animationRef(el);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    // Generate random stars for the background
    const stars = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 4 + 1,
        duration: Math.random() * 3 + 2
    }));

    return (
        <motion.section
            ref={combinedRef}
            id="contact"
            className="py-16 md:py-24 relative overflow-hidden"
            style={{
                background: colours.primaryGradient,
                boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.2)'
            }}
            initial="hidden"
            animate={animationInView ? "visible" : "hidden"}
            variants={containerVariants}
        >
            {/* Animated background shapes */}
            {stars.map(star => (
                <motion.div
                    key={star.id}
                    className="absolute rounded-full bg-white opacity-30"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: star.size,
                        height: star.size
                    }}
                    animate={{
                        opacity: [0.3, 0.8, 0.3],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        repeatType: "reverse"
                    }}
                />
            ))}

            <div className="container mx-auto px-4 relative z-10">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-5 gap-8 items-center">
                        {/* Left side: content */}
                        <div className="md:col-span-3">
                            <motion.div variants={itemVariants} transition={{ duration: 0.6 }}>
                                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                                    Ready to Find Your Perfect Match?
                                </h2>
                            </motion.div>

                            <motion.div variants={itemVariants} transition={{ duration: 0.6, delay: 0.2 }}>
                                <p className="text-white/80 text-lg mb-6 max-w-lg">
                                    Join KarmicDD today and discover investors and startups that share your vision and values.
                                </p>
                            </motion.div>

                            <motion.div
                                variants={itemVariants}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4"
                            >
                                <motion.button
                                    className="px-8 py-3 bg-white text-indigo-700 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleRedirect}
                                >
                                    Get Started Free
                                    <motion.svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 ml-2"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        initial={{ x: 0 }}
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{
                                            repeat: Infinity,
                                            repeatType: "reverse",
                                            duration: 1,
                                            repeatDelay: 1
                                        }}
                                    >
                                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </motion.svg>
                                </motion.button>

                                <motion.button
                                    className="px-8 py-3 border-2 border-white text-white rounded-xl font-medium hover:bg-white/10 flex items-center justify-center"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/auth')}
                                >
                                    Learn More
                                </motion.button>
                            </motion.div>
                        </div>

                        {/* Right side: stats or graphic */}
                        <motion.div
                            className="md:col-span-2 hidden md:block"
                            variants={itemVariants}
                            transition={{ duration: 0.8, delay: 0.6 }}
                        >
                            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 text-white">
                                {/* Platform stats */}
                                {[
                                    { value: "1,000+", label: "Startups" },
                                    { value: "500+", label: "Investors" },
                                    { value: "89%", label: "Match Rate" }
                                ].map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        className="mb-6 last:mb-0"
                                        whileHover={{ scale: 1.05, x: 5 }}
                                    >
                                        <h4 className="text-3xl font-bold">{stat.value}</h4>
                                        <p className="text-white/70">{stat.label}</p>
                                        {index < 2 && <div className="h-px bg-white/20 mt-5" />}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

                <motion.div
                    className="text-center text-white/70 mt-8"
                    variants={itemVariants}
                    transition={{ duration: 0.6, delay: 0.8 }}
                >
                    <p>No credit card required. Free plan available with basic features.</p>
                </motion.div>
            </div>
        </motion.section>
    );
};
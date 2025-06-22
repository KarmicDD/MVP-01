import React, { useState } from 'react';
import { FaFileAlt, FaHandshake, FaUserPlus, FaPeopleArrows, FaClipboardCheck } from "react-icons/fa";
import { colours } from "../../utils/colours";
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useSectionInView } from '../../hooks/useSectionInView';

export const WorkingSection: React.FC = () => {
    const sectionRef = useSectionInView({ sectionName: 'How It Works', threshold: 0.3 });
    const [expandedStep, setExpandedStep] = useState<number | null>(null);

    const [animationRef, inView] = useInView({
        threshold: 0.1,
        triggerOnce: true
    });

    const combinedRef = (el: HTMLElement | null) => {
        if (el) {
            sectionRef(el);
            animationRef(el);
        }
    };

    const steps = [
        {
            icon: FaUserPlus,
            title: "Sign Up",
            description: "Choose your role as a Startup or Investor and create your account in just minutes.",
            details: "Our streamlined onboarding process lets you specify your preferences, goals, and vision. This data powers our matching algorithm to find your ideal partnerships."
        },
        {
            icon: FaFileAlt,
            title: "Profile Setup",
            description: "Import your profile automatically or customize it to highlight what makes you unique.",
            details: "Connect your existing profiles from platforms like LinkedIn or AngelList, or build a custom profile that showcases your unique value proposition and requirements."
        },
        {
            icon: FaPeopleArrows,
            title: "Get Matched",
            description: "Our algorithm finds partners aligned with your values and business goals.",
            details: "Using proprietary AI technology, we analyze not just surface-level criteria but deep compatibility factors including mission alignment, belief systems, and long-term objectives."
        },
        {
            icon: FaHandshake,
            title: "Connect",
            description: "Start meaningful collaborations with confidence in your aligned vision.",
            details: "Engage through our secure messaging platform, schedule virtual meetings, and access structured discussion guides designed to validate mutual fit and expectations."
        },
        {
            icon: FaClipboardCheck,
            title: "Due Diligence Check",
            description: "Validate alignment with our proprietary tools that analyze belief systems and compatibility.",
            details: "Access comprehensive reports that quantify alignment across key dimensions, highlighting areas of strong compatibility and potential challenges to address proactively."
        }
    ];

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
    };

    const lineVariants = {
        hidden: { scaleX: 0, originX: 0 },
        visible: {
            scaleX: 1,
            transition: {
                duration: 1.5,
                ease: "easeInOut",
                delay: 0.5
            }
        }
    };

    return (<section
        ref={combinedRef}
        id="how-it-works"
        className="py-24 md:py-32 overflow-hidden"
        style={{
            background: `linear-gradient(135deg, ${colours.white} 0%, ${colours.formBackground} 100%)`,
            position: 'relative'
        }}
        aria-label="How KarmicDD Due Diligence Process Works"
    >
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-10" style={{ background: colours.primaryGradient }}></div>
            <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full opacity-5" style={{ background: colours.primaryGradient }}></div>
            <div className="absolute -bottom-20 left-1/4 w-72 h-72 rounded-full opacity-10" style={{ background: colours.secondaryGradient }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
            <motion.div
                className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
            >
                <span className="px-4 py-2 rounded-full text-sm font-semibold inline-block mb-4"
                    style={{ background: `linear-gradient(to right, ${colours.indigo50}, ${colours.indigo100})`, color: colours.primaryBlue }}>
                    Our Process
                </span>                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                    How <span style={{ color: colours.primaryBlue }}>KarmicDD's</span> AI-Powered Due Diligence <span style={{ color: colours.primaryBlue }}>Works</span>
                </h2>
                <p className="text-base md:text-lg opacity-80" style={{ color: colours.gray600 }}>
                    A streamlined 4-step KarmicDD process that leverages cutting-edge AI to connect startups and investors, validate financial compliance, and ensure belief system alignment for successful partnerships in the Indian market.
                </p>
            </motion.div>

            <div className="relative">
                {/* Desktop connector line */}
                <motion.div
                    className="hidden md:block absolute top-1/2 left-0 w-full h-1 rounded-full"
                    style={{ background: `linear-gradient(to right, ${colours.primaryBlue}, ${colours.indigo100})` }}
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                    variants={lineVariants}
                ></motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-5 gap-y-12 md:gap-x-5 relative z-10"
                    variants={containerVariants}
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                >
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            className="relative"
                            variants={itemVariants}
                            whileHover={{ y: -8, transition: { duration: 0.3 } }}
                            onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                        >
                            <div
                                className={`bg-white rounded-2xl p-7 text-center relative shadow-xl transition-all duration-300 cursor-pointer
                                    ${expandedStep === index ? 'ring-2 ring-offset-2' : 'hover:shadow-2xl'}`}
                                style={{
                                    borderTop: `4px solid ${colours.primaryBlue}`,
                                    minHeight: "320px",
                                    transform: expandedStep === index ? 'scale(1.03)' : 'scale(1)',
                                    boxShadow: expandedStep === index ? `0 25px 50px -12px rgba(62, 96, 233, 0.25)` : '0 10px 30px -3px rgba(0, 0, 0, 0.1)',
                                    '--ring-color': colours.primaryBlue
                                } as React.CSSProperties}
                            >
                                {/* Step number badge */}
                                <div
                                    className="absolute -top-5 -right-5 w-10 h-10 rounded-full flex items-center justify-center font-bold text-md shadow-lg"
                                    style={{
                                        background: colours.primaryGradient,
                                        color: colours.white
                                    }}
                                >
                                    {index + 1}
                                </div>

                                <div className="flex justify-center mb-6">
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center transform transition-transform duration-500"
                                        style={{
                                            background: `linear-gradient(135deg, ${colours.indigo50}, ${colours.indigo100})`,
                                            boxShadow: `0 8px 16px -4px rgba(62, 96, 233, 0.25)`
                                        }}
                                    >
                                        <motion.div
                                            initial={{ rotate: 0 }}
                                            animate={expandedStep === index ? { rotate: 360, scale: 1.1 } : { rotate: 0, scale: 1 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <step.icon className="text-4xl" style={{ color: colours.primaryBlue }} />
                                        </motion.div>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold mb-3" style={{ color: colours.black }}>{step.title}</h3>
                                <p style={{ color: colours.gray600 }} className="text-base">
                                    {step.description}
                                </p>

                                {/* Expanded details */}
                                <AnimatePresence>
                                    {expandedStep === index && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="mt-4 pt-4 border-t border-gray-100"
                                        >
                                            <p className="text-sm text-left" style={{ color: colours.gray600 }}>
                                                {step.details}
                                            </p>
                                            <motion.button
                                                className="mt-3 text-sm font-medium"
                                                style={{ color: colours.primaryBlue }}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                Learn more →
                                            </motion.button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* View details indicator */}
                                {expandedStep !== index && (
                                    <motion.div
                                        className="absolute bottom-4 left-0 right-0 text-xs font-medium flex items-center justify-center opacity-60"
                                        style={{ color: colours.primaryBlue }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.6 }}
                                        transition={{ delay: 1 }}
                                    >
                                        <span>Click to expand</span>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="ml-1">
                                            <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </motion.div>
                                )}
                            </div>

                            {/* Mobile only connector */}
                            {index < steps.length - 1 && (
                                <div className="md:hidden mt-8 flex justify-center">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={inView ? { height: 30 } : { height: 0 }}
                                        transition={{ delay: index * 0.2 + 0.5, duration: 0.5 }}
                                        className="w-1 bg-gradient-to-b"
                                        style={{ background: `linear-gradient(to bottom, ${colours.primaryBlue}, ${colours.indigo100})` }}
                                    ></motion.div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            <motion.div
                className="mt-16 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 1.5, duration: 0.6 }}
            >

            </motion.div>
        </div>
    </section>
    );
};
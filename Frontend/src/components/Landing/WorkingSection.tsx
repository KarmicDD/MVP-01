// src/components/Landing/WorkingSection.tsx
import React from 'react';
import { FaFileAlt, FaHandshake, FaUserPlus, FaPeopleArrows } from "react-icons/fa";
import { colours } from "../../utils/colours";
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useSectionInView } from '../../hooks/useSectionInView';

export const WorkingSection: React.FC = () => {
    const sectionRef = useSectionInView({ sectionName: 'How It Works', threshold: 0.3 });

    const [animationRef, inView] = useInView({
        threshold: 0.2,
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
            description: "Choose your role as a Startup or Investor and create your account in just minutes."
        },
        {
            icon: FaFileAlt,
            title: "Profile Setup",
            description: "Import your profile automatically or customize it to highlight what makes you unique."
        },
        {
            icon: FaPeopleArrows,
            title: "Get Matched",
            description: "Our algorithm finds partners aligned with your values and business goals."
        },
        {
            icon: FaHandshake,
            title: "Connect",
            description: "Start meaningful collaborations with confidence in your aligned vision."
        }
    ];

    return (
        <section
            ref={combinedRef}
            id="how-it-works"
            className="py-16 md:py-24"
            style={{
                background: `linear-gradient(to bottom, ${colours.white}, ${colours.gray50})`
            }}
        >
            <div className="container mx-auto px-4">
                <motion.div
                    className="text-center max-w-2xl mx-auto mb-12 md:mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
                    <p className="text-base md:text-lg" style={{ color: colours.gray600 }}>
                        A simple four-step process to find your ideal match in the startup ecosystem
                    </p>
                </motion.div>

                <div className="relative">
                    {/* Desktop connector line */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5" style={{ backgroundColor: colours.indigo100, transform: 'translateY(-50%)' }}></div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6 relative z-10">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                className="bg-white rounded-xl p-6 text-center relative shadow-lg"
                                initial={{ opacity: 0, y: 30 }}
                                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.2,
                                    type: "spring",
                                    stiffness: 50
                                }}
                            >
                                {/* Step number badge */}
                                <div
                                    className="absolute -top-4 -right-4 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                                    style={{
                                        background: colours.primaryGradient,
                                        color: colours.white
                                    }}
                                >
                                    {index + 1}
                                </div>

                                <div className="flex justify-center mb-5">
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center"
                                        style={{
                                            background: `linear-gradient(135deg, ${colours.indigo50}, ${colours.indigo100})`,
                                            boxShadow: '0 8px 16px -4px rgba(90, 66, 227, 0.25)'
                                        }}
                                    >
                                        <step.icon className="text-3xl" style={{ color: colours.indigo600 }} />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                <p style={{ color: colours.gray600 }} className="text-base">
                                    {step.description}
                                </p>

                                {/* Mobile only arrow indicator */}
                                {index < steps.length - 1 && (
                                    <div className="md:hidden mt-4 flex justify-center">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 5v14M19 12l-7 7-7-7" stroke={colours.indigo600} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
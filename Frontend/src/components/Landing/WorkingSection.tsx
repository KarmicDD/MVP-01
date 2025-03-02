// ../src/components/Landing/WorkingSection.tsx
import React from 'react';
import { FaFileAlt, FaHandshake, FaUserPlus, FaPeopleArrows } from "react-icons/fa";
import { colours } from "../../utils/colours";
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useSectionInView } from '../../hooks/useSectionInView'; // Import the hook

export const WorkingSection: React.FC = () => {
    const sectionRef = useSectionInView({ sectionName: 'How It Works', threshold: 0.8 });

    // Create a separate ref for animation triggering
    const [animationRef, animationInView] = useInView({
        threshold: 0.75,
        triggerOnce: true
    });

    const stepVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 }
    };

    const combinedRef = (el: HTMLElement | null) => {
        if (el) {
            sectionRef(el);
            animationRef(el);
        }
    };

    return (
        <section
            ref={combinedRef}
            id="how-it-works"
            className="py-8 md:py-16"
            style={{ backgroundColor: colours.gray50 }}
        >
            <div className="container mx-auto px-4">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-16">How It Works</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { icon: FaUserPlus, title: "Sign Up", description: "Choose your role as a Startup or Investor" },
                        { icon: FaFileAlt, title: "Profile Setup", description: "Import or manually enter your details" },
                        { icon: FaPeopleArrows, title: "Get Matched", description: "Find partners aligned with your values" },
                        { icon: FaHandshake, title: "Connect", description: "Start meaningful collaborations" }
                    ].map((step, index) => (
                        <motion.div
                            key={index}
                            className="bg-white rounded-lg p-4 md:p-6 text-center relative shadow-sm hover:shadow-md transition-shadow duration-300"
                            style={{ border: `1px solid ${colours.gray200}` }}
                            variants={stepVariants}
                            initial="hidden"
                            animate={animationInView ? "visible" : "hidden"}
                            transition={{ duration: 0.3, delay: index * 0.2 }}
                        >
                            <div className="flex justify-center mb-2 md:mb-4">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: colours.indigo100 }}>
                                    <step.icon className="text-2xl md:text-3xl" style={{ color: colours.indigo600 }} />
                                </div>
                            </div>
                            <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">{step.title}</h3>
                            <p style={{ color: colours.gray600 }} className="text-sm md:text-base">{step.description}</p>
                            {index < 3 && (
                                <div className="md:hidden mt-4 flex justify-center">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke={colours.indigo600} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
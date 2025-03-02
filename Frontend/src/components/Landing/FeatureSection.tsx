// src/components/Landing/FeatureSection.tsx
import { RiRobot2Fill } from "react-icons/ri";
import { FaHandshake, FaLink } from "react-icons/fa";
import { motion } from 'framer-motion';
import { colours } from "../../utils/colours";
import React from 'react';
import { useSectionInView } from '../../hooks/useSectionInView';
import { useInView } from 'react-intersection-observer';

export const FeatureSection: React.FC = () => {
    const ref = useSectionInView({ sectionName: 'About', threshold: 0.3 });

    const [inViewRef, inView] = useInView({
        triggerOnce: true,
        threshold: 0.2
    });

    const combinedRef = (el: HTMLElement | null) => {
        if (el) {
            // Apply both refs
            ref(el);
            inViewRef(el);
        }
    };

    const sectionVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const featureVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 60,
                damping: 15
            }
        }
    };

    const features = [
        {
            icon: RiRobot2Fill,
            title: "Automated Profile Fetching",
            description: "Instantly import your company or investor profile from existing platforms with one click, saving you time and ensuring data accuracy."
        },
        {
            icon: FaHandshake,
            title: "Belief-Based Matching",
            description: "Our proprietary algorithm ensures alignment in values and business philosophy, leading to more successful and harmonious partnerships."
        },
        {
            icon: FaLink,
            title: "Seamless Connections",
            description: "Connect directly with matched partners through our platform and start building relationships that are founded on shared vision and goals."
        }
    ];

    return (
        <section
            ref={combinedRef}
            id="features"
            className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                <motion.div
                    className="text-center max-w-2xl mx-auto mb-12 md:mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose KarmicDD</h2>
                    <p className="text-base md:text-lg" style={{ color: colours.gray600 }}>
                        We bring together startups and investors based on what truly matters - shared values and vision.
                    </p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10"
                    variants={sectionVariants}
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="bg-white rounded-xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2"
                            variants={featureVariants}
                        >
                            <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-full"
                                style={{
                                    background: `linear-gradient(135deg, ${colours.indigo50}, ${colours.indigo100})`,
                                    boxShadow: '0 8px 16px -4px rgba(90, 66, 227, 0.2)'
                                }}
                            >
                                <feature.icon
                                    className="text-3xl md:text-4xl"
                                    style={{ color: colours.indigo600 }}
                                />
                            </div>
                            <h3 className="text-xl md:text-2xl font-semibold mb-3">{feature.title}</h3>
                            <p className="text-base" style={{ color: colours.gray600 }}>
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
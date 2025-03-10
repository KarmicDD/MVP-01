import { RiRobot2Fill } from "react-icons/ri";
import { FaHandshake, FaLink } from "react-icons/fa";
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { colours } from "../../utils/colours";
import React, { useRef, useState } from 'react';
import { useSectionInView } from '../../hooks/useSectionInView';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from "react-router-dom";
import './FeatureSection.css'; // We'll create this file for the 3D card styles

export const FeatureSection: React.FC = () => {
    const ref = useSectionInView({ sectionName: 'About', threshold: 0.3 });
    const sectionRef = useRef<HTMLElement>(null);
    const navigate = useNavigate();
    const [flippedCard, setFlippedCard] = useState<number | null>(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    const backgroundOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
    const backgroundScale = useTransform(scrollYProgress, [0, 0.3], [0.95, 1]);

    // Lower threshold to trigger animations earlier
    const [inViewRef, inView] = useInView({
        triggerOnce: false,
        threshold: 0.1
    });

    const combinedRef = (el: HTMLElement | null) => {
        if (el) {
            ref(el);
            inViewRef(el);
            sectionRef.current = el;
        }
    };

    const sectionVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1,
            }
        }
    };

    const titleVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 50,
                damping: 10
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
                damping: 12
            }
        }
    };

    // Updated features with extended descriptions for the card back
    const features = [
        {
            icon: RiRobot2Fill,
            title: "Automated Profile Fetching",
            description: "Instantly import your company or investor profile from existing platforms with one click, saving you time and ensuring data accuracy.",
            extendedInfo: {
                title: "How Our Profile Fetching Works",
                points: [
                    "AI-powered data collection from top business platforms",
                    "Smart profile completion with 95% accuracy",
                    "One-click integration with LinkedIn, Crunchbase, and PitchBook",
                    "Real-time synchronization of profile updates"
                ],
                stats: "60% faster onboarding compared to manual profile creation"
            },
            color: colours.indigo600,
            hoverColor: colours.indigo700,
            bgGradient: `linear-gradient(135deg, ${colours.indigo50}, ${colours.indigo100})`,
        },
        {
            icon: FaHandshake,
            title: "Belief-Based Matching",
            description: "Our proprietary algorithm ensures alignment in values and business philosophy, leading to more successful and harmonious partnerships.",
            extendedInfo: {
                title: "The Science Behind Our Matching",
                points: [
                    "15-factor belief alignment algorithm developed by behavioral economists",
                    "Deep learning model trained on 10,000+ successful partnerships",
                    "Value compatibility scoring across culture, goals, and risk tolerance",
                    "Continuous refinement based on partnership outcomes"
                ],
                stats: "83% of matched partnerships report higher satisfaction compared to traditional methods"
            },
            color: colours.primaryBlue,
            hoverColor: colours.indigo600,
            bgGradient: `linear-gradient(135deg, ${colours.indigo50}, ${colours.indigo100})`,
        },
        {
            icon: FaLink,
            title: "Seamless Connections",
            description: "Connect directly with matched partners through our platform and start building relationships that are founded on shared vision and goals.",
            extendedInfo: {
                title: "Building Meaningful Connections",
                points: [
                    "End-to-end encrypted communication channels",
                    "Smart scheduling tool with timezone awareness",
                    "Guided conversation starters based on shared interests",
                    "Relationship progress tracking and milestone celebrations"
                ],
                stats: "Users establish meaningful dialogue 3x faster than through traditional networking"
            },
            color: colours.button,
            hoverColor: colours.indigo700,
            bgGradient: `linear-gradient(135deg, ${colours.indigo50}, ${colours.indigo100})`,
        }
    ];

    return (
        <section
            ref={combinedRef}
            id="features"
            className="relative py-20 md:py-32 overflow-hidden">

            {/* Background gradient */}
            <motion.div
                className="absolute inset-0 -z-10 bg-gradient-to-b from-white"
                style={{
                    opacity: backgroundOpacity,
                    scale: backgroundScale,
                    backgroundColor: colours.indigo50
                }}
            />

            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-20 left-10 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
                    style={{ backgroundColor: colours.indigo100 }}></div>
                <div className="absolute top-10 right-10 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"
                    style={{ backgroundColor: colours.primaryBlue }}></div>
                <div className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"
                    style={{ backgroundColor: colours.indigo100 }}></div>
            </div>

            <div className="container mx-auto px-4">
                <motion.div
                    className="text-center max-w-3xl mx-auto mb-16 md:mb-20"
                    variants={titleVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, amount: 0.3 }}
                >
                    <motion.span
                        className="inline-block py-1 px-3 mb-4 rounded-full text-sm font-semibold tracking-wider"
                        style={{
                            background: `linear-gradient(90deg, ${colours.indigo100}, ${colours.background})`,
                            color: colours.indigo700
                        }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        POWERFUL FEATURES
                    </motion.span>
                    <motion.h2
                        className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent"
                        style={{ backgroundImage: colours.primaryGradient }}
                    >
                        Why Choose KarmicDD
                    </motion.h2>
                    <motion.p
                        className="text-lg md:text-xl"
                        style={{ color: colours.gray600 }}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        viewport={{ once: false, amount: 0.3 }}
                    >
                        We bring together startups and investors based on what truly matters -
                        <span className="font-semibold" style={{ color: colours.indigo600 }}> shared values and vision</span>.
                    </motion.p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 relative z-10">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="flip-card"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{
                                opacity: 1,
                                y: 0,
                                transition: {
                                    type: "spring",
                                    stiffness: 60,
                                    damping: 12,
                                    delay: index * 0.1
                                }
                            }}
                            viewport={{ once: false, amount: 0.2 }}
                        >
                            <div className={`flip-card-inner ${flippedCard === index ? 'is-flipped' : ''}`}>
                                {/* Front of card */}
                                <div
                                    className="flip-card-front bg-white/90 backdrop-blur-sm rounded-2xl p-8 md:p-10 shadow-xl"
                                    onClick={() => setFlippedCard(index)}
                                >
                                    <motion.div
                                        className="mb-8 flex items-center justify-center w-20 h-20 rounded-2xl"
                                        style={{
                                            background: feature.bgGradient,
                                            boxShadow: `0 8px 24px -4px rgba(90, 66, 227, 0.25)`
                                        }}
                                        whileHover={{
                                            scale: 1.05,
                                            rotate: [0, 5, -5, 0],
                                            transition: {
                                                rotate: { repeat: 0, duration: 0.5 },
                                                scale: { duration: 0.2 }
                                            }
                                        }}
                                    >
                                        <feature.icon
                                            className="text-4xl md:text-5xl"
                                            style={{ color: feature.color }}
                                        />
                                    </motion.div>

                                    <h3 className="text-2xl md:text-3xl font-bold mb-4">{feature.title}</h3>

                                    <p
                                        className="text-base md:text-lg mb-6"
                                        style={{ color: colours.gray600, lineHeight: 1.6 }}
                                    >
                                        {feature.description}
                                    </p>

                                    <motion.div
                                        className="flex items-center text-sm font-medium mt-auto"
                                        style={{ color: feature.color }}
                                        whileHover={{ x: 5 }}
                                    >
                                        <span className="relative group cursor-pointer">
                                            <span>Learn more</span>
                                            <span
                                                className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                                                style={{ background: feature.color }}
                                            />
                                        </span>
                                        <motion.svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 ml-1"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            animate={{ x: [0, 3, 0] }}
                                            transition={{
                                                repeat: Infinity,
                                                repeatType: "mirror",
                                                duration: 1.5,
                                                repeatDelay: 1
                                            }}
                                        >
                                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </motion.svg>
                                    </motion.div>

                                    {/* Feature Tag */}
                                    <div className="absolute top-5 right-5">
                                        <motion.span
                                            className="inline-block py-1 px-3 rounded-full text-xs font-semibold tracking-wide"
                                            style={{
                                                background: `linear-gradient(90deg, ${feature.color}20, ${feature.hoverColor}40)`,
                                                color: feature.color
                                            }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {index === 0 ? 'NEW' : index === 1 ? 'POPULAR' : 'EXCLUSIVE'}
                                        </motion.span>
                                    </div>

                                    {/* Subtle decorative accent */}
                                    <div
                                        className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl"
                                        style={{ background: feature.bgGradient }}
                                    ></div>
                                </div>

                                {/* Back of card */}
                                <div
                                    className="flip-card-back bg-white/90 backdrop-blur-sm rounded-2xl p-8 md:p-10 shadow-xl"
                                    onClick={() => setFlippedCard(null)}
                                >
                                    <div className="h-full flex flex-col">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center mb-6 mx-auto"
                                            style={{ background: feature.bgGradient }}
                                        >
                                            <feature.icon
                                                className="text-xl"
                                                style={{ color: feature.color }}
                                            />
                                        </div>

                                        <h3
                                            className="text-xl md:text-2xl font-bold mb-4 text-center"
                                            style={{ color: feature.color }}
                                        >
                                            {feature.extendedInfo.title}
                                        </h3>

                                        <div className="mb-6 space-y-3">
                                            {feature.extendedInfo.points.map((point, i) => (
                                                <div key={i} className="flex items-start">
                                                    <div
                                                        className="w-2 h-2 mt-1.5 rounded-full flex-shrink-0"
                                                        style={{ background: feature.color }}
                                                    ></div>
                                                    <p
                                                        className="ml-2 text-sm md:text-base"
                                                        style={{ color: colours.gray600 }}
                                                    >
                                                        {point}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        <div
                                            className="p-4 rounded-lg mt-auto mb-6"
                                            style={{
                                                background: `linear-gradient(135deg, ${feature.color}10, ${feature.color}20)`,
                                                border: `1px dashed ${feature.color}40`
                                            }}
                                        >
                                            <p
                                                className="text-sm text-center font-medium"
                                                style={{ color: feature.color }}
                                            >
                                                <span className="opacity-75">Stat:</span> {feature.extendedInfo.stats}
                                            </p>
                                        </div>

                                        <motion.div
                                            className="flex justify-center"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <span
                                                className="flex items-center text-xs font-medium px-4 py-2 rounded-full"
                                                style={{
                                                    color: feature.color,
                                                    border: `1px solid ${feature.color}40`
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
                                                </svg>
                                                Tap to go back
                                            </span>
                                        </motion.div>
                                    </div>

                                    {/* Subtle decorative accent */}
                                    <div
                                        className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl"
                                        style={{ background: feature.bgGradient }}
                                    ></div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* CTA Section */}
                <motion.div
                    className="mt-16 md:mt-24 text-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <motion.button
                        className="px-8 py-4 rounded-full font-medium text-lg shadow-lg"
                        style={{
                            background: colours.primaryGradient,
                            color: colours.whiteText,
                            boxShadow: `0 10px 25px -5px rgba(90, 66, 227, 0.4)`
                        }}
                        whileHover={{
                            scale: 1.05,
                            boxShadow: `0 15px 30px -5px rgba(90, 66, 227, 0.6)`
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        onClick={() => navigate('/auth')}
                    >
                        Get Started Now
                    </motion.button>
                    <p className="mt-4 text-sm" style={{ color: colours.gray400 }}>
                        No credit card required. Free trial.
                    </p>
                </motion.div>
            </div>
        </section>
    );
};
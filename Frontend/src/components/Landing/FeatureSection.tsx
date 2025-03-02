// ..src/components/Landing/FeatureSection.tsx
import { RiRobot2Fill } from "react-icons/ri";
import { FaHandshake, FaLink } from "react-icons/fa";
import { motion } from 'framer-motion';
import { colours } from "../../utils/colours";
import React from 'react';
import { useSectionInView } from '../../hooks/useSectionInView';

const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export const FeatureSection: React.FC = () => {
    const ref = useSectionInView({ sectionName: 'About', threshold: 0.50 });

    return (
        <section
            ref={ref}
            id="features"
            className="py-8 md:py-16">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-16">Why Choose KarmicDD</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <motion.div
                        className="text-center p-4 rounded-lg hover:shadow-md transition-shadow duration-300"
                        variants={featureVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.3, delay: 0 }}
                    >
                        <div className="flex justify-center mb-2 md:mb-4">
                            <RiRobot2Fill className="text-4xl md:text-5xl" style={{ color: colours.indigo600 }} />
                        </div>
                        <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Automated Profile Fetching</h3>
                        <p style={{ color: colours.gray600 }} className="text-sm md:text-base">
                            Instantly import your company or investor profile from existing platforms.
                        </p>
                    </motion.div>

                    {/* Feature 2 */}
                    <motion.div
                        className="text-center p-4 rounded-lg hover:shadow-md transition-shadow duration-300"
                        variants={featureVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                    >
                        <div className="flex justify-center mb-2 md:mb-4">
                            <FaHandshake className="text-4xl md:text-5xl" style={{ color: colours.indigo600 }} />
                        </div>
                        <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Belief-Based Matching</h3>
                        <p style={{ color: colours.gray600 }} className="text-sm md:text-base">
                            Our algorithm ensures alignment in values and business philosophy.
                        </p>
                    </motion.div>

                    {/* Feature 3 */}
                    <motion.div
                        className="text-center p-4 rounded-lg hover:shadow-md transition-shadow duration-300 sm:col-span-2 md:col-span-1 sm:mx-auto"
                        variants={featureVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                    >
                        <div className="flex justify-center mb-2 md:mb-4">
                            <FaLink className="text-4xl md:text-5xl" style={{ color: colours.indigo600 }} />
                        </div>
                        <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Seamless Connections</h3>
                        <p style={{ color: colours.gray600 }} className="text-sm md:text-base">
                            Connect directly with matched partners through our platform.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

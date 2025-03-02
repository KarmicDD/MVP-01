// ../src/components/Landing/CTAsection.tsx
import React from 'react';
import { colours } from "../../utils/colours";
import { motion } from "framer-motion";
import { useInView } from 'react-intersection-observer';
import { useSectionInView } from '../../hooks/useSectionInView'; // Import the hook
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

    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 }
    };

    // Combine refs
    const combinedRef = (el: HTMLElement | null) => {
        // Apply both refs to the same element
        if (el) {
            // @ts-ignore - This is a valid way to set refs manually
            sectionRef(el);
            // @ts-ignore
            animationRef(el);
        }
    };

    return (
        <motion.section
            ref={combinedRef}
            id="contact"
            className="py-8 md:py-16 text-white"
            style={{ backgroundColor: colours.indigo600 }}
            variants={sectionVariants}
            initial="hidden"
            animate={animationInView ? "visible" : "hidden"}
            transition={{ duration: 0.5 }}
        >
            <div className="container mx-auto text-center px-4">
                <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">Join KarmicDD Today</h2>
                <p className="mb-4 md:mb-6 text-sm md:text-base max-w-2xl mx-auto">It's free to join and start exploring opportunities.</p>
                <button
                    className="px-4 py-2 rounded-md hover:bg-gray-100 text-sm md:text-base transition-colors duration-300"
                    style={{ backgroundColor: colours.white, color: colours.indigo600 }}
                    onClick={handleRedirect}
                >
                    Sign Up Now
                </button>
            </div>
        </motion.section>
    );
};

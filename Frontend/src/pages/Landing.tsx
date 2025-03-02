// ../src/pages/Landing.tsx
import { Navigation } from '../components/Landing/Navigation';
import { HeroSection } from '../components/Landing/HeroSection';
import { FeatureSection } from '../components/Landing/FeatureSection';
import { WorkingSection } from '../components/Landing/WorkingSection';
import { CTAsection } from '../components/Landing/CTAsection';
import { Footer } from '../components/Landing/Footer';
import { motion } from 'framer-motion';

function Landing() {
    return (
        <motion.div
            className="min-h-screen flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Navigation />
            <HeroSection />
            <FeatureSection />
            <WorkingSection />
            <CTAsection />
            <Footer />
        </motion.div>
    );
}

export default Landing;

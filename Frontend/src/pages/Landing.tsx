// ../src/pages/Landing.tsx
import { Navigation } from '../components/Landing/Navigation';
import { HeroSection } from '../components/Landing/HeroSection';
import { FeatureSection } from '../components/Landing/FeatureSection';
import { WorkingSection } from '../components/Landing/WorkingSection';
import { CTAsection } from '../components/Landing/CTAsection';
import { Footer } from '../components/Landing/Footer';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { defaultSEO } from '../utils/seo';
import SEOHead from '../components/SEO/SEOHead';

function Landing() {
    useEffect(() => {
        // SEO is now handled by SEOHead component
    }, []);

    return (
        <motion.div
            className="min-h-screen flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <SEOHead seoData={defaultSEO.homepage} enableValidation />
            <header role="banner">
                <Navigation />
            </header>
            <main role="main">
                <HeroSection />
                <FeatureSection />
                <WorkingSection />
                <CTAsection />
            </main>
            <Footer />
        </motion.div>
    );
}

export default Landing;

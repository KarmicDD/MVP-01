import { useEffect } from 'react';
import { SEOData, updateSEO, validateSEOData } from '../utils/seo';

export const useSEO = (seoData: SEOData) => {
    useEffect(() => {
        // Validate SEO data in development
        if (process.env.NODE_ENV === 'development') {
            const warnings = validateSEOData(seoData);
            if (warnings.length > 0) {
                console.warn('SEO Warnings:', warnings);
            }
        }

        // Update SEO
        updateSEO(seoData);

        // Cleanup function to reset to default SEO when component unmounts
        return () => {
            // Optional: Reset to default values when component unmounts
        };
    }, [seoData]);
};

export default useSEO;

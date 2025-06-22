import React, { useEffect } from 'react';
import { SEOData, updateSEO, validateSEOData, defaultSEO } from '../../utils/seo';

interface SEOHeadProps {
    seoData: SEOData;
    enableValidation?: boolean;
    resetOnUnmount?: boolean;
}

const SEOHead: React.FC<SEOHeadProps> = ({
    seoData,
    enableValidation = false,
    resetOnUnmount = false
}) => {
    useEffect(() => {
        // Validate SEO data in development mode
        if (enableValidation && process.env.NODE_ENV === 'development') {
            const warnings = validateSEOData(seoData);
            if (warnings.length > 0) {
                console.warn('SEO Validation Warnings:', warnings);
            }
        }

        // Update SEO using our utility function
        updateSEO(seoData);

        // Cleanup function to reset to defaults when component unmounts
        return () => {
            if (resetOnUnmount) {
                // Reset to homepage defaults when component unmounts
                updateSEO(defaultSEO.homepage);
            }
        };
    }, [seoData, enableValidation, resetOnUnmount]);

    // This component doesn't render anything visible
    return null;
};

export default SEOHead;

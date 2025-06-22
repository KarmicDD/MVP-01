import React, { useEffect } from 'react';
import { updateSEO, defaultSEO } from '../utils/seo';

// Example page demonstrating SEO implementation
const ExamplePage: React.FC = () => {
    useEffect(() => {
        // Method 1: Use predefined SEO data
        updateSEO(defaultSEO.features);

        // Method 2: Use custom SEO data
        // updateSEO({
        //   title: 'Custom Page Title - KarmicDD',
        //   description: 'Custom page description for better SEO',
        //   keywords: 'custom, keywords, for, this, page',
        //   canonical: 'https://karmicdd.netlify.app/custom-page',
        //   structuredData: {
        //     "@context": "https://schema.org",
        //     "@type": "WebPage",
        //     "name": "Custom Page",
        //     "description": "Description of the custom page"
        //   }
        // });
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1>Example Page with SEO</h1>
            <p>This page demonstrates how to implement SEO in any component.</p>

            {/* Your page content here */}
        </div>
    );
};

export default ExamplePage;

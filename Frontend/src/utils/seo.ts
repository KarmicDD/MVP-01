// SEO utility functions for KarmicDD
export interface SEOData {
    title: string;
    description: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonical?: string;
    structuredData?: object;
    twitterCard?: string;
    noindex?: boolean;
    alternateLanguages?: Array<{ lang: string, url: string }>;
}

export const updateSEO = (seoData: SEOData) => {
    // Update page title
    if (seoData.title) {
        document.title = seoData.title;
    }

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && seoData.description) {
        metaDescription.setAttribute('content', seoData.description);
    }

    // Update keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && seoData.keywords) {
        metaKeywords.setAttribute('content', seoData.keywords);
    }

    // Update robots meta if noindex is specified
    const robotsMeta = document.querySelector('meta[name="robots"]');
    if (robotsMeta && seoData.noindex) {
        robotsMeta.setAttribute('content', 'noindex, nofollow');
    } else if (robotsMeta) {
        robotsMeta.setAttribute('content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && seoData.ogTitle) {
        ogTitle.setAttribute('content', seoData.ogTitle);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription && seoData.ogDescription) {
        ogDescription.setAttribute('content', seoData.ogDescription);
    }

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && seoData.ogImage) {
        ogImage.setAttribute('content', seoData.ogImage);
    }

    // Update Twitter Card tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle && seoData.ogTitle) {
        twitterTitle.setAttribute('content', seoData.ogTitle);
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription && seoData.ogDescription) {
        twitterDescription.setAttribute('content', seoData.ogDescription);
    }

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage && seoData.ogImage) {
        twitterImage.setAttribute('content', seoData.ogImage);
    }

    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical && seoData.canonical) {
        canonical.setAttribute('href', seoData.canonical);
    }

    // Update or add hreflang tags
    if (seoData.alternateLanguages) {
        // Remove existing hreflang tags
        const existingHreflangs = document.querySelectorAll('link[rel="alternate"][hreflang]');
        existingHreflangs.forEach(link => link.remove());

        // Add new hreflang tags
        seoData.alternateLanguages.forEach(alt => {
            const link = document.createElement('link');
            link.rel = 'alternate';
            link.hreflang = alt.lang;
            link.href = alt.url;
            document.head.appendChild(link);
        });
    }

    // Add structured data
    if (seoData.structuredData) {
        const existingSchema = document.querySelector('script[type="application/ld+json"][data-dynamic]');
        if (existingSchema) {
            existingSchema.remove();
        }

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-dynamic', 'true');
        script.textContent = JSON.stringify(seoData.structuredData);
        document.head.appendChild(script);
    }
};

// Default SEO data for different pages
export const defaultSEO = {
    homepage: {
        title: 'KarmicDD - AI-Powered Due Diligence Platform for Startups and Investors | KarmicDD India | Karmic DD',
        description: 'KarmicDD is India\'s leading AI-powered due diligence platform connecting startups and investors through belief-based matching, financial analysis, and comprehensive compliance reports. Join KarmicDD today for seamless due diligence - trusted by 500+ Indian startups and investors.',
        keywords: 'KarmicDD, Karmic DD, karmic dd, due diligence platform India, KarmicDD platform, startup investor matching KarmicDD, AI financial analysis KarmicDD, belief system alignment, investor discovery platform, startup compliance India, venture capital platform India, due diligence software, startup evaluation KarmicDD, fintech India, angel investment platform, seed funding, series A funding, startup ecosystem India, investment due diligence, regulatory compliance India, SEBI compliance, KarmicDD login, KarmicDD registration',
        ogTitle: 'KarmicDD - India\'s Leading AI-Powered Due Diligence Platform | Karmic DD',
        ogDescription: 'Join 500+ startups and investors using KarmicDD\'s AI-powered platform for seamless due diligence, belief-based matching, and regulatory compliance in India\'s startup ecosystem. Experience KarmicDD today.',
        ogImage: 'https://karmicdd.netlify.app/og-homepage.jpg',
        canonical: 'https://karmicdd.netlify.app/',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "KarmicDD - AI-Powered Due Diligence Platform",
            "description": "India's leading AI-powered due diligence platform for startups and investors with belief-based matching and comprehensive financial analysis",
            "url": "https://karmicdd.netlify.app/",
            "inLanguage": "en-IN",
            "mainEntity": {
                "@type": "SoftwareApplication",
                "name": "KarmicDD Platform"
            },
            "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": "https://karmicdd.netlify.app/"
                    }
                ]
            }
        }
    },

    auth: {
        title: 'Sign Up or Login - Join KarmicDD\'s Due Diligence Platform | Free Registration',
        description: 'Join KarmicDD to access AI-powered due diligence tools for startups and investors. Create your free account to start connecting with the right partners through belief-based matching and discover investment opportunities in India\'s startup ecosystem.',
        keywords: 'startup registration India, investor signup, due diligence login, KarmicDD account, startup investor platform, free startup registration, investor platform India, venture capital signup, angel investor registration',
        ogTitle: 'Join KarmicDD - Free Registration for Startups and Investors',
        ogDescription: 'Sign up for free to access India\'s most trusted AI-powered due diligence platform. Connect with verified startups and investors through our belief-based matching system.',
        ogImage: 'https://karmicdd.netlify.app/og-auth.jpg',
        canonical: 'https://karmicdd.netlify.app/auth',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Sign Up - KarmicDD",
            "description": "Register for KarmicDD's AI-powered due diligence platform",
            "url": "https://karmicdd.netlify.app/auth"
        }
    },

    dashboard: {
        title: 'Dashboard - Manage Your Investments and Due Diligence | KarmicDD',
        description: 'Access your personalized dashboard on KarmicDD. View matches, conduct AI-powered due diligence analysis, manage your startup or investor profile, and track your investment pipeline.',
        keywords: 'startup dashboard, investor dashboard, due diligence analysis, profile management, business matching, investment pipeline, startup metrics, investor portfolio',
        ogTitle: 'KarmicDD Dashboard - Your Investment Command Center',
        ogDescription: 'Manage your investments, view potential matches, and conduct comprehensive due diligence analysis from your personalized KarmicDD dashboard.',
        ogImage: 'https://karmicdd.netlify.app/og-dashboard.jpg',
        canonical: 'https://karmicdd.netlify.app/dashboard',
        noindex: true,
        structuredData: {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Dashboard - KarmicDD",
            "description": "User dashboard for managing due diligence and investments",
            "url": "https://karmicdd.netlify.app/dashboard"
        }
    },

    features: {
        title: 'Features - AI-Powered Due Diligence Tools for Indian Startups | KarmicDD',
        description: 'Discover KarmicDD\'s comprehensive suite of AI-powered due diligence features including belief-based matching, financial analysis, SEBI compliance reports, risk assessment, and investor discovery tools designed specifically for the Indian startup ecosystem.',
        keywords: 'AI due diligence features, startup analysis tools, investor matching features, financial compliance India, belief system analysis, SEBI compliance, risk assessment tools, investment discovery, startup evaluation software',
        ogTitle: 'KarmicDD Features - Advanced Due Diligence Tools for India',
        ogDescription: 'Explore powerful AI-driven features designed for Indian startups and investors: belief-based matching, automated compliance reports, risk assessment, and comprehensive financial analysis.',
        ogImage: 'https://karmicdd.netlify.app/og-features.jpg',
        canonical: 'https://karmicdd.netlify.app/features',
        structuredData: {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Features - KarmicDD",
            "description": "Comprehensive features of KarmicDD's due diligence platform",
            "url": "https://karmicdd.netlify.app/features"
        }
    },

    profile: {
        title: 'Profile Management - Build Your Startup or Investor Profile | KarmicDD',
        description: 'Create and manage your comprehensive startup or investor profile on KarmicDD. Showcase your company details, upload documents, set investment preferences, and connect with the right partners through our AI-powered matching system.',
        keywords: 'startup profile creation, investor profile, company profile management, startup showcase, investor preferences, due diligence documents, profile optimization',
        ogTitle: 'Build Your Profile - Connect with the Right Partners',
        ogDescription: 'Create a comprehensive profile to attract the right investors or discover promising startups through KarmicDD\'s intelligent matching system.',
        canonical: 'https://karmicdd.netlify.app/profile',
        noindex: true
    },

    questionnaire: {
        title: 'Investment Questionnaire - Define Your Preferences | KarmicDD',
        description: 'Complete our comprehensive questionnaire to help our AI understand your investment preferences, risk tolerance, and belief system for better startup-investor matching.',
        keywords: 'investment questionnaire, investor preferences, risk assessment, belief system analysis, startup matching criteria',
        canonical: 'https://karmicdd.netlify.app/question',
        noindex: true
    },

    // Dynamic profile pages
    startupProfile: (companyName: string) => ({
        title: `${companyName} - Startup Profile | KarmicDD Due Diligence Platform`,
        description: `Explore ${companyName}'s comprehensive startup profile on KarmicDD. View due diligence documents, financial information, team details, and investment opportunities for this Indian startup.`,
        keywords: `${companyName} startup, startup profile, due diligence ${companyName}, investment opportunity, startup information, company analysis`,
        ogTitle: `${companyName} - Startup Profile on KarmicDD`,
        ogDescription: `Discover investment opportunities with ${companyName}. Access verified due diligence documents and company information on India's leading investment platform.`,
        canonical: `https://karmicdd.netlify.app/${companyName.replace(/\s+/g, '_')}`,
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": companyName,
            "description": `Startup profile for ${companyName} on KarmicDD platform`,
            "url": `https://karmicdd.netlify.app/${companyName.replace(/\s+/g, '_')}`,
            "sameAs": `https://karmicdd.netlify.app/${companyName.replace(/\s+/g, '_')}`
        }
    }),

    investorProfile: (investorName: string) => ({
        title: `${investorName} - Investor Profile | KarmicDD Due Diligence Platform`,
        description: `Connect with ${investorName} on KarmicDD. View investment preferences, portfolio, and expertise areas of this verified investor in India's startup ecosystem.`,
        keywords: `${investorName} investor, investor profile, angel investor, venture capital, investment preferences, startup funding`,
        ogTitle: `${investorName} - Verified Investor on KarmicDD`,
        ogDescription: `Connect with ${investorName}, a verified investor on KarmicDD. Explore investment preferences and funding opportunities.`,
        canonical: `https://karmicdd.netlify.app/${investorName.replace(/\s+/g, '_')}`,
        structuredData: {
            "@context": "https://schema.org",
            "@type": "Person",
            "name": investorName,
            "description": `Investor profile for ${investorName} on KarmicDD platform`,
            "url": `https://karmicdd.netlify.app/${investorName.replace(/\s+/g, '_')}`
        }
    })
};

export const generateArticleSchema = (article: {
    title: string,
    description: string,
    author: string,
    datePublished: string,
    dateModified?: string,
    image?: string,
    url: string
}) => {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title,
        "description": article.description,
        "author": {
            "@type": "Person",
            "name": article.author
        },
        "publisher": {
            "@type": "Organization",
            "name": "KarmicDD",
            "logo": {
                "@type": "ImageObject",
                "url": "https://karmicdd.netlify.app/logo.png"
            }
        },
        "datePublished": article.datePublished,
        "dateModified": article.dateModified || article.datePublished,
        "image": article.image || "https://karmicdd.netlify.app/default-article-image.jpg",
        "url": article.url
    };
};

// SEO validation utilities
export const validateSEOData = (seoData: SEOData): string[] => {
    const warnings: string[] = [];

    if (!seoData.title) {
        warnings.push('Missing title');
    } else if (seoData.title.length > 60) {
        warnings.push('Title too long (over 60 characters)');
    } else if (seoData.title.length < 30) {
        warnings.push('Title too short (under 30 characters)');
    }

    if (!seoData.description) {
        warnings.push('Missing description');
    } else if (seoData.description.length > 160) {
        warnings.push('Description too long (over 160 characters)');
    } else if (seoData.description.length < 120) {
        warnings.push('Description too short (under 120 characters)');
    }

    if (!seoData.keywords) {
        warnings.push('Missing keywords');
    }

    if (!seoData.canonical) {
        warnings.push('Missing canonical URL');
    }

    return warnings;
};

// Local Business Schema for Indian presence
export const generateLocalBusinessSchema = () => {
    return {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "KarmicDD",
        "description": "AI-powered due diligence platform for startups and investors",
        "@id": "https://karmicdd.netlify.app/#organization",
        "url": "https://karmicdd.netlify.app",
        "logo": "https://karmicdd.netlify.app/logo.png",
        "image": "https://karmicdd.netlify.app/business-image.jpg",
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "IN",
            "addressRegion": "India"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": "20.5937",
            "longitude": "78.9629"
        },
        "areaServed": {
            "@type": "Country",
            "name": "India"
        },
        "knowsAbout": [
            "Due Diligence",
            "Startup Investment",
            "Venture Capital",
            "Financial Analysis",
            "Risk Assessment",
            "Regulatory Compliance"
        ],
        "serviceArea": {
            "@type": "Country",
            "name": "India"
        }
    };
};

// Generate breadcrumb structured data
export const generateBreadcrumbSchema = (breadcrumbs: Array<{ name: string, url: string }>) => {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
        }))
    };
};

// Generate FAQ structured data
export const generateFAQSchema = (faqs: Array<{ question: string, answer: string }>) => {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };
};

// Keywords for different sections
export const seoKeywords = {
    dueDiligence: [
        'due diligence platform',
        'startup due diligence',
        'investor due diligence',
        'AI due diligence',
        'financial due diligence',
        'compliance analysis'
    ],

    startups: [
        'startup evaluation',
        'startup analysis',
        'startup compliance',
        'startup financial analysis',
        'Indian startup regulations',
        'startup readiness assessment'
    ],

    investors: [
        'investor matching',
        'startup discovery',
        'investment analysis',
        'VC due diligence',
        'angel investor tools',
        'portfolio analysis'
    ],

    ai: [
        'AI-powered analysis',
        'machine learning due diligence',
        'automated compliance',
        'belief system analysis',
        'intelligent matching',
        'data-driven insights'
    ]
};

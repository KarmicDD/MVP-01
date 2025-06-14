export const colours = {
    indigo600: '#5A42E3', // Original indigo-600, used for primary buttons and accents
    indigo700: '#4C51BF', // Darker shade for hover states
    indigo400: '#818CF8', // Lighter shade for hover states
    indigo200: '#C3DAFE', // Lighter shade for hover states
    indigo100: '#E0E7FF', // Lightest shade for backgrounds
    indigo50: '#F5F7FF', // Lightest shade for backgrounds    // Text Colours
    gray600: '#4B5563', // Primary text colour
    gray200: '#E5E7EB', // Border colour
    gray400: '#9CA3AF', // Footer text colour
    // Additional dark shades
    gray800: '#1F2937', // Dark gray
    gray950: '#030712', // Very dark gray
    slate800: '#1E293B', // Dark slate
    slate900: '#0F172A', // Very dark slate
    slate950: '#020617', // Almost black slate
    zinc800: '#27272A', // Dark zinc
    zinc900: '#18181B', // Very dark zinc
    zinc950: '#09090B', // Almost black zinc
    neutral800: '#262626', // Dark neutral
    neutral900: '#171717', // Very dark neutral
    neutral950: '#0A0A0A', // Almost black neutral
    stone800: '#292524', // Dark stone
    stone900: '#1C1917', // Very dark stone
    stone950: '#0C0A09', // Almost black stone
    white: '#FFFFFF', // Headers
    black: '#000000', // Text
    // Background Colours
    background: '#F1F2FE', // Background for the Hero Section
    gray50: '#FAFAFA', // Background for "How it Works" section
    gray900: '#111827', // Footer background
    gray700: '#374151', // Footer background
    // Button Text Colour
    whiteText: '#FFFFFF', // Text colour for buttons
    button: '#5A42E3', // Main colour for brand and all the indigo
    // New colors
    primaryBlue: '#3e60e9', // New primary blue for buttons
    formBackground: '#f9fafb', // Light mode form background
    mainBackground: '#f9fafb', // Main background

    // Added new colours for enhanced UI
    primaryGradient: 'linear-gradient(135deg, #3e60e9, #5A42E3)',
    secondaryGradient: 'linear-gradient(135deg, #5A42E3, #8170f0)',
    errorRed: '#ef4444',
    successGreen: '#22c55e',
    warningYellow: '#eab308',
    neutralGray: '#6b7280',

    // Dashboard UI gradients and soft colors
    startupCardGradient: 'linear-gradient(135deg, rgba(239, 246, 255, 0.8), rgba(238, 242, 255, 0.8))',
    investorCardGradient: 'linear-gradient(135deg, rgba(240, 253, 244, 0.8), rgba(236, 253, 245, 0.8))',
    startupBgGradient: 'linear-gradient(135deg, rgba(62, 96, 233, 0.03), rgba(90, 66, 227, 0.05))',
    investorBgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.03), rgba(5, 150, 105, 0.05))',
    startupBorderColor: 'rgba(191, 219, 254, 0.5)',
    investorBorderColor: 'rgba(167, 243, 208, 0.5)',

    // Role-specific colors
    startup: {
        primary: '#3e60e9',
        secondary: '#5A42E3',
        light: '#EBF5FF',
        gradient: 'linear-gradient(135deg, #3e60e9, #5A42E3)',
        hoverGradient: 'linear-gradient(135deg, #3b5bd9, #5239d6)',
        border: 'rgba(191, 219, 254, 0.5)',
        background: 'rgba(239, 246, 255, 0.8)',
        logoText: 'StartupMatch',
        tagline: 'Connect with investors who share your vision'
    },
    investor: {
        primary: '#38a169', // Warmer, softer green
        secondary: '#2f855a',
        light: '#F0FFF4',
        gradient: 'linear-gradient(135deg, #38a169, #2f855a)',
        hoverGradient: 'linear-gradient(135deg, #319158, #276749)',
        border: 'rgba(154, 230, 180, 0.5)',
        background: 'rgba(240, 255, 244, 0.9)',
        logoText: 'InvestorMatch',
        tagline: 'Discover promising startups for your portfolio'
    },

    //logout
    red400: '#F87171',
    red500: '#EF4444',
    red50: '#FEF2F2',
    red600: '#DC2626',
    red100: '#FEE2E2',    // Legal Due Diligence - Elegant Slate theme with sophisticated grays and blues
    legalDD: {
        primary: '#334155', // Slate 700 - main brand color
        secondary: '#1e293b', // Slate 800 - darker for secondary elements  
        tertiary: '#64748b', // Slate 500 - medium for accents
        quaternary: '#94a3b8', // Slate 400 - lighter for subtle elements
        // Dark slate color shades
        dark: {
            primary: '#0f172a', // Slate 900 - very dark
            secondary: '#1e293b', // Slate 800 - dark
            tertiary: '#334155', // Slate 700 - medium dark
            charcoal: '#1a202c', // Custom charcoal
            slate: '#0f1419', // Custom deep slate
            midnight: '#0c1318', // Custom midnight
            obsidian: '#111827', // Gray 900
            shadow: '#030712', // Gray 950
        },        background: {
            primary: 'linear-gradient(135deg, rgba(51, 65, 85, 0.15), rgba(30, 41, 59, 0.12))', // Slate gradient
            secondary: 'rgba(248, 250, 252, 0.98)', // Very light slate tint
            card: 'linear-gradient(135deg, rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.92))',
            header: 'linear-gradient(to right, #1e293b, #0f172a)', // Your favorite gradient! (bg-gradient-to-r from-slate-800 to-slate-900)
            accent: 'linear-gradient(135deg, rgba(100, 116, 139, 0.2), rgba(148, 163, 184, 0.15))', // Medium slate accent
            // Additional gradients that complement your favorite
            footerStyle: 'linear-gradient(to right, #1e293b, #0f172a)', // Same as your favorite footer gradient
            alternateHeader: 'linear-gradient(to right, #334155, #1e293b)', // Slightly lighter variation
            darkAccent: 'linear-gradient(to right, #0f172a, #1e293b)', // Reversed version
            // Dark background variations
            darkPrimary: 'linear-gradient(135deg, #0f172a, #1e293b)', // Dark slate gradient
            darkSecondary: 'linear-gradient(135deg, #030712, #0f172a)', // Very dark slate
            darkCard: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.92))', // Dark card
            darkHeader: 'linear-gradient(to right, #0f172a, #030712)', // Dark header gradient (darker version of your favorite)
        },
        border: {
            light: 'rgba(51, 65, 85, 0.3)',
            medium: 'rgba(51, 65, 85, 0.4)',
            strong: 'rgba(30, 41, 59, 0.5)',
            accent: 'rgba(100, 116, 139, 0.4)',
        },
        text: {
            primary: '#1e293b', // Slate 800 for main text
            secondary: '#334155', // Slate 700 for secondary text
            accent: '#475569', // Slate 600 for accents
            muted: '#64748b', // Slate 500 for muted text
            white: '#FFFFFF', // White text for dark backgrounds
        },
        status: {
            success: '#10B981', // Bright green for success
            warning: '#F59E0B', // Amber for warnings
            error: '#EF4444', // Red for errors
            info: '#3B82F6', // Blue for info (complements slate nicely)
            pending: '#64748b', // Slate 500 for pending states
        },
        score: {
            excellent: 'linear-gradient(135deg, #10B981, #059669)', // Green gradient
            good: 'linear-gradient(135deg, #334155, #1e293b)', // Slate gradient
            fair: 'linear-gradient(135deg, #F59E0B, #D97706)', // Amber gradient
            poor: 'linear-gradient(135deg, #EF4444, #DC2626)', // Red gradient
        },
        hover: {
            primary: '#475569', // Slate 600 for hover
            secondary: '#334155', // Slate 700 for secondary hover
            background: 'rgba(51, 65, 85, 0.12)', card: 'rgba(100, 116, 139, 0.15)',
        },
        shadow: {
            sm: '0 1px 2px 0 rgba(51, 65, 85, 0.08)',
            md: '0 4px 6px -1px rgba(51, 65, 85, 0.15), 0 2px 4px -1px rgba(51, 65, 85, 0.08)',
            lg: '0 10px 15px -3px rgba(51, 65, 85, 0.15), 0 4px 6px -2px rgba(51, 65, 85, 0.08)', xl: '0 20px 25px -5px rgba(51, 65, 85, 0.15), 0 10px 10px -5px rgba(51, 65, 85, 0.06)',
        }
    },

};
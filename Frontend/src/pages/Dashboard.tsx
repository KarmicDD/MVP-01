import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiChevronDown, FiX, FiRefreshCw } from 'react-icons/fi';
import axios from 'axios';
import { colours } from '../utils/colours';
import ComingSoon from '../components/ComingSoon/ComingSoon';
import { useNavigate } from 'react-router-dom';
import CompatibilityBreakdown from '../components/Dashboard/MatchesPage/CompatibilityBreakdown';
import AIRecommendations from '../components/Dashboard/MatchesPage/AIRecomendations';
import renderMatchCards from '../components/Dashboard/MatchesPage/renderMarchCards';
import Header from '../components/Dashboard/MatchesPage/Header';
import { Match, UserProfile } from '../types/Dashboard.types';
import LoadingSpinner from '../components/Loading';
import api from '../services/api';
import BeliefSystemAnalytics from '../components/Dashboard/Analytics/BeliefSystemAnalytics';

const Dashboard: React.FC = () => {
    // State - keeping your existing state
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [industry, setIndustry] = useState<string>('');
    const [stage, setStage] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [activeTab, setActiveTab] = useState<string>('matches');
    const [bookmarkedMatches, setBookmarkedMatches] = useState<Set<string>>(new Set());
    const [compatibilityData, setCompatibilityData] = useState({
        breakdown: {
            missionAlignment: 0,
            investmentPhilosophy: 0,
            sectorFocus: 0,
            fundingStageAlignment: 0,
            valueAddMatch: 0,
        },
        overallScore: 0,
        insights: [] as string[]
    });
    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
    const [loadingCompatibility, setLoadingCompatibility] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const navigate = useNavigate();

    // Keep your existing constants and functions
    const API_URL = 'http://localhost:5000/api';
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('bookmarkedMatches');
        navigate('/login');
    };

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // Keep your existing function implementations
    const fetchCompatibilityData = async (matchId: string) => {
        // ...existing implementation...
        try {
            if (!userProfile) return;

            setLoadingCompatibility(true);
            setSelectedMatchId(matchId);

            // Determine the current user's role and the match ID
            let startupId, investorId;

            if (userProfile.role === 'startup') {
                startupId = userProfile.userId; // Current user is a startup
                investorId = matchId; // The match is an investor
            } else {
                investorId = userProfile.userId; // Current user is an investor
                startupId = matchId; // The match is a startup
            }

            // Use the correct endpoint format with path parameters
            const endpoint = `${API_URL}/score/compatibility/${startupId}/${investorId}`;

            // Make the API request
            const response = await api.get(endpoint, { headers });

            setCompatibilityData({
                breakdown: response.data.breakdown || {
                    missionAlignment: 75,
                    investmentPhilosophy: 82,
                    sectorFocus: 90,
                    fundingStageAlignment: 65,
                    valueAddMatch: 78,
                },
                overallScore: response.data.overallScore || 78,
                insights: response.data.insights || [
                    "Strong alignment in sector focus and vision",
                    "Investment philosophy matches your growth plans",
                    "Consider discussing funding timeline expectations",
                    "Potential for strategic mentorship beyond funding"
                ]
            });
            setLoadingCompatibility(false);
        } catch (err) {
            console.error('Error fetching compatibility data:', err);
            // Use fallback data if API fails
            setCompatibilityData({
                breakdown: {
                    missionAlignment: 75,
                    investmentPhilosophy: 82,
                    sectorFocus: 90,
                    fundingStageAlignment: 65,
                    valueAddMatch: 78,
                },
                overallScore: 78,
                insights: [
                    "Strong alignment in sector focus and vision",
                    "Investment philosophy matches your growth plans",
                    "Consider discussing funding timeline expectations",
                    "Potential for strategic mentorship beyond funding"
                ]
            });
            setLoadingCompatibility(false);
        }
    };

    // Fetch user profile and matches on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);

                // Get user profile
                const profileResponse = await axios.get(`${API_URL}/profile/user-type`, { headers });
                setUserProfile(profileResponse.data);

                // Get matches based on user role
                const matchEndpoint = profileResponse.data.role === 'startup'
                    ? `${API_URL}/matching/startup`
                    : `${API_URL}/matching/investor`;

                const matchesResponse = await axios.get(matchEndpoint, { headers });
                setMatches(matchesResponse.data.matches);

                // Load bookmarks from localStorage
                const savedBookmarks = localStorage.getItem('bookmarkedMatches');
                if (savedBookmarks) {
                    setBookmarkedMatches(new Set(JSON.parse(savedBookmarks)));
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load data. Please try again later.');
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Filter matches based on search query and filters
    const filteredMatches = matches.filter(match => {
        const matchesSearchQuery = searchQuery === '' ||
            (match.companyName && match.companyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (match.email && match.email.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesIndustry = industry === '' ||
            (match.industry && match.industry === industry) ||
            (match.industriesOfInterest && match.industriesOfInterest.includes(industry));

        const matchesStage = stage === '' ||
            (match.fundingStage && match.fundingStage === stage) ||
            (match.preferredStages && match.preferredStages.includes(stage));

        const matchesLocation = location === '' ||
            (match.location && match.location.includes(location));

        return matchesSearchQuery && matchesIndustry && matchesStage && matchesLocation;
    });

    // Toggle bookmark
    const toggleBookmark = (matchId: string) => {
        const newBookmarks = new Set(bookmarkedMatches);

        if (newBookmarks.has(matchId)) {
            newBookmarks.delete(matchId);
        } else {
            newBookmarks.add(matchId);
        }

        setBookmarkedMatches(newBookmarks);
        localStorage.setItem('bookmarkedMatches', JSON.stringify([...newBookmarks]));
    };

    const handleMatchCardClick = (matchId: string) => {
        fetchCompatibilityData(matchId);
    };

    // Connect with match
    const connectWithMatch = async (matchId: string) => {
        try {
            // This would normally send a connection request to the API
            // For now, we'll just show an alert
            alert(`Connection request sent to match ${matchId}`);
        } catch (err) {
            console.error('Error connecting with match:', err);
            setError('Failed to send connection request. Please try again later.');
        }
    };

    const clearFilters = () => {
        setIndustry('');
        setStage('');
        setLocation('');
        setSearchQuery('');
    };

    // Animation variants for framer-motion
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.3,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
    };

    // Render the component with improved UI
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Keep the Header component as is */}
            {userProfile && (
                <Header
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    handleLogout={handleLogout}
                    userProfile={userProfile}
                />
            )}

            {/* Main content with improved styling */}
            <main className="container mx-auto px-4 py-8">
                <AnimatePresence mode="wait">
                    {activeTab === 'matches' && (
                        <motion.div
                            key="matches"
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0 }}
                            variants={containerVariants}
                        >
                            {/* Search and filters with improved UI */}
                            <motion.div
                                className="mb-8"
                                variants={itemVariants}
                            >
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="relative flex-1">
                                            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                                            <input
                                                type="text"
                                                placeholder="Search matches..."
                                                className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                            {searchQuery && (
                                                <button
                                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    onClick={() => setSearchQuery('')}
                                                >
                                                    <FiX />
                                                </button>
                                            )}
                                        </div>

                                        <motion.button
                                            className="px-5 py-3.5 rounded-lg flex items-center justify-center font-medium text-white shadow-md"
                                            style={{ backgroundColor: colours.primaryBlue }}
                                            whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setFiltersOpen(!filtersOpen)}
                                        >
                                            <FiFilter className="mr-2" />
                                            {filtersOpen ? 'Hide Filters' : 'Show Filters'}
                                            <FiChevronDown className={`ml-2 transition-transform duration-300 ${filtersOpen ? 'rotate-180' : ''}`} />
                                        </motion.button>
                                    </div>

                                    {/* Expandable filters */}
                                    <AnimatePresence>
                                        {filtersOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">Industry</label>
                                                        <select
                                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            value={industry}
                                                            onChange={(e) => setIndustry(e.target.value)}
                                                        >
                                                            <option value="">All Industries</option>
                                                            <option value="fintech">FinTech</option>
                                                            <option value="healthtech">HealthTech</option>
                                                            <option value="edtech">EdTech</option>
                                                            <option value="cleantech">CleanTech</option>
                                                            <option value="saas">SaaS</option>
                                                        </select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">Funding Stage</label>
                                                        <select
                                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            value={stage}
                                                            onChange={(e) => setStage(e.target.value)}
                                                        >
                                                            <option value="">All Stages</option>
                                                            <option value="seed">Seed</option>
                                                            <option value="seriesA">Series A</option>
                                                            <option value="seriesB">Series B</option>
                                                            <option value="seriesC">Series C</option>
                                                        </select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">Location</label>
                                                        <select
                                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            value={location}
                                                            onChange={(e) => setLocation(e.target.value)}
                                                        >
                                                            <option value="">All Locations</option>
                                                            <option value="San Francisco">San Francisco</option>
                                                            <option value="New York">New York</option>
                                                            <option value="London">London</option>
                                                            <option value="Berlin">Berlin</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="mt-6 flex justify-end">
                                                    <motion.button
                                                        className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={clearFilters}
                                                    >
                                                        <FiRefreshCw className="mr-1" />
                                                        Clear Filters
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Filter summary */}
                                    <AnimatePresence>
                                        {(industry || stage || location) && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="mt-4 flex flex-wrap gap-2"
                                            >
                                                {industry && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        Industry: {industry}
                                                        <button onClick={() => setIndustry('')} className="ml-1 text-blue-500 hover:text-blue-700">
                                                            <FiX size={14} />
                                                        </button>
                                                    </span>
                                                )}
                                                {stage && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        Stage: {stage}
                                                        <button onClick={() => setStage('')} className="ml-1 text-purple-500 hover:text-purple-700">
                                                            <FiX size={14} />
                                                        </button>
                                                    </span>
                                                )}
                                                {location && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Location: {location}
                                                        <button onClick={() => setLocation('')} className="ml-1 text-green-500 hover:text-green-700">
                                                            <FiX size={14} />
                                                        </button>
                                                    </span>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>

                            {/* Match results counter */}
                            <motion.div
                                className="mb-4"
                                variants={itemVariants}
                            >
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {loading ? 'Loading matches...' : `${filteredMatches.length} matches found`}
                                    </h2>
                                </div>
                            </motion.div>

                            {/* Match cards - using your existing component */}
                            <motion.div
                                className="mb-12"
                                variants={itemVariants}
                            >
                                {renderMatchCards({
                                    loading,
                                    error,
                                    filteredMatches,
                                    bookmarkedMatches,
                                    userProfile,
                                    colours,
                                    connectWithMatch,
                                    toggleBookmark,
                                    onCardClick: handleMatchCardClick,
                                })}
                            </motion.div>

                            {/* Match analysis with improved UI */}
                            {selectedMatchId && (
                                <motion.section
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="bg-white rounded-xl shadow-lg p-6 mb-8"
                                >
                                    <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b border-gray-100 pb-3">Match Analysis</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {loadingCompatibility ? (
                                            <div className="col-span-2 flex justify-center py-12">
                                                <LoadingSpinner />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="bg-gray-50 rounded-lg p-5">
                                                    <CompatibilityBreakdown
                                                        breakdown={compatibilityData.breakdown}
                                                        overallScore={compatibilityData.overallScore}
                                                        insights={compatibilityData.insights}
                                                    />
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-5">
                                                    <AIRecommendations />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </motion.section>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'analytics' && (
                        <motion.div
                            key="analytics"
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0 }}
                            variants={containerVariants}
                            className="mt-6"
                        >
                            <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-lg p-6 mb-8">
                                <h2 className="text-2xl font-bold mb-6 text-gray-800">Analytics & Insights</h2>

                                {/* Analytics tabs with improved UI */}
                                <div className="mb-8">
                                    <nav className="flex space-x-1 overflow-x-auto scrollbar-hide">
                                        {['Belief System Analysis', 'Performance Metrics', 'Match Trends'].map((tab, index) => (
                                            <motion.button
                                                key={tab}
                                                className={`px-4 py-3 font-medium text-sm transition-all rounded-lg ${index === 0
                                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                    : 'text-gray-600 hover:bg-gray-50'
                                                    }`}
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                {tab}
                                            </motion.button>
                                        ))}
                                    </nav>
                                </div>

                                {/* Match selection notice */}
                                <motion.div
                                    variants={itemVariants}
                                    className="bg-blue-50 border border-blue-100 rounded-lg p-5 mb-8"
                                >
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <svg className="h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-md font-medium text-blue-800">Analysis Instructions</h3>
                                            <div className="mt-2 text-sm text-blue-700">
                                                <p>Select a match from the Matches tab to view belief system analysis and compatibility insights.</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Belief System Analytics - keeping your existing component */}
                                <motion.div variants={itemVariants}>
                                    {userProfile && (
                                        <BeliefSystemAnalytics
                                            userProfile={{
                                                ...userProfile,
                                                role: userProfile.role as "startup" | "investor"
                                            }}
                                            selectedMatchId={selectedMatchId}
                                        />
                                    )}
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    )}

                    {activeTab !== 'matches' && activeTab !== 'analytics' && (
                        <motion.div
                            key="coming-soon"
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0 }}
                            variants={containerVariants}
                            className="mt-8"
                        >
                            <ComingSoon
                                title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Coming Soon!`}
                                subtitle="We're working hard to bring you this feature."
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Dashboard;
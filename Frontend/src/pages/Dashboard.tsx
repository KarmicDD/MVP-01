import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiChevronDown, FiX, FiRefreshCw, FiArrowUp, FiArrowDown } from 'react-icons/fi';
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
import {
    searchStartups,
    searchInvestors,
    getFilterOptions,
    type SearchOptions,
    type FilterOptions,
    type SearchResults,
    PaginationType
} from '../services/searchServices';
import BeliefSystemAnalytics from '../components/Dashboard/Analytics/BeliefSystemAnalytics';
import Pagination from '../components/Dashboard/MatchesPage/Pagination';

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
    const [, setCompatibilityError] = useState<string | null>(null);
    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
    const [loadingCompatibility, setLoadingCompatibility] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);
    // Add these states to your component
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        industries: [],
        fundingStages: [],
        employeeOptions: [],
        ticketSizes: [],
        investmentCriteria: [],
        investmentRegions: [],
        revenueRanges: []
    });
    const [pagination, setPagination] = useState<PaginationType | null>(null);
    const [, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('matchScore');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const navigate = useNavigate();

    // Keep your existing constants and functions
    const API_URL = 'https://mvp-01.onrender.com/api';
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

    const fetchMatches = async (page = 1) => {
        if (!userProfile) return;

        try {
            setLoading(true);
            setError(null);

            // Build search options from current state
            const searchOptions: SearchOptions = {
                page,
                limit: 10,
                sortBy,
                sortOrder
            };

            // Add filters if they're set
            if (industry) searchOptions.industry = industry;
            if (stage) searchOptions.fundingStage = stage;
            if (location) searchOptions.location = location;
            if (searchQuery) searchOptions.keywords = searchQuery;

            console.log(`Fetching matches with sort: ${sortBy} (${sortOrder})`);
            console.log('Search options:', searchOptions);

            // Call the appropriate search function
            let results: SearchResults;

            if (userProfile.role === 'startup') {
                results = await searchInvestors(searchOptions);
                setMatches(results.investors || []);
            } else {
                results = await searchStartups(searchOptions);
                setMatches(results.startups || []);
            }

            // Set pagination data
            setPagination(results.pagination);
            setCurrentPage(results.pagination.page);

            setLoading(false);
        } catch (err) {
            console.error('Error searching matches:', err);
            // Don't set error for display, just log it
            setLoading(false);
        }
    };

    const fetchCompatibilityData = async (matchId: string) => {
        try {
            if (!userProfile) return;

            // Validate matchId to ensure it's a proper ID
            if (!matchId || matchId.startsWith('match-')) {
                console.error('Invalid match ID:', matchId);
                setCompatibilityError(`Cannot load compatibility data. Invalid match ID.`);
                return;
            }

            setLoadingCompatibility(true);
            setCompatibilityError(null); // Clear previous errors
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

            console.log(`Fetching compatibility data for startup=${startupId} and investor=${investorId}`);

            // Use the correct endpoint format with path parameters
            const endpoint = `${API_URL}/score/compatibility/${startupId}/${investorId}`;

            // Make the API request
            const response = await api.get(endpoint, { headers });
            console.log('Compatibility data received:', response.data);

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

            // Set compatibility error instead of general error
            if (axios.isAxiosError(err) && err.response && err.response.status === 404) {
                setCompatibilityError("Compatibility data not found. Both profiles must have completed questionnaires.");
            } else {
                setCompatibilityError("Failed to load compatibility data. Please try again later.");
            }

            // Reset loading state
            setLoadingCompatibility(false);

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
        }
    };

    // Fetch user profile and matches on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Get user profile
                const profileResponse = await axios.get(`${API_URL}/profile/user-type`, { headers });
                setUserProfile(profileResponse.data);

                // Load filter options for search dropdowns
                const options = await getFilterOptions();
                setFilterOptions(options);

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

        fetchData();
    }, []);

    // Fetch matches when user profile is available
    useEffect(() => {
        if (userProfile) {
            // Set default sort to match score descending
            setSortBy('matchScore');
            setSortOrder('desc');
            fetchMatches(1);
        }
    }, [userProfile]);

    const handlePageChange = (page: number) => {
        fetchMatches(page);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchMatches(1); // Reset to first page when searching
    };

    const handleFilterChange = (name: string, value: string) => {
        switch (name) {
            case 'industry':
                setIndustry(value);
                break;
            case 'fundingStage':
                setStage(value);
                break;
            case 'location':
                setLocation(value);
                break;
            // Add more cases as needed
        }

        // Don't fetch immediately to avoid too many requests
        // User can apply filters with a button click
    };

    // const applyFilters = () => {
    //     fetchMatches(1); // Reset to page 1 when applying filters
    // };

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

    const handleSortChange = (newSortBy: string) => {
        // If clicking the same field, toggle order
        if (newSortBy === sortBy) {
            const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            console.log(`Toggling sort order for ${sortBy}: ${sortOrder} → ${newOrder}`);
            setSortOrder(newOrder);
        } else {
            // If choosing a new field, default to descending (highest values first)
            console.log(`Changing sort from ${sortBy} to ${newSortBy}, order: desc`);
            setSortBy(newSortBy);
            setSortOrder('desc');
        }

        // Fetch with new sort settings next time (after state updates)
        setTimeout(() => fetchMatches(1), 0);
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
                                        <form onSubmit={handleSearchSubmit} className="relative flex-1">
                                            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                                            <input
                                                type="text"
                                                placeholder="Search matches..."
                                                className="w-full pl-12 pr-12 py-3.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                            {searchQuery && (
                                                <button
                                                    type="button"
                                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    onClick={() => {
                                                        setSearchQuery('');
                                                        // Optionally fetch without the search term
                                                        fetchMatches(1);
                                                    }}
                                                >
                                                    <FiX />
                                                </button>
                                            )}
                                            <button type="submit" className="hidden">Search</button>
                                        </form>

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
                                                            onChange={(e) => handleFilterChange('industry', e.target.value)}
                                                        >
                                                            <option value="">All Industries</option>
                                                            {filterOptions.industries.map(ind => (
                                                                <option key={ind} value={ind}>{ind}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700">Funding Stage</label>
                                                        <select
                                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            value={stage}
                                                            onChange={(e) => handleFilterChange('fundingStage', e.target.value)}
                                                        >
                                                            <option value="">All Stages</option>
                                                            {filterOptions.fundingStages.map(stage => (
                                                                <option key={stage} value={stage}>{stage}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="space-y-2">
                                                            <label className="block text-sm font-medium text-gray-700">Location</label>
                                                            <select
                                                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                value={location}
                                                                onChange={(e) => setLocation(e.target.value)}
                                                            >
                                                                <option value="">All Locations</option>
                                                                {filterOptions.investmentRegions && filterOptions.investmentRegions.map(loc => (
                                                                    <option key={loc} value={loc}>{loc}</option>
                                                                ))}
                                                            </select>
                                                        </div>
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

                            {/* Match results counter with sort controls */}
                            <motion.div
                                className="mb-4"
                                variants={itemVariants}
                            >
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {loading ? 'Loading matches...' : `${filteredMatches.length} matches found`}
                                    </h2>

                                    {/* Add simple sort controls */}
                                    {!loading && filteredMatches.length > 0 && (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-600">Sort by:</span>
                                            <select
                                                value={sortBy}
                                                onChange={(e) => handleSortChange(e.target.value)}
                                                className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="matchScore">Match Score</option>
                                                <option value="companyName">Name</option>
                                                <option value="location">Location</option>
                                                {userProfile?.role === 'startup' ? (
                                                    <>
                                                        <option value="ticketSize">Investment Size</option>
                                                        <option value="portfolioSize">Portfolio Size</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="fundingStage">Funding Stage</option>
                                                        <option value="industry">Industry</option>
                                                    </>
                                                )}
                                            </select>
                                            <button
                                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                                className={`p-1.5 rounded-md ${sortOrder === 'desc' ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'
                                                    } hover:bg-gray-100`}
                                                title={sortOrder === 'asc' ? "Sort Ascending (A to Z, Low to High)" : "Sort Descending (Z to A, High to Low)"}
                                            >
                                                {sortOrder === 'asc' ? (
                                                    <FiArrowUp className={`text-${sortOrder === 'asc' ? 'blue' : 'gray'}-600`} />
                                                ) : (
                                                    <FiArrowDown className={`text-${sortOrder === 'desc' ? 'blue' : 'gray'}-600`} />
                                                )}
                                            </button>
                                        </div>
                                    )}
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
                                    connectWithMatch,
                                    toggleBookmark,
                                    onCardClick: handleMatchCardClick,
                                })}
                            </motion.div>

                            {pagination && (
                                <Pagination
                                    currentPage={pagination.page}
                                    totalPages={pagination.pages}
                                    onPageChange={handlePageChange}
                                />
                            )}

                            {/* Match analysis with improved UI */}
                            {selectedMatchId && (
                                <motion.section
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="bg-white rounded-xl shadow-lg p-6 mb-8"
                                >
                                    <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b border-gray-100 pb-3">Match Analysis</h2>

                                    {/* Remove error display and always show compatibility data */}
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
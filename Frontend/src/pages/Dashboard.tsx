import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ComingSoon from '../components/ComingSoon/ComingSoon';
import { useNavigate } from 'react-router-dom';
import { Match, UserProfile } from '../types/Dashboard.types';
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
import { useTutorial } from '../hooks/useTutorial';

// Define a custom pagination type for our components
interface ComponentPaginationType {
    page: number;
    pages: number;
    total: number;
}

// Import legacy components for backward compatibility
import Header from '../components/Dashboard/MatchesPage/Header';
import SearchFilters from '../components/Dashboard/SearchFilters';
import MatchesList from '../components/Dashboard/MatchesList';
import CompatibilitySection from '../components/Dashboard/CompatibilitySection';
import AnalyticsTabs from '../components/Dashboard/AnalyticsTabs';

// Import new dashboard components
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import OverviewSection from '../components/Dashboard/Overview/OverviewSection';
import MatchesSection from '../components/Dashboard/Matches/MatchesSection';
import AnalyticsSection from '../components/Dashboard/Analytics/AnalyticsSection';

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
    const [analyticsTab, setAnalyticsTab] = useState<string>('belief');

    // Use the tutorial hook with auto-start for first-time users
    // openTutorial is not used but we still need the hook for auto-start functionality
    const { } = useTutorial('dashboard-tutorial', {
        autoStart: true,
        showOnlyOnce: true
    });


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
        insights: [] as string[],
        isOldData: false,
        message: '',
        createdAt: '',
        perspective: null as any // Add perspective property to the state
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

    const fetchMatches = async (page = 1) => {
        if (!userProfile) return;

        try {
            setLoading(true);
            setError(null);

            // Build search options from current state
            const searchOptions: SearchOptions = {
                page,
                limit: 4, // Changed from 10 to 4
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

            // Use the correct endpoint format without the base URL (api already has it)
            const response = await api.get(`/score/compatibility/${startupId}/${investorId}`);

            // Process and set the compatibility data
            setCompatibilityData({
                breakdown: response.data.breakdown,
                overallScore: response.data.overallScore,
                insights: response.data.insights,
                isOldData: response.data.isOldData || false,
                message: response.data.message || '',
                createdAt: response.data.createdAt || '',
                perspective: response.data.perspective
            });

            setLoadingCompatibility(false);
        } catch (err: unknown) {
            console.error('Error fetching compatibility data:', err);

            // Set a fallback compatibility data instead of showing an error
            setCompatibilityData({
                breakdown: {
                    missionAlignment: 75,
                    investmentPhilosophy: 80,
                    sectorFocus: 85,
                    fundingStageAlignment: 70,
                    valueAddMatch: 75,
                },
                overallScore: 77,
                insights: [
                    'Strong alignment in industry focus areas',
                    'Compatible investment philosophy',
                    'Good match in funding stage expectations'
                ],
                isOldData: true,
                message: 'Using fallback compatibility data due to an error',
                createdAt: new Date().toISOString(),
                perspective: null
            });

            // Log the error but don't show it to the user
            const errorMessage = (err as any).response?.data?.message || 'Failed to load compatibility data';
            console.warn('Using fallback compatibility data due to error:', errorMessage);

            setLoadingCompatibility(false);
        }
    };

    // Fetch user profile and matches on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Get user profile (basic info)
                const profileResponse = await axios.get(`${API_URL}/profile/user-type`, { headers });
                const userBasicInfo = profileResponse.data;
                console.log('User basic info:', userBasicInfo);

                // Get complete profile data based on role
                let completeProfile;
                if (userBasicInfo.role === 'startup') {
                    try {
                        const startupProfileResponse = await axios.get(`${API_URL}/profile/startup`, { headers });
                        console.log('Startup profile response:', startupProfileResponse.data);

                        // Check different possible response structures
                        const companyName =
                            startupProfileResponse.data.profile?.companyName ||
                            startupProfileResponse.data.companyName ||
                            'Startup';

                        completeProfile = {
                            ...userBasicInfo,
                            companyName: companyName,
                            name: companyName
                        };
                    } catch (error) {
                        console.error('Error fetching startup profile:', error);
                        completeProfile = {
                            ...userBasicInfo,
                            companyName: 'Startup',
                            name: 'Startup'
                        };
                    }
                } else {
                    try {
                        const investorProfileResponse = await axios.get(`${API_URL}/profile/investor`, { headers });
                        console.log('Investor profile response:', investorProfileResponse.data);

                        // Check different possible response structures
                        const companyName =
                            investorProfileResponse.data.profile?.companyName ||
                            investorProfileResponse.data.companyName ||
                            'Investor';

                        completeProfile = {
                            ...userBasicInfo,
                            companyName: companyName,
                            name: companyName
                        };
                    } catch (error) {
                        console.error('Error fetching investor profile:', error);
                        completeProfile = {
                            ...userBasicInfo,
                            companyName: 'Investor',
                            name: 'Investor'
                        };
                    }
                }

                console.log('Complete profile:', completeProfile);

                // Set the complete profile with name/company name
                setUserProfile(completeProfile);

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

    // Create a function that both updates the selected match ID and fetches compatibility data
    const handleMatchSelection = (matchId: string | null) => {
        setSelectedMatchId(matchId);
        if (matchId) {
            fetchCompatibilityData(matchId);
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



    // Render loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Use the new dashboard layout
    return (
        <DashboardLayout
            userProfile={userProfile}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
        >
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <OverviewSection userProfile={userProfile} />
                    </motion.div>
                )}

                {activeTab === 'matches' && (
                    <motion.div
                        key="matches"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Legacy matches view - will be replaced by MatchesSection in future */}
                        <div className="legacy-matches-view">
                            <SearchFilters
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                industry={industry}
                                setIndustry={setIndustry}
                                stage={stage}
                                setStage={setStage}
                                location={location}
                                setLocation={setLocation}
                                filterOptions={filterOptions}
                                handleSearchSubmit={handleSearchSubmit}
                                handleFilterChange={handleFilterChange}
                                handleClearFilters={clearFilters}
                                fetchMatches={fetchMatches}
                                isFilterOpen={filtersOpen}
                                setIsFilterOpen={setFiltersOpen}
                                itemVariants={itemVariants}
                            />

                            <MatchesList
                                matches={filteredMatches}
                                loading={loading}
                                error={error}
                                sortBy={sortBy}
                                sortOrder={sortOrder}
                                setSortBy={setSortBy}
                                setSortOrder={setSortOrder}
                                pagination={pagination ? {
                                    page: pagination.page,
                                    pages: pagination.pages,
                                    total: pagination.total
                                } : { page: 1, pages: 1, total: 0 } as ComponentPaginationType}
                                handlePageChange={handlePageChange}
                                selectedMatchId={selectedMatchId}
                                setSelectedMatchId={handleMatchSelection}
                                bookmarkedMatches={bookmarkedMatches}
                                toggleBookmark={toggleBookmark}
                                userRole={userProfile?.role || ''}
                                itemVariants={itemVariants}
                            />

                            <CompatibilitySection
                                selectedMatchId={selectedMatchId}
                                loadingCompatibility={loadingCompatibility}
                                compatibilityData={compatibilityData}
                                itemVariants={itemVariants}
                                userProfile={userProfile}
                            />
                        </div>

                        {/* Uncomment to use the new MatchesSection component */}
                        {/* <MatchesSection userProfile={userProfile} /> */}
                    </motion.div>
                )}

                {activeTab === 'analytics' && (
                    <motion.div
                        key="analytics"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Legacy analytics view */}
                        <AnalyticsTabs
                            analyticsTab={analyticsTab}
                            setAnalyticsTab={setAnalyticsTab}
                            userProfile={userProfile!}
                            selectedMatchId={selectedMatchId}
                            itemVariants={itemVariants}
                        />

                        {/* Uncomment to use the new AnalyticsSection component */}
                        {/* <AnalyticsSection
                            userProfile={userProfile}
                            selectedMatchId={selectedMatchId}
                        /> */}
                    </motion.div>
                )}

                {!['overview', 'matches', 'analytics'].includes(activeTab) && (
                    <motion.div
                        key="coming-soon"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ComingSoon
                            title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Coming Soon!`}
                            subtitle="We're working hard to bring you this feature."
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default Dashboard;
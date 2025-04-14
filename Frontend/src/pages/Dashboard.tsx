import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ComingSoon from '../components/ComingSoon/ComingSoon';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Dashboard/MatchesPage/Header';
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
// import TutorialButton from '../components/Tutorial/TutorialButton'; // Imported but not used


// Define a custom pagination type for our components
interface ComponentPaginationType {
    page: number;
    pages: number;
    total: number;
}

// Import new modular components
import SearchFilters from '../components/Dashboard/SearchFilters';
import MatchesList from '../components/Dashboard/MatchesList';
import CompatibilitySection from '../components/Dashboard/CompatibilitySection';
import AnalyticsTabs from '../components/Dashboard/AnalyticsTabs';

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

            // Use the correct endpoint format with the full API path
            const response = await api.get(`${API_URL}/score/compatibility/${startupId}/${investorId}`);

            // Process and set the compatibility data
            setCompatibilityData({
                breakdown: response.data.breakdown,
                overallScore: response.data.overallScore,
                insights: response.data.insights,
                perspective: response.data.perspective
            });

            setLoadingCompatibility(false);
        } catch (err: unknown) {
            console.error('Error fetching compatibility data:', err);
            setCompatibilityError(
                (err as any).response?.data?.message || 'Failed to load compatibility data. Please try again.'
            );
            setLoadingCompatibility(false);
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
                            />
                        </motion.div>
                    )}

                    {activeTab === 'analytics' && (
                        <AnalyticsTabs
                            analyticsTab={analyticsTab}
                            setAnalyticsTab={setAnalyticsTab}
                            userProfile={userProfile!}
                            selectedMatchId={selectedMatchId}
                            itemVariants={itemVariants}
                        />
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
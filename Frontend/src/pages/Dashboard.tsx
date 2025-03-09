// ./src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, } from 'react-icons/fi';
import axios from 'axios';
import { colours } from '../utils/colours';
import ComingSoon from '../components/ComingSoon/ComingSoon';
import { useNavigate } from 'react-router-dom';
import CompatibilityBreakdown from '../components/Dashboard/MatchesPage/CompatibilityBreakdown';
import AIRecommendations from '../components/Dashboard/MatchesPage/AIRecomendations';
import renderMatchCards from '../components/Dashboard/MatchesPage/renderMarchCards';
import Header from '../components/Dashboard/MatchesPage/Header'; // Import the new Header component
import { Match, UserProfile } from '../types/Dashboard.types';
import LoadingSpinner from '../components/Loading';
import api from '../services/api';
import BeliefSystemAnalytics from '../components/Dashboard/Analytics/BeliefSystemAnalytics';

const Dashboard: React.FC = () => {
    // State
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


    const navigate = useNavigate();

    // Constants
    const API_URL = 'http://localhost:5000/api';
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('bookmarkedMatches');

        // Redirect to login page
        navigate('/login');
    };

    // API headers
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const fetchCompatibilityData = async (matchId: string) => {
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
    },);

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

    // Render the component
    return (
        <div className="min-h-screen" style={{ backgroundColor: colours.formBackground }}>
            {/* Use the new Header component */}
            {userProfile && (
                <Header
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    handleLogout={handleLogout}
                    userProfile={userProfile}
                />
            )}

            {/* Main content */}
            <main className="container mx-auto px-4 py-8">
                {activeTab === 'matches' && (
                    <>
                        {/* Search and filters */}
                        <div className="mb-8">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search matches..."
                                        className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    <select
                                        className="px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={industry}
                                        onChange={(e) => setIndustry(e.target.value)}
                                    >
                                        <option value="">Industry</option>
                                        <option value="fintech">FinTech</option>
                                        <option value="healthtech">HealthTech</option>
                                        <option value="edtech">EdTech</option>
                                        <option value="cleantech">CleanTech</option>
                                        <option value="saas">SaaS</option>
                                    </select>

                                    <select
                                        className="px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={stage}
                                        onChange={(e) => setStage(e.target.value)}
                                    >
                                        <option value="">Stage</option>
                                        <option value="seed">Seed</option>
                                        <option value="seriesA">Series A</option>
                                        <option value="seriesB">Series B</option>
                                        <option value="seriesC">Series C</option>
                                    </select>

                                    <select
                                        className="px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    >
                                        <option value="">Location</option>
                                        <option value="San Francisco">San Francisco</option>
                                        <option value="New York">New York</option>
                                        <option value="London">London</option>
                                        <option value="Berlin">Berlin</option>
                                    </select>

                                    <motion.button
                                        className="px-4 py-3 rounded-md flex items-center font-medium text-white"
                                        style={{ backgroundColor: colours.primaryBlue }}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <FiFilter className="mr-2" />
                                        More Filters
                                    </motion.button>
                                </div>
                            </div>
                        </div>

                        {/* Match cards */}
                        <div className="mb-12">
                            {renderMatchCards({
                                loading,
                                error,
                                filteredMatches,
                                bookmarkedMatches,
                                userProfile,
                                colours,
                                connectWithMatch,
                                toggleBookmark,
                                onCardClick: handleMatchCardClick, // Add this new prop
                            })}
                        </div>

                        {/* Match analysis */}
                        {selectedMatchId && (
                            <section>
                                <h2 className="text-2xl font-bold mb-6">Match Analysis</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {loadingCompatibility ? (
                                        <LoadingSpinner />
                                    ) : (
                                        <CompatibilityBreakdown
                                            breakdown={compatibilityData.breakdown}
                                            overallScore={compatibilityData.overallScore}
                                            insights={compatibilityData.insights}
                                        />
                                    )}
                                    <AIRecommendations />
                                </div>
                            </section>
                        )}
                    </>
                )}

                {activeTab === 'analytics' && (
                    <div className="mt-6">
                        <h2 className="text-2xl font-bold mb-6">Analytics & Insights</h2>

                        {/* Tabs for different analytics */}
                        <div className="mb-6">
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex space-x-8">
                                    <button className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                                        Belief System Analysis
                                    </button>
                                    <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                                        Performance Metrics
                                    </button>
                                    <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                                        Match Trends
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Match selection for analytics */}
                        <div className="mb-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-800">Analysis Instructions</h3>
                                        <div className="mt-2 text-sm text-blue-700">
                                            <p>Select a match from the Matches tab to view belief system analysis and compatibility insights.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Belief System Analytics */}
                            {userProfile && (
                                <BeliefSystemAnalytics
                                    userProfile={{
                                        ...userProfile,
                                        role: userProfile.role as "startup" | "investor"
                                    }}
                                    selectedMatchId={selectedMatchId}
                                />
                            )}
                        </div>
                    </div>
                )}

                {activeTab !== 'matches' && activeTab !== 'analytics' && (
                    <div className="mt-8">
                        <ComingSoon
                            title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Coming Soon!`}
                            subtitle="We're working hard to bring you this feature."
                        />
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
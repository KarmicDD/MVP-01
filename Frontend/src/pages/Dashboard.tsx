import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiMapPin, FiBriefcase, FiDollarSign, FiBookmark, FiUsers, FiTarget, FiLogOut } from 'react-icons/fi';
import axios from 'axios';
import { colours } from '../utils/colours';
import { BsFillLightbulbFill } from 'react-icons/bs';
import { Logo } from '../components/Auth/Logo';
import ComingSoon from '../components/ComingSoon/ComingSoon';
import { useNavigate } from 'react-router-dom';

// Types
interface Match {
    investorId?: string;
    startupId?: string;
    email: string;
    matchScore: number;
    companyName?: string;
    industriesOfInterest?: string[];
    preferredStages?: string[];
    ticketSize?: string;
    industry?: string;
    fundingStage?: string;
    location?: string;
}

interface UserProfile {
    userId: string;
    email: string;
    role: string;
}

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

    // Compatibility breakdown component
    const CompatibilityBreakdown = () => {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Compatibility Breakdown</h3>

                <div className="mb-4">
                    <div className="flex justify-between mb-1">
                        <span>Mission Alignment</span>
                        <span>95%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                            className="h-2 rounded-full"
                            style={{ backgroundColor: colours.primaryBlue, width: '95%' }}
                            initial={{ width: 0 }}
                            animate={{ width: '95%' }}
                            transition={{ duration: 0.8 }}
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between mb-1">
                        <span>Investment Philosophy</span>
                        <span>88%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                            className="h-2 rounded-full"
                            style={{ backgroundColor: colours.primaryBlue, width: '88%' }}
                            initial={{ width: 0 }}
                            animate={{ width: '88%' }}
                            transition={{ duration: 0.8 }}
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between mb-1">
                        <span>Sector Focus</span>
                        <span>92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                            className="h-2 rounded-full"
                            style={{ backgroundColor: colours.primaryBlue, width: '92%' }}
                            initial={{ width: 0 }}
                            animate={{ width: '92%' }}
                            transition={{ duration: 0.8 }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    // AI Recommendations component
    const AIRecommendations = () => {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>

                <div className="mb-4">
                    <div className="flex items-start mb-3">
                        <BsFillLightbulbFill className="text-blue-500 mt-1 mr-2" />
                        <p>Strong alignment in AI and machine learning focus areas</p>
                    </div>

                    <div className="flex items-start mb-3">
                        <FiTarget className="text-blue-500 mt-1 mr-2" />
                        <p>Growth trajectory matches investor's portfolio preferences</p>
                    </div>

                    <div className="flex items-start mb-3">
                        <FiUsers className="text-blue-500 mt-1 mr-2" />
                        <p>Team composition indicates strong execution capability</p>
                    </div>
                </div>
            </div>
        );
    };

    // Main content - match cards
    const renderMatchCards = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: colours.primaryBlue }} />
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex justify-center items-center h-64">
                    <p className="text-red-500">{error}</p>
                </div>
            );
        }

        if (filteredMatches.length === 0) {
            return (
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500">No matches found. Try adjusting your filters.</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMatches.map((match, index) => {
                    const matchId = match.investorId || match.startupId || `match-${index}`;
                    const isBookmarked = bookmarkedMatches.has(matchId);

                    return (
                        <motion.div
                            key={matchId}
                            className="bg-white rounded-lg shadow-sm overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-lg" style={{ backgroundColor: colours.primaryBlue }}>
                                            {(match.companyName || match.email || 'User').charAt(0)}
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-lg font-semibold">
                                                {match.companyName || match.email.split('@')[0]}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {userProfile?.role === 'startup'
                                                    ? (match.ticketSize && `${match.ticketSize} Investment Fund`)
                                                    : (match.industry && `${match.industry} Company`)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-bold text-xl" style={{ color: colours.primaryBlue }}>
                                            {match.matchScore}%
                                        </span>
                                        <span className="text-sm text-gray-500 ml-1">match</span>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center">
                                        <FiDollarSign className="text-gray-500 mr-2" />
                                        <span className="text-sm">
                                            {userProfile?.role === 'startup'
                                                ? match.ticketSize
                                                : `Funding ${match.fundingStage}`}
                                        </span>
                                    </div>

                                    <div className="flex items-center">
                                        <FiMapPin className="text-gray-500 mr-2" />
                                        <span className="text-sm">{match.location || 'Location not specified'}</span>
                                    </div>

                                    <div className="flex items-center">
                                        <FiBriefcase className="text-gray-500 mr-2" />
                                        <span className="text-sm">
                                            {userProfile?.role === 'startup'
                                                ? (match.industriesOfInterest && match.industriesOfInterest.join(', '))
                                                : match.industry}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <motion.button
                                        className="flex-1 py-2 px-4 rounded-md text-white font-medium"
                                        style={{ backgroundColor: colours.primaryBlue }}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => connectWithMatch(matchId)}
                                    >
                                        Connect
                                    </motion.button>

                                    <motion.button
                                        className="p-2 rounded-md border border-gray-300"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => toggleBookmark(matchId)}
                                    >
                                        <FiBookmark
                                            className={isBookmarked ? "text-yellow-500" : "text-gray-400"}
                                            fill={isBookmarked ? "#EAB308" : "none"}
                                        />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        );
    };

    // Render the component
    return (
        <div className="min-h-screen" style={{ backgroundColor: colours.formBackground }}>
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <Logo Title="StartupMatch" />
                    </div>

                    <nav className="hidden md:flex space-x-8">
                        <button
                            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'matches' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                            onClick={() => setActiveTab('matches')}
                        >
                            Matches
                        </button>
                        <button
                            className="px-4 py-2 font-medium text-gray-400 cursor-not-allowed"
                            onClick={() => setActiveTab('analytics')}
                        >
                            Analytics
                        </button>
                        <button
                            className="px-4 py-2 font-medium text-gray-400 cursor-not-allowed"
                            onClick={() => setActiveTab('messages')}
                        >
                            Messages
                        </button>
                        <button
                            className="px-4 py-2 font-medium text-gray-400 cursor-not-allowed"
                            onClick={() => setActiveTab('calendar')}
                        >
                            Calendar
                        </button>
                    </nav>

                    <div className="flex items-center space-x-4">
                        <motion.button
                            className="flex items-center px-3 py-2 text-gray-600 hover:text-red-600 transition-colors rounded-md border border-gray-300 hover:border-red-300"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleLogout}
                        >
                            <FiLogOut className="mr-2" />
                            <span className="hidden sm:inline">Logout</span>
                        </motion.button>

                        <div className="flex items-center justify-center w-10 h-10 rounded-full text-white font-bold" style={{ backgroundColor: colours.primaryBlue }}>
                            {userProfile?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>
                </div>
            </header>


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
                            {renderMatchCards()}
                        </div>

                        {/* Match analysis */}
                        {filteredMatches.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold mb-6">Match Analysis</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <CompatibilityBreakdown />
                                    <AIRecommendations />
                                </div>
                            </section>
                        )}
                    </>
                )}

                {activeTab !== 'matches' && (
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
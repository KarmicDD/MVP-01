import React from 'react';
import { motion } from 'framer-motion';
import { FiBookmark, FiMessageSquare, FiArrowRight } from 'react-icons/fi';
import LoadingSpinner from '../../Loading';
import { Match, UserProfile } from '../../../types/Dashboard.types';
import { colours } from '../../../utils/colours';

interface RenderMatchCardsProps {
    loading: boolean;
    error: string | null;
    filteredMatches: Match[];
    bookmarkedMatches: Set<string>;
    userProfile: UserProfile | null;
    connectWithMatch: (matchId: string) => void;
    toggleBookmark: (matchId: string) => void;
    onCardClick: (matchId: string) => void;
}

// Helper function to truncate text with a "Read More" option
const TruncatedText = ({ text, maxLength = 150 }: { text: string, maxLength?: number }) => {
    const [expanded, setExpanded] = React.useState(false);

    if (!text || text.length <= maxLength) return <p className="text-gray-600">{text}</p>;

    return (
        <>
            <p className="text-gray-600">
                {expanded ? text : `${text.substring(0, maxLength)}...`}
            </p>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1"
            >
                {expanded ? 'Show less' : 'Read more'}
            </button>
        </>
    );
};

// Function to render match score with color coding
const MatchScoreIndicator = ({ score, categories }: {
    score: number,
    categories?: Record<string, number | undefined>
}) => {
    // Determine color based on score
    const getScoreColor = (score: number) => {
        if (score >= 70) return 'bg-green-500';
        if (score >= 40) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="flex flex-col">
            <div className="flex items-center mb-2">
                <div className={`w-12 h-12 rounded-full ${getScoreColor(score)} flex items-center justify-center text-white font-bold text-lg`}>
                    {score}%
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">Match Score</span>
            </div>

            {categories && (
                <div className="space-y-1 mt-1">
                    {Object.entries(categories).map(([category, value]) => {
                        // Skip rendering categories with undefined values
                        if (value === undefined) return null;

                        return (
                            <div key={category} className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">{category}</span>
                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${getScoreColor(value)}`}
                                        style={{ width: `${value}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Main function to render match cards
const renderMatchCards = ({
    loading,
    error,
    filteredMatches,
    bookmarkedMatches,
    userProfile,
    connectWithMatch,
    toggleBookmark,
    onCardClick,
}: RenderMatchCardsProps) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    if (filteredMatches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No matches found</h3>
                <p className="text-gray-600 text-center max-w-md">
                    We couldn't find any matches based on your current filters.
                    Try adjusting your search criteria or clearing filters to see more results.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6">
            {filteredMatches.map((match) => (
                <motion.div
                    key={match.id || match._id}
                    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                    onClick={() => onCardClick(match.id || match._id || '')}
                >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Left side - Company info */}
                        <div className="md:col-span-8 p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{match.companyName}</h3>
                                    <p className="text-sm text-gray-500 mb-3">
                                        {match.location} • {match.employeeCount || 'Unknown size'} • {match.fundingStage || 'Unknown stage'}
                                    </p>
                                    <div className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded mb-4 inline-block">
                                        {match.industry || 'Unspecified industry'}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleBookmark(match.id || match._id || '');
                                    }}
                                    className="text-gray-400 hover:text-yellow-500 transition-colors"
                                >
                                    <FiBookmark
                                        size={20}
                                        className={bookmarkedMatches.has(match.id || match._id || '') ? 'fill-yellow-400 text-yellow-400' : ''}
                                    />
                                </button>
                            </div>

                            <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Company Pitch</h4>
                                <TruncatedText text={match.pitch || "No pitch available."} maxLength={200} />
                            </div>

                            <div className="mt-4 flex space-x-3">
                                <motion.button
                                    className="px-4 py-2 rounded-md flex items-center text-white font-medium text-sm"
                                    style={{ backgroundColor: colours.primaryBlue }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCardClick(match.id || match._id || '');
                                    }}
                                >
                                    View Compatibility <FiArrowRight className="ml-2" />
                                </motion.button>

                                <motion.button
                                    className="px-4 py-2 rounded-md border border-gray-300 flex items-center text-gray-700 font-medium text-sm"
                                    whileHover={{ scale: 1.05, backgroundColor: "#f8fafc" }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        connectWithMatch(match.id || match._id || '');
                                    }}
                                >
                                    Connect <FiMessageSquare className="ml-2" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Right side - Match score */}
                        <div className="md:col-span-4 bg-gray-50 p-6 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100">
                            <MatchScoreIndicator score={match.matchScore} categories={match.matchCategories} />

                            {/* Extra information or tags if relevant */}
                            {userProfile?.role === 'startup' && match.ticketSize && (
                                <div className="mt-4 text-sm">
                                    <span className="text-gray-600">Investment size: </span>
                                    <span className="font-medium">{match.ticketSize}</span>
                                </div>
                            )}

                            {userProfile?.role === 'investor' && match.fundingStage && (
                                <div className="mt-4 text-sm">
                                    <span className="text-gray-600">Looking for: </span>
                                    <span className="font-medium">{match.fundingStage} funding</span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default renderMatchCards;
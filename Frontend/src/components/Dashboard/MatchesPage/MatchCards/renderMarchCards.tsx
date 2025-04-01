import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiBookmark,
    FiMessageSquare,
    FiArrowRight,
    FiInfo,
    FiCheckCircle,
    FiExternalLink,
    FiTrendingUp,
    FiMapPin,
    FiDollarSign,
    FiChevronDown,
    FiRefreshCw,
    FiCheck
} from 'react-icons/fi';
import LoadingSpinner from '../../../Loading';
import { Match, UserProfile } from '../../../../types/Dashboard.types';
import { colours } from '../../../../utils/colours';

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

// Improved ReadMore component with smooth animations
const ReadMore = ({ text }: { text: string }) => {
    const [expanded, setExpanded] = useState(false);
    const maxLength = 150;

    if (!text || text.length <= maxLength) {
        return <p className="text-gray-600 leading-relaxed">{text}</p>;
    }

    return (
        <div className="relative">
            <AnimatePresence mode="wait">
                {expanded ? (
                    <motion.p
                        key="expanded"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-gray-600 leading-relaxed"
                    >
                        {text}
                    </motion.p>
                ) : (
                    <motion.p
                        key="collapsed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-gray-600 leading-relaxed"
                    >
                        {text.substring(0, maxLength)}...
                    </motion.p>
                )}
            </AnimatePresence>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 flex items-center"
            >
                {expanded ? 'Read less' : 'Read more'}
                <motion.span
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="ml-1"
                >
                    <FiChevronDown size={14} />
                </motion.span>
            </button>
        </div>
    );
};

// Improved match score visualizer
const MatchScoreIndicator = ({ score, categories }: { score: number; categories?: Record<string, number | undefined> }) => {
    // Normalize score to percentage
    const scorePercentage = Math.min(Math.round((score / 60) * 100), 100);

    // Determine color based on score
    const getScoreColor = (score: number) => {
        if (score >= 80) return {
            ring: 'ring-emerald-500',
            text: 'text-emerald-700',
            bg: 'bg-emerald-500',
            light: 'bg-emerald-100'
        };
        if (score >= 65) return {
            ring: 'ring-green-500',
            text: 'text-green-700',
            bg: 'bg-green-500',
            light: 'bg-green-100'
        };
        if (score >= 45) return {
            ring: 'ring-yellow-500',
            text: 'text-yellow-700',
            bg: 'bg-yellow-500',
            light: 'bg-yellow-100'
        };
        if (score >= 30) return {
            ring: 'ring-orange-500',
            text: 'text-orange-700',
            bg: 'bg-orange-500',
            light: 'bg-orange-100'
        };
        return {
            ring: 'ring-red-500',
            text: 'text-red-700',
            bg: 'bg-red-500',
            light: 'bg-red-100'
        };
    };

    const colors = getScoreColor(scorePercentage);

    // Score label based on percentage
    const getScoreLabel = (score: number) => {
        if (score >= 80) return "Excellent Match";
        if (score >= 65) return "Strong Match";
        if (score >= 45) return "Good Match";
        if (score >= 30) return "Moderate Match";
        return "Basic Match";
    };

    return (
        <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center">
                {/* Outer ring with progress */}
                <div className={`relative rounded-full w-32 h-32 ${colors.ring} ring-8 ring-opacity-20 flex items-center justify-center`}>
                    {/* Inner circle with percentage */}
                    <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center">
                        <span className={`text-3xl font-bold ${colors.text}`}>{scorePercentage}%</span>
                        <span className="text-xs font-medium text-gray-500">{getScoreLabel(scorePercentage)}</span>
                    </div>

                    {/* Progress overlay */}
                    <motion.div
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90">
                            <circle
                                cx="50"
                                cy="50"
                                r="46"
                                fill="none"
                                stroke="transparent"
                                strokeWidth="8"
                            />
                            <motion.circle
                                cx="50"
                                cy="50"
                                r="46"
                                fill="none"
                                stroke={colors.bg.replace('bg-', 'text-')}
                                strokeWidth="8"
                                strokeDasharray="289.1"
                                initial={{ strokeDashoffset: 289.1 }}
                                animate={{ strokeDashoffset: 289.1 - (scorePercentage / 100) * 289.1 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={colors.bg.replace('bg-', 'text-')}
                                strokeLinecap="round"
                            />
                        </svg>
                    </motion.div>
                </div>
            </div>

            {/* Category bars */}
            {categories && Object.entries(categories).length > 0 && (
                <div className="w-full space-y-2 mt-6">
                    {Object.entries(categories).map(([category, value]) => {
                        if (value === undefined) return null;
                        const categoryPercentage = Math.min(Math.round((value / 30) * 100), 100);
                        const catColors = getScoreColor(categoryPercentage);

                        return (
                            <div key={category} className="w-full">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="capitalize font-medium">{category}</span>
                                    <span className={`${catColors.text} font-semibold`}>{categoryPercentage}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full ${catColors.bg}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${categoryPercentage}%` }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
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

// Main component
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
            <div className="bg-red-50 border border-red-100 rounded-xl p-6 mb-8">
                <div className="flex">
                    <FiInfo className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="text-lg font-semibold text-red-700 mb-1">Error Loading Matches</h3>
                        <p className="text-red-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (filteredMatches.length === 0) {
        return (
            <motion.div
                className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-gray-100 my-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <FiInfo className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No matches found</h3>
                <p className="text-gray-600 text-center max-w-lg mb-6">
                    We couldn't find any matches based on your current filters.
                    Try adjusting your search criteria or clearing filters to see more results.
                </p>
                <motion.button
                    className="px-5 py-3 rounded-lg flex items-center text-white font-medium shadow-sm"
                    style={{ backgroundColor: colours.primaryBlue }}
                    whileHover={{ scale: 1.03, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.97 }}
                >
                    <FiRefreshCw className="mr-2" />
                    Clear All Filters
                </motion.button>
            </motion.div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6">
            {filteredMatches.map((match) => {
                const matchId = match.id || match._id || '';
                const isBookmarked = bookmarkedMatches.has(matchId);

                // Organize data for display
                const displayIndustries = match.industriesOfInterest || (match.industry ? [match.industry] : []);
                const displayStages = match.preferredStages || (match.fundingStage ? [match.fundingStage] : []);

                // Create a summary from available data
                let summary = "";
                if (match.pitch) {
                    summary = match.pitch;
                } else if (match.investmentCriteria && match.investmentCriteria.length > 0) {
                    summary = `Looking for ventures with: ${match.investmentCriteria.join(', ')}`;
                } else if (match.pastInvestments) {
                    summary = `Past investments include: ${match.pastInvestments}`;
                } else {
                    summary = userProfile?.role === 'startup'
                        ? "This investor hasn't provided detailed information about their investment focus."
                        : "This startup hasn't provided detailed information about their venture.";
                }

                return (
                    <motion.div
                        key={matchId}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Card content */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                            {/* Main content area */}
                            <div className="md:col-span-8 p-6">
                                {/* Header section with company name and bookmark */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-bold text-gray-900">
                                                {match.companyName}
                                            </h3>
                                            {match.matchScore >= 70 && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                    <FiCheckCircle className="mr-1" size={12} />
                                                    High Match
                                                </span>
                                            )}
                                        </div>

                                        {/* Location and basic info */}
                                        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                                            {match.location && (
                                                <div className="flex items-center">
                                                    <FiMapPin size={14} className="mr-1" />
                                                    <span>{match.location}</span>
                                                </div>
                                            )}
                                            {match.ticketSize && (
                                                <div className="flex items-center">
                                                    <FiDollarSign size={14} className="mr-1" />
                                                    <span>{match.ticketSize}</span>
                                                </div>
                                            )}
                                            {userProfile?.role === 'investor' && match.fundingStage && (
                                                <div className="flex items-center">
                                                    <FiTrendingUp size={14} className="mr-1" />
                                                    <span>{match.fundingStage}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bookmark button */}
                                    <motion.button
                                        className={`p-2 rounded-full ${isBookmarked ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleBookmark(matchId);
                                        }}
                                    >
                                        <FiBookmark
                                            size={20}
                                            className={isBookmarked ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}
                                        />
                                    </motion.button>
                                </div>

                                {/* Industry tags */}
                                {displayIndustries.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {displayIndustries.slice(0, 3).map(industry => (
                                            <span
                                                key={industry}
                                                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                                            >
                                                {industry}
                                            </span>
                                        ))}
                                        {displayIndustries.length > 3 && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                +{displayIndustries.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Company description with Read More */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        {match.pitch ? 'Company Pitch' : 'Investment Focus'}
                                    </h4>
                                    <ReadMore text={summary} />
                                </div>

                                {/* Investment stages */}
                                {displayStages.length > 0 && userProfile?.role === 'startup' && (
                                    <div className="mb-5">
                                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                            Preferred Investment Stages
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {displayStages.map(stage => (
                                                <span
                                                    key={stage}
                                                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700"
                                                >
                                                    {stage}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex flex-wrap gap-3 mt-6">
                                    <motion.button
                                        className="px-4 py-2 rounded-lg flex items-center justify-center text-white font-medium shadow-sm"
                                        style={{ backgroundColor: colours.primaryBlue }}
                                        whileHover={{ scale: 1.03, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCardClick(matchId);
                                        }}
                                    >
                                        View Compatibility <FiArrowRight className="ml-2" size={16} />
                                    </motion.button>

                                    <motion.button
                                        className="px-4 py-2 rounded-lg border border-gray-200 flex items-center justify-center text-gray-700 font-medium bg-white"
                                        whileHover={{ scale: 1.03, backgroundColor: "#f9fafb" }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            connectWithMatch(matchId);
                                        }}
                                    >
                                        Connect <FiMessageSquare className="ml-2" size={16} />
                                    </motion.button>

                                    <motion.button
                                        className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 bg-white"
                                        whileHover={{ scale: 1.03, backgroundColor: "#f9fafb" }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // View full profile
                                            window.open(`/profile/${matchId}`, '_blank');
                                        }}
                                        title="View full profile"
                                    >
                                        <FiExternalLink size={16} />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Match score section */}
                            <div className="md:col-span-4 bg-gray-50 p-6 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col items-center">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Compatibility Score</h4>

                                <MatchScoreIndicator score={match.matchScore} categories={match.matchCategories} />

                                {/* Key alignment areas */}
                                <div className="w-full mt-6 pt-4 border-t border-gray-200">
                                    <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Alignment Areas</h5>

                                    <div className="space-y-2">
                                        {userProfile?.role === 'startup' ? (
                                            // For startups viewing investors
                                            <>
                                                {match.investmentCriteria?.slice(0, 2).map(criteria => (
                                                    <div key={criteria} className="flex items-start">
                                                        <FiCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                                                        <span className="text-sm">{criteria}</span>
                                                    </div>
                                                ))}
                                                <div className="flex items-start">
                                                    <FiCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                                                    <span className="text-sm">
                                                        Stage: {match.preferredStages?.[0] || 'Multiple stages'}
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            // For investors viewing startups
                                            <>
                                                <div className="flex items-start">
                                                    <FiCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                                                    <span className="text-sm">Stage: {match.fundingStage || 'Not specified'}</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <FiCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                                                    <span className="text-sm">Industry: {match.industry || 'Multiple sectors'}</span>
                                                </div>
                                                <div className="flex items-start">
                                                    <FiCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                                                    <span className="text-sm">
                                                        {match.ticketSize ? `Seeking: ${match.ticketSize}` : 'Location match'}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default renderMatchCards;
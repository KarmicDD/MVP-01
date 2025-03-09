import { motion } from 'framer-motion';
import { FiDollarSign, FiMapPin, FiBriefcase, FiBookmark } from 'react-icons/fi';
import { RenderMatchCardsProps } from '../../../types/Dashboard.types';



const renderMatchCards = ({
    loading,
    error,
    filteredMatches,
    bookmarkedMatches,
    userProfile,
    colours,
    connectWithMatch,
    toggleBookmark,
    onCardClick, // Add this new prop
}: RenderMatchCardsProps) => {
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
                        className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        onClick={() => onCardClick(matchId)} // Add click handler to the whole card
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
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent card click when button is clicked
                                        connectWithMatch(matchId);
                                    }}
                                >
                                    Connect
                                </motion.button>

                                <motion.button
                                    className="p-2 rounded-md border border-gray-300"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent card click when button is clicked
                                        toggleBookmark(matchId);
                                    }}
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

export default renderMatchCards;
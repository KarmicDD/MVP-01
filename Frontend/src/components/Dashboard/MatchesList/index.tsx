import React from 'react';
import { motion } from 'framer-motion';
import { Match } from '../../../types/Dashboard.types';
import renderMatchCards from '../MatchesPage/MatchCards/renderMarchCards';
import Pagination from '../MatchesPage/Pagination';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
interface PaginationProps {
  page: number;
  pages: number;
  total: number;
  limit?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

interface MatchesListProps {
  matches: Match[];
  loading: boolean;
  error: string | null;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  setSortBy: (sortBy: string) => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  pagination: PaginationProps;
  handlePageChange: (page: number) => void;
  selectedMatchId: string | null;
  setSelectedMatchId: (id: string | null) => void;
  bookmarkedMatches: Set<string>;
  toggleBookmark: (matchId: string) => void;
  userRole: string;
  itemVariants: any;
}

const MatchesList: React.FC<MatchesListProps> = ({
  matches,
  loading,
  error,
  sortBy,
  sortOrder,
  setSortBy,
  setSortOrder,
  pagination,
  handlePageChange,
  selectedMatchId,
  setSelectedMatchId,
  bookmarkedMatches,
  toggleBookmark,
  userRole,
  itemVariants
}) => {
  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to descending
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <motion.div className="mb-8" variants={itemVariants}>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Sort controls */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            {matches.length > 0 ? `${pagination.total} Matches Found` : 'No Matches Found'}
          </h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Sort by:</span>
            <button
              className={`text-sm flex items-center space-x-1 px-3 py-1.5 rounded-md ${sortBy === 'matchScore'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
              onClick={() => handleSort('matchScore')}
            >
              <span>Match Score</span>
              {sortBy === 'matchScore' && (
                sortOrder === 'desc' ? <FiArrowDown /> : <FiArrowUp />
              )}
            </button>
            <button
              className={`text-sm flex items-center space-x-1 px-3 py-1.5 rounded-md ${sortBy === 'companyName'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
              onClick={() => handleSort('companyName')}
            >
              <span>Name</span>
              {sortBy === 'companyName' && (
                sortOrder === 'desc' ? <FiArrowDown /> : <FiArrowUp />
              )}
            </button>
            <button
              className={`text-sm flex items-center space-x-1 px-3 py-1.5 rounded-md ${sortBy === 'dateJoined'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
              onClick={() => handleSort('dateJoined')}
            >
              <span>Date Joined</span>
              {sortBy === 'dateJoined' && (
                sortOrder === 'desc' ? <FiArrowDown /> : <FiArrowUp />
              )}
            </button>
          </div>
        </div>

        {/* Match cards */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="loader">Loading...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : matches.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No matches found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search filters or check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {renderMatchCards({
                loading: false,
                error: null,
                filteredMatches: matches,
                bookmarkedMatches,
                userProfile: { role: userRole } as any,
                connectWithMatch: () => { },
                toggleBookmark,
                onCardClick: setSelectedMatchId,
                selectedMatchId: selectedMatchId
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {matches.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MatchesList;

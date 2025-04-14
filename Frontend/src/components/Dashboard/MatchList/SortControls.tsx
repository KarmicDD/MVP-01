import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { UserProfile } from '../../../types/Dashboard.types';

interface SortControlsProps {
  loading: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  totalItems: number;
  userProfile: UserProfile | null;
  handleSortChange: (sortBy: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
};

const SortControls: React.FC<SortControlsProps> = ({
  loading,
  sortBy,
  sortOrder,
  totalItems,
  userProfile,
  handleSortChange,
  setSortOrder
}) => {
  return (
    <motion.div
      className="mb-4"
      variants={itemVariants}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">
          {loading ? 'Loading matches...' : `${totalItems} matches found`}
        </h2>

        {/* Add simple sort controls */}
        {!loading && totalItems > 0 && (
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
  );
};

export default SortControls;
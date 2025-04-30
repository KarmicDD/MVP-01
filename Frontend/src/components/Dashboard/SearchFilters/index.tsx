import React from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiChevronDown, FiX, FiRefreshCw } from 'react-icons/fi';
import { FilterOptions } from '../../../services/searchServices';
import { colours } from '../../../utils/colours';

interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  industry: string;
  // These state setters are not directly used in this component
  // as we're using handleFilterChange instead
  setIndustry?: (industry: string) => void;
  stage: string;
  setStage?: (stage: string) => void;
  location: string;
  setLocation?: (location: string) => void;
  filterOptions: FilterOptions;
  handleFilterChange: (name: string, value: string) => void;
  handleClearFilters: () => void;
  fetchMatches: (page: number) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
  itemVariants: any;
  userProfile?: {
    role: string;
    name?: string;
    avatar?: string;
    companyName?: string;
  } | null;
}

const SearchFilters: React.FC<SearchFiltersProps> = (props) => {
  // Destructure only the props we actually use
  const {
    searchQuery,
    setSearchQuery,
    industry,
    stage,
    location,
    filterOptions,
    handleFilterChange,
    handleClearFilters,
    fetchMatches,
    isFilterOpen,
    setIsFilterOpen,
    itemVariants,
    userProfile
  } = props;

  // Get user role and set colors accordingly
  const role = userProfile?.role || 'startup';
  const primaryColor = role === 'investor' ? colours.investor.primary : colours.startup.primary;
  const primaryLight = role === 'investor' ? colours.investor.light : colours.startup.light;
  const primaryBorder = role === 'investor' ? 'border-green-200' : 'border-blue-200';
  return (
    <motion.div
      className="mb-8 search-filter-container"
      variants={itemVariants}
    >
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search matches..."
              className={`w-full pl-12 pr-12 py-3.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 transition-all ${role === 'investor' ? 'focus:ring-green-500 focus:border-green-500' : 'focus:ring-blue-500 focus:border-blue-500'
                }`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setSearchQuery('');
                  // Immediately fetch without the search term to get all results
                  console.log('Search cleared, fetching all matches');
                  fetchMatches(1);
                }}
              >
                <FiX />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className={`px-4 py-3 rounded-lg flex items-center gap-2 transition-all ${isFilterOpen
                ? role === 'investor'
                  ? 'bg-green-50 text-green-600 border border-green-200'
                  : 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <FiFilter className="text-lg" />
              <span className="hidden sm:inline">Filters</span>
              <FiChevronDown className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            <button
              type="button"
              className={`px-4 py-3 rounded-lg text-white flex items-center gap-2 transition-all ${role === 'investor' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              onClick={() => fetchMatches(1)}
            >
              <FiRefreshCw className="text-lg" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {isFilterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Industry Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select
                  className={`w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 ${role === 'investor' ? 'focus:ring-green-500 focus:border-green-500' : 'focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  value={industry}
                  onChange={(e) => handleFilterChange('industry', e.target.value)}
                >
                  <option value="">All Industries</option>
                  {filterOptions.industries?.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              {/* Funding Stage Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Funding Stage</label>
                <select
                  className={`w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 ${role === 'investor' ? 'focus:ring-green-500 focus:border-green-500' : 'focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  value={stage}
                  onChange={(e) => handleFilterChange('fundingStage', e.target.value)}
                >
                  <option value="">All Stages</option>
                  {filterOptions.fundingStages?.map((stg) => (
                    <option key={stg} value={stg}>
                      {stg}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  className={`w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 ${role === 'investor' ? 'focus:ring-green-500 focus:border-green-500' : 'focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  value={location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                >
                  <option value="">All Locations</option>
                  {filterOptions.locations?.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
              <button
                type="button"
                className={`ml-3 px-4 py-2 text-white rounded-lg text-sm ${role === 'investor' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                onClick={() => {
                  fetchMatches(1);
                  setIsFilterOpen(false);
                }}
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SearchFilters;

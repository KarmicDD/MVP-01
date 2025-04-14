import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiChevronDown, FiX, FiRefreshCw } from 'react-icons/fi';
import { colours } from '../../../utils/colours';
import { FilterOptions } from '../../../services/searchServices';

interface SearchFiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    industry: string;
    setIndustry: (industry: string) => void;
    stage: string;
    setStage: (stage: string) => void;
    location: string;
    setLocation: (location: string) => void;
    filtersOpen: boolean;
    setFiltersOpen: (isOpen: boolean) => void;
    filterOptions: FilterOptions;
    handleSearchSubmit: (e: React.FormEvent) => void;
    handleFilterChange: (name: string, value: string) => void;
    clearFilters: () => void;
    fetchMatches: (page?: number) => void;
}

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
};

const SearchFilters: React.FC<SearchFiltersProps> = ({
    searchQuery,
    setSearchQuery,
    industry,
    setIndustry,
    stage,
    setStage,
    location,
    setLocation,
    filtersOpen,
    setFiltersOpen,
    filterOptions,
    handleSearchSubmit,
    handleFilterChange,
    clearFilters,
    fetchMatches
}) => {
    return (
        <motion.div
            className="mb-8 search-filter-container"
            variants={itemVariants}
        >
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <form onSubmit={handleSearchSubmit} className="relative flex-1">
                        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                        <input
                            type="text"
                            placeholder="Search matches..."
                            className="w-full pl-12 pr-12 py-3.5 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                onClick={() => {
                                    setSearchQuery('');
                                    // Optionally fetch without the search term
                                    fetchMatches(1);
                                }}
                            >
                                <FiX />
                            </button>
                        )}
                        <button type="submit" className="hidden">Search</button>
                    </form>

                    <motion.button
                        className="px-5 py-3.5 rounded-lg flex items-center justify-center font-medium text-white shadow-md"
                        style={{ backgroundColor: colours.primaryBlue }}
                        whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFiltersOpen(!filtersOpen)}
                    >
                        <FiFilter className="mr-2" />
                        {filtersOpen ? 'Hide Filters' : 'Show Filters'}
                        <FiChevronDown className={`ml-2 transition-transform duration-300 ${filtersOpen ? 'rotate-180' : ''}`} />
                    </motion.button>
                </div>

                {/* Expandable filters */}
                <AnimatePresence>
                    {filtersOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Industry</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={industry}
                                        onChange={(e) => handleFilterChange('industry', e.target.value)}
                                    >
                                        <option value="">All Industries</option>
                                        {filterOptions.industries.map(ind => (
                                            <option key={ind} value={ind}>{ind}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Funding Stage</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={stage}
                                        onChange={(e) => handleFilterChange('fundingStage', e.target.value)}
                                    >
                                        <option value="">All Stages</option>
                                        {filterOptions.fundingStages.map(stage => (
                                            <option key={stage} value={stage}>{stage}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Location</label>
                                        <select
                                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                        >
                                            <option value="">All Locations</option>
                                            {filterOptions.investmentRegions && filterOptions.investmentRegions.map(loc => (
                                                <option key={loc} value={loc}>{loc}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <motion.button
                                    className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={clearFilters}
                                >
                                    <FiRefreshCw className="mr-1" />
                                    Clear Filters
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Filter summary */}
                <AnimatePresence>
                    {(industry || stage || location) && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-4 flex flex-wrap gap-2"
                        >
                            {industry && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Industry: {industry}
                                    <button onClick={() => setIndustry('')} className="ml-1 text-blue-500 hover:text-blue-700">
                                        <FiX size={14} />
                                    </button>
                                </span>
                            )}
                            {stage && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    Stage: {stage}
                                    <button onClick={() => setStage('')} className="ml-1 text-purple-500 hover:text-purple-700">
                                        <FiX size={14} />
                                    </button>
                                </span>
                            )}
                            {location && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Location: {location}
                                    <button onClick={() => setLocation('')} className="ml-1 text-green-500 hover:text-green-700">
                                        <FiX size={14} />
                                    </button>
                                </span>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default SearchFilters;
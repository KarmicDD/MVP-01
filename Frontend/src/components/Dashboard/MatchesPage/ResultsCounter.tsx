import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiAlertCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { PaginationData } from '../../../services/searchServices';

interface ResultsCounterProps {
    loading: boolean;
    error: string | null;
    pagination: PaginationData;
    currentPage: number;
    resultsPerPage: number;
    matches: any[];
    handlePageChange: (page: number) => void;
    setResultsPerPage: (value: number) => void;
    performSearch: (page: number) => void;
}

const ResultsCounter: React.FC<ResultsCounterProps> = ({
    loading,
    error,
    pagination,
    currentPage,
    resultsPerPage,
    matches,
    handlePageChange,
    setResultsPerPage,
    performSearch
}) => {
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.3 } }
    };

    return (
        <motion.div
            className="mb-6"
            variants={itemVariants}
            layout
        >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center space-x-3 mb-3 md:mb-0">
                        {loading ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center"
                            >
                                <div className="h-6 w-6 relative mr-3">
                                    <motion.div
                                        className="absolute inset-0 border-t-2 border-blue-500 rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                </div>
                                <h2 className="text-lg font-medium text-gray-600">Loading matches...</h2>
                            </motion.div>
                        ) : error ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center text-red-600"
                            >
                                <FiAlertCircle size={22} className="mr-2" />
                                <h2 className="text-lg font-medium">Error loading matches</h2>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center"
                            >
                                <div className="bg-blue-50 p-2 rounded-lg mr-3">
                                    <FiUsers size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">
                                        {pagination.total} {pagination.total === 1 ? 'match' : 'matches'} found
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        Page {currentPage} of {pagination.pages}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {!loading && matches.length > 0 && (
                        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">


                            <div className="flex items-center">
                                <label htmlFor="per-page" className="text-sm font-medium text-gray-600 mr-2">View:</label>
                                <select
                                    id="per-page"
                                    className="text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    value={resultsPerPage}
                                    onChange={(e) => {
                                        setResultsPerPage(Number(e.target.value));
                                        performSearch(1);
                                    }}
                                >
                                    <option value="10">10 per page</option>
                                    <option value="20">20 per page</option>
                                    <option value="50">50 per page</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {!loading && matches.length > 0 && pagination.pages > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between"
                    >
                        <p className="text-sm text-gray-500">
                            Showing <span className="font-medium">{(currentPage - 1) * resultsPerPage + 1}</span> to{" "}
                            <span className="font-medium">
                                {Math.min(currentPage * resultsPerPage, pagination.total)}
                            </span> of{" "}
                            <span className="font-medium">{pagination.total}</span> results
                        </p>

                        <div className="flex items-center space-x-1">
                            <button
                                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`p-1.5 rounded-md ${currentPage === 1
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-gray-500 hover:bg-gray-100"
                                    }`}
                            >
                                <FiChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => currentPage < pagination.pages && handlePageChange(currentPage + 1)}
                                disabled={currentPage === pagination.pages}
                                className={`p-1.5 rounded-md ${currentPage === pagination.pages
                                    ? "text-gray-300 cursor-not-allowed"
                                    : "text-gray-500 hover:bg-gray-100"
                                    }`}
                            >
                                <FiChevronRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default ResultsCounter;
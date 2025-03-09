import React from 'react';
import { motion } from 'framer-motion';

interface AnalysisResultsDisplayProps {
    analysisResults: {
        categories?: Record<string, number>;
        overallProfile?: string[];
        matchPreferences?: Record<string, string | number | boolean>;
    } | null;
    userRole: 'startup' | 'investor';
}

const AnalysisResultsDisplay: React.FC<AnalysisResultsDisplayProps> = ({
    analysisResults,
    userRole
}) => {
    if (!analysisResults) {
        return (
            <div className="bg-gray-50 p-8 rounded-lg text-center">
                <p className="text-gray-500">No analysis results available yet.</p>
            </div>
        );
    }

    // Helper function to get color based on score
    const getColorClass = (score: number) => {
        if (score >= 70) return 'bg-green-500';
        if (score >= 50) return 'bg-blue-500';
        if (score >= 30) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    // Helper function to format text
    const formatText = (text: string): string => {
        return text
            .replace(/_/g, ' ')
            .replace(/\b\w/g, letter => letter.toUpperCase());
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5">
                <h2 className="text-xl font-bold text-white">
                    Your {userRole === 'startup' ? 'Startup' : 'Investor'} Profile Analysis
                </h2>
                <p className="text-blue-100 mt-1">
                    Based on your questionnaire responses
                </p>
            </div>

            {/* Main content */}
            <div className="p-6">
                {/* Strengths Section */}
                {analysisResults.overallProfile && analysisResults.overallProfile.length > 0 && (
                    <section className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Profile Strengths</h3>
                        <div className="flex flex-wrap gap-3">
                            {analysisResults.overallProfile.map((strength, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-medium"
                                >
                                    {strength}
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Categories Section */}
                {analysisResults.categories && (
                    <section className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Category Assessment</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(analysisResults.categories).map(([category, score], index) => (
                                <motion.div
                                    key={category}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-gray-50 p-4 rounded-lg"
                                >
                                    <div className="flex justify-between mb-1">
                                        <span className="font-medium text-gray-700">{formatText(category)}</span>
                                        <span className="text-gray-500">{score}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <motion.div
                                            className={`h-2.5 rounded-full ${getColorClass(score)}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${score}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                        ></motion.div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Match Preferences Section */}
                {analysisResults.matchPreferences && Object.keys(analysisResults.matchPreferences).length > 0 && (
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Match Preferences</h3>
                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.entries(analysisResults.matchPreferences).map(([key, value]) => (
                                    <div key={key} className="flex flex-col">
                                        <span className="text-gray-500 text-sm">{formatText(key)}</span>
                                        <span className="font-medium text-gray-800">
                                            {typeof value === 'string' ? formatText(value) : value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </div>

            {/* Footer with insights */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                    Based on your responses, you show particular strength in
                    {analysisResults.categories && Object.entries(analysisResults.categories)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 2)
                        .map(([category], index, arr) => (
                            <span key={category}>
                                {index === 0 ? ' ' : index === arr.length - 1 ? ' and ' : ', '}
                                <span className="font-medium">{formatText(category)}</span>
                            </span>
                        ))
                    }.
                </p>
            </div>
        </div>
    );
};

export default AnalysisResultsDisplay;
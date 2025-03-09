import React from 'react';
import AnalysisResultsDisplay from '../../Analytics/AnalysisResultsDisplay';

interface SummaryReviewProps {
    responses: Record<string, string | number | string[]>;
    questions: { id: string; text: string }[];
    userRole: 'startup' | 'investor';
    analysisResults?: {
        categories?: Record<string, number>;
        overallProfile?: string[];
        matchPreferences?: Record<string, string | number>;
    } | null;
}

const SummaryReview: React.FC<SummaryReviewProps> = ({
    responses,
    questions,
    userRole,
    analysisResults
}) => {
    // Helper function to safely format keys or values
    const formatText = (text: string | number): string => {
        if (typeof text !== 'string') {
            return String(text);
        }

        return text
            .replace(/_/g, ' ')
            .replace(/\b\w/g, letter => letter.toUpperCase());
    };

    return (
        <div className="space-y-8">
            {/* Analysis Results Section */}
            {analysisResults && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Analysis Results</h2>
                    <AnalysisResultsDisplay
                        analysisResults={analysisResults}
                        userRole={userRole}
                    />
                </div>
            )}

            {/* Responses Review Section */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Review Your Responses</h2>

                {questions.map(question => {
                    const response = responses[question.id];
                    if (!response) return null;

                    return (
                        <div key={question.id} className="mb-4 pb-4 border-b border-gray-200">
                            <p className="font-medium text-gray-800 mb-1">{question.text}</p>
                            <div className="text-gray-600">
                                {Array.isArray(response) ? (
                                    <ul className="list-disc list-inside">
                                        {response.map((item, i) => (
                                            <li key={i}>{formatText(item)}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>{formatText(response)}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SummaryReview;
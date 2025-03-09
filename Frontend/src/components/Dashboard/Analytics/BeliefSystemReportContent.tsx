import { forwardRef } from 'react';
import { BeliefSystemReportType } from '../../../hooks/useBeliefSystemReport';

interface BeliefSystemReportContentProps {
    report: BeliefSystemReportType;
    formatDate: (dateString: string) => string;
    handleExportPDF: () => Promise<void>;
    handleShareReport: () => Promise<void>;
    isCompact?: boolean;
    onBack?: () => void;
}

const BeliefSystemReportContent = forwardRef<HTMLDivElement, BeliefSystemReportContentProps>(({
    report,
    formatDate,
    handleExportPDF,
    handleShareReport,
    isCompact = false,
    onBack
}, ref) => {
    // Adjust sizing based on compact mode
    const titleSize = isCompact ? "text-lg" : "text-2xl";
    const sectionTitleSize = isCompact ? "text-md" : "text-xl";
    const buttonPadding = isCompact ? "px-3 py-1.5" : "px-4 py-2";
    const spacing = isCompact ? "mb-6" : "mb-8";

    return (
        <div
            ref={ref}
            className={`${isCompact ? "" : "max-w-4xl mx-auto"} bg-white shadow-lg rounded-lg p-6`}>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                    <svg className="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    <h1 className="text-xl font-bold">Belief System Analysis</h1>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={handleExportPDF}
                        className={`flex items-center bg-white text-gray-700 border border-gray-300 ${buttonPadding} rounded-md text-sm hover:bg-gray-50 hover:border-gray-400 hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-inner focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        Export PDF
                    </button>
                    <button
                        onClick={handleShareReport}
                        className={`flex items-center bg-blue-600 text-white ${buttonPadding} rounded-md text-sm hover:bg-blue-700 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 active:bg-blue-800 active:shadow-inner focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                        </svg>
                        Share Report
                    </button>
                </div>
            </div>

            {/* Main Title and Score */}
            <div className="border-b pb-6 mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className={`${titleSize} font-bold mb-1`}>Startup-Investor Alignment Analysis</h2>
                        <p className="text-gray-600 text-sm">Generated on {formatDate(report.generatedDate)}</p>
                    </div>
                    <div className="text-right">
                        <div className={`${isCompact ? "text-3xl" : "text-4xl"} font-bold text-blue-600`}>{report.overallMatch}%</div>
                        <p className="text-gray-600">Overall Match</p>
                    </div>
                </div>
            </div>

            {/* Compatibility Breakdown */}
            <div className={spacing}>
                <h3 className={`${sectionTitleSize} font-bold mb-${isCompact ? '3' : '4'}`}>Compatibility Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Vision Alignment */}
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex justify-between mb-1">
                            <span className="font-medium text-sm">Vision Alignment</span>
                            <span className="font-bold text-green-600">{report.compatibility.visionAlignment}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${report.compatibility.visionAlignment}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Core Values */}
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex justify-between mb-1">
                            <span className="font-medium text-sm">Core Values</span>
                            <span className="font-bold text-yellow-600">{report.compatibility.coreValues}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-yellow-500 h-2 rounded-full"
                                style={{ width: `${report.compatibility.coreValues}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Business Goals */}
                    <div className="bg-red-50 p-4 rounded-lg">
                        <div className="flex justify-between mb-1">
                            <span className="font-medium text-sm">Business Goals</span>
                            <span className="font-bold text-red-600">{report.compatibility.businessGoals}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-red-500 h-2 rounded-full"
                                style={{ width: `${report.compatibility.businessGoals}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Risk Analysis */}
            <div className={spacing}>
                <h3 className={`${sectionTitleSize} font-bold mb-${isCompact ? '3' : '4'}`}>Risk Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Risk Assessment */}
                    <div>
                        {/* Market Fit Risk */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-sm">Market Fit Risk</span>
                                <span className={`px-2 py-0.5 rounded-full text-white text-xs font-medium
                                    ${report.risks.marketFitRisk.level === 'High' ? 'bg-red-500' :
                                        report.risks.marketFitRisk.level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                                    {report.risks.marketFitRisk.level}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm">{report.risks.marketFitRisk.description}</p>
                        </div>

                        {/* Operational Risk */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-sm">Operational Risk</span>
                                <span className={`px-2 py-0.5 rounded-full text-white text-xs font-medium
                                    ${report.risks.operationalRisk.level === 'High' ? 'bg-red-500' :
                                        report.risks.operationalRisk.level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                                    {report.risks.operationalRisk.level}
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm">{report.risks.operationalRisk.description}</p>
                        </div>
                    </div>

                    {/* Risk Mitigation */}
                    <div>
                        <h4 className="font-medium mb-2 text-sm">Risk Mitigation Recommendations</h4>
                        <ul className="space-y-1">
                            {report.riskMitigationRecommendations.map((recommendation, index) => (
                                <li key={index} className="flex items-start">
                                    <div className="flex-shrink-0 h-4 w-4 rounded-full bg-green-100 flex items-center justify-center mr-2 mt-0.5">
                                        <svg className="h-2 w-2 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                        </svg>
                                    </div>
                                    <span className="text-sm">{recommendation}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Improvement Areas */}
            <div className={spacing}>
                <h3 className={`${sectionTitleSize} font-bold mb-${isCompact ? '3' : '4'}`}>Improvement Areas</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Strategic Focus */}
                    <div className="border p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                                <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                            </div>
                            <h4 className="font-medium text-sm">Strategic Focus</h4>
                        </div>
                        <p className="text-gray-600 text-sm">{report.improvementAreas.strategicFocus}</p>
                    </div>

                    {/* Communication */}
                    <div className="border p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                                <svg className="h-4 w-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                </svg>
                            </div>
                            <h4 className="font-medium text-sm">Communication</h4>
                        </div>
                        <p className="text-gray-600 text-sm">{report.improvementAreas.communication}</p>
                    </div>

                    {/* Growth Metrics */}
                    <div className="border p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                                <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                </svg>
                            </div>
                            <h4 className="font-medium text-sm">Growth Metrics</h4>
                        </div>
                        <p className="text-gray-600 text-sm">{report.improvementAreas.growthMetrics}</p>
                    </div>
                </div>
            </div>

            {/* Perspective Note */}
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5">
                        <svg className="h-2 w-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                        </svg>
                    </div>
                    <span className="text-xs text-blue-700">
                        This analysis was generated from the <strong>{report.perspective}</strong> perspective. Results may vary when viewed from the other party's perspective.
                    </span>
                </div>
            </div>

            {/* Actions - Only show for standalone view */}
            {!isCompact && onBack && (
                <div className="border-t pt-6">
                    <div className="flex justify-between">
                        <button
                            onClick={onBack}
                            className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                            </svg>
                            Back to Results
                        </button>
                        <button
                            className="bg-blue-600 text-white px-6 py-2 rounded shadow-sm hover:bg-blue-700"
                        >
                            Schedule Discussion
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

export default BeliefSystemReportContent;
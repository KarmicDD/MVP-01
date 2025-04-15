import { forwardRef } from 'react';
import { BeliefSystemReportType } from '../../../hooks/useBeliefSystemReport';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    ArcElement,         // <-- Added for Doughnut
    CategoryScale,      // <-- Added for Bar
    LinearScale,        // <-- Added for Bar
    BarElement          // <-- Register BarElement for Bar chart
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    ArcElement,         // <-- Added for Doughnut
    CategoryScale,      // <-- Added for Bar
    LinearScale,        // <-- Added for Bar
    BarElement          // <-- Register BarElement for Bar chart
);

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

    // Prepare radar chart data for compatibility metrics
    const radarChartData = {
        labels: [
            'Vision Alignment',
            'Core Values',
            'Business Goals',
        ],
        datasets: [
            {
                label: 'Compatibility',
                data: [
                    report.compatibility.visionAlignment,
                    report.compatibility.coreValues,
                    report.compatibility.businessGoals
                ],
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
            }
        ]
    };

    const radarOptions = {
        scales: {
            r: {
                angleLines: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                suggestedMin: 0,
                suggestedMax: 100,
                ticks: {
                    stepSize: 20,
                    backdropColor: 'transparent'
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        return `${context.parsed.r}%`;
                    }
                }
            }
        },
        maintainAspectRatio: false
    };

    // Risk Factors Radar Data
    const riskFactorsData = {
        labels: [
            'Product Fit',
            'Market Timing',
            'Customer Demand',
            'Competitive Landscape',
            'Execution',
            'Team Alignment',
            'Resource Allocation',
            'Process Maturity'
        ],
        datasets: [
            {
                label: 'Market Fit',
                data: [
                    50, 50, 50, 50, 0, 0, 0, 0 // Padding for other categories
                ],
                backgroundColor: 'rgba(248, 113, 113, 0.2)',
                borderColor: 'rgb(248, 113, 113)',
                borderWidth: 2,
                pointBackgroundColor: 'rgb(248, 113, 113)',
            },
            {
                label: 'Operational',
                data: [
                    0, 0, 0, 0, // Padding for other categories
                    50, 50, 50, 50
                ],
                backgroundColor: 'rgba(251, 191, 36, 0.2)',
                borderColor: 'rgb(251, 191, 36)',
                borderWidth: 2,
                pointBackgroundColor: 'rgb(251, 191, 36)',
            }
        ]
    };

    const riskFactorsOptions = {
        scales: {
            r: {
                angleLines: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                suggestedMin: 0,
                suggestedMax: 100,
                ticks: {
                    stepSize: 20,
                    backdropColor: 'transparent'
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top' as const
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        const value = context.raw;
                        if (value === 0) return ''; // Don't show tooltip for padding values
                        return `${context.dataset.label}: ${value}`;
                    }
                }
            }
        },
        maintainAspectRatio: false
    };

    return (
        <div
            ref={ref}
            className={`${isCompact ? "" : "max-w-5xl mx-auto"} bg-white shadow-lg rounded-xl p-6 md:p-8 border border-gray-100`}>


            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b">
                <div className="flex items-center mb-4 md:mb-0">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Belief System Analysis</h1>
                        <p className="text-sm text-gray-500">Comprehensive alignment assessment</p>
                    </div>
                </div>
                <div className="flex space-x-2 w-full md:w-auto">
                    <button
                        onClick={handleExportPDF}
                        className={`flex items-center justify-center bg-white text-gray-700 border border-gray-300 ${buttonPadding} rounded-md text-sm hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-1 md:flex-none`}
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        Export PDF
                    </button>
                    <button
                        onClick={handleShareReport}
                        className={`flex items-center justify-center bg-blue-600 text-white ${buttonPadding} rounded-md text-sm hover:bg-blue-700 hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-1 md:flex-none`}
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                        </svg>
                        Share Report
                    </button>
                </div>
            </div>

            {/* Main Title and Score */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h2 className={`${titleSize} font-bold mb-1 text-blue-800`}>Startup-Investor Alignment Analysis</h2>
                        <p className="text-blue-600 text-sm font-medium">Generated on {formatDate(report.generatedDate)}</p>
                        {report.isOldData && (
                            <div className="mt-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-md text-xs inline-flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                {report.message || 'Showing historical data'}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center mt-4 md:mt-0">
                        <div className="relative">
                            <svg className="w-32 h-32" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                                {/* Background circle */}
                                <circle cx="18" cy="18" r="16" fill="#EFF6FF" stroke="#DBEAFE" strokeWidth="1"></circle>

                                {/* Progress circle - dynamically calculated based on match percentage */}
                                <path
                                    d={`M18 2
                                    a 16 16 0 0 1 0 32
                                    a 16 16 0 0 1 0 -32`}
                                    fill="none"
                                    stroke="#3B82F6"
                                    strokeWidth="3"
                                    strokeDasharray={`${report.overallMatch}, 100`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 18 18)"
                                />

                                {/* Center text */}
                                <text x="18" y="18" textAnchor="middle" dominantBaseline="middle"
                                    className="font-bold text-blue-600" fontSize="8" dy=".1em">{report.overallMatch}%</text>
                                <text x="18" y="23" textAnchor="middle" dominantBaseline="middle"
                                    className="text-blue-600" fontSize="2.5">OVERALL MATCH</text>
                            </svg>
                        </div>

                        <div className="ml-4 text-right">
                            <div className="text-lg font-bold text-blue-800">Success Probability</div>
                            <div className="text-3xl font-bold text-blue-600">{report.overallMatch || 0}%</div>
                            <div className="mt-2 flex items-center justify-end">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${report.overallMatch > 70 ? 'bg-green-100 text-green-800' :
                                    report.overallMatch > 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                    {report.overallMatch > 70 ? 'High Compatibility' :
                                        report.overallMatch > 40 ? 'Moderate Compatibility' : 'Low Compatibility'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Belief Fingerprint section removed due to missing beliefFingerprint property */}

            {/* Compatibility Breakdown */}
            <div className={spacing}>
                <div className="flex items-center mb-4">
                    <h3 className={`${sectionTitleSize} font-bold`}>Compatibility Breakdown</h3>
                    <div className="ml-2 h-px flex-grow bg-gray-200"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Radar Chart */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <h4 className="font-medium text-sm mb-4 text-center">Compatibility Radar</h4>
                        <div className="h-64 md:h-80">
                            <Radar data={radarChartData} options={radarOptions} />
                        </div>
                    </div>
                </div>

                {/* Risk Sub-factors */}
                <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h4 className="font-medium text-sm mb-4 text-center">Risk Factors Breakdown</h4>
                    <div className="h-64 md:h-72">
                        <Radar data={riskFactorsData} options={riskFactorsOptions} />
                    </div>
                </div>

                {/* Compatibility Scores */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-6">
                    {/* Vision Alignment */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between mb-1">
                            <span className="font-medium text-sm">Vision Alignment</span>
                            <div className="flex items-center">
                                <span className="font-bold text-blue-600">{report.compatibility.visionAlignment}%</span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 mt-2">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${report.compatibility.visionAlignment}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Core Values */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between mb-1">
                            <span className="font-medium text-sm">Core Values</span>
                            <div className="flex items-center">
                                <span className="font-bold text-blue-600">{report.compatibility.coreValues}%</span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 mt-2">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${report.compatibility.coreValues}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Business Goals */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between mb-1">
                            <span className="font-medium text-sm">Business Goals</span>
                            <div className="flex items-center">
                                <span className="font-bold text-blue-600">{report.compatibility.businessGoals}%</span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 mt-2">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${report.compatibility.businessGoals}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Risk Analysis */}
            <div className={spacing}>
                <div className="flex items-center mb-4">
                    <h3 className={`${sectionTitleSize} font-bold`}>Risk Analysis</h3>
                    <div className="ml-2 h-px flex-grow bg-gray-200"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Market Fit Risk */}
                    <div className="border rounded-lg overflow-hidden">
                        <div className={`p-4 ${report.risks.marketFitRisk.level === 'High' ? 'bg-red-50' :
                            report.risks.marketFitRisk.level === 'Medium' ? 'bg-yellow-50' : 'bg-green-50'}`}>
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium text-sm">Market Fit Risk</h4>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${report.risks.marketFitRisk.level === 'High' ? 'bg-red-100 text-red-800' :
                                    report.risks.marketFitRisk.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                    {report.risks.marketFitRisk.level}
                                </span>
                            </div>
                        </div>
                        <div className="p-4">
                            <p className="text-sm text-gray-700 mb-3">{report.risks.marketFitRisk.description}</p>
                        </div>
                    </div>

                    {/* Operational Risk */}
                    <div className="border rounded-lg overflow-hidden">
                        <div className={`p-4 ${report.risks.operationalRisk.level === 'High' ? 'bg-red-50' :
                            report.risks.operationalRisk.level === 'Medium' ? 'bg-yellow-50' : 'bg-green-50'}`}>
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium text-sm">Operational Risk</h4>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${report.risks.operationalRisk.level === 'High' ? 'bg-red-100 text-red-800' :
                                    report.risks.operationalRisk.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                    {report.risks.operationalRisk.level}
                                </span>
                            </div>
                        </div>
                        <div className="p-4">
                            <p className="text-sm text-gray-700 mb-3">{report.risks.operationalRisk.description}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Risk Mitigation Recommendations */}
            <div className="mt-6">
                <h4 className="font-medium mb-3 text-sm">Risk Mitigation Recommendations</h4>
                <ul className="space-y-1">
                    {Array.isArray(report.riskMitigationRecommendations) && report.riskMitigationRecommendations.length > 0 ?
                        report.riskMitigationRecommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm">{rec}</li>
                        )) :
                        <li className="text-sm text-gray-500">No recommendations specified</li>
                    }
                </ul>
            </div>

            {/* Improvement Areas */}
            <div className={spacing}>
                <div className="flex items-center mb-4">
                    <h3 className={`${sectionTitleSize} font-bold`}>Improvement Areas</h3>
                    <div className="ml-2 h-px flex-grow bg-gray-200"></div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    {[{ label: 'Communication', desc: report.improvementAreas.communication },
                    { label: 'Strategic Focus', desc: report.improvementAreas.strategicFocus },
                    { label: 'Growth Metrics', desc: report.improvementAreas.growthMetrics }]
                        .map((area, idx) => (
                            <div key={area.label} className="flex items-start bg-white border rounded-lg shadow-sm p-4 mb-2">
                                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold bg-blue-100 text-blue-700">{idx + 1}</div>
                                <div className="ml-4 flex-1">
                                    <div className="flex items-center mb-1">
                                        <span className="font-semibold text-gray-800 mr-2">{area.label}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{area.desc}</p>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Risk Profile Section - use overallMatch as success probability */}
            <div className={spacing}>
                <div className="flex items-center mb-4">
                    <h3 className={`${sectionTitleSize} font-bold`}>Risk Profile & Success Probability</h3>
                    <div className="ml-2 h-px flex-grow bg-gray-200"></div>
                </div>
                <div className="bg-white border rounded-lg shadow-sm p-6 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="flex flex-col items-center justify-center flex-shrink-0">
                        <div className="text-5xl font-extrabold text-blue-700 mb-1">{report.overallMatch || 0}%</div>
                        <div className="text-sm text-blue-600 font-medium">Success Probability</div>
                    </div>
                    <div className="flex-1 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: 'Market Fit', level: report.risks.marketFitRisk.level, desc: report.risks.marketFitRisk.description },
                                { label: 'Operational', level: report.risks.operationalRisk.level, desc: report.risks.operationalRisk.description }
                            ].map((risk: { label: string; level: string; desc: string }) => (
                                <div key={risk.label} className="flex items-start bg-gray-50 border rounded p-3">
                                    <div className={`w-3 h-3 rounded-full mt-1 mr-3 ${risk.level === 'High' ? 'bg-red-500' : risk.level === 'Medium' ? 'bg-yellow-400' : 'bg-green-500'}`}></div>
                                    <div>
                                        <div className="font-semibold text-gray-800 mb-0.5">{risk.label} Risk <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${risk.level === 'High' ? 'bg-red-100 text-red-700' : risk.level === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{risk.level}</span></div>
                                        <div className="text-xs text-gray-600">{risk.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Perspective Note */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-6 border border-blue-100 shadow-sm">
                <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                        <svg className="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                        </svg>
                    </div>
                    <div>
                        <h5 className="text-sm font-semibold text-blue-800 mb-1">Analysis Perspective</h5>
                        <p className="text-sm text-blue-700">
                            This analysis was generated from the <strong className="font-semibold">{report.perspective}</strong> perspective. Results may vary when viewed from the other party's perspective.
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions - Only show for standalone view */}
            {!isCompact && onBack && (
                <div className="border-t pt-6">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <button
                            onClick={onBack}
                            className="flex items-center justify-center bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-md hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                            </svg>
                            Back to Results
                        </button>
                        <div className="flex gap-3">
                            <button
                                className="flex items-center justify-center bg-white border border-blue-500 text-blue-600 px-6 py-2.5 rounded-md hover:bg-blue-50 transition-colors shadow-sm"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                Schedule Meeting
                            </button>
                            <button
                                className="flex items-center justify-center bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                </svg>
                                Create Action Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default BeliefSystemReportContent;
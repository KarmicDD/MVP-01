import { forwardRef, useState } from 'react';
import { BeliefSystemReportType } from '../../../hooks/useBeliefSystemReport';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement
} from 'chart.js';
import { Radar, Doughnut, Bar } from 'react-chartjs-2';
import { FiFileText, FiDownload, FiShare2, FiChevronDown, FiChevronUp, FiCheckCircle, FiAlertTriangle, FiAlertCircle, FiArrowRight, FiBarChart2, FiLayers, FiUser, FiTarget, FiActivity } from 'react-icons/fi';

// Register ChartJS components
ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement
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
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        'summary': true,
        'compatibility': true,
        'risks': true,
        'recommendations': true,
        'improvements': true
    });

    // For smooth scrolling to sections
    const scrollToSection = (sectionId: string) => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Get risk level classes
    const getRiskLevelClass = (level: string) => {
        switch (level) {
            case 'High': return {
                bg: 'bg-red-50',
                border: 'border-red-200',
                text: 'text-red-700',
                badge: 'bg-red-100 text-red-800',
                icon: <FiAlertCircle className="text-red-500" />
            };
            case 'Medium': return {
                bg: 'bg-amber-50',
                border: 'border-amber-200',
                text: 'text-amber-700',
                badge: 'bg-amber-100 text-amber-800',
                icon: <FiAlertTriangle className="text-amber-500" />
            };
            default: return {
                bg: 'bg-green-50',
                border: 'border-green-200',
                text: 'text-green-700',
                badge: 'bg-green-100 text-green-800',
                icon: <FiCheckCircle className="text-green-500" />
            };
        }
    };

    const marketFitRiskStyle = getRiskLevelClass(report.risks.marketFitRisk.level);
    const operationalRiskStyle = getRiskLevelClass(report.risks.operationalRisk.level);

    // Prepare radar chart data for compatibility metrics
    const radarChartData = {
        labels: [
            'Vision Alignment',
            'Core Values',
            'Business Goals',
            'Growth Expectations',
            'Innovation',
            'Risk Approach',
            'Communication',
            'Leadership Style'
        ],
        datasets: [
            {
                label: 'Compatibility Score (%)',
                data: [
                    report.compatibility.visionAlignment,
                    report.compatibility.coreValues,
                    report.compatibility.businessGoals,
                    report.compatibility.growthExpectations || 60,
                    report.compatibility.innovation || 65,
                    report.compatibility.riskApproach || 55,
                    report.compatibility.communication || 60,
                    report.compatibility.leadershipStyle || 70
                ],
                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(79, 70, 229, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(79, 70, 229, 1)'
            }
        ]
    };

    // Overall match doughnut chart - Commented out as currently unused
    /* const matchDoughnutData = {
        labels: ['Match', 'Gap'],
        datasets: [{
            data: [report.overallMatch, 100 - report.overallMatch],
            backgroundColor: [
                'rgba(79, 70, 229, 0.9)',
                'rgba(229, 231, 235, 0.5)'
            ],
            borderColor: [
                'rgba(79, 70, 229, 1)',
                'rgba(229, 231, 235, 0.8)'
            ],
            borderWidth: 1,
            cutout: '75%'
        }]
    }; */

    // Compatibility comparison bar chart - showing only the top 4 metrics
    // Using different metrics than the radar chart to provide complementary insights
    const compatibilityBarData = {
        labels: [
            'Business Goals',
            'Growth Expectations',
            'Innovation',
            'Risk Approach'
        ],
        datasets: [{
            label: 'Compatibility (%)',
            data: [
                report.compatibility.businessGoals,
                report.compatibility.growthExpectations || 60,
                report.compatibility.innovation || 65,
                report.compatibility.riskApproach || 55
            ],
            backgroundColor: [
                'rgba(139, 92, 246, 0.7)', // purple
                'rgba(20, 184, 166, 0.7)', // teal
                'rgba(245, 158, 11, 0.7)', // amber
                'rgba(236, 72, 153, 0.7)'  // pink
            ],
            borderColor: [
                'rgba(139, 92, 246, 1)',
                'rgba(20, 184, 166, 1)',
                'rgba(245, 158, 11, 1)',
                'rgba(236, 72, 153, 1)'
            ],
            borderWidth: 1
        }]
    };

    // Risk factors radar chart data
    const riskFactorsRadarData = {
        labels: report.riskFactors?.marketFit?.map(item => item.factor).concat(
            report.riskFactors?.operational?.map(item => item.factor)
        ) || [
                'Market Timing',
                'Customer Demand',
                'Competitive Landscape',
                'Product Maturity',
                'Resource Allocation',
                'Process Maturity',
                'Team Expertise',
                'Communication Efficiency'
            ],
        datasets: [
            {
                label: 'Market Fit',
                data: report.riskFactors?.marketFit?.map(item => item.score).concat(
                    Array(4).fill(0)
                ) ||
                    report.risks.marketFitRisk.factors?.map(item => item.score).concat(
                        Array(4).fill(0)
                    ) ||
                    [65, 70, 60, 55, 0, 0, 0, 0],
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(239, 68, 68, 1)',
                pointBorderColor: '#fff',
            },
            {
                label: 'Operational',
                data: Array(4).fill(0).concat(
                    report.riskFactors?.operational?.map(item => item.score) ||
                    report.risks.operationalRisk.factors?.map(item => item.score) ||
                    [55, 60, 65, 50]
                ),
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                borderColor: 'rgba(245, 158, 11, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(245, 158, 11, 1)',
                pointBorderColor: '#fff',
            }
        ]
    };

    // Scoring breakdown bar chart - Commented out as currently unused
    /* const scoringBarData = {
        labels: report.scoringBreakdown?.map(item => item.label) || [],
        datasets: [{
            label: 'Score (%)',
            data: report.scoringBreakdown?.map(item => item.score) || [],
            backgroundColor: 'rgba(79, 70, 229, 0.7)',
            borderColor: 'rgba(79, 70, 229, 1)',
            borderWidth: 1
        }]
    }; */

    // Chart options
    const radarOptions = {
        scales: {
            r: {
                angleLines: { display: true, color: 'rgba(0, 0, 0, 0.1)' },
                suggestedMin: 0,
                suggestedMax: 100,
                ticks: { stepSize: 20, backdropColor: 'transparent', font: { size: 10 } }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        return `${context.dataset.label}: ${context.parsed.r}%`;
                    }
                }
            }
        },
        maintainAspectRatio: false
    };

    // Doughnut chart options - Commented out as currently unused
    /* const doughnutOptions = {
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        return `${context.label}: ${context.parsed}%`;
                    }
                }
            }
        },
        cutoutPercentage: 75,
        maintainAspectRatio: true,
    }; */

    const barOptions = {
        indexAxis: 'y' as const,
        scales: {
            x: {
                beginAtZero: true,
                max: 100,
                grid: { display: false },
                ticks: {
                    callback: function (value: any) {
                        return value + '%';
                    }
                }
            },
            y: {
                grid: { display: false },
                ticks: {
                    font: {
                        weight: 'bold' as const
                    }
                }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        return `${context.dataset.label}: ${context.parsed.x}%`;
                    }
                }
            }
        },
        maintainAspectRatio: false
    };

    // Get the overall match assessment - Commented out as currently unused
    /* const getMatchAssessment = () => {
        if (report.overallMatch >= 75) return { text: 'Strong Alignment', color: 'text-green-600' };
        if (report.overallMatch >= 50) return { text: 'Moderate Alignment', color: 'text-amber-600' };
        return { text: 'Weak Alignment', color: 'text-red-600' };
    };

    const matchAssessment = getMatchAssessment(); */

    return (
        <div
            ref={ref}
            className={`${isCompact ? "" : "max-w-7xl mx-auto"} bg-white shadow-xl rounded-xl border border-gray-200 w-full`}>

            {/* Header Banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-t-xl p-6 md:p-8 relative overflow-hidden">
                {/* Background pattern for visual interest */}
                <div className="absolute top-0 right-0 w-full h-full opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
                    <div className="text-white mb-4 md:mb-0">
                        <h1 className="text-2xl md:text-3xl font-bold">Belief System Due Diligence</h1>
                        <p className="text-indigo-100 mt-1">
                            Generated on {formatDate(report.generatedDate)} • From {report.perspective} perspective
                        </p>
                        {report.isOldData && (
                            <div className="mt-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-md text-xs inline-flex items-center">
                                <FiAlertTriangle className="mr-1" />
                                {report.message || 'Showing historical data'}
                            </div>
                        )}
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={handleExportPDF}
                            className="px-4 py-2 bg-white hover:bg-gray-100 rounded-lg text-indigo-700 flex items-center transition-all font-medium shadow-sm border border-white z-10 relative"
                            title="Download as PDF document"
                        >
                            <FiDownload className="mr-2" />
                            Download
                        </button>
                        <button
                            onClick={handleShareReport}
                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white flex items-center transition-all font-medium shadow-sm z-10 relative"
                            title="Share this report via email"
                        >
                            <FiShare2 className="mr-2" />
                            Share
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Navigation */}
            {!isCompact && (
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
                    <div className="flex space-x-6 overflow-x-auto">
                        <button onClick={() => scrollToSection('executive-summary')} className="text-sm text-gray-600 hover:text-indigo-600 whitespace-nowrap">Executive Summary</button>
                        <button onClick={() => scrollToSection('compatibility-breakdown')} className="text-sm text-gray-600 hover:text-indigo-600 whitespace-nowrap">Compatibility</button>
                        <button onClick={() => scrollToSection('risk-analysis')} className="text-sm text-gray-600 hover:text-indigo-600 whitespace-nowrap">Risk Analysis</button>
                        <button onClick={() => scrollToSection('recommendations')} className="text-sm text-gray-600 hover:text-indigo-600 whitespace-nowrap">Recommendations</button>
                        <button onClick={() => scrollToSection('improvement-areas')} className="text-sm text-gray-600 hover:text-indigo-600 whitespace-nowrap">Improvement Areas</button>
                    </div>
                </div>
            )}

            <div className="p-6 md:p-8 max-w-full">
                {/* Executive Summary */}
                <div id="executive-summary" className="mb-10">
                    <div className="flex items-center mb-3">
                        <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                            <FiFileText className="text-indigo-600 text-xl" />
                        </div>
                        <h2 className="text-2xl font-bold text-indigo-900">Executive Summary</h2>
                    </div>
                    <div className="text-xl font-semibold text-gray-800 mb-4 border-l-4 border-indigo-500 pl-4 py-3 bg-indigo-50 rounded-r-md shadow-sm">
                        {report.executiveSummary.headline}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        <div className="lg:col-span-2">
                            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm h-full">

                                <div className="mb-5">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Key Findings</h3>
                                    <div className="prose prose-indigo max-w-none">
                                        <p className="text-gray-700 leading-relaxed text-base">{report.executiveSummary.keyFindings}</p>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-5 mt-3">
                                    <h3 className="font-bold text-indigo-700 mb-3 flex items-center">
                                        <FiArrowRight className="mr-2" /> Strategic Action Plan
                                    </h3>
                                    <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-5 rounded-lg border border-indigo-200 shadow-sm">
                                        {/* Parse the numbered list from the text */}
                                        {report.executiveSummary.recommendedActions.split(/\d+\.\s+/).filter(Boolean).map((action, index) => (
                                            <div key={index} className="mb-4 last:mb-0 flex items-start bg-white p-3 rounded-lg border border-indigo-100 shadow-sm hover:shadow-md transition-all">
                                                <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center mr-3 font-bold shadow-sm">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-gray-800 font-medium">{action.trim()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {report.scoringBreakdown && report.scoringBreakdown.length > 0 && (
                                    <div className="border-t border-gray-200 pt-5 mt-5">
                                        <h3 className="font-bold text-indigo-700 mb-4 flex items-center">
                                            <FiBarChart2 className="mr-2" /> Scoring Breakdown
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {report.scoringBreakdown.map((item, idx) => {
                                                // Determine color based on score
                                                const getScoreColor = (score: number) => {
                                                    if (score >= 80) return 'bg-green-500';
                                                    if (score >= 60) return 'bg-blue-500';
                                                    if (score >= 40) return 'bg-amber-500';
                                                    return 'bg-red-500';
                                                };
                                                const scoreColor = getScoreColor(item.score);

                                                return (
                                                    <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-medium text-gray-800">{item.label}</span>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${scoreColor}`}>
                                                                {item.score}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-2 bg-gray-200 rounded-full">
                                                            <div
                                                                className={`h-2 ${scoreColor} rounded-full`}
                                                                style={{ width: `${item.score}%` }}
                                                            ></div>
                                                        </div>
                                                        <p className="text-xs text-gray-600 mt-2">{item.description}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">

                            <div className="relative w-full">
                                <div className="text-center mb-3">
                                    <h3 className="text-lg font-semibold text-gray-800">Success Probability</h3>
                                    <p className="text-xs text-gray-500">Based on belief system alignment</p>
                                </div>

                                {/* Gauge chart visualization */}
                                <div className="relative flex justify-center items-center mb-3">
                                    <div className="w-40 h-40 rounded-full border-8 border-gray-100 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-5xl font-bold text-indigo-700">{report.executiveSummary.successProbability}%</div>
                                            <div className="text-xs font-medium mt-1 uppercase tracking-wider">
                                                {report.executiveSummary.successProbability >= 75 ? 'Excellent' :
                                                    report.executiveSummary.successProbability >= 60 ? 'Good' :
                                                        report.executiveSummary.successProbability >= 40 ? 'Moderate' : 'Challenging'}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Gauge indicator */}
                                    <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                                        <circle
                                            cx="60"
                                            cy="60"
                                            r="54"
                                            fill="none"
                                            stroke="#e5e7eb"
                                            strokeWidth="12"
                                            strokeDasharray="339.292"
                                            strokeDashoffset="0"
                                        />
                                        <circle
                                            cx="60"
                                            cy="60"
                                            r="54"
                                            fill="none"
                                            stroke={report.executiveSummary.successProbability >= 75 ? '#10b981' :
                                                report.executiveSummary.successProbability >= 60 ? '#3b82f6' :
                                                    report.executiveSummary.successProbability >= 40 ? '#f59e0b' : '#ef4444'}
                                            strokeWidth="12"
                                            strokeDasharray="339.292"
                                            strokeDashoffset={`${339.292 - (339.292 * report.executiveSummary.successProbability / 100)}`}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>

                                <div className="text-xs text-gray-600 text-center mb-4">
                                    {report.executiveSummary.successProbability >= 75 ? 'High probability of successful partnership' :
                                        report.executiveSummary.successProbability >= 60 ? 'Good alignment with some areas to address' :
                                            report.executiveSummary.successProbability >= 40 ? 'Moderate alignment with significant areas to improve' :
                                                'Challenging alignment requiring substantial work'}
                                </div>
                            </div>

                            <div className="w-full pt-4 border-t border-gray-200">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Alignment Metrics</h4>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-medium text-gray-600">Overall Match:</span>
                                            <span className="text-sm font-bold text-indigo-700">{report.overallMatch}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                                            <div
                                                className="h-2.5 bg-indigo-600 rounded-full"
                                                style={{ width: `${report.overallMatch}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-medium text-gray-600">Vision Alignment:</span>
                                            <span className="text-sm font-bold text-blue-700">{report.compatibility.visionAlignment}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                                            <div
                                                className="h-2.5 bg-blue-600 rounded-full"
                                                style={{ width: `${report.compatibility.visionAlignment}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-medium text-gray-600">Core Values:</span>
                                            <span className="text-sm font-bold text-green-700">{report.compatibility.coreValues}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                                            <div
                                                className="h-2.5 bg-green-600 rounded-full"
                                                style={{ width: `${report.compatibility.coreValues}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <div className="bg-indigo-100 p-1.5 rounded-lg mr-2">
                                <FiBarChart2 className="text-indigo-600 text-lg" />
                            </div>
                            Key Metrics
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                            {report.executiveSummary.keyNumbers?.map((num, idx) => {
                                // Extract color class or use default
                                const colorClass = num.color || 'border-indigo-200 text-indigo-800 bg-indigo-50';
                                // Determine if it's a percentage value
                                const isPercentage = typeof num.value === 'number' || (typeof num.value === 'string' && num.value.toString().includes('%'));

                                return (
                                    <div key={idx} className="relative overflow-hidden">
                                        <div className={`rounded-lg p-4 border shadow-sm ${colorClass} flex flex-col items-center justify-center transition-all hover:shadow-md h-full`}>
                                            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
                                            <span className="text-xs uppercase tracking-wider text-gray-500 mb-1 font-medium">{num.label}</span>
                                            <span className="font-bold text-2xl">{num.value}</span>
                                            {isPercentage && (
                                                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                                                    <div
                                                        className="h-1.5 bg-indigo-600 rounded-full"
                                                        style={{ width: `${parseFloat(num.value.toString())}%` }}
                                                    ></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <div className="bg-blue-100 p-1.5 rounded-lg mr-2">
                                <FiLayers className="text-blue-600 text-lg" />
                            </div>
                            Summary Insights
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="bg-white border border-indigo-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Overall Match</span>
                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold">{report.overallMatch}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                                    <div className="h-2 bg-indigo-600 rounded-full" style={{ width: `${report.overallMatch}%` }}></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {report.overallMatch >= 75 ? 'Strong alignment' :
                                        report.overallMatch >= 60 ? 'Good alignment' :
                                            report.overallMatch >= 40 ? 'Moderate alignment' : 'Weak alignment'}
                                </div>
                            </div>

                            <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Vision Alignment</span>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">{report.compatibility.visionAlignment}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                                    <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${report.compatibility.visionAlignment}%` }}></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Long-term goals and direction</div>
                            </div>

                            <div className="bg-white border border-green-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Core Values</span>
                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">{report.compatibility.coreValues}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                                    <div className="h-2 bg-green-600 rounded-full" style={{ width: `${report.compatibility.coreValues}%` }}></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Fundamental principles alignment</div>
                            </div>

                            <div className="bg-white border border-amber-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Operational Risk</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${report.risks.operationalRisk.level === 'High' ? 'bg-red-100 text-red-800' : report.risks.operationalRisk.level === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                        {report.risks.operationalRisk.level}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                                    <div
                                        className={`h-2 rounded-full ${report.risks.operationalRisk.level === 'High' ? 'bg-red-500' : report.risks.operationalRisk.level === 'Medium' ? 'bg-amber-500' : 'bg-green-500'}`}
                                        style={{ width: report.risks.operationalRisk.level === 'High' ? '80%' : report.risks.operationalRisk.level === 'Medium' ? '50%' : '20%' }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Day-to-day execution compatibility</div>
                            </div>

                            <div className="bg-white border border-purple-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Innovation</span>
                                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">{report.compatibility.innovation || 65}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                                    <div className="h-2 bg-purple-600 rounded-full" style={{ width: `${report.compatibility.innovation || 65}%` }}></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">Approach to new ideas and change</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compatibility Breakdown */}
                <div id="compatibility-breakdown" className="mb-10 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                <FiLayers className="text-blue-600 text-xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Compatibility Analysis</h2>
                        </div>
                        <button
                            onClick={() => toggleSection('compatibility')}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            {expandedSections.compatibility ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                    </div>

                    {expandedSections.compatibility && (
                        <div className="transition-all">
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6">
                                <div className="flex flex-col md:flex-row items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-1">Alignment Overview</h3>
                                        <p className="text-sm text-gray-600">Comprehensive analysis of belief system compatibility across key dimensions</p>
                                    </div>
                                    <div className="mt-2 md:mt-0 bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-medium flex items-center">
                                        <span className="mr-1">Overall Match:</span>
                                        <span className="font-bold">{report.overallMatch}%</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Radar Chart */}
                                    <div className="bg-gradient-to-br from-gray-50 to-indigo-50 p-5 rounded-xl border border-gray-200 shadow-sm">
                                        <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                                            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                                                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                            </div>
                                            Comprehensive Alignment Radar
                                        </h3>
                                        <div className="h-72 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                            <Radar data={radarChartData} options={radarOptions} />
                                        </div>
                                        <div className="text-xs text-gray-500 mt-3 text-center italic bg-white p-2 rounded-md border border-gray-100">
                                            Full spectrum analysis of all 8 compatibility dimensions
                                        </div>
                                    </div>

                                    {/* Bar Chart */}
                                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-5 rounded-xl border border-gray-200 shadow-sm">
                                        <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                            </div>
                                            Business & Growth Metrics
                                        </h3>
                                        <div className="h-72 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                            <Bar data={compatibilityBarData} options={barOptions} />
                                        </div>
                                        <div className="text-xs text-gray-500 mt-3 text-center italic bg-white p-2 rounded-md border border-gray-100">
                                            Focused view of business and growth-related alignment dimensions
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Metrics */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Compatibility Dimensions</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* Vision Alignment */}
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full opacity-50"></div>
                                        <div className="flex items-center mb-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                                <FiTarget className="text-blue-600" />
                                            </div>
                                            <h4 className="font-semibold text-gray-800">Vision Alignment</h4>
                                        </div>
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-gray-600">Score:</span>
                                                <div className="px-2 py-1 bg-white rounded-full text-sm font-bold text-blue-700 shadow-sm">
                                                    {report.compatibility.visionAlignment}%
                                                </div>
                                            </div>
                                            <div className="w-full bg-white bg-opacity-60 rounded-full h-2.5">
                                                <div
                                                    className="bg-blue-600 h-2.5 rounded-full"
                                                    style={{ width: `${report.compatibility.visionAlignment}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            Measures how well the long-term visions and strategic direction of both parties align.
                                        </p>
                                        <div className="mt-3 text-xs text-blue-700 font-medium">
                                            {report.compatibility.visionAlignment >= 80 ? 'Excellent alignment' :
                                                report.compatibility.visionAlignment >= 60 ? 'Good alignment' :
                                                    report.compatibility.visionAlignment >= 40 ? 'Moderate alignment' : 'Needs attention'}
                                        </div>
                                    </div>

                                    {/* Core Values */}
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-green-100 rounded-bl-full opacity-50"></div>
                                        <div className="flex items-center mb-3">
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                                                <FiUser className="text-green-600" />
                                            </div>
                                            <h4 className="font-semibold text-gray-800">Core Values</h4>
                                        </div>
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-gray-600">Score:</span>
                                                <div className="px-2 py-1 bg-white rounded-full text-sm font-bold text-green-700 shadow-sm">
                                                    {report.compatibility.coreValues}%
                                                </div>
                                            </div>
                                            <div className="w-full bg-white bg-opacity-60 rounded-full h-2.5">
                                                <div
                                                    className="bg-green-600 h-2.5 rounded-full"
                                                    style={{ width: `${report.compatibility.coreValues}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            Reflects alignment in fundamental principles, ethics, and cultural values.
                                        </p>
                                        <div className="mt-3 text-xs text-green-700 font-medium">
                                            {report.compatibility.coreValues >= 80 ? 'Excellent alignment' :
                                                report.compatibility.coreValues >= 60 ? 'Good alignment' :
                                                    report.compatibility.coreValues >= 40 ? 'Moderate alignment' : 'Needs attention'}
                                        </div>
                                    </div>

                                    {/* Business Goals */}
                                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-5 rounded-xl border border-purple-100 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-purple-100 rounded-bl-full opacity-50"></div>
                                        <div className="flex items-center mb-3">
                                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                                                <FiBarChart2 className="text-purple-600" />
                                            </div>
                                            <h4 className="font-semibold text-gray-800">Business Goals</h4>
                                        </div>
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-gray-600">Score:</span>
                                                <div className="px-2 py-1 bg-white rounded-full text-sm font-bold text-purple-700 shadow-sm">
                                                    {report.compatibility.businessGoals}%
                                                </div>
                                            </div>
                                            <div className="w-full bg-white bg-opacity-60 rounded-full h-2.5">
                                                <div
                                                    className="bg-purple-600 h-2.5 rounded-full"
                                                    style={{ width: `${report.compatibility.businessGoals}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            Indicates alignment in strategic objectives, targets, and business outcomes.
                                        </p>
                                        <div className="mt-3 text-xs text-purple-700 font-medium">
                                            {report.compatibility.businessGoals >= 80 ? 'Excellent alignment' :
                                                report.compatibility.businessGoals >= 60 ? 'Good alignment' :
                                                    report.compatibility.businessGoals >= 40 ? 'Moderate alignment' : 'Needs attention'}
                                        </div>
                                    </div>

                                    {/* Innovation */}
                                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-xl border border-amber-100 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-amber-100 rounded-bl-full opacity-50"></div>
                                        <div className="flex items-center mb-3">
                                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                                                <FiActivity className="text-amber-600" />
                                            </div>
                                            <h4 className="font-semibold text-gray-800">Innovation</h4>
                                        </div>
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-gray-600">Score:</span>
                                                <div className="px-2 py-1 bg-white rounded-full text-sm font-bold text-amber-700 shadow-sm">
                                                    {report.compatibility.innovation || 65}%
                                                </div>
                                            </div>
                                            <div className="w-full bg-white bg-opacity-60 rounded-full h-2.5">
                                                <div
                                                    className="bg-amber-600 h-2.5 rounded-full"
                                                    style={{ width: `${report.compatibility.innovation || 65}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            Measures alignment in approach to innovation, creativity, and new ideas.
                                        </p>
                                        <div className="mt-3 text-xs text-amber-700 font-medium">
                                            {(report.compatibility.innovation || 65) >= 80 ? 'Excellent alignment' :
                                                (report.compatibility.innovation || 65) >= 60 ? 'Good alignment' :
                                                    (report.compatibility.innovation || 65) >= 40 ? 'Moderate alignment' : 'Needs attention'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Second Row of Metrics */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Compatibility Factors</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* Growth Expectations */}
                                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-5 rounded-xl border border-teal-100 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-teal-100 rounded-bl-full opacity-50"></div>
                                        <div className="flex items-center mb-3">
                                            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                                                <FiBarChart2 className="text-teal-600" />
                                            </div>
                                            <h4 className="font-semibold text-gray-800">Growth Expectations</h4>
                                        </div>
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-gray-600">Score:</span>
                                                <div className="px-2 py-1 bg-white rounded-full text-sm font-bold text-teal-700 shadow-sm">
                                                    {report.compatibility.growthExpectations || 60}%
                                                </div>
                                            </div>
                                            <div className="w-full bg-white bg-opacity-60 rounded-full h-2.5">
                                                <div
                                                    className="bg-teal-600 h-2.5 rounded-full"
                                                    style={{ width: `${report.compatibility.growthExpectations || 60}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            Alignment on growth trajectory, pace, and future expansion expectations.
                                        </p>
                                        <div className="mt-3 text-xs text-teal-700 font-medium">
                                            {(report.compatibility.growthExpectations || 60) >= 80 ? 'Excellent alignment' :
                                                (report.compatibility.growthExpectations || 60) >= 60 ? 'Good alignment' :
                                                    (report.compatibility.growthExpectations || 60) >= 40 ? 'Moderate alignment' : 'Needs attention'}
                                        </div>
                                    </div>

                                    {/* Risk Approach */}
                                    <div className="bg-gradient-to-br from-red-50 to-rose-50 p-5 rounded-xl border border-red-100 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-red-100 rounded-bl-full opacity-50"></div>
                                        <div className="flex items-center mb-3">
                                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                                                <FiAlertTriangle className="text-red-600" />
                                            </div>
                                            <h4 className="font-semibold text-gray-800">Risk Approach</h4>
                                        </div>
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-gray-600">Score:</span>
                                                <div className="px-2 py-1 bg-white rounded-full text-sm font-bold text-red-700 shadow-sm">
                                                    {report.compatibility.riskApproach || 55}%
                                                </div>
                                            </div>
                                            <div className="w-full bg-white bg-opacity-60 rounded-full h-2.5">
                                                <div
                                                    className="bg-red-600 h-2.5 rounded-full"
                                                    style={{ width: `${report.compatibility.riskApproach || 55}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            Compatibility in risk tolerance, assessment, and management approaches.
                                        </p>
                                        <div className="mt-3 text-xs text-red-700 font-medium">
                                            {(report.compatibility.riskApproach || 55) >= 80 ? 'Excellent alignment' :
                                                (report.compatibility.riskApproach || 55) >= 60 ? 'Good alignment' :
                                                    (report.compatibility.riskApproach || 55) >= 40 ? 'Moderate alignment' : 'Needs attention'}
                                        </div>
                                    </div>

                                    {/* Communication */}
                                    <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-5 rounded-xl border border-sky-100 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-sky-100 rounded-bl-full opacity-50"></div>
                                        <div className="flex items-center mb-3">
                                            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center mr-3">
                                                <FiShare2 className="text-sky-600" />
                                            </div>
                                            <h4 className="font-semibold text-gray-800">Communication</h4>
                                        </div>
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-gray-600">Score:</span>
                                                <div className="px-2 py-1 bg-white rounded-full text-sm font-bold text-sky-700 shadow-sm">
                                                    {report.compatibility.communication || 60}%
                                                </div>
                                            </div>
                                            <div className="w-full bg-white bg-opacity-60 rounded-full h-2.5">
                                                <div
                                                    className="bg-sky-600 h-2.5 rounded-full"
                                                    style={{ width: `${report.compatibility.communication || 60}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            Alignment in communication style, frequency, and transparency expectations.
                                        </p>
                                        <div className="mt-3 text-xs text-sky-700 font-medium">
                                            {(report.compatibility.communication || 60) >= 80 ? 'Excellent alignment' :
                                                (report.compatibility.communication || 60) >= 60 ? 'Good alignment' :
                                                    (report.compatibility.communication || 60) >= 40 ? 'Moderate alignment' : 'Needs attention'}
                                        </div>
                                    </div>

                                    {/* Leadership Style */}
                                    <div className="bg-gradient-to-br from-indigo-50 to-violet-50 p-5 rounded-xl border border-indigo-100 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-100 rounded-bl-full opacity-50"></div>
                                        <div className="flex items-center mb-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                                                <FiUser className="text-indigo-600" />
                                            </div>
                                            <h4 className="font-semibold text-gray-800">Leadership Style</h4>
                                        </div>
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-gray-600">Score:</span>
                                                <div className="px-2 py-1 bg-white rounded-full text-sm font-bold text-indigo-700 shadow-sm">
                                                    {report.compatibility.leadershipStyle || 70}%
                                                </div>
                                            </div>
                                            <div className="w-full bg-white bg-opacity-60 rounded-full h-2.5">
                                                <div
                                                    className="bg-indigo-600 h-2.5 rounded-full"
                                                    style={{ width: `${report.compatibility.leadershipStyle || 70}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            Compatibility in leadership philosophy, decision-making, and management approaches.
                                        </p>
                                        <div className="mt-3 text-xs text-indigo-700 font-medium">
                                            {(report.compatibility.leadershipStyle || 70) >= 80 ? 'Excellent alignment' :
                                                (report.compatibility.leadershipStyle || 70) >= 60 ? 'Good alignment' :
                                                    (report.compatibility.leadershipStyle || 70) >= 40 ? 'Moderate alignment' : 'Needs attention'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Risk Analysis */}
                <div id="risk-analysis" className="mb-10 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <div className="bg-red-100 p-2 rounded-lg mr-3">
                                <FiAlertTriangle className="text-red-600 text-xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Risk Assessment</h2>
                        </div>
                        <button
                            onClick={() => toggleSection('risks')}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            {expandedSections.risks ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                    </div>

                    {expandedSections.risks && (
                        <div className="transition-all">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
                                <div className="flex flex-col md:flex-row items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-1">Risk Profile Overview</h3>
                                        <p className="text-sm text-gray-600">Assessment of key risk areas that may impact partnership success</p>
                                    </div>
                                    <div className="mt-2 md:mt-0 flex space-x-2">
                                        <div className="flex items-center text-xs">
                                            <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                                            <span>High</span>
                                        </div>
                                        <div className="flex items-center text-xs">
                                            <span className="w-3 h-3 bg-amber-500 rounded-full mr-1"></span>
                                            <span>Medium</span>
                                        </div>
                                        <div className="flex items-center text-xs">
                                            <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                                            <span>Low</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Market Fit Risk */}
                                    <div className="bg-gradient-to-br from-white to-red-50 rounded-xl border border-red-200 overflow-hidden shadow-sm">
                                        <div className="bg-red-100 p-4">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
                                                        <FiTarget className="text-red-600" />
                                                    </div>
                                                    <h4 className="font-semibold text-gray-800">Market Fit Risk</h4>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-sm font-bold ${report.risks.marketFitRisk.level === 'High' ? 'bg-red-500 text-white' : report.risks.marketFitRisk.level === 'Medium' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'}`}>
                                                    {report.risks.marketFitRisk.level}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <div className="prose prose-sm max-w-none mb-4">
                                                <p className="text-gray-700">{report.risks.marketFitRisk.description}</p>
                                            </div>

                                            <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-red-100">
                                                <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                                                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                                    Impact Areas
                                                </h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {report.risks.marketFitRisk.impactAreas && report.risks.marketFitRisk.impactAreas.length > 0 ? (
                                                        report.risks.marketFitRisk.impactAreas.map((area, idx) => (
                                                            <span key={idx} className="inline-block px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-100">
                                                                {area}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-500 italic text-sm">No impact areas specified</span>
                                                    )}
                                                </div>
                                            </div>

                                            {report.risks.marketFitRisk.factors && report.risks.marketFitRisk.factors.length > 0 && (
                                                <div className="mt-4">
                                                    <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                                                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                                        Risk Factors
                                                    </h5>
                                                    <div className="space-y-3">
                                                        {report.risks.marketFitRisk.factors.map((factor, idx) => (
                                                            <div key={idx} className="bg-white bg-opacity-70 p-3 rounded-lg border border-red-100">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <span className="text-sm font-medium text-gray-700">{factor.factor}</span>
                                                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold">
                                                                        {factor.score}%
                                                                    </span>
                                                                </div>
                                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                                    <div
                                                                        className="h-2 bg-red-500 rounded-full"
                                                                        style={{ width: `${factor.score}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Operational Risk */}
                                    <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl border border-amber-200 overflow-hidden shadow-sm">
                                        <div className="bg-amber-100 p-4">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
                                                        <FiActivity className="text-amber-600" />
                                                    </div>
                                                    <h4 className="font-semibold text-gray-800">Operational Risk</h4>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-sm font-bold ${report.risks.operationalRisk.level === 'High' ? 'bg-red-500 text-white' : report.risks.operationalRisk.level === 'Medium' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white'}`}>
                                                    {report.risks.operationalRisk.level}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <div className="prose prose-sm max-w-none mb-4">
                                                <p className="text-gray-700">{report.risks.operationalRisk.description}</p>
                                            </div>

                                            <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-amber-100">
                                                <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                                                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                                                    Impact Areas
                                                </h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {report.risks.operationalRisk.impactAreas && report.risks.operationalRisk.impactAreas.length > 0 ? (
                                                        report.risks.operationalRisk.impactAreas.map((area, idx) => (
                                                            <span key={idx} className="inline-block px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-100">
                                                                {area}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-500 italic text-sm">No impact areas specified</span>
                                                    )}
                                                </div>
                                            </div>

                                            {report.risks.operationalRisk.factors && report.risks.operationalRisk.factors.length > 0 && (
                                                <div className="mt-4">
                                                    <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                                                        <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                                                        Risk Factors
                                                    </h5>
                                                    <div className="space-y-3">
                                                        {report.risks.operationalRisk.factors.map((factor, idx) => (
                                                            <div key={idx} className="bg-white bg-opacity-70 p-3 rounded-lg border border-amber-100">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <span className="text-sm font-medium text-gray-700">{factor.factor}</span>
                                                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-bold">
                                                                        {factor.score}%
                                                                    </span>
                                                                </div>
                                                                <div className="w-full bg-gray-100 rounded-full h-2">
                                                                    <div
                                                                        className="h-2 bg-amber-500 rounded-full"
                                                                        style={{ width: `${factor.score}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Risk Factors Breakdown */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex flex-col md:flex-row items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-1">Risk Factors Breakdown</h3>
                                        <p className="text-sm text-gray-600">Comparative analysis of all risk factors across categories</p>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-gray-50 to-red-50 p-5 rounded-xl border border-gray-200 shadow-sm">
                                    <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-2">
                                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                        </div>
                                        Risk Factors Analysis
                                    </h3>
                                    <div className="h-72 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                        <Radar data={riskFactorsRadarData} options={radarOptions} />
                                    </div>
                                    <div className="text-xs text-gray-500 mt-3 text-center italic bg-white p-2 rounded-md border border-gray-100">
                                        Lower scores indicate lower risk levels
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                        <h4 className="text-sm font-semibold text-red-800 mb-1 flex items-center">
                                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                            Market Fit Risk
                                        </h4>
                                        <p className="text-xs text-gray-600">Factors related to product-market fit, customer demand, and competitive positioning</p>
                                    </div>
                                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                                        <h4 className="text-sm font-semibold text-amber-800 mb-1 flex items-center">
                                            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                                            Operational Risk
                                        </h4>
                                        <p className="text-xs text-gray-600">Factors related to execution, resource allocation, and internal processes</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recommendations */}
                <div id="recommendations" className="mb-10 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <div className="bg-green-100 p-2 rounded-lg mr-3">
                                <FiCheckCircle className="text-green-600 text-xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Strategic Recommendations</h2>
                        </div>
                        <button
                            onClick={() => toggleSection('recommendations')}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            {expandedSections.recommendations ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                    </div>

                    {expandedSections.recommendations && (
                        <div className="transition-all bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex flex-col md:flex-row items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Risk Mitigation & Partnership Enhancement</h3>
                                    <p className="text-sm text-gray-600">Actionable recommendations to address identified risks and strengthen alignment</p>
                                </div>
                                <div className="mt-2 md:mt-0 flex space-x-2">
                                    <div className="flex items-center text-xs">
                                        <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                                        <span>High Priority</span>
                                    </div>
                                    <div className="flex items-center text-xs">
                                        <span className="w-3 h-3 bg-amber-500 rounded-full mr-1"></span>
                                        <span>Medium Priority</span>
                                    </div>
                                    <div className="flex items-center text-xs">
                                        <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                                        <span>Standard Priority</span>
                                    </div>
                                </div>
                            </div>

                            {Array.isArray(report.riskMitigationRecommendations) && report.riskMitigationRecommendations.length > 0 ? (
                                <div className="space-y-4 mt-4">
                                    {report.riskMitigationRecommendations.map((rec, idx) => {
                                        const priority = typeof rec === 'string'
                                            ? (idx === 0 ? 'High' : idx === 1 ? 'Medium' : 'Standard')
                                            : rec.priority;

                                        const timeline = typeof rec === 'string'
                                            ? (idx === 0 ? 'Immediate' : idx === 1 ? 'Short-term' : 'Medium-term')
                                            : rec.timeline;


                                        return (
                                            <div key={idx} className={`p-4 rounded-lg border shadow-sm ${priority === 'High' ? 'bg-red-50 border-red-100' : priority === 'Medium' ? 'bg-amber-50 border-amber-100' : 'bg-green-50 border-green-100'}`}>
                                                <div className="flex items-start">
                                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${priority === 'High' ? 'bg-red-100' : priority === 'Medium' ? 'bg-amber-100' : 'bg-green-100'}`}>
                                                        <span className={`font-bold text-sm ${priority === 'High' ? 'text-red-700' : priority === 'Medium' ? 'text-amber-700' : 'text-green-700'}`}>{idx + 1}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <h4 className="text-base font-semibold text-gray-800 mb-2">
                                                                {`Recommendation ${idx + 1}`}
                                                            </h4>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${priority === 'High' ? 'bg-red-100 text-red-800' : priority === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                                                {priority} Priority
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-700 mb-3">
                                                            {typeof rec === 'string' ? rec : rec.text}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}>
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                Timeline: {timeline}
                                                            </span>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priority === 'High' ? 'bg-red-100 text-red-800' : priority === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                {priority === 'High' ? 'Critical Impact' : priority === 'Medium' ? 'Significant Impact' : 'Positive Impact'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-gray-500 italic">No recommendations specified</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Improvement Areas */}
                <div id="improvement-areas" className="mb-10 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                                <FiArrowRight className="text-indigo-600 text-xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Growth Opportunities</h2>
                        </div>
                        <button
                            onClick={() => toggleSection('improvements')}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            {expandedSections.improvements ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                    </div>

                    {expandedSections.improvements && (
                        <div className="transition-all">
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
                                <div className="flex flex-col md:flex-row items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-1">Key Improvement Areas</h3>
                                        <p className="text-sm text-gray-600">Strategic opportunities to enhance partnership value and outcomes</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Strategic Focus */}
                                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-200 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-100 rounded-bl-full opacity-50"></div>
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                                            <FiTarget className="text-indigo-600 text-xl" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Strategic Focus</h3>
                                        <div className="prose prose-sm max-w-none mb-4">
                                            <p className="text-gray-700">{report.improvementAreas.strategicFocus}</p>
                                        </div>

                                        <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-indigo-100">
                                            <h4 className="text-sm font-semibold text-indigo-800 mb-3 flex items-center">
                                                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                                                Action Plan
                                            </h4>
                                            <ul className="space-y-3">
                                                {report.improvementAreas.actions && report.improvementAreas.actions.strategicFocus &&
                                                    report.improvementAreas.actions.strategicFocus.map((action, idx) => (
                                                        <li key={idx} className="flex items-start bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                                                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs mr-2 mt-0.5">
                                                                {idx + 1}
                                                            </div>
                                                            <span className="text-gray-700">{action}</span>
                                                        </li>
                                                    ))}
                                                {(!report.improvementAreas.actions || !report.improvementAreas.actions.strategicFocus || report.improvementAreas.actions.strategicFocus.length === 0) && (
                                                    <li className="text-center text-gray-500 italic py-2">No specific actions defined</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Communication */}
                                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-5 rounded-xl border border-purple-200 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-purple-100 rounded-bl-full opacity-50"></div>
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                                            <FiShare2 className="text-purple-600 text-xl" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Communication</h3>
                                        <div className="prose prose-sm max-w-none mb-4">
                                            <p className="text-gray-700">{report.improvementAreas.communication}</p>
                                        </div>

                                        <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-purple-100">
                                            <h4 className="text-sm font-semibold text-purple-800 mb-3 flex items-center">
                                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                                Action Plan
                                            </h4>
                                            <ul className="space-y-3">
                                                {report.improvementAreas.actions && report.improvementAreas.actions.communication &&
                                                    report.improvementAreas.actions.communication.map((action, idx) => (
                                                        <li key={idx} className="flex items-start bg-purple-50 p-2 rounded-lg border border-purple-100">
                                                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs mr-2 mt-0.5">
                                                                {idx + 1}
                                                            </div>
                                                            <span className="text-gray-700">{action}</span>
                                                        </li>
                                                    ))}
                                                {(!report.improvementAreas.actions || !report.improvementAreas.actions.communication || report.improvementAreas.actions.communication.length === 0) && (
                                                    <li className="text-center text-gray-500 italic py-2">No specific actions defined</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Growth Metrics */}
                                    <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-5 rounded-xl border border-teal-200 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-teal-100 rounded-bl-full opacity-50"></div>
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                                            <FiBarChart2 className="text-teal-600 text-xl" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Growth Metrics</h3>
                                        <div className="prose prose-sm max-w-none mb-4">
                                            <p className="text-gray-700">{report.improvementAreas.growthMetrics}</p>
                                        </div>

                                        <div className="bg-white bg-opacity-70 rounded-lg p-4 border border-teal-100">
                                            <h4 className="text-sm font-semibold text-teal-800 mb-3 flex items-center">
                                                <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                                                Action Plan
                                            </h4>
                                            <ul className="space-y-3">
                                                {report.improvementAreas.actions && report.improvementAreas.actions.growthMetrics &&
                                                    report.improvementAreas.actions.growthMetrics.map((action, idx) => (
                                                        <li key={idx} className="flex items-start bg-teal-50 p-2 rounded-lg border border-teal-100">
                                                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs mr-2 mt-0.5">
                                                                {idx + 1}
                                                            </div>
                                                            <span className="text-gray-700">{action}</span>
                                                        </li>
                                                    ))}
                                                {(!report.improvementAreas.actions || !report.improvementAreas.actions.growthMetrics || report.improvementAreas.actions.growthMetrics.length === 0) && (
                                                    <li className="text-center text-gray-500 italic py-2">No specific actions defined</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Perspective Note */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-200 shadow-sm mt-8">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-blue-800 mb-2">Analysis Perspective</h4>
                            <p className="text-blue-700">This analysis was generated from the <span className="font-bold text-indigo-700">{report.perspective}</span> perspective. Results may vary when viewed from the other party's perspective.</p>
                            <p className="text-blue-600 mt-2 text-sm">For comprehensive due diligence, we recommend reviewing both perspectives to gain a complete understanding of the potential partnership dynamics.</p>
                        </div>
                    </div>
                </div>

                {/* Actions - Only show for standalone view */}
                {!isCompact && onBack && (
                    <div className="border-t border-gray-200 mt-10 pt-8">
                        <div className="flex flex-col sm:flex-row justify-between gap-5">
                            <button
                                onClick={onBack}
                                className="flex items-center justify-center bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Dashboard
                            </button>
                            <div className="flex gap-4">
                                <button
                                    className="flex items-center justify-center bg-white border-2 border-indigo-500 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors font-medium shadow-sm"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Schedule Meeting
                                </button>
                                <button
                                    className="flex items-center justify-center bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-colors font-medium shadow-sm"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012 2h2a2 2 0 012-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Create Action Plan
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

export default BeliefSystemReportContent;
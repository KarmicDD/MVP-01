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
        ],
        datasets: [
            {
                label: 'Compatibility Score (%)',
                data: [
                    report.compatibility.visionAlignment,
                    report.compatibility.coreValues,
                    report.compatibility.businessGoals
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

    // Compatibility comparison bar chart
    const compatibilityBarData = {
        labels: ['Vision Alignment', 'Core Values', 'Business Goals'],
        datasets: [{
            label: 'Compatibility (%)',
            data: [
                report.compatibility.visionAlignment,
                report.compatibility.coreValues,
                report.compatibility.businessGoals
            ],
            backgroundColor: [
                'rgba(79, 70, 229, 0.7)',
                'rgba(79, 70, 229, 0.7)',
                'rgba(79, 70, 229, 0.7)'
            ],
            borderColor: [
                'rgba(79, 70, 229, 1)',
                'rgba(79, 70, 229, 1)',
                'rgba(79, 70, 229, 1)'
            ],
            borderWidth: 1
        }]
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
                grid: { display: false }
            },
            y: {
                grid: { display: false }
            }
        },
        plugins: {
            legend: { display: false }
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
            className={`${isCompact ? "" : "max-w-6xl mx-auto"} bg-white shadow-xl rounded-xl border border-gray-200`}>

            {/* Header Banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-t-xl p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
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
                            className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white flex items-center transition-all"
                        >
                            <FiDownload className="mr-2" />
                            Export PDF
                        </button>
                        <button
                            onClick={handleShareReport}
                            className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white flex items-center transition-all"
                        >
                            <FiShare2 className="mr-2" />
                            Share Report
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

            <div className="p-6 md:p-8">
                {/* Executive Summary */}
                <div id="executive-summary" className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-indigo-900 mb-2 flex items-center">
                                <FiFileText className="mr-2 text-indigo-600" /> Executive Summary
                            </h2>
                            <div className="text-lg font-semibold text-gray-800 mb-1">{report.executiveSummary.headline}</div>
                            <div className="text-gray-600 mb-2">{report.executiveSummary.keyFindings}</div>
                            <div className="text-indigo-700 font-medium mb-2">{report.executiveSummary.recommendedActions}</div>
                            <div className="flex flex-wrap gap-3 mt-2">
                                {report.executiveSummary.keyNumbers?.map((num, idx) => (
                                    <div key={idx} className={`rounded-lg px-3 py-1 text-sm font-semibold border ${num.color || 'border-indigo-200 text-indigo-800 bg-indigo-50'}`}>{num.label}: <span className="font-bold">{num.value}</span></div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col items-center mt-6 md:mt-0">
                            <div className="text-5xl font-bold text-indigo-700">{report.executiveSummary.successProbability}%</div>
                            <div className="text-xs text-gray-500">Success Probability</div>
                        </div>
                    </div>
                </div>

                {/* Compatibility Breakdown */}
                <div id="compatibility-breakdown" className="mb-8 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <FiLayers className="mr-2 text-indigo-600" />
                            Compatibility Breakdown
                        </h2>
                        <button
                            onClick={() => toggleSection('compatibility')}
                            className="p-1 rounded-full hover:bg-gray-100"
                        >
                            {expandedSections.compatibility ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                    </div>

                    {expandedSections.compatibility && (
                        <div className="transition-all">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Radar Chart */}
                                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                    <h3 className="font-medium text-gray-700 mb-4">Compatibility Radar</h3>
                                    <div className="h-64">
                                        <Radar data={radarChartData} options={radarOptions} />
                                    </div>
                                </div>

                                {/* Bar Chart */}
                                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                    <h3 className="font-medium text-gray-700 mb-4">Compatibility Metrics</h3>
                                    <div className="h-64">
                                        <Bar data={compatibilityBarData} options={barOptions} />
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                {/* Vision Alignment */}
                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center mb-2">
                                        <FiTarget className="text-indigo-500 mr-2" />
                                        <h4 className="font-medium text-gray-800">Vision Alignment</h4>
                                    </div>
                                    <div className="flex items-center justify-between my-2">
                                        <span className="text-sm text-gray-600">Alignment Score:</span>
                                        <span className="font-bold text-indigo-700">{report.compatibility.visionAlignment}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className="bg-indigo-600 h-2 rounded-full"
                                            style={{ width: `${report.compatibility.visionAlignment}%` }}
                                        ></div>
                                    </div>
                                    <p className="mt-3 text-sm text-gray-600">
                                        Measures how well the long-term visions of both parties align.
                                    </p>
                                </div>

                                {/* Core Values */}
                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center mb-2">
                                        <FiUser className="text-indigo-500 mr-2" />
                                        <h4 className="font-medium text-gray-800">Core Values</h4>
                                    </div>
                                    <div className="flex items-center justify-between my-2">
                                        <span className="text-sm text-gray-600">Alignment Score:</span>
                                        <span className="font-bold text-indigo-700">{report.compatibility.coreValues}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className="bg-indigo-600 h-2 rounded-full"
                                            style={{ width: `${report.compatibility.coreValues}%` }}
                                        ></div>
                                    </div>
                                    <p className="mt-3 text-sm text-gray-600">
                                        Reflects alignment in fundamental principles and cultural values.
                                    </p>
                                </div>

                                {/* Business Goals */}
                                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center mb-2">
                                        <FiBarChart2 className="text-indigo-500 mr-2" />
                                        <h4 className="font-medium text-gray-800">Business Goals</h4>
                                    </div>
                                    <div className="flex items-center justify-between my-2">
                                        <span className="text-sm text-gray-600">Alignment Score:</span>
                                        <span className="font-bold text-indigo-700">{report.compatibility.businessGoals}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div
                                            className="bg-indigo-600 h-2 rounded-full"
                                            style={{ width: `${report.compatibility.businessGoals}%` }}
                                        ></div>
                                    </div>
                                    <p className="mt-3 text-sm text-gray-600">
                                        Indicates alignment in strategic objectives and business outcomes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Risk Analysis */}
                <div id="risk-analysis" className="mb-8 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <FiActivity className="mr-2 text-indigo-600" />
                            Risk Analysis
                        </h2>
                        <button
                            onClick={() => toggleSection('risks')}
                            className="p-1 rounded-full hover:bg-gray-100"
                        >
                            {expandedSections.risks ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                    </div>

                    {expandedSections.risks && (
                        <div className="transition-all">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Market Fit Risk */}
                                <div className={`border rounded-xl overflow-hidden ${marketFitRiskStyle.border}`}>
                                    <div className={`p-4 ${marketFitRiskStyle.bg}`}>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                {marketFitRiskStyle.icon}
                                                <h4 className="font-medium text-gray-800 ml-2">Market Fit Risk</h4>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${marketFitRiskStyle.badge}`}>
                                                {report.risks.marketFitRisk.level}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-gray-700">{report.risks.marketFitRisk.description}</p>

                                        <div className="mt-4">
                                            <h5 className="text-sm font-medium text-gray-700 mb-2">Impact Areas:</h5>
                                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                                                {report.risks.marketFitRisk.impactAreas && report.risks.marketFitRisk.impactAreas.length > 0 ? (
                                                    report.risks.marketFitRisk.impactAreas.map((area, idx) => (
                                                        <li key={idx}>{area}</li>
                                                    ))
                                                ) : (
                                                    <li>No impact areas specified</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Operational Risk */}
                                <div className={`border rounded-xl overflow-hidden ${operationalRiskStyle.border}`}>
                                    <div className={`p-4 ${operationalRiskStyle.bg}`}>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                {operationalRiskStyle.icon}
                                                <h4 className="font-medium text-gray-800 ml-2">Operational Risk</h4>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${operationalRiskStyle.badge}`}>
                                                {report.risks.operationalRisk.level}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-gray-700">{report.risks.operationalRisk.description}</p>

                                        <div className="mt-4">
                                            <h5 className="text-sm font-medium text-gray-700 mb-2">Impact Areas:</h5>
                                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                                                {report.risks.operationalRisk.impactAreas && report.risks.operationalRisk.impactAreas.length > 0 ? (
                                                    report.risks.operationalRisk.impactAreas.map((area, idx) => (
                                                        <li key={idx}>{area}</li>
                                                    ))
                                                ) : (
                                                    <li>No impact areas specified</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recommendations */}
                <div id="recommendations" className="mb-8 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <FiCheckCircle className="mr-2 text-indigo-600" />
                            Recommendations
                        </h2>
                        <button
                            onClick={() => toggleSection('recommendations')}
                            className="p-1 rounded-full hover:bg-gray-100"
                        >
                            {expandedSections.recommendations ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                    </div>

                    {expandedSections.recommendations && (
                        <div className="transition-all bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="font-medium text-gray-700 mb-4">Risk Mitigation Recommendations</h3>

                            {Array.isArray(report.riskMitigationRecommendations) && report.riskMitigationRecommendations.length > 0 ? (
                                <div className="space-y-3">
                                    {report.riskMitigationRecommendations.map((rec, idx) => (
                                        <div key={idx} className="flex items-start p-3 border-l-4 border-indigo-500 bg-indigo-50 rounded-r-lg">
                                            <div className="flex-shrink-0 w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                                                <span className="text-indigo-700 font-semibold text-sm">{idx + 1}</span>
                                            </div>
                                            <div>
                                                <p className="text-gray-800">
                                                    {typeof rec === 'string' ? rec : rec.text}
                                                </p>
                                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                                    <span className={`inline-block w-2 h-2 rounded-full ${typeof rec === 'string'
                                                        ? (idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-amber-500' : 'bg-green-500')
                                                        : (rec.priority === 'High' ? 'bg-red-500' :
                                                            rec.priority === 'Medium' ? 'bg-amber-500' :
                                                                'bg-green-500')
                                                        } mr-2`}></span>
                                                    <span>
                                                        {typeof rec === 'string'
                                                            ? (idx === 0 ? 'High Priority' : idx === 1 ? 'Medium Priority' : 'Standard Priority')
                                                            : rec.priority}
                                                    </span>
                                                    <span className="mx-2">•</span>
                                                    <span>Timeline: {' '}
                                                        {typeof rec === 'string'
                                                            ? (idx === 0 ? 'Immediate' : idx === 1 ? 'Short-term' : 'Medium-term')
                                                            : rec.timeline}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No recommendations specified</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Improvement Areas */}
                <div id="improvement-areas" className="mb-8 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <FiArrowRight className="mr-2 text-indigo-600" />
                            Improvement Areas
                        </h2>
                        <button
                            onClick={() => toggleSection('improvements')}
                            className="p-1 rounded-full hover:bg-gray-100"
                        >
                            {expandedSections.improvements ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                    </div>

                    {expandedSections.improvements && (
                        <div className="transition-all">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {/* Strategic Focus */}
                                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                                        <FiTarget className="text-indigo-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Strategic Focus</h3>
                                    <p className="text-gray-600">{report.improvementAreas.strategicFocus}</p>

                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Actions:</h4>
                                        <ul className="text-sm space-y-2">
                                            {report.improvementAreas.actions && report.improvementAreas.actions.strategicFocus &&
                                                report.improvementAreas.actions.strategicFocus.map((action, idx) => (
                                                    <li key={idx} className="flex items-start">
                                                        <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs mr-2 mt-0.5">{idx + 1}</span>
                                                        <span>{action}</span>
                                                    </li>
                                                ))}
                                            {(!report.improvementAreas.actions || !report.improvementAreas.actions.strategicFocus || report.improvementAreas.actions.strategicFocus.length === 0) && (
                                                <li className="text-gray-500 italic">No specific actions defined</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>

                                {/* Communication */}
                                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                                        <FiShare2 className="text-indigo-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Communication</h3>
                                    <p className="text-gray-600">{report.improvementAreas.communication}</p>

                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Actions:</h4>
                                        <ul className="text-sm space-y-2">
                                            {report.improvementAreas.actions && report.improvementAreas.actions.communication &&
                                                report.improvementAreas.actions.communication.map((action, idx) => (
                                                    <li key={idx} className="flex items-start">
                                                        <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs mr-2 mt-0.5">{idx + 1}</span>
                                                        <span>{action}</span>
                                                    </li>
                                                ))}
                                            {(!report.improvementAreas.actions || !report.improvementAreas.actions.communication || report.improvementAreas.actions.communication.length === 0) && (
                                                <li className="text-gray-500 italic">No specific actions defined</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>

                                {/* Growth Metrics */}
                                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                                        <FiBarChart2 className="text-indigo-600" />
                                    </div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Growth Metrics</h3>
                                    <p className="text-gray-600">{report.improvementAreas.growthMetrics}</p>

                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Actions:</h4>
                                        <ul className="text-sm space-y-2">
                                            {report.improvementAreas.actions && report.improvementAreas.actions.growthMetrics &&
                                                report.improvementAreas.actions.growthMetrics.map((action, idx) => (
                                                    <li key={idx} className="flex items-start">
                                                        <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs mr-2 mt-0.5">{idx + 1}</span>
                                                        <span>{action}</span>
                                                    </li>
                                                ))}
                                            {(!report.improvementAreas.actions || !report.improvementAreas.actions.growthMetrics || report.improvementAreas.actions.growthMetrics.length === 0) && (
                                                <li className="text-gray-500 italic">No specific actions defined</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Perspective Note */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm text-blue-800 mt-8">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                            <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <p><strong>Analysis Note:</strong> This analysis was generated from the <span className="font-semibold">{report.perspective}</span> perspective. Results may vary when viewed from the other party's perspective. For comprehensive due diligence, consider reviewing both perspectives.</p>
                        </div>
                    </div>
                </div>

                {/* Actions - Only show for standalone view */}
                {!isCompact && onBack && (
                    <div className="border-t border-gray-200 mt-8 pt-6">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <button
                                onClick={onBack}
                                className="flex items-center justify-center bg-white border border-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Dashboard
                            </button>
                            <div className="flex gap-3">
                                <button
                                    className="flex items-center justify-center bg-white border border-indigo-500 text-indigo-600 px-5 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Schedule Discussion
                                </button>
                                <button
                                    className="flex items-center justify-center bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
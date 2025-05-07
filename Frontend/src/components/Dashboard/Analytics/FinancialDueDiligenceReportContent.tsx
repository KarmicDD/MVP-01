import React from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiShare2, FiDollarSign, FiTrendingUp, FiAlertCircle, FiCheckCircle, FiBarChart2, FiFileText, FiInfo, FiArrowUp, FiArrowDown, FiMinus, FiActivity, FiTarget, FiGlobe, FiAward, FiShield, FiLayers, FiPieChart, FiUsers, FiBriefcase, FiCalendar, FiPackage, FiCreditCard, FiTrendingDown, FiPercent, FiHash } from 'react-icons/fi';
import { FinancialDueDiligenceReport as MatchFinancialDueDiligenceReport } from '../../../hooks/useFinancialDueDiligence';
import { FinancialDueDiligenceReport as EntityFinancialDueDiligenceReport, ChartData } from '../../../hooks/useEntityFinancialDueDiligence';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Title, Tooltip as ChartTooltip, Legend, Filler } from 'chart.js';
import { Line, Bar, Pie, Radar } from 'react-chartjs-2';
import ChartRenderer from './ChartRenderer';
import DocumentContentAnalysisSection from './DocumentContentAnalysisSection';
import { AdditionalReportProperties } from '../../../types/FinancialDD.types';
import ReportCard from './ReportCard';
import ScoreDisplay from './ScoreDisplay';



// Create a union type that can handle both report types and includes the additional properties
type FinancialDueDiligenceReport = (MatchFinancialDueDiligenceReport | EntityFinancialDueDiligenceReport) & AdditionalReportProperties;

interface FinancialDueDiligenceReportContentProps {
  report: FinancialDueDiligenceReport;
  formatDate: (date: string) => string;
  handleExportPDF: () => void;
  handleShareReport: () => void;
  isCompact?: boolean;
}

const FinancialDueDiligenceReportContent: React.FC<FinancialDueDiligenceReportContentProps> = ({
  report,
  formatDate,
  handleExportPDF,
  handleShareReport,
  // isCompact is passed from parent but not used in this component
  // Keeping the prop for future use
}) => {
  // Add console logging to help debug the data structure
  console.log('Report data in FinancialDueDiligenceReportContent:', report);

  // Log each section separately to help with debugging
  console.log('totalCompanyScore:', report.totalCompanyScore);
  console.log('investmentDecision:', report.investmentDecision);
  console.log('compatibilityAnalysis:', report.compatibilityAnalysis);

  // Ensure the data structure is properly handled with robust defaults
  const totalCompanyScore = report.totalCompanyScore ? {
    score: report.totalCompanyScore.score || 0,
    rating: report.totalCompanyScore.rating || 'Not Available',
    description: report.totalCompanyScore.description || 'No description available'
  } : {
    score: 0,
    rating: 'Not Available',
    description: 'Total company score data is not available.'
  };

  const investmentDecision = report.investmentDecision ? {
    recommendation: report.investmentDecision.recommendation || 'Not Available',
    successProbability: report.investmentDecision.successProbability || 0,
    justification: report.investmentDecision.justification || 'No justification available',
    keyConsiderations: Array.isArray(report.investmentDecision.keyConsiderations) ?
      report.investmentDecision.keyConsiderations : ['No considerations available'],
    suggestedTerms: Array.isArray(report.investmentDecision.suggestedTerms) ?
      report.investmentDecision.suggestedTerms : ['No terms available'],
    chartData: report.investmentDecision.chartData || null
  } : {
    recommendation: 'Not Available',
    successProbability: 0,
    justification: 'Investment decision data is not available.',
    keyConsiderations: ['No data available'],
    suggestedTerms: ['No data available'],
    chartData: null
  };

  const compatibilityAnalysis = report.compatibilityAnalysis ? {
    overallMatch: report.compatibilityAnalysis.overallMatch || 'Not Available',
    overallScore: report.compatibilityAnalysis.overallScore || 0,
    dimensions: Array.isArray(report.compatibilityAnalysis.dimensions) ?
      report.compatibilityAnalysis.dimensions : [],
    keyInvestmentStrengths: Array.isArray(report.compatibilityAnalysis.keyInvestmentStrengths) ?
      report.compatibilityAnalysis.keyInvestmentStrengths : ['No strengths data available'],
    keyInvestmentChallenges: Array.isArray(report.compatibilityAnalysis.keyInvestmentChallenges) ?
      report.compatibilityAnalysis.keyInvestmentChallenges : ['No challenges data available'],
    investmentRecommendations: Array.isArray(report.compatibilityAnalysis.investmentRecommendations) ?
      report.compatibilityAnalysis.investmentRecommendations : ['No recommendations data available'],
    radarChartData: report.compatibilityAnalysis.radarChartData || null
  } : {
    overallMatch: 'Not Available',
    overallScore: 0,
    dimensions: [
      {
        name: 'Data Not Available',
        score: 0,
        description: 'No dimension data available',
        status: 'moderate' as 'moderate'
      }
    ],
    keyInvestmentStrengths: ['No data available'],
    keyInvestmentChallenges: ['No data available'],
    investmentRecommendations: ['No data available'],
    radarChartData: null
  };

  // Log the processed data
  console.log('Processed totalCompanyScore:', totalCompanyScore);
  console.log('Processed investmentDecision:', investmentDecision);
  console.log('Processed compatibilityAnalysis:', compatibilityAnalysis);
  // Helper function to get status color
  const getStatusColor = (status?: string) => {
    // Handle undefined or null status
    if (!status) return 'bg-gray-100 text-gray-800';

    switch (status.toLowerCase()) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'non-compliant':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingBgColor = (rating?: string) => {
    // Handle undefined or null rating
    if (!rating) return 'bg-slate-600';

    const ratingLower = rating.toLowerCase();
    if (ratingLower.includes('excellent')) return 'bg-emerald-600';
    if (ratingLower.includes('good')) return 'bg-blue-600';
    if (ratingLower.includes('fair')) return 'bg-amber-600';
    if (ratingLower.includes('poor')) return 'bg-orange-600';
    if (ratingLower.includes('critical')) return 'bg-red-600';
    // Default color for any other rating
    return 'bg-slate-600';
  };

  // Helper function to get rating color for text - updated with new color scheme
  const getRatingTextColor = (rating?: string) => {
    // Handle undefined or null rating
    if (!rating) return 'text-slate-300';

    const ratingLower = rating.toLowerCase();
    if (ratingLower.includes('excellent')) return 'text-emerald-500';
    if (ratingLower.includes('good')) return 'text-blue-500';
    if (ratingLower.includes('fair')) return 'text-amber-500';
    if (ratingLower.includes('poor')) return 'text-orange-500';
    if (ratingLower.includes('critical')) return 'text-red-500';
    // Default color for any other rating
    return 'text-slate-500';
  };

  // Helper function to get rating badge color - updated with new color scheme
  const getRatingBadgeColor = (rating?: string) => {
    // Handle undefined or null rating
    if (!rating) return 'bg-slate-500 text-white';

    const ratingLower = rating.toLowerCase();
    if (ratingLower.includes('excellent')) return 'bg-emerald-500 text-white';
    if (ratingLower.includes('good')) return 'bg-blue-500 text-white';
    if (ratingLower.includes('fair')) return 'bg-amber-500 text-white';
    if (ratingLower.includes('poor')) return 'bg-orange-500 text-white';
    if (ratingLower.includes('critical')) return 'bg-red-500 text-white';
    // Default color for any other rating
    return 'bg-slate-500 text-white';
  };

  // Helper function to get risk level color - updated with new color scheme
  const getRiskLevelColor = (level?: string) => {
    // Handle undefined or null level
    if (!level) return 'bg-slate-100 text-slate-800';

    switch (level.toLowerCase()) {
      case 'low':
        return 'bg-emerald-100 text-emerald-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  // Helper function to get trend icon - updated with new color scheme
  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'increasing':
      case 'improving':
        return <FiArrowUp className="text-emerald-500" />;
      case 'decreasing':
      case 'deteriorating':
        return <FiArrowDown className="text-red-500" />;
      case 'stable':
        return <FiMinus className="text-slate-500" />;
      default:
        return null;
    }
  };

  // Register Chart.js components
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    ChartTooltip,
    Legend,
    Filler
  );

  // Enhanced chart colors with more professional palette - matching ChartRenderer
  const CHART_COLORS = {
    primary: '#2563EB',     // Bright blue - primary brand color
    secondary: '#4F46E5',   // Indigo - secondary brand color
    tertiary: '#8B5CF6',    // Purple - tertiary accent
    success: '#10B981',     // Green - success states (brighter)
    warning: '#F59E0B',     // Amber - warning states (brighter)
    danger: '#EF4444',      // Red - error states (brighter)
    neutral: '#6B7280',     // Gray - neutral text
    background: '#F9FAFB',  // Light gray - background
    accent1: '#06B6D4',     // Cyan - accent (brighter)
    accent2: '#8B5CF6',     // Violet - accent (brighter)
    accent3: '#0EA5E9',     // Sky blue - accent (brighter)
    accent4: '#14B8A6',     // Teal - accent
    accent5: '#F97316',     // Orange - accent
    accent6: '#EC4899',     // Pink - accent
  };

  // Enhanced pie chart colors - more vibrant and distinct - matching ChartRenderer
  const PIE_COLORS = [
    CHART_COLORS.primary,    // Blue
    CHART_COLORS.success,    // Green
    CHART_COLORS.warning,    // Amber
    CHART_COLORS.danger,     // Red
    CHART_COLORS.accent1,    // Cyan
    CHART_COLORS.accent2,    // Violet
    CHART_COLORS.accent4,    // Teal
    CHART_COLORS.accent5,    // Orange
    CHART_COLORS.accent6     // Pink
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Show notification for old data - enhanced with better styling */}
      {report.isOldData && (
        <motion.div
          className="bg-amber-50 border-l-4 border-amber-500 p-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-800">
                {report.message || 'Daily request limit reached. Showing previously generated data.'}
                {report.generatedDate && (
                  <span className="ml-1 font-medium">
                    (Generated on {formatDate(report.generatedDate)})
                  </span>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Show warning for incomplete financial data extraction - enhanced with better styling */}
      {(report as any).reportCalculated === false && (
        <motion.div
          className="bg-amber-50 border-l-4 border-amber-500 p-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiAlertCircle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-800">
                <span className="font-medium">Limited Analysis Available:</span> Our system was unable to extract complete financial data from the provided documents. The analysis below is based on limited information and may not be comprehensive.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-8 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-blue-700 mb-2">Financial Due Diligence Report</h2>
            <div className="flex items-center">
              <div className="h-1 w-16 bg-blue-500 rounded mr-3"></div>
              <p className="text-gray-600 font-medium">
                Generated on {formatDate(report.generatedDate)}
              </p>
            </div>
          </motion.div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <motion.button
              className="px-4 py-2.5 bg-white text-blue-700 hover:bg-gray-50 rounded-lg flex items-center shadow-sm border border-gray-200 font-medium transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShareReport}
              title="Share this report"
            >
              <FiShare2 className="mr-2" />
              Share
            </motion.button>
            <motion.button
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center shadow-sm font-medium transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportPDF}
              title="Download as PDF"
            >
              <FiDownload className="mr-2" />
              Export PDF
            </motion.button>
          </div>
        </div>

        {/* Enhanced Report summary badges */}
        <div className="flex flex-wrap gap-3 mt-6">
          {(report as any).reportCalculated && (
            <motion.span
              className="bg-emerald-100 text-emerald-800 text-xs px-4 py-1.5 rounded-full font-medium flex items-center shadow-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <FiCheckCircle className="mr-1.5" /> Complete Analysis
            </motion.span>
          )}
          {report.totalCompanyScore && (
            <motion.span
              className="bg-blue-100 text-blue-800 text-xs px-4 py-1.5 rounded-full font-medium flex items-center shadow-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <FiAward className="mr-1.5" /> Company Score: {report.totalCompanyScore.score}
            </motion.span>
          )}
          {report.documentAnalysis?.availableDocuments && (
            <motion.span
              className="bg-cyan-100 text-cyan-800 text-xs px-4 py-1.5 rounded-full font-medium flex items-center shadow-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <FiFileText className="mr-1.5" /> {report.documentAnalysis.availableDocuments.length} Documents Analyzed
            </motion.span>
          )}
          {report.auditFindings?.complianceScore && (
            <motion.span
              className="bg-indigo-100 text-indigo-800 text-xs px-4 py-1.5 rounded-full font-medium flex items-center shadow-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <FiTarget className="mr-1.5" /> Compliance Score: {report.auditFindings.complianceScore}
            </motion.span>
          )}
        </div>
      </div>

      {/* Main content with enhanced spacing and background */}
      <div className="p-8 space-y-10 bg-white">
        {/* Executive Summary - moved to top for better flow */}
        {report.executiveSummary && (
          <ReportCard
            title={report.executiveSummary?.headline || "Executive Summary"}
            icon={<FiActivity />}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
          >
            <p className="text-gray-700 leading-relaxed mb-5">{report.executiveSummary?.summary || "No summary available."}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {report.executiveSummary?.keyFindings && report.executiveSummary.keyFindings.length > 0 && (
                <motion.div
                  className="bg-white p-5 rounded-lg border border-indigo-100 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <h4 className="font-semibold text-indigo-800 mb-3 flex items-center">
                    <FiInfo className="mr-2 text-indigo-600" />
                    Key Findings
                  </h4>
                  <ul className="space-y-2">
                    {report.executiveSummary.keyFindings.map((finding, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                      >
                        <span className="inline-flex items-center justify-center bg-indigo-100 text-indigo-800 w-5 h-5 rounded-full text-xs font-bold mr-2 mt-0.5">{index + 1}</span>
                        <span className="text-gray-700">{finding}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {report.executiveSummary?.recommendedActions && report.executiveSummary.recommendedActions.length > 0 && (
                <motion.div
                  className="bg-white p-5 rounded-lg border border-green-100 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <FiCheckCircle className="mr-2 text-green-600" />
                    Recommended Actions
                  </h4>
                  <ul className="space-y-2">
                    {report.executiveSummary.recommendedActions.map((action, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                      >
                        <span className="inline-flex items-center justify-center bg-green-100 text-green-800 w-5 h-5 rounded-full text-xs font-bold mr-2 mt-0.5">{index + 1}</span>
                        <span className="text-gray-700">{action}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>

            {/* Due Diligence Summary and Audit Opinion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Due Diligence Summary (if available) */}
              {(report.executiveSummary as any)?.dueDiligenceSummary && (
                <motion.div
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <FiDollarSign className="mr-2 text-blue-600" />
                    Investment Worthiness Assessment
                  </h4>
                  <div className="flex items-center mb-3">
                    <span className="text-sm font-medium text-gray-700 mr-2">Investment Worthiness:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${(report.executiveSummary as any).dueDiligenceSummary.investmentWorthiness === 'high' ? 'bg-green-100 text-green-800' :
                      (report.executiveSummary as any).dueDiligenceSummary.investmentWorthiness === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {(report.executiveSummary as any).dueDiligenceSummary.investmentWorthiness}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{(report.executiveSummary as any).dueDiligenceSummary.statement}</p>

                  <div className="grid grid-cols-1 gap-3">
                    {(report.executiveSummary as any).dueDiligenceSummary.keyStrengths && (report.executiveSummary as any).dueDiligenceSummary.keyStrengths.length > 0 && (
                      <div>
                        <h5 className="font-medium text-green-700 mb-1">Key Strengths:</h5>
                        <ul className="list-disc pl-5 space-y-1 bg-white p-2 rounded border border-green-100">
                          {(report.executiveSummary as any).dueDiligenceSummary.keyStrengths.map((strength: string, index: number) => (
                            <li key={index} className="text-gray-600 text-sm">{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(report.executiveSummary as any).dueDiligenceSummary.keyRisks && (report.executiveSummary as any).dueDiligenceSummary.keyRisks.length > 0 && (
                      <div>
                        <h5 className="font-medium text-red-700 mb-1">Key Risks:</h5>
                        <ul className="list-disc pl-5 space-y-1 bg-white p-2 rounded border border-red-100">
                          {(report.executiveSummary as any).dueDiligenceSummary.keyRisks.map((risk: string, index: number) => (
                            <li key={index} className="text-gray-600 text-sm">{risk}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Audit Opinion (if available) */}
              {(report.executiveSummary as any)?.auditOpinion && (
                <motion.div
                  className={`p-5 rounded-lg shadow-sm ${(report.executiveSummary as any).auditOpinion.type === 'unqualified' ? 'bg-green-50 border border-green-100' :
                    (report.executiveSummary as any).auditOpinion.type === 'qualified' ? 'bg-yellow-50 border border-yellow-100' :
                      (report.executiveSummary as any).auditOpinion.type === 'adverse' ? 'bg-red-50 border border-red-100' :
                        'bg-gray-50 border border-gray-100'
                    }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FiShield className="mr-2 text-gray-600" />
                    Audit Opinion
                  </h4>
                  <p className="text-gray-700 mb-3">{(report.executiveSummary as any).auditOpinion.statement}</p>

                  {(report.executiveSummary as any).auditOpinion.qualifications && (report.executiveSummary as any).auditOpinion.qualifications.length > 0 && (
                    <div className="mt-2">
                      <h5 className="font-medium text-gray-700 mb-1">Qualifications:</h5>
                      <ul className="list-disc pl-5 space-y-1 bg-white p-2 rounded border border-gray-200">
                        {(report.executiveSummary as any).auditOpinion.qualifications.map((qualification: string, index: number) => (
                          <li key={index} className="text-gray-600 text-sm">{qualification}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-3">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${(report.executiveSummary as any).auditOpinion.type === 'unqualified' ? 'bg-green-100 text-green-800' :
                      (report.executiveSummary as any).auditOpinion.type === 'qualified' ? 'bg-yellow-100 text-yellow-800' :
                        (report.executiveSummary as any).auditOpinion.type === 'adverse' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {(report.executiveSummary as any).auditOpinion.type} opinion
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </ReportCard>
        )}

        {/* Total Company Score Section - enhanced with ScoreDisplay component */}
        {totalCompanyScore && (
          <ReportCard
            title="Total Company Score"
            icon={<FiAward />}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 flex justify-center">
                <ScoreDisplay
                  score={totalCompanyScore.score}
                  rating={totalCompanyScore.rating}
                  size="large"
                  label="Overall Score"
                />
              </div>
              <div className="md:col-span-2">
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 rounded-xl h-full flex flex-col justify-center border border-gray-200 shadow-sm">
                  <h4 className="text-lg font-semibold mb-3 text-gray-800">Assessment</h4>
                  <p className="text-gray-700 leading-relaxed">{totalCompanyScore.description}</p>
                </div>
              </div>
            </div>
          </ReportCard>
        )}

        {/* Investment Decision Section - enhanced with ReportCard component */}
        {investmentDecision && (
          <ReportCard
            title="Investment Decision"
            icon={<FiTarget />}
            iconBgColor="bg-indigo-100"
            iconColor="text-indigo-600"
            delay={0.1}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center mb-4">
                    <span className="text-lg font-semibold mr-3 text-gray-800 mb-2 sm:mb-0">Recommendation:</span>
                    <motion.span
                      className={`px-4 py-1.5 rounded-full text-sm font-medium inline-flex items-center ${investmentDecision.recommendation === 'Invest' ? 'bg-emerald-100 text-emerald-800' :
                        investmentDecision.recommendation === 'Consider with Conditions' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {investmentDecision.recommendation === 'Invest' ? <FiCheckCircle className="mr-1.5" /> :
                        investmentDecision.recommendation === 'Consider with Conditions' ? <FiAlertCircle className="mr-1.5" /> :
                          <FiInfo className="mr-1.5" />}
                      {investmentDecision.recommendation}
                    </motion.span>
                  </div>
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-100 shadow-sm">
                    <p className="text-gray-700 leading-relaxed">{investmentDecision.justification}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {investmentDecision.keyConsiderations && investmentDecision.keyConsiderations.length > 0 && (
                    <motion.div
                      className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      <h4 className="font-semibold mb-3 text-gray-800 flex items-center">
                        <FiInfo className="mr-2 text-indigo-500" /> Key Considerations
                      </h4>
                      <ul className="space-y-2">
                        {investmentDecision.keyConsiderations.map((consideration, index) => (
                          <motion.li
                            key={index}
                            className="text-gray-700 flex items-start"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                          >
                            <span className="text-indigo-500 mr-2 mt-1">•</span>
                            <span>{consideration}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {investmentDecision.suggestedTerms && investmentDecision.suggestedTerms.length > 0 && (
                    <motion.div
                      className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      <h4 className="font-semibold mb-3 text-gray-800 flex items-center">
                        <FiFileText className="mr-2 text-indigo-500" /> Suggested Terms
                      </h4>
                      <ul className="space-y-2">
                        {investmentDecision.suggestedTerms.map((term, index) => (
                          <motion.li
                            key={index}
                            className="text-gray-700 flex items-start"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                          >
                            <span className="text-indigo-500 mr-2 mt-1">•</span>
                            <span>{term}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="md:col-span-1 flex flex-col items-center justify-center">
                {investmentDecision.chartData ? (
                  <motion.div
                    className="h-64 w-64"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <ChartRenderer chartData={investmentDecision.chartData} height={256} />
                  </motion.div>
                ) : (
                  <motion.div
                    className="w-full h-full flex flex-col items-center justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="relative w-72 h-72">
                      {/* Enhanced background with subtle gradient */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 shadow-inner"></div>

                      {/* Success probability gauge */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                        <defs>
                          {/* Enhanced success gradient with more vibrant colors */}
                          <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10B981" />
                            <stop offset="50%" stopColor="#0EA5E9" />
                            <stop offset="100%" stopColor="#3B82F6" />
                          </linearGradient>

                          {/* Risk factor gradient */}
                          <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#F87171" />
                            <stop offset="100%" stopColor="#EF4444" />
                          </linearGradient>

                          {/* Glow filter for success ring */}
                          <filter id="successGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                          </filter>

                          {/* Glow filter for risk ring */}
                          <filter id="riskGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="1" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                          </filter>
                        </defs>

                        {/* Outer track with subtle shadow */}
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="8"
                          strokeLinecap="round"
                        />

                        {/* Subtle tick marks for outer track */}
                        {[...Array(10)].map((_, i) => {
                          const angle = (i * 36) * (Math.PI / 180);
                          const x1 = 50 + 45 * Math.cos(angle);
                          const y1 = 50 + 45 * Math.sin(angle);
                          const x2 = 50 + 42 * Math.cos(angle);
                          const y2 = 50 + 42 * Math.sin(angle);
                          return (
                            <line
                              key={`tick-${i}`}
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke="#D1D5DB"
                              strokeWidth="1"
                            />
                          );
                        })}

                        {/* Progress - Success Probability with enhanced styling */}
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="url(#successGradient)"
                          strokeWidth="8"
                          strokeLinecap="round"
                          filter="url(#successGlow)"
                          strokeDasharray={`${2 * Math.PI * 45}`}
                          strokeDashoffset={`${2 * Math.PI * 45 * (1 - investmentDecision.successProbability / 100)}`}
                          initial={{ strokeDashoffset: `${2 * Math.PI * 45}` }}
                          animate={{ strokeDashoffset: `${2 * Math.PI * 45 * (1 - investmentDecision.successProbability / 100)}` }}
                          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                        />

                        {/* Inner track with subtle shadow */}
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          fill="none"
                          stroke="#F3F4F6"
                          strokeWidth="6"
                          strokeLinecap="round"
                        />

                        {/* Subtle tick marks for inner track */}
                        {[...Array(5)].map((_, i) => {
                          const angle = (i * 72) * (Math.PI / 180);
                          const x1 = 50 + 35 * Math.cos(angle);
                          const y1 = 50 + 35 * Math.sin(angle);
                          const x2 = 50 + 33 * Math.cos(angle);
                          const y2 = 50 + 33 * Math.sin(angle);
                          return (
                            <line
                              key={`inner-tick-${i}`}
                              x1={x1}
                              y1={y1}
                              x2={x2}
                              y2={y2}
                              stroke="#D1D5DB"
                              strokeWidth="1"
                            />
                          );
                        })}

                        {/* Risk factor indicator with enhanced styling */}
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="35"
                          fill="none"
                          stroke="url(#riskGradient)"
                          strokeWidth="6"
                          strokeLinecap="round"
                          filter="url(#riskGlow)"
                          strokeDasharray={`${2 * Math.PI * 35}`}
                          strokeDashoffset={`${2 * Math.PI * 35 * (1 - (100 - investmentDecision.successProbability) / 100)}`}
                          initial={{ strokeDashoffset: `${2 * Math.PI * 35}` }}
                          animate={{ strokeDashoffset: `${2 * Math.PI * 35 * (1 - (100 - investmentDecision.successProbability) / 100)}` }}
                          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                        />

                        {/* Percentage markers */}
                        {[0, 25, 50, 75, 100].map((percent) => {
                          const angle = (percent / 100 * 360 - 90) * (Math.PI / 180);
                          const x = 50 + 52 * Math.cos(angle);
                          const y = 50 + 52 * Math.sin(angle);
                          return (
                            <text
                              key={`percent-${percent}`}
                              x={x}
                              y={y}
                              fill="#6B7280"
                              fontSize="7"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontWeight="bold"
                            >
                              {percent}%
                            </text>
                          );
                        })}
                      </svg>

                      {/* Enhanced center content with additional information */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.div
                          className="flex flex-col items-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.6 }}
                        >
                          <motion.span
                            className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.7, type: "spring" }}
                          >
                            {investmentDecision.successProbability}%
                          </motion.span>
                          <motion.span
                            className="text-sm font-medium text-gray-500 mt-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.9 }}
                          >
                            Success Probability
                          </motion.span>
                        </motion.div>
                      </div>
                    </div>

                    {/* Enhanced Legend with better styling */}
                    <div className="flex flex-col items-center mt-4 space-y-3">
                      <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 via-blue-500 to-indigo-500 mr-2"></div>
                        <motion.span
                          className="text-sm font-medium text-gray-700"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.8 }}
                        >
                          Success Probability: {investmentDecision.successProbability}%
                        </motion.span>
                      </div>
                      <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-400 to-red-600 mr-2"></div>
                        <motion.span
                          className="text-sm font-medium text-gray-700"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.9 }}
                        >
                          Risk Factor: {100 - investmentDecision.successProbability}%
                        </motion.span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </ReportCard>
        )}

        {/* Investment Potential Analysis Section - enhanced with ReportCard component */}
        {compatibilityAnalysis && (
          <ReportCard
            title="Investment Potential Analysis"
            icon={<FiUsers />}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            delay={0.2}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <motion.div
                  className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-100 shadow-sm text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Investment Potential</h4>
                  <motion.div
                    className={`text-5xl font-bold mb-3 ${compatibilityAnalysis.overallMatch === 'Strong Match' ? 'text-emerald-600' :
                      compatibilityAnalysis.overallMatch === 'Moderate Match' ? 'text-amber-600' :
                        'text-red-600'
                      }`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4, type: 'spring' }}
                  >
                    {compatibilityAnalysis.overallScore}%
                  </motion.div>
                  <motion.div
                    className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium shadow-sm ${compatibilityAnalysis.overallMatch === 'Strong Match' ? 'bg-emerald-100 text-emerald-800' :
                      compatibilityAnalysis.overallMatch === 'Moderate Match' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    {compatibilityAnalysis.overallMatch}
                  </motion.div>
                </motion.div>

                <div className="mt-6 grid grid-cols-1 gap-5">
                  {compatibilityAnalysis.keyInvestmentStrengths && compatibilityAnalysis.keyInvestmentStrengths.length > 0 && (
                    <motion.div
                      className="bg-white p-5 rounded-lg border border-green-100 shadow-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                    >
                      <h4 className="font-semibold mb-3 text-gray-800 flex items-center">
                        <FiTrendingUp className="mr-2 text-green-500" /> Key Investment Strengths
                      </h4>
                      <ul className="space-y-2">
                        {compatibilityAnalysis.keyInvestmentStrengths.map((area, index) => (
                          <motion.li
                            key={index}
                            className="text-gray-700 flex items-start"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                          >
                            <span className="text-green-500 mr-2 mt-1">•</span>
                            <span>{area}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {compatibilityAnalysis.keyInvestmentChallenges && compatibilityAnalysis.keyInvestmentChallenges.length > 0 && (
                    <motion.div
                      className="bg-white p-5 rounded-lg border border-red-100 shadow-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                    >
                      <h4 className="font-semibold mb-3 text-gray-800 flex items-center">
                        <FiAlertCircle className="mr-2 text-red-500" /> Key Investment Challenges
                      </h4>
                      <ul className="space-y-2">
                        {compatibilityAnalysis.keyInvestmentChallenges.map((area, index) => (
                          <motion.li
                            key={index}
                            className="text-gray-700 flex items-start"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                          >
                            <span className="text-red-500 mr-2 mt-1">•</span>
                            <span>{area}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                {compatibilityAnalysis.radarChartData ? (
                  <motion.div
                    className="h-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <h4 className="font-semibold mb-4 text-gray-800 text-center">Investment Potential Score</h4>
                    <ChartRenderer
                      chartData={compatibilityAnalysis.radarChartData}
                      height={300}
                      className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <h4 className="font-semibold mb-4 text-gray-800 text-center">Investment Dimensions</h4>
                    <div className="space-y-4">
                      {compatibilityAnalysis.dimensions.map((dimension, index) => (
                        <motion.div
                          key={index}
                          className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200 shadow-sm"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: 0.2 + (index * 0.1) }}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-800">{dimension.name}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${dimension.status === 'excellent' ? 'bg-green-100 text-green-800' :
                              dimension.status === 'good' ? 'bg-blue-100 text-blue-800' :
                                dimension.status === 'moderate' ? 'bg-amber-100 text-amber-800' :
                                  'bg-red-100 text-red-800'
                              }`}>
                              {dimension.score}/100
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                            <motion.div
                              className="h-3 rounded-full"
                              style={{
                                width: '0%',
                                backgroundColor: dimension.status === 'excellent' ? CHART_COLORS.success :
                                  dimension.status === 'good' ? CHART_COLORS.primary :
                                    dimension.status === 'moderate' ? CHART_COLORS.warning :
                                      CHART_COLORS.danger
                              }}
                              animate={{ width: `${dimension.score}%` }}
                              transition={{ duration: 1, delay: 0.3 + (index * 0.1) }}
                            ></motion.div>
                          </div>
                          <p className="mt-2 text-sm text-gray-600">{dimension.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {compatibilityAnalysis.investmentRecommendations && compatibilityAnalysis.investmentRecommendations.length > 0 && (
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <h4 className="font-semibold mb-4 text-gray-800 flex items-center">
                  <FiTarget className="mr-2 text-purple-600" /> Investment Recommendations
                </h4>
                <div className="space-y-3">
                  {compatibilityAnalysis.investmentRecommendations.map((recommendation, index) => (
                    <motion.div
                      key={index}
                      className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-100 shadow-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + (index * 0.1) }}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm">
                            {index + 1}
                          </span>
                        </div>
                        <div className="ml-3">
                          <p className="text-gray-700">{recommendation}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </ReportCard>
        )}

        {/* Scoring Breakdown Section - updated with new color scheme */}
        {report.scoringBreakdown && (
          <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6 mb-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-600 p-2 rounded-lg mr-3">
                <FiBarChart2 className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-bold text-blue-900">Scoring Breakdown</h3>
            </div>

            <p className="text-gray-700 mb-4">{report.scoringBreakdown.overview}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                {report.scoringBreakdown.barChartData ? (
                  <ChartRenderer
                    chartData={report.scoringBreakdown.barChartData}
                    height={300}
                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
                  />
                ) : (
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="font-semibold text-gray-800 mb-3">Category Scores</h4>
                    <div className="space-y-3">
                      {report.scoringBreakdown.categories.map((category, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-gray-700">{category.name}</span>
                            <span className="text-sm font-semibold">{category.score}/100</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="h-2.5 rounded-full"
                              style={{
                                width: `${category.score}%`,
                                backgroundColor: category.status === 'excellent' ? CHART_COLORS.success :
                                  category.status === 'good' ? CHART_COLORS.primary :
                                    category.status === 'moderate' ? CHART_COLORS.warning :
                                      CHART_COLORS.danger
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.scoringBreakdown.categories.map((category, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${category.status === 'excellent' ? 'border-emerald-200 bg-emerald-50' :
                      category.status === 'good' ? 'border-blue-200 bg-blue-50' :
                        category.status === 'moderate' ? 'border-amber-200 bg-amber-50' :
                          'border-red-200 bg-red-50'
                      }`}>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-800">{category.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${category.status === 'excellent' ? 'bg-emerald-100 text-emerald-800' :
                          category.status === 'good' ? 'bg-blue-100 text-blue-800' :
                            category.status === 'moderate' ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                          {category.score}/100
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                      {category.keyPoints && category.keyPoints.length > 0 && (
                        <div>
                          <h5 className="text-xs font-medium text-gray-700 mb-1">Key Points:</h5>
                          <ul className="list-disc pl-5 space-y-1">
                            {category.keyPoints.map((point, idx) => (
                              <li key={idx} className="text-gray-600 text-xs">{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Financial Metrics Section - moved up for better flow */}

        {/* Key Financial Metrics */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <div className="bg-blue-600 p-2 rounded-lg mr-3">
                <FiDollarSign className="text-white" />
              </div>
              Key Financial Metrics
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Display key metrics from executive summary if available */}
            {report.executiveSummary?.keyMetrics && report.executiveSummary.keyMetrics.length > 0 ? (
              report.executiveSummary.keyMetrics.map((metric, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-5 rounded-xl shadow-md border-l-4 hover:shadow-lg transition-all duration-200"
                  style={{
                    borderLeftColor: metric.status === 'good' ? CHART_COLORS.success :
                      metric.status === 'warning' ? CHART_COLORS.warning :
                        CHART_COLORS.danger
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">{metric.name}</span>
                    <div className="flex items-center">
                      {metric.trend && getTrendIcon(metric.trend)}
                      <span className={`ml-1 text-xs font-medium ${(metric.trend === 'increasing' && metric.status === 'good') ||
                        (metric.trend === 'decreasing' && metric.status === 'critical') ?
                        'text-green-600' :
                        (metric.trend === 'decreasing' && metric.status === 'good') ||
                          (metric.trend === 'increasing' && metric.status === 'critical') ?
                          'text-red-600' : 'text-gray-500'
                        }`}>
                        {metric.percentChange}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-baseline">
                    <div className={`text-2xl font-bold ${metric.status === 'good' ? 'text-green-600' :
                      metric.status === 'warning' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                      {metric.value}
                    </div>

                    {metric.industryValue && (
                      <div className="ml-2 text-xs text-gray-500">
                        Industry: {metric.industryValue}
                        {metric.industryComparison && (
                          <span className={`ml-1 ${metric.industryComparison === 'above_average' ? 'text-green-600' :
                            metric.industryComparison === 'below_average' ? 'text-red-600' :
                              'text-gray-600'
                            }`}>
                            ({metric.industryComparison.replace('_', ' ')})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {metric.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{metric.description}</p>
                  )}

                  {/* Render chart if available */}
                  {(metric as any).chartData && (
                    <div className="mt-3 mb-3">
                      <ChartRenderer chartData={(metric as any).chartData} height={120} />
                    </div>
                  )}

                  <div className="mt-3 flex justify-between items-center">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${metric.status === 'good' ? 'bg-green-100 text-green-800' :
                      metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {metric.status.toUpperCase()}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : report.financialAnalysis?.metrics && report.financialAnalysis.metrics.length > 0 ? (
              // Fall back to financial analysis metrics if executive summary metrics aren't available
              report.financialAnalysis.metrics.map((metric, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-5 rounded-xl shadow-md border-l-4 hover:shadow-lg transition-all duration-200"
                  style={{
                    borderLeftColor: metric.status === 'good' ? CHART_COLORS.success :
                      metric.status === 'warning' ? CHART_COLORS.warning :
                        CHART_COLORS.danger
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">{metric.name}</span>
                    <div className="flex items-center">
                      {metric.trend && getTrendIcon(metric.trend)}
                      <span className={`ml-1 text-xs font-medium ${(metric.trend === 'increasing' && metric.status === 'good') ||
                        (metric.trend === 'decreasing' && metric.status === 'critical') ?
                        'text-green-600' :
                        (metric.trend === 'decreasing' && metric.status === 'good') ||
                          (metric.trend === 'increasing' && metric.status === 'critical') ?
                          'text-red-600' : 'text-gray-500'
                        }`}>
                        {metric.percentChange}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-baseline">
                    <div className={`text-2xl font-bold ${metric.status === 'good' ? 'text-green-600' :
                      metric.status === 'warning' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                      {metric.value}
                    </div>

                    {metric.industryValue && (
                      <div className="ml-2 text-xs text-gray-500">
                        Industry: {metric.industryValue}
                        {metric.industryComparison && (
                          <span className={`ml-1 ${metric.industryComparison === 'above_average' ? 'text-green-600' :
                            metric.industryComparison === 'below_average' ? 'text-red-600' :
                              'text-gray-600'
                            }`}>
                            ({metric.industryComparison.replace('_', ' ')})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {metric.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{metric.description}</p>
                  )}

                  <div className="mt-3 flex justify-between items-center">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${metric.status === 'good' ? 'bg-green-100 text-green-800' :
                      metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {metric.status.toUpperCase()}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              // Fall back to legacy metrics if neither are available
              (report as any).metrics && (report as any).metrics.map((metric: any, index: number) => (
                <motion.div
                  key={index}
                  className="bg-white p-5 rounded-xl shadow-md border-l-4 hover:shadow-lg transition-all duration-200"
                  style={{
                    borderLeftColor: metric.status === 'good' ? CHART_COLORS.success :
                      metric.status === 'warning' ? CHART_COLORS.warning :
                        CHART_COLORS.danger
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">{metric.name}</span>
                  </div>

                  <div className={`text-2xl font-bold ${metric.status === 'good' ? 'text-green-600' :
                    metric.status === 'warning' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                    {metric.value}
                  </div>

                  {metric.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{metric.description}</p>
                  )}

                  <div className="mt-3 flex justify-between items-center">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${metric.status === 'good' ? 'bg-green-100 text-green-800' :
                      metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {metric.status.toUpperCase()}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Financial Health Score */}
        {(report.financialAnalysis as any)?.financialHealthScore && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
            <div className="flex items-center mb-5">
              <div className="bg-blue-600 p-2 rounded-lg mr-3">
                <FiAward className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Financial Health Score</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-sm text-center">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Overall Score</h4>
                  <div className={`text-5xl font-bold mb-2 ${getRatingTextColor((report.financialAnalysis as any).financialHealthScore.rating)}`}>
                    {(report.financialAnalysis as any).financialHealthScore.score}
                  </div>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRatingBadgeColor((report.financialAnalysis as any).financialHealthScore.rating)}`}>
                    {(report.financialAnalysis as any).financialHealthScore.rating}
                  </div>
                  <p className="mt-4 text-gray-600 text-sm">
                    {(report.financialAnalysis as any).financialHealthScore.description}
                  </p>
                </div>
              </div>

              <div className="md:col-span-2">
                {(report.financialAnalysis as any).financialHealthScore.chartData ? (
                  <ChartRenderer
                    chartData={(report.financialAnalysis as any).financialHealthScore.chartData}
                    height={250}
                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
                  />
                ) : (
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="font-semibold text-gray-800 mb-3">Score Components</h4>
                    <div className="space-y-3">
                      {(report.financialAnalysis as any).financialHealthScore.components.map((component: any, index: number) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-gray-700">{component.category}</span>
                            <span className="text-sm font-semibold">{component.score}/100</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="h-2.5 rounded-full"
                              style={{
                                width: `${component.score}%`,
                                backgroundColor: component.score >= 80 ? '#10B981' :
                                  component.score >= 60 ? '#3B82F6' :
                                    component.score >= 40 ? '#F59E0B' :
                                      component.score >= 20 ? '#F97316' : '#EF4444'
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Weight: {(component.weight * 100).toFixed(0)}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Financial Trends */}
        {report.financialAnalysis?.trends && report.financialAnalysis.trends.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <FiTrendingUp className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Financial Trends</h3>
              </div>
              <div className="text-sm text-gray-500">
                {report.financialAnalysis.trends.length} trend{report.financialAnalysis.trends.length !== 1 ? 's' : ''} available
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.financialAnalysis.trends.map((trend, index) => (
                <motion.div
                  key={index}
                  className="rounded-lg border p-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    borderColor: trend.impact === 'positive' ? CHART_COLORS.success :
                      trend.impact === 'negative' ? CHART_COLORS.danger : CHART_COLORS.neutral,
                    backgroundColor: trend.impact === 'positive' ? 'rgba(16, 185, 129, 0.05)' :
                      trend.impact === 'negative' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(107, 114, 128, 0.05)'
                  }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-gray-800">{trend.name}</span>
                    <div className="flex items-center">
                      {getTrendIcon(trend.trend)}
                      <span className={`ml-1 text-xs font-medium px-2 py-1 rounded-full ${trend.trend === 'increasing' ? 'bg-blue-100 text-blue-800' :
                        trend.trend === 'decreasing' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {trend.trend}
                      </span>
                    </div>
                  </div>

                  {/* Chart if chartData is available */}
                  {(trend as any).chartData ? (
                    <div className="h-36 mb-2">
                      <ChartRenderer chartData={(trend as any).chartData} height={144} />
                    </div>
                  ) : trend.data && trend.data.length > 0 ? (
                    // Fallback to create chart from data if chartData is not available
                    <div className="h-36 mb-2">
                      {trend.data.length === 1 ? (
                        // Use Bar chart for single data point
                        <Bar
                          data={{
                            labels: [trend.data[0].period],
                            datasets: [
                              {
                                label: trend.name,
                                data: [typeof trend.data[0].value === 'number' ? trend.data[0].value : 0],
                                backgroundColor: trend.impact === 'positive' ? CHART_COLORS.success :
                                  trend.impact === 'negative' ? CHART_COLORS.danger : CHART_COLORS.primary,
                                borderColor: 'white',
                                borderWidth: 1,
                                borderRadius: 4
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: {
                                  font: {
                                    size: 9
                                  }
                                },
                                grid: {
                                  color: '#f0f0f0'
                                }
                              },
                              x: {
                                ticks: {
                                  font: {
                                    size: 9
                                  }
                                },
                                grid: {
                                  display: false
                                }
                              }
                            },
                            plugins: {
                              legend: {
                                display: false
                              },
                              tooltip: {
                                titleFont: {
                                  size: 10
                                },
                                bodyFont: {
                                  size: 10
                                },
                                padding: 6
                              }
                            }
                          }}
                        />
                      ) : (
                        // Use Line chart for multiple data points
                        <Line
                          data={{
                            labels: trend.data.map(item => item.period.length > 8 ? `${item.period.substring(0, 8)}...` : item.period),
                            datasets: [
                              {
                                label: trend.name,
                                data: trend.data.map(item => typeof item.value === 'number' ? item.value : 0),
                                borderColor: trend.impact === 'positive' ? CHART_COLORS.success :
                                  trend.impact === 'negative' ? CHART_COLORS.danger : CHART_COLORS.primary,
                                backgroundColor: trend.impact === 'positive' ? 'rgba(16, 185, 129, 0.1)' :
                                  trend.impact === 'negative' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(90, 66, 227, 0.1)',
                                borderWidth: 2,
                                pointRadius: 3,
                                pointHoverRadius: 5,
                                tension: 0.1
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: {
                                  font: {
                                    size: 9
                                  },
                                  maxTicksLimit: 5
                                },
                                grid: {
                                  color: '#f0f0f0'
                                }
                              },
                              x: {
                                ticks: {
                                  font: {
                                    size: 9
                                  },
                                  maxTicksLimit: 6
                                },
                                grid: {
                                  display: false
                                }
                              }
                            },
                            plugins: {
                              legend: {
                                display: false
                              },
                              tooltip: {
                                titleFont: {
                                  size: 10
                                },
                                bodyFont: {
                                  size: 10
                                },
                                padding: 6
                              }
                            }
                          }}
                        />
                      )}
                    </div>
                  ) : null}

                  <p className="text-xs text-gray-600 mb-2 line-clamp-2" title={trend.description}>
                    {trend.description}
                  </p>

                  <div className="flex items-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend.impact === 'positive' ? 'bg-green-100 text-green-800' :
                      trend.impact === 'negative' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      Impact: {trend.impact}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Growth Projections */}
            {report.financialAnalysis.growthProjections && report.financialAnalysis.growthProjections.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiTarget className="mr-2 text-blue-600" />
                  Growth Projections
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {report.financialAnalysis.growthProjections.map((projection, index) => (
                    <motion.div
                      key={index}
                      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-800">{projection.metric}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${projection.confidence === 'high' ? 'bg-green-100 text-green-800' :
                          projection.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {projection.confidence} confidence
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <div className="text-sm text-gray-500">Current</div>
                          <div className="text-lg font-bold text-gray-800">{projection.currentValue}</div>
                        </div>
                        <div className="text-purple-500">→</div>
                        <div>
                          <div className="text-sm text-gray-500">Projected</div>
                          <div className="text-lg font-bold text-purple-600">{projection.projectedValue}</div>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-between text-sm">
                        <div>
                          <span className="text-gray-500">Timeframe:</span>
                          <span className="ml-1 font-medium">{projection.timeframe}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">CAGR:</span>
                          <span className="ml-1 font-medium text-purple-600">{projection.cagr}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recommendations and Risk Factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recommendations */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <FiCheckCircle className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Recommendations</h3>
            </div>

            <div className="space-y-3">
              {report.recommendations.map((rec, index) => (
                <motion.div
                  key={index}
                  className="bg-green-50 p-4 rounded-lg border border-green-100 text-gray-700 flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="bg-green-500 text-white rounded-full p-1 mr-3 flex-shrink-0 mt-0.5">
                    <FiCheckCircle size={14} />
                  </div>
                  <div>
                    <span className="text-gray-800 font-medium">{`Recommendation ${index + 1}:`}</span>
                    <p className="mt-1 text-gray-600">{rec}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Risk Factors */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <FiAlertCircle className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Risk Factors</h3>
            </div>

            <div className="space-y-4">
              {report.riskFactors.map((risk, index) => (
                <motion.div
                  key={index}
                  className="bg-red-50 p-4 rounded-lg border border-red-100"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <FiAlertCircle className="text-red-500 mr-2 flex-shrink-0" />
                      <span className="font-semibold text-gray-800">{risk.category}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getRiskLevelColor(risk.level)}`}>
                      {risk.level} risk
                    </span>
                  </div>

                  <p className="text-gray-700 mb-2">{risk.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm">
                    <div className="bg-white p-2 rounded border border-red-50">
                      <span className="font-medium text-red-700">Impact:</span>
                      <p className="text-gray-600 mt-1">{risk.impact}</p>
                    </div>

                    {(risk as any).mitigationStrategy && (
                      <div className="bg-white p-2 rounded border border-green-50">
                        <span className="font-medium text-green-700">Mitigation:</span>
                        <p className="text-gray-600 mt-1">{(risk as any).mitigationStrategy}</p>
                      </div>
                    )}
                  </div>

                  {(risk as any).timeHorizon && (
                    <div className="mt-2 flex justify-end">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {(risk as any).timeHorizon.replace('_', ' ')} horizon
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Compliance Items (if available) */}
        {report.complianceItems && report.complianceItems.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center mb-5">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <FiFileText className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Compliance Assessment</h3>
            </div>

            {report.auditFindings?.complianceScore && (
              <div className="mb-6 flex items-center justify-center">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 w-full max-w-md text-center">
                  <div className="text-sm text-blue-700 font-medium mb-1">Overall Compliance Score</div>
                  <div className="text-3xl font-bold text-blue-800">{report.auditFindings.complianceScore}</div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirement</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    {report.complianceItems && report.complianceItems.some((item: any) => item.deadline) && (
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.complianceItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex items-start">
                          {item.status === 'compliant' ? (
                            <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          ) : item.status === 'partial' ? (
                            <FiAlertCircle className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                          ) : (
                            <FiAlertCircle className="text-red-500 mt-1 mr-2 flex-shrink-0" />
                          )}
                          <div>
                            <div>{item.requirement}</div>
                            {(item as any).regulatoryBody && (
                              <div className="text-xs text-gray-500 mt-1">
                                Regulatory Body: {(item as any).regulatoryBody}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {item.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskLevelColor(item.severity)}`}>
                          {item.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <p>{item.details}</p>
                        {item.recommendation && (
                          <p className="mt-2 text-xs bg-blue-50 p-2 rounded border border-blue-100">
                            <span className="font-medium text-blue-700">Recommendation:</span> {item.recommendation}
                          </p>
                        )}
                      </td>
                      {report.complianceItems && report.complianceItems.some((item: any) => item.deadline) && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {(item as any).deadline || '-'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Financial Ratios (if available) */}
        {report.ratioAnalysis && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center mb-5">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <FiBarChart2 className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Financial Ratio Analysis</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Liquidity Ratios */}
              {report.ratioAnalysis.liquidityRatios.length > 0 && (
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <FiActivity className="mr-2 text-blue-600" />
                    Liquidity Ratios
                  </h4>

                  <div className="space-y-4">
                    {report.ratioAnalysis.liquidityRatios.map((ratio, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-gray-800">{ratio.name}</span>
                          <div className="flex items-center">
                            {ratio.trend && getTrendIcon(ratio.trend)}
                            <span className={`ml-2 text-sm font-bold ${ratio.status === 'good' ? 'text-green-600' :
                              ratio.status === 'warning' ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                              {ratio.value}
                            </span>
                          </div>
                        </div>

                        {/* Industry comparison bar */}
                        {ratio.industry_average !== undefined && (
                          <div className="mt-2 mb-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>0</span>
                              <span>Industry Avg: {ratio.industry_average}</span>
                              <span>{typeof ratio.value === 'number' && typeof ratio.industry_average === 'number'
                                ? (Math.max(ratio.value, ratio.industry_average) * 1.5).toFixed(2)
                                : 'N/A'}</span>
                            </div>
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                              {/* Company value bar */}
                              <div
                                className={`h-full ${ratio.status === 'good' ? 'bg-green-500' :
                                  ratio.status === 'warning' ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                style={{
                                  width: typeof ratio.value === 'number' && typeof ratio.industry_average === 'number'
                                    ? `${Math.min(100, (ratio.value / (Math.max(ratio.value, ratio.industry_average) * 1.5)) * 100)}%`
                                    : '0%'
                                }}
                              ></div>
                              {/* Industry average marker */}
                              <div
                                className="h-4 w-0.5 bg-gray-800 absolute mt-[-8px]"
                                style={{
                                  marginLeft: typeof ratio.value === 'number' && typeof ratio.industry_average === 'number'
                                    ? `${Math.min(100, (ratio.industry_average / (Math.max(ratio.value, ratio.industry_average) * 1.5)) * 100)}%`
                                    : '0%'
                                }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Historical data chart */}
                        {ratio.historicalData && ratio.historicalData.length > 0 && (
                          <div className="h-24 mt-3 mb-2">
                            {ratio.historicalData.length === 1 ? (
                              // Use Bar chart for single data point
                              <Bar
                                data={{
                                  labels: [ratio.historicalData[0].period],
                                  datasets: [
                                    {
                                      label: ratio.name,
                                      data: [ratio.historicalData[0].value],
                                      backgroundColor: CHART_COLORS.primary,
                                      borderColor: 'white',
                                      borderWidth: 1,
                                      borderRadius: 4
                                    }
                                  ]
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  scales: {
                                    y: {
                                      beginAtZero: true,
                                      ticks: {
                                        font: {
                                          size: 10
                                        }
                                      },
                                      grid: {
                                        color: '#f0f0f0'
                                      }
                                    },
                                    x: {
                                      ticks: {
                                        font: {
                                          size: 10
                                        }
                                      },
                                      grid: {
                                        display: false
                                      }
                                    }
                                  },
                                  plugins: {
                                    legend: {
                                      display: false
                                    }
                                  }
                                }}
                              />
                            ) : (
                              // Use Line chart for multiple data points
                              <Line
                                data={{
                                  labels: ratio.historicalData.map(item => item.period.length > 6 ? `${item.period.substring(0, 6)}...` : item.period),
                                  datasets: [
                                    {
                                      label: ratio.name,
                                      data: ratio.historicalData.map(item => item.value),
                                      borderColor: CHART_COLORS.primary,
                                      backgroundColor: 'rgba(90, 66, 227, 0.1)',
                                      borderWidth: 2,
                                      pointRadius: 3,
                                      pointHoverRadius: 5,
                                      tension: 0.1
                                    }
                                  ]
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  scales: {
                                    y: {
                                      beginAtZero: true,
                                      ticks: {
                                        font: {
                                          size: 10
                                        }
                                      },
                                      grid: {
                                        color: '#f0f0f0'
                                      }
                                    },
                                    x: {
                                      ticks: {
                                        font: {
                                          size: 10
                                        }
                                      },
                                      grid: {
                                        display: false
                                      }
                                    }
                                  },
                                  plugins: {
                                    legend: {
                                      display: false
                                    }
                                  }
                                }}
                              />
                            )}
                          </div>
                        )}

                        <div className="text-xs text-gray-600 mt-2">{ratio.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Profitability Ratios */}
              {report.ratioAnalysis.profitabilityRatios.length > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-lg border border-green-100 shadow-sm">
                  <h4 className="font-semibold text-green-800 mb-4 flex items-center">
                    <FiDollarSign className="mr-2 text-green-600" />
                    Profitability Ratios
                  </h4>

                  <div className="space-y-4">
                    {report.ratioAnalysis.profitabilityRatios.map((ratio, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border border-green-100 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-gray-800">{ratio.name}</span>
                          <div className="flex items-center">
                            {ratio.trend && getTrendIcon(ratio.trend)}
                            <span className={`ml-2 text-sm font-bold ${ratio.status === 'good' ? 'text-green-600' :
                              ratio.status === 'warning' ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                              {ratio.value}
                            </span>
                          </div>
                        </div>

                        {/* Industry comparison bar */}
                        {ratio.industry_average !== undefined && (
                          <div className="mt-2 mb-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>0</span>
                              <span>Industry Avg: {ratio.industry_average}</span>
                              <span>{typeof ratio.value === 'number' && typeof ratio.industry_average === 'number'
                                ? (Math.max(ratio.value, ratio.industry_average) * 1.5).toFixed(2)
                                : 'N/A'}</span>
                            </div>
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                              {/* Company value bar */}
                              <div
                                className={`h-full ${ratio.status === 'good' ? 'bg-green-500' :
                                  ratio.status === 'warning' ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                style={{
                                  width: typeof ratio.value === 'number' && typeof ratio.industry_average === 'number'
                                    ? `${Math.min(100, (ratio.value / (Math.max(ratio.value, ratio.industry_average) * 1.5)) * 100)}%`
                                    : '0%'
                                }}
                              ></div>
                              {/* Industry average marker */}
                              <div
                                className="h-4 w-0.5 bg-gray-800 absolute mt-[-8px]"
                                style={{
                                  marginLeft: typeof ratio.value === 'number' && typeof ratio.industry_average === 'number'
                                    ? `${Math.min(100, (ratio.industry_average / (Math.max(ratio.value, ratio.industry_average) * 1.5)) * 100)}%`
                                    : '0%'
                                }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Historical data chart */}
                        {ratio.historicalData && ratio.historicalData.length > 0 && (
                          <div className="h-24 mt-3 mb-2">
                            {ratio.historicalData.length === 1 ? (
                              // Use Bar chart for single data point
                              <Bar
                                data={{
                                  labels: [ratio.historicalData[0].period],
                                  datasets: [
                                    {
                                      label: ratio.name,
                                      data: [ratio.historicalData[0].value],
                                      backgroundColor: CHART_COLORS.success,
                                      borderColor: 'white',
                                      borderWidth: 1,
                                      borderRadius: 4
                                    }
                                  ]
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  scales: {
                                    y: {
                                      beginAtZero: true,
                                      ticks: {
                                        font: {
                                          size: 10
                                        }
                                      },
                                      grid: {
                                        color: '#f0f0f0'
                                      }
                                    },
                                    x: {
                                      ticks: {
                                        font: {
                                          size: 10
                                        }
                                      },
                                      grid: {
                                        display: false
                                      }
                                    }
                                  },
                                  plugins: {
                                    legend: {
                                      display: false
                                    }
                                  }
                                }}
                              />
                            ) : (
                              // Use Line chart for multiple data points
                              <Line
                                data={{
                                  labels: ratio.historicalData.map(item => item.period.length > 6 ? `${item.period.substring(0, 6)}...` : item.period),
                                  datasets: [
                                    {
                                      label: ratio.name,
                                      data: ratio.historicalData.map(item => item.value),
                                      borderColor: CHART_COLORS.success,
                                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                      borderWidth: 2,
                                      pointRadius: 3,
                                      pointHoverRadius: 5,
                                      tension: 0.1
                                    }
                                  ]
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  scales: {
                                    y: {
                                      beginAtZero: true,
                                      ticks: {
                                        font: {
                                          size: 10
                                        }
                                      },
                                      grid: {
                                        color: '#f0f0f0'
                                      }
                                    },
                                    x: {
                                      ticks: {
                                        font: {
                                          size: 10
                                        }
                                      },
                                      grid: {
                                        display: false
                                      }
                                    }
                                  },
                                  plugins: {
                                    legend: {
                                      display: false
                                    }
                                  }
                                }}
                              />
                            )}
                          </div>
                        )}

                        <div className="text-xs text-gray-600 mt-2">{ratio.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Solvency Ratios */}
              {report.ratioAnalysis.solvencyRatios && report.ratioAnalysis.solvencyRatios.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-5 rounded-lg border border-purple-100 shadow-sm">
                  <h4 className="font-semibold text-purple-800 mb-4 flex items-center">
                    <FiBarChart2 className="mr-2 text-purple-600" />
                    Solvency Ratios
                  </h4>

                  <div className="space-y-4">
                    {report.ratioAnalysis.solvencyRatios.map((ratio, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border border-purple-100 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-gray-800">{ratio.name}</span>
                          <div className="flex items-center">
                            {ratio.trend && getTrendIcon(ratio.trend)}
                            <span className={`ml-2 text-sm font-bold ${ratio.status === 'good' ? 'text-green-600' :
                              ratio.status === 'warning' ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                              {ratio.value}
                            </span>
                          </div>
                        </div>

                        {ratio.industry_average !== undefined && (
                          <div className="text-xs text-gray-500 mt-1 mb-1">
                            Industry Average: {ratio.industry_average}
                          </div>
                        )}

                        <div className="text-xs text-gray-600 mt-2">{ratio.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Efficiency Ratios */}
              {report.ratioAnalysis.efficiencyRatios && report.ratioAnalysis.efficiencyRatios.length > 0 && (
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-5 rounded-lg border border-amber-100 shadow-sm">
                  <h4 className="font-semibold text-amber-800 mb-4 flex items-center">
                    <FiActivity className="mr-2 text-amber-600" />
                    Efficiency Ratios
                  </h4>

                  <div className="space-y-4">
                    {report.ratioAnalysis.efficiencyRatios.map((ratio, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border border-amber-100 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-gray-800">{ratio.name}</span>
                          <div className="flex items-center">
                            {ratio.trend && getTrendIcon(ratio.trend)}
                            <span className={`ml-2 text-sm font-bold ${ratio.status === 'good' ? 'text-green-600' :
                              ratio.status === 'warning' ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                              {ratio.value}
                            </span>
                          </div>
                        </div>

                        {ratio.industry_average !== undefined && (
                          <div className="text-xs text-gray-500 mt-1 mb-1">
                            Industry Average: {ratio.industry_average}
                          </div>
                        )}

                        <div className="text-xs text-gray-600 mt-2">{ratio.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Audit Findings (if available) */}
        {report.auditFindings && report.auditFindings.findings && report.auditFindings.findings.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-red-100">
            <div className="flex items-center mb-5">
              <div className="bg-red-600 p-2 rounded-lg mr-3">
                <FiFileText className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Audit Findings</h3>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-6">
              <p className="text-gray-700">{report.auditFindings.overallAssessment}</p>

              {/* Strengths and Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {report.auditFindings.keyStrengths && report.auditFindings.keyStrengths.length > 0 && (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                      <FiCheckCircle className="mr-2 text-green-600" />
                      Key Strengths
                    </h4>
                    <ul className="space-y-1">
                      {report.auditFindings.keyStrengths.map((strength, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.auditFindings.keyWeaknesses && report.auditFindings.keyWeaknesses.length > 0 && (
                  <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                    <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                      <FiAlertCircle className="mr-2 text-red-600" />
                      Key Weaknesses
                    </h4>
                    <ul className="space-y-1">
                      {report.auditFindings.keyWeaknesses.map((weakness, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Findings Distribution Chart */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-1 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-3 text-center">Findings by Severity</h4>
                <div className="h-48">
                  <Pie
                    data={{
                      labels: ['High', 'Medium', 'Low'],
                      datasets: [
                        {
                          data: [
                            report.auditFindings.findings.filter(f => f.severity === 'high').length,
                            report.auditFindings.findings.filter(f => f.severity === 'medium').length,
                            report.auditFindings.findings.filter(f => f.severity === 'low').length
                          ],
                          backgroundColor: [
                            CHART_COLORS.danger,
                            CHART_COLORS.warning,
                            CHART_COLORS.success
                          ],
                          borderColor: [
                            '#fff',
                            '#fff',
                            '#fff'
                          ],
                          borderWidth: 2
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            font: {
                              size: 12
                            }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function (context) {
                              const label = context.label || '';
                              const value = context.raw || 0;
                              const total = context.dataset.data.reduce((a, b) => a + b, 0);
                              const percentage = total > 0 ? Math.round(((value as number) / total) * 100) : 0;
                              return `${label}: ${value} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
                <div className="flex justify-center space-x-4 mt-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                    <span className="text-xs">High</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                    <span className="text-xs">Medium</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                    <span className="text-xs">Low</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-red-700">
                      {report.auditFindings.findings.filter(f => f.severity === 'high').length}
                    </div>
                    <div className="text-sm text-red-600 mt-1">High Severity</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-yellow-700">
                      {report.auditFindings.findings.filter(f => f.severity === 'medium').length}
                    </div>
                    <div className="text-sm text-yellow-600 mt-1">Medium Severity</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-green-700">
                      {report.auditFindings.findings.filter(f => f.severity === 'low').length}
                    </div>
                    <div className="text-sm text-green-600 mt-1">Low Severity</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Findings */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800 mb-2">Detailed Findings</h4>
              {report.auditFindings.findings.map((finding, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${finding.severity === 'high' ? 'bg-red-50 border-red-200' :
                    finding.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-green-50 border-green-200'
                    }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      {finding.severity === 'high' ? (
                        <div className="bg-red-500 p-1 rounded-full text-white mr-2">
                          <FiAlertCircle size={14} />
                        </div>
                      ) : finding.severity === 'medium' ? (
                        <div className="bg-yellow-500 p-1 rounded-full text-white mr-2">
                          <FiAlertCircle size={14} />
                        </div>
                      ) : (
                        <div className="bg-green-500 p-1 rounded-full text-white mr-2">
                          <FiInfo size={14} />
                        </div>
                      )}
                      <span className="font-semibold text-gray-800">{finding.area}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getRiskLevelColor(finding.severity)}`}>
                      {finding.severity} severity
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">{finding.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <div className="font-medium text-gray-700 mb-1">Recommendation</div>
                      <p className="text-sm text-gray-600">{finding.recommendation}</p>
                    </div>

                    {finding.impact && (
                      <div className="bg-white p-3 rounded border border-gray-200">
                        <div className="font-medium text-gray-700 mb-1">Impact</div>
                        <p className="text-sm text-gray-600">{finding.impact}</p>
                      </div>
                    )}
                  </div>

                  {finding.timelineToResolve && (
                    <div className="mt-3 flex justify-end">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        Timeline to resolve: {finding.timelineToResolve}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tax Compliance (if available) */}
        {report.taxCompliance && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
            <div className="flex items-center mb-5">
              <div className="bg-blue-600 p-2 rounded-lg mr-3">
                <FiFileText className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Tax Compliance</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* GST */}
              <div className={`rounded-lg border shadow-sm overflow-hidden ${report.taxCompliance.gst.status === 'compliant' ? 'border-green-200' :
                report.taxCompliance.gst.status === 'partial' ? 'border-yellow-200' :
                  'border-red-200'
                }`}>
                <div className={`p-3 ${report.taxCompliance.gst.status === 'compliant' ? 'bg-green-50' :
                  report.taxCompliance.gst.status === 'partial' ? 'bg-yellow-50' :
                    'bg-red-50'
                  }`}>
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-gray-800">GST</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.taxCompliance.gst.status)}`}>
                      {report.taxCompliance.gst.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white">
                  <p className="text-sm text-gray-700 mb-3">{report.taxCompliance.gst.details}</p>

                  {/* Filing History */}
                  {report.taxCompliance.gst.filingHistory && report.taxCompliance.gst.filingHistory.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Filing History</h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Period</th>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Due Date</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {report.taxCompliance.gst.filingHistory.map((filing, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-3 py-2 whitespace-nowrap text-xs">{filing.period}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  <span className={`px-2 py-0.5 rounded-full ${filing.status === 'filed' ? 'bg-green-100 text-green-800' :
                                    filing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                    {filing.status}
                                  </span>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">{filing.dueDate}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {report.taxCompliance.gst.recommendations && report.taxCompliance.gst.recommendations.length > 0 && (
                    <div className="mt-3 bg-blue-50 p-2 rounded border border-blue-100">
                      <h5 className="text-xs font-medium text-blue-800 mb-1">Recommendations</h5>
                      <ul className="list-disc pl-4 space-y-1">
                        {report.taxCompliance.gst.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-xs text-gray-700">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Income Tax */}
              <div className={`rounded-lg border shadow-sm overflow-hidden ${report.taxCompliance.incomeTax.status === 'compliant' ? 'border-green-200' :
                report.taxCompliance.incomeTax.status === 'partial' ? 'border-yellow-200' :
                  'border-red-200'
                }`}>
                <div className={`p-3 ${report.taxCompliance.incomeTax.status === 'compliant' ? 'bg-green-50' :
                  report.taxCompliance.incomeTax.status === 'partial' ? 'bg-yellow-50' :
                    'bg-red-50'
                  }`}>
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-gray-800">Income Tax</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.taxCompliance.incomeTax.status)}`}>
                      {report.taxCompliance.incomeTax.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white">
                  <p className="text-sm text-gray-700 mb-3">{report.taxCompliance.incomeTax.details}</p>

                  {/* Filing History */}
                  {report.taxCompliance.incomeTax.filingHistory && report.taxCompliance.incomeTax.filingHistory.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Filing History</h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Period</th>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Due Date</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {report.taxCompliance.incomeTax.filingHistory.map((filing, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-3 py-2 whitespace-nowrap text-xs">{filing.period}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  <span className={`px-2 py-0.5 rounded-full ${filing.status === 'filed' ? 'bg-green-100 text-green-800' :
                                    filing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                    {filing.status}
                                  </span>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">{filing.dueDate}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {report.taxCompliance.incomeTax.recommendations && report.taxCompliance.incomeTax.recommendations.length > 0 && (
                    <div className="mt-3 bg-blue-50 p-2 rounded border border-blue-100">
                      <h5 className="text-xs font-medium text-blue-800 mb-1">Recommendations</h5>
                      <ul className="list-disc pl-4 space-y-1">
                        {report.taxCompliance.incomeTax.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-xs text-gray-700">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* TDS */}
              <div className={`rounded-lg border shadow-sm overflow-hidden ${report.taxCompliance.tds.status === 'compliant' ? 'border-green-200' :
                report.taxCompliance.tds.status === 'partial' ? 'border-yellow-200' :
                  'border-red-200'
                }`}>
                <div className={`p-3 ${report.taxCompliance.tds.status === 'compliant' ? 'bg-green-50' :
                  report.taxCompliance.tds.status === 'partial' ? 'bg-yellow-50' :
                    'bg-red-50'
                  }`}>
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-gray-800">TDS</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.taxCompliance.tds.status)}`}>
                      {report.taxCompliance.tds.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white">
                  <p className="text-sm text-gray-700 mb-3">{report.taxCompliance.tds.details}</p>

                  {/* Filing History */}
                  {report.taxCompliance.tds.filingHistory && report.taxCompliance.tds.filingHistory.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Filing History</h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Period</th>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Due Date</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {report.taxCompliance.tds.filingHistory.map((filing, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-3 py-2 whitespace-nowrap text-xs">{filing.period}</td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  <span className={`px-2 py-0.5 rounded-full ${filing.status === 'filed' ? 'bg-green-100 text-green-800' :
                                    filing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                    {filing.status}
                                  </span>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">{filing.dueDate}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {report.taxCompliance.tds.recommendations && report.taxCompliance.tds.recommendations.length > 0 && (
                    <div className="mt-3 bg-blue-50 p-2 rounded border border-blue-100">
                      <h5 className="text-xs font-medium text-blue-800 mb-1">Recommendations</h5>
                      <ul className="list-disc pl-4 space-y-1">
                        {report.taxCompliance.tds.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-xs text-gray-700">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Industry Benchmarking (if available) */}
        {report.industryBenchmarking && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-purple-100">
            <div className="flex items-center mb-5">
              <div className="bg-purple-600 p-2 rounded-lg mr-3">
                <FiGlobe className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Industry Benchmarking</h3>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mb-6">
              <p className="text-gray-700">{report.industryBenchmarking.overview}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {report.industryBenchmarking.strengths && report.industryBenchmarking.strengths.length > 0 && (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                      <FiCheckCircle className="mr-2 text-green-600" />
                      Competitive Strengths
                    </h4>
                    <ul className="space-y-1">
                      {report.industryBenchmarking.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.industryBenchmarking.challenges && report.industryBenchmarking.challenges.length > 0 && (
                  <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                    <h4 className="font-semibold text-red-800 mb-2 flex items-center">
                      <FiAlertCircle className="mr-2 text-red-600" />
                      Competitive Challenges
                    </h4>
                    <ul className="space-y-1">
                      {report.industryBenchmarking.challenges.map((challenge, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Competitive Position */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Competitive Position</h4>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-gray-700">{report.industryBenchmarking.competitivePosition}</p>
              </div>
            </div>

            {/* Industry Performance Benchmarking - Simplified version without benchmarkingCharts */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Industry Performance Benchmarking</h4>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-gray-700 mb-3">Industry performance comparison based on key metrics.</p>
              </div>
            </div>

            {/* Benchmarking Metrics */}
            {report.industryBenchmarking.metrics && report.industryBenchmarking.metrics.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Key Industry Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.industryBenchmarking.metrics.map((metric, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${metric.status === 'above_average' ? 'bg-green-50 border-green-200' :
                        metric.status === 'below_average' ? 'bg-red-50 border-red-200' :
                          'bg-blue-50 border-blue-200'
                        }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-semibold text-gray-800">{metric.name}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${metric.status === 'above_average' ? 'bg-green-100 text-green-800' :
                          metric.status === 'below_average' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                          {metric.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-xs text-gray-500">Company</div>
                          <div className="text-lg font-bold text-gray-800">{metric.companyValue}</div>
                        </div>
                        <div className="text-purple-500">vs</div>
                        <div>
                          <div className="text-xs text-gray-500">Industry Avg</div>
                          <div className="text-lg font-bold text-purple-600">{metric.industryAverage}</div>
                        </div>
                      </div>

                      {/* Comparison chart */}
                      {metric.chartData ? (
                        <div className="mt-3 mb-1 h-16">
                          <ChartRenderer chartData={metric.chartData} height={64} />
                        </div>
                      ) : (
                        <div className="mt-3 mb-1 h-16">
                          <Bar
                            data={{
                              labels: ['Comparison'],
                              datasets: [
                                {
                                  label: 'Company',
                                  data: [typeof metric.companyValue === 'number' ? metric.companyValue : 0],
                                  backgroundColor: metric.status === 'above_average' ? CHART_COLORS.success :
                                    metric.status === 'below_average' ? CHART_COLORS.danger : CHART_COLORS.primary,
                                  borderColor: 'white',
                                  borderWidth: 1,
                                  borderRadius: 4
                                },
                                {
                                  label: 'Industry Average',
                                  data: [typeof metric.industryAverage === 'number' ? metric.industryAverage : 0],
                                  backgroundColor: CHART_COLORS.secondary,
                                  borderColor: 'white',
                                  borderWidth: 1,
                                  borderRadius: 4
                                }
                              ]
                            }}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              indexAxis: 'y',
                              scales: {
                                x: {
                                  beginAtZero: true,
                                  grid: {
                                    display: false
                                  },
                                  ticks: {
                                    font: {
                                      size: 10
                                    }
                                  }
                                },
                                y: {
                                  display: false
                                }
                              },
                              plugins: {
                                legend: {
                                  position: 'bottom',
                                  labels: {
                                    boxWidth: 12,
                                    font: {
                                      size: 10
                                    }
                                  }
                                },
                                tooltip: {
                                  callbacks: {
                                    label: function (context) {
                                      const label = context.dataset.label || '';
                                      const value = context.raw || 0;
                                      return `${label}: ${value}`;
                                    }
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      )}

                      {metric.percentile && (
                        <div className="mt-2 text-xs text-gray-600">
                          Company is in the <span className="font-semibold">{metric.percentile}</span> percentile
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Shareholders Table Section */}
        {report.shareholdersTable && report.shareholdersTable.shareholders && report.shareholdersTable.shareholders.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 mt-6">
            <div className="flex items-center mb-5">
              <div className="bg-blue-600 p-2 rounded-lg mr-3">
                <FiUsers className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Shareholders Structure</h3>
            </div>

            <div className="mb-4">
              <p className="text-gray-700">{report.shareholdersTable.overview}</p>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shareholder</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equity %</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Share Count</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Face Value</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Investment</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Share Class</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.shareholdersTable.shareholders.map((shareholder, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{shareholder.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shareholder.equityPercentage}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shareholder.shareCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shareholder.faceValue}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shareholder.investmentAmount || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shareholder.shareClass || 'N/A'}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">Total</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{report.shareholdersTable.totalEquity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{report.shareholdersTable.totalShares}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
              <h4 className="font-semibold text-blue-800 mb-3">Analysis</h4>
              <p className="text-gray-700">{report.shareholdersTable.analysis}</p>
            </div>

            {report.shareholdersTable.recommendations && report.shareholdersTable.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Recommendations</h4>
                <div className="space-y-2">
                  {report.shareholdersTable.recommendations.map((rec, index) => (
                    <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-100 text-gray-700 flex items-start">
                      <div className="bg-green-500 text-white rounded-full p-1 mr-3 flex-shrink-0 mt-0.5">
                        <FiCheckCircle size={14} />
                      </div>
                      <p className="text-gray-600">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Directors Table Section */}
        {report.directorsTable && report.directorsTable.directors && report.directorsTable.directors.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-purple-100 mt-6">
            <div className="flex items-center mb-5">
              <div className="bg-purple-600 p-2 rounded-lg mr-3">
                <FiBriefcase className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Board of Directors</h3>
            </div>

            <div className="mb-4">
              <p className="text-gray-700">{report.directorsTable.overview}</p>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointment Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DIN</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shareholding</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expertise</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.directorsTable.directors.map((director, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{director.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{director.position}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{director.appointmentDate || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{director.din || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{director.shareholding || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{director.expertise || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mb-4">
              <h4 className="font-semibold text-purple-800 mb-3">Analysis</h4>
              <p className="text-gray-700">{report.directorsTable.analysis}</p>
            </div>

            {report.directorsTable.recommendations && report.directorsTable.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Recommendations</h4>
                <div className="space-y-2">
                  {report.directorsTable.recommendations.map((rec, index) => (
                    <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-100 text-gray-700 flex items-start">
                      <div className="bg-green-500 text-white rounded-full p-1 mr-3 flex-shrink-0 mt-0.5">
                        <FiCheckCircle size={14} />
                      </div>
                      <p className="text-gray-600">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Key Business Agreements Section */}
        {report.keyBusinessAgreements && report.keyBusinessAgreements.agreements && report.keyBusinessAgreements.agreements.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-green-100 mt-6">
            <div className="flex items-center mb-5">
              <div className="bg-green-600 p-2 rounded-lg mr-3">
                <FiFileText className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Key Business Agreements</h3>
            </div>

            <div className="mb-4">
              <p className="text-gray-700">{report.keyBusinessAgreements.overview}</p>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agreement Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parties</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key Terms</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.keyBusinessAgreements.agreements.map((agreement, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{agreement.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agreement.parties}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agreement.date || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agreement.duration || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{agreement.value || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">{agreement.keyTerms || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-4">
              <h4 className="font-semibold text-green-800 mb-3">Analysis</h4>
              <p className="text-gray-700">{report.keyBusinessAgreements.analysis}</p>
            </div>

            {report.keyBusinessAgreements.recommendations && report.keyBusinessAgreements.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Recommendations</h4>
                <div className="space-y-2">
                  {report.keyBusinessAgreements.recommendations.map((rec, index) => (
                    <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-100 text-gray-700 flex items-start">
                      <div className="bg-green-500 text-white rounded-full p-1 mr-3 flex-shrink-0 mt-0.5">
                        <FiCheckCircle size={14} />
                      </div>
                      <p className="text-gray-600">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Leave Policy Section */}
        {report.leavePolicy && report.leavePolicy.policies && report.leavePolicy.policies.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100 mt-6">
            <div className="flex items-center mb-5">
              <div className="bg-indigo-600 p-2 rounded-lg mr-3">
                <FiCalendar className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Leave Policy</h3>
            </div>

            <div className="mb-4">
              <p className="text-gray-700">{report.leavePolicy.overview}</p>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Allowed</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eligibility</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carry Forward</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Encashment</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.leavePolicy.policies.map((policy, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{policy.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{policy.daysAllowed}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{policy.eligibility || 'All employees'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{policy.carryForward ? 'Yes' : 'No'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{policy.encashment ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4">
              <h4 className="font-semibold text-indigo-800 mb-3">Analysis</h4>
              <p className="text-gray-700">{report.leavePolicy.analysis}</p>
            </div>

            {report.leavePolicy.recommendations && report.leavePolicy.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Recommendations</h4>
                <div className="space-y-2">
                  {report.leavePolicy.recommendations.map((rec, index) => (
                    <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-100 text-gray-700 flex items-start">
                      <div className="bg-green-500 text-white rounded-full p-1 mr-3 flex-shrink-0 mt-0.5">
                        <FiCheckCircle size={14} />
                      </div>
                      <p className="text-gray-600">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Provisions & Prepayments Section */}
        {report.provisionsAndPrepayments && report.provisionsAndPrepayments.items && report.provisionsAndPrepayments.items.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-amber-100 mt-6">
            <div className="flex items-center mb-5">
              <div className="bg-amber-600 p-2 rounded-lg mr-3">
                <FiPackage className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Provisions & Prepayments</h3>
            </div>

            <div className="mb-4">
              <p className="text-gray-700">{report.provisionsAndPrepayments.overview}</p>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.provisionsAndPrepayments.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.period || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 text-xs rounded-full ${item.status === 'adequate' ? 'bg-green-100 text-green-800' :
                          item.status === 'inadequate' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">{item.notes || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 mb-4">
              <h4 className="font-semibold text-amber-800 mb-3">Analysis</h4>
              <p className="text-gray-700">{report.provisionsAndPrepayments.analysis}</p>
            </div>

            {report.provisionsAndPrepayments.recommendations && report.provisionsAndPrepayments.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Recommendations</h4>
                <div className="space-y-2">
                  {report.provisionsAndPrepayments.recommendations.map((rec, index) => (
                    <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-100 text-gray-700 flex items-start">
                      <div className="bg-green-500 text-white rounded-full p-1 mr-3 flex-shrink-0 mt-0.5">
                        <FiCheckCircle size={14} />
                      </div>
                      <p className="text-gray-600">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Deferred Tax Assets Section */}
        {report.deferredTaxAssets && report.deferredTaxAssets.items && report.deferredTaxAssets.items.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-cyan-100 mt-6">
            <div className="flex items-center mb-5">
              <div className="bg-cyan-600 p-2 rounded-lg mr-3">
                <FiCreditCard className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Deferred Tax Assets</h3>
            </div>

            <div className="mb-4">
              <p className="text-gray-700">{report.deferredTaxAssets.overview}</p>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Utilization</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.deferredTaxAssets.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.origin || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.expectedUtilization || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 py-1 text-xs rounded-full ${item.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                          item.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                          {item.riskLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-100 mb-4">
              <h4 className="font-semibold text-cyan-800 mb-3">Analysis</h4>
              <p className="text-gray-700">{report.deferredTaxAssets.analysis}</p>
            </div>

            {report.deferredTaxAssets.recommendations && report.deferredTaxAssets.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Recommendations</h4>
                <div className="space-y-2">
                  {report.deferredTaxAssets.recommendations.map((rec, index) => (
                    <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-100 text-gray-700 flex items-start">
                      <div className="bg-green-500 text-white rounded-full p-1 mr-3 flex-shrink-0 mt-0.5">
                        <FiCheckCircle size={14} />
                      </div>
                      <p className="text-gray-600">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Document Content Analysis Section - New section */}
        {report.documentContentAnalysis && (
          <DocumentContentAnalysisSection documentContentAnalysis={report.documentContentAnalysis} />
        )}

        {/* Document Analysis Section */}
        {report.documentAnalysis && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-teal-100 mt-6">
            <div className="flex items-center mb-5">
              <div className="bg-teal-600 p-2 rounded-lg mr-3">
                <FiFileText className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Document Analysis</h3>
            </div>

            {/* Available Documents Analysis */}
            {report.documentAnalysis.availableDocuments && report.documentAnalysis.availableDocuments.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <FiCheckCircle className="mr-2 text-teal-600" />
                  Available Documents Analysis
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {report.documentAnalysis.availableDocuments.map((doc, index) => (
                    <div
                      key={index}
                      className={`rounded-lg border shadow-sm overflow-hidden ${doc.quality === 'good' ? 'border-green-200' :
                        doc.quality === 'moderate' ? 'border-yellow-200' :
                          'border-red-200'
                        }`}
                    >
                      <div className={`p-3 ${doc.quality === 'good' ? 'bg-green-50' :
                        doc.quality === 'moderate' ? 'bg-yellow-50' :
                          'bg-red-50'
                        }`}>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-800">
                            {doc.documentType.replace('financial_', '').replace(/_/g, ' ').split(' ').map(word =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${doc.quality === 'good' ? 'bg-green-100 text-green-800' :
                            doc.quality === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                            {doc.quality} quality
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-white">
                        <div className="flex items-center mb-3">
                          <div className={`h-2 w-full rounded-full ${doc.completeness === 'complete' ? 'bg-green-200' :
                            doc.completeness === 'partial' ? 'bg-yellow-200' :
                              'bg-red-200'
                            }`}>
                            <div className={`h-2 rounded-full ${doc.completeness === 'complete' ? 'bg-green-500 w-full' :
                              doc.completeness === 'partial' ? 'bg-yellow-500 w-1/2' :
                                'bg-red-500 w-1/4'
                              }`}></div>
                          </div>
                          <span className="text-xs ml-2 min-w-[80px]">
                            {doc.completeness} ({
                              doc.completeness === 'complete' ? '100%' :
                                doc.completeness === 'partial' ? '~50%' :
                                  '<25%'
                            })
                          </span>
                        </div>

                        {doc.dataReliability && (
                          <div className="text-xs text-gray-600 mb-2">
                            <span className="font-medium">Data Reliability:</span>
                            <span className={`ml-1 ${doc.dataReliability === 'high' ? 'text-green-600' :
                              doc.dataReliability === 'medium' ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                              {doc.dataReliability}
                            </span>
                          </div>
                        )}

                        {doc.keyInsights && doc.keyInsights.length > 0 && (
                          <div className="mt-3">
                            <span className="text-sm font-medium text-gray-700">Key Insights:</span>
                            <ul className="list-disc pl-5 mt-1 space-y-1">
                              {doc.keyInsights.map((insight, i) => (
                                <li key={i} className="text-xs text-gray-600">{insight}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {doc.financialHighlights && doc.financialHighlights.length > 0 && (
                          <div className="mt-3 bg-green-50 p-2 rounded border border-green-100">
                            <span className="text-xs font-medium text-green-700">Financial Highlights:</span>
                            <ul className="list-disc pl-4 mt-1 space-y-1">
                              {doc.financialHighlights.map((highlight, i) => (
                                <li key={i} className="text-xs text-gray-600">{highlight}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {doc.redFlags && doc.redFlags.length > 0 && (
                          <div className="mt-3 bg-red-50 p-2 rounded border border-red-100">
                            <span className="text-xs font-medium text-red-700">Red Flags:</span>
                            <ul className="list-disc pl-4 mt-1 space-y-1">
                              {doc.redFlags.map((flag, i) => (
                                <li key={i} className="text-xs text-gray-600">{flag}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {doc.recommendations && doc.recommendations.length > 0 && (
                          <div className="mt-3 bg-blue-50 p-2 rounded border border-blue-100">
                            <span className="text-xs font-medium text-blue-700">Recommendations:</span>
                            <ul className="list-disc pl-4 mt-1 space-y-1">
                              {doc.recommendations.map((rec, i) => (
                                <li key={i} className="text-xs text-gray-600">{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Documents Section */}
            {report.documentAnalysis.missingDocuments && report.documentAnalysis.missingDocuments.list.length > 0 && (
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-5 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-amber-800 mb-3 flex items-center">
                  <FiAlertCircle className="mr-2 text-amber-600" />
                  Missing Documents
                </h4>

                {report.documentAnalysis.missingDocuments && 'priorityLevel' in report.documentAnalysis.missingDocuments && report.documentAnalysis.missingDocuments.priorityLevel && (
                  <div className="mb-3 flex items-center">
                    <span className="text-sm font-medium text-gray-700 mr-2">Priority Level:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${(report.documentAnalysis.missingDocuments as any).priorityLevel === 'high' ? 'bg-red-100 text-red-800' :
                      (report.documentAnalysis.missingDocuments as any).priorityLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                      {(report.documentAnalysis.missingDocuments as any).priorityLevel}
                    </span>
                  </div>
                )}

                <p className="text-sm text-gray-700 mb-4 bg-white p-3 rounded border border-yellow-100">
                  {report.documentAnalysis.missingDocuments.impact}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-amber-700 mb-2">Missing Document List:</h5>
                    <ul className="bg-white p-3 rounded border border-yellow-100 list-disc pl-5 space-y-1">
                      {report.documentAnalysis.missingDocuments.list.map((doc, index) => (
                        <li key={index} className="text-sm text-gray-700">
                          {typeof doc === 'string' ?
                            doc.replace('financial_', '').replace(/_/g, ' ').split(' ').map(word =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ') : doc}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-amber-700 mb-2">Recommendations:</h5>
                    <ul className="bg-white p-3 rounded border border-yellow-100 list-disc pl-5 space-y-1">
                      {report.documentAnalysis.missingDocuments.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-700">{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Legacy Missing Documents Section - for backward compatibility */}
        {!report.documentAnalysis && (report as any).missingDocuments && (report as any).missingDocuments.list && (report as any).missingDocuments.list.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-yellow-100 mt-6">
            <div className="flex items-center mb-5">
              <div className="bg-yellow-600 p-2 rounded-lg mr-3">
                <FiAlertCircle className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Missing Documents</h3>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-5 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-700 mb-4 bg-white p-3 rounded border border-yellow-100">
                {(report as any).missingDocuments.impact}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-amber-700 mb-2">Missing Document List:</h5>
                  <ul className="bg-white p-3 rounded border border-yellow-100 list-disc pl-5 space-y-1">
                    {(report as any).missingDocuments.list.map((doc: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700">{doc}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium text-amber-700 mb-2">Recommendations:</h5>
                  <ul className="bg-white p-3 rounded border border-yellow-100 list-disc pl-5 space-y-1">
                    {(report as any).missingDocuments.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700">{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-lg text-center mt-8 shadow-md">
          <div className="mb-3">
            <img src="/logo.png" alt="KarmicDD Logo" className="h-8 mx-auto" />
          </div>
          <p className="text-white">
            This report was generated by KarmicDD's AI-powered Financial Due Diligence system.
            <br />
            The analysis is based on the documents provided and complies with Indian company standards.
          </p>
          <div className="mt-3 flex justify-center space-x-4">
            <button
              onClick={handleShareReport}
              className="px-4 py-2 bg-white text-indigo-700 hover:bg-gray-100 rounded-lg flex items-center shadow-sm border border-white font-medium transition-all duration-200"
            >
              <FiShare2 className="mr-2" />
              Share Report
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white flex items-center shadow-sm font-medium transition-all duration-200"
            >
              <FiDownload className="mr-2" />
              Export PDF
            </button>
          </div>
          <p className="text-indigo-200 text-xs mt-4">
            Generated on {formatDate(report.generatedDate)}
            {report.isOldData && <span className="ml-2 bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs">Cached Data</span>}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancialDueDiligenceReportContent;

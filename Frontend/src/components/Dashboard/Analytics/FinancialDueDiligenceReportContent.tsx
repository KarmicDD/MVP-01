import React from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiShare2, FiDollarSign, FiTrendingUp, FiAlertCircle, FiCheckCircle, FiBarChart2, FiFileText, FiInfo, FiArrowUp, FiArrowDown, FiMinus, FiActivity, FiTarget, FiGlobe, FiAward, FiShield, FiLayers, FiPieChart } from 'react-icons/fi';
import { FinancialDueDiligenceReport as MatchFinancialDueDiligenceReport } from '../../../hooks/useFinancialDueDiligence';
import { FinancialDueDiligenceReport as EntityFinancialDueDiligenceReport, ChartData } from '../../../hooks/useEntityFinancialDueDiligence';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Title, Tooltip as ChartTooltip, Legend, Filler } from 'chart.js';
import { Line, Bar, Pie, Radar } from 'react-chartjs-2';
import ChartRenderer from './ChartRenderer';

// Create a union type that can handle both report types
type FinancialDueDiligenceReport = MatchFinancialDueDiligenceReport | EntityFinancialDueDiligenceReport;

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
  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
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

  // Helper function to get risk level color
  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to get trend icon
  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'increasing':
      case 'improving':
        return <FiArrowUp className="text-green-500" />;
      case 'decreasing':
      case 'deteriorating':
        return <FiArrowDown className="text-red-500" />;
      case 'stable':
        return <FiMinus className="text-gray-500" />;
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

  // Chart colors
  const CHART_COLORS = {
    primary: '#5A42E3',
    secondary: '#818CF8',
    tertiary: '#C3DAFE',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    neutral: '#6B7280',
    background: '#F1F2FE',
  };

  // Pie chart colors
  const PIE_COLORS = ['#5A42E3', '#10B981', '#F59E0B', '#EF4444', '#6B7280', '#818CF8', '#C3DAFE'];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Show notification for old data */}
      {report.isOldData && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                {report.message || 'Daily request limit reached. Showing previously generated data.'}
                {report.generatedDate && (
                  <span className="ml-1 font-medium">
                    (Generated on {formatDate(report.generatedDate)})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Show warning for incomplete financial data extraction */}
      {report.reportCalculated === false && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <span className="font-medium">Limited Analysis Available:</span> Our system was unable to extract complete financial data from the provided documents. The analysis below is based on limited information and may not be comprehensive.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Financial Due Diligence Report</h2>
            <div className="flex items-center mt-2">
              <div className="h-1 w-10 bg-indigo-300 rounded mr-2"></div>
              <p className="text-indigo-100">
                Generated on {formatDate(report.generatedDate)}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <motion.button
              className="px-4 py-2 bg-white text-indigo-700 hover:bg-gray-100 rounded-lg flex items-center shadow-md border border-white font-medium transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShareReport}
              title="Share this report"
            >
              <FiShare2 className="mr-2" />
              Share
            </motion.button>
            <motion.button
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white flex items-center shadow-md font-medium transition-all duration-200"
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

        {/* Report summary badges */}
        <div className="flex flex-wrap gap-3 mt-4">
          {report.reportCalculated && (
            <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center">
              <FiCheckCircle className="mr-1" /> Complete Analysis
            </span>
          )}
          {report.documentAnalysis?.availableDocuments && (
            <span className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center">
              <FiFileText className="mr-1" /> {report.documentAnalysis.availableDocuments.length} Documents Analyzed
            </span>
          )}
          {report.auditFindings?.complianceScore && (
            <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center">
              <FiTarget className="mr-1" /> Compliance Score: {report.auditFindings.complianceScore}
            </span>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="p-6 space-y-8">
        {/* Executive Summary */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-600 p-2 rounded-lg mr-3">
              <FiActivity className="text-white text-xl" />
            </div>
            <h3 className="text-xl font-bold text-indigo-900">{report.executiveSummary?.headline || "Executive Summary"}</h3>
          </div>

          <p className="text-gray-700 leading-relaxed mb-5">{report.executiveSummary?.summary || "No summary available."}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {report.executiveSummary?.keyFindings && report.executiveSummary.keyFindings.length > 0 && (
              <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                <h4 className="font-semibold text-indigo-800 mb-3 flex items-center">
                  <FiInfo className="mr-2 text-indigo-600" />
                  Key Findings
                </h4>
                <ul className="space-y-2">
                  {report.executiveSummary.keyFindings.map((finding, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-flex items-center justify-center bg-indigo-100 text-indigo-800 w-5 h-5 rounded-full text-xs font-bold mr-2 mt-0.5">{index + 1}</span>
                      <span className="text-gray-700">{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {report.executiveSummary?.recommendedActions && report.executiveSummary.recommendedActions.length > 0 && (
              <div className="bg-white p-4 rounded-lg border border-green-100 shadow-sm">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                  <FiCheckCircle className="mr-2 text-green-600" />
                  Recommended Actions
                </h4>
                <ul className="space-y-2">
                  {report.executiveSummary.recommendedActions.map((action, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-flex items-center justify-center bg-green-100 text-green-800 w-5 h-5 rounded-full text-xs font-bold mr-2 mt-0.5">{index + 1}</span>
                      <span className="text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

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
                  {metric.chartData && (
                    <div className="mt-3 mb-3">
                      <ChartRenderer chartData={metric.chartData} height={120} />
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
              report.metrics && report.metrics.map((metric, index) => (
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
        {report.financialAnalysis?.financialHealthScore && (
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
                  <div className={`text-5xl font-bold mb-2 ${report.financialAnalysis.financialHealthScore.rating === 'Excellent' ? 'text-green-600' :
                    report.financialAnalysis.financialHealthScore.rating === 'Good' ? 'text-blue-600' :
                      report.financialAnalysis.financialHealthScore.rating === 'Fair' ? 'text-yellow-600' :
                        report.financialAnalysis.financialHealthScore.rating === 'Poor' ? 'text-orange-600' :
                          'text-red-600'
                    }`}>
                    {report.financialAnalysis.financialHealthScore.score}
                  </div>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${report.financialAnalysis.financialHealthScore.rating === 'Excellent' ? 'bg-green-100 text-green-800' :
                    report.financialAnalysis.financialHealthScore.rating === 'Good' ? 'bg-blue-100 text-blue-800' :
                      report.financialAnalysis.financialHealthScore.rating === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                        report.financialAnalysis.financialHealthScore.rating === 'Poor' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                    }`}>
                    {report.financialAnalysis.financialHealthScore.rating}
                  </div>
                  <p className="mt-4 text-gray-600 text-sm">
                    {report.financialAnalysis.financialHealthScore.description}
                  </p>
                </div>
              </div>

              <div className="md:col-span-2">
                {report.financialAnalysis.financialHealthScore.chartData ? (
                  <ChartRenderer
                    chartData={report.financialAnalysis.financialHealthScore.chartData}
                    height={250}
                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
                  />
                ) : (
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="font-semibold text-gray-800 mb-3">Score Components</h4>
                    <div className="space-y-3">
                      {report.financialAnalysis.financialHealthScore.components.map((component, index) => (
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
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="flex items-center mb-5">
              <div className="bg-purple-600 p-2 rounded-lg mr-3">
                <FiTrendingUp className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Financial Trends</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {report.financialAnalysis.trends.map((trend, index) => (
                <motion.div
                  key={index}
                  className="rounded-lg border p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
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
                  {trend.chartData ? (
                    <div className="h-40 mb-3">
                      <ChartRenderer chartData={trend.chartData} height={160} />
                    </div>
                  ) : trend.data && trend.data.length > 0 ? (
                    // Fallback to create chart from data if chartData is not available
                    <div className="h-40 mb-3">
                      <Line
                        data={{
                          labels: trend.data.map(item => item.period.length > 10 ? `${item.period.substring(0, 10)}...` : item.period),
                          datasets: [
                            {
                              label: trend.name,
                              data: trend.data.map(item => typeof item.value === 'number' ? item.value : 0),
                              borderColor: trend.impact === 'positive' ? CHART_COLORS.success :
                                trend.impact === 'negative' ? CHART_COLORS.danger : CHART_COLORS.primary,
                              backgroundColor: trend.impact === 'positive' ? 'rgba(16, 185, 129, 0.1)' :
                                trend.impact === 'negative' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(90, 66, 227, 0.1)',
                              borderWidth: 2,
                              pointRadius: 4,
                              pointHoverRadius: 6,
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
                    </div>
                  ) : null}

                  <p className="text-sm text-gray-600 mb-3">{trend.description}</p>

                  <div className="flex items-center mt-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend.impact === 'positive' ? 'bg-green-100 text-green-800' :
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
                  <FiTarget className="mr-2 text-purple-600" />
                  Growth Projections
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {report.financialAnalysis.growthProjections.map((projection, index) => (
                    <motion.div
                      key={index}
                      className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm"
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
          <div className="bg-white p-6 rounded-xl shadow-md border border-green-100">
            <div className="flex items-center mb-4">
              <div className="bg-green-600 p-2 rounded-lg mr-3">
                <FiCheckCircle className="text-white" />
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
          <div className="bg-white p-6 rounded-xl shadow-md border border-red-100">
            <div className="flex items-center mb-4">
              <div className="bg-red-600 p-2 rounded-lg mr-3">
                <FiAlertCircle className="text-white" />
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

                    {risk.mitigationStrategy && (
                      <div className="bg-white p-2 rounded border border-green-50">
                        <span className="font-medium text-green-700">Mitigation:</span>
                        <p className="text-gray-600 mt-1">{risk.mitigationStrategy}</p>
                      </div>
                    )}
                  </div>

                  {risk.timeHorizon && (
                    <div className="mt-2 flex justify-end">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        {risk.timeHorizon.replace('_', ' ')} horizon
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
          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
            <div className="flex items-center mb-5">
              <div className="bg-blue-600 p-2 rounded-lg mr-3">
                <FiFileText className="text-white" />
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
                    {report.complianceItems.some(item => item.deadline) && (
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
                            {item.regulatoryBody && (
                              <div className="text-xs text-gray-500 mt-1">
                                Regulatory Body: {item.regulatoryBody}
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
                      {report.complianceItems.some(item => item.deadline) && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.deadline || '-'}
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
          <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100">
            <div className="flex items-center mb-5">
              <div className="bg-indigo-600 p-2 rounded-lg mr-3">
                <FiBarChart2 className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Financial Ratio Analysis</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Liquidity Ratios */}
              {report.ratioAnalysis.liquidityRatios.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-100 shadow-sm">
                  <h4 className="font-semibold text-blue-800 mb-4 flex items-center">
                    <FiActivity className="mr-2 text-blue-600" />
                    Liquidity Ratios
                  </h4>

                  <div className="space-y-4">
                    {report.ratioAnalysis.liquidityRatios.map((ratio, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
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
                              <span>{Math.max(ratio.value, ratio.industry_average) * 1.5}</span>
                            </div>
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                              {/* Company value bar */}
                              <div
                                className={`h-full ${ratio.status === 'good' ? 'bg-green-500' :
                                  ratio.status === 'warning' ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                style={{
                                  width: `${Math.min(100, (ratio.value / (Math.max(ratio.value, ratio.industry_average) * 1.5)) * 100)}%`
                                }}
                              ></div>
                              {/* Industry average marker */}
                              <div
                                className="h-4 w-0.5 bg-gray-800 absolute mt-[-8px]"
                                style={{
                                  marginLeft: `${Math.min(100, (ratio.industry_average / (Math.max(ratio.value, ratio.industry_average) * 1.5)) * 100)}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Historical data chart */}
                        {ratio.historicalData && ratio.historicalData.length > 1 && (
                          <div className="h-24 mt-3 mb-2">
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
                              <span>{Math.max(ratio.value, ratio.industry_average) * 1.5}</span>
                            </div>
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                              {/* Company value bar */}
                              <div
                                className={`h-full ${ratio.status === 'good' ? 'bg-green-500' :
                                  ratio.status === 'warning' ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                style={{
                                  width: `${Math.min(100, (ratio.value / (Math.max(ratio.value, ratio.industry_average) * 1.5)) * 100)}%`
                                }}
                              ></div>
                              {/* Industry average marker */}
                              <div
                                className="h-4 w-0.5 bg-gray-800 absolute mt-[-8px]"
                                style={{
                                  marginLeft: `${Math.min(100, (ratio.industry_average / (Math.max(ratio.value, ratio.industry_average) * 1.5)) * 100)}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Historical data chart */}
                        {ratio.historicalData && ratio.historicalData.length > 1 && (
                          <div className="h-24 mt-3 mb-2">
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
                              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
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

            {/* Benchmarking Charts */}
            {report.industryBenchmarking.benchmarkingCharts && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Industry Performance Benchmarking</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {report.industryBenchmarking.benchmarkingCharts.financialPerformance && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h5 className="font-semibold text-gray-800 mb-3">Financial Performance</h5>
                      <ChartRenderer
                        chartData={report.industryBenchmarking.benchmarkingCharts.financialPerformance}
                        height={250}
                      />
                    </div>
                  )}

                  {report.industryBenchmarking.benchmarkingCharts.operationalEfficiency && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h5 className="font-semibold text-gray-800 mb-3">Operational Efficiency</h5>
                      <ChartRenderer
                        chartData={report.industryBenchmarking.benchmarkingCharts.operationalEfficiency}
                        height={250}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Industry Outlook */}
            {report.industryBenchmarking.industryOutlook && (
              <div className="mb-6 bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-lg border border-teal-100">
                <h4 className="font-semibold text-teal-800 mb-2">Industry Outlook</h4>
                <p className="text-gray-700">{report.industryBenchmarking.industryOutlook}</p>
              </div>
            )}

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

        {/* Legal and Regulatory Compliance */}
        {report.legalAndRegulatoryCompliance && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
            <div className="flex items-center mb-5">
              <div className="bg-blue-600 p-2 rounded-lg mr-3">
                <FiShield className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Legal & Regulatory Compliance</h3>
            </div>

            <div className="mb-4">
              <p className="text-gray-700">{report.legalAndRegulatoryCompliance.overview}</p>
            </div>

            {/* Compliance Chart */}
            {report.legalAndRegulatoryCompliance.complianceChart && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-1">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-full">
                    <h4 className="font-semibold text-gray-800 mb-3">Compliance Status</h4>
                    <div className="h-64">
                      <ChartRenderer chartData={report.legalAndRegulatoryCompliance.complianceChart} height={250} />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm h-full">
                    <h4 className="font-semibold text-gray-800 mb-3">Compliance Areas</h4>
                    <div className="space-y-3">
                      {report.legalAndRegulatoryCompliance.complianceAreas.slice(0, 3).map((area, index) => (
                        <div key={index} className="flex items-start">
                          <div className={`p-1 rounded-full flex-shrink-0 mt-1 mr-2 ${area.status === 'compliant' ? 'bg-green-100' :
                              area.status === 'partial' ? 'bg-yellow-100' :
                                'bg-red-100'
                            }`}>
                            {area.status === 'compliant' ? (
                              <FiCheckCircle className="text-green-600" size={14} />
                            ) : area.status === 'partial' ? (
                              <FiAlertCircle className="text-yellow-600" size={14} />
                            ) : (
                              <FiAlertCircle className="text-red-600" size={14} />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{area.area}</div>
                            <div className="text-sm text-gray-600">{area.description}</div>
                          </div>
                        </div>
                      ))}
                      {report.legalAndRegulatoryCompliance.complianceAreas.length > 3 && (
                        <div className="text-sm text-blue-600 font-medium">
                          +{report.legalAndRegulatoryCompliance.complianceAreas.length - 3} more compliance areas
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Compliance Areas */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Compliance Areas</h4>
              <div className="space-y-4">
                {report.legalAndRegulatoryCompliance.complianceAreas.map((area, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${area.status === 'compliant' ? 'bg-green-50 border-green-200' :
                        area.status === 'partial' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-red-50 border-red-200'
                      }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-semibold text-gray-800">{area.area}</div>
                      <span className={`px-2 py-1 text-xs rounded-full ${area.status === 'compliant' ? 'bg-green-100 text-green-800' :
                          area.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {area.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{area.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {area.risks && area.risks.length > 0 && (
                        <div className="bg-white p-3 rounded border border-red-100">
                          <div className="text-sm font-medium text-red-700 mb-1">Risks:</div>
                          <ul className="list-disc pl-4 space-y-1">
                            {area.risks.map((risk, idx) => (
                              <li key={idx} className="text-xs text-gray-700">{risk}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {area.recommendations && area.recommendations.length > 0 && (
                        <div className="bg-white p-3 rounded border border-blue-100">
                          <div className="text-sm font-medium text-blue-700 mb-1">Recommendations:</div>
                          <ul className="list-disc pl-4 space-y-1">
                            {area.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-xs text-gray-700">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {area.deadlines && (
                      <div className="mt-3 text-xs text-gray-600">
                        <span className="font-medium">Upcoming deadlines:</span> {area.deadlines}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Legal Matters */}
            {report.legalAndRegulatoryCompliance.pendingLegalMatters &&
              report.legalAndRegulatoryCompliance.pendingLegalMatters.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Pending Legal Matters</h4>
                  <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matter</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Potential Impact</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recommended Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {report.legalAndRegulatoryCompliance.pendingLegalMatters.map((matter, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{matter.matter}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${matter.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                  matter.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                {matter.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{matter.potentialImpact}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{matter.recommendedAction}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Company and Investor Information */}
        {(report.startupInfo || report.investorInfo) && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-6">
            <div className="flex items-center mb-5">
              <div className="bg-gray-600 p-2 rounded-lg mr-3">
                <FiInfo className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Company Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Startup Information */}
              {report.startupInfo && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-100">
                  <h4 className="font-semibold text-indigo-800 mb-3 flex items-center">
                    <FiBarChart2 className="mr-2 text-indigo-600" />
                    Startup Information
                  </h4>
                  <div className="space-y-2 bg-white p-3 rounded-lg border border-indigo-50">
                    <p className="text-sm"><span className="font-medium text-gray-700">Company:</span> {report.startupInfo.companyName}</p>
                    <p className="text-sm"><span className="font-medium text-gray-700">Industry:</span> {report.startupInfo.industry}</p>
                    {report.startupInfo.stage && <p className="text-sm"><span className="font-medium text-gray-700">Stage:</span> {report.startupInfo.stage}</p>}
                    {report.startupInfo.foundingDate && <p className="text-sm"><span className="font-medium text-gray-700">Founded:</span> {report.startupInfo.foundingDate}</p>}
                    {report.startupInfo.teamSize && <p className="text-sm"><span className="font-medium text-gray-700">Team Size:</span> {report.startupInfo.teamSize}</p>}
                    {report.startupInfo.location && <p className="text-sm"><span className="font-medium text-gray-700">Location:</span> {report.startupInfo.location}</p>}
                    {report.startupInfo.fundingRound && <p className="text-sm"><span className="font-medium text-gray-700">Funding Round:</span> {report.startupInfo.fundingRound}</p>}
                    {report.startupInfo.fundingAmount && <p className="text-sm"><span className="font-medium text-gray-700">Funding Amount:</span> {report.startupInfo.fundingAmount}</p>}
                    {report.startupInfo.valuation && <p className="text-sm"><span className="font-medium text-gray-700">Valuation:</span> {report.startupInfo.valuation}</p>}
                  </div>
                </div>
              )}

              {/* Investor Information */}
              {report.investorInfo && (
                <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-lg border border-green-100">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <FiDollarSign className="mr-2 text-green-600" />
                    Investor Information
                  </h4>
                  <div className="space-y-2 bg-white p-3 rounded-lg border border-green-50">
                    {report.investorInfo.name && <p className="text-sm"><span className="font-medium text-gray-700">Name:</span> {report.investorInfo.name}</p>}
                    {report.investorInfo.investmentStage && <p className="text-sm"><span className="font-medium text-gray-700">Investment Stage:</span> {report.investorInfo.investmentStage}</p>}
                    {report.investorInfo.investmentSize && <p className="text-sm"><span className="font-medium text-gray-700">Investment Size:</span> {report.investorInfo.investmentSize}</p>}
                    {report.investorInfo.sectors && <p className="text-sm"><span className="font-medium text-gray-700">Sectors:</span> {typeof report.investorInfo.sectors === 'string' ? report.investorInfo.sectors : report.investorInfo.sectors.join(', ')}</p>}
                    {report.investorInfo.location && <p className="text-sm"><span className="font-medium text-gray-700">Location:</span> {report.investorInfo.location}</p>}
                    {report.investorInfo.portfolio && <p className="text-sm"><span className="font-medium text-gray-700">Portfolio:</span> {typeof report.investorInfo.portfolio === 'string' ? report.investorInfo.portfolio : report.investorInfo.portfolio.join(', ')}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
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

                {report.documentAnalysis.missingDocuments.priorityLevel && (
                  <div className="mb-3 flex items-center">
                    <span className="text-sm font-medium text-gray-700 mr-2">Priority Level:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${report.documentAnalysis.missingDocuments.priorityLevel === 'high' ? 'bg-red-100 text-red-800' :
                      report.documentAnalysis.missingDocuments.priorityLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                      {report.documentAnalysis.missingDocuments.priorityLevel}
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
        {!report.documentAnalysis && report.missingDocuments && report.missingDocuments.list.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-yellow-100 mt-6">
            <div className="flex items-center mb-5">
              <div className="bg-yellow-600 p-2 rounded-lg mr-3">
                <FiAlertCircle className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Missing Documents</h3>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-5 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-700 mb-4 bg-white p-3 rounded border border-yellow-100">
                {report.missingDocuments.impact}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-amber-700 mb-2">Missing Document List:</h5>
                  <ul className="bg-white p-3 rounded border border-yellow-100 list-disc pl-5 space-y-1">
                    {report.missingDocuments.list.map((doc, index) => (
                      <li key={index} className="text-sm text-gray-700">{doc}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium text-amber-700 mb-2">Recommendations:</h5>
                  <ul className="bg-white p-3 rounded border border-yellow-100 list-disc pl-5 space-y-1">
                    {report.missingDocuments.recommendations.map((rec, index) => (
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

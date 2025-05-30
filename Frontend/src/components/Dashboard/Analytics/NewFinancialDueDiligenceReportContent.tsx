import React from 'react';
import { motion } from 'framer-motion';
import {
  FiDownload,
  FiShare2,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiFileText,
  FiTrendingUp,
  FiActivity,
  FiShield,
  FiTarget,
  FiBarChart,
  FiCalendar,
  FiAward,
  FiBriefcase,
  FiStar
} from 'react-icons/fi';
import { NewFinancialDueDiligenceReport } from '../../../hooks/useNewFinancialDueDiligence';

interface NewFinancialDueDiligenceReportContentProps {
  report: NewFinancialDueDiligenceReport;
  formatDate: (date: string) => string;
  handleExportPDF: () => void;
  handleShareReport: () => void;
  isCompact?: boolean;
}

const NewFinancialDueDiligenceReportContent: React.FC<NewFinancialDueDiligenceReportContentProps> = ({
  report,
  formatDate,
  handleExportPDF,
  handleShareReport,
  isCompact = false
}) => {
  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'good':
      case 'excellent':
      case 'compliant':
        return 'text-emerald-600';
      case 'warning':
      case 'fair':
      case 'partial':
        return 'text-amber-600';
      case 'critical':
      case 'poor':
      case 'non-compliant':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  };

  // Helper function to get background status color
  const getStatusBgColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'good':
      case 'excellent':
      case 'compliant':
        return 'bg-emerald-50 border-emerald-200';
      case 'warning':
      case 'fair':
      case 'partial':
        return 'bg-amber-50 border-amber-200';
      case 'critical':
      case 'poor':
      case 'non-compliant':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'good':
      case 'excellent':
      case 'compliant':
        return <FiCheckCircle className="mr-2" />;
      case 'warning':
      case 'fair':
      case 'partial':
        return <FiAlertTriangle className="mr-2" />;
      case 'critical':
      case 'poor':
      case 'non-compliant':
        return <FiXCircle className="mr-2" />;
      default:
        return <FiInfo className="mr-2" />;
    }
  };

  // Helper function to format text with bold styling for **text**
  const formatTextWithBold = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return (
          <span key={index} className="font-bold text-slate-800 tracking-wide">
            {boldText}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-green-50 min-h-screen">
      {/* Professional Report Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 text-white shadow-2xl">
        <div className="px-8 py-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <FiFileText className="text-emerald-400 text-3xl mr-4" />
                <div>
                  <span className="text-emerald-300 text-sm font-medium tracking-wider uppercase block">Professional Assessment</span>
                  <span className="text-slate-300 text-xs">Due Diligence Report</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                Financial Assessment
              </h1>
              <h2 className="text-2xl text-emerald-200 font-semibold mb-4">
                {report.companyName}
              </h2>
              {report.reportDate && (
                <div className="flex items-center text-slate-300 bg-slate-800/30 px-4 py-2 rounded-lg w-fit">
                  <FiCalendar className="mr-2 text-emerald-400" />
                  <span>Generated on {formatDate(report.reportDate)}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col space-y-3">
              <button
                onClick={handleExportPDF}
                className="flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <FiDownload className="mr-2" /> Export PDF
              </button>
              <button
                onClick={handleShareReport}
                className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white border border-green-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <FiShare2 className="mr-2" /> Share Report
              </button>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-600"></div>
      </div>

      <div className="px-8 py-8">
        {/* Introduction Section */}
        {report.introduction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <div className="bg-white shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-green-700 px-6 py-4">
                <div className="flex items-center">
                  <FiInfo className="text-emerald-200 text-xl mr-3" />
                  <h3 className="text-xl font-bold text-white tracking-wide uppercase">Introduction</h3>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-b from-white to-slate-50">
                <div className="prose max-w-none text-slate-700 leading-relaxed">
                  {report.introduction.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-lg">{formatTextWithBold(paragraph)}</p>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Itemized Due Diligence */}
        {report.items && report.items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-10"
          >
            <div className="bg-white shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-green-700 px-6 py-4">
                <div className="flex items-center">
                  <FiActivity className="text-emerald-200 text-xl mr-3" />
                  <h3 className="text-xl font-bold text-white tracking-wide uppercase">Itemized Due Diligence</h3>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-b from-white to-slate-50">
                <div className="space-y-8">
                  {report.items.map((item, index) => (
                    <div key={index} className="bg-white border border-slate-200 shadow-md hover:shadow-lg transition-shadow duration-300">
                      <div className="bg-gradient-to-r from-slate-100 to-slate-200 px-6 py-4 border-b border-slate-200">
                        <h4 className="text-xl font-bold text-slate-800">{item.title}</h4>
                      </div>
                      <div className="p-6">
                        {/* Facts */}
                        {item.facts && item.facts.length > 0 && (
                          <div className="mb-6">
                            <div className="flex items-center mb-3">
                              <FiTarget className="text-blue-600 mr-2" />
                              <h5 className="font-bold text-slate-700 text-lg">Facts</h5>
                            </div>
                            <ul className="space-y-2">
                              {item.facts.map((fact, factIndex) => (
                                <li key={factIndex} className="flex items-start">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                  <span className="text-slate-600 leading-relaxed">{formatTextWithBold(fact)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Key Findings */}
                        {item.keyFindings && item.keyFindings.length > 0 && (
                          <div className="mb-6">
                            <div className="flex items-center mb-3">
                              <FiStar className="text-amber-600 mr-2" />
                              <h5 className="font-bold text-slate-700 text-lg">Key Findings</h5>
                            </div>
                            <ul className="space-y-2">
                              {item.keyFindings.map((finding, findingIndex) => (
                                <li key={findingIndex} className="flex items-start">
                                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                  <span className="text-slate-600 leading-relaxed">{formatTextWithBold(finding)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Recommended Actions */}
                        {item.recommendedActions && item.recommendedActions.length > 0 && (
                          <div>
                            <div className="flex items-center mb-3">
                              <FiTrendingUp className="text-emerald-600 mr-2" />
                              <h5 className="font-bold text-slate-700 text-lg">Recommended Actions</h5>
                            </div>
                            <ul className="space-y-2">
                              {item.recommendedActions.map((action, actionIndex) => (
                                <li key={actionIndex} className="flex items-start">
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                  <span className="text-slate-600 leading-relaxed">{formatTextWithBold(action)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Company Score */}
        {report.totalCompanyScore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10"
          >
            <div className="bg-white shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-green-700 px-6 py-4">
                <div className="flex items-center">
                  <FiAward className="text-emerald-200 text-xl mr-3" />
                  <h3 className="text-xl font-bold text-white tracking-wide uppercase">Company Score</h3>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-b from-white to-slate-50">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                      <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center">
                        <span className="text-4xl font-bold text-slate-800">{report.totalCompanyScore.score}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-8">
                    <div className={`flex items-center mb-3 px-4 py-2 rounded-lg ${getStatusBgColor(report.totalCompanyScore.rating)}`}>
                      {getStatusIcon(report.totalCompanyScore.rating)}
                      <span className={`text-2xl font-bold ${getStatusColor(report.totalCompanyScore.rating)}`}>
                        {report.totalCompanyScore.rating}
                      </span>
                    </div>
                    <p className="text-slate-600 text-lg leading-relaxed max-w-lg">{formatTextWithBold(report.totalCompanyScore.description)}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Investment Decision */}
        {report.investmentDecision && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-10"
          >
            <div className="bg-white shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-4">
                <div className="flex items-center">
                  <FiBriefcase className="text-green-200 text-xl mr-3" />
                  <h3 className="text-xl font-bold text-white tracking-wide uppercase">Investment Decision</h3>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-b from-white to-slate-50">
                <div className="grid md:grid-cols-2 gap-8 mb-6">
                  <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100">
                    <h4 className="text-lg font-bold text-slate-700 mb-3">Recommendation</h4>
                    <div className={`flex items-center px-4 py-3 rounded-lg ${getStatusBgColor(report.investmentDecision.recommendation)}`}>
                      {getStatusIcon(report.investmentDecision.recommendation)}
                      <span className={`text-xl font-bold ${getStatusColor(report.investmentDecision.recommendation)}`}>
                        {report.investmentDecision.recommendation}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100">
                    <h4 className="text-lg font-bold text-slate-700 mb-3">Success Probability</h4>
                    <div className="flex items-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg mr-4">
                        <span className="text-xl font-bold text-white">{report.investmentDecision.successProbability}%</span>
                      </div>
                      <span className="text-2xl font-bold text-blue-600">{report.investmentDecision.successProbability}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100 mb-6">
                  <h4 className="text-lg font-bold text-slate-700 mb-3">Justification</h4>
                  <p className="text-slate-600 leading-relaxed">{formatTextWithBold(report.investmentDecision.justification)}</p>
                </div>

                {report.investmentDecision.keyConsiderations && report.investmentDecision.keyConsiderations.length > 0 && (
                  <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100 mb-6">
                    <h4 className="text-lg font-bold text-slate-700 mb-4">Key Considerations</h4>
                    <ul className="space-y-3">
                      {report.investmentDecision.keyConsiderations.map((consideration, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-slate-600 leading-relaxed">{formatTextWithBold(consideration)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.investmentDecision.suggestedTerms && report.investmentDecision.suggestedTerms.length > 0 && (
                  <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100">
                    <h4 className="text-lg font-bold text-slate-700 mb-4">Suggested Terms</h4>
                    <ul className="space-y-3">
                      {report.investmentDecision.suggestedTerms.map((term, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-slate-600 leading-relaxed">{formatTextWithBold(term)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Executive Summary */}
        {report.executiveSummary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10"
          >
            <div className="bg-white shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-green-700 px-6 py-4">
                <div className="flex items-center">
                  <FiStar className="text-emerald-200 text-xl mr-3" />
                  <h3 className="text-xl font-bold text-white tracking-wide uppercase">Executive Summary</h3>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-b from-white to-slate-50">
                <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100 mb-6">
                  <h4 className="text-2xl font-bold text-slate-800 mb-4">{formatTextWithBold(report.executiveSummary.headline)}</h4>
                  <p className="text-slate-600 leading-relaxed text-lg">{formatTextWithBold(report.executiveSummary.summary)}</p>
                </div>

                {report.executiveSummary.keyFindings && report.executiveSummary.keyFindings.length > 0 && (
                  <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100 mb-6">
                    <div className="flex items-center mb-4">
                      <FiTarget className="text-emerald-600 mr-2" />
                      <h4 className="text-lg font-bold text-slate-700">Key Findings</h4>
                    </div>
                    <ul className="space-y-3">
                      {report.executiveSummary.keyFindings.map((finding, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-slate-600 leading-relaxed">{formatTextWithBold(finding)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.executiveSummary.recommendedActions && report.executiveSummary.recommendedActions.length > 0 && (
                  <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100">
                    <div className="flex items-center mb-4">
                      <FiTrendingUp className="text-emerald-600 mr-2" />
                      <h4 className="text-lg font-bold text-slate-700">Recommended Actions</h4>
                    </div>
                    <ul className="space-y-3">
                      {report.executiveSummary.recommendedActions.map((action, index) => (
                        <li key={index} className="flex items-start">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-slate-600 leading-relaxed">{formatTextWithBold(action)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Financial Analysis */}
        {report.financialAnalysis && !isCompact && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-10"
          >
            <div className="bg-white shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-green-700 px-6 py-4">
                <div className="flex items-center">
                  <FiTrendingUp className="text-emerald-200 text-xl mr-3" />
                  <h3 className="text-xl font-bold text-white tracking-wide uppercase">Financial Analysis</h3>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-b from-white to-slate-50">
                {/* Metrics */}
                {report.financialAnalysis.metrics && report.financialAnalysis.metrics.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center mb-6">
                      <FiBarChart className="text-emerald-600 mr-2" />
                      <h4 className="text-xl font-bold text-slate-700">Key Metrics</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {report.financialAnalysis.metrics.map((metric, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-slate-100 hover:shadow-lg transition-all duration-300">
                          <div className="flex justify-between items-start mb-4">
                            <h5 className="font-bold text-slate-800 text-lg">{metric.name}</h5>
                            <div className={`flex items-center px-3 py-1 rounded-lg ${getStatusBgColor(metric.status)}`}>
                              {getStatusIcon(metric.status)}
                              <span className={`text-sm font-bold ${getStatusColor(metric.status)}`}>
                                {metric.status}
                              </span>
                            </div>
                          </div>
                          <p className="text-3xl font-bold text-slate-800 mb-3">{metric.value}</p>
                          <p className="text-slate-600 leading-relaxed mb-3">{metric.description}</p>
                          {metric.trend && (
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <p className="text-sm font-semibold text-slate-700">
                                Trend: <span className="text-slate-600">{metric.trend}</span>
                                {metric.percentChange && <span className="text-blue-600 ml-2">({metric.percentChange})</span>}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trends */}
                {report.financialAnalysis.trends && report.financialAnalysis.trends.length > 0 && (
                  <div>
                    <div className="flex items-center mb-6">
                      <FiActivity className="text-teal-600 mr-2" />
                      <h4 className="text-xl font-bold text-slate-700">Trends</h4>
                    </div>
                    <div className="space-y-6">
                      {report.financialAnalysis.trends.map((trend, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-slate-100 hover:shadow-lg transition-all duration-300">
                          <h5 className="font-bold text-slate-800 text-lg mb-3">{trend.name}</h5>
                          <p className="text-slate-600 leading-relaxed mb-4">{trend.description}</p>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <p className="text-sm font-semibold text-slate-700">
                                Trend: <span className="text-slate-800">{trend.trend}</span>
                              </p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <p className="text-sm font-semibold text-slate-700">
                                Impact: <span className={`font-bold ${trend.impact === 'positive' ? 'text-emerald-600' : trend.impact === 'negative' ? 'text-red-600' : 'text-amber-600'}`}>
                                  {trend.impact}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        {report.recommendations && report.recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-10"
          >
            <div className="bg-white shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-green-700 px-6 py-4">
                <div className="flex items-center">
                  <FiTarget className="text-emerald-200 text-xl mr-3" />
                  <h3 className="text-xl font-bold text-white tracking-wide uppercase">Recommendations</h3>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-b from-white to-slate-50">
                <div className="space-y-4">
                  {report.recommendations.map((recommendation, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-slate-100 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-lg">{formatTextWithBold(recommendation)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Missing Documents */}
        {report.missingDocuments && report.missingDocuments.documentList && report.missingDocuments.documentList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mb-10"
          >
            <div className="bg-white shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-green-700 px-6 py-4">
                <div className="flex items-center">
                  <FiFileText className="text-emerald-200 text-xl mr-3" />
                  <h3 className="text-xl font-bold text-white tracking-wide uppercase">Missing Documents</h3>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-b from-white to-slate-50">
                <div className="overflow-hidden rounded-lg shadow-md border border-slate-200">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-100 to-slate-200">
                        <th className="py-4 px-6 text-left font-bold text-slate-700 border-b border-slate-300">Document Category</th>
                        <th className="py-4 px-6 text-left font-bold text-slate-700 border-b border-slate-300">Specific Document</th>
                        <th className="py-4 px-6 text-left font-bold text-slate-700 border-b border-slate-300">Requirement Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.missingDocuments.documentList.map((doc, index) => (
                        <tr key={index} className={`hover:bg-slate-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                          <td className="py-4 px-6 border-b border-slate-200 text-slate-700 font-medium">{formatTextWithBold(doc.documentCategory)}</td>
                          <td className="py-4 px-6 border-b border-slate-200 text-slate-600">{formatTextWithBold(doc.specificDocument)}</td>
                          <td className="py-4 px-6 border-b border-slate-200 text-slate-600">{formatTextWithBold(doc.requirementReference)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {report.missingDocuments.note && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg shadow-sm">
                    <div className="flex items-start">
                      <FiInfo className="text-amber-600 mr-3 mt-1 flex-shrink-0" />
                      <p className="text-amber-800 leading-relaxed">{formatTextWithBold(report.missingDocuments.note)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Risk Score */}
        {report.riskScore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mb-10"
          >
            <div className="bg-white shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4">
                <div className="flex items-center">
                  <FiShield className="text-red-200 text-xl mr-3" />
                  <h3 className="text-xl font-bold text-white tracking-wide uppercase">Risk Assessment</h3>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-b from-white to-slate-50">
                <div className="flex items-center justify-center mb-8">
                  <div className="relative">
                    <div className={`w-32 h-32 rounded-full flex items-center justify-center shadow-2xl ${report.riskScore.riskLevel.toLowerCase().includes('high') ? 'bg-gradient-to-br from-red-500 to-red-600' :
                      report.riskScore.riskLevel.toLowerCase().includes('moderate') ? 'bg-gradient-to-br from-amber-500 to-amber-600' :
                        'bg-gradient-to-br from-emerald-500 to-emerald-600'
                      }`}>
                      <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center">
                        <span className="text-4xl font-bold text-slate-800">{report.riskScore.score}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-8">
                    <div className={`flex items-center mb-3 px-4 py-2 rounded-lg ${report.riskScore.riskLevel.toLowerCase().includes('high') ? 'bg-red-50 border border-red-200' :
                      report.riskScore.riskLevel.toLowerCase().includes('moderate') ? 'bg-amber-50 border border-amber-200' :
                        'bg-emerald-50 border border-emerald-200'
                      }`}>
                      <FiAlertTriangle className={`mr-2 ${report.riskScore.riskLevel.toLowerCase().includes('high') ? 'text-red-600' :
                        report.riskScore.riskLevel.toLowerCase().includes('moderate') ? 'text-amber-600' :
                          'text-emerald-600'
                        }`} />
                      <span className={`text-2xl font-bold ${report.riskScore.riskLevel.toLowerCase().includes('high') ? 'text-red-600' :
                        report.riskScore.riskLevel.toLowerCase().includes('moderate') ? 'text-amber-600' :
                          'text-emerald-600'
                        }`}>
                        {report.riskScore.riskLevel}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100">
                  <h4 className="text-lg font-bold text-slate-700 mb-3">Risk Justification</h4>
                  <p className="text-slate-600 leading-relaxed">{formatTextWithBold(report.riskScore.justification)}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Disclaimer */}
        {report.disclaimer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mb-10"
          >
            <div className="bg-white shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-4">
                <div className="flex items-center">
                  <FiInfo className="text-slate-200 text-xl mr-3" />
                  <h3 className="text-xl font-bold text-white tracking-wide uppercase">Disclaimer</h3>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-b from-white to-slate-50">
                <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100">
                  <div className="flex items-start">
                    <FiAlertTriangle className="text-amber-600 mr-4 mt-1 flex-shrink-0 text-xl" />
                    <p className="text-slate-600 leading-relaxed italic text-lg">{formatTextWithBold(report.disclaimer)}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Risk Factors (Legacy) */}
        {report.riskFactors && report.riskFactors.length > 0 && !isCompact && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mb-10"
          >
            <div className="bg-white shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-700 px-6 py-4">
                <div className="flex items-center">
                  <FiActivity className="text-purple-200 text-xl mr-3" />
                  <h3 className="text-xl font-bold text-white tracking-wide uppercase">Risk Factors (Legacy)</h3>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-b from-white to-slate-50">
                <div className="space-y-6">
                  {report.riskFactors.map((risk, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-slate-100 hover:shadow-lg transition-all duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <h5 className="font-bold text-slate-800 text-lg">{risk.category}</h5>
                        <div className={`flex items-center px-3 py-1 rounded-lg ${risk.level === 'high' ? 'bg-red-50 border border-red-200' :
                          risk.level === 'medium' ? 'bg-amber-50 border border-amber-200' :
                            'bg-emerald-50 border border-emerald-200'
                          }`}>
                          <span className={`text-sm font-bold ${risk.level === 'high' ? 'text-red-600' :
                            risk.level === 'medium' ? 'text-amber-600' :
                              'text-emerald-600'
                            }`}>
                            {risk.level}
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-600 leading-relaxed mb-4">{formatTextWithBold(risk.description)}</p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="text-sm font-semibold text-slate-700">
                            <span className="font-bold">Impact:</span> <span className="text-slate-600">{formatTextWithBold(risk.impact)}</span>
                          </p>
                        </div>
                        {risk.mitigationStrategy && (
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-sm font-semibold text-slate-700">
                              <span className="font-bold">Mitigation:</span> <span className="text-slate-600">{formatTextWithBold(risk.mitigationStrategy)}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Professional Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-12"
        >
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-8 rounded-lg shadow-xl">
            <div className="text-center">
              <div className="mb-4">
                <FiBriefcase className="text-slate-300 text-3xl mx-auto mb-2" />
                <h4 className="text-xl font-bold text-slate-100">KarmicDD Financial Due Diligence</h4>
              </div>
              <div className="grid md:grid-cols-3 gap-6 text-sm text-slate-300">
                <div>
                  <p className="font-semibold mb-1">Report Generated:</p>
                  <p>{new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Analysis Type:</p>
                  <p>Comprehensive Financial Assessment</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Version:</p>
                  <p>1.0.0</p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-700">
                <p className="text-xs text-slate-400">
                  This report contains confidential and proprietary information.
                  Distribution is restricted to authorized personnel only.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NewFinancialDueDiligenceReportContent;

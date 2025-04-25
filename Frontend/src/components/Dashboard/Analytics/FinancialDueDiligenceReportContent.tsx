import React from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiShare2, FiDollarSign, FiTrendingUp, FiAlertCircle, FiCheckCircle, FiBarChart2, FiFileText } from 'react-icons/fi';
import { FinancialDueDiligenceReport } from '../../../hooks/useFinancialDueDiligence';

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

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Financial Due Diligence Report</h2>
            <p className="text-indigo-100 mt-1">
              Generated on {formatDate(report.generatedDate)}
            </p>
          </div>
          <div className="flex space-x-2">
            <motion.button
              className="px-3 py-2 bg-white text-indigo-700 hover:bg-gray-100 rounded-lg flex items-center shadow-sm border border-white font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShareReport}
              title="Share this report"
            >
              <FiShare2 className="mr-2" />
              Share
            </motion.button>
            <motion.button
              className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white flex items-center shadow-sm font-medium"
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
      </div>

      {/* Main content */}
      <div className="p-6 space-y-8">
        {/* Executive Summary */}
        <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
          <h3 className="text-lg font-semibold text-indigo-800 mb-2">Executive Summary</h3>
          <p className="text-gray-700">{report.summary}</p>
        </div>

        {/* Key Financial Metrics */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FiDollarSign className="mr-2" />
            Key Financial Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.metrics.map((metric, index) => (
              <motion.div
                key={index}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">{metric.name}</span>
                  {metric.status === 'good' ? (
                    <FiCheckCircle className="text-green-500" />
                  ) : metric.status === 'warning' ? (
                    <FiAlertCircle className="text-yellow-500" />
                  ) : (
                    <FiAlertCircle className="text-red-500" />
                  )}
                </div>
                <div className={`text-lg font-bold ${metric.status === 'good' ? 'text-green-600' :
                  metric.status === 'warning' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                  {metric.value}
                </div>
                {metric.description && (
                  <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recommendations and Risk Factors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recommendations */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <FiTrendingUp className="mr-2" />
              Recommendations
            </h3>
            <ul className="space-y-2">
              {report.recommendations.map((rec, index) => (
                <motion.li
                  key={index}
                  className="bg-green-50 p-3 rounded-lg border border-green-100 text-gray-700 flex"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <FiCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                  <span>{rec}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Risk Factors */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <FiAlertCircle className="mr-2" />
              Risk Factors
            </h3>
            <ul className="space-y-2">
              {report.riskFactors.map((risk, index) => (
                <motion.li
                  key={index}
                  className="bg-red-50 p-3 rounded-lg border border-red-100 text-gray-700"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start">
                    <FiAlertCircle className="text-red-500 mt-1 mr-2 flex-shrink-0" />
                    <div>
                      <span className="font-medium">{risk.category}</span>
                      <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${getRiskLevelColor(risk.level)}`}>
                        {risk.level}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 ml-6 text-sm">{risk.description}</p>
                  <p className="mt-1 ml-6 text-sm"><span className="font-medium">Impact:</span> {risk.impact}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Compliance Items (if available) */}
        {report.complianceItems && report.complianceItems.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <FiFileText className="mr-2" />
              Compliance Assessment
            </h3>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirement</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.complianceItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.requirement}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                            {item.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <p>{item.details}</p>
                          {item.recommendation && (
                            <p className="mt-1 text-xs italic">
                              <span className="font-medium">Recommendation:</span> {item.recommendation}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Financial Ratios (if available) */}
        {report.ratioAnalysis && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <FiBarChart2 className="mr-2" />
              Financial Ratio Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Liquidity Ratios */}
              {report.ratioAnalysis.liquidityRatios.length > 0 && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-3">Liquidity Ratios</h4>
                  <div className="space-y-3">
                    {report.ratioAnalysis.liquidityRatios.map((ratio, index) => (
                      <div key={index} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{ratio.name}</span>
                          <span className={`text-sm font-bold ${ratio.status === 'good' ? 'text-green-600' :
                            ratio.status === 'warning' ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                            {ratio.value}
                          </span>
                        </div>
                        {ratio.industry_average !== undefined && (
                          <div className="text-xs text-gray-500 mt-1">
                            Industry Average: {ratio.industry_average}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">{ratio.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Profitability Ratios */}
              {report.ratioAnalysis.profitabilityRatios.length > 0 && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-3">Profitability Ratios</h4>
                  <div className="space-y-3">
                    {report.ratioAnalysis.profitabilityRatios.map((ratio, index) => (
                      <div key={index} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{ratio.name}</span>
                          <span className={`text-sm font-bold ${ratio.status === 'good' ? 'text-green-600' :
                            ratio.status === 'warning' ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                            {ratio.value}
                          </span>
                        </div>
                        {ratio.industry_average !== undefined && (
                          <div className="text-xs text-gray-500 mt-1">
                            Industry Average: {ratio.industry_average}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">{ratio.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tax Compliance (if available) */}
        {report.taxCompliance && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <FiFileText className="mr-2" />
              Tax Compliance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* GST */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-700">GST</h4>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.taxCompliance.gst.status)}`}>
                    {report.taxCompliance.gst.status.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{report.taxCompliance.gst.details}</p>
              </div>

              {/* Income Tax */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-700">Income Tax</h4>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.taxCompliance.incomeTax.status)}`}>
                    {report.taxCompliance.incomeTax.status.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{report.taxCompliance.incomeTax.details}</p>
              </div>

              {/* TDS */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-700">TDS</h4>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.taxCompliance.tds.status)}`}>
                    {report.taxCompliance.tds.status.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{report.taxCompliance.tds.details}</p>
              </div>
            </div>
          </div>
        )}

        {/* Company and Investor Information */}
        {(report.startupInfo || report.investorInfo) && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Startup Information */}
              {report.startupInfo && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                    <FiBarChart2 className="mr-2 text-indigo-600" />
                    Startup Information
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Company:</span> {report.startupInfo.companyName}</p>
                    <p className="text-sm"><span className="font-medium">Industry:</span> {report.startupInfo.industry}</p>
                    {report.startupInfo.stage && <p className="text-sm"><span className="font-medium">Stage:</span> {report.startupInfo.stage}</p>}
                    {report.startupInfo.foundingDate && <p className="text-sm"><span className="font-medium">Founded:</span> {report.startupInfo.foundingDate}</p>}
                    {report.startupInfo.teamSize && <p className="text-sm"><span className="font-medium">Team Size:</span> {report.startupInfo.teamSize}</p>}
                    {report.startupInfo.location && <p className="text-sm"><span className="font-medium">Location:</span> {report.startupInfo.location}</p>}
                    {report.startupInfo.fundingRound && <p className="text-sm"><span className="font-medium">Funding Round:</span> {report.startupInfo.fundingRound}</p>}
                    {report.startupInfo.fundingAmount && <p className="text-sm"><span className="font-medium">Funding Amount:</span> {report.startupInfo.fundingAmount}</p>}
                    {report.startupInfo.valuation && <p className="text-sm"><span className="font-medium">Valuation:</span> {report.startupInfo.valuation}</p>}
                  </div>
                </div>
              )}

              {/* Investor Information */}
              {report.investorInfo && (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                    <FiDollarSign className="mr-2 text-indigo-600" />
                    Investor Information
                  </h4>
                  <div className="space-y-2">
                    {report.investorInfo.name && <p className="text-sm"><span className="font-medium">Name:</span> {report.investorInfo.name}</p>}
                    {report.investorInfo.investmentStage && <p className="text-sm"><span className="font-medium">Investment Stage:</span> {report.investorInfo.investmentStage}</p>}
                    {report.investorInfo.investmentSize && <p className="text-sm"><span className="font-medium">Investment Size:</span> {report.investorInfo.investmentSize}</p>}
                    {report.investorInfo.sectors && <p className="text-sm"><span className="font-medium">Sectors:</span> {typeof report.investorInfo.sectors === 'string' ? report.investorInfo.sectors : report.investorInfo.sectors.join(', ')}</p>}
                    {report.investorInfo.location && <p className="text-sm"><span className="font-medium">Location:</span> {report.investorInfo.location}</p>}
                    {report.investorInfo.portfolio && <p className="text-sm"><span className="font-medium">Portfolio:</span> {typeof report.investorInfo.portfolio === 'string' ? report.investorInfo.portfolio : report.investorInfo.portfolio.join(', ')}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Missing Documents Section */}
        {report.missingDocuments && report.missingDocuments.list.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FiFileText className="mr-2" />
              Missing Documents
            </h3>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-700 mb-3">
                {report.missingDocuments.impact}
              </p>

              <h4 className="font-medium text-gray-800 mb-2">Missing Document List:</h4>
              <ul className="list-disc pl-5 mb-4 space-y-1">
                {report.missingDocuments.list.map((doc, index) => (
                  <li key={index} className="text-sm text-gray-700">{doc}</li>
                ))}
              </ul>

              <h4 className="font-medium text-gray-800 mb-2">Recommendations:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {report.missingDocuments.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-700">{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center mt-6">
          <p className="text-sm text-gray-600">
            This report was generated by KarmicDD's AI-powered Financial Due Diligence system.
            <br />
            The analysis is based on the documents provided and complies with Indian company standards.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancialDueDiligenceReportContent;

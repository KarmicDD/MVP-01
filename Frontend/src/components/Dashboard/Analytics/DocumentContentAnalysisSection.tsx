import React from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiDollarSign, FiShield, FiAlertTriangle, FiCheckCircle, FiTrendingUp, FiBarChart2 } from 'react-icons/fi';
import { DocumentContentAnalysis } from '../../../hooks/useEntityFinancialDueDiligence';

interface DocumentContentAnalysisSectionProps {
  documentContentAnalysis: DocumentContentAnalysis;
}

const DocumentContentAnalysisSection: React.FC<DocumentContentAnalysisSectionProps> = ({ documentContentAnalysis }) => {
  if (!documentContentAnalysis) return null;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-purple-100 mt-6">
      <div className="flex items-center mb-5">
        <div className="bg-purple-600 p-2 rounded-lg mr-3">
          <FiFileText className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800">Document Content Analysis</h3>
      </div>

      <p className="text-gray-700 mb-6">{documentContentAnalysis.overview}</p>

      {/* Due Diligence Findings Section */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <FiDollarSign className="text-blue-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-800">Financial Due Diligence Findings</h4>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="text-gray-700">{documentContentAnalysis.dueDiligenceFindings.summary}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white p-4 rounded-lg border border-blue-100">
            <h5 className="font-semibold text-blue-800 mb-2 flex items-center">
              <FiTrendingUp className="mr-2" /> Key Insights
            </h5>
            <ul className="space-y-2">
              {documentContentAnalysis.dueDiligenceFindings.keyInsights.map((insight, index) => (
                <li key={index} className="text-gray-700 flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-4 rounded-lg border border-blue-100">
            <h5 className="font-semibold text-blue-800 mb-2 flex items-center">
              <FiBarChart2 className="mr-2" /> Investment Implications
            </h5>
            <ul className="space-y-2">
              {documentContentAnalysis.dueDiligenceFindings.investmentImplications.map((implication, index) => (
                <li key={index} className="text-gray-700 flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">•</span>
                  {implication}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-green-100">
            <h5 className="font-semibold text-green-800 mb-2 flex items-center">
              <FiTrendingUp className="mr-2" /> Growth Indicators
            </h5>
            <ul className="space-y-2">
              {documentContentAnalysis.dueDiligenceFindings.growthIndicators.map((indicator, index) => (
                <li key={index} className="text-gray-700 flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  {indicator}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-4 rounded-lg border border-red-100">
            <h5 className="font-semibold text-red-800 mb-2 flex items-center">
              <FiAlertTriangle className="mr-2" /> Risk Factors
            </h5>
            <ul className="space-y-2">
              {documentContentAnalysis.dueDiligenceFindings.riskFactors.map((risk, index) => (
                <li key={index} className="text-gray-700 flex items-start">
                  <span className="text-red-500 mr-2 mt-1">•</span>
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Audit Findings Section */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="bg-green-100 p-2 rounded-lg mr-3">
            <FiShield className="text-green-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-800">Financial Auditing Findings</h4>
        </div>

        <div className="bg-green-50 p-4 rounded-lg mb-4">
          <p className="text-gray-700">{documentContentAnalysis.auditFindings.summary}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white p-4 rounded-lg border border-red-100">
            <h5 className="font-semibold text-red-800 mb-2 flex items-center">
              <FiAlertTriangle className="mr-2" /> Compliance Issues
            </h5>
            <ul className="space-y-2">
              {documentContentAnalysis.auditFindings.complianceIssues.map((issue, index) => (
                <li key={index} className="text-gray-700 flex items-start">
                  <span className="text-red-500 mr-2 mt-1">•</span>
                  {issue}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-4 rounded-lg border border-orange-100">
            <h5 className="font-semibold text-orange-800 mb-2 flex items-center">
              <FiAlertTriangle className="mr-2" /> Accounting Concerns
            </h5>
            <ul className="space-y-2">
              {documentContentAnalysis.auditFindings.accountingConcerns.map((concern, index) => (
                <li key={index} className="text-gray-700 flex items-start">
                  <span className="text-orange-500 mr-2 mt-1">•</span>
                  {concern}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-yellow-100">
            <h5 className="font-semibold text-yellow-800 mb-2 flex items-center">
              <FiAlertTriangle className="mr-2" /> Internal Control Weaknesses
            </h5>
            <ul className="space-y-2">
              {documentContentAnalysis.auditFindings.internalControlWeaknesses.map((weakness, index) => (
                <li key={index} className="text-gray-700 flex items-start">
                  <span className="text-yellow-500 mr-2 mt-1">•</span>
                  {weakness}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-4 rounded-lg border border-red-100">
            <h5 className="font-semibold text-red-800 mb-2 flex items-center">
              <FiAlertTriangle className="mr-2" /> Fraud Risk Indicators
            </h5>
            <ul className="space-y-2">
              {documentContentAnalysis.auditFindings.fraudRiskIndicators.map((indicator, index) => (
                <li key={index} className="text-gray-700 flex items-start">
                  <span className="text-red-500 mr-2 mt-1">•</span>
                  {indicator}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Document Specific Analysis Section */}
      <div>
        <div className="flex items-center mb-4">
          <div className="bg-indigo-100 p-2 rounded-lg mr-3">
            <FiFileText className="text-indigo-600" />
          </div>
          <h4 className="text-lg font-semibold text-gray-800">Document-Specific Analysis</h4>
        </div>

        <div className="space-y-4">
          {documentContentAnalysis.documentSpecificAnalysis.map((doc, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm"
            >
              <h5 className="font-semibold text-indigo-800 mb-2">
                {doc.documentType.replace('financial_', '').replace(/_/g, ' ').split(' ').map(word =>
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </h5>

              <p className="text-gray-700 mb-3">{doc.contentSummary}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <h6 className="font-medium text-blue-700 mb-1">Due Diligence Insights</h6>
                  <ul className="space-y-1">
                    {doc.dueDiligenceInsights.map((insight, idx) => (
                      <li key={idx} className="text-gray-700 text-sm flex items-start">
                        <span className="text-blue-500 mr-2 mt-1">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h6 className="font-medium text-green-700 mb-1">Audit Insights</h6>
                  <ul className="space-y-1">
                    {doc.auditInsights.map((insight, idx) => (
                      <li key={idx} className="text-gray-700 text-sm flex items-start">
                        <span className="text-green-500 mr-2 mt-1">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mb-3">
                <h6 className="font-medium text-purple-700 mb-1">Key Financial Data</h6>
                <ul className="space-y-1">
                  {doc.keyFinancialData.map((data, idx) => (
                    <li key={idx} className="text-gray-700 text-sm flex items-start">
                      <span className="text-purple-500 mr-2 mt-1">•</span>
                      {data}
                    </li>
                  ))}
                </ul>
              </div>

              {doc.inconsistencies && doc.inconsistencies.length > 0 && (
                <div className="mb-3">
                  <h6 className="font-medium text-red-700 mb-1">Inconsistencies</h6>
                  <ul className="space-y-1">
                    {doc.inconsistencies.map((inconsistency, idx) => (
                      <li key={idx} className="text-gray-700 text-sm flex items-start">
                        <span className="text-red-500 mr-2 mt-1">•</span>
                        {inconsistency}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h6 className="font-medium text-indigo-700 mb-1">Recommendations</h6>
                <ul className="space-y-1">
                  {doc.recommendations.map((recommendation, idx) => (
                    <li key={idx} className="text-gray-700 text-sm flex items-start">
                      <span className="text-indigo-500 mr-2 mt-1">•</span>
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentContentAnalysisSection;

import React from 'react';
import { motion } from 'framer-motion';
import {
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiFileText,
  FiBookOpen,
  FiTrendingUp,
  FiInfo
} from 'react-icons/fi';

interface LegalDocumentItem {
  documentCategory: string;
  specificDocument: string;
  requirementReference: string;
}

interface LegalReportItem {
  title: string;
  facts: string[];
  keyFindings: string[];
  recommendedActions: string[];
}

interface LegalRiskScore {
  score: string;
  riskLevel: string;
  justification: string;
}

interface LegalMissingDocuments {
  list: LegalDocumentItem[];
  impact: string;
  priorityLevel: 'high' | 'medium' | 'low';
}

interface LegalCompliance {
  complianceScore: string;
  details: string;
}

interface LegalAnalysis {
  items: LegalReportItem[];
  complianceAssessment: LegalCompliance;
  riskScore: LegalRiskScore;
  missingDocuments: LegalMissingDocuments;
}

interface LegalDueDiligenceReport {
  entityId: string;
  entityType: 'startup' | 'investor';
  entityProfile: {
    companyName: string;
    industry: string;
    incorporationDate?: string;
    registrationNumber?: string;
    address?: string;
  };
  legalAnalysis: LegalAnalysis;
  reportCalculated: boolean;
  processingNotes?: string;
  availableDocuments: Array<{
    documentId: string;
    documentName: string;
    documentType: string;
    uploadDate: Date;
  }>;
  missingDocumentTypes: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface LegalDueDiligenceReportContentProps {
  report: LegalDueDiligenceReport;
  userProfile: {
    userId: string;
    role: 'startup' | 'investor';
  };
  entityName: string;
}

const LegalDueDiligenceReportContent: React.FC<LegalDueDiligenceReportContentProps> = ({
  report,
  userProfile,
  entityName
}) => {
  const cardItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-100 border-green-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getComplianceColor = (score: string) => {
    const numericScore = parseFloat(score);
    if (numericScore >= 80) return 'text-green-600 bg-green-100';
    if (numericScore >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            duration: 0.3,
            when: "beforeChildren",
            staggerChildren: 0.1
          }
        }
      }}
      className="space-y-6"
    >
      {/* Executive Summary */}
      <motion.div variants={cardItemVariants} className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-6">
          <FiShield className={`w-6 h-6 mr-3 ${userProfile.role === 'investor' ? 'text-green-600' : 'text-indigo-600'
            }`} />
          <h2 className="text-2xl font-bold text-gray-800">Legal Due Diligence Report</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Compliance Score */}
          <div className="text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 ${getComplianceColor(report.legalAnalysis.complianceAssessment.complianceScore)
              }`}>
              <FiCheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Compliance Score</h3>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {report.legalAnalysis.complianceAssessment.complianceScore}%
            </p>
            <p className="text-sm text-gray-600">
              {report.legalAnalysis.complianceAssessment.details}
            </p>
          </div>

          {/* Risk Level */}
          <div className="text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 ${getRiskLevelColor(report.legalAnalysis.riskScore.riskLevel)
              }`}>
              <FiAlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Risk Level</h3>
            <p className="text-2xl font-bold text-gray-900 mb-2 capitalize">
              {report.legalAnalysis.riskScore.riskLevel}
            </p>
            <p className="text-sm text-gray-600">
              Score: {report.legalAnalysis.riskScore.score}
            </p>
          </div>

          {/* Document Coverage */}
          <div className="text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 ${userProfile.role === 'investor' ? 'bg-green-100' : 'bg-indigo-100'
              }`}>
              <FiFileText className={`w-8 h-8 ${userProfile.role === 'investor' ? 'text-green-600' : 'text-indigo-600'
                }`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Documents</h3>
            <p className="text-2xl font-bold text-gray-900 mb-2">
              {report.availableDocuments.length}
            </p>
            <p className="text-sm text-gray-600">Available for review</p>
          </div>
        </div>
      </motion.div>

      {/* Risk Assessment */}
      <motion.div variants={cardItemVariants} className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-4">
          <FiAlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-800">Risk Assessment</h3>
        </div>

        <div className={`p-4 rounded-lg border ${getRiskLevelColor(report.legalAnalysis.riskScore.riskLevel)} border-opacity-20`}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">Overall Risk Level</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(report.legalAnalysis.riskScore.riskLevel)
              }`}>
              {report.legalAnalysis.riskScore.riskLevel.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-700 mb-2">
            <strong>Risk Score:</strong> {report.legalAnalysis.riskScore.score}
          </p>
          <p className="text-gray-700">
            <strong>Justification:</strong> {report.legalAnalysis.riskScore.justification}
          </p>
        </div>
      </motion.div>

      {/* Legal Analysis Items */}
      <motion.div variants={cardItemVariants} className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center mb-6">
          <FiBookOpen className="w-5 h-5 mr-2 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Detailed Legal Analysis</h3>
        </div>

        <div className="space-y-6">
          {report.legalAnalysis.items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">{item.title}</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Facts */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                    <FiInfo className="w-4 h-4 mr-1" />
                    Facts
                  </h5>
                  <ul className="space-y-1">
                    {item.facts.map((fact, factIndex) => (
                      <li key={factIndex} className="text-sm text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                        {fact}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Findings */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                    <FiTrendingUp className="w-4 h-4 mr-1" />
                    Key Findings
                  </h5>
                  <ul className="space-y-1">
                    {item.keyFindings.map((finding, findingIndex) => (
                      <li key={findingIndex} className="text-sm text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Actions */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                    <FiCheckCircle className="w-4 h-4 mr-1" />
                    Recommended Actions
                  </h5>
                  <ul className="space-y-1">
                    {item.recommendedActions.map((action, actionIndex) => (
                      <li key={actionIndex} className="text-sm text-gray-600 flex items-start">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Missing Documents */}
      {report.legalAnalysis.missingDocuments.list.length > 0 && (
        <motion.div variants={cardItemVariants} className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <FiXCircle className="w-5 h-5 mr-2 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-800">Missing Documents</h3>
          </div>

          <div className={`p-4 rounded-lg border mb-4 ${getPriorityColor(report.legalAnalysis.missingDocuments.priorityLevel)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Impact Assessment</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.legalAnalysis.missingDocuments.priorityLevel)
                }`}>
                {report.legalAnalysis.missingDocuments.priorityLevel.toUpperCase()} PRIORITY
              </span>
            </div>
            <p className="text-sm">{report.legalAnalysis.missingDocuments.impact}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.legalAnalysis.missingDocuments.list.map((doc, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <h5 className="font-medium text-gray-800 mb-1">{doc.documentCategory}</h5>
                <p className="text-sm text-gray-600 mb-2">{doc.specificDocument}</p>
                <p className="text-xs text-gray-500">{doc.requirementReference}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Report Metadata */}
      <motion.div variants={cardItemVariants} className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <strong>Entity:</strong> {report.entityProfile.companyName} ({report.entityType})
          </div>
          <div>
            <strong>Report Generated:</strong> {new Date(report.createdAt).toLocaleString()}
          </div>
          <div>
            <strong>Documents Analyzed:</strong> {report.availableDocuments.length}
          </div>
        </div>
        {report.processingNotes && (
          <div className="mt-2">
            <strong>Processing Notes:</strong> {report.processingNotes}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default LegalDueDiligenceReportContent;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiFileText, FiBarChart2, FiList, FiClipboard, FiInfo, FiX, FiUpload } from 'react-icons/fi';
import SimpleSpinner from '../../SimpleSpinner';
import { profileService } from '../../../services/api';
import { toast } from 'react-hot-toast';
import { useNewFinancialDueDiligence } from '../../../hooks/useNewFinancialDueDiligence';
import NewFinancialDueDiligenceReportContent from './NewFinancialDueDiligenceReportContent';
import { LoadingSpinner } from '../../Loading';
import TutorialButton from '../../Tutorial/TutorialButton';
import { useTutorial } from '../../../hooks/useTutorial';
import ErrorDisplay from '../../common/ErrorDisplay';

interface NewFinancialDueDiligenceProps {
  userProfile: {
    userId: string;
    role: 'startup' | 'investor';
  };
  selectedMatchId: string | null;
}

const NewFinancialDueDiligence: React.FC<NewFinancialDueDiligenceProps> = ({ userProfile, selectedMatchId }) => {
  const [entityName, setEntityName] = useState<string>('the entity');

  // Determine which entity to analyze based on the selected match and user role
  let entityId = '';
  let entityType: 'startup' | 'investor' = 'startup';

  if (selectedMatchId && userProfile) {
    // We want to analyze the selected entity (the counterparty), not the logged-in user
    entityId = selectedMatchId;

    // If user is a startup, we want to analyze the investor
    // If user is an investor, we want to analyze the startup
    entityType = userProfile.role === 'startup' ? 'investor' : 'startup';
  }

  // Use the tutorial hook for the help button functionality
  useTutorial('new-financial-dd-tutorial');

  // Use the entity financial due diligence hook with the correct entity type
  const {
    report,
    loading,
    error,
    documentsAvailable,
    checkingDocuments,
    availableDocuments,
    missingDocumentTypes,
    entityInfo,
    handleExportPDF,
    handleShareReport,
    generateReport,
    formatDate,
    reportRef
  } = useNewFinancialDueDiligence(entityId, entityType);

  // Update entity name when entity info changes
  useEffect(() => {
    if (entityInfo && entityInfo.companyName) {
      setEntityName(entityInfo.companyName);
    } else if (selectedMatchId) {
      // Fetch entity name if not provided by the hook
      const fetchEntityName = async () => {
        try {
          // Use getProfile method instead of getProfileByUserId
          // The entityType is the opposite of the user's role
          const profile = await profileService.getProfile(selectedMatchId, entityType);
          if (profile && profile.companyName) {
            setEntityName(profile.companyName);
          }
        } catch (error) {
          console.error('Error fetching entity name:', error);
        }
      };

      fetchEntityName();
    }
  }, [entityInfo, selectedMatchId, entityType]);

  // Get formatted document type for display
  const getFormattedDocumentType = (docType: string) => {
    return docType
      .replace('financial_', '')
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!selectedMatchId) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-medium text-gray-700 mb-2">Select a match to view financial due diligence</h3>
        <p className="text-gray-500">Click on any match card to see financial analysis</p>
      </div>
    );
  }

  // Show loading state while checking documents or loading report
  if (checkingDocuments || loading) {
    return <LoadingSpinner message="Preparing Analysis" submessage="Loading financial due diligence data..." />;
  }

  // Show error state if there's an error
  if (error) {
    return <ErrorDisplay error={typeof error === 'string' ? { message: error } : error} onRetry={generateReport} />;
  }

  // Show document upload prompt if no documents are available
  if (documentsAvailable === false) {
    return (
      <div className="text-center py-10">
        <div className="bg-amber-50 p-6 rounded-lg mb-6 inline-block">
          <FiInfo className="text-amber-500 text-4xl mb-4 mx-auto" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">No Financial Documents Available</h3>
          <p className="text-gray-600 mb-4">
            {entityName} hasn't uploaded any financial documents yet. Financial due diligence requires documents like balance sheets, income statements, or tax returns.
          </p>
          <p className="text-gray-600">
            Please ask {entityName} to upload financial documents to enable this analysis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="financial-due-diligence">
      {/* Help button for tutorial */}
      <div className="absolute top-4 right-4">
        <TutorialButton tutorialId="new-financial-dd-tutorial" />
      </div>

      {/* Analysis Instructions - Only show if no report is displayed and no match is selected */}
      {!report && !selectedMatchId && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start">
          <div className="bg-blue-500 text-white rounded-full p-1 mr-3 flex-shrink-0">
            <FiInfo size={18} />
          </div>
          <div>
            <h3 className="font-medium text-blue-800 mb-1">Analysis Instructions</h3>
            <p className="text-blue-700 text-sm">
              Select a match from the Matches tab to view financial due diligence analysis and reports.
            </p>
          </div>
        </div>
      )}

      {/* Main content */}
      <div ref={reportRef}>
        {report ? (
          <NewFinancialDueDiligenceReportContent
            report={report}
            formatDate={formatDate}
            handleExportPDF={handleExportPDF}
            handleShareReport={handleShareReport}
            isCompact={true}
          />
        ) : (
          <div className="space-y-8 p-6">
            <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100">
              <h3 className="text-lg font-semibold text-indigo-800 mb-3 flex items-center">
                <FiFileText className="mr-2" />
                Financial Due Diligence
              </h3>
              <p className="text-gray-700 mb-4">
                Our AI-powered financial due diligence tool analyzes financial documents uploaded by {entityName} to provide comprehensive insights and recommendations compliant with Indian company standards.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-50">
                  <div className="text-indigo-600 text-xl mb-2">1</div>
                  <h4 className="font-medium text-gray-800 mb-1">Review Documents</h4>
                  <p className="text-sm text-gray-600">Review the financial documents uploaded by {entityName}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-50">
                  <div className="text-indigo-600 text-xl mb-2">2</div>
                  <h4 className="font-medium text-gray-800 mb-1">Generate Analysis</h4>
                  <p className="text-sm text-gray-600">Generate a comprehensive financial due diligence report</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-50">
                  <div className="text-indigo-600 text-xl mb-2">3</div>
                  <h4 className="font-medium text-gray-800 mb-1">Review Insights</h4>
                  <p className="text-sm text-gray-600">Get actionable insights and investment recommendations</p>
                </div>
              </div>

              {/* Available Documents Section */}
              {availableDocuments && availableDocuments.length > 0 && (
                <div className="mt-8">
                  <h4 className="font-medium text-gray-800 mb-3">Available Financial Documents</h4>
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Type</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Period</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {availableDocuments.map((doc) => (
                            <tr key={doc.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getFormattedDocumentType(doc.documentType)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.originalName}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.timePeriod || 'Not specified'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Missing Documents Section */}
              {missingDocumentTypes && missingDocumentTypes.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-800 mb-3">Missing Documents</h4>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                    <p className="text-amber-700 mb-2">The following document types would improve the analysis:</p>
                    <ul className="list-disc pl-5 text-sm text-amber-800 space-y-1">
                      {missingDocumentTypes.map((docType, index) => (
                        <li key={index}>{getFormattedDocumentType(docType)}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Generate Report Button */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => generateReport()}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <FiBarChart2 className="mr-2" />
                  Generate Financial Due Diligence Report
                </button>
              </div>
            </div>

            {/* What to Expect Section */}
            <div className="p-6 rounded-lg border border-indigo-100 bg-indigo-50">
              <div className="flex items-start">
                <div className="ml-3">
                  <h4 className="font-medium text-gray-900">Complete Financial Analysis & Audit</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Our comprehensive report provides:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-600 list-disc pl-5">
                    <li>Executive summary with key metrics and findings</li>
                    <li>Detailed financial analysis with trends and projections</li>
                    <li>Compliance assessment based on Indian regulatory standards</li>
                    <li>Risk assessment and mitigation recommendations</li>
                    <li>Investment decision recommendation with success probability</li>
                    <li>Actionable insights and recommendations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewFinancialDueDiligence;

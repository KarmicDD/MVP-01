import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiFileText, FiBarChart2, FiList, FiClipboard, FiInfo, FiX, FiUpload } from 'react-icons/fi';
import SimpleSpinner from '../../SimpleSpinner';
import { profileService } from '../../../services/api';
import { toast } from 'react-hot-toast';
import { useEntityFinancialDueDiligence } from '../../../hooks/useEntityFinancialDueDiligence';
import FinancialDueDiligenceReportContent from './FinancialDueDiligenceReportContent';
import { LoadingSpinner } from '../../Loading';
import TutorialButton from '../../Tutorial/TutorialButton';
import { useTutorial } from '../../../hooks/useTutorial';
import ErrorDisplay from '../../common/ErrorDisplay';

interface FinancialDueDiligenceProps {
  userProfile: {
    userId: string;
    role: 'startup' | 'investor';
  };
  selectedMatchId: string | null;
}

const FinancialDueDiligence: React.FC<FinancialDueDiligenceProps> = ({ userProfile, selectedMatchId }) => {
  // State for document upload and report generation UI
  const [isGenerating, setIsGenerating] = useState(false);
  const [financialReports, setFinancialReports] = useState<any[]>([]);
  const [showReportsList, setShowReportsList] = useState(false);
  const [entityName, setEntityName] = useState<string>('');

  // Determine the entity ID and type based on user role and selected match
  let entityId = null;
  let entityType: 'startup' | 'investor' = 'startup';

  if (selectedMatchId && userProfile) {
    // We want to analyze the selected entity (the counterparty), not the logged-in user
    entityId = selectedMatchId;

    // If user is a startup, we want to analyze the investor
    // If user is an investor, we want to analyze the startup
    entityType = userProfile.role === 'startup' ? 'investor' : 'startup';
  }

  // Use the tutorial hook for the help button functionality
  useTutorial('financial-dd-tutorial');

  // Use the entity financial due diligence hook with the correct entity type
  const {
    report,
    loading,
    error,
    documentsAvailable,
    checkingDocuments,
    availableDocuments,
    missingDocumentTypes,
    handleExportPDF,
    handleShareReport,
    generateReport,
    formatDate,
    reportRef
  } = useEntityFinancialDueDiligence(entityId, entityType);

  // Fetch existing reports on component mount
  useEffect(() => {
    fetchFinancialReports();

    // Determine which entity's documents we are analyzing
    fetchEntityName();
  }, [userProfile, selectedMatchId]);

  const fetchEntityName = async () => {
    if (!selectedMatchId) return;

    try {
      // Determine whose documents we're analyzing
      // If user is a startup, we're analyzing the investor's documents
      // If user is an investor, we're analyzing the startup's documents
      const entityType = userProfile.role === 'startup' ? 'investor' : 'startup';

      // Set a default name based on the entity type
      const defaultName = entityType === 'startup' ? 'Selected Startup' : 'Selected Investor';

      // For now, just use the default name since we don't have a direct way to get the entity's name
      setEntityName(defaultName);

      console.log(`Analyzing documents for ${entityType} with ID ${selectedMatchId} for financial due diligence`);
    } catch (error) {
      console.error('Error setting entity name:', error);
      setEntityName(userProfile.role === 'startup' ? 'Selected Investor' : 'Selected Startup');
    }
  };

  const fetchFinancialReports = async () => {
    try {
      const reports = await profileService.getFinancialReports();
      setFinancialReports(reports);
    } catch (error) {
      console.error('Error fetching financial reports:', error);
      // Don't show error toast here as this is a background fetch
    }
  };

  const fetchReportDetails = async (reportId: string) => {
    try {
      setIsGenerating(true);
      await profileService.getFinancialReport(reportId);
      // Update the report state in the hook
      // For now we're just showing that we've loaded the report
      toast.success("Report details loaded successfully");
      setIsGenerating(false);
    } catch (error) {
      console.error('Error fetching report details:', error);
      toast.error('Failed to load report details');
      setIsGenerating(false);
    }
  };

  const handleGenerateReportClick = async () => {
    setIsGenerating(true);
    try {
      await generateReport();
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = (reportId: string) => {
    const url = profileService.getFinancialReportPdfUrl(reportId);
    window.open(url, '_blank');
  };

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
        <h3 className="text-xl font-medium text-gray-700 mb-2">Select a match to view draft-financial due diligence</h3>
        <p className="text-gray-500">Click on any match card to see financial analysis</p>
      </div>
    );
  }

  // Show loading state while checking documents or loading report
  if (checkingDocuments || loading) {
    return <LoadingSpinner message="Preparing Analysis" submessage="Loading financial due diligence data..." />;
  }

  // Show error if any
  if (error) {
    // Check if error is a string or an object
    const errorObj = typeof error === 'string'
      ? { message: error }
      : error;

    // Check if it's a document availability error or a processing error
    const isDocumentError = errorObj.errorCode === 'NO_FINANCIAL_DOCUMENTS' ||
      errorObj.errorCode === 'INSUFFICIENT_DOCUMENTS' ||
      !availableDocuments ||
      availableDocuments.length === 0;

    if (isDocumentError) {
      // Show document availability error UI
      return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-red-50 p-6 border-b border-red-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mr-4 border border-red-200">
                <FiFileText className="text-red-500 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Financial Documents Required</h3>
                <p className="text-red-600 text-sm font-medium">No financial documents available for analysis</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <FiInfo className="text-amber-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-gray-700 mb-2">
                    {entityName} has not uploaded any financial documents yet. Financial documents are required to generate a due diligence report.
                  </p>
                  <p className="text-sm text-gray-600">
                    Financial documents may include balance sheets, income statements, cash flow statements, and other financial records.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Required Documents:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {['Balance Sheet', 'Income Statement', 'Cash Flow Statement', 'Financial Projections', 'Tax Returns'].map((doc, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mr-3">
                      <FiX className="text-red-500 text-sm" />
                    </div>
                    <span className="text-sm text-gray-700">{doc}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-600 mb-4">
                  Please ask {entityName} to upload the required financial documents in their profile.
                </p>
                <motion.button
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center mx-auto"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.open('/profile', '_blank')}
                >
                  <FiUpload className="mr-2" />
                  Go to Profile Documents
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Show processing error UI with our new ErrorDisplay component
      return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Draft-Financial Due Diligence</h3>

          <ErrorDisplay
            error={errorObj}
            onRetry={handleGenerateReportClick}
            onDismiss={() => window.location.reload()}
          />

          {availableDocuments && availableDocuments.length > 0 && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-gray-700 mb-3">Available Documents</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center p-2 hover:bg-white rounded-md">
                    <FiFileText className="text-indigo-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{getFormattedDocumentType(doc.documentType)}</p>
                      <p className="text-xs text-gray-500">
                        {doc.documentName} •
                        Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      {/* Help button */}
      <div className="absolute top-4 right-4 z-10">
        <TutorialButton
          tutorialId="financial-dd-tutorial"
          className="p-2 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition-colors"
          buttonText=""
        />
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

      {/* Report title is now handled in FinancialDueDiligenceReportContent component */}

      {/* Main content */}
      <div ref={reportRef}>
        {report ? (
          <FinancialDueDiligenceReportContent
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
                Draft-Financial Due Diligence
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
                  <h4 className="font-medium text-gray-800 mb-1">Select Report Type</h4>
                  <p className="text-sm text-gray-600">Choose between Financial Analysis or Audit Report</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-50">
                  <div className="text-indigo-600 text-xl mb-2">3</div>
                  <h4 className="font-medium text-gray-800 mb-1">Generate Report</h4>
                  <p className="text-sm text-gray-600">Generate the report to receive detailed insights and recommendations</p>
                </div>
              </div>
            </div>

            {/* Report Description */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 analysis-types-section">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Comprehensive Draft-Financial Due Diligence</h3>

              <div className="p-4 rounded-lg border border-indigo-100 bg-indigo-50">
                <div className="flex items-start">
                  <div className="ml-3">
                    <h4 className="font-medium text-gray-900">Complete Financial Analysis & Audit</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Our comprehensive report combines financial analysis and audit in one complete package, providing:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-gray-600 list-disc pl-5">
                      <li>Executive summary with key metrics and findings</li>
                      <li>Detailed financial analysis with trends and projections</li>
                      <li>Compliance assessment based on Indian regulatory standards</li>
                      <li>Risk assessment and mitigation recommendations</li>
                      <li>Tax compliance evaluation</li>
                      <li>Audit findings and recommendations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Documents Section */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Available Financial Documents</h3>

                {financialReports.length > 0 && (
                  <button
                    onClick={() => setShowReportsList(!showReportsList)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    <FiList className="mr-1" />
                    {showReportsList ? 'Hide' : 'Show'} Previous Reports
                  </button>
                )}
              </div>

              {/* Previous Reports List */}
              {showReportsList && financialReports.length > 0 && (
                <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">Previous Reports</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {financialReports.map((report) => (
                      <div key={report._id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md">
                        <div>
                          <p className="font-medium text-gray-800">{report.companyName}</p>
                          <p className="text-xs text-gray-500">
                            {report.reportType === 'analysis' ? 'Financial Analysis' : 'Audit Report'} •
                            {new Date(report.reportDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => fetchReportDetails(report._id)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-full"
                            title="View Report"
                          >
                            <FiFileText size={16} />
                          </button>
                          <button
                            onClick={() => downloadReport(report._id)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-full"
                            title="Download PDF"
                          >
                            <FiDownload size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Entity Documents List */}
              {availableDocuments && availableDocuments.length > 0 ? (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-3">
                    The following financial documents were uploaded by {entityName} and will be used for analysis:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {availableDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center p-2 hover:bg-white rounded-md">
                          <FiFileText className="text-indigo-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">{getFormattedDocumentType(doc.documentType)}</p>
                            <p className="text-xs text-gray-500">
                              {doc.documentName} •
                              Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-start">
                    <FiInfo className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-800 mb-1">No Financial Documents Available</h4>
                      <p className="text-sm text-gray-600">
                        {entityName} has not uploaded any financial documents yet. Financial documents need to be uploaded in their profile before analysis can be performed.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Generate Report Button */}
            <div className="text-center">
              <motion.button
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md flex items-center mx-auto generate-report-button"
                onClick={handleGenerateReportClick}
                disabled={isGenerating || !availableDocuments || availableDocuments.length === 0}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isGenerating ? (
                  <>
                    <SimpleSpinner size="sm" color="text-white" />
                    <span className="ml-2">Generating Report...</span>
                  </>
                ) : (
                  <>
                    <FiBarChart2 className="mr-2" />
                    Generate Draft-Financial Due Diligence Report
                  </>
                )}
              </motion.button>
              <p className="text-sm text-gray-500 mt-2">
                {!availableDocuments || availableDocuments.length === 0
                  ? `No financial documents available from ${entityName}`
                  : `Generate a comprehensive financial due diligence report based on ${entityName}'s documents`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialDueDiligence;

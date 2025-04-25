import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiFileText, FiBarChart2, FiList, FiClipboard, FiInfo, FiX, FiUpload } from 'react-icons/fi';
import SimpleSpinner from '../../SimpleSpinner';
import { profileService } from '../../../services/api';
import { toast } from 'react-hot-toast';
import { useFinancialDueDiligence } from '../../../hooks/useFinancialDueDiligence';
import FinancialDueDiligenceReportContent from './FinancialDueDiligenceReportContent';
import { LoadingSpinner } from '../../Loading';
import TutorialButton from '../../Tutorial/TutorialButton';
import { useTutorial } from '../../../hooks/useTutorial';

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
  const [selectedReportType, setSelectedReportType] = useState<'analysis' | 'audit'>('analysis');
  const [financialReports, setFinancialReports] = useState<any[]>([]);
  const [showReportsList, setShowReportsList] = useState(false);
  const [entityName, setEntityName] = useState<string>('');

  // Determine startup and investor IDs based on user role and selected match
  let startupId = null;
  let investorId = null;

  if (selectedMatchId && userProfile) {
    if (userProfile.role === 'startup') {
      startupId = userProfile.userId;
      investorId = selectedMatchId;
    } else {
      investorId = userProfile.userId;
      startupId = selectedMatchId;
    }
  }

  // Use the tutorial hook for the help button functionality
  useTutorial('financial-dd-tutorial');

  // We want to analyze the selected entity's documents, not the logged-in user's
  // If user is a startup, we want to analyze the investor's documents (perspective = 'investor')
  // If user is an investor, we want to analyze the startup's documents (perspective = 'startup')
  // This ensures we're looking at the selected entity's documents (the counterparty)
  const perspective = userProfile.role === 'startup' ? 'investor' : 'startup';

  // Use the financial due diligence hook with the selected report type and correct perspective
  const {
    report,
    loading,
    error,
    documentsAvailable,
    checkingDocuments,
    entityDocuments,
    handleExportPDF,
    handleShareReport,
    generateReport,
    formatDate,
    reportRef
  } = useFinancialDueDiligence(startupId, investorId, selectedReportType, perspective);

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
        <h3 className="text-xl font-medium text-gray-700 mb-2">Select a match to view financial due diligence</h3>
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

      {/* Report Type Selection Buttons */}
      {report && (
        <div className="mb-6 flex justify-center space-x-4">
          <motion.button
            className={`px-4 py-2 rounded-lg shadow-sm flex items-center ${report.reportType === 'analysis' || !report.reportType ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (startupId && investorId) {
                // Re-fetch with analysis type
                setSelectedReportType('analysis');
                window.location.reload();
              }
            }}
          >
            <FiBarChart2 className="mr-2" />
            Due Diligence Report
          </motion.button>
          <motion.button
            className={`px-4 py-2 rounded-lg shadow-sm flex items-center ${report.reportType === 'audit' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (startupId && investorId) {
                // Re-fetch with audit type
                setSelectedReportType('audit');
                window.location.reload();
              }
            }}
          >
            <FiClipboard className="mr-2" />
            Audit Report
          </motion.button>
        </div>
      )}

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

            {/* Report Type Selection */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 analysis-types-section">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Report Type</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedReportType === 'analysis' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                  onClick={() => setSelectedReportType('analysis')}
                >
                  <div className="flex items-start">
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 ${selectedReportType === 'analysis' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-400'}`}>
                      {selectedReportType === 'analysis' && (
                        <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-900">Financial Analysis</h4>
                      <p className="text-sm text-gray-600 mt-1">Comprehensive analysis of financial health, growth metrics, and business sustainability</p>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedReportType === 'audit' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                  onClick={() => setSelectedReportType('audit')}
                >
                  <div className="flex items-start">
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 ${selectedReportType === 'audit' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-400'}`}>
                      {selectedReportType === 'audit' && (
                        <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-900">Audit Report</h4>
                      <p className="text-sm text-gray-600 mt-1">Detailed audit with compliance assessment based on Indian regulatory standards</p>
                    </div>
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
              {entityDocuments.length > 0 ? (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-3">
                    The following financial documents were uploaded by {entityName} and will be used for analysis:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {entityDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center p-2 hover:bg-white rounded-md">
                          <FiFileText className="text-indigo-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">{getFormattedDocumentType(doc.documentType)}</p>
                            <p className="text-xs text-gray-500">
                              {doc.originalName} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB •
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
                disabled={isGenerating || entityDocuments.length === 0}
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
                    Generate {selectedReportType === 'analysis' ? 'Financial Analysis' : 'Audit Report'}
                  </>
                )}
              </motion.button>
              <p className="text-sm text-gray-500 mt-2">
                {entityDocuments.length === 0
                  ? `No financial documents available from ${entityName}`
                  : `Generate a ${selectedReportType === 'analysis' ? 'financial analysis' : 'audit report'} based on ${entityName}'s documents`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialDueDiligence;

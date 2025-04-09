import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiDownload, FiFileText, FiBarChart2, FiDollarSign, FiTrendingUp, FiAlertCircle, FiCheckCircle, FiList, FiClipboard } from 'react-icons/fi';
import SimpleSpinner from '../../SimpleSpinner';
import { profileService } from '../../../services/api';
import { toast } from 'react-hot-toast';
import TutorialManager from '../../Tutorial/TutorialManager';
import { useFinancialDueDiligence } from '../../../hooks/useFinancialDueDiligence';
import FinancialDueDiligenceReportContent from './FinancialDueDiligenceReportContent';
import { LoadingSpinner } from '../../Loading';

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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportType, setReportType] = useState<'analysis' | 'audit'>('analysis');
  const [companyName, setCompanyName] = useState('');
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  const [financialReports, setFinancialReports] = useState<any[]>([]);
  const [currentReport, setCurrentReport] = useState<any>(null);
  const [showReportsList, setShowReportsList] = useState(false);
  const [showUploadUI, setShowUploadUI] = useState(false);

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

  // Use the financial due diligence hook
  const {
    report,
    loading,
    error,
    documentsAvailable,
    checkingDocuments,
    handleExportPDF,
    handleShareReport,
    formatDate,
    reportRef
  } = useFinancialDueDiligence(startupId, investorId);

  // Fetch existing reports on component mount
  useEffect(() => {
    fetchFinancialReports();

    // Set default company name based on user profile
    if (userProfile && userProfile.role === 'startup') {
      // In a real implementation, we would get this from the user's profile
      setCompanyName(localStorage.getItem('companyName') || 'Your Company');
    }
  }, [userProfile]);

  // Toggle upload UI when no documents are available
  useEffect(() => {
    if (documentsAvailable === false && !checkingDocuments) {
      setShowUploadUI(true);
    } else {
      setShowUploadUI(false);
    }
  }, [documentsAvailable, checkingDocuments]);

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
      const report = await profileService.getFinancialReport(reportId);
      setCurrentReport(report);
      setReportGenerated(true);
      setIsGenerating(false);
    } catch (error) {
      console.error('Error fetching report details:', error);
      toast.error('Failed to load report details');
      setIsGenerating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }

    try {
      setIsUploading(true);
      const response = await profileService.uploadFinancialDocuments(selectedFiles);

      setUploadedDocuments(prev => [...prev, ...response.documents]);
      setSelectedFiles([]);
      toast.success('Documents uploaded successfully');
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast.error('Failed to upload documents');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (uploadedDocuments.length === 0) {
      toast.error('Please upload at least one document first');
      return;
    }

    if (!companyName) {
      toast.error('Please enter a company name');
      return;
    }

    try {
      setIsGenerating(true);
      const documentIds = uploadedDocuments.map(doc => doc.id);

      const response = await profileService.generateFinancialReport(
        documentIds,
        companyName,
        reportType
      );

      setCurrentReport(response.report);
      setReportGenerated(true);

      // Refresh the reports list
      fetchFinancialReports();

      toast.success('Financial report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = (reportId: string) => {
    const url = profileService.getFinancialReportPdfUrl(reportId);
    window.open(url, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Define tutorial steps
  const tutorialSteps = [
    {
      id: 'intro',
      title: 'Financial Due Diligence',
      content: 'This tool helps you analyze financial documents and generate detailed reports compliant with Indian standards.',
      position: 'center' as const
    },
    {
      id: 'report-type',
      title: 'Select Report Type',
      content: 'Choose between a Financial Analysis or an Audit Report based on your needs.',
      element: '.analysis-types-section',
      position: 'bottom' as const
    },
    {
      id: 'company-info',
      title: 'Company Information',
      content: 'Enter your company name or the name of the company you want to analyze.',
      element: 'input#companyName',
      position: 'bottom' as const
    },
    {
      id: 'upload-docs',
      title: 'Upload Documents',
      content: 'Upload financial statements, pitch decks, or other relevant documents for analysis.',
      element: '.document-upload-section',
      position: 'top' as const
    },
    {
      id: 'generate',
      title: 'Generate Report',
      content: 'Click here to generate your financial report after uploading documents.',
      element: '.generate-report-button',
      position: 'top' as const
    }
  ];

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
      <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
        <h3 className="font-semibold mb-2">Error Loading Financial Due Diligence</h3>
        <p>{error}</p>
        {documentsAvailable === false && (
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              onClick={() => setShowUploadUI(true)}
            >
              Upload Financial Documents
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Tutorial Manager */}
      <TutorialManager
        steps={tutorialSteps}
        tutorialId="financial-due-diligence"
        buttonPosition="bottom-right"
        showOnFirstVisit={true}
      />

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
        ) : showUploadUI ? (
          <div className="space-y-8">
            <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100">
              <h3 className="text-lg font-semibold text-indigo-800 mb-3 flex items-center">
                <FiFileText className="mr-2" />
                How It Works
              </h3>
              <p className="text-gray-700 mb-4">
                Our AI-powered financial due diligence tool analyzes financial documents, pitch decks, and other data to provide comprehensive insights and recommendations compliant with Indian company standards.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-50">
                  <div className="text-indigo-600 text-xl mb-2">1</div>
                  <h4 className="font-medium text-gray-800 mb-1">Upload Documents</h4>
                  <p className="text-sm text-gray-600">Upload financial statements, pitch decks, or other relevant documents</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-50">
                  <div className="text-indigo-600 text-xl mb-2">2</div>
                  <h4 className="font-medium text-gray-800 mb-1">AI Analysis</h4>
                  <p className="text-sm text-gray-600">Our AI analyzes the data using advanced financial models compliant with Indian standards</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-50">
                  <div className="text-indigo-600 text-xl mb-2">3</div>
                  <h4 className="font-medium text-gray-800 mb-1">Get Insights</h4>
                  <p className="text-sm text-gray-600">Receive detailed reports with actionable insights and recommendations</p>
                </div>
              </div>
            </div>

            {/* Report Type Selection */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 analysis-types-section">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Report Type</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${reportType === 'analysis' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                  onClick={() => setReportType('analysis')}
                >
                  <div className="flex items-start">
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 ${reportType === 'analysis' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-400'}`}>
                      {reportType === 'analysis' && (
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
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${reportType === 'audit' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                  onClick={() => setReportType('audit')}
                >
                  <div className="flex items-start">
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 ${reportType === 'audit' ? 'border-indigo-600 bg-indigo-600' : 'border-gray-400'}`}>
                      {reportType === 'audit' && (
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

            {/* Company Name Input */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Information</h3>

              <div className="mb-4">
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter company name"
                />
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 document-upload-section">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Upload Financial Documents</h3>

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

              {/* File Upload Area */}
              <div className="mb-6">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition-colors"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <div className="flex flex-col items-center">
                    <FiUpload className="text-4xl text-gray-400 mb-3" />
                    <span className="text-sm font-medium text-gray-700">Click to upload financial documents</span>
                    <span className="text-xs text-gray-500 mt-1">PDF, Excel, or CSV files (max 15MB)</span>
                  </div>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.xls,.xlsx,.csv,.json"
                  multiple
                />
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">Selected Files</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md">
                        <div className="flex items-center">
                          <FiFileText className="text-indigo-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-800 truncate max-w-xs">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeSelectedFile(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Uploaded Documents List */}
              {uploadedDocuments.length > 0 && (
                <div className="mb-6 bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">Uploaded Documents</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {uploadedDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                        <FiClipboard className="text-green-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-800 truncate max-w-xs">{doc.originalName}</p>
                          <p className="text-xs text-gray-500">{(doc.fileSize / 1024 / 1024).toFixed(2)} MB • Ready for analysis</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex justify-between">
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  onClick={() => setSelectedFiles([])}
                  disabled={selectedFiles.length === 0 || isUploading}
                >
                  Clear
                </button>
                <button
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                  onClick={handleUpload}
                  disabled={selectedFiles.length === 0 || isUploading}
                >
                  {isUploading ? (
                    <>
                      <SimpleSpinner size="sm" color="text-white" />
                      <span className="ml-2">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <FiUpload className="mr-2" />
                      Upload Documents
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generate Report Button */}
            <div className="text-center">
              <motion.button
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md flex items-center mx-auto generate-report-button"
                onClick={handleGenerateReport}
                disabled={isGenerating || uploadedDocuments.length === 0 || !companyName}
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
                    Generate {reportType === 'analysis' ? 'Financial Analysis' : 'Audit Report'}
                  </>
                )}
              </motion.button>
              <p className="text-sm text-gray-500 mt-2">
                {uploadedDocuments.length === 0 ? 'Upload documents to generate a report' :
                  !companyName ? 'Enter company name to generate a report' :
                    `Generate a ${reportType === 'analysis' ? 'financial analysis' : 'audit report'} based on uploaded documents`}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <h3 className="text-xl font-medium text-gray-700 mb-2">No financial documents available</h3>
            <p className="text-gray-500 mb-6">Upload financial documents to generate a due diligence report</p>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              onClick={() => setShowUploadUI(true)}
            >
              Upload Financial Documents
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialDueDiligence;

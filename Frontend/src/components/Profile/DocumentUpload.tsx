import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiFile, FiTrash2, FiDownload, FiEye, FiEyeOff, FiEdit, FiX, FiCheck, FiFileText, FiFilePlus, FiFolder, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { profileService } from '../../services/api';
import SimpleSpinner from '../SimpleSpinner';

type DocumentType =
  // General document types
  'pitch_deck' | 'other' | 'miscellaneous' |
  // Financial document types
  'financial_balance_sheet' | 'financial_income_statement' | 'financial_cash_flow' |
  'financial_tax_returns' | 'financial_audit_report' | 'financial_gst_returns' |
  'financial_bank_statements' | 'financial_projections' | 'financial_valuation_report' |
  'financial_cap_table' | 'financial_funding_history' | 'financial_debt_schedule';

interface Document {
  id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  description: string;
  documentType: DocumentType;
  timePeriod?: string; // Added time period field
  isPublic: boolean;
  createdAt: string;
}

interface RequiredDocument {
  type: DocumentType;
  label: string;
  description: string;
  userType: 'startup' | 'investor' | 'both';
  required: boolean;
}

const DocumentUpload: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // User type state
  const [userType, setUserType] = useState<'startup' | 'investor' | ''>('');

  // Form states
  const [description, setDescription] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('other');
  const [timePeriod, setTimePeriod] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Required documents definition
  const requiredDocuments: RequiredDocument[] = [
    // Financial documents for both user types
    { type: 'financial_balance_sheet', label: 'Balance Sheet', description: 'Annual balance sheet showing assets, liabilities, and equity', userType: 'both', required: true },
    { type: 'financial_income_statement', label: 'Income Statement', description: 'Profit & loss statement showing revenue and expenses', userType: 'both', required: true },
    { type: 'financial_cash_flow', label: 'Cash Flow Statement', description: 'Statement showing cash inflows and outflows', userType: 'both', required: true },
    { type: 'financial_tax_returns', label: 'Tax Returns', description: 'Income tax returns for the last 2-3 years', userType: 'both', required: true },
    { type: 'financial_gst_returns', label: 'GST Returns', description: 'GST returns for the last 4-6 quarters', userType: 'both', required: true },
    { type: 'financial_bank_statements', label: 'Bank Statements', description: 'Bank statements for the last 6-12 months', userType: 'both', required: true },

    // Startup-specific documents
    { type: 'financial_projections', label: 'Financial Projections', description: 'Future financial forecasts for 3-5 years', userType: 'startup', required: true },
    { type: 'financial_cap_table', label: 'Cap Table', description: 'Capitalization table showing ownership structure', userType: 'startup', required: true },
    { type: 'financial_funding_history', label: 'Funding History', description: 'Details of previous funding rounds', userType: 'startup', required: false },
    { type: 'financial_valuation_report', label: 'Valuation Report', description: 'Company valuation report if available', userType: 'startup', required: false },

    // Investor-specific documents
    { type: 'financial_audit_report', label: 'Audit Report', description: 'Independent audit report of financial statements', userType: 'investor', required: true },
    { type: 'financial_debt_schedule', label: 'Debt Schedule', description: 'Schedule of outstanding debts and payment terms', userType: 'investor', required: false },

    // Other document types
    { type: 'pitch_deck', label: 'Pitch Deck', description: 'Presentation for potential investors', userType: 'startup', required: true },
    { type: 'miscellaneous', label: 'Miscellaneous', description: 'Other relevant documents', userType: 'both', required: false },
  ];

  // Fetch documents and user type on component mount
  useEffect(() => {
    fetchDocuments();
    fetchUserType();
  }, []);

  // Fetch user type
  const fetchUserType = async () => {
    try {
      const response = await profileService.getUserType();
      setUserType(response.userType);
    } catch (error) {
      console.error('Error fetching user type:', error);
      toast.error('Failed to determine user type');
    }
  };

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const docs = await profileService.getUserDocuments();
      setDocuments(docs);
    } catch (error) {
      toast.error('Failed to load documents');
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setIsUploading(true);
      await profileService.uploadDocument(selectedFile, {
        description,
        documentType,
        timePeriod,
        isPublic
      });

      toast.success('Document uploaded successfully');
      setUploadModalOpen(false);
      resetForm();
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to upload document');
      console.error('Error uploading document:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await profileService.deleteDocument(documentId);
      toast.success('Document deleted successfully');
      setDocuments(documents.filter(doc => doc.id !== documentId));
    } catch (error) {
      toast.error('Failed to delete document');
      console.error('Error deleting document:', error);
    }
  };

  const handleDownload = (documentId: string) => {
    // Open the document in a new tab for viewing or downloading
    window.open(profileService.getDocumentDownloadUrl(documentId), '_blank');
  };

  const handleEditClick = (document: Document) => {
    setSelectedDocument(document);
    setDescription(document.description);
    setDocumentType(document.documentType);
    setTimePeriod(document.timePeriod || '');
    setIsPublic(document.isPublic);
    setEditModalOpen(true);
  };

  const handleUpdateMetadata = async () => {
    if (!selectedDocument) return;

    try {
      await profileService.updateDocumentMetadata(selectedDocument.id, {
        description,
        documentType,
        timePeriod,
        isPublic
      });

      toast.success('Document updated successfully');
      setEditModalOpen(false);

      // Update the document in the local state
      setDocuments(documents.map(doc =>
        doc.id === selectedDocument.id
          ? { ...doc, description, documentType, timePeriod, isPublic }
          : doc
      ));

      setSelectedDocument(null);
    } catch (error) {
      toast.error('Failed to update document');
      console.error('Error updating document:', error);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setDescription('');
    setDocumentType('other');
    setTimePeriod('');
    setIsPublic(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('presentation')) return '📊';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('image')) return '🖼️';
    return '📁';
  };

  const getDocumentTypeLabel = (type: string) => {
    // General document types
    if (type === 'pitch_deck') return 'Pitch Deck';
    if (type === 'other') return 'Other';
    if (type === 'miscellaneous') return 'Miscellaneous';

    // Financial document types
    if (type === 'financial_balance_sheet') return 'Balance Sheet';
    if (type === 'financial_income_statement') return 'Income Statement';
    if (type === 'financial_cash_flow') return 'Cash Flow Statement';
    if (type === 'financial_tax_returns') return 'Tax Returns';
    if (type === 'financial_audit_report') return 'Audit Report';
    if (type === 'financial_gst_returns') return 'GST Returns';
    if (type === 'financial_bank_statements') return 'Bank Statements';
    if (type === 'financial_projections') return 'Financial Projections';
    if (type === 'financial_valuation_report') return 'Valuation Report';
    if (type === 'financial_cap_table') return 'Cap Table';
    if (type === 'financial_funding_history') return 'Funding History';
    if (type === 'financial_debt_schedule') return 'Debt Schedule';

    // Fallback
    return type.replace('financial_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Check if a document of a specific type exists
  const hasDocumentOfType = (type: DocumentType) => {
    return documents.some(doc => doc.documentType === type);
  };

  // Get document of a specific type (returns the first one found)
  const getDocumentOfType = (type: DocumentType) => {
    return documents.find(doc => doc.documentType === type);
  };

  // Get all documents of a specific type
  const getAllDocumentsOfType = (type: DocumentType) => {
    return documents.filter(doc => doc.documentType === type);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
            <FiFolder className="mr-3 text-indigo-600" />
            Document Management
          </h2>
          <p className="text-gray-600 text-sm max-w-2xl">
            Upload and manage your documents. These documents can be shared with potential matches to enhance your profile and facilitate due diligence.
          </p>
        </div>
        <motion.button
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center px-5 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg shadow-md transition-all font-medium self-start md:self-center"
          whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
          whileTap={{ scale: 0.95 }}
        >
          <FiFilePlus className="mr-2 text-lg" />
          Upload Document
        </motion.button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <SimpleSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Required Documents Section */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <FiAlertCircle className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Required Financial Documents</h3>
            </div>
            <div className="bg-gradient-to-r from-red-50 to-white rounded-xl border border-red-100 p-5 mb-4">
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                The following documents are <span className="font-semibold">required</span> for comprehensive financial analysis and due diligence reports.
                Missing documents will limit the accuracy and completeness of generated reports and may affect your matching potential.
              </p>

              <div className="space-y-4">
                {/* Filter required documents based on user type */}
                {requiredDocuments
                  .filter(doc => (doc.required && (doc.userType === userType || doc.userType === 'both')))
                  .map(reqDoc => {
                    const docExists = hasDocumentOfType(reqDoc.type);
                    const existingDoc = getDocumentOfType(reqDoc.type);

                    return (
                      <div key={reqDoc.type} className="flex items-start p-3 rounded-lg border border-gray-200 bg-white">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 ${docExists ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {docExists ? <FiCheck /> : <FiX />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-medium text-gray-800">{reqDoc.label}</h4>
                            {!docExists && (
                              <motion.button
                                onClick={() => {
                                  setUploadModalOpen(true);
                                  setDocumentType(reqDoc.type);
                                }}
                                className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Upload
                              </motion.button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{reqDoc.description}</p>
                          {docExists && (
                            <div className="mt-2">
                              {getAllDocumentsOfType(reqDoc.type).map((doc, index) => (
                                <div key={doc.id} className="flex items-center text-xs text-gray-500 mb-1">
                                  <span className="truncate max-w-xs">{doc.originalName}</span>
                                  <span className="mx-1">•</span>
                                  <span>{formatFileSize(doc.fileSize)}</span>
                                  {doc.timePeriod && (
                                    <>
                                      <span className="mx-1">•</span>
                                      <span className="text-indigo-600">{doc.timePeriod}</span>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Optional Documents Section */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <FiInfo className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Optional Financial Documents</h3>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100 p-5 mb-4">
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                These additional documents are <span className="font-semibold">recommended</span> to provide a more comprehensive view of your financial situation.
                Including these will enhance the quality of due diligence reports and improve your matching potential.
              </p>
              <div className="space-y-4">
                {requiredDocuments
                  .filter(doc => !doc.required && (doc.userType === userType || doc.userType === 'both' || doc.type === 'miscellaneous'))
                  .map(reqDoc => {
                    const docExists = hasDocumentOfType(reqDoc.type);
                    const existingDoc = getDocumentOfType(reqDoc.type);

                    return (
                      <div key={reqDoc.type} className="flex items-start p-3 rounded-lg border border-gray-200 bg-white">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 ${docExists ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                          {docExists ? <FiCheck /> : '?'}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-medium text-gray-800">{reqDoc.label}</h4>
                            {!docExists && (
                              <motion.button
                                onClick={() => {
                                  setUploadModalOpen(true);
                                  setDocumentType(reqDoc.type);
                                }}
                                className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Upload
                              </motion.button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{reqDoc.description}</p>
                          {docExists && (
                            <div className="mt-2">
                              {getAllDocumentsOfType(reqDoc.type).map((doc, index) => (
                                <div key={doc.id} className="flex items-center text-xs text-gray-500 mb-1">
                                  <span className="truncate max-w-xs">{doc.originalName}</span>
                                  <span className="mx-1">•</span>
                                  <span>{formatFileSize(doc.fileSize)}</span>
                                  {doc.timePeriod && (
                                    <>
                                      <span className="mx-1">•</span>
                                      <span className="text-indigo-600">{doc.timePeriod}</span>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* All Uploaded Documents Section */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                <FiFileText className="text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">All Uploaded Documents</h3>
            </div>
            {documents.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
                <div className="w-20 h-20 mx-auto bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                  <FiFileText className="text-4xl text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">No documents yet</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6 px-4">
                  Upload pitch decks, financial statements, or other documents to share with potential matches and enhance your profile.
                </p>
                <motion.button
                  onClick={() => setUploadModalOpen(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg shadow-md font-medium transition-all"
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiUpload className="mr-2" />
                  Upload Your First Document
                </motion.button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {documents.map(doc => (
                  <motion.div
                    key={doc.id}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 flex items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <div className="text-xl text-indigo-600">{getFileIcon(doc.fileType)}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-800 truncate" title={doc.originalName}>
                          {doc.originalName}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(doc.fileSize)}
                        </p>
                      </div>
                      <div className="ml-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${doc.isPublic
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                          {doc.isPublic ? (
                            <>
                              <FiEye className="mr-1" size={10} />
                              Public
                            </>
                          ) : (
                            <>
                              <FiEyeOff className="mr-1" size={10} />
                              Private
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-600 mb-1">Description:</p>
                        <p className="text-sm text-gray-800">{doc.description || 'No description provided'}</p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>Type: {doc.documentType}</span>
                        {doc.timePeriod && <span>Period: {doc.timePeriod}</span>}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex space-x-1">
                          <motion.button
                            onClick={() => handleDownload(doc.id)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="View & Download"
                          >
                            <FiEye size={16} />
                          </motion.button>
                          <motion.button
                            onClick={() => handleEditClick(doc)}
                            className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Edit"
                          >
                            <FiEdit size={16} />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDelete(doc.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Upload Modal */}
            <AnimatePresence>
              {uploadModalOpen && (
                <motion.div
                  className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setUploadModalOpen(false)}
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                >
                  <motion.div
                    className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-blue-600">
                      <h3 className="text-lg font-semibold text-white">Upload Document</h3>
                      <button
                        onClick={() => setUploadModalOpen(false)}
                        className="text-white hover:text-gray-200 focus:outline-none"
                      >
                        <FiX className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <span className="mr-1">Document</span>
                          <span className="text-red-500">*</span>
                        </label>
                        <div
                          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${selectedFile
                            ? 'border-green-500 bg-green-50'
                            : 'border-indigo-300 bg-indigo-50 hover:border-indigo-500 hover:bg-indigo-100'
                            }`}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {selectedFile ? (
                            <div className="flex flex-col items-center">
                              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                                <FiFile className="text-3xl text-green-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-800">{selectedFile.name}</span>
                              <span className="text-xs text-gray-500 mt-1">{formatFileSize(selectedFile.size)}</span>
                              <span className="mt-3 text-xs text-green-600 font-medium">File selected - click to change</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                                <FiUpload className="text-2xl text-indigo-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-800">Click to select a file</span>
                              <span className="text-xs text-gray-600 mt-1">PDF, PPT, DOC, or image files</span>
                              <span className="text-xs text-gray-500 mt-1">(Maximum size: 10MB)</span>
                            </div>
                          )}
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <span className="mr-1">Document Type</span>
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white pr-10 text-sm"
                          >
                            <optgroup label="General Documents" className="font-semibold text-gray-700">
                              <option value="pitch_deck">Pitch Deck</option>
                              <option value="miscellaneous">Miscellaneous</option>
                              <option value="other">Other</option>
                            </optgroup>
                            <optgroup label="Financial Documents" className="font-semibold text-gray-700">
                              <option value="financial_balance_sheet">Balance Sheet</option>
                              <option value="financial_income_statement">Income Statement</option>
                              <option value="financial_cash_flow">Cash Flow Statement</option>
                              <option value="financial_tax_returns">Tax Returns</option>
                              <option value="financial_gst_returns">GST Returns</option>
                              <option value="financial_bank_statements">Bank Statements</option>
                              <option value="financial_audit_report">Audit Report</option>
                              <option value="financial_projections">Financial Projections</option>
                              <option value="financial_valuation_report">Valuation Report</option>
                              <option value="financial_cap_table">Cap Table</option>
                              <option value="financial_funding_history">Funding History</option>
                              <option value="financial_debt_schedule">Debt Schedule</option>
                            </optgroup>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-600">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <span>Time Period</span>
                          <span className="ml-1 text-xs text-gray-500">(optional)</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            value={timePeriod}
                            onChange={(e) => setTimePeriod(e.target.value)}
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="e.g., Q1 2023, FY 2022, 2021-2022"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Specify the time period this document covers (e.g., quarter, fiscal year)</p>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <span>Description</span>
                          <span className="ml-1 text-xs text-gray-500">(optional)</span>
                        </label>
                        <div className="relative">
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            rows={3}
                            placeholder="Add a brief description of this document"
                          />
                          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                            {description.length}/200
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Provide additional context about this document</p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                          <div className="relative inline-block w-12 mr-3 align-middle select-none">
                            <label htmlFor="isPublic" className="cursor-pointer">
                              <input
                                type="checkbox"
                                id="isPublic"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="sr-only"
                              />
                              <div className="w-12 h-6 bg-gray-200 rounded-full shadow-inner"></div>
                              <div
                                className={`absolute block w-6 h-6 rounded-full shadow inset-y-0 left-0 transition-transform duration-300 ease-in-out ${isPublic ? 'bg-indigo-600 transform translate-x-full' : 'bg-white'
                                  }`}
                              ></div>
                            </label>
                          </div>
                          <div>
                            <label htmlFor="isPublic" className="text-sm font-medium text-gray-700 cursor-pointer">
                              Make this document public
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                              {isPublic
                                ? 'This document will be visible to potential matches and shared profiles'
                                : 'This document will only be visible to you'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6">
                        <motion.button
                          onClick={handleUpload}
                          className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 text-white font-medium shadow-md transition-all duration-200 ${isUploading || !selectedFile
                            ? 'bg-gray-400 cursor-not-allowed opacity-70'
                            : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'
                            }`}
                          whileHover={isUploading || !selectedFile ? {} : { scale: 1.02 }}
                          whileTap={isUploading || !selectedFile ? {} : { scale: 0.98 }}
                          disabled={isUploading || !selectedFile}
                        >
                          {isUploading ? (
                            <>
                              <SimpleSpinner size="sm" color="text-white" />
                              <span>Uploading Document...</span>
                            </>
                          ) : (
                            <>
                              <FiUpload className="h-5 w-5" />
                              <span>Upload Document</span>
                            </>
                          )}
                        </motion.button>
                        {!selectedFile && (
                          <p className="text-center text-xs text-red-500 mt-2">Please select a file to upload</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
              {editModalOpen && selectedDocument && (
                <motion.div
                  className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setEditModalOpen(false)}
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                >
                  <motion.div
                    className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-blue-600">
                      <h3 className="text-lg font-semibold text-white">Edit Document</h3>
                      <button
                        onClick={() => setEditModalOpen(false)}
                        className="text-white hover:text-gray-200 focus:outline-none"
                      >
                        <FiX className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="flex items-center p-4 mb-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                          <div className="text-2xl text-indigo-600">{getFileIcon(selectedDocument.fileType)}</div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-800 mb-1">{selectedDocument.originalName}</h3>
                          <div className="flex items-center">
                            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">{formatFileSize(selectedDocument.fileSize)}</span>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-xs text-gray-500">Uploaded on {new Date(selectedDocument.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <span className="mr-1">Document Type</span>
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white pr-10 text-sm"
                          >
                            <optgroup label="General Documents" className="font-semibold text-gray-700">
                              <option value="pitch_deck">Pitch Deck</option>
                              <option value="miscellaneous">Miscellaneous</option>
                              <option value="other">Other</option>
                            </optgroup>
                            <optgroup label="Financial Documents" className="font-semibold text-gray-700">
                              <option value="financial_balance_sheet">Balance Sheet</option>
                              <option value="financial_income_statement">Income Statement</option>
                              <option value="financial_cash_flow">Cash Flow Statement</option>
                              <option value="financial_tax_returns">Tax Returns</option>
                              <option value="financial_gst_returns">GST Returns</option>
                              <option value="financial_bank_statements">Bank Statements</option>
                              <option value="financial_audit_report">Audit Report</option>
                              <option value="financial_projections">Financial Projections</option>
                              <option value="financial_valuation_report">Valuation Report</option>
                              <option value="financial_cap_table">Cap Table</option>
                              <option value="financial_funding_history">Funding History</option>
                              <option value="financial_debt_schedule">Debt Schedule</option>
                            </optgroup>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-600">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <span>Time Period</span>
                          <span className="ml-1 text-xs text-gray-500">(optional)</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            value={timePeriod}
                            onChange={(e) => setTimePeriod(e.target.value)}
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="e.g., Q1 2023, FY 2022, 2021-2022"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Specify the time period this document covers</p>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <span>Description</span>
                          <span className="ml-1 text-xs text-gray-500">(optional)</span>
                        </label>
                        <div className="relative">
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            rows={3}
                            placeholder="Add a brief description of this document"
                          />
                          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                            {description.length}/200
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Provide additional context about this document</p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                          <div className="relative inline-block w-12 mr-3 align-middle select-none">
                            <label htmlFor="editIsPublic" className="cursor-pointer">
                              <input
                                type="checkbox"
                                id="editIsPublic"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="sr-only"
                              />
                              <div className="w-12 h-6 bg-gray-200 rounded-full shadow-inner"></div>
                              <div
                                className={`absolute block w-6 h-6 rounded-full shadow inset-y-0 left-0 transition-transform duration-300 ease-in-out ${isPublic ? 'bg-indigo-600 transform translate-x-full' : 'bg-white'
                                  }`}
                              ></div>
                            </label>
                          </div>
                          <div>
                            <label htmlFor="editIsPublic" className="text-sm font-medium text-gray-700 cursor-pointer">
                              Make this document public
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                              {isPublic
                                ? 'This document will be visible to potential matches and shared profiles'
                                : 'This document will only be visible to you'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 flex space-x-3">
                        <motion.button
                          onClick={() => setEditModalOpen(false)}
                          className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span>Cancel</span>
                        </motion.button>
                        <motion.button
                          onClick={handleUpdateMetadata}
                          className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg flex items-center justify-center font-medium shadow-md"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <FiCheck className="mr-2" />
                          <span>Save Changes</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
};

export default DocumentUpload;

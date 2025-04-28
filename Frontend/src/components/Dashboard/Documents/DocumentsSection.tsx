import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiSearch, FiFilter, FiInfo, FiMessageSquare } from 'react-icons/fi';
import { useEntityDocuments } from '../../../hooks/useEntityDocuments';
import DocumentList from './DocumentList';
import { UserProfile } from '../../../types/Dashboard.types';
import { toast } from 'react-hot-toast';

interface DocumentsSectionProps {
  userProfile: UserProfile | null;
  selectedMatchId: string | null;
  matches: any[]; // Using any for now, should be replaced with proper type
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  userProfile,
  selectedMatchId,
  matches
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocumentType, setSelectedDocumentType] = useState<string>('all');
  const [selectedEntityName, setSelectedEntityName] = useState<string>('');

  // Determine entity type based on user role
  const entityType = userProfile?.role === 'startup' ? 'investor' : 'startup';

  // State for document request modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestingDocuments, setRequestingDocuments] = useState(false);

  // Fetch documents for the selected entity
  const { documents, loading, error, refetch } = useEntityDocuments(
    selectedMatchId,
    entityType
  );

  // Handle document view analytics
  const handleViewAnalytics = async (documentId: string) => {
    try {
      // Call API to record document view
      await fetch('/api/analytics/document-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          documentId,
          viewerId: userProfile?.userId,
          viewerType: userProfile?.role,
          entityId: selectedMatchId,
          entityType
        }),
      });
    } catch (error) {
      console.error('Failed to record document view:', error);
    }
  };

  // Handle document download analytics
  const handleDownloadAnalytics = async (documentId: string) => {
    try {
      // Call API to record document download
      await fetch('/api/analytics/document-download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          documentId,
          downloaderId: userProfile?.userId,
          downloaderType: userProfile?.role,
          entityId: selectedMatchId,
          entityType
        }),
      });
    } catch (error) {
      console.error('Failed to record document download:', error);
    }
  };

  // Handle document request submission
  const handleRequestDocuments = async () => {
    if (!selectedMatchId || !requestMessage.trim()) {
      toast.error('Please enter a message for your document request');
      return;
    }

    setRequestingDocuments(true);

    try {
      // Call API to send document request message
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: selectedMatchId,
          message: requestMessage,
          messageType: 'document_request'
        }),
      });

      if (response.ok) {
        toast.success('Document request sent successfully');
        setShowRequestModal(false);
        setRequestMessage('');
      } else {
        toast.error('Failed to send document request');
      }
    } catch (error) {
      console.error('Error sending document request:', error);
      toast.error('Failed to send document request');
    } finally {
      setRequestingDocuments(false);
    }
  };

  // Filter documents based on search query and selected document type
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedDocumentType === 'all' || doc.documentType.includes(selectedDocumentType);

    return matchesSearch && matchesType;
  });

  // Get unique document types for filter dropdown
  const documentTypes = ['all', ...new Set(documents.map(doc => doc.documentType))];

  // Update selected entity name when selectedMatchId changes
  useEffect(() => {
    if (selectedMatchId && matches.length > 0) {
      const selectedMatch = matches.find(match => match.id === selectedMatchId);
      if (selectedMatch) {
        setSelectedEntityName(selectedMatch.companyName || selectedMatch.name || 'Selected Company');
      }
    } else {
      setSelectedEntityName('');
    }
  }, [selectedMatchId, matches]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="documents-section"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Documents</h2>
          <p className="text-gray-600">
            {selectedMatchId
              ? `View documents shared by ${selectedEntityName}`
              : 'Select a company from the matches tab to view their documents'}
          </p>
        </div>
      </motion.div>

      {/* No selection message */}
      {!selectedMatchId && (
        <motion.div variants={itemVariants} className="mb-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <div className="flex">
              <FiInfo className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-blue-700 mb-1">No Company Selected</h3>
                <p className="text-blue-600">
                  Please go to the Matches tab and select a company to view their documents.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Request documents button - only show if a company is selected */}
      {selectedMatchId && (
        <motion.div variants={itemVariants} className="mb-6">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-start">
              <FiFileText className="w-5 h-5 text-indigo-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-md font-semibold text-indigo-700 mb-1">Need additional documents?</h3>
                <p className="text-indigo-600 text-sm">
                  Request specific documents from {selectedEntityName} to help with your due diligence process.
                </p>
              </div>
            </div>
            <motion.button
              onClick={() => setShowRequestModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700 transition-colors flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiMessageSquare className="mr-2" />
              Request Documents
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Search and filters - only show if there's a selected match */}
      {selectedMatchId && (
        <motion.div variants={itemVariants} className="mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search input */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Document type filter */}
              <div className="w-full md:w-64">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiFilter className="text-gray-400" />
                  </div>
                  <select
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                    value={selectedDocumentType}
                    onChange={(e) => setSelectedDocumentType(e.target.value)}
                  >
                    <option value="all">All Document Types</option>
                    {documentTypes
                      .filter(type => type !== 'all')
                      .map((type) => (
                        <option key={type} value={type}>
                          {type
                            .replace('financial_', '')
                            .replace(/_/g, ' ')
                            .split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Document list */}
      {selectedMatchId && (
        <motion.div variants={itemVariants}>
          <DocumentList
            documents={filteredDocuments}
            loading={loading}
            error={error}
            entityName={selectedEntityName}
            onViewAnalytics={handleViewAnalytics}
            onDownloadAnalytics={handleDownloadAnalytics}
          />
        </motion.div>
      )}

      {/* Document Request Modal */}
      {showRequestModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowRequestModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-blue-600">
              <h3 className="text-lg font-semibold text-white">Request Documents</h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <FiInfo className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  Send a message to {selectedEntityName} requesting specific documents you need for your due diligence process.
                </p>
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-sm text-yellow-800">
                  <FiInfo className="inline-block mr-2" />
                  Your message will be sent to the company's message inbox. They will be notified of your request.
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Please specify which documents you need and why they would be helpful..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  rows={5}
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestDocuments}
                  disabled={requestingDocuments || !requestMessage.trim()}
                  className={`px-4 py-2 rounded-lg text-white flex items-center ${requestingDocuments || !requestMessage.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                  {requestingDocuments ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiMessageSquare className="mr-2" />
                      Send Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DocumentsSection;

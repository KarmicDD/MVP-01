import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiDownload, FiEye, FiInfo, FiArrowUp, FiArrowDown, FiCalendar, FiType, FiAlignLeft } from 'react-icons/fi';
import { Document } from '../../../hooks/useEntityDocuments';

interface DocumentListProps {
  documents: Document[];
  loading: boolean;
  error: string | null;
  entityName?: string;
  onViewAnalytics?: (documentId: string) => void;
  onDownloadAnalytics?: (documentId: string) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  loading,
  error,
  entityName,
  onViewAnalytics,
  onDownloadAnalytics
}) => {
  // State for sorting
  const [sortField, setSortField] = useState<'name' | 'date'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Function to get formatted document type
  const getFormattedDocumentType = (type: string): string => {
    return type
      .replace('financial_', '')
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Function to get file icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FiFileText className="text-red-500" />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet') || fileType.includes('xlsx') || fileType.includes('xls'))
      return <FiFileText className="text-green-500" />;
    if (fileType.includes('word') || fileType.includes('doc')) return <FiFileText className="text-blue-500" />;
    if (fileType.includes('image') || fileType.includes('png') || fileType.includes('jpg') || fileType.includes('jpeg'))
      return <FiFileText className="text-purple-500" />;
    return <FiFileText className="text-gray-500" />;
  };

  // Function to handle document download
  const handleDownload = (document: Document) => {
    // Track download analytics
    if (onDownloadAnalytics) {
      onDownloadAnalytics(document.id);
    }
    // Implement document download logic
    window.open(`/api/profile/documents/${document.id}/download`, '_blank');
  };

  // Function to handle document view/preview
  const handleView = (document: Document) => {
    // Track view analytics
    if (onViewAnalytics) {
      onViewAnalytics(document.id);
    }
    // Open document preview modal
    setPreviewDocument(document);
    setShowPreview(true);
  };

  // State for document preview
  const [showPreview, setShowPreview] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);

  // Toggle sort direction or change sort field
  const handleSort = (field: 'name' | 'date') => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default desc direction
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sort documents based on current sort settings
  const sortedDocuments = useMemo(() => {
    return [...documents].sort((a, b) => {
      if (sortField === 'name') {
        const comparison = a.originalName.localeCompare(b.originalName);
        return sortDirection === 'asc' ? comparison : -comparison;
      } else { // date
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });
  }, [documents, sortField, sortDirection]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-6 mb-8">
        <div className="flex">
          <FiInfo className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-red-700 mb-1">Error Loading Documents</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiFileText className="text-gray-400 w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          {entityName
            ? `No Documents Available for ${entityName}`
            : 'No Documents Available'}
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          {entityName
            ? `${entityName} hasn't uploaded any public documents yet.`
            : 'No public documents have been uploaded yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sorting controls */}
      <div className="flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-gray-700 font-medium">
          {documents.length} {documents.length === 1 ? 'Document' : 'Documents'} Available
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => handleSort('name')}
            className={`flex items-center px-3 py-1.5 rounded text-sm ${sortField === 'name'
              ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
              : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
          >
            <FiAlignLeft className="mr-1" size={14} />
            Name
            {sortField === 'name' && (
              sortDirection === 'asc'
                ? <FiArrowUp className="ml-1" size={14} />
                : <FiArrowDown className="ml-1" size={14} />
            )}
          </button>

          <button
            onClick={() => handleSort('date')}
            className={`flex items-center px-3 py-1.5 rounded text-sm ${sortField === 'date'
              ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
              : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
          >
            <FiCalendar className="mr-1" size={14} />
            Date
            {sortField === 'date' && (
              sortDirection === 'asc'
                ? <FiArrowUp className="ml-1" size={14} />
                : <FiArrowDown className="ml-1" size={14} />
            )}
          </button>
        </div>
      </div>

      {/* Document grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedDocuments.map((doc) => (
          <motion.div
            key={doc.id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3 flex-shrink-0">
                <div className="text-xl">{getFileIcon(doc.fileType)}</div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-800 truncate" title={doc.originalName}>
                  {doc.originalName}
                </h3>
                <p className="text-xs text-gray-500">
                  {formatFileSize(doc.fileSize)}
                  {doc.timePeriod && (
                    <span className="ml-2 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs">
                      {doc.timePeriod}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="p-4">
              <div className="mb-3">
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                  {getFormattedDocumentType(doc.documentType)}
                </span>
              </div>

              {doc.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{doc.description}</p>
              )}

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                </span>

                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => handleView(doc)}
                    className="p-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Preview Document"
                  >
                    <FiEye size={16} />
                  </motion.button>

                  <motion.button
                    onClick={() => handleDownload(doc)}
                    className="p-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Download Document"
                  >
                    <FiDownload size={16} />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Document Preview Modal */}
      {showPreview && previewDocument && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-blue-600">
              <h3 className="text-lg font-semibold text-white truncate flex-1 mr-4">{previewDocument.originalName}</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownload(previewDocument)}
                  className="p-2 rounded-full bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-colors"
                  title="Download Document"
                >
                  <FiDownload size={18} />
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 rounded-full bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-colors"
                  title="Close Preview"
                >
                  <FiInfo size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden bg-gray-100 p-4">
              <div className="h-full bg-white rounded-lg shadow overflow-hidden flex flex-col">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {getFormattedDocumentType(previewDocument.documentType)}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {formatFileSize(previewDocument.fileSize)}
                    </span>
                    {previewDocument.timePeriod && (
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-medium">
                        {previewDocument.timePeriod}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      Uploaded: {new Date(previewDocument.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {previewDocument.description && (
                    <p className="text-sm text-gray-600 mt-2">{previewDocument.description}</p>
                  )}
                </div>

                <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
                  {/* Document preview based on file type */}
                  {previewDocument.fileType.includes('pdf') ? (
                    <iframe
                      src={`/api/profile/documents/${previewDocument.id}/download`}
                      className="w-full h-full border-0"
                      title={previewDocument.originalName}
                    />
                  ) : previewDocument.fileType.includes('image') ? (
                    <img
                      src={`/api/profile/documents/${previewDocument.id}/download`}
                      alt={previewDocument.originalName}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-8 bg-gray-50 rounded-lg">
                      <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-indigo-100 rounded-full">
                        {getFileIcon(previewDocument.fileType)}
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Preview not available</h3>
                      <p className="text-gray-600 mb-4">This document type cannot be previewed directly.</p>
                      <button
                        onClick={() => handleDownload(previewDocument)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center"
                      >
                        <FiDownload className="mr-2" />
                        Download to view
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;

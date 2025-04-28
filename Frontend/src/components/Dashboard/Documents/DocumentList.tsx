import React from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiDownload, FiEye, FiInfo } from 'react-icons/fi';
import { Document } from '../../../hooks/useEntityDocuments';

interface DocumentListProps {
  documents: Document[];
  loading: boolean;
  error: string | null;
  entityName?: string;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  loading,
  error,
  entityName
}) => {
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
    return <FiFileText />;
  };

  // Function to handle document download
  const handleDownload = (document: Document) => {
    // Implement document download logic
    window.open(`/api/profile/documents/${document.id}/download`, '_blank');
  };

  // Function to handle document view
  const handleView = (document: Document) => {
    // Implement document view logic
    window.open(`/api/profile/documents/${document.id}/download`, '_blank');
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
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
                <div className="text-xl text-indigo-600">{getFileIcon(doc.fileType)}</div>
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
                  >
                    <FiEye size={16} />
                  </motion.button>
                  
                  <motion.button
                    onClick={() => handleDownload(doc)}
                    className="p-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FiDownload size={16} />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;

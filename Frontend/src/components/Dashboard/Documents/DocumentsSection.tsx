import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiSearch, FiFilter, FiInfo } from 'react-icons/fi';
import { useEntityDocuments } from '../../../hooks/useEntityDocuments';
import DocumentList from './DocumentList';
import { UserProfile } from '../../../types/Dashboard.types';

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

  // Fetch documents for the selected entity
  const { documents, loading, error, refetch } = useEntityDocuments(
    selectedMatchId,
    entityType
  );

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
          />
        </motion.div>
      )}
    </motion.div>
  );
};

export default DocumentsSection;

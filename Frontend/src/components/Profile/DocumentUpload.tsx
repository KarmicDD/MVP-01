import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiFile, FiTrash2, FiDownload, FiEye, FiEyeOff, FiEdit, FiX, FiCheck, FiFileText, FiFilePlus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { profileService } from '../../services/api';
import SimpleSpinner from '../SimpleSpinner';

interface Document {
  id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  description: string;
  documentType: 'pitch_deck' | 'financial' | 'other';
  isPublic: boolean;
  createdAt: string;
}

const DocumentUpload: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  // Form states
  const [description, setDescription] = useState('');
  const [documentType, setDocumentType] = useState<'pitch_deck' | 'financial' | 'other'>('other');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);
  
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
    window.open(profileService.getDocumentDownloadUrl(documentId), '_blank');
  };
  
  const handleEditClick = (document: Document) => {
    setSelectedDocument(document);
    setDescription(document.description);
    setDocumentType(document.documentType);
    setIsPublic(document.isPublic);
    setEditModalOpen(true);
  };
  
  const handleUpdateMetadata = async () => {
    if (!selectedDocument) return;
    
    try {
      await profileService.updateDocumentMetadata(selectedDocument.id, {
        description,
        documentType,
        isPublic
      });
      
      toast.success('Document updated successfully');
      setEditModalOpen(false);
      
      // Update the document in the local state
      setDocuments(documents.map(doc => 
        doc.id === selectedDocument.id 
          ? { ...doc, description, documentType, isPublic } 
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
    switch (type) {
      case 'pitch_deck': return 'Pitch Deck';
      case 'financial': return 'Financial';
      case 'other': return 'Other';
      default: return type;
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Documents</h2>
        <motion.button
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiFilePlus className="mr-2" />
          Upload Document
        </motion.button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <SimpleSpinner size="lg" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <FiFileText className="mx-auto text-4xl text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No documents yet</h3>
          <p className="text-gray-500 mb-4">Upload pitch decks, financials, or other documents to share with potential matches.</p>
          <motion.button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiUpload className="mr-2" />
            Upload Your First Document
          </motion.button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map(doc => (
            <motion.div
              key={doc.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start">
                <div className="text-3xl mr-3">{getFileIcon(doc.fileType)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-800 truncate" title={doc.originalName}>
                    {doc.originalName}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(doc.fileSize)} • {getDocumentTypeLabel(doc.documentType)}
                  </p>
                  {doc.description && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{doc.description}</p>
                  )}
                  <div className="flex items-center mt-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${doc.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {doc.isPublic ? <FiEye className="mr-1" /> : <FiEyeOff className="mr-1" />}
                      {doc.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-2">
                  <motion.button
                    onClick={() => handleDownload(doc.id)}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-full"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Download"
                  >
                    <FiDownload />
                  </motion.button>
                  <motion.button
                    onClick={() => handleEditClick(doc)}
                    className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-full"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Edit"
                  >
                    <FiEdit />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Delete"
                  >
                    <FiTrash2 />
                  </motion.button>
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
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setUploadModalOpen(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-blue-50">
                <h3 className="text-lg font-semibold text-gray-800">Upload Document</h3>
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Document</label>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {selectedFile ? (
                      <div className="flex flex-col items-center">
                        <FiFile className="text-3xl text-indigo-500 mb-2" />
                        <span className="text-sm font-medium text-gray-800">{selectedFile.name}</span>
                        <span className="text-xs text-gray-500 mt-1">{formatFileSize(selectedFile.size)}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <FiUpload className="text-3xl text-gray-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700">Click to select a file</span>
                        <span className="text-xs text-gray-500 mt-1">PDF, PPT, DOC, or image files (max 10MB)</span>
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
                  <label className="block text-sm font-medium text-gray-700">Document Type</label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as 'pitch_deck' | 'financial' | 'other')}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="pitch_deck">Pitch Deck</option>
                    <option value="financial">Financial Document</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                    placeholder="Add a brief description of this document"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                    Make this document visible to others
                  </label>
                </div>
                
                <div className="pt-4">
                  <motion.button
                    onClick={handleUpload}
                    className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isUploading || !selectedFile}
                  >
                    {isUploading ? (
                      <>
                        <SimpleSpinner size="sm" color="text-white" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <FiUpload className="h-4 w-4" />
                        <span>Upload Document</span>
                      </>
                    )}
                  </motion.button>
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
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditModalOpen(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-blue-50">
                <h3 className="text-lg font-semibold text-gray-800">Edit Document</h3>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">{getFileIcon(selectedDocument.fileType)}</div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">{selectedDocument.originalName}</h3>
                    <p className="text-xs text-gray-500">{formatFileSize(selectedDocument.fileSize)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Document Type</label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as 'pitch_deck' | 'financial' | 'other')}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="pitch_deck">Pitch Deck</option>
                    <option value="financial">Financial Document</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                    placeholder="Add a brief description of this document"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editIsPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="editIsPublic" className="ml-2 block text-sm text-gray-700">
                    Make this document visible to others
                  </label>
                </div>
                
                <div className="pt-4 flex space-x-3">
                  <motion.button
                    onClick={() => setEditModalOpen(false)}
                    className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleUpdateMetadata}
                    className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FiCheck className="mr-2" />
                    Save Changes
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentUpload;

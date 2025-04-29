import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiDownload, FiArrowLeft, FiZoomIn, FiZoomOut, FiCopy, FiChevronDown } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useDocumentViewer, { Document } from '../hooks/useDocumentViewer';
import api from '../services/api';
import PDFViewer from '../components/DocumentViewer/PDFViewer';

const DocumentViewerPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const previousPath = location.state?.from || '/dashboard';

  // Use our custom hook for document viewing
  const { document, loading, error, handleDownload } = useDocumentViewer(documentId);
  const [zoom, setZoom] = useState<number>(100);
  const [iframeError, setIframeError] = useState<boolean>(false);
  const [userDocuments, setUserDocuments] = useState<Document[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Fetch other documents from the same user
  useEffect(() => {
    if (document?.userId) {
      const fetchUserDocuments = async () => {
        try {
          const response = await api.get(`/profile/documents?userId=${document.userId}`);
          if (response.data && response.data.documents) {
            setUserDocuments(response.data.documents);
          }
        } catch (error) {
          console.error('Error fetching user documents:', error);
        }
      };

      fetchUserDocuments();
    }
  }, [document?.userId]);

  // Handle zoom in/out
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  // Handle document selection
  const handleDocumentSelect = (selectedDocId: string) => {
    if (selectedDocId !== documentId) {
      navigate(`/document/${selectedDocId}`, { state: { from: previousPath } });
    }
    setIsDropdownOpen(false);
  };

  // Handle copy link to clipboard
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        toast.success('Link copied to clipboard');
      })
      .catch((err) => {
        console.error('Error copying link:', err);
        toast.error('Failed to copy link: ' + (err instanceof Error ? err.message : String(err)));
      });
  };

  // Get file icon based on file type
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    return '📁';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading document...</h2>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">Error Loading Document</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
          >
            <FiArrowLeft className="mr-2" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  // Document not found state
  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-yellow-500 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">Document Not Available</h2>
          <p className="text-gray-600 text-center mb-6">The requested document could not be found or you may not have permission to view it.</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
          >
            <FiArrowLeft className="mr-2" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => navigate(previousPath)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Go back to documents"
              title="Back to documents"
            >
              <FiArrowLeft size={20} />
            </button>
            <div className="relative">
              <div
                className="flex items-center cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div>
                  <h1 className="text-xl font-semibold text-gray-800 truncate max-w-md">
                    {document.originalName}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {new Date(document.createdAt).toLocaleDateString()} • {document.documentType.replace(/_/g, ' ')}
                    {document.timePeriod ? ` • ${document.timePeriod}` : ''}
                  </p>
                </div>
                {userDocuments.length > 1 && (
                  <FiChevronDown
                    size={20}
                    className={`ml-2 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                )}
              </div>

              {/* Document dropdown */}
              {isDropdownOpen && userDocuments.length > 1 && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
                  <div className="p-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-500">Other documents from this user</p>
                  </div>
                  <ul className="py-1">
                    {userDocuments.map(doc => (
                      <li key={doc.id}>
                        <button
                          onClick={() => handleDocumentSelect(doc.id)}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center ${doc.id === documentId ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'}`}
                        >
                          <span className="mr-2 text-lg">{getFileIcon(doc.fileType)}</span>
                          <div className="overflow-hidden">
                            <p className="font-medium truncate">{doc.originalName}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {new Date(doc.createdAt).toLocaleDateString()} • {doc.documentType.replace(/_/g, ' ')}
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Zoom controls - only for PDFs and images */}
            {(document.fileType.includes('pdf') || document.fileType.includes('image')) && (
              <div className="flex items-center bg-gray-100 rounded-lg mr-2">
                <button
                  onClick={handleZoomOut}
                  className="p-2 text-gray-700 hover:bg-gray-200 rounded-l-lg transition-colors"
                  title="Zoom Out"
                >
                  <FiZoomOut size={18} />
                </button>
                <span className="px-2 text-sm font-medium text-gray-700">{zoom}%</span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 text-gray-700 hover:bg-gray-200 rounded-r-lg transition-colors"
                  title="Zoom In"
                >
                  <FiZoomIn size={18} />
                </button>
              </div>
            )}

            {/* Share button */}
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center"
              title="Copy Link"
            >
              <FiCopy size={18} className="mr-1" />
              <span className="text-sm">Copy Link</span>
            </button>

            {/* Download button */}
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center"
              title="Download Document"
            >
              <FiDownload size={18} className="mr-1" />
              <span className="text-sm">Download</span>
            </button>
          </div>
        </div>
      </header>

      {/* Document content */}
      <main className="flex-1 flex justify-center items-center bg-gray-100 p-4">
        <motion.div
          className="w-full h-full max-w-6xl bg-white rounded-xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Document preview based on file type */}
          {document.fileType.includes('pdf') ? (
            <div className="w-full h-[calc(100vh-120px)] bg-white overflow-hidden">
              <PDFViewer
                documentId={document.id}
                fileName={document.originalName}
                onDownload={handleDownload}
              />
            </div>
          ) : document.fileType.includes('image') ? (
            <div className="w-full h-[calc(100vh-120px)] flex items-center justify-center bg-gray-800 p-4">
              <img
                src={`http://localhost:5000/profile/documents/${document.id}/download`}
                alt={document.originalName}
                className="max-w-full max-h-full object-contain"
                style={{ transform: `scale(${zoom / 100})` }}
                onError={(e) => {
                  console.error('Image loading error');
                  // Replace with error image
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0xMiAwYzYuNjIzIDAgMTIgNS4zNzcgMTIgMTJzLTUuMzc3IDEyLTEyIDEyLTEyLTUuMzc3LTEyLTEyIDUuMzc3LTEyIDEyLTEyem0wIDFjNi4wNzEgMCAxMSA0LjkyOSAxMSAxMXMtNC45MjkgMTEtMTEgMTEtMTEtNC45MjktMTEtMTEgNC45MjktMTEgMTEtMTF6bS0uMDUgMTAuNWMtLjgyNyAwLTEuNS42NzMtMS41IDEuNXMuNjczIDEuNSAxLjUgMS41IDEuNS0uNjczIDEuNS0xLjUtLjY3My0xLjUtMS41LTEuNXptMi41LTEuNWgtNWMtLjI3NiAwLS41LjIyNC0uNS41cy4yMjQuNS41LjVoNWMuMjc2IDAgLjUtLjIyNC41LS41cy0uMjI0LS41LS41LS41em0tLjE1LTVjLS42NjYgMC0xLjA1OC40NDQtMS4wNTggMS4xMDggMCAuMjE5LjA3OC41NDkuMjkzIDEuMDI1LjE4OS40MTkuNDkxIDEuMTAzLjkxNSAyLjExOC4wODkuMjEzLjMzNC4zNDkuNTguMjk4LjI0Ni0uMDUxLjQyMS0uMjcuMzk5LS41Mi0uMDI3LS4yNTMtLjAzLS41MTctLjAzLS43NzggMC0uNzk3LS4xNTgtMS4yNTEtMS4xOTktMS4yNTF6Ii8+PC9zdmc+';
                  e.currentTarget.className = 'w-24 h-24 opacity-50';
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 h-[calc(100vh-120px)]">
              <div className="text-center p-8 bg-gray-50 rounded-lg max-w-md">
                <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-gray-200 rounded-full text-4xl">
                  {getFileIcon(document.fileType)}
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Preview not available</h3>
                <p className="text-gray-600 mb-4">This document type cannot be previewed directly.</p>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center mx-auto"
                >
                  <FiDownload size={18} className="mr-2" />
                  Download to view
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default DocumentViewerPage;

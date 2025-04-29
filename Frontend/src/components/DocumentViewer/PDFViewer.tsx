import React, { useState, useEffect } from 'react';
import { FiDownload, FiAlertTriangle } from 'react-icons/fi';

interface PDFViewerProps {
  documentId: string;
  fileName: string;
  onDownload: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ documentId, fileName, onDownload }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  // Direct download URL
  const pdfUrl = `http://localhost:5000/profile/documents/${documentId}/download?inline=true`;

  // Handle errors
  const handleError = () => {
    console.error('Error loading PDF');
    setError(true);
    setLoading(false);
  };

  // Handle successful load
  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  // Open PDF in a new tab
  const openInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="w-full h-full flex flex-col">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {error ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-8">
          <div className="w-20 h-20 mb-4 flex items-center justify-center bg-red-100 rounded-full text-red-500">
            <FiAlertTriangle size={40} />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Unable to Display PDF</h3>
          <p className="text-gray-600 mb-6 text-center max-w-md">
            The PDF cannot be displayed in the viewer due to browser security restrictions.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={openInNewTab}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
            >
              Open in New Tab
            </button>
            <button
              onClick={onDownload}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
            >
              <FiDownload size={18} className="mr-2" />
              Download PDF
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="w-full text-center py-4 bg-gray-100 border-b border-gray-200">
            <p className="text-gray-700">
              Due to browser security restrictions, please use one of these options to view the document:
            </p>
            <div className="flex justify-center mt-2 space-x-4">
              <button
                onClick={openInNewTab}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Open in New Tab
              </button>
              <button
                onClick={onDownload}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
              >
                <FiDownload size={18} className="mr-2" />
                Download PDF
              </button>
            </div>
          </div>
          <div className="flex-1 w-full flex items-center justify-center p-8 bg-gray-50">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-gray-200 rounded-full text-4xl">
                📄
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">{fileName}</h3>
              <p className="text-gray-600 mb-4">This PDF document is ready to view or download.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;

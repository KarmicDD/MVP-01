import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

// Document interface
export interface Document {
  id: string;
  originalName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  description?: string;
  documentType: string;
  timePeriod?: string;
  createdAt: string;
  userId: string;
}

// Hook return type
interface UseDocumentViewerResult {
  document: Document | null;
  loading: boolean;
  error: string | null;
  handleDownload: () => void;
}

/**
 * Custom hook for viewing documents
 * @param documentId The ID of the document to view
 * @returns Object containing document data, loading state, error state, and download handler
 */
export const useDocumentViewer = (documentId: string | undefined): UseDocumentViewerResult => {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch document details
  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentId) {
        setError('Document ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch document details
        const response = await api.get(`/profile/documents/${documentId}`);
        setDocument(response.data);

        // Record document view analytics
        try {
          // Get the entity information from localStorage or URL parameters
          const entityId = localStorage.getItem('selectedEntityId') || response.data.userId;
          const entityType = localStorage.getItem('selectedEntityType') || 'startup';

          // Make sure we're using the actual logged-in user ID, not 'anonymous'
          const userId = localStorage.getItem('userId');

          if (userId) {
            try {
              await api.post('/analytics/document-view', {
                documentId,
                viewerId: userId,
                viewerType: localStorage.getItem('userRole') || 'user',
                entityId,
                entityType
              });
            } catch (apiError) {
              // Check if it's a database connection error
              const errorMessage = apiError?.response?.data?.error || '';
              if (errorMessage.includes("Can't reach database server")) {
                console.warn('Database connection issue - analytics will be recorded later');
                // Could implement a queue system here to retry later
              } else {
                console.error('API error recording view:', apiError);
                // Don't rethrow - we don't want to prevent viewing the document
              }
            }
          } else {
            // If no userId, log view as anonymous
            console.log('Anonymous document view - not recording analytics');
          }
        } catch (analyticsError) {
          console.error('Failed to record document view:', analyticsError);
          // Don't show error to user for analytics failure
        }
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Failed to load document. It may have been deleted or you may not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  // Handle document download
  const handleDownload = async () => {
    if (!document) {
      toast.error('Document not available');
      return;
    }

    try {
      // Record download analytics
      try {
        // Get the entity information from localStorage or URL parameters
        const entityId = localStorage.getItem('selectedEntityId') || document.userId;
        const entityType = localStorage.getItem('selectedEntityType') || 'startup';

        // Make sure we're using the actual logged-in user ID, not 'anonymous'
        const userId = localStorage.getItem('userId');

        if (userId) {
          try {
            await api.post('/analytics/document-download', {
              documentId,
              downloaderId: userId,
              downloaderType: localStorage.getItem('userRole') || 'user',
              entityId,
              entityType
            });
          } catch (apiError) {
            // Check if it's a database connection error
            const errorMessage = apiError?.response?.data?.error || '';
            if (errorMessage.includes("Can't reach database server")) {
              console.warn('Database connection issue - download analytics will be recorded later');
              // Could implement a queue system here to retry later
            } else {
              console.error('API error recording download:', apiError);
              // Don't rethrow - we don't want to prevent the download
            }
          }
        } else {
          // If no userId, log download as anonymous
          console.log('Anonymous document download - not recording analytics');
        }
      } catch (analyticsError) {
        console.error('Failed to record document download:', analyticsError);
        // Don't show error to user for analytics failure
      }

      // Create a direct download link
      const downloadUrl = `http://localhost:5000/profile/documents/${document.id}/download?download=true`;

      // Create a temporary anchor element to trigger the download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = document.originalName; // Set the filename
      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);
    } catch (err) {
      console.error('Error downloading document:', err);
      toast.error('Failed to download document');
    }
  };

  return {
    document,
    loading,
    error,
    handleDownload,
  };
};

export default useDocumentViewer;

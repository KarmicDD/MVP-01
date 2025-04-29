import { useState, useEffect } from 'react';
import api, { profileService } from '../services/api';
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
  doc: Document | null;
  loading: boolean;
  error: string | null;
  handleDownload: () => void;
}

/**
 * Custom hook for viewing document details and handling downloads
 * @param documentId The ID of the document to view
 * @returns Object containing document data, loading state, error state, and download handler
 */
export const useDocumentViewer = (documentId: string | undefined): UseDocumentViewerResult => {
  const [doc, setDoc] = useState<Document | null>(null);
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

      console.log('useDocumentViewer - Fetching document with ID:', documentId);

      try {
        setLoading(true);
        // Fetch document details
        const response = await api.get(`/profile/documents/${documentId}`);
        console.log('useDocumentViewer - Document data received:', response.data);
        setDoc(response.data);

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
              const errorMessage = (apiError as any)?.response?.data?.error || '';
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
      } catch (err: any) {
        console.error('Error fetching document:', err);
        console.error('Error details:', {
          status: err.response?.status,
          message: err.response?.data?.message,
          documentId
        });

        // Check if it's an authentication error
        if (err.response && err.response.status === 401) {
          setError('Authentication required. Please log in to view this document.');
        } else if (err.response && err.response.status === 403) {
          setError('You do not have permission to view this document.');
        } else if (err.response && err.response.status === 404) {
          setError('Document not found. It may have been deleted.');
        } else {
          setError('Failed to load document. It may have been deleted or you may not have permission to view it.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  // Handle document view & download
  const handleDownload = async () => {
    if (!doc) {
      toast.error('Document not available');
      return;
    }

    try {
      // Record download analytics
      try {
        // Get the entity information from localStorage or URL parameters
        const entityId = localStorage.getItem('selectedEntityId') || doc.userId;
        const entityType = localStorage.getItem('selectedEntityType') || 'startup';

        // Make sure we're using the actual logged-in user ID, not 'anonymous'
        const userId = localStorage.getItem('userId');

        if (userId) {
          try {
            // Record both view and download analytics
            await api.post('/analytics/document-download', {
              documentId,
              downloaderId: userId,
              downloaderType: localStorage.getItem('userRole') || 'user',
              entityId,
              entityType
            });
          } catch (apiError) {
            console.error('API error recording download:', apiError);
            // Don't rethrow - we don't want to prevent the download
          }
        } else {
          // If no userId, log download as anonymous
          console.log('Anonymous document download - not recording analytics');
        }
      } catch (analyticsError) {
        console.error('Failed to record document download:', analyticsError);
        // Don't show error to user for analytics failure
      }

      // Use the profileService to get the authenticated download URL
      const downloadUrl = profileService.getDocumentDownloadUrl(doc.id);
      console.log('useDocumentViewer - Opening document with URL:', downloadUrl);

      // Open the document in a new tab
      window.open(downloadUrl, '_blank');

    } catch (error) {
      console.error('Unexpected error during download:', error);
      toast.error('An unexpected error occurred during download');
    }
  };

  return {
    doc,
    loading,
    error,
    handleDownload,
  };
};

export default useDocumentViewer;

import { useState, useEffect } from 'react';
import { financialDueDiligenceService, profileService } from '../services/api';
import { toast } from 'react-hot-toast';

export interface Document {
  id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  description?: string;
  documentType: string;
  timePeriod?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UseEntityDocumentsResult {
  documents: Document[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch documents for an entity
 * @param entityId The ID of the entity to fetch documents for
 * @param entityType The type of entity ('startup' or 'investor')
 * @returns Object containing documents, loading state, error state, and refetch function
 */
export const useEntityDocuments = (
  entityId: string | null,
  entityType: 'startup' | 'investor' = 'startup'
): UseEntityDocumentsResult => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Function to refetch documents
  const refetch = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!entityId) {
        setDocuments([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // First try to get documents through the financial due diligence service
        try {
          const financialResponse = await financialDueDiligenceService.getEntityDocuments(entityId, entityType);
          if (financialResponse && financialResponse.availableDocuments) {
            // Transform the response to match our Document interface
            const transformedDocs = financialResponse.availableDocuments.map((doc: any) => ({
              id: doc.documentId || doc._id,
              fileName: doc.fileName || doc.documentName,
              originalName: doc.originalName || doc.documentName,
              fileType: doc.fileType || 'unknown',
              fileSize: doc.fileSize || 0,
              description: doc.description || '',
              documentType: doc.documentType,
              timePeriod: doc.timePeriod || '',
              isPublic: doc.isPublic || false,
              createdAt: doc.uploadDate || doc.createdAt,
              updatedAt: doc.updatedAt || doc.uploadDate
            }));
            setDocuments(transformedDocs);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.log('Failed to fetch documents through financial service, trying profile service');
        }

        // If financial service fails, try to get public documents through the profile service
        try {
          const profileResponse = await profileService.getPublicDocuments(entityId);
          if (profileResponse && profileResponse.length > 0) {
            setDocuments(profileResponse);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Failed to fetch documents through profile service', err);
          setError('Failed to fetch documents. Please try again later.');
        }

        // If we get here, we couldn't fetch documents from either service
        setDocuments([]);
        
      } catch (err: any) {
        console.error('Error fetching entity documents:', err);
        setError(err.message || 'Failed to fetch documents');
        toast.error('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [entityId, entityType, refreshTrigger]);

  return { documents, loading, error, refetch };
};

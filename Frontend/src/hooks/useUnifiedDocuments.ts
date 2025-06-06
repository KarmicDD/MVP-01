import { useState, useEffect } from 'react';
import api from '../services/api';

export interface Document {
    documentId: string;
    documentName: string;
    documentType: string;
    uploadDate: string;
    fileSize?: number;
    fileType?: string;
}

export interface CategorizedDocuments {
    financial: Document[];
    legal: Document[];
    other: Document[];
}

export interface EntityInfo {
    companyName?: string;
    entityType?: 'startup' | 'investor';
}

export interface UseUnifiedDocumentsResult {
    // Loading states
    loading: boolean;
    checkingDocuments: boolean;

    // Document data
    allDocuments: Document[];
    categorizedDocuments: CategorizedDocuments | null;
    availableDocuments: Document[];

    // Entity info
    entityInfo: EntityInfo | null;

    // Status
    documentsAvailable: boolean;
    totalDocuments: number;
    error: string | null;

    // Functions
    refreshDocuments: () => Promise<void>;
    getFinancialDocuments: () => Document[];
    getAllDocuments: () => Document[];
}

/**
 * Unified hook for document management that can fetch both all documents and financial-specific documents
 * @param entityId - The entity ID to fetch documents for
 * @param entityType - The type of entity ('startup' | 'investor')
 * @param documentScope - Whether to fetch 'all' documents or just 'financial' documents
 */
export function useUnifiedDocuments(
    entityId: string | null,
    entityType: 'startup' | 'investor' = 'startup',
    documentScope: 'all' | 'financial' = 'all'
): UseUnifiedDocumentsResult {
    const [loading, setLoading] = useState(false);
    const [checkingDocuments, setCheckingDocuments] = useState(false);
    const [allDocuments, setAllDocuments] = useState<Document[]>([]);
    const [categorizedDocuments, setCategorizedDocuments] = useState<CategorizedDocuments | null>(null);
    const [availableDocuments, setAvailableDocuments] = useState<Document[]>([]);
    const [entityInfo, setEntityInfo] = useState<EntityInfo | null>(null);
    const [documentsAvailable, setDocumentsAvailable] = useState(false);
    const [totalDocuments, setTotalDocuments] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const fetchDocuments = async () => {
        if (!entityId) {
            setDocumentsAvailable(false);
            setCheckingDocuments(false);
            setLoading(false);
            return;
        }

        try {
            setCheckingDocuments(true);
            setError(null);
            console.log(`Fetching ${documentScope} documents for entity ${entityId} (${entityType})`);

            let response;

            if (documentScope === 'all') {
                // Fetch all documents using the new endpoint
                response = await api.get(`/financial/entity/${entityId}/all-documents?entityType=${entityType}`);

                // Set all document data
                if (response.data.documents) {
                    setAllDocuments(response.data.documents);
                    setAvailableDocuments(response.data.documents);
                }

                if (response.data.categorizedDocuments) {
                    setCategorizedDocuments(response.data.categorizedDocuments);
                }

                setTotalDocuments(response.data.totalDocuments || 0);
            } else {
                // Fetch only financial documents using the existing endpoint
                response = await api.get(`/financial/entity/${entityId}/documents?entityType=${entityType}`);

                // Set financial document data
                if (response.data.availableDocuments) {
                    setAvailableDocuments(response.data.availableDocuments);
                    setAllDocuments(response.data.availableDocuments);
                }

                setTotalDocuments(response.data.availableDocuments?.length || 0);
            }

            // Set entity info
            if (response.data.entityProfile) {
                setEntityInfo(response.data.entityProfile);
            }

            // Check if documents are available
            const hasDocuments = response.data.documentsAvailable ||
                response.data.totalDocuments > 0 ||
                (response.data.availableDocuments && response.data.availableDocuments.length > 0);
            setDocumentsAvailable(hasDocuments);

        } catch (err: any) {
            console.error(`Error fetching ${documentScope} documents:`, err);
            setError(err.response?.data?.message || `Failed to fetch ${documentScope} documents`);
            setDocumentsAvailable(false);
            setAllDocuments([]);
            setAvailableDocuments([]);
            setCategorizedDocuments(null);
        } finally {
            setCheckingDocuments(false);
            setLoading(false);
        }
    };

    const refreshDocuments = async () => {
        setLoading(true);
        await fetchDocuments();
    };

    const getFinancialDocuments = (): Document[] => {
        if (categorizedDocuments) {
            return categorizedDocuments.financial;
        }
        // Fallback: filter by document type if categorized data is not available
        return allDocuments.filter(doc =>
            doc.documentType.startsWith('financial_') ||
            doc.documentName.toLowerCase().includes('financial') ||
            doc.documentName.toLowerCase().includes('balance') ||
            doc.documentName.toLowerCase().includes('income')
        );
    };

    const getAllDocuments = (): Document[] => {
        return allDocuments;
    };

    useEffect(() => {
        if (entityId) {
            fetchDocuments();
        }
    }, [entityId, entityType, documentScope]);

    return {
        loading,
        checkingDocuments,
        allDocuments,
        categorizedDocuments,
        availableDocuments,
        entityInfo,
        documentsAvailable,
        totalDocuments,
        error,
        refreshDocuments,
        getFinancialDocuments,
        getAllDocuments
    };
}

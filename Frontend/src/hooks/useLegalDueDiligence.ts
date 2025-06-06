import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../services/api';
import axios, { AxiosError } from 'axios';

// Types for the legal due diligence report
export interface LegalDocumentItem {
    documentCategory: string;
    specificDocument: string;
    requirementReference: string;
}

export interface LegalReportItem {
    title: string;
    facts: string[];
    keyFindings: string[];
    recommendedActions: string[];
}

export interface LegalRiskScore {
    score: string;
    riskLevel: string;
    justification: string;
}

export interface LegalMissingDocuments {
    list: LegalDocumentItem[];
    impact: string;
    priorityLevel: 'high' | 'medium' | 'low';
}

export interface LegalCompliance {
    complianceScore: string;
    details: string;
}

export interface LegalAnalysis {
    items: LegalReportItem[];
    complianceAssessment: LegalCompliance;
    riskScore: LegalRiskScore;
    missingDocuments: LegalMissingDocuments;
}

export interface LegalDueDiligenceReport {
    _id?: string;
    entityId: string;
    entityType: 'startup' | 'investor';
    entityProfile: {
        companyName: string;
        industry: string;
        incorporationDate?: string;
        registrationNumber?: string;
        address?: string;
    };
    legalAnalysis: LegalAnalysis;
    reportCalculated: boolean;
    processingNotes?: string;
    availableDocuments: Array<{
        documentId: string;
        documentName: string;
        documentType: string;
        uploadDate: Date;
    }>;
    missingDocumentTypes: string[];
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
}

// Available document type for checking documents
export interface AvailableDocument {
    documentId: string;
    documentName: string;
    documentType: string;
    uploadDate: string;
}

// Entity info type
export interface EntityInfo {
    companyName: string;
    industry?: string;
    incorporationDate?: string;
    registrationNumber?: string;
    address?: string;
}

export const useLegalDueDiligence = (entityId: string, entityType: 'startup' | 'investor') => {
    const [report, setReport] = useState<LegalDueDiligenceReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<{
        message: string;
        suggestedAction?: string;
        errorCode?: string;
        type?: string;
        details?: any;
    } | string | null>(null);
    const [documentsAvailable, setDocumentsAvailable] = useState<boolean | null>(null);
    const [checkingDocuments, setCheckingDocuments] = useState(false);
    const [availableDocuments, setAvailableDocuments] = useState<AvailableDocument[]>([]);
    const [missingDocumentTypes, setMissingDocumentTypes] = useState<string[]>([]);
    const [entityInfo, setEntityInfo] = useState<EntityInfo | null>(null);
    const reportRef = useRef<HTMLDivElement>(null);

    // Check for documents availability when entityId changes
    useEffect(() => {
        if (entityId && entityType) {
            checkDocumentsAvailability();
        }
    }, [entityId, entityType]); const checkDocumentsAvailability = async () => {
        setCheckingDocuments(true);
        setError(null);

        try {
            const response = await api.get(`/legal-due-diligence/new/entity/${entityId}/check-documents`, {
                params: { entityType }
            });

            if (response.data.success) {
                setDocumentsAvailable(response.data.documentsAvailable);
                setAvailableDocuments(response.data.availableDocuments || []);
                setMissingDocumentTypes(response.data.missingDocumentTypes || []);
                setEntityInfo(response.data.entityInfo || null);
            } else {
                setDocumentsAvailable(false);
                setError({
                    message: response.data.message || 'Failed to check document availability',
                    type: 'API_ERROR'
                });
            }
        } catch (error: any) {
            console.error('Error checking document availability:', error);
            setDocumentsAvailable(false);

            if (error.response?.data) {
                setError({
                    message: error.response.data.message || 'Failed to check document availability',
                    type: 'API_ERROR',
                    errorCode: error.response.data.errorCode,
                    suggestedAction: error.response.data.suggestedAction,
                    details: error.response.data
                });
            } else if (error.message) {
                setError({
                    message: error.message,
                    type: 'NETWORK_ERROR'
                });
            } else {
                setError({
                    message: 'Failed to check document availability',
                    type: 'UNKNOWN_ERROR'
                });
            }
        } finally {
            setCheckingDocuments(false);
        }
    }; const generateReport = async (isAutomatic = false) => {
        if (!entityId || !entityType) {
            if (!isAutomatic) toast.error('Entity information is missing');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Show loading toast
            const loadingToast = !isAutomatic ? toast.loading('Generating legal due diligence report...') : null;

            console.log(`Generating legal report for entityId: ${entityId}, entityType: ${entityType}`);
            const response = await api.post(`/legal-due-diligence/new/entity/${entityId}/analyze`, {
                entityType
            });

            if (loadingToast) toast.dismiss(loadingToast);

            if (response.data.success && response.data.data) {
                // Check if the report was successfully calculated
                if (response.data.data.processingStatus === 'pending') {
                    console.warn('Report was generated but processing is pending');
                    setError({
                        message: 'The legal due diligence report is being processed.',
                        suggestedAction: 'This may take a few moments. Please check back shortly.',
                        type: 'PROCESSING_PENDING'
                    });
                    if (!isAutomatic) toast.warning('Report is being processed. This may take a few moments.');
                } else {
                    // For successful completion, we need to fetch the full report
                    await fetchExistingReport();
                    if (!isAutomatic) toast.success('Legal due diligence report generated successfully!');
                }
            } else {
                throw new Error(response.data.message || 'Failed to generate report');
            }
        } catch (error: any) {
            console.error('Error generating legal due diligence report:', error);

            if (error.response?.data) {
                setError({
                    message: error.response.data.message || 'Failed to generate legal due diligence report',
                    type: 'API_ERROR',
                    errorCode: error.response.data.errorCode,
                    suggestedAction: error.response.data.suggestedAction || 'Please try again or contact support if the issue persists.',
                    details: error.response.data
                });
                if (!isAutomatic) toast.error(error.response.data.message || 'Failed to generate legal due diligence report');
            } else if (error.message) {
                setError({
                    message: error.message,
                    type: 'NETWORK_ERROR',
                    suggestedAction: 'Please check your connection and try again.'
                });
                if (!isAutomatic) toast.error(error.message);
            } else {
                setError({
                    message: 'Failed to generate legal due diligence report',
                    type: 'UNKNOWN_ERROR',
                    suggestedAction: 'Please try again or contact support if the issue persists.'
                });
                if (!isAutomatic) toast.error('Failed to generate legal due diligence report');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchExistingReport = async () => {
        if (!entityId || !entityType) return;

        try {
            const response = await api.get(`/legal-due-diligence/new/entity/${entityId}/reports`, {
                params: { entityType }
            });

            if (response.data.success && response.data.data && response.data.data.length > 0) {
                // Get the most recent report
                const latestReport = response.data.data[0];
                setReport(latestReport);
            }
        } catch (error: any) {
            console.error('Error fetching existing report:', error);
            // Don't set error here as this is just a helper function
        }
    };

    const handleExportPDF = async () => {
        if (!reportRef.current || !report) {
            toast.error('Report not available for export');
            return;
        }

        try {
            toast.loading('Preparing PDF export...');

            // Use html2canvas to capture the report
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                height: reportRef.current.scrollHeight,
                width: reportRef.current.scrollWidth,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            // Add first page
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            // Add additional pages if needed
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            toast.dismiss();
            pdf.save(`legal-due-diligence-${report.entityProfile.companyName}-${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success('Legal due diligence report exported as PDF');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            toast.dismiss();
            toast.error('Failed to export PDF');
        }
    }; const handleShareReport = async () => {
        if (!report) {
            toast.error('No report available to share');
            return;
        }

        try {
            const shareData = {
                reportId: report._id,
                entityName: report.entityProfile.companyName,
                reportType: 'Legal Due Diligence',
                generatedDate: new Date(report.createdAt).toLocaleDateString(),
                entityType: report.entityType
            };

            const response = await api.post('/legal-due-diligence/share', shareData);

            if (response.data.success) {
                toast.success('Report sharing link generated successfully!');

                // Copy to clipboard if available
                if (navigator.clipboard && response.data.shareLink) {
                    await navigator.clipboard.writeText(response.data.shareLink);
                    toast.info('Share link copied to clipboard');
                }
            } else {
                throw new Error(response.data.message || 'Failed to generate share link');
            }
        } catch (error: any) {
            console.error('Error sharing report:', error);

            if (error.response?.data) {
                const errorMessage = error.response.data.message || 'Failed to share report';
                toast.error(errorMessage);
                setError({
                    message: errorMessage,
                    type: 'API_ERROR',
                    errorCode: error.response.data.errorCode,
                    details: error.response.data
                });
            } else if (error.message) {
                toast.error(error.message);
                setError({
                    message: error.message,
                    type: 'NETWORK_ERROR'
                });
            } else {
                toast.error('Failed to share report');
                setError({
                    message: 'Failed to share report',
                    type: 'UNKNOWN_ERROR'
                });
            }
        }
    };

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return {
        report,
        loading,
        error,
        documentsAvailable,
        checkingDocuments,
        availableDocuments,
        missingDocumentTypes,
        entityInfo,
        handleExportPDF,
        handleShareReport,
        generateReport,
        formatDate,
        reportRef
    };
};
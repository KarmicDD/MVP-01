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
    recommendedActions: string; // Changed from array to string to match backend
    summary?: string; // NEW: Optional summary for each item, if needed
}

export interface LegalRiskScore {
    score: string;
    riskLevel: 'High' | 'Medium' | 'Low' | 'Critical' | 'Significant' | 'Moderate' | 'Minor' | 'Informational';
    justification: string;
}

export interface LegalMissingDocuments {
    list: LegalDocumentItem[];
    impact: string;
    priorityLevel: 'High' | 'Medium' | 'Low';
}

export interface LegalCompliance {
    complianceScore: string;
    details: string;
    status?: 'Compliant' | 'Partially Compliant' | 'Non-Compliant' | 'Not Assessed';
}

export interface LegalExecutiveSummary {
    headline?: string; // Added: Concise headline for the summary
    summary?: string; // Added: Overall summary of legal findings
    overallRisk: 'Critical' | 'High' | 'Medium' | 'Low';
    legalStructureRating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    complianceRating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    transactionReadiness: 'Ready' | 'Conditional' | 'Requires Work' | 'Not Ready';
    keyFindings: string[];
    criticalIssues: string[];
    recommendedActions: string; // Changed from array to string to match backend
}

export interface LegalSectionAssessment {
    findings: string[];
    riskLevel: 'High' | 'Medium' | 'Low' | 'Critical' | 'Significant' | 'Moderate' | 'Minor' | 'Informational' | 'Not Assessed';
    status?: 'Compliant' | 'Needs Attention' | 'Critical' | 'Good' | 'Fair' | 'Poor' | 'Not Applicable';
    summary?: string;
    keyObservations?: string[];
    implications?: string;
}

export interface LegalCorporateStructure extends LegalSectionAssessment {
    incorporationStatus: string;
    shareCapitalStructure: string;
    boardComposition: string;
    corporateGovernance: string;
}

export interface LegalRegulatoryCompliance extends LegalSectionAssessment {
    corporateLawCompliance: string;
    sectoralCompliance: string;
    taxCompliance: string;
}

export interface LegalMaterialAgreements extends LegalSectionAssessment {
    investmentAgreements: string;
    commercialAgreements: string;
    employmentAgreements: string;
}

export interface LegalIntellectualProperty extends LegalSectionAssessment {
    ipOwnership: string;
    ipProtection: string;
    ipAgreements: string;
}

export interface LegalLitigationAndDisputes extends LegalSectionAssessment {
    existingLitigation: string;
    potentialDisputes: string;
}

export interface LegalRegulatoryFilings extends LegalSectionAssessment {
    statutoryFilings: string;
    regulatoryApprovals: string;
}

export interface LegalDetailedFinding {
    area: string;
    document?: string;
    finding: string;
    riskLevel: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
    recommendation: string;
    timeline?: 'Immediate' | 'Short-Term' | 'Medium-Term' | 'Long-Term';
    impact: string;
    responsibleParty?: string;
    currentStatus?: 'Open' | 'In Progress' | 'Resolved' | 'Mitigated';
}

export interface LegalRecommendation {
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    action?: string;
    timeline: 'Immediate' | 'Short-Term' | 'Medium-Term' | 'Long-Term' | 'Ongoing' | string;
    responsibility?: string;
    cost?: string;
    rationale?: string;
    expectedOutcome?: string;
    // For backend compatibility
    area?: string;
    recommendation?: string;
    responsibleParty?: string;
}

export interface LegalReportMetadata {
    documentsReviewed: number;
    complianceAreasChecked: number;
    totalFindings: number;
    criticalIssuesCount: number;
    highPriorityIssuesCount: number;
    mediumPriorityIssuesCount: number;
    lowPriorityIssuesCount: number;
    reportVersion?: string;
    assessmentDate?: string;
    assessorName?: string;
}

export interface LegalAnalysis {
    introduction?: string; // Retained for overall introduction
    items?: LegalReportItem[]; // This structure matches the user's request

    // Overall assessments (inspired by Financial DD)
    totalCompanyScore?: {
        score: number;
        rating: string; // e.g., 'High Risk', 'Moderate Risk', 'Low Risk'
        description: string;
    };

    // Investment decision section (inspired by Financial DD)
    investmentDecision?: {
        recommendation: string; // e.g., 'Proceed with Caution', 'Further Investigation Required'
        successProbability?: number; // Optional, if applicable to legal context
        justification: string;
        keyConsiderations: string[];
        suggestedTerms?: string[]; // e.g., specific clauses, indemnities
    };

    // Enhanced executive summary (inspired by Financial DD)
    executiveSummary: LegalExecutiveSummary; // MODIFIED: Use LegalExecutiveSummary and make required

    complianceAssessment?: LegalCompliance;
    riskScore?: LegalRiskScore;
    missingDocuments: LegalMissingDocuments; // MODIFIED: Use LegalMissingDocuments

    corporateStructureAnalysis?: {
        incorporationDetails: string;
        shareCapitalStructure: string;
        boardAndManagementStructure: string;
        findings: string[];
        riskLevel: string;
    };

    regulatoryComplianceAnalysis?: {
        corporateLawCompliance: string;
        sectoralRegulations: string;
        taxAndFinancialCompliance: string;
        findings: string[];
        riskLevel: string;
    };

    materialAgreementsAnalysis?: {
        investmentAgreements: string;
        commercialAgreements: string;
        employmentAndHRAgreements: string;
        findings: string[];
        riskLevel: string;
    };

    intellectualPropertyAnalysis?: {
        ipOwnershipAndProtection: string;
        ipAgreements: string;
        findings: string[];
        riskLevel: string;
    };

    litigationAndDisputesAnalysis?: {
        existingLitigation: string;
        potentialDisputes: string;
        findings: string[];
        riskLevel: string;
    };

    regulatoryFilingsStatus?: {
        statutoryFilings: string;
        regulatoryApprovals: string;
        findings: string[];
        riskLevel: string;
    };

    overallLegalRiskAssessment?: {
        criticalIssues: string[];
        highPriorityIssues: string[];
        mediumPriorityIssues: string[];
        lowPriorityIssues: string[];
    };

    recommendations?: Array<{
        priority: string;
        action: string;
        timeline: string;
        responsibility: string;
        cost?: string;
        rationale?: string;
        expectedOutcome?: string;
    }>;

    reportMetadata?: LegalReportMetadata;

    corporateStructure?: LegalCorporateStructure;
    regulatoryCompliance?: LegalRegulatoryCompliance;
    materialAgreements?: LegalMaterialAgreements;
    intellectualProperty?: LegalIntellectualProperty;
    litigationAndDisputes?: LegalLitigationAndDisputes;
    regulatoryFilings?: LegalRegulatoryFilings;
    detailedFindings?: LegalDetailedFinding[];

    methodology?: string;
    scopeAndLimitations?: string;
    disclaimer?: string;
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
    legalAnalysis: LegalAnalysis; // Ensure this uses the updated LegalAnalysis
    reportCalculated: boolean;
    processingNotes?: string;
    availableDocuments: Array<{
        documentId: string;
        documentName: string;
        documentType: string;
        uploadDate: Date;
    }>;
    missingDocumentTypes: string[];

    // Report metadata and top-level fields (inspired by Financial DD)
    companyName?: string;
    reportDate?: string;
    generatedBy?: string;
    reportTitle?: string; // e.g., "Legal Due Diligence Report for [CompanyName]"
    clientName?: string; // Who the report is for

    // Explicit introduction at the report level, if different from legalAnalysis.introduction
    introduction?: string;
    disclaimer?: string;

    // Core structured content - expose at top level for easier access
    items?: LegalReportItem[]; // This will be the primary display array for the new format
    executiveSummary?: LegalAnalysis['executiveSummary'];
    totalCompanyScore?: LegalAnalysis['totalCompanyScore'];
    investmentDecision?: LegalAnalysis['investmentDecision'];
    detailedFindings?: LegalDetailedFinding[];
    recommendations?: LegalRecommendation[];

    riskScore?: LegalRiskScore;
    missingDocuments?: {
        documentList: LegalDocumentItem[];
        note: string;
        overallImpact?: string; // New: Summarize impact of missing docs
        priority?: 'High' | 'Medium' | 'Low'; // New: Overall priority for addressing missing docs
    };
    corporateStructureAnalysis?: LegalCorporateStructure;
    regulatoryComplianceAnalysis?: LegalRegulatoryCompliance;
    materialAgreementsAnalysis?: LegalMaterialAgreements;
    intellectualPropertyAnalysis?: LegalIntellectualProperty;
    litigationAndDisputesAnalysis?: LegalLitigationAndDisputes;
    regulatoryFilingsStatus?: LegalRegulatoryFilings;

    reportMetadata?: LegalReportMetadata;

    compatibilityAnalysis?: any;
    forwardLookingAnalysis?: any;
    scoringBreakdown?: any;

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

    useEffect(() => {
        if (entityId && entityType) {
            checkDocumentsAvailability();
        }
    }, [entityId, entityType]);

    useEffect(() => {
        if (documentsAvailable && entityId && entityType) {
            fetchExistingReport();
        }
    }, [documentsAvailable, entityId, entityType]);

    const checkDocumentsAvailability = async () => {
        setCheckingDocuments(true);
        setError(null);

        try {
            const response = await api.get(`/legal-due-diligence/new/entity/${entityId}/check-documents`, {
                params: { entityType }
            });

            if (response.data.success) {
                setDocumentsAvailable(response.data.documentsAvailable); setAvailableDocuments(response.data.availableDocuments);
                setMissingDocumentTypes(response.data.missingDocumentTypes);
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
    };

    const generateReport = async (isAutomatic = false) => {
        if (!entityId || !entityType) {
            if (!isAutomatic) toast.error('Entity information is missing');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log(`Generating legal report for entityId: ${entityId}, entityType: ${entityType}`);
            const response = await api.post(`/legal-due-diligence/new/entity/${entityId}/analyze`, {
                entityType
            });

            if (response.data.success && response.data.data) {
                if (response.data.data.processingStatus === 'pending') {
                    console.warn('Report was generated but processing is pending');
                    setError({
                        message: 'The legal due diligence report is being processed.',
                        suggestedAction: 'This may take a few moments. Please check back shortly.',
                        type: 'PROCESSING_PENDING'
                    });
                    if (!isAutomatic) toast.warning('Report is being processed. This may take a few moments.');
                } else {
                    await fetchExistingReport();
                    if (!isAutomatic) toast.success('Legal due diligence report generated successfully!');
                }
            } else {
                throw new Error(response.data.message || 'Failed to generate report');
            }
        } catch (error: any) {
            console.error('Error generating legal due diligence report:', error);

            if (error.response?.data?.message &&
                error.response.data.message.includes('already exists')) {
                console.log('Report already exists, fetching existing report');

                if (error.response.data.data?.reportId) {
                    try {
                        const existingReportResponse = await api.get(`/legal-due-diligence/new/reports/${error.response.data.data.reportId}`);
                        if (existingReportResponse.data.success && existingReportResponse.data.data) {
                            setReport(existingReportResponse.data.data);
                            if (!isAutomatic) toast.success('Loaded existing legal due diligence report');
                            return;
                        }
                    } catch (fetchError) {
                        console.error('Error fetching existing report by ID:', fetchError);
                    }
                }

                await fetchExistingReport();
                if (!isAutomatic) toast.success('Loaded existing legal due diligence report');
                return;
            }

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

        setLoading(true);
        setError(null);

        try {
            console.log(`Fetching existing legal DD report for entityId: ${entityId}, entityType: ${entityType}`);

            const response = await api.get(`/legal-due-diligence/new/entity/${entityId}/reports`, {
                params: { entityType }
            });

            if (response.data.success && response.data.data && response.data.data.length > 0) {
                const latestReport = response.data.data[0];
                console.log('Found existing legal DD report:', latestReport);                // Transform the backend response to match the frontend expectations
                const analysisResult = latestReport.analysisResult || {};

                const transformedReport = {
                    ...latestReport,                    // Map the backend structure to frontend expectations
                    legalAnalysis: {
                        ...analysisResult,
                        // Ensure the items array is available at the analysis level
                        items: analysisResult.items,
                        executiveSummary: analysisResult.executiveSummary,
                        totalCompanyScore: analysisResult.totalCompanyScore,
                        investmentDecision: analysisResult.investmentDecision,
                        detailedFindings: analysisResult.detailedFindings,
                        recommendations: analysisResult.recommendations,
                        missingDocuments: analysisResult.missingDocuments,
                        reportMetadata: analysisResult.reportMetadata
                    },
                    // Also expose top-level properties for direct access
                    items: analysisResult.items,
                    executiveSummary: analysisResult.executiveSummary,
                    totalCompanyScore: analysisResult.totalCompanyScore,
                    investmentDecision: analysisResult.investmentDecision,
                    detailedFindings: analysisResult.detailedFindings,
                    recommendations: analysisResult.recommendations,
                    missingDocuments: analysisResult.missingDocuments, availableDocuments: latestReport.availableDocuments,
                    missingDocumentTypes: latestReport.missingDocumentTypes,
                    entityProfile: latestReport.entityProfile, entityType: latestReport.entityType,
                    createdAt: latestReport.createdAt,
                    updatedAt: latestReport.updatedAt,
                    expiresAt: latestReport.expiresAt
                }; console.log('Transformed report:', transformedReport);
                console.log('Transformed report legalAnalysis:', transformedReport.legalAnalysis);
                console.log('Backend analysisResult:', analysisResult);
                console.log('Executive Summary:', analysisResult.executiveSummary);
                console.log('Items:', analysisResult.items);
                console.log('Total Company Score:', analysisResult.totalCompanyScore);
                console.log('Investment Decision:', analysisResult.investmentDecision);
                console.log('Recommendations from backend:', analysisResult.recommendations);
                console.log('Recommendations count:', analysisResult.recommendations?.length || 0);
                console.log('Detailed Findings:', analysisResult.detailedFindings);
                console.log('Recommendations:', analysisResult.recommendations);
                console.log('Missing Documents:', analysisResult.missingDocuments);
                setReport(transformedReport);
            } else {
                console.log('No existing legal DD report found, attempting to generate automatically');
                await generateReport(true);
            }
        } catch (error: any) {
            console.error('Error fetching existing report:', error);

            if (error.response?.status === 404 ||
                (error.response?.data?.message && error.response.data.message.includes('not found'))) {
                console.log('Report not found (404), attempting to generate automatically');
                await generateReport(true);
            } else {
                setError({
                    message: error.response?.data?.message || 'Failed to fetch existing report',
                    type: 'API_ERROR',
                    errorCode: error.response?.data?.errorCode,
                    details: error.response?.data
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        if (!reportRef.current || !report) {
            toast.error('Report not available for export');
            return;
        }

        try {
            toast.loading('Preparing PDF export...');

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

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

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
    };

    const handleShareReport = async () => {
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
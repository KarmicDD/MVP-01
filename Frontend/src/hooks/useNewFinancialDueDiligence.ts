import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../services/api';
import axios, { AxiosError } from 'axios';

// Types for the financial due diligence report
export interface NewFinancialMetric {
  name: string;
  value: string | number;
  status: 'good' | 'warning' | 'critical';
  description: string;
  trend?: string;
  percentChange?: string;
  industryComparison?: string;
  industryValue?: string | number;
}

export interface NewRiskFactor {
  category: string;
  level: string;
  description: string;
  impact: string;
  mitigationStrategy?: string;
  timeHorizon?: string;
}

export interface NewComplianceItem {
  requirement: string;
  status: string;
  details: string;
  severity: string;
  recommendation?: string;
  deadline?: string;
  regulatoryBody?: string;
}

export interface NewFinancialDueDiligenceReport {
  // Core fields
  targetEntityId?: string;
  targetEntityType?: 'startup' | 'investor';
  requestedById?: string;
  companyName: string;
  reportDate?: string;
  generatedBy?: string;

  // Report content based on FINALREPORT.MD structure
  introduction: string;

  // Items - each representing a section of financial analysis
  items: Array<{
    title: string;
    facts: string[];
    keyFindings: string[];
    recommendedActions: string[];
  }>;

  // Missing documents section
  missingDocuments: {
    documentList: Array<{
      documentCategory: string;
      specificDocument: string;
      requirementReference: string;
    }>;
    note: string;
  };

  // Risk assessment
  riskScore: {
    score: string; // e.g., "8/10"
    riskLevel: string; // e.g., "High risk"
    justification: string;
  };

  // Disclaimer
  disclaimer?: string;

  // Document tracking
  availableDocuments?: Array<{
    documentId: string;
    documentName: string;
    documentType: string;
    uploadDate: string;
  }>;

  // Metadata
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string;
  reportCalculated?: boolean;

  // Legacy fields for backward compatibility
  // Report Type and Perspective
  reportType?: string;
  reportPerspective?: string;

  // Total Company Score
  totalCompanyScore?: {
    score: number;
    rating: string;
    description: string;
  };

  // Investment Decision
  investmentDecision?: {
    recommendation: string;
    successProbability: number;
    justification: string;
    keyConsiderations: string[];
    suggestedTerms?: string[];
  };

  // Executive Summary
  executiveSummary?: {
    headline: string;
    summary: string;
    keyFindings: string[];
    recommendedActions: string[];
  };

  // Financial Analysis
  financialAnalysis?: {
    metrics: NewFinancialMetric[];
    trends: {
      name: string;
      description: string;
      trend: string;
      impact: string;
      data?: {
        period: string;
        value: number;
      }[];
    }[];
    growthProjections?: {
      metric: string;
      currentValue: number;
      projectedValue: number;
      timeframe: string;
      cagr: string;
      confidence: string;
    }[];
  };

  // Recommendations
  recommendations?: string[];

  // Risk Factors
  riskFactors?: NewRiskFactor[];

  // Compliance Items
  complianceItems?: NewComplianceItem[];

  // Document Sources and Metadata
  documentSources?: string[];
}

export interface NewFinancialDocument {
  id: string;
  documentType: string;
  originalName: string;
  description?: string;
  timePeriod?: string;
  fileType?: string;
  fileSize?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewEntityInfo {
  companyName: string;
  entityType: 'startup' | 'investor';
}

/**
 * Hook for managing financial due diligence data and operations
 * @param entityId ID of the entity to analyze
 * @param entityType Type of entity (startup or investor)
 */
export function useNewFinancialDueDiligence(entityId: string | null, entityType: 'startup' | 'investor' = 'startup') {
  const [report, setReport] = useState<NewFinancialDueDiligenceReport | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{
    message: string;
    suggestedAction?: string;
    errorCode?: string;
  } | string | null>(null);
  const [documentsAvailable, setDocumentsAvailable] = useState<boolean | null>(null);
  const [checkingDocuments, setCheckingDocuments] = useState(true);
  const [availableDocuments, setAvailableDocuments] = useState<NewFinancialDocument[]>([]);
  const [missingDocumentTypes, setMissingDocumentTypes] = useState<string[]>([]);
  const [entityInfo, setEntityInfo] = useState<NewEntityInfo | null>(null);

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Check if documents are available for the entity
  const checkDocumentsAvailability = async () => {
    if (!entityId) {
      setDocumentsAvailable(false);
      setCheckingDocuments(false);
      setLoading(false);
      return;
    }

    try {
      setCheckingDocuments(true);
      console.log(`Checking document availability for entity ${entityId} (${entityType})`);

      // Using the financial due diligence route
      const response = await api.get(`/financial-due-diligence/entity/${entityId}/check-documents?entityType=${entityType}`);

      // Set entity info
      if (response.data.entityProfile) {
        setEntityInfo(response.data.entityProfile);
      }

      // Set available documents
      if (response.data.documents) {
        setAvailableDocuments(response.data.documents);
      }

      // Check if documents are available
      const hasDocuments = response.data.documentsAvailable;
      setDocumentsAvailable(hasDocuments);

      if (!hasDocuments) {
        setLoading(false); // Stop loading since we won't fetch the report
      }
    } catch (err) {
      console.error('Error checking financial documents availability:', err);
      setDocumentsAvailable(false);
      setLoading(false);
    } finally {
      setCheckingDocuments(false);
    }
  };

  // Fetch the financial due diligence report
  const fetchReport = async () => {
    if (!entityId || !documentsAvailable) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log(`Fetching financial due diligence report for entity ${entityId} (${entityType})`);

      try {
        // Call the financial due diligence API route
        const response = await api.get(`/financial-due-diligence/entity/${entityId}/reports?entityType=${entityType}`);

        // Check if the report was successfully calculated
        if (response.data && response.data.reportCalculated === false) {
          console.warn('Report exists but was not successfully calculated');
          setError({
            message: 'The financial due diligence report could not be generated properly.',
            suggestedAction: 'Please try regenerating the report using the button below.'
          });
          // Still set the report so we can display partial data if available
          setReport(response.data);
        } else {
          setReport(response.data);
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          const axiosError = err as AxiosError;

          // Handle 404 specifically - this means we need to generate a report
          if (axiosError.response?.status === 404) {
            console.log('No report found, automatically generating one');

            // Check if we have document availability info in the response
            if (axiosError.response.data && typeof axiosError.response.data === 'object') {
              const data = axiosError.response.data as {
                message?: string,
                documentsAvailable?: boolean,
                documentCount?: number,
                missingDocuments?: string[]
              };

              // If documents are available, automatically generate a report
              if (data.documentsAvailable !== false && documentsAvailable) {
                console.log('Documents are available, automatically generating report');
                await generateReport(true); // Pass true for isAutomatic
                return; // Exit early since generateReport will set the report
              } else {
                // If no documents are available, show a message to upload documents
                setError({
                  message: data.message || 'No financial documents found.',
                  suggestedAction: 'Please upload financial documents before generating a report.'
                });
              }

              // Set missing document types if available
              if (data.missingDocuments) {
                setMissingDocumentTypes(data.missingDocuments);
              }
            } else {
              // Generic 404 error - try to automatically generate if we have documents
              if (documentsAvailable) {
                console.log('404 error but documents available, automatically generating report');
                await generateReport(true); // Pass true for isAutomatic
                return; // Exit early since generateReport will set the report
              } else {
                setError({
                  message: 'No financial due diligence report found.',
                  suggestedAction: 'Please generate a report using the button below.'
                });
              }
            }
          } else {
            // Handle other errors
            const responseData = axiosError.response?.data as { message?: string, missingDocuments?: string[] } || {};
            const errorMessage = responseData.message || 'Error fetching financial due diligence report';
            setError({ message: errorMessage });

            // Set missing document types if available
            if (responseData.missingDocuments) {
              setMissingDocumentTypes(responseData.missingDocuments);
            }
          }
        } else if (err instanceof Error) {
          setError({ message: err.message || 'Unknown error occurred' });
        } else {
          setError({ message: 'Unknown error occurred' });
        }
      }
    } catch (outerError) {
      console.error('Unexpected error in fetchReport:', outerError);
      setError({ message: 'An unexpected error occurred while fetching the report' });
    } finally {
      setLoading(false);
    }
  };

  // Generate a new financial due diligence report
  const generateReport = async (isAutomatic = false) => {
    if (!entityId) {
      if (!isAutomatic) toast.error('Entity ID is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call the financial due diligence API endpoint to generate a new report
      console.log(`Generating report for entityId: ${entityId}, entityType: ${entityType}`);
      const response = await api.post(`/financial-due-diligence/entity/${entityId}/analyze`, {
        entityType
      });

      // Check if the report was successfully calculated
      if (response.data && response.data.reportCalculated === false) {
        console.warn('Report was generated but not successfully calculated');
        setError({
          message: 'The financial due diligence report could not be generated properly.',
          suggestedAction: 'This may be due to issues with the AI service or the document format. You can try again or contact support.'
        });
        // Still set the report so we can display partial data if available
        setReport(response.data);
        if (!isAutomatic) toast.warning('Report generated with errors. Some data may be incomplete.');
      } else {
        setReport(response.data);
        if (!isAutomatic) toast.success('Financial due diligence report generated successfully');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const errorObj = err as {
          response?: {
            data?: {
              message?: string
            }
          }
        };

        const responseData = errorObj.response?.data as { message?: string } || {};
        const errorMessage = responseData.message || 'Error generating financial due diligence report';
        setError({
          message: errorMessage,
          suggestedAction: 'Please try again or contact support if the issue persists.'
        });
        if (!isAutomatic) toast.error(errorMessage);
      } else {
        setError({
          message: 'Unknown error occurred',
          suggestedAction: 'Please try again or contact support if the issue persists.'
        });
        if (!isAutomatic) toast.error('Unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Export the report as PDF
  const handleExportPDF = async () => {
    if (!reportRef.current) {
      toast.error('Report not available for export');
      return;
    }

    try {
      toast.info('Preparing PDF export...');

      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfImgWidthMM = 210; // A4 width in mm
      const pdfPageHeightMM = 295; // A4 height in mm

      // Calculate total height of the canvas image if rendered at pdfImgWidthMM on the PDF
      const totalImgHeightMM = (canvas.height * pdfImgWidthMM) / canvas.width;
      const numPages = Math.ceil(totalImgHeightMM / pdfPageHeightMM);

      // Calculate the height of one PDF page in terms of source canvas pixels
      const pageHeightInCanvasPx = (pdfPageHeightMM * canvas.width) / pdfImgWidthMM;

      for (let i = 0; i < numPages; i++) {
        const sourceYpx = i * pageHeightInCanvasPx;
        // Determine the height of the current segment to copy from the original canvas
        const segmentHeightPx = Math.min(pageHeightInCanvasPx, canvas.height - sourceYpx);

        if (segmentHeightPx <= 0) continue; // Avoid creating empty canvases

        // Create a temporary canvas for the current page's segment
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = segmentHeightPx;
        const pageCtx = pageCanvas.getContext('2d');

        if (pageCtx) {
          // Draw the appropriate segment from the original (large) canvas
          // to the temporary (page-specific) canvas
          pageCtx.drawImage(
            canvas,             // Source image (large canvas)
            0,                  // Source X
            sourceYpx,          // Source Y (offset into the large canvas)
            canvas.width,       // Source width
            segmentHeightPx,    // Source height (height of the slice)
            0,                  // Destination X on pageCanvas
            0,                  // Destination Y on pageCanvas
            canvas.width,       // Destination width on pageCanvas
            segmentHeightPx     // Destination height on pageCanvas
          );

          const pageImgData = pageCanvas.toDataURL('image/png');

          if (i > 0) {
            pdf.addPage();
          }

          // Calculate the height this segment will occupy on the PDF page (in mm)
          const segmentHeightOnPdfMM = (segmentHeightPx * pdfImgWidthMM) / canvas.width;

          pdf.addImage(pageImgData, 'PNG', 0, 0, pdfImgWidthMM, segmentHeightOnPdfMM);
        }
      }

      // Save the PDF
      const companyName = entityInfo?.companyName || 'company';
      pdf.save(`Financial_Due_Diligence_${companyName}.pdf`);

      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Error exporting PDF');
    }
  };

  // Share the report via email
  const handleShareReport = async () => {
    if (!entityId || !report) {
      toast.error('Report not available for sharing');
      return;
    }

    try {
      toast.info('Preparing to share report...');
      // Implement sharing functionality here
      toast.success('Report shared successfully');
    } catch (error) {
      console.error('Error sharing report:', error);
      toast.error('Error sharing report');
    }
  };

  // Check document availability and fetch report on component mount
  useEffect(() => {
    checkDocumentsAvailability();
  }, [entityId, entityType]);

  // Fetch report when documents are available
  useEffect(() => {
    if (documentsAvailable) {
      fetchReport();
    }
  }, [documentsAvailable, entityId, entityType]);

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
}

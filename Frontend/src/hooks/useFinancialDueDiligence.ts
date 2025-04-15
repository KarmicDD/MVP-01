import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../services/api';

export interface FinancialMetric {
  name: string;
  value: string | number;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

export interface RiskFactor {
  category: string;
  level: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
}

export interface ComplianceItem {
  requirement: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  details: string;
  severity: 'high' | 'medium' | 'low';
  recommendation?: string;
}

export interface FinancialRatio {
  name: string;
  value: number;
  industry_average?: number;
  description: string;
  status: 'good' | 'warning' | 'critical';
}

export interface StartupInfo {
  companyName: string;
  industry: string;
  stage?: string;
  foundingDate?: string;
  description?: string;
  teamSize?: number;
  location?: string;
  website?: string;
  fundingRound?: string;
  fundingAmount?: string;
  valuation?: string;
}

export interface InvestorInfo {
  name?: string;
  investmentStage?: string;
  investmentSize?: string;
  sectors?: string[] | string;
  location?: string;
  portfolio?: string[] | string;
}

export interface MissingDocuments {
  list: string[];
  impact: string;
  recommendations: string[];
}

export interface FinancialDueDiligenceReport {
  summary: string;
  metrics: FinancialMetric[];
  recommendations: string[];
  riskFactors: RiskFactor[];
  complianceItems?: ComplianceItem[];
  financialStatements?: {
    balanceSheet?: any;
    incomeStatement?: any;
    cashFlow?: any;
  };
  ratioAnalysis?: {
    liquidityRatios: FinancialRatio[];
    profitabilityRatios: FinancialRatio[];
    solvencyRatios: FinancialRatio[];
    efficiencyRatios: FinancialRatio[];
  };
  taxCompliance?: {
    gst: {
      status: 'compliant' | 'partial' | 'non-compliant';
      details: string;
    };
    incomeTax: {
      status: 'compliant' | 'partial' | 'non-compliant';
      details: string;
    };
    tds: {
      status: 'compliant' | 'partial' | 'non-compliant';
      details: string;
    };
  };
  missingDocuments?: MissingDocuments;
  perspective: string;
  generatedDate: string;
  startupInfo?: StartupInfo;
  investorInfo?: InvestorInfo;
  reportType?: 'analysis' | 'audit';
  isOldData?: boolean;
  message?: string;
}

export interface FinancialDocument {
  id: string;
  userId: string;
  documentType: string;
  originalName: string;
  fileSize: number;
  uploadDate: string;
}

export function useFinancialDueDiligence(startupId: string | null, investorId: string | null, reportType: 'analysis' | 'audit' = 'analysis', perspective: 'startup' | 'investor' = 'startup') {
  const [report, setReport] = useState<FinancialDueDiligenceReport | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentsAvailable, setDocumentsAvailable] = useState<boolean | null>(null);
  const [checkingDocuments, setCheckingDocuments] = useState(true);
  const [entityDocuments, setEntityDocuments] = useState<FinancialDocument[]>([]);

  // First check if financial documents are available
  useEffect(() => {
    const checkDocumentsAvailability = async () => {
      try {
        setCheckingDocuments(true);
        console.log('Checking financial documents availability...');

        if (!startupId) {
          setDocumentsAvailable(false);
          setLoading(false);
          setCheckingDocuments(false);
          return;
        }

        // Determine which entity's documents we need to check
        // This will be the startup if perspective is 'startup', or the investor if perspective is 'investor'
        const entityId = perspective === 'startup' ? startupId : investorId;

        // Fetch documents for the entity
        const response = await api.get(`/profile/documents?userId=${entityId}`);

        // Filter for financial documents (any document type starting with 'financial_')
        const financialDocuments = response.data.documents ?
          response.data.documents.filter((doc: any) => doc.documentType.startsWith('financial_')) : [];

        // Store the documents for display
        setEntityDocuments(financialDocuments);

        // Check if documents are available
        const hasDocuments = financialDocuments.length > 0;
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

    checkDocumentsAvailability();
  }, [startupId, investorId, perspective]);

  // Only fetch report if documents are available
  useEffect(() => {
    // Skip if still checking documents or if documents are not available
    if (checkingDocuments || documentsAvailable === null) {
      return;
    }

    // If documents are not available, don't fetch report
    if (!documentsAvailable) {
      console.log('Financial documents not available, skipping report fetch');
      return;
    }

    // If we're here, documents are available, so fetch report if IDs are provided
    const fetchReport = async () => {
      if (!startupId || !investorId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching financial due diligence report for startup ${startupId} and investor ${investorId}`);

        // Call the financial due diligence API with report type and perspective
        const response = await api.get(`/financial/match/${startupId}/${investorId}?reportType=${reportType}&perspective=${perspective}`);
        setReport(response.data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          const errorObj = err as {
            response?: {
              data?: {
                message?: string,
                errorCode?: string,
                startupInfo?: StartupInfo,
                investorInfo?: InvestorInfo,
                missingDocuments?: string[]
              }
            }
          };

          // Handle specific error codes
          if (errorObj.response?.data?.errorCode === 'NO_FINANCIAL_DOCUMENTS') {
            setDocumentsAvailable(false);
            setError('No financial documents available for this startup.');

            // If the API returned startup and investor info, save it for display
            if (errorObj.response?.data?.startupInfo || errorObj.response?.data?.investorInfo) {
              setReport({
                summary: 'No financial documents available for analysis.',
                metrics: [],
                recommendations: [],
                riskFactors: [],
                perspective: 'pending',
                generatedDate: new Date().toISOString(),
                startupInfo: errorObj.response?.data?.startupInfo,
                investorInfo: errorObj.response?.data?.investorInfo,
                reportType: reportType
              });
            }
          } else {
            setError(errorObj.response?.data?.message || err.message || 'Failed to load financial due diligence report');
          }
        } else {
          setError('Failed to load financial due diligence report');
        }
        console.error('Error fetching financial due diligence report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [startupId, investorId, reportType, perspective, documentsAvailable, checkingDocuments]);

  const handleExportPDF = async () => {
    if (!reportRef.current) {
      toast.error('Report content not found');
      return;
    }

    try {
      // Set loading state
      setLoading(true);

      // Capture the report component as an image
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Higher quality
        logging: false,
        useCORS: true
      });

      // Calculate PDF dimensions (A4)
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);

      // Handle multi-page if content is long
      let position = 0;
      let remainingHeight = imgHeight;

      while (remainingHeight > pageHeight) {
        // Add new page
        pdf.addPage();
        // Add image and adjust position
        position -= pageHeight;
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        remainingHeight -= pageHeight;
      }

      // Save PDF file
      pdf.save(`financial-due-diligence-report-${startupId}-${investorId}.pdf`);

      // Show success notification
      toast.success('Report downloaded successfully!');
    } catch (err: unknown) {
      console.error('Error generating PDF:', err);
      if (err instanceof Error) {
        toast.error(`Failed to generate PDF: ${err.message || 'Unknown error'}`);
      } else {
        toast.error('Failed to generate PDF: Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShareReport = async () => {
    if (!startupId || !investorId) return;

    const emailInput = window.prompt('Enter email addresses separated by commas:');
    if (!emailInput) return;

    const emails = emailInput.split(',').map(email => email.trim());

    try {
      await api.post(`/financial/match/${startupId}/${investorId}/share`, { emails });
      toast.success('Report shared successfully!');
    } catch (err: unknown) {
      console.error('Error sharing report:', err);
      if (err instanceof Error) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        toast.error('Failed to share report: ' + (errorObj.response?.data?.message || err.message || 'Unknown error'));
      } else {
        toast.error('Failed to share report: Unknown error');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Function to trigger report generation
  const generateReport = async () => {
    if (!startupId || !investorId) {
      toast.error('Missing startup or investor information');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call the financial due diligence API endpoint to generate a new report
      const response = await api.post(`/financial/match/${startupId}/${investorId}/generate`, {
        reportType: reportType,
        perspective: perspective
      });

      setReport(response.data);
      toast.success('Report generated successfully');
    } catch (err: unknown) {
      console.error('Error generating financial report:', err);
      if (err instanceof Error) {
        const errorObj = err as { response?: { data?: { message?: string } } };
        toast.error('Failed to generate report: ' + (errorObj.response?.data?.message || err.message || 'Unknown error'));
      } else {
        toast.error('Failed to generate report: Unknown error');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    report,
    loading,
    error,
    documentsAvailable,
    checkingDocuments,
    entityDocuments,
    handleExportPDF,
    handleShareReport,
    generateReport,
    formatDate,
    reportRef
  };
}

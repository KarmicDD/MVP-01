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
  perspective: string;
  generatedDate: string;
}

export function useFinancialDueDiligence(startupId: string | null, investorId: string | null) {
  const [report, setReport] = useState<FinancialDueDiligenceReport | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentsAvailable, setDocumentsAvailable] = useState<boolean | null>(null);
  const [checkingDocuments, setCheckingDocuments] = useState(true);

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

        // Check if the startup has uploaded financial documents
        const response = await api.get(`/profile/documents?userId=${startupId}&documentType=financial`);
        const hasDocuments = response.data.documents && response.data.documents.length > 0;
        
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
  }, [startupId]);

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
        
        // Call the financial due diligence API
        const response = await api.get(`/financial/match/${startupId}/${investorId}`);
        setReport(response.data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          const errorObj = err as { response?: { data?: { message?: string, errorCode?: string } } };
          
          // Handle specific error codes
          if (errorObj.response?.data?.errorCode === 'NO_FINANCIAL_DOCUMENTS') {
            setDocumentsAvailable(false);
            setError('No financial documents available for this startup.');
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
  }, [startupId, investorId, documentsAvailable, checkingDocuments]);

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

  return {
    report,
    loading,
    error,
    documentsAvailable,
    checkingDocuments,
    handleExportPDF,
    handleShareReport,
    formatDate,
    reportRef
  };
}

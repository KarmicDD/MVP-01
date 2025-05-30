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
  trend?: 'increasing' | 'decreasing' | 'stable';
  percentChange?: string;
  industryComparison?: 'above_average' | 'average' | 'below_average';
  industryValue?: string | number;
}

export interface RiskFactor {
  category: string;
  level: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  mitigationStrategy?: string;
  timeHorizon?: 'short_term' | 'medium_term' | 'long_term';
}

export interface ComplianceItem {
  requirement: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  details: string;
  severity: 'high' | 'medium' | 'low';
  recommendation?: string;
  deadline?: string;
  regulatoryBody?: string;
}

export interface FinancialRatio {
  name: string;
  value: number;
  industry_average?: number;
  description: string;
  status: 'good' | 'warning' | 'critical';
  trend?: 'improving' | 'stable' | 'deteriorating';
  historicalData?: {
    period: string;
    value: number;
  }[];
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

export interface DocumentAnalysisItem {
  documentType: string;
  quality: 'good' | 'moderate' | 'poor';
  completeness: 'complete' | 'partial' | 'incomplete';
  keyInsights: string[];
  dataReliability?: 'high' | 'medium' | 'low';
  financialHighlights?: string[];
  redFlags?: string[];
  recommendations?: string[];
}

export interface MissingDocuments {
  list: string[];
  impact: string;
  recommendations: string[];
  priorityLevel?: 'high' | 'medium' | 'low';
}

export interface FinancialTrend {
  name: string;
  description: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  impact: 'positive' | 'negative' | 'neutral';
  data?: {
    period: string;
    value: number;
  }[];
}

export interface AuditFinding {
  area: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
  impact?: string;
  timelineToResolve?: string;
}

export interface FinancialDueDiligenceReport {
  // Report Type and Perspective
  reportType?: string;
  reportPerspective?: string;

  // Total Company Score
  totalCompanyScore?: {
    score: number;
    rating: string; // Accept any string value for rating
    description: string;
  };

  // Investment Decision
  investmentDecision?: {
    recommendation: 'Invest' | 'Consider with Conditions' | 'Do Not Invest';
    successProbability: number;
    justification: string;
    keyConsiderations: string[];
    suggestedTerms?: string[];
    chartData?: any;
  };

  // Compatibility Analysis
  compatibilityAnalysis?: {
    overallMatch: 'Strong Match' | 'Moderate Match' | 'Weak Match';
    overallScore: number;
    dimensions: {
      name: string;
      score: number;
      description: string;
      status: 'excellent' | 'good' | 'moderate' | 'poor';
    }[];
    keyInvestmentStrengths: string[];
    keyInvestmentChallenges: string[];
    investmentRecommendations: string[];
    radarChartData?: any;
  };

  // Scoring Breakdown
  scoringBreakdown?: {
    overview: string;
    categories: {
      name: string;
      score: number;
      description: string;
      status: 'excellent' | 'good' | 'moderate' | 'poor';
      keyPoints: string[];
    }[];
    barChartData?: any;
  };

  // Executive Summary Section
  executiveSummary: {
    headline: string;
    summary: string;
    keyFindings: string[];
    recommendedActions: string[];
    keyMetrics: FinancialMetric[];
  };

  // Financial Analysis Section
  financialAnalysis: {
    metrics: FinancialMetric[];
    trends: FinancialTrend[];
    growthProjections?: {
      metric: string;
      currentValue: number;
      projectedValue: number;
      timeframe: string;
      cagr: string;
      confidence: 'high' | 'medium' | 'low';
    }[];
  };

  // Recommendations Section
  recommendations: string[];

  // Risk Assessment Section
  riskFactors: RiskFactor[];

  // Compliance Section
  complianceItems?: ComplianceItem[];

  // Financial Statements Section
  financialStatements?: {
    balanceSheet?: {
      assets?: any;
      liabilities?: any;
      equity?: any;
      yearOverYearChange?: {
        assets?: string;
        liabilities?: string;
        equity?: string;
      };
    };
    incomeStatement?: {
      revenue?: number;
      costOfGoodsSold?: number;
      grossProfit?: number;
      operatingExpenses?: number;
      operatingIncome?: number;
      netIncome?: number;
      yearOverYearChange?: {
        revenue?: string;
        grossProfit?: string;
        netIncome?: string;
      };
    };
    cashFlow?: {
      operatingActivities?: number;
      investingActivities?: number;
      financingActivities?: number;
      netCashFlow?: number;
      yearOverYearChange?: {
        operatingActivities?: string;
        netCashFlow?: string;
      };
    };
  };

  // Ratio Analysis Section
  ratioAnalysis?: {
    liquidityRatios: FinancialRatio[];
    profitabilityRatios: FinancialRatio[];
    solvencyRatios: FinancialRatio[];
    efficiencyRatios: FinancialRatio[];
  };

  // Tax Compliance Section
  taxCompliance?: {
    gst: {
      status: 'compliant' | 'partial' | 'non-compliant';
      details: string;
      filingHistory?: {
        period: string;
        status: 'filed' | 'pending' | 'overdue';
        dueDate: string;
      }[];
      recommendations?: string[];
    };
    incomeTax: {
      status: 'compliant' | 'partial' | 'non-compliant';
      details: string;
      filingHistory?: {
        period: string;
        status: 'filed' | 'pending' | 'overdue';
        dueDate: string;
      }[];
      recommendations?: string[];
    };
    tds: {
      status: 'compliant' | 'partial' | 'non-compliant';
      details: string;
      filingHistory?: {
        period: string;
        status: 'filed' | 'pending' | 'overdue';
        dueDate: string;
      }[];
      recommendations?: string[];
    };
  };

  // Audit Findings Section
  auditFindings?: {
    findings: AuditFinding[];
    overallAssessment: string;
    complianceScore?: string;
    keyStrengths?: string[];
    keyWeaknesses?: string[];
  };

  // Document Analysis
  documentAnalysis?: {
    availableDocuments: DocumentAnalysisItem[];
    missingDocuments: MissingDocuments;
  };

  // Industry Benchmarking
  industryBenchmarking?: {
    overview: string;
    metrics: {
      name: string;
      companyValue: number;
      industryAverage: number;
      percentile?: string;
      status: 'above_average' | 'average' | 'below_average';
    }[];
    competitivePosition: string;
    strengths: string[];
    challenges: string[];
  };

  // Additional Information
  missingDocuments?: MissingDocuments;
  perspective: string;
  generatedDate: string;
  startupInfo?: StartupInfo;
  investorInfo?: InvestorInfo;
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

export function useFinancialDueDiligence(startupId: string | null, investorId: string | null, perspective: 'startup' | 'investor' = 'startup') {
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

        // We need to check the documents of the selected entity (the counterparty), not the logged-in user
        // If perspective is 'startup', we want to analyze the startup's documents (startupId)
        // If perspective is 'investor', we want to analyze the investor's documents (investorId)
        const entityIdToCheck = perspective === 'startup' ? startupId : investorId;

        console.log(`Checking documents for entity ID: ${entityIdToCheck} with perspective: ${perspective}`);        // Fetch documents for the selected entity
        const response = await api.get(`/profile/documents?userId=${entityIdToCheck}`);

        // Include ALL documents for comprehensive financial analysis
        // No filtering based on document type - all documents are valuable for analysis
        const allDocuments = response.data.documents || [];

        // Store the documents for display
        setEntityDocuments(allDocuments);

        // Check if documents are available
        const hasDocuments = allDocuments.length > 0;
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
        console.log(`Fetching financial due diligence report for startup ${startupId} and investor ${investorId} with perspective ${perspective}`);

        // Call the financial due diligence API with perspective
        // The perspective parameter ensures we're analyzing the correct entity's documents
        const response = await api.get(`/financial/match/${startupId}/${investorId}?perspective=${perspective}`);
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

            // Create a more specific error message based on the perspective
            const entityType = perspective === 'startup' ? 'startup' : 'investor';
            setError(`No financial documents available for the selected ${entityType}.`);

            // If the API returned startup and investor info, save it for display
            if (errorObj.response?.data?.startupInfo || errorObj.response?.data?.investorInfo) {
              setReport({
                executiveSummary: {
                  headline: `No Financial Documents Available`,
                  summary: `No financial documents available for the selected ${entityType}.`,
                  keyFindings: [],
                  recommendedActions: [`Upload financial documents for the ${entityType} to enable analysis.`],
                  keyMetrics: []
                },
                financialAnalysis: {
                  metrics: [],
                  trends: []
                },
                recommendations: [],
                riskFactors: [],
                perspective: perspective,
                generatedDate: new Date().toISOString(),
                startupInfo: errorObj.response?.data?.startupInfo,
                investorInfo: errorObj.response?.data?.investorInfo
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
  }, [startupId, investorId, perspective, documentsAvailable, checkingDocuments]);

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
      // Make sure we're using the correct perspective to analyze the selected entity's documents
      console.log(`Generating report for startupId: ${startupId}, investorId: ${investorId}, perspective: ${perspective}`);
      const response = await api.post(`/financial/match/${startupId}/${investorId}/generate`, {
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

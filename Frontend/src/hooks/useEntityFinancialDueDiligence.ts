import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import api from '../services/api';

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'radar';
  labels: string[];
  datasets: {
    label: string;
    data: (number | null)[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    borderDash?: number[];
    fill?: boolean;
  }[];
}

export interface FinancialMetric {
  name: string;
  value: string | number;
  status: 'good' | 'warning' | 'critical';
  description: string;
  trend?: string;
  percentChange?: string;
  industryComparison?: 'above_average' | 'average' | 'below_average' | 'N/A';
  industryValue?: string | number;
  chartData?: ChartData;
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
  value: number | string;
  formula?: string;
  industry_average?: number | string;
  description: string;
  interpretation?: string;
  status: 'good' | 'warning' | 'critical';
  trend?: string;
  historicalData?: {
    period: string;
    value: number | string;
  }[];
  chartData?: ChartData;
}

export interface EntityInfo {
  companyName: string;
  industry?: string;
  stage?: string;
  foundingDate?: string;
  description?: string;
  teamSize?: number;
  location?: string;
  website?: string;
  fundingRound?: string;
  fundingAmount?: string;
  valuation?: string;
  investmentStage?: string;
  investmentSize?: string;
  sectors?: string[] | string;
  portfolio?: string[] | string;
}

export interface DocumentAnalysisItem {
  documentType: string;
  quality: 'good' | 'moderate' | 'poor';
  completeness: 'complete' | 'partial' | 'incomplete';
  keyInsights: string[];
}

export interface MissingDocuments {
  list: string[];
  impact: string;
  recommendations: string[];
}

export interface DocumentContentAnalysis {
  overview: string;
  dueDiligenceFindings: {
    summary: string;
    keyInsights: string[];
    investmentImplications: string[];
    growthIndicators: string[];
    riskFactors: string[];
  };
  auditFindings: {
    summary: string;
    complianceIssues: string[];
    accountingConcerns: string[];
    internalControlWeaknesses: string[];
    fraudRiskIndicators: string[];
  };
  documentSpecificAnalysis: {
    documentType: string;
    contentSummary: string;
    dueDiligenceInsights: string[];
    auditInsights: string[];
    keyFinancialData: string[];
    inconsistencies: string[];
    recommendations: string[];
  }[];
}

export interface FinancialTrend {
  name: string;
  description: string;
  trend: string;
  impact: 'positive' | 'negative' | 'neutral';
  data?: {
    period: string;
    value: number | string;
  }[];
  chartData?: ChartData;
}

export interface AuditFinding {
  area: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
  impact?: string;
  timelineToResolve?: string;
  regulatoryImplications?: string;
  financialImpact?: number | string;
  status?: 'new' | 'recurring' | 'resolved';
}

export interface FinancialDocument {
  documentId: string;
  documentName: string;
  documentType: string;
  uploadDate: string;
}

export interface FinancialDueDiligenceReport {
  // Report Type
  reportType?: string;

  // Executive Summary Section
  executiveSummary: {
    headline: string;
    summary: string;
    keyFindings: string[];
    recommendedActions: string[];
    keyMetrics: FinancialMetric[];
    dueDiligenceSummary?: {
      investmentWorthiness: 'high' | 'medium' | 'low';
      statement: string;
      keyStrengths: string[];
      keyRisks: string[];
    };
    auditOpinion?: {
      type: 'unqualified' | 'qualified' | 'adverse' | 'disclaimer';
      statement: string;
      qualifications?: string[];
    };
  };

  // Financial Analysis Section
  financialAnalysis: {
    overview?: string;
    metrics: FinancialMetric[];
    trends: FinancialTrend[];
    growthProjections?: {
      metric: string;
      currentValue: number | string;
      projectedValue: number | string;
      timeframe: string;
      cagr: string;
      confidence: 'high' | 'medium' | 'low';
      chartData?: ChartData;
    }[];
    financialHealthScore?: {
      score: number;
      rating: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
      description: string;
      components: {
        category: string;
        score: number;
        weight: number;
      }[];
      chartData?: ChartData;
    };
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
      assets: any;
      liabilities: any;
      equity: any;
      yearOverYearChange?: {
        assets: string;
        liabilities: string;
        equity: string;
      };
    };
    incomeStatement?: {
      revenue: number | string;
      costOfGoodsSold: number | string;
      grossProfit: number | string;
      operatingExpenses: number | string;
      operatingIncome: number | string;
      netIncome: number | string;
      yearOverYearChange?: {
        revenue: string;
        grossProfit: string;
        netIncome: string;
      };
    };
    cashFlow?: {
      operatingActivities: number | string;
      investingActivities: number | string;
      financingActivities: number | string;
      netCashFlow: number | string;
      yearOverYearChange?: {
        operatingActivities: string;
        netCashFlow: string;
      };
    };
  };

  // Ratio Analysis Section
  ratioAnalysis?: {
    overview?: string;
    liquidityRatios: FinancialRatio[];
    profitabilityRatios: FinancialRatio[];
    solvencyRatios: FinancialRatio[];
    efficiencyRatios: FinancialRatio[];
    ratioComparisonChart?: ChartData;
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
    auditScope?: string;
    auditMethodology?: string;
    auditStandards?: string[];
    findings: AuditFinding[];
    overallAssessment: string;
    complianceScore?: string;
    keyStrengths?: string[];
    keyWeaknesses?: string[];
    materialWeaknesses?: {
      area: string;
      description: string;
      impact: string;
      remediation: string;
    }[];
    internalControlAssessment?: {
      overview: string;
      controlEnvironment: string;
      riskAssessment: string;
      controlActivities: string;
      informationAndCommunication: string;
      monitoring: string;
      significantDeficiencies?: {
        area: string;
        description: string;
        impact: string;
        recommendation: string;
      }[];
    };
    findingsByCategory?: ChartData;
    findingsBySeverity?: ChartData;
  };

  // Document Analysis Section
  documentAnalysis?: {
    availableDocuments: DocumentAnalysisItem[];
    missingDocuments: MissingDocuments;
  };

  // Document Content Analysis Section
  documentContentAnalysis?: DocumentContentAnalysis;

  // Industry Benchmarking Section
  industryBenchmarking?: {
    overview: string;
    industryContext?: string;
    peerComparison?: string;
    metrics: {
      name: string;
      companyValue: number | string;
      industryAverage: number | string;
      percentile?: string;
      status: 'above_average' | 'average' | 'below_average' | 'N/A';
      interpretation?: string;
      chartData?: ChartData;
    }[];
    competitivePosition: string;
    marketShareAnalysis?: string;
    strengths: string[];
    challenges: string[];
    opportunities?: string[];
    threats?: string[];
    industryOutlook?: string;
    benchmarkingCharts?: {
      financialPerformance?: ChartData;
      operationalEfficiency?: ChartData;
    };
  };

  // Legal and Regulatory Compliance Section
  legalAndRegulatoryCompliance?: {
    overview: string;
    complianceAreas: {
      area: string;
      status: 'compliant' | 'partial' | 'non-compliant';
      description: string;
      risks: string[];
      recommendations: string[];
      deadlines?: string;
    }[];
    pendingLegalMatters?: {
      matter: string;
      status: 'pending' | 'resolved' | 'in_progress';
      potentialImpact: string;
      recommendedAction: string;
    }[];
    complianceChart?: ChartData;
  };

  // Document Information
  availableDocuments: FinancialDocument[];
  missingDocumentTypes: string[];

  // Additional Information
  generatedDate: string;
  entityProfile?: EntityInfo;
  isOldData?: boolean;
  message?: string;
  reportCalculated?: boolean;
}

export function useEntityFinancialDueDiligence(entityId: string | null, entityType: 'startup' | 'investor' = 'startup') {
  const [report, setReport] = useState<FinancialDueDiligenceReport | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any | null>(null);
  const [documentsAvailable, setDocumentsAvailable] = useState<boolean | null>(null);
  const [checkingDocuments, setCheckingDocuments] = useState(true);
  const [availableDocuments, setAvailableDocuments] = useState<FinancialDocument[]>([]);
  const [missingDocumentTypes, setMissingDocumentTypes] = useState<string[]>([]);

  // First check if financial documents are available
  useEffect(() => {
    const checkDocumentsAvailability = async () => {
      try {
        setCheckingDocuments(true);
        console.log('Checking financial documents availability...');

        if (!entityId) {
          setDocumentsAvailable(false);
          setLoading(false);
          setCheckingDocuments(false);
          return;
        }

        console.log(`Checking documents for entity ID: ${entityId} with type: ${entityType}`);

        // Fetch documents for the entity using the new endpoint
        const response = await api.get(`/financial/entity/${entityId}/documents?entityType=${entityType}`);

        const { availableDocuments, missingDocumentTypes } = response.data;

        // Store the documents for display
        setAvailableDocuments(availableDocuments);
        setMissingDocumentTypes(missingDocumentTypes);

        // Check if documents are available
        const hasDocuments = availableDocuments.length > 0;
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
  }, [entityId, entityType]);

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

    // If we're here, documents are available, so fetch report if ID is provided
    const fetchReport = async () => {
      if (!entityId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching financial due diligence report for entity ${entityId} with type ${entityType}`);

        // Call the financial due diligence API with entity type
        const response = await api.get(`/financial/entity/${entityId}?entityType=${entityType}`);
        setReport(response.data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          const errorObj = err as {
            response?: {
              data?: {
                message?: string,
                errorCode?: string,
                error?: string,
                validationDetails?: Record<string, any>,
                suggestedAction?: string,
                timestamp?: string,
                entityProfile?: EntityInfo,
                availableDocuments?: FinancialDocument[],
                missingDocumentTypes?: string[]
              },
              status?: number
            }
          };

          // Handle specific error codes
          if (errorObj.response?.data?.errorCode === 'NO_FINANCIAL_DOCUMENTS') {
            setDocumentsAvailable(false);

            // Create a structured error object
            setError({
              message: `No financial documents available for the selected ${entityType}.`,
              errorCode: 'NO_FINANCIAL_DOCUMENTS',
              suggestedAction: `Upload financial documents for the ${entityType} to enable analysis.`
            });

            // If the API returned entity info, save it for display
            if (errorObj.response?.data?.entityProfile) {
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
                documentAnalysis: {
                  availableDocuments: [],
                  missingDocuments: {
                    list: errorObj.response?.data?.missingDocumentTypes || [],
                    impact: "No financial documents are available for analysis, which prevents a comprehensive financial assessment.",
                    recommendations: ["Upload the required financial documents to enable a complete analysis."]
                  }
                },
                availableDocuments: errorObj.response?.data?.availableDocuments || [],
                missingDocumentTypes: errorObj.response?.data?.missingDocumentTypes || [],
                generatedDate: new Date().toISOString(),
                entityProfile: errorObj.response?.data?.entityProfile
              });
            }
          } else if (errorObj.response?.data?.errorCode === 'VALIDATION_ERROR') {
            // Handle validation errors
            setError({
              message: errorObj.response?.data?.message || 'Validation error in financial report',
              errorCode: 'VALIDATION_ERROR',
              error: errorObj.response?.data?.error,
              validationDetails: errorObj.response?.data?.validationDetails,
              suggestedAction: errorObj.response?.data?.suggestedAction || 'Please try again with valid data',
              timestamp: errorObj.response?.data?.timestamp
            });
          } else if (errorObj.response?.data) {
            // Use the structured error from the API if available
            setError({
              message: errorObj.response.data.message || 'Failed to load financial due diligence report',
              errorCode: errorObj.response.data.errorCode || 'API_ERROR',
              error: errorObj.response.data.error,
              validationDetails: errorObj.response.data.validationDetails,
              suggestedAction: errorObj.response.data.suggestedAction,
              timestamp: errorObj.response.data.timestamp,
              status: errorObj.response.status
            });
          } else {
            // Fallback to a basic error object
            setError({
              message: err.message || 'Failed to load financial due diligence report',
              errorCode: 'CLIENT_ERROR',
              error: err.toString(),
              timestamp: new Date().toISOString()
            });
          }
        } else {
          // Handle non-Error objects
          setError({
            message: 'Failed to load financial due diligence report',
            errorCode: 'UNKNOWN_ERROR',
            error: String(err),
            timestamp: new Date().toISOString()
          });
        }
        console.error('Error fetching financial due diligence report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [entityId, entityType, documentsAvailable, checkingDocuments]);

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
      const imgWidth = 210; // Width in mm (A4)
      const pageHeight = 295; // Height in mm (A4)
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
      pdf.save(`financial-due-diligence-report-${entityId}.pdf`);

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
    if (!entityId) return;

    const emailInput = window.prompt('Enter email addresses separated by commas:');
    if (!emailInput) return;

    const emails = emailInput.split(',').map(email => email.trim());

    try {
      await api.post(`/financial/entity/${entityId}/share?entityType=${entityType}`, { emails });
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
    if (!entityId) {
      toast.error('Missing entity information');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call the financial due diligence API endpoint to generate a new report
      console.log(`Generating report for entityId: ${entityId}, entityType: ${entityType}`);
      const response = await api.post(`/financial/entity/${entityId}/generate`, {
        entityType: entityType
      });

      setReport(response.data);
      toast.success('Report generated successfully');
    } catch (err: unknown) {
      console.error('Error generating financial report:', err);
      if (err instanceof Error) {
        const errorObj = err as {
          response?: {
            data?: {
              message?: string,
              errorCode?: string,
              error?: string,
              validationDetails?: Record<string, any>,
              suggestedAction?: string,
              timestamp?: string
            },
            status?: number
          }
        };

        // Create a structured error object
        if (errorObj.response?.data) {
          setError({
            message: errorObj.response.data.message || 'Failed to generate financial report',
            errorCode: errorObj.response.data.errorCode || 'GENERATION_ERROR',
            error: errorObj.response.data.error,
            validationDetails: errorObj.response.data.validationDetails,
            suggestedAction: errorObj.response.data.suggestedAction || 'Please try again later',
            timestamp: errorObj.response.data.timestamp || new Date().toISOString()
          });
        } else {
          setError({
            message: err.message || 'Failed to generate financial report',
            errorCode: 'CLIENT_ERROR',
            error: err.toString(),
            timestamp: new Date().toISOString()
          });
        }

        // Show toast notification
        toast.error('Failed to generate report: ' + (errorObj.response?.data?.message || err.message || 'Unknown error'));
      } else {
        // Handle non-Error objects
        setError({
          message: 'Failed to generate financial report',
          errorCode: 'UNKNOWN_ERROR',
          error: String(err),
          timestamp: new Date().toISOString()
        });
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
    availableDocuments,
    missingDocumentTypes,
    handleExportPDF,
    handleShareReport,
    generateReport,
    formatDate,
    reportRef
  };
}

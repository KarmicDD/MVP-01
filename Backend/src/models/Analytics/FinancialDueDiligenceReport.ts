import mongoose, { Schema, Document } from 'mongoose';

export interface IFinancialMetric {
  name: string;
  value: string | number;
  status: string; // Accept any string value for status
  description: string;
  trend?: string; // Accept any string value for trend
  percentChange?: string;
  industryComparison?: string; // Accept any string value for industry comparison
  industryValue?: string | number;
}

export interface IRiskFactor {
  category: string;
  level: string; // Accept any string value for level
  severity?: string; // Accept any string value for severity
  description: string;
  impact: string;
  mitigation?: string; // Added for backward compatibility
  mitigationStrategy?: string;
  timeHorizon?: string; // Accept any string value for timeHorizon
}

export interface IComplianceItem {
  requirement: string;
  status: string; // Accept any string value for status
  details: string;
  severity: string; // Accept any string value for severity
  recommendation?: string;
  deadline?: string;
  regulatoryBody?: string;
}

export interface IFinancialRatio {
  name: string;
  value: number | string; // Allow for both numbers and strings like "N/A"
  industry_average?: number | string; // Allow for both numbers and strings like "N/A"
  description: string;
  status: string; // Accept any string value for status
  trend?: string; // Accept any string value for trend
  historicalData?: {
    period: string;
    value: number | string; // Allow for both numbers and strings like "N/A"
  }[];
}

export interface IFinancialDueDiligenceReport extends Document {
  // Core fields
  targetEntityId: string; // The entity being analyzed (startup or investor)
  targetEntityType: 'startup' | 'investor'; // Type of entity being analyzed
  requestedById: string; // User who requested the report
  companyName: string;
  reportDate: Date;
  generatedBy: string;

  // Legacy fields for backward compatibility
  perspective?: 'startup' | 'investor'; // For backward compatibility with match-based reports

  // Document tracking
  availableDocuments: {
    documentId: string;
    documentName: string;
    documentType: string;
    uploadDate: Date;
  }[];
  missingDocumentTypes: string[];

  // Executive Summary Section
  executiveSummary: {
    headline: string;
    summary: string;
    keyFindings: string[];
    recommendedActions: string[];
    keyMetrics: IFinancialMetric[];
  };

  // Financial Analysis Section
  financialAnalysis: {
    metrics: IFinancialMetric[];
    trends: {
      name: string;
      description: string;
      trend: string; // Accept any string value for trend
      impact: 'positive' | 'negative' | 'neutral' | 'warning';
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
      confidence: 'high' | 'medium' | 'low';
    }[];
  };

  // Recommendations Section
  recommendations: string[];

  // Risk Assessment Section
  riskFactors: IRiskFactor[];

  // Compliance Section
  complianceItems: IComplianceItem[];

  // Financial Statements Section
  financialStatements: {
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
      revenue?: number | string; // Allow for both numbers and strings like "N/A"
      costOfGoodsSold?: number | string; // Allow for both numbers and strings like "N/A"
      grossProfit?: number | string; // Allow for both numbers and strings like "N/A"
      operatingExpenses?: number | string; // Allow for both numbers and strings like "N/A"
      operatingIncome?: number | string; // Allow for both numbers and strings like "N/A"
      netIncome?: number | string; // Allow for both numbers and strings like "N/A"
      yearOverYearChange?: {
        revenue?: string;
        grossProfit?: string;
        netIncome?: string;
      };
    };
    cashFlow?: {
      operatingActivities?: number | string; // Allow for both numbers and strings like "N/A"
      investingActivities?: number | string; // Allow for both numbers and strings like "N/A"
      financingActivities?: number | string; // Allow for both numbers and strings like "N/A"
      netCashFlow?: number | string; // Allow for both numbers and strings like "N/A"
      yearOverYearChange?: {
        operatingActivities?: string;
        netCashFlow?: string;
      };
    };
  };

  // Ratio Analysis Section
  ratioAnalysis: {
    liquidityRatios: IFinancialRatio[];
    profitabilityRatios: IFinancialRatio[];
    solvencyRatios: IFinancialRatio[];
    efficiencyRatios: IFinancialRatio[];
  };

  // Tax Compliance Section
  taxCompliance: {
    gst: {
      status: string; // Accept any string value for status
      details: string;
      filingHistory?: {
        period: string;
        status: string; // Accept any string value for status
        dueDate: string;
      }[];
      recommendations?: string[];
    };
    incomeTax: {
      status: string; // Accept any string value for status
      details: string;
      filingHistory?: {
        period: string;
        status: string; // Accept any string value for status
        dueDate: string;
      }[];
      recommendations?: string[];
    };
    tds: {
      status: string; // Accept any string value for status
      details: string;
      filingHistory?: {
        period: string;
        status: string; // Accept any string value for status
        dueDate: string;
      }[];
      recommendations?: string[];
    };
  };

  // Audit Findings Section
  auditFindings?: {
    findings: {
      area: string;
      severity: string; // Accept any string value for severity
      description: string;
      recommendation: string;
      impact?: string;
      timelineToResolve?: string;
    }[];
    overallAssessment: string;
    complianceScore?: string;
    keyStrengths?: string[];
    keyWeaknesses?: string[];
  };

  // Document Analysis Section
  documentAnalysis?: {
    availableDocuments: {
      documentType: string;
      quality: string; // Accept any string value for quality
      completeness: string; // Accept any string value for completeness
      keyInsights: string[];
      dataReliability?: string;
      financialHighlights?: string[];
      redFlags?: string[];
      recommendations?: string[];
    }[];
    missingDocuments: {
      list: string[];
      impact: string;
      recommendations: string[];
      priorityLevel?: string; // Accept any string value for priorityLevel
    };
  };

  // Document Content Analysis Section - New section for analyzing document content
  documentContentAnalysis?: {
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
  };

  // Industry Benchmarking Section
  industryBenchmarking?: {
    overview: string;
    metrics: {
      name: string;
      companyValue: number | string; // Allow for both numbers and strings like "N/A"
      industryAverage: number | string; // Allow for both numbers and strings like "N/A"
      percentile?: string;
      status: string; // Accept any string value for status
    }[];
    competitivePosition: string;
    strengths: string[];
    challenges: string[];
  };

  // Shareholders Table Section
  shareholdersTable?: {
    overview: string;
    shareholders: {
      name: string;
      equityPercentage: number | string;
      shareCount: number | string;
      faceValue: number | string;
      investmentAmount?: number | string;
      shareClass?: string;
      votingRights?: string;
      notes?: string;
    }[];
    totalShares: number | string;
    totalEquity: number | string;
    analysis: string;
    recommendations: string[];
  };

  // Directors Table Section
  directorsTable?: {
    overview: string;
    directors: {
      name: string;
      position: string;
      appointmentDate?: string;
      din?: string; // Director Identification Number
      shareholding?: number | string;
      expertise?: string;
      otherDirectorships?: string[];
      notes?: string;
    }[];
    analysis: string;
    recommendations: string[];
  };

  // Key Business Agreements Section
  keyBusinessAgreements?: {
    overview: string;
    agreements: {
      agreementType: string;
      parties: string[];
      effectiveDate?: string;
      expiryDate?: string;
      keyTerms: string[];
      financialImpact: string;
      risks: string[];
      notes?: string;
    }[];
    analysis: string;
    recommendations: string[];
  };

  // Leave Policy Section
  leavePolicy?: {
    overview: string;
    policies: {
      type: string;
      daysAllowed: number | string;
      eligibility?: string;
      carryForward?: string;
      encashment?: string;
      notes?: string;
    }[];
    analysis: string;
    recommendations: string[];
  };

  // Provisions & Prepayments Section
  provisionsAndPrepayments?: {
    overview: string;
    items: any; // Accept any type of data without validation
    analysis?: string;
    recommendations: string[];
  };

  // Deferred Tax Assets Section
  deferredTaxAssets?: {
    overview: string;
    items: any; // Accept any type of data without validation
    analysis?: string;
    recommendations?: string[];
  };

  // Document Sources and Metadata
  documentSources: string[];
  missingDocuments?: string[];
  status: string; // Accept any string value for status
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  isOldData?: boolean;
  reportCalculated: boolean;
}

const FinancialMetricSchema = new Schema({
  name: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true },
  status: { type: String, required: true }, // Accept any string value for status
  description: { type: String, required: true },
  trend: { type: String }, // Accept any string value for trend
  percentChange: { type: String },
  industryComparison: { type: String }, // Accept any string value for industry comparison
  industryValue: { type: Schema.Types.Mixed }
});

const RiskFactorSchema = new Schema({
  category: { type: String, required: true },
  level: { type: String, required: true }, // Accept any string value for level
  severity: { type: String }, // Accept any string value for severity
  description: { type: String, required: true },
  impact: { type: String, required: true },
  mitigation: { type: String }, // Added for backward compatibility
  mitigationStrategy: { type: String },
  timeHorizon: { type: String } // Accept any string value for timeHorizon
});

const ComplianceItemSchema = new Schema({
  requirement: { type: String, required: true },
  status: { type: String, required: true }, // Accept any string value for status
  details: { type: String, required: true },
  severity: { type: String, required: true }, // Accept any string value for severity
  recommendation: { type: String },
  deadline: { type: String },
  regulatoryBody: { type: String }
});

const FinancialRatioSchema = new Schema({
  name: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: false }, // Allow for both numbers and strings like "N/A"
  industry_average: { type: Schema.Types.Mixed }, // Allow for both numbers and strings like "N/A"
  description: { type: String, required: true },
  status: { type: String, required: true }, // Accept any string value for status
  trend: { type: String }, // Accept any string value for trend
  historicalData: [{
    period: { type: String },
    value: { type: Schema.Types.Mixed } // Allow for both numbers and strings like "N/A"
  }]
});

// Define schema for trend analysis
const TrendSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  trend: { type: String, required: true }, // Accept any string value for trend
  impact: { type: String, required: true }, // Accept any string value for impact
  data: [{
    period: { type: String },
    value: { type: Schema.Types.Mixed } // Allow for both numbers and strings like "N/A"
  }]
});

// Define schema for growth projections
const GrowthProjectionSchema = new Schema({
  metric: { type: String, required: true },
  currentValue: { type: Schema.Types.Mixed, required: true }, // Allow for both numbers and strings like "N/A"
  projectedValue: { type: Schema.Types.Mixed, required: true }, // Allow for both numbers and strings like "N/A"
  timeframe: { type: String, required: true },
  cagr: { type: String, required: true },
  confidence: { type: String, required: true } // Accept any string value for confidence
});

// Define schema for audit findings
const AuditFindingSchema = new Schema({
  area: { type: String, required: true },
  severity: { type: String, required: true }, // Accept any string value for severity
  description: { type: String, required: true },
  recommendation: { type: String, required: true },
  impact: { type: String },
  timelineToResolve: { type: String }
});

// Define schema for available documents
const AvailableDocumentSchema = new Schema({
  documentId: { type: String, required: true },
  documentName: { type: String, required: true },
  documentType: { type: String, required: true },
  uploadDate: { type: Date, required: true }
});

// Define schema for document analysis
const DocumentAnalysisItemSchema = new Schema({
  documentType: { type: String, required: true },
  quality: { type: String, required: true }, // Accept any string value for quality
  completeness: { type: String, required: true }, // Accept any string value for completeness
  keyInsights: [String],
  dataReliability: { type: String },
  financialHighlights: [String],
  redFlags: [String],
  recommendations: [String]
});

const MissingDocumentsSchema = new Schema({
  list: [String],
  impact: { type: String, required: true },
  recommendations: [String],
  priorityLevel: { type: String } // Accept any string value for priorityLevel
});

// Define schema for document content analysis
const DocumentContentDueDiligenceFindingsSchema = new Schema({
  summary: { type: String, required: true },
  keyInsights: [String],
  investmentImplications: [String],
  growthIndicators: [String],
  riskFactors: [String]
});

const DocumentContentAuditFindingsSchema = new Schema({
  summary: { type: String, required: true },
  complianceIssues: [String],
  accountingConcerns: [String],
  internalControlWeaknesses: [String],
  fraudRiskIndicators: [String]
});

const DocumentSpecificAnalysisSchema = new Schema({
  documentType: { type: String, required: true },
  contentSummary: { type: String, required: true },
  dueDiligenceInsights: [String],
  auditInsights: [String],
  keyFinancialData: [String],
  inconsistencies: [String],
  recommendations: [String]
});

const DocumentContentAnalysisSchema = new Schema({
  overview: { type: String, required: true },
  dueDiligenceFindings: DocumentContentDueDiligenceFindingsSchema,
  auditFindings: DocumentContentAuditFindingsSchema,
  documentSpecificAnalysis: [DocumentSpecificAnalysisSchema]
});

// Define schema for industry benchmarking
const IndustryBenchmarkingMetricSchema = new Schema({
  name: { type: String, required: true },
  companyValue: { type: Schema.Types.Mixed, required: true }, // Allow for both numbers and strings like "N/A"
  industryAverage: { type: Schema.Types.Mixed, required: true }, // Allow for both numbers and strings like "N/A"
  percentile: { type: String },
  status: { type: String, required: true } // Accept any string value for status
});

const IndustryBenchmarkingSchema = new Schema({
  overview: { type: String, required: true },
  metrics: [IndustryBenchmarkingMetricSchema],
  competitivePosition: { type: String, required: true },
  strengths: [String],
  challenges: [String]
});

const FinancialDueDiligenceReportSchema: Schema = new Schema({
  // Core fields
  targetEntityId: { type: String, required: true, index: true },
  targetEntityType: { type: String, required: true }, // Accept any string value for targetEntityType
  requestedById: { type: String, required: true, index: true },
  companyName: { type: String, required: true },
  reportDate: { type: Date, default: Date.now },
  generatedBy: { type: String, required: true },

  // Legacy fields for backward compatibility
  perspective: { type: String }, // Accept any string value for perspective

  // Document tracking
  availableDocuments: [AvailableDocumentSchema],
  missingDocumentTypes: [String],

  // Executive Summary Section
  executiveSummary: {
    headline: { type: String, required: true },
    summary: { type: String, required: true },
    keyFindings: [String],
    recommendedActions: [String],
    keyMetrics: [FinancialMetricSchema]
  },

  // Financial Analysis Section
  financialAnalysis: {
    metrics: [FinancialMetricSchema],
    trends: [TrendSchema],
    growthProjections: [GrowthProjectionSchema]
  },

  // Recommendations Section
  recommendations: [String],

  // Risk Assessment Section
  riskFactors: [RiskFactorSchema],

  // Compliance Section
  complianceItems: [ComplianceItemSchema],

  // Financial Statements Section
  financialStatements: {
    balanceSheet: Schema.Types.Mixed,
    incomeStatement: {
      revenue: { type: Schema.Types.Mixed },
      costOfGoodsSold: { type: Schema.Types.Mixed },
      grossProfit: { type: Schema.Types.Mixed },
      operatingExpenses: { type: Schema.Types.Mixed },
      operatingIncome: { type: Schema.Types.Mixed },
      netIncome: { type: Schema.Types.Mixed },
      yearOverYearChange: Schema.Types.Mixed
    },
    cashFlow: {
      operatingActivities: { type: Schema.Types.Mixed },
      investingActivities: { type: Schema.Types.Mixed },
      financingActivities: { type: Schema.Types.Mixed },
      netCashFlow: { type: Schema.Types.Mixed },
      yearOverYearChange: Schema.Types.Mixed
    }
  },

  // Ratio Analysis Section
  ratioAnalysis: {
    liquidityRatios: [FinancialRatioSchema],
    profitabilityRatios: [FinancialRatioSchema],
    solvencyRatios: [FinancialRatioSchema],
    efficiencyRatios: [FinancialRatioSchema]
  },

  // Tax Compliance Section
  taxCompliance: {
    gst: {
      status: { type: String }, // Accept any string value for status
      details: String
    },
    incomeTax: {
      status: { type: String }, // Accept any string value for status
      details: String
    },
    tds: {
      status: { type: String }, // Accept any string value for status
      details: String
    }
  },

  // Audit Findings Section
  auditFindings: {
    findings: [AuditFindingSchema],
    overallAssessment: String,
    complianceScore: String,
    keyStrengths: [String],
    keyWeaknesses: [String]
  },

  // Document Analysis Section
  documentAnalysis: {
    availableDocuments: [DocumentAnalysisItemSchema],
    missingDocuments: MissingDocumentsSchema
  },

  // Document Content Analysis Section
  documentContentAnalysis: DocumentContentAnalysisSchema,

  // Industry Benchmarking Section
  industryBenchmarking: IndustryBenchmarkingSchema,

  // Shareholders Table Section
  shareholdersTable: {
    overview: String,
    shareholders: [{
      name: String,
      equityPercentage: Schema.Types.Mixed,
      shareCount: Schema.Types.Mixed,
      faceValue: Schema.Types.Mixed,
      investmentAmount: Schema.Types.Mixed,
      shareClass: String,
      votingRights: String,
      notes: String
    }],
    totalShares: Schema.Types.Mixed,
    totalEquity: Schema.Types.Mixed,
    analysis: String,
    recommendations: [String]
  },

  // Directors Table Section
  directorsTable: {
    overview: String,
    directors: [{
      name: String,
      position: String,
      appointmentDate: String,
      din: String,
      shareholding: Schema.Types.Mixed,
      expertise: String,
      otherDirectorships: [String],
      notes: String
    }],
    analysis: String,
    recommendations: [String]
  },

  // Key Business Agreements Section
  keyBusinessAgreements: {
    overview: String,
    agreements: [{
      agreementType: String,
      parties: [String],
      effectiveDate: String,
      expiryDate: String,
      keyTerms: [String],
      financialImpact: String,
      risks: [String],
      notes: String
    }],
    analysis: String,
    recommendations: [String]
  },

  // Leave Policy Section
  leavePolicy: {
    overview: String,
    policies: [{
      type: String,
      daysAllowed: Schema.Types.Mixed,
      eligibility: String,
      carryForward: String,
      encashment: String,
      notes: String
    }],
    analysis: String,
    recommendations: [String]
  },

  // Provisions & Prepayments Section
  provisionsAndPrepayments: {
    overview: String,
    items: Schema.Types.Mixed, // Accept any type of data without validation
    analysis: String,
    recommendations: [String]
  },

  // Deferred Tax Assets Section
  deferredTaxAssets: {
    overview: String,
    items: Schema.Types.Mixed, // Accept any type of data without validation
    analysis: String,
    recommendations: [String]
  },

  // Document Sources and Metadata
  documentSources: [String],
  missingDocuments: [String],
  status: { type: String, default: 'final' }, // Accept any string value for status
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  isOldData: { type: Boolean, default: false },
  reportCalculated: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Create indexes for faster lookups
FinancialDueDiligenceReportSchema.index({ targetEntityId: 1, requestedById: 1 });
FinancialDueDiligenceReportSchema.index({ targetEntityType: 1 });

// Add TTL index to automatically delete expired documents
FinancialDueDiligenceReportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const FinancialDueDiligenceReport = mongoose.model<IFinancialDueDiligenceReport>('FinancialDueDiligenceReport', FinancialDueDiligenceReportSchema);

export default FinancialDueDiligenceReport;

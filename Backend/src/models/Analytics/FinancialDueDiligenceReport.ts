import mongoose, { Schema, Document } from 'mongoose';

export interface IFinancialMetric {
  name: string;
  value: string | number;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

export interface IRiskFactor {
  category: string;
  level: 'high' | 'medium' | 'low';
  severity?: 'high' | 'medium' | 'low'; // Added for backward compatibility
  description: string;
  impact: string;
  mitigation?: string; // Added for backward compatibility
}

export interface IComplianceItem {
  requirement: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  details: string;
  severity: 'high' | 'medium' | 'low';
  recommendation?: string;
}

export interface IFinancialRatio {
  name: string;
  value: number;
  industry_average?: number;
  description: string;
  status: 'good' | 'warning' | 'critical';
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
      trend: 'increasing' | 'decreasing' | 'stable';
      impact: 'positive' | 'negative' | 'neutral';
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
    balanceSheet?: any;
    incomeStatement?: any;
    cashFlow?: any;
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

  // Audit Findings Section
  auditFindings?: {
    findings: {
      area: string;
      severity: 'high' | 'medium' | 'low';
      description: string;
      recommendation: string;
    }[];
    overallAssessment: string;
  };

  // Document Analysis Section
  documentAnalysis?: {
    availableDocuments: {
      documentType: string;
      quality: 'good' | 'moderate' | 'poor';
      completeness: 'complete' | 'partial' | 'incomplete';
      keyInsights: string[];
    }[];
    missingDocuments: {
      list: string[];
      impact: string;
      recommendations: string[];
    };
  };

  // Document Sources and Metadata
  documentSources: string[];
  missingDocuments?: string[];
  status: 'draft' | 'final';
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  isOldData?: boolean;
  reportCalculated: boolean;
}

const FinancialMetricSchema = new Schema({
  name: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true },
  status: { type: String, enum: ['good', 'warning', 'critical'], required: true },
  description: { type: String, required: true }
});

const RiskFactorSchema = new Schema({
  category: { type: String, required: true },
  level: { type: String, enum: ['high', 'medium', 'low'], required: true },
  severity: { type: String, enum: ['high', 'medium', 'low'] }, // Added for backward compatibility
  description: { type: String, required: true },
  impact: { type: String, required: true },
  mitigation: { type: String } // Added for backward compatibility
});

const ComplianceItemSchema = new Schema({
  requirement: { type: String, required: true },
  status: { type: String, enum: ['compliant', 'partial', 'non-compliant'], required: true },
  details: { type: String, required: true },
  severity: { type: String, enum: ['high', 'medium', 'low'], required: true },
  recommendation: { type: String }
});

const FinancialRatioSchema = new Schema({
  name: { type: String, required: true },
  value: { type: Number, required: false }, // Make value optional
  industry_average: { type: Number },
  description: { type: String, required: true },
  status: { type: String, enum: ['good', 'warning', 'critical'], required: true }
});

// Define schema for trend analysis
const TrendSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  trend: { type: String, enum: ['increasing', 'decreasing', 'stable'], required: true },
  impact: { type: String, enum: ['positive', 'negative', 'neutral'], required: true }
});

// Define schema for audit findings
const AuditFindingSchema = new Schema({
  area: { type: String, required: true },
  severity: { type: String, enum: ['high', 'medium', 'low'], required: true },
  description: { type: String, required: true },
  recommendation: { type: String, required: true }
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
  quality: { type: String, enum: ['good', 'moderate', 'poor'], required: true },
  completeness: { type: String, enum: ['complete', 'partial', 'incomplete'], required: true },
  keyInsights: [String]
});

const MissingDocumentsSchema = new Schema({
  list: [String],
  impact: { type: String, required: true },
  recommendations: [String]
});

const FinancialDueDiligenceReportSchema: Schema = new Schema({
  // Core fields
  targetEntityId: { type: String, required: true, index: true },
  targetEntityType: { type: String, enum: ['startup', 'investor'], required: true },
  requestedById: { type: String, required: true, index: true },
  companyName: { type: String, required: true },
  reportDate: { type: Date, default: Date.now },
  generatedBy: { type: String, required: true },

  // Legacy fields for backward compatibility
  perspective: { type: String, enum: ['startup', 'investor'] },

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
    trends: [TrendSchema]
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
    incomeStatement: Schema.Types.Mixed,
    cashFlow: Schema.Types.Mixed
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
      status: { type: String, enum: ['compliant', 'partial', 'non-compliant'] },
      details: String
    },
    incomeTax: {
      status: { type: String, enum: ['compliant', 'partial', 'non-compliant'] },
      details: String
    },
    tds: {
      status: { type: String, enum: ['compliant', 'partial', 'non-compliant'] },
      details: String
    }
  },

  // Audit Findings Section
  auditFindings: {
    findings: [AuditFindingSchema],
    overallAssessment: String
  },

  // Document Analysis Section
  documentAnalysis: {
    availableDocuments: [DocumentAnalysisItemSchema],
    missingDocuments: MissingDocumentsSchema
  },

  // Document Sources and Metadata
  documentSources: [String],
  missingDocuments: [String],
  status: { type: String, enum: ['draft', 'final'], default: 'final' },
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

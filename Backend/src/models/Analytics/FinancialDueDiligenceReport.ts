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
  description: string;
  impact: string;
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
  startupId: string;
  investorId: string;
  perspective: 'startup' | 'investor';
  companyName: string;
  reportType: 'analysis' | 'audit';
  reportDate: Date;
  generatedBy: string;
  summary: string;
  metrics: IFinancialMetric[];
  recommendations: string[];
  riskFactors: IRiskFactor[];
  complianceItems: IComplianceItem[];
  financialStatements: {
    balanceSheet?: any;
    incomeStatement?: any;
    cashFlow?: any;
  };
  ratioAnalysis: {
    liquidityRatios: IFinancialRatio[];
    profitabilityRatios: IFinancialRatio[];
    solvencyRatios: IFinancialRatio[];
    efficiencyRatios: IFinancialRatio[];
  };
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
  documentSources: string[];
  status: 'draft' | 'final';
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
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
  description: { type: String, required: true },
  impact: { type: String, required: true }
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
  value: { type: Number, required: true },
  industry_average: { type: Number },
  description: { type: String, required: true },
  status: { type: String, enum: ['good', 'warning', 'critical'], required: true }
});

const FinancialDueDiligenceReportSchema: Schema = new Schema({
  startupId: { type: String, required: true, index: true },
  investorId: { type: String, required: true, index: true },
  perspective: { type: String, enum: ['startup', 'investor'], required: true },
  companyName: { type: String, required: true },
  reportType: { type: String, enum: ['analysis', 'audit'], required: true },
  reportDate: { type: Date, default: Date.now },
  generatedBy: { type: String, required: true },
  summary: { type: String, required: true },
  metrics: [FinancialMetricSchema],
  recommendations: [String],
  riskFactors: [RiskFactorSchema],
  complianceItems: [ComplianceItemSchema],
  financialStatements: {
    balanceSheet: Schema.Types.Mixed,
    incomeStatement: Schema.Types.Mixed,
    cashFlow: Schema.Types.Mixed
  },
  ratioAnalysis: {
    liquidityRatios: [FinancialRatioSchema],
    profitabilityRatios: [FinancialRatioSchema],
    solvencyRatios: [FinancialRatioSchema],
    efficiencyRatios: [FinancialRatioSchema]
  },
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
  documentSources: [String],
  status: { type: String, enum: ['draft', 'final'], default: 'final' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true }
});

// Create compound index for faster lookups
FinancialDueDiligenceReportSchema.index({ startupId: 1, investorId: 1, perspective: 1 });

// Add TTL index to automatically delete expired documents
FinancialDueDiligenceReportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const FinancialDueDiligenceReport = mongoose.model<IFinancialDueDiligenceReport>('FinancialDueDiligenceReport', FinancialDueDiligenceReportSchema);

export default FinancialDueDiligenceReport;

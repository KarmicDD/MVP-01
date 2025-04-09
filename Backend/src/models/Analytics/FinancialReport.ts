import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IFinancialMetric {
  name: string;
  value: string;
  status: 'good' | 'warning' | 'critical';
  description?: string;
  trend?: 'up' | 'down' | 'stable';
  comparisonValue?: string;
  comparisonLabel?: string;
}

export interface IComplianceItem {
  requirement: string;
  status: 'compliant' | 'non-compliant' | 'partial' | 'not-applicable';
  details: string;
  severity?: 'low' | 'medium' | 'high';
  recommendation?: string;
}

export interface IRiskFactor {
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  impact: string;
  mitigation?: string;
}

export interface IFinancialReport extends MongooseDocument {
  userId: string;
  companyId?: string;
  companyName: string;
  reportType: 'analysis' | 'audit';
  reportDate: Date;
  generatedBy: string;
  summary: string;
  metrics: IFinancialMetric[];
  recommendations: string[];
  riskFactors: IRiskFactor[];
  complianceItems?: IComplianceItem[];
  financialStatements?: {
    balanceSheet?: any;
    incomeStatement?: any;
    cashFlow?: any;
  };
  ratioAnalysis?: {
    liquidityRatios?: any;
    profitabilityRatios?: any;
    solvencyRatios?: any;
    efficiencyRatios?: any;
  };
  taxCompliance?: {
    gst?: any;
    incomeTax?: any;
    tds?: any;
  };
  documentSources: string[];
  status: 'draft' | 'final';
  createdAt: Date;
  updatedAt: Date;
}

const FinancialMetricSchema: Schema = new Schema({
  name: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['good', 'warning', 'critical'],
    required: true
  },
  description: {
    type: String
  },
  trend: {
    type: String,
    enum: ['up', 'down', 'stable']
  },
  comparisonValue: {
    type: String
  },
  comparisonLabel: {
    type: String
  }
});

const ComplianceItemSchema: Schema = new Schema({
  requirement: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['compliant', 'non-compliant', 'partial', 'not-applicable'],
    required: true
  },
  details: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high']
  },
  recommendation: {
    type: String
  }
});

const RiskFactorSchema: Schema = new Schema({
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  impact: {
    type: String,
    required: true
  },
  mitigation: {
    type: String
  }
});

const FinancialReportSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  companyId: {
    type: String,
    index: true
  },
  companyName: {
    type: String,
    required: true
  },
  reportType: {
    type: String,
    enum: ['analysis', 'audit'],
    required: true
  },
  reportDate: {
    type: Date,
    default: Date.now
  },
  generatedBy: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
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
    liquidityRatios: Schema.Types.Mixed,
    profitabilityRatios: Schema.Types.Mixed,
    solvencyRatios: Schema.Types.Mixed,
    efficiencyRatios: Schema.Types.Mixed
  },
  taxCompliance: {
    gst: Schema.Types.Mixed,
    incomeTax: Schema.Types.Mixed,
    tds: Schema.Types.Mixed
  },
  documentSources: [String],
  status: {
    type: String,
    enum: ['draft', 'final'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model<IFinancialReport>('FinancialReport', FinancialReportSchema);

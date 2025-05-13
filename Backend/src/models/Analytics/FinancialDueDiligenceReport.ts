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
    recommendation: string; // Accept any string value for recommendation
    successProbability: number;
    justification: string;
    keyConsiderations: string[];
    suggestedTerms?: string[];
  };

  // Compatibility Analysis
  compatibilityAnalysis?: {
    overallMatch: string; // Accept any string value for overallMatch
    overallScore: number;
    dimensions: {
      name: string;
      score: number;
      description: string;
      status: string; // Accept any string value for status
    }[];
    keyInvestmentStrengths: string[];
    keyInvestmentChallenges: string[];
    investmentRecommendations: string[];
  };

  // Forward-Looking Analysis
  forwardLookingAnalysis?: {
    marketPotential?: {
      tamSize?: string | number;
      growthRate?: string | number;
      adoptionStage?: string;
      targetSegments?: string[]; // Specific market segments with highest potential
      entryStrategy?: string; // Concrete market entry strategy
      competitiveLandscape?: string; // Analysis of competitive landscape
      historicalComparisons?: string[]; // Named examples of similar market developments
      goToMarketRecommendations?: {
        recommendation: string; // Specific recommendation
        implementationSteps: string[]; // Step-by-step implementation guide
        timeline: string; // Expected timeline for implementation
        resourceRequirements: string; // Resources needed
        expectedOutcome: string; // Expected outcome with metrics
      }[];
      metrics?: {
        name: string;
        value: string | number;
        description?: string;
        trend?: string;
        status?: string;
      }[];
    };
    innovationAssessment?: {
      uniquenessScore?: number | string; // Allow for both numbers and strings like "N/A"
      ipStrength?: string;
      competitiveAdvantage?: string;
      keyDifferentiators?: string[]; // Specific differentiators
      protectionStrategies?: string[]; // Concrete IP protection strategies
      innovationGaps?: string[]; // Identified innovation gaps
      rdRoadmap?: {
        priority: string; // High, medium, low
        initiative: string; // Specific R&D initiative
        timeline: string; // Expected timeline
        resourceRequirements: string; // Resources needed
        expectedOutcome: string; // Expected outcome
      }[];
      historicalComparisons?: string[]; // Named examples of similar innovation trajectories
      metrics?: {
        name: string;
        value: string | number;
        description?: string;
        trend?: string;
        status?: string;
      }[];
    };
    teamCapability?: {
      executionScore?: number | string; // Allow for both numbers and strings like "N/A"
      experienceLevel?: string;
      trackRecord?: string;
      founderAchievements?: string[]; // Specific founder achievements
      identifiedSkillGaps?: string[]; // Specific skill gaps in the team
      hiringPriorities?: {
        role: string; // Specific role to hire
        responsibilities: string[]; // Key responsibilities
        impact: string; // Expected impact on business
        timeline: string; // When to hire
      }[];
      organizationalImprovements?: {
        area: string; // Area for improvement
        recommendation: string; // Specific recommendation
        implementationSteps: string[]; // Implementation steps
        expectedOutcome: string; // Expected outcome
      }[];
      historicalComparisons?: string[]; // Named examples of successful team patterns
      metrics?: {
        name: string;
        value: string | number;
        description?: string;
        trend?: string;
        status?: string;
      }[];
    };
    growthTrajectory?: {
      scenarios?: {
        conservative?: number | string; // Allow for both numbers and strings like "N/A"
        moderate?: number | string; // Allow for both numbers and strings like "N/A"
        aggressive?: number | string; // Allow for both numbers and strings like "N/A"
      };
      assumptions?: {
        scenario: string; // 'conservative', 'moderate', or 'aggressive'
        assumptions: string[]; // Detailed assumptions for this scenario
      }[];
      unitEconomics?: {
        currentCac?: number | string; // Allow for both numbers and strings like "N/A"
        projectedCac?: number | string; // Allow for both numbers and strings like "N/A"
        currentLtv?: number | string; // Allow for both numbers and strings like "N/A"
        projectedLtv?: number | string; // Allow for both numbers and strings like "N/A"
      };
      scalingStrategies?: {
        strategy: string; // Specific scaling strategy
        implementationSteps: string[]; // Step-by-step implementation guide
        resourceRequirements: string; // Resources needed
        timeline: string; // Expected timeline
        expectedOutcome: string; // Expected outcome with metrics
      }[];
      growthLevers?: string[]; // Specific growth levers
      optimizationTactics?: string[]; // Specific optimization tactics
      historicalComparisons?: string[]; // Named examples of similar growth patterns
      metrics?: {
        name: string;
        value: string | number;
        description?: string;
        trend?: string;
        status?: string;
      }[];
    };
    dimensions?: {
      name: string;
      score: number | string; // Allow for both numbers and strings like "N/A"
      description: string;
      status: string;
    }[];
    chartData?: any;
  };

  // Analysis Metadata
  analysisMetadata?: {
    enhancedAnalysis: boolean;
    dataSourcesUsed: {
      documents: boolean;
      startupProfile: boolean;
      investorProfile: boolean;
      extendedProfile: boolean;
      questionnaire: boolean;
      tasks: boolean;
      financialReports: boolean;
      historicalMetrics: boolean;
    };
    analysisTimestamp: string;
  };

  // Scoring Breakdown
  scoringBreakdown?: {
    overview: string;
    categories: {
      name: string;
      score: number;
      description: string;
      status: string; // Accept any string value for status
      keyPoints: string[];
    }[];
  };

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

  // Report Type and Perspective
  reportType: { type: String },
  reportPerspective: { type: String },

  // Total Company Score
  totalCompanyScore: {
    score: { type: Number },
    rating: { type: String },
    description: { type: String }
  },

  // Investment Decision
  investmentDecision: {
    recommendation: { type: String },
    successProbability: { type: Number },
    justification: { type: String },
    keyConsiderations: [String],
    suggestedTerms: [String],
    chartData: Schema.Types.Mixed
  },

  // Compatibility Analysis
  compatibilityAnalysis: {
    overallMatch: { type: String },
    overallScore: { type: Number },
    dimensions: [{
      name: { type: String },
      score: { type: Number },
      description: { type: String },
      status: { type: String }
    }],
    keyInvestmentStrengths: [String],
    keyInvestmentChallenges: [String],
    investmentRecommendations: [String],
    radarChartData: Schema.Types.Mixed
  },

  // Forward-Looking Analysis
  forwardLookingAnalysis: {
    marketPotential: {
      tamSize: { type: Schema.Types.Mixed },
      growthRate: { type: Schema.Types.Mixed },
      adoptionStage: { type: String },
      targetSegments: [String], // Specific market segments with highest potential
      entryStrategy: { type: String }, // Concrete market entry strategy
      competitiveLandscape: { type: String }, // Analysis of competitive landscape
      historicalComparisons: [String], // Named examples of similar market developments
      goToMarketRecommendations: [{
        recommendation: { type: String }, // Specific recommendation
        implementationSteps: [String], // Step-by-step implementation guide
        timeline: { type: String }, // Expected timeline for implementation
        resourceRequirements: { type: String }, // Resources needed
        expectedOutcome: { type: String } // Expected outcome with metrics
      }],
      metrics: [{
        name: { type: String },
        value: { type: Schema.Types.Mixed },
        description: { type: String },
        trend: { type: String },
        status: { type: String }
      }]
    },
    innovationAssessment: {
      uniquenessScore: { type: Schema.Types.Mixed }, // Allow for both numbers and strings like "N/A"
      ipStrength: { type: String },
      competitiveAdvantage: { type: String },
      keyDifferentiators: [String], // Specific differentiators
      protectionStrategies: [String], // Concrete IP protection strategies
      innovationGaps: [String], // Identified innovation gaps
      rdRoadmap: [{
        priority: { type: String }, // High, medium, low
        initiative: { type: String }, // Specific R&D initiative
        timeline: { type: String }, // Expected timeline
        resourceRequirements: { type: String }, // Resources needed
        expectedOutcome: { type: String } // Expected outcome
      }],
      historicalComparisons: [String], // Named examples of similar innovation trajectories
      metrics: [{
        name: { type: String },
        value: { type: Schema.Types.Mixed },
        description: { type: String },
        trend: { type: String },
        status: { type: String }
      }]
    },
    teamCapability: {
      executionScore: { type: Schema.Types.Mixed }, // Allow for both numbers and strings like "N/A"
      experienceLevel: { type: String },
      trackRecord: { type: String },
      founderAchievements: [String], // Specific founder achievements
      identifiedSkillGaps: [String], // Specific skill gaps in the team
      hiringPriorities: [{
        role: { type: String }, // Specific role to hire
        responsibilities: [String], // Key responsibilities
        impact: { type: String }, // Expected impact on business
        timeline: { type: String } // When to hire
      }],
      organizationalImprovements: [{
        area: { type: String }, // Area for improvement
        recommendation: { type: String }, // Specific recommendation
        implementationSteps: [String], // Implementation steps
        expectedOutcome: { type: String } // Expected outcome
      }],
      historicalComparisons: [String], // Named examples of successful team patterns
      metrics: [{
        name: { type: String },
        value: { type: Schema.Types.Mixed },
        description: { type: String },
        trend: { type: String },
        status: { type: String }
      }]
    },
    growthTrajectory: {
      scenarios: {
        conservative: { type: Schema.Types.Mixed }, // Allow for both numbers and strings like "N/A"
        moderate: { type: Schema.Types.Mixed }, // Allow for both numbers and strings like "N/A"
        aggressive: { type: Schema.Types.Mixed } // Allow for both numbers and strings like "N/A"
      },
      assumptions: [{
        scenario: { type: String }, // 'conservative', 'moderate', or 'aggressive'
        assumptions: [String] // Detailed assumptions for this scenario
      }],
      unitEconomics: {
        currentCac: { type: Schema.Types.Mixed }, // Allow for both numbers and strings like "N/A"
        projectedCac: { type: Schema.Types.Mixed }, // Allow for both numbers and strings like "N/A"
        currentLtv: { type: Schema.Types.Mixed }, // Allow for both numbers and strings like "N/A"
        projectedLtv: { type: Schema.Types.Mixed } // Allow for both numbers and strings like "N/A"
      },
      scalingStrategies: [{
        strategy: { type: String }, // Specific scaling strategy
        implementationSteps: [String], // Step-by-step implementation guide
        resourceRequirements: { type: String }, // Resources needed
        timeline: { type: String }, // Expected timeline
        expectedOutcome: { type: String } // Expected outcome with metrics
      }],
      growthLevers: [String], // Specific growth levers
      optimizationTactics: [String], // Specific optimization tactics
      historicalComparisons: [String], // Named examples of similar growth patterns
      metrics: [{
        name: { type: String },
        value: { type: Schema.Types.Mixed },
        description: { type: String },
        trend: { type: String },
        status: { type: String }
      }]
    },
    dimensions: [{
      name: { type: String },
      score: { type: Schema.Types.Mixed }, // Allow for both numbers and strings like "N/A"
      description: { type: String },
      status: { type: String }
    }],
    chartData: { type: Schema.Types.Mixed }
  },

  // Analysis Metadata
  analysisMetadata: {
    enhancedAnalysis: { type: Boolean, default: false },
    dataSourcesUsed: {
      documents: { type: Boolean, default: true },
      startupProfile: { type: Boolean, default: false },
      investorProfile: { type: Boolean, default: false },
      extendedProfile: { type: Boolean, default: false },
      questionnaire: { type: Boolean, default: false },
      tasks: { type: Boolean, default: false },
      financialReports: { type: Boolean, default: false },
      historicalMetrics: { type: Boolean, default: false }
    },
    analysisTimestamp: { type: String }
  },

  // Scoring Breakdown
  scoringBreakdown: {
    overview: { type: String },
    categories: [{
      name: { type: String },
      score: { type: Number },
      description: { type: String },
      status: { type: String },
      keyPoints: [String]
    }],
    barChartData: Schema.Types.Mixed
  },

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

import mongoose, { Schema, Document } from 'mongoose';

/**
 * Legal Due Diligence Report Model
 * 
 * This model is for legal due diligence reports following the same pattern
 * as NewFinancialDueDiligenceReport but focused on legal analysis
 * 
 * Reports are cached for 30 days and shared across all users.
 */

export interface ILegalDocumentItem {
    documentCategory: string;
    specificDocument: string;
    requirementReference: string;
}

export interface ILegalReportItem {
    title: string;
    facts: string[];
    keyFindings: string[];
    recommendedActions: string; // Changed from array to string to match other services
}

export interface ILegalMissingDocuments {
    documentList: ILegalDocumentItem[];
    note: string;
}

export interface ILegalExecutiveSummary {
    headline: string;
    summary: string;
    keyFindings: string[];
    recommendedActions: string; // Changed from array to string to match other services
}

export interface ILegalDetailedFinding {
    area: string;
    document: string;
    finding: string;
    riskLevel: string;
    recommendation: string;
    timeline: string;
    impact: string;
}

export interface ILegalRecommendation {
    area: string;
    recommendation: string;
    priority: string;
    timeline: string;
    responsibleParty: string;
    cost?: string;
    rationale?: string;
    expectedOutcome?: string;
}

export interface ILegalReportMetadata {
    documentsReviewed: number;
    complianceAreasChecked: number;
    totalFindings: number;
    criticalIssuesCount: number;
    highPriorityIssuesCount: number;
    mediumPriorityIssuesCount: number;
    lowPriorityIssuesCount: number;
    reportVersion?: string;
    assessmentDate?: string;
    assessorName?: string;
}

export interface ILegalRiskScore {
    score: string;
    riskLevel: 'High' | 'Medium' | 'Low' | 'Critical' | 'Significant' | 'Moderate' | 'Minor' | 'Informational';
    justification: string;
}

export interface ILegalCompliance {
    complianceScore: string;
    details: string;
    status?: 'Compliant' | 'Partially Compliant' | 'Non-Compliant' | 'Not Assessed';
}

export interface ILegalAnalysis {
    introduction?: string;
    executiveSummary?: ILegalExecutiveSummary;
    items?: ILegalReportItem[];
    totalCompanyScore?: {
        score: number;
        rating: string;
        description: string;
    };
    investmentDecision?: {
        recommendation: string;
        successProbability?: number;
        justification: string;
        keyConsiderations: string[];
        suggestedTerms?: string[];
    };
    missingDocuments: ILegalMissingDocuments;
    detailedFindings?: ILegalDetailedFinding[];
    recommendations?: ILegalRecommendation[];
    reportMetadata?: ILegalReportMetadata;
    disclaimer?: string;
    riskScore?: ILegalRiskScore;
    complianceAssessment?: ILegalCompliance;
}

export interface ILegalDueDiligenceReport extends Document {
    entityId: string;
    entityType: 'startup' | 'investor';
    entityProfile: {
        companyName: string;
        industry: string;
        incorporationDate?: string;
        registrationNumber?: string;
        address?: string;
    };
    legalAnalysis: ILegalAnalysis;
    reportCalculated: boolean;
    processingNotes?: string;
    availableDocuments: Array<{
        documentId: string;
        documentName: string;
        documentType: string;
        uploadDate: Date;
    }>;
    missingDocumentTypes: string[];
    reportType?: string;
    reportPerspective?: string;
    disclaimer?: string;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
}

// Define the schema
const LegalDocumentItemSchema = new Schema({
    documentCategory: { type: String, required: true },
    specificDocument: { type: String, required: true },
    requirementReference: { type: String, required: true }
});

const LegalReportItemSchema = new Schema({
    title: { type: String, required: true },
    facts: [{ type: String }],
    keyFindings: [{ type: String }],
    recommendedActions: { type: String } // Changed from array to string
});

const LegalMissingDocumentsSchema = new Schema({
    documentList: [LegalDocumentItemSchema],
    note: { type: String, required: false }
});

const LegalExecutiveSummarySchema = new Schema({
    headline: { type: String, required: false },
    summary: { type: String, required: false },
    keyFindings: [{ type: String }],
    recommendedActions: { type: String } // Changed from array to string
});

const LegalDetailedFindingSchema = new Schema({
    area: { type: String, required: true },
    document: { type: String, required: true },
    finding: { type: String, required: true },
    riskLevel: { type: String, required: true },
    recommendation: { type: String, required: true },
    timeline: { type: String, required: true },
    impact: { type: String, required: true }
});

const LegalRecommendationSchema = new Schema({
    area: { type: String, required: true },
    recommendation: { type: String, required: true },
    priority: { type: String, required: true },
    timeline: { type: String, required: true },
    responsibleParty: { type: String, required: true },
    cost: { type: String, required: false },
    rationale: { type: String, required: false },
    expectedOutcome: { type: String, required: false }
});

const LegalReportMetadataSchema = new Schema({
    documentsReviewed: { type: Number, required: true },
    complianceAreasChecked: { type: Number, required: true },
    totalFindings: { type: Number, required: true },
    criticalIssuesCount: { type: Number, required: true },
    highPriorityIssuesCount: { type: Number, required: true },
    mediumPriorityIssuesCount: { type: Number, required: true },
    lowPriorityIssuesCount: { type: Number, required: true },
    reportVersion: { type: String, required: false },
    assessmentDate: { type: String, required: false },
    assessorName: { type: String, required: false }
}, { _id: false });

const LegalRiskScoreSchema = new Schema({
    score: { type: String, required: true },
    riskLevel: { type: String, required: true },
    justification: { type: String, required: true }
}, { _id: false });

const LegalComplianceSchema = new Schema({
    complianceScore: { type: String, required: true },
    details: { type: String, required: true },
    status: { type: String, enum: ['Compliant', 'Partially Compliant', 'Non-Compliant', 'Not Assessed'], required: false }
}, { _id: false });

const LegalAnalysisSchema = new Schema({
    introduction: { type: String, required: false },
    executiveSummary: LegalExecutiveSummarySchema,
    items: [LegalReportItemSchema],
    totalCompanyScore: {
        score: { type: Number, required: true },
        rating: { type: String, required: true },
        description: { type: String, required: true }
    },
    investmentDecision: {
        recommendation: { type: String, required: true },
        successProbability: { type: Number, required: false },
        justification: { type: String, required: true },
        keyConsiderations: [{ type: String }],
        suggestedTerms: [{ type: String }]
    }, missingDocuments: { type: LegalMissingDocumentsSchema, required: true },
    detailedFindings: [LegalDetailedFindingSchema],
    recommendations: [LegalRecommendationSchema],
    reportMetadata: LegalReportMetadataSchema,
    disclaimer: { type: String, required: false },
    riskScore: LegalRiskScoreSchema,
    complianceAssessment: LegalComplianceSchema
}, { _id: false, minimize: false });

const LegalDueDiligenceReportSchema = new Schema({
    entityId: { type: String, required: true, index: true },
    entityType: { type: String, enum: ['startup', 'investor'], required: true },
    entityProfile: {
        companyName: { type: String, required: true },
        industry: { type: String, required: true },
        incorporationDate: { type: String },
        registrationNumber: { type: String },
        address: { type: String },
    },
    legalAnalysis: { type: LegalAnalysisSchema, required: true },
    reportCalculated: { type: Boolean, default: false },
    processingNotes: { type: String },
    availableDocuments: [{
        _id: false,
        documentId: String,
        documentName: String,
        documentType: String,
        uploadDate: Date,
    }],
    missingDocumentTypes: [String],
    reportType: { type: String },
    reportPerspective: { type: String },
    disclaimer: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, index: { expires: '30d' } }
}, {
    timestamps: true
});

// Add expiration index (TTL) - documents expire after 30 days
LegalDueDiligenceReportSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Compound indexes for efficient querying
LegalDueDiligenceReportSchema.index({ entityId: 1, entityType: 1 });
LegalDueDiligenceReportSchema.index({ entityId: 1, reportCalculated: 1 });

// Pre-save middleware to set expiresAt
LegalDueDiligenceReportSchema.pre<ILegalDueDiligenceReport>('save', function (next) {
    if (!this.expiresAt) {
        const now = new Date();
        this.expiresAt = new Date(now.setDate(now.getDate() + 30));
    }
    if (this.isNew) {
        this.createdAt = new Date();
    }
    this.updatedAt = new Date();
    next();
});

export default mongoose.model<ILegalDueDiligenceReport>('LegalDueDiligenceReport', LegalDueDiligenceReportSchema);

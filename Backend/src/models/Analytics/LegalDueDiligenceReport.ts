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
    recommendedActions: string[];
}

export interface ILegalRiskScore {
    score: string;
    riskLevel: string;
    justification: string;
}

export interface ILegalMissingDocuments {
    list: ILegalDocumentItem[];
    impact: string;
    priorityLevel: 'high' | 'medium' | 'low';
}

export interface ILegalCompliance {
    complianceScore: string;
    details: string;
}

export interface ILegalAnalysis {
    items: ILegalReportItem[];
    complianceAssessment: ILegalCompliance;
    riskScore: ILegalRiskScore;
    missingDocuments: ILegalMissingDocuments;
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
    recommendedActions: [{ type: String }]
});

const LegalRiskScoreSchema = new Schema({
    score: { type: String, required: true },
    riskLevel: { type: String, required: true },
    justification: { type: String, required: true }
});

const LegalMissingDocumentsSchema = new Schema({
    list: [LegalDocumentItemSchema],
    impact: { type: String, required: true },
    priorityLevel: { type: String, enum: ['high', 'medium', 'low'], required: true }
});

const LegalComplianceSchema = new Schema({
    complianceScore: { type: String, required: true },
    details: { type: String, required: true }
});

const LegalAnalysisSchema = new Schema({
    items: [LegalReportItemSchema],
    complianceAssessment: LegalComplianceSchema,
    riskScore: LegalRiskScoreSchema,
    missingDocuments: LegalMissingDocumentsSchema
});

const LegalDueDiligenceReportSchema = new Schema({
    entityId: {
        type: String,
        required: true,
        index: true
    },
    entityType: {
        type: String,
        enum: ['startup', 'investor'],
        required: true,
        index: true
    },
    entityProfile: {
        companyName: { type: String, required: true },
        industry: { type: String },
        incorporationDate: { type: String },
        registrationNumber: { type: String },
        address: { type: String }
    },
    legalAnalysis: LegalAnalysisSchema,
    reportCalculated: {
        type: Boolean,
        required: true,
        default: false,
        index: true
    },
    processingNotes: { type: String },
    availableDocuments: [{
        documentId: { type: String, required: true },
        documentName: { type: String, required: true },
        documentType: { type: String, required: true },
        uploadDate: { type: Date, required: true }
    }],
    missingDocumentTypes: [{ type: String }]
}, {
    timestamps: true
});

// Add expiration index (TTL) - documents expire after 30 days
LegalDueDiligenceReportSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Compound indexes for efficient querying
LegalDueDiligenceReportSchema.index({ entityId: 1, entityType: 1 });
LegalDueDiligenceReportSchema.index({ entityId: 1, reportCalculated: 1 });

// Pre-save middleware to set expiresAt
LegalDueDiligenceReportSchema.pre('save', function (next) {
    if (this.isNew) {
        this.set('expiresAt', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 days from now
    }
    next();
});

export default mongoose.model<ILegalDueDiligenceReport>('LegalDueDiligenceReport', LegalDueDiligenceReportSchema);

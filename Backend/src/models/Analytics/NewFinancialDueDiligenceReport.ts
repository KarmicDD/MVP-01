import mongoose, { Schema, Document } from 'mongoose';

/**
 * New Financial Due Diligence Report Model
 * 
 * This model is specifically for the new financial due diligence reports
 * using the structure from FINALREPORT.MD
 * 
 * Reports are cached for 30 days and shared across all users.
 */

export interface IDocumentItem {
  documentCategory: string;
  specificDocument: string;
  requirementReference: string;
}

export interface IReportItem {
  title: string;
  facts: string[];
  keyFindings: string[];
  recommendedActions: string[];
}

export interface IRiskScore {
  score: string;
  riskLevel: string;
  justification: string;
}

export interface IMissingDocuments {
  documentList: IDocumentItem[];
  note: string;
}

export interface IAvailableDocument {
  documentId: string;
  documentName: string;
  documentType: string;
  uploadDate: Date;
}

export interface INewFinancialDueDiligenceReport extends Document {
  // Core fields
  targetEntityId: string;
  targetEntityType: 'startup' | 'investor';
  requestedById: string;
  companyName: string;
  reportDate: Date;
  generatedBy: string;

  // Report content based on FINALREPORT.MD structure
  introduction: string;
  items: IReportItem[];
  missingDocuments: IMissingDocuments;
  riskScore: IRiskScore;
  disclaimer?: string;

  // Document tracking
  availableDocuments?: IAvailableDocument[];
  documentSources?: string[];

  // Metadata
  status: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  reportCalculated: boolean;
}

// Define schema for document items
const DocumentItemSchema = new Schema({
  documentCategory: { type: String, required: true },
  specificDocument: { type: String, required: true },
  requirementReference: { type: String, required: true }
});

// Define schema for report items
const ReportItemSchema = new Schema({
  title: { type: String, required: true },
  facts: [{ type: String, required: true }],
  keyFindings: [{ type: String, required: true }],
  recommendedActions: [{ type: String, required: true }]
});

// Define schema for risk score
const RiskScoreSchema = new Schema({
  score: { type: String, required: true },
  riskLevel: { type: String, required: true },
  justification: { type: String, required: true }
});

// Define schema for missing documents
const MissingDocumentsSchema = new Schema({
  documentList: [DocumentItemSchema],
  note: { type: String, required: true }
});

// Define schema for available documents
const AvailableDocumentSchema = new Schema({
  documentId: { type: String, required: true },
  documentName: { type: String, required: true },
  documentType: { type: String, required: true },
  uploadDate: { type: Date, required: true }
});

// Define the main schema
const NewFinancialDueDiligenceReportSchema: Schema = new Schema({
  // Core fields
  targetEntityId: { type: String, required: true },
  targetEntityType: { type: String, required: true },
  requestedById: { type: String, required: true },
  companyName: { type: String, required: true },
  reportDate: { type: Date, default: Date.now },
  generatedBy: { type: String, required: true },

  // Report content based on FINALREPORT.MD structure
  introduction: { type: String, required: true },
  items: [ReportItemSchema],
  missingDocuments: { type: MissingDocumentsSchema, required: true },
  riskScore: { type: RiskScoreSchema, required: true },
  disclaimer: { type: String },

  // Document tracking
  availableDocuments: [AvailableDocumentSchema],
  documentSources: [String],

  // Metadata
  status: { type: String, default: 'final' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  reportCalculated: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Create indexes for efficient queries
NewFinancialDueDiligenceReportSchema.index({ targetEntityId: 1, targetEntityType: 1 });
NewFinancialDueDiligenceReportSchema.index({ createdAt: 1 });
NewFinancialDueDiligenceReportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Create and export the model
const NewFinancialDueDiligenceReport = mongoose.model<INewFinancialDueDiligenceReport>(
  'NewFinancialDueDiligenceReport',
  NewFinancialDueDiligenceReportSchema
);

export default NewFinancialDueDiligenceReport;

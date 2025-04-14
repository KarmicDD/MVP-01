import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export type DocumentType =
    // General document types
    'pitch_deck' | 'other' | 'miscellaneous' |
    // Financial document types
    'financial_balance_sheet' | 'financial_income_statement' | 'financial_cash_flow' |
    'financial_tax_returns' | 'financial_audit_report' | 'financial_gst_returns' |
    'financial_bank_statements' | 'financial_projections' | 'financial_valuation_report' |
    'financial_cap_table' | 'financial_funding_history' | 'financial_debt_schedule';

export interface IDocument extends MongooseDocument {
    userId: string;
    fileName: string;
    originalName: string;
    fileType: string;
    fileSize: number;
    filePath: string;
    description?: string;
    documentType: DocumentType;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const DocumentSchema: Schema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    fileName: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    documentType: {
        type: String,
        enum: [
            // General document types
            'pitch_deck', 'other', 'miscellaneous',
            // Financial document types
            'financial_balance_sheet', 'financial_income_statement', 'financial_cash_flow',
            'financial_tax_returns', 'financial_audit_report', 'financial_gst_returns',
            'financial_bank_statements', 'financial_projections', 'financial_valuation_report',
            'financial_cap_table', 'financial_funding_history', 'financial_debt_schedule'
        ],
        default: 'other'
    },
    isPublic: {
        type: Boolean,
        default: false
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

export default mongoose.model<IDocument>('Document', DocumentSchema);

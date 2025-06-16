import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export type DocumentCategory = 'financial' | 'legal' | 'other';

// SOLID Principle: Single Responsibility - Each type group serves a specific purpose
export type GeneralDocumentType = 'pitch_deck' | 'other' | 'miscellaneous';

export type FinancialDocumentType =
    'financial_balance_sheet' | 'financial_income_statement' | 'financial_cash_flow' |
    'financial_tax_returns' | 'financial_audit_report' | 'financial_gst_returns' |
    'financial_bank_statements' | 'financial_projections' | 'financial_valuation_report' |
    'financial_cap_table' | 'financial_funding_history' | 'financial_debt_schedule';

export type LegalDocumentType =
    // Startup-specific legal documents
    'legal_incorporation_certificate' | 'legal_moa_aoa' | 'legal_llp_agreement' |
    'legal_pan_tan_gst' | 'legal_shop_establishment' | 'legal_iec' |
    'legal_board_resolutions' | 'legal_statutory_registers' | 'legal_annual_filings' |
    'legal_auditor_appointment' | 'legal_cap_table_legal' | 'legal_share_certificates' |
    'legal_sha_ssa' | 'legal_esop_plan' | 'legal_convertible_notes' | 'legal_angel_tax_exemption' |
    'legal_valuation_reports' | 'legal_itr_gst_returns' | 'legal_tds_returns' |
    'legal_transfer_pricing' | 'legal_customer_contracts' | 'legal_vendor_contracts' |
    'legal_nda_agreements' | 'legal_saas_agreements' | 'legal_lease_agreements' |
    'legal_government_licenses' | 'legal_employment_agreements' | 'legal_hr_policies' |
    'legal_posh_policy' | 'legal_labour_registrations' | 'legal_ip_assignments' |
    'legal_trademark_filings' | 'legal_patent_filings' | 'legal_website_policies' |
    'legal_data_protection' | 'legal_litigation_details' | 'legal_regulatory_notices' |
    // Investor-specific legal documents
    'legal_aif_registration' | 'legal_firc_copies' | 'legal_fc_gpr' | 'legal_fla_returns' |
    'legal_odi_documents' | 'legal_ppm' | 'legal_investment_strategy' | 'legal_capital_commitments' |
    'legal_trc' | 'legal_fatca_crs' | 'legal_dtaa_applications' | 'legal_stt_documents' |
    // Common legal documents
    'legal_term_sheet' | 'legal_shareholders_agreement' | 'legal_share_subscription' |
    'legal_voting_rights' | 'legal_rofr_agreements' | 'legal_ben_declarations' |
    'legal_sbo_register' | 'legal_director_kyc' | 'legal_ubo_declaration' |
    'legal_loan_agreements' | 'legal_rpt_disclosures';

// DRY Principle: Unified type combining all document types
export type DocumentType = GeneralDocumentType | FinancialDocumentType | LegalDocumentType;

export interface IDocument extends MongooseDocument {
    userId: string;
    fileName: string;
    originalName: string;
    fileType: string;
    fileSize: number;
    filePath: string;
    description?: string;
    documentType: DocumentType;
    category: DocumentCategory;
    timePeriod?: string; // Added field for time period (e.g., "Q1 2023", "FY 2022")
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
    }, documentType: {
        type: String,
        default: 'other'
    }, category: {
        type: String,
        default: 'other'
    },
    timePeriod: {
        type: String,
        default: ''
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

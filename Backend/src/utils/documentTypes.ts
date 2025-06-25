import {
    DocumentCategory,
    GeneralDocumentType,
    FinancialDocumentType,
    LegalDocumentType,
    DocumentType,
    IDocument
} from '../models/Profile/Document';

/**
 * Centralized document type utilities
 * This module provides functions to get all document types without duplication
 * 
 * DRY Principle: Single source of truth for document type definitions
 * Used by controllers to avoid redeclaring document types
 */

// Re-export all types from Document model for single source of truth
export type {
    DocumentCategory,
    GeneralDocumentType,
    FinancialDocumentType,
    LegalDocumentType,
    DocumentType,
    IDocument
};

/**
 * Get all valid document categories
 */
export const getDocumentCategories = (): DocumentCategory[] => {
    return ['financial', 'legal', 'other'];
};

/**
 * Get all general document types from the GeneralDocumentType definition
 * This ensures we use the complete list without duplicating type definitions
 */
export const getAllGeneralDocumentTypes = (): GeneralDocumentType[] => {
    return [
        'pitch_deck',
        'other',
        'miscellaneous'
    ];
};

/**
 * Get all financial document types from the FinancialDocumentType definition
 * This ensures we use the complete list without duplicating type definitions
 */
export const getAllFinancialDocumentTypes = (): FinancialDocumentType[] => {
    return [
        'financial_balance_sheet',
        'financial_income_statement',
        'financial_cash_flow',
        'financial_tax_returns',
        'financial_audit_report',
        'financial_gst_returns',
        'financial_bank_statements',
        'financial_projections',
        'financial_valuation_report',
        'financial_cap_table',
        'financial_funding_history',
        'financial_debt_schedule'
    ];
};

/**
 * Get all legal document types from the LegalDocumentType definition
 * This ensures we use the complete list without duplicating type definitions
 */
export const getAllLegalDocumentTypes = (): LegalDocumentType[] => {
    return [
        // Startup-specific legal documents
        'legal_incorporation_certificate',
        'legal_moa_aoa',
        'legal_llp_agreement',
        'legal_pan_tan_gst',
        'legal_shop_establishment',
        'legal_iec',
        'legal_board_resolutions',
        'legal_statutory_registers',
        'legal_annual_filings',
        'legal_auditor_appointment',
        'legal_cap_table_legal',
        'legal_share_certificates',
        'legal_sha_ssa',
        'legal_esop_plan',
        'legal_convertible_notes',
        'legal_angel_tax_exemption',
        'legal_valuation_reports',
        'legal_itr_gst_returns',
        'legal_tds_returns',
        'legal_transfer_pricing',
        'legal_customer_contracts',
        'legal_vendor_contracts',
        'legal_nda_agreements',
        'legal_saas_agreements',
        'legal_lease_agreements',
        'legal_government_licenses',
        'legal_employment_agreements',
        'legal_hr_policies',
        'legal_posh_policy',
        'legal_labour_registrations',
        'legal_ip_assignments',
        'legal_trademark_filings',
        'legal_patent_filings',
        'legal_website_policies',
        'legal_data_protection',
        'legal_litigation_details',
        'legal_regulatory_notices',
        // Investor-specific legal documents
        'legal_aif_registration',
        'legal_firc_copies',
        'legal_fc_gpr',
        'legal_fla_returns',
        'legal_odi_documents',
        'legal_ppm',
        'legal_investment_strategy',
        'legal_capital_commitments',
        'legal_trc',
        'legal_fatca_crs',
        'legal_dtaa_applications',
        'legal_stt_documents',
        // Common legal documents
        'legal_term_sheet',
        'legal_shareholders_agreement',
        'legal_share_subscription',
        'legal_voting_rights',
        'legal_rofr_agreements',
        'legal_ben_declarations',
        'legal_sbo_register',
        'legal_director_kyc',
        'legal_ubo_declaration',
        'legal_loan_agreements',
        'legal_rpt_disclosures'
    ];
};

/**
 * Get all document types (combined general, financial, and legal)
 * This provides a unified list of all valid document types
 */
export const getAllDocumentTypes = (): DocumentType[] => {
    return [
        ...getAllGeneralDocumentTypes(),
        ...getAllFinancialDocumentTypes(),
        ...getAllLegalDocumentTypes()
    ];
};

/**
 * Get required financial document types for due diligence
 */
export const getRequiredFinancialDocumentTypes = (): FinancialDocumentType[] => {
    return [
        'financial_balance_sheet',
        'financial_income_statement',
        'financial_cash_flow',
        'financial_tax_returns',
        'financial_gst_returns',
        'financial_bank_statements'
    ];
};

/**
 * Get startup-specific financial document types
 */
export const getStartupSpecificFinancialDocumentTypes = (): FinancialDocumentType[] => {
    return [
        'financial_projections',
        'financial_cap_table'
    ];
};

/**
 * Get investor-specific financial document types
 */
export const getInvestorSpecificFinancialDocumentTypes = (): FinancialDocumentType[] => {
    return [
        'financial_audit_report'
    ];
};

/**
 * Get required legal document types for due diligence
 */
export const getRequiredLegalDocumentTypes = (): LegalDocumentType[] => {
    return [
        'legal_incorporation_certificate',
        'legal_moa_aoa',
        'legal_pan_tan_gst',
        'legal_board_resolutions',
        'legal_statutory_registers',
        'legal_annual_filings'
    ];
};

/**
 * Get startup-specific legal document types
 */
export const getStartupSpecificLegalDocumentTypes = (): LegalDocumentType[] => {
    return [
        'legal_llp_agreement',
        'legal_shop_establishment',
        'legal_iec',
        'legal_esop_plan',
        'legal_convertible_notes',
        'legal_angel_tax_exemption'
    ];
};

/**
 * Get investor-specific legal document types
 */
export const getInvestorSpecificLegalDocumentTypes = (): LegalDocumentType[] => {
    return [
        'legal_aif_registration',
        'legal_firc_copies',
        'legal_fc_gpr',
        'legal_fla_returns',
        'legal_odi_documents',
        'legal_ppm',
        'legal_investment_strategy',
        'legal_capital_commitments',
        'legal_trc',
        'legal_fatca_crs',
        'legal_dtaa_applications',
        'legal_stt_documents'
    ];
};

/**
 * Check if a document is financial based on flexible categorization
 * This includes explicit financial document types, category, and keyword matching
 */
export const isFinancialDocument = (document: {
    documentType?: string;
    category?: string;
    originalName?: string;
    fileName?: string;
}): boolean => {
    const { documentType, category, originalName, fileName } = document;

    // Check explicit financial document type
    if (documentType && documentType.startsWith('financial_')) {
        return true;
    }

    // Check category
    if (category === 'financial') {
        return true;
    }

    // Check for financial keywords in document name
    const fileName_to_check = originalName || fileName || '';
    const keywords = [
        'financial', 'balance', 'income', 'cash', 'revenue', 'profit', 'loss',
        'statement', 'report', 'audit', 'tax', 'gst', 'bank', 'projection',
        'valuation', 'cap table', 'funding', 'debt', 'equity', 'p&l', 'pnl'
    ];

    return keywords.some(keyword =>
        fileName_to_check.toLowerCase().includes(keyword.toLowerCase())
    );
};

/**
 * Get MongoDB query for finding financial documents using flexible categorization
 */
export const getFinancialDocumentsQuery = () => {
    const financialDocumentTypes = getAllFinancialDocumentTypes();

    return {
        $or: [
            // Explicit financial document types
            { documentType: { $in: financialDocumentTypes } },
            // Documents with category set to financial
            { category: 'financial' },
            // Documents with financial keywords in name (case insensitive)
            { originalName: { $regex: /financial|balance|income|cash|revenue|profit|loss|statement|report|audit|tax|gst|bank|projection|valuation|cap.?table|funding|debt|equity|p&l|pnl/i } }
        ]
    };
};

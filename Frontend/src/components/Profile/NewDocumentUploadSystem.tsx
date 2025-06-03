import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiUpload, FiFile, FiTrash2, FiDownload, FiEdit, FiX, FiCheck,
    FiFileText, FiDollarSign, FiShield, FiFolder, FiChevronDown,
    FiInfo, FiAlertCircle, FiEye, FiPlus
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { profileService } from '../../services/api';
import SimpleSpinner from '../SimpleSpinner';

// Types following DRY principle
export type DocumentCategory = 'financial' | 'legal' | 'other';

export type DocumentType =
    // General document types
    'pitch_deck' | 'other' | 'miscellaneous' |
    // Financial document types
    'financial_balance_sheet' | 'financial_income_statement' | 'financial_cash_flow' |
    'financial_tax_returns' | 'financial_audit_report' | 'financial_gst_returns' |
    'financial_bank_statements' | 'financial_projections' | 'financial_valuation_report' |
    'financial_cap_table' | 'financial_funding_history' | 'financial_debt_schedule' |
    // Legal document types - Startup specific
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
    // Legal document types - Investor specific
    'legal_aif_registration' | 'legal_firc_copies' | 'legal_fc_gpr' | 'legal_fla_returns' |
    'legal_odi_documents' | 'legal_ppm' | 'legal_investment_strategy' | 'legal_capital_commitments' |
    'legal_trc' | 'legal_fatca_crs' | 'legal_dtaa_applications' | 'legal_stt_documents' |
    // Legal document types - Common
    'legal_term_sheet' | 'legal_shareholders_agreement' | 'legal_share_subscription' |
    'legal_voting_rights' | 'legal_rofr_agreements' | 'legal_ben_declarations' |
    'legal_sbo_register' | 'legal_director_kyc' | 'legal_ubo_declaration' |
    'legal_loan_agreements' | 'legal_rpt_disclosures';

// Document interface following SOLID principles
interface Document {
    id: string;
    fileName: string;
    originalName: string;
    fileType: string;
    fileSize: number;
    description: string;
    documentType: DocumentType;
    category: DocumentCategory;
    timePeriod?: string;
    isPublic: boolean;
    createdAt: string;
}

// Document category configuration following Single Responsibility Principle
interface DocumentCategoryConfig {
    id: DocumentCategory;
    title: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    description: string;
    documents: DocumentTypeConfig[];
}

interface DocumentTypeConfig {
    type: DocumentType;
    label: string;
    description: string;
    userType: 'startup' | 'investor' | 'both';
    required?: boolean;
}

// Upload state interface
interface UploadState {
    isOpen: boolean;
    category: DocumentCategory | null;
    selectedFiles: File[];
    documentType: DocumentType;
    description: string;
    timePeriod: string;
    isPublic: boolean;
}

const NewDocumentUploadSystem: React.FC = () => {
    // State management following SOLID principles
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [userType, setUserType] = useState<'startup' | 'investor' | ''>('');

    // Upload modal state
    const [uploadState, setUploadState] = useState<UploadState>({
        isOpen: false,
        category: null,
        selectedFiles: [],
        documentType: 'other',
        description: '',
        timePeriod: '',
        isPublic: false
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Document category configurations following DRY principle
    const documentCategories: DocumentCategoryConfig[] = [
        {
            id: 'financial',
            title: 'Financial Documents',
            icon: <FiDollarSign className="w-8 h-8" />,
            color: 'text-green-600',
            bgColor: 'bg-green-50 border-green-200 hover:bg-green-100',
            description: 'Upload financial statements, reports, and tax documents',
            documents: [
                // Startup Financial Documents
                { type: 'financial_balance_sheet', label: 'Balance Sheet', description: 'Company balance sheet', userType: 'both', required: true },
                { type: 'financial_income_statement', label: 'Income Statement', description: 'Profit & Loss statement', userType: 'both', required: true },
                { type: 'financial_cash_flow', label: 'Cash Flow Statement', description: 'Cash flow statement', userType: 'both', required: true },
                { type: 'financial_tax_returns', label: 'Tax Returns', description: 'Income tax returns', userType: 'both', required: true },
                { type: 'financial_audit_report', label: 'Audit Report', description: 'Independent audit report', userType: 'both' },
                { type: 'financial_gst_returns', label: 'GST Returns', description: 'GST filing returns', userType: 'startup' },
                { type: 'financial_bank_statements', label: 'Bank Statements', description: 'Bank account statements', userType: 'both' },
                { type: 'financial_projections', label: 'Financial Projections', description: 'Future financial projections', userType: 'startup' },
                { type: 'financial_valuation_report', label: 'Valuation Report', description: 'Company valuation report', userType: 'both' },
                { type: 'financial_cap_table', label: 'Cap Table', description: 'Capitalization table', userType: 'startup' },
                { type: 'financial_funding_history', label: 'Funding History', description: 'Previous funding rounds', userType: 'startup' },
                { type: 'financial_debt_schedule', label: 'Debt Schedule', description: 'Outstanding debts and payment terms', userType: 'both' }
            ]
        },
        {
            id: 'legal',
            title: 'Legal Documents',
            icon: <FiShield className="w-8 h-8" />,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
            description: 'Upload legal compliance, contracts, and regulatory documents',
            documents: [
                // Incorporation & Statutory Documents
                { type: 'legal_incorporation_certificate', label: 'Certificate of Incorporation', description: 'Company incorporation certificate', userType: 'both', required: true },
                { type: 'legal_moa_aoa', label: 'MoA & AoA', description: 'Memorandum & Articles of Association', userType: 'both', required: true },
                { type: 'legal_llp_agreement', label: 'LLP Agreement', description: 'Limited Liability Partnership agreement', userType: 'both' },
                { type: 'legal_pan_tan_gst', label: 'PAN, TAN, GST Certificates', description: 'Tax registration certificates', userType: 'both', required: true },
                { type: 'legal_shop_establishment', label: 'Shop & Establishment Registration', description: 'State-specific business registration', userType: 'both' },
                { type: 'legal_iec', label: 'Import Export Code (IEC)', description: 'IEC for import/export businesses', userType: 'both' },

                // Corporate Filings & Registers
                { type: 'legal_board_resolutions', label: 'Board Resolutions', description: 'Board meeting resolutions and minutes', userType: 'both', required: true },
                { type: 'legal_statutory_registers', label: 'Statutory Registers', description: 'Directors, shareholders, charges registers', userType: 'both', required: true },
                { type: 'legal_annual_filings', label: 'Annual Filings', description: 'MCA annual filing copies (AOC-4, MGT-7)', userType: 'both', required: true },
                { type: 'legal_auditor_appointment', label: 'Auditor Appointment', description: 'Auditor appointment letters and reports', userType: 'both' },

                // Shareholding & Cap Table Legal
                { type: 'legal_cap_table_legal', label: 'Legal Cap Table', description: 'Updated cap table with share classes and options', userType: 'startup', required: true },
                { type: 'legal_share_certificates', label: 'Share Certificates', description: 'Physical/digital share certificates', userType: 'both' },
                { type: 'legal_sha_ssa', label: 'SHA/SSA', description: 'Shareholders Agreement & Share Subscription Agreement', userType: 'both', required: true },
                { type: 'legal_esop_plan', label: 'ESOP Plan & Register', description: 'Employee stock option plan and register', userType: 'startup' },

                // Funding Documents
                { type: 'legal_convertible_notes', label: 'Convertible Notes', description: 'CCPS/CCD agreements', userType: 'startup' },
                { type: 'legal_angel_tax_exemption', label: 'Angel Tax Exemption', description: 'Angel tax exemption certificate', userType: 'startup' },
                { type: 'legal_valuation_reports', label: 'Legal Valuation Reports', description: 'Legal valuation reports for funding', userType: 'startup' },

                // Taxation & Compliance
                { type: 'legal_itr_gst_returns', label: 'ITR & GST Returns', description: 'Income tax and GST return filings', userType: 'both', required: true },
                { type: 'legal_tds_returns', label: 'TDS Returns', description: 'TDS returns and challans', userType: 'both' },
                { type: 'legal_transfer_pricing', label: 'Transfer Pricing Reports', description: 'Transfer pricing documentation', userType: 'both' },

                // Contracts & Licenses
                { type: 'legal_customer_contracts', label: 'Customer Contracts', description: 'Key customer agreements', userType: 'startup', required: true },
                { type: 'legal_vendor_contracts', label: 'Vendor Contracts', description: 'Vendor and supplier agreements', userType: 'startup' },
                { type: 'legal_nda_agreements', label: 'NDA Agreements', description: 'Non-disclosure agreements', userType: 'both' },
                { type: 'legal_saas_agreements', label: 'SaaS Agreements', description: 'Software as a Service agreements', userType: 'startup' },
                { type: 'legal_lease_agreements', label: 'Lease Agreements', description: 'Office and property lease agreements', userType: 'both' },
                { type: 'legal_government_licenses', label: 'Government Licenses', description: 'Regulatory licenses (FSSAI, SEZ, etc.)', userType: 'both' },

                // Employment & Labour
                { type: 'legal_employment_agreements', label: 'Employment Agreements', description: 'Offer letters, employment contracts, ESOP grants', userType: 'both' },
                { type: 'legal_hr_policies', label: 'HR Policies', description: 'Leave, gratuity, termination policies', userType: 'both' },
                { type: 'legal_posh_policy', label: 'POSH Policy', description: 'Prevention of Sexual Harassment policy and filings', userType: 'both', required: true },
                { type: 'legal_labour_registrations', label: 'Labour Registrations', description: 'PF, ESI, Bonus, Gratuity, Shops Act registrations', userType: 'both' },

                // IP & Data Protection
                { type: 'legal_ip_assignments', label: 'IP Assignment Agreements', description: 'Intellectual property assignment agreements', userType: 'both' },
                { type: 'legal_trademark_filings', label: 'Trademark Filings', description: 'Trademark registration documents', userType: 'both' },
                { type: 'legal_patent_filings', label: 'Patent Filings', description: 'Patent application and grant documents', userType: 'both' },
                { type: 'legal_website_policies', label: 'Website Policies', description: 'Terms of Use, Privacy Policy, Cookie Policy', userType: 'startup', required: true },
                { type: 'legal_data_protection', label: 'Data Protection Policy', description: 'IT Act or DPDP Act compliance documents', userType: 'startup', required: true },

                // Litigation & Notices
                { type: 'legal_litigation_details', label: 'Litigation Details', description: 'Ongoing/past litigation details', userType: 'both' },
                { type: 'legal_regulatory_notices', label: 'Regulatory Notices', description: 'Notices from regulators, tax authorities', userType: 'both' },

                // Investor-Specific Legal Documents
                { type: 'legal_aif_registration', label: 'AIF Registration', description: 'SEBI AIF registration certificate', userType: 'investor', required: true },
                { type: 'legal_firc_copies', label: 'FIRC Copies', description: 'Foreign Inward Remittance Certificate', userType: 'investor' },
                { type: 'legal_fc_gpr', label: 'FC-GPR Filings', description: 'FC-GPR compliance filings', userType: 'investor' },
                { type: 'legal_fla_returns', label: 'FLA Returns', description: 'Foreign Liability and Assets returns', userType: 'investor' },
                { type: 'legal_odi_documents', label: 'ODI Documents', description: 'Overseas Direct Investment documents', userType: 'investor' },
                { type: 'legal_ppm', label: 'Private Placement Memorandum', description: 'PPM and investment strategy documents', userType: 'investor', required: true },
                { type: 'legal_investment_strategy', label: 'Investment Strategy', description: 'Investment strategy and risk disclosure', userType: 'investor' },
                { type: 'legal_capital_commitments', label: 'Capital Commitments', description: 'LP capital commitments and trust deed', userType: 'investor' },
                { type: 'legal_trc', label: 'Tax Residency Certificate', description: 'TRC for foreign investors', userType: 'investor' },
                { type: 'legal_fatca_crs', label: 'FATCA/CRS Declarations', description: 'FATCA and CRS compliance declarations', userType: 'investor' },
                { type: 'legal_dtaa_applications', label: 'DTAA Applications', description: 'Double Taxation Avoidance Agreement applications', userType: 'investor' },
                { type: 'legal_stt_documents', label: 'STT Documents', description: 'Securities Transaction Tax documents', userType: 'investor' },

                // Common Transaction Documents
                { type: 'legal_term_sheet', label: 'Term Sheet', description: 'Investment term sheet', userType: 'both', required: true },
                { type: 'legal_shareholders_agreement', label: 'Shareholders Agreement', description: 'SHA with voting rights and clauses', userType: 'both', required: true },
                { type: 'legal_share_subscription', label: 'Share Subscription Agreement', description: 'Share subscription and issuance agreement', userType: 'both' },
                { type: 'legal_voting_rights', label: 'Voting Rights', description: 'Voting rights, ROFR, Tag-along/Drag-along clauses', userType: 'both' },
                { type: 'legal_rofr_agreements', label: 'ROFR Agreements', description: 'Right of First Refusal agreements', userType: 'both' },
                { type: 'legal_ben_declarations', label: 'BEN Declarations', description: 'BEN-1/BEN-2 beneficial ownership declarations', userType: 'both', required: true },
                { type: 'legal_sbo_register', label: 'SBO Register', description: 'Significant Beneficial Owners register', userType: 'both', required: true },
                { type: 'legal_director_kyc', label: 'Director KYC', description: 'Director/Partner KYC (DIN, Aadhaar, Passport)', userType: 'both', required: true },
                { type: 'legal_ubo_declaration', label: 'UBO Declaration', description: 'Ultimate Beneficial Owner declaration', userType: 'both', required: true },
                { type: 'legal_loan_agreements', label: 'Loan Agreements', description: 'Inter-corporate loans or transaction agreements', userType: 'both' },
                { type: 'legal_rpt_disclosures', label: 'RPT Disclosures', description: 'Related Party Transaction disclosures under Sec 185/186', userType: 'both' }
            ]
        },
        {
            id: 'other',
            title: 'Other Documents',
            icon: <FiFolder className="w-8 h-8" />,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
            description: 'Upload pitch decks, presentations, and miscellaneous documents',
            documents: [
                { type: 'pitch_deck', label: 'Pitch Deck', description: 'Company pitch presentation', userType: 'startup', required: true },
                { type: 'other', label: 'Other Document', description: 'Any other relevant document', userType: 'both' },
                { type: 'miscellaneous', label: 'Miscellaneous', description: 'Miscellaneous business documents', userType: 'both' }
            ]
        }
    ];

    // Load documents and user type on component mount
    useEffect(() => {
        loadUserType();
        loadDocuments();
    }, []);

    // User type loading following Single Responsibility Principle
    const loadUserType = async () => {
        try {
            const userTypeResponse = await profileService.getUserType();
            setUserType(userTypeResponse.userType || '');
        } catch (error) {
            console.error('Error loading user type:', error);
            toast.error('Failed to load user type');
        }
    };

    // Document loading following Single Responsibility Principle
    const loadDocuments = async () => {
        try {
            setIsLoading(true);
            const docs = await profileService.getUserDocuments();
            setDocuments(docs || []);
        } catch (error) {
            console.error('Error loading documents:', error);
            toast.error('Failed to load documents');
        } finally {
            setIsLoading(false);
        }
    };

    // Category selection handler following Open/Closed Principle
    const handleCategorySelect = (category: DocumentCategory) => {
        setUploadState(prev => ({
            ...prev,
            isOpen: true,
            category,
            selectedFiles: [],
            documentType: 'other'
        }));
    };

    // File selection handler
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        setUploadState(prev => ({
            ...prev,
            selectedFiles: [...prev.selectedFiles, ...files]
        }));
    };

    // File removal handler
    const removeFile = (index: number) => {
        setUploadState(prev => ({
            ...prev,
            selectedFiles: prev.selectedFiles.filter((_, i) => i !== index)
        }));
    };

    // Upload handler following Single Responsibility Principle
    const handleUpload = async () => {
        if (uploadState.selectedFiles.length === 0) {
            toast.error('Please select at least one file');
            return;
        }

        if (!uploadState.documentType) {
            toast.error('Please select a document type');
            return;
        }

        try {
            setIsUploading(true);

            // Upload each file
            for (const file of uploadState.selectedFiles) {
                await profileService.uploadDocument(file, {
                    description: uploadState.description,
                    documentType: uploadState.documentType,
                    timePeriod: uploadState.timePeriod,
                    isPublic: uploadState.isPublic
                });
            }

            toast.success(`${uploadState.selectedFiles.length} document(s) uploaded successfully!`);

            // Reset upload state
            setUploadState({
                isOpen: false,
                category: null,
                selectedFiles: [],
                documentType: 'other',
                description: '',
                timePeriod: '',
                isPublic: false
            });

            // Reload documents
            await loadDocuments();
        } catch (error) {
            console.error('Error uploading documents:', error);
            toast.error('Failed to upload documents');
        } finally {
            setIsUploading(false);
        }
    };

    // Get filtered document types based on selected category and user type
    const getFilteredDocumentTypes = () => {
        if (!uploadState.category) return [];

        const categoryConfig = documentCategories.find(cat => cat.id === uploadState.category);
        if (!categoryConfig) return [];

        return categoryConfig.documents.filter(doc =>
            doc.userType === 'both' || doc.userType === userType
        );
    };

    // Format file size helper
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };    // Document management state
    const [editingDoc, setEditingDoc] = useState<Document | null>(null);
    const [deletingDoc, setDeletingDoc] = useState<Document | null>(null);

    // Document management handlers
    const handleEdit = (doc: Document) => {
        setEditingDoc(doc);
    };

    const handleSaveEdit = async () => {
        if (!editingDoc) return;

        try {
            await profileService.updateDocumentMetadata(editingDoc.id, {
                description: editingDoc.description,
                documentType: editingDoc.documentType,
                timePeriod: editingDoc.timePeriod,
                isPublic: editingDoc.isPublic,
                category: editingDoc.category
            });

            toast.success('Document updated successfully');
            setEditingDoc(null);
            await loadDocuments();
        } catch (error) {
            console.error('Error updating document:', error);
            toast.error('Failed to update document');
        }
    };

    const handleCancelEdit = () => {
        setEditingDoc(null);
    };

    const handleDelete = async (doc: Document) => {
        setDeletingDoc(doc);
    };

    const confirmDelete = async () => {
        if (!deletingDoc) return;

        try {
            await profileService.deleteDocument(deletingDoc.id);
            toast.success('Document deleted successfully');
            setDeletingDoc(null);
            await loadDocuments();
        } catch (error) {
            console.error('Error deleting document:', error);
            toast.error('Failed to delete document');
        }
    };

    const handleDownload = async (doc: Document) => {
        try {
            const blob = await profileService.downloadDocument(doc.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = doc.originalName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            toast.success('Document downloaded successfully');
        } catch (error) {
            console.error('Error downloading document:', error);
            toast.error('Failed to download document');
        }
    };

    const togglePublicStatus = async (doc: Document) => {
        try {
            await profileService.updateDocumentMetadata(doc.id, {
                description: doc.description,
                documentType: doc.documentType,
                timePeriod: doc.timePeriod,
                isPublic: !doc.isPublic,
                category: doc.category
            });

            toast.success(`Document ${!doc.isPublic ? 'made public' : 'made private'}`);
            await loadDocuments();
        } catch (error) {
            console.error('Error updating document visibility:', error);
            toast.error('Failed to update document visibility');
        }
    };

    const getDocumentTypeLabel = (documentType: DocumentType) => {
        for (const category of documentCategories) {
            const docConfig = category.documents.find(doc => doc.type === documentType);
            if (docConfig) return docConfig.label;
        }
        return documentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getCategoryInfo = (category: DocumentCategory) => {
        return documentCategories.find(cat => cat.id === category);
    };

    // Close modal handler
    const closeUploadModal = () => {
        setUploadState({
            isOpen: false,
            category: null,
            selectedFiles: [],
            documentType: 'other',
            description: '',
            timePeriod: '',
            isPublic: false
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <SimpleSpinner />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Document Management</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Organize and upload your documents by category. Choose from Financial, Legal, or Other documents
                    with specific document types for each category.
                </p>
            </div>

            {/* Category Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {documentCategories.map((category) => (
                    <motion.button
                        key={category.id}
                        onClick={() => handleCategorySelect(category.id)}
                        className={`p-6 rounded-xl border-2 transition-all duration-200 ${category.bgColor} text-left group`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className={`${category.color} mb-4 group-hover:scale-110 transition-transform`}>
                            {category.icon}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                        <div className="flex items-center text-sm font-medium text-gray-700">
                            <FiPlus className="w-4 h-4 mr-2" />
                            Upload Documents
                        </div>
                    </motion.button>
                ))}
            </div>            {/* Uploaded Documents Summary */}
            {documents.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview ({documents.length} documents)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {documents.slice(0, 6).map((doc) => (
                            <div key={doc.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                <FiFile className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{doc.originalName}</p>
                                    <p className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {documents.length > 6 && (
                        <p className="text-sm text-gray-500 mt-4 text-center">
                            And {documents.length - 6} more documents...
                        </p>
                    )}
                </div>
            )}

            {/* All Uploaded Documents Section */}
            {documents.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border mb-8">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                            <FiFolder className="w-6 h-6 mr-3 text-blue-600" />
                            All Uploaded Documents ({documents.length})
                        </h3>
                        <p className="text-gray-600 mt-2">Manage, edit, and organize all your uploaded documents</p>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {documents.map((doc) => (
                            <div key={doc.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                                        {/* Category Icon */}
                                        <div className={`p-2 rounded-lg ${getCategoryInfo(doc.category)?.bgColor || 'bg-gray-100'}`}>
                                            <div className={getCategoryInfo(doc.category)?.color || 'text-gray-600'}>
                                                {getCategoryInfo(doc.category)?.icon || <FiFile className="w-5 h-5" />}
                                            </div>
                                        </div>

                                        {/* Document Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <h4 className="text-lg font-medium text-gray-900 truncate">{doc.originalName}</h4>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${doc.isPublic
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {doc.isPublic ? (
                                                        <>
                                                            <FiEye className="w-3 h-3 mr-1" />
                                                            Public
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiShield className="w-3 h-3 mr-1" />
                                                            Private
                                                        </>
                                                    )}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium">Type:</span>
                                                    <div className="mt-1">{getDocumentTypeLabel(doc.documentType)}</div>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Category:</span>
                                                    <div className="mt-1 capitalize">{doc.category}</div>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Size:</span>
                                                    <div className="mt-1">{formatFileSize(doc.fileSize)}</div>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Uploaded:</span>
                                                    <div className="mt-1">{new Date(doc.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>

                                            {doc.description && (
                                                <div className="mt-3">
                                                    <span className="font-medium text-sm text-gray-600">Description:</span>
                                                    <p className="text-sm text-gray-700 mt-1">{doc.description}</p>
                                                </div>
                                            )}

                                            {doc.timePeriod && (
                                                <div className="mt-2">
                                                    <span className="font-medium text-sm text-gray-600">Time Period:</span>
                                                    <span className="text-sm text-gray-700 ml-2">{doc.timePeriod}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center space-x-2 ml-4">
                                        <motion.button
                                            onClick={() => handleEdit(doc)}
                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            title="Edit document"
                                        >
                                            <FiEdit className="w-4 h-4" />
                                        </motion.button>

                                        <motion.button
                                            onClick={() => handleDownload(doc)}
                                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            title="Download document"
                                        >
                                            <FiDownload className="w-4 h-4" />
                                        </motion.button>

                                        <motion.button
                                            onClick={() => togglePublicStatus(doc)}
                                            className={`p-2 rounded-lg transition-colors ${doc.isPublic
                                                    ? 'text-green-600 hover:text-red-600 hover:bg-red-50'
                                                    : 'text-red-600 hover:text-green-600 hover:bg-green-50'
                                                }`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            title={doc.isPublic ? 'Make private' : 'Make public'}
                                        >
                                            {doc.isPublic ? <FiShield className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                        </motion.button>

                                        <motion.button
                                            onClick={() => handleDelete(doc)}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            title="Delete document"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload Modal */}                <AnimatePresence>
                {uploadState.isOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
                        <motion.div
                            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        {uploadState.category && (
                                            <>
                                                <div className={documentCategories.find(cat => cat.id === uploadState.category)?.color}>
                                                    {documentCategories.find(cat => cat.id === uploadState.category)?.icon}
                                                </div>
                                                <h3 className="text-2xl font-bold text-gray-900 ml-3">
                                                    Upload {documentCategories.find(cat => cat.id === uploadState.category)?.title}
                                                </h3>
                                            </>
                                        )}
                                    </div>
                                    <button
                                        onClick={closeUploadModal}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <FiX className="w-6 h-6 text-gray-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6">
                                {/* Document Type Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Document Type *
                                    </label>
                                    <select
                                        value={uploadState.documentType}
                                        onChange={(e) => setUploadState(prev => ({ ...prev, documentType: e.target.value as DocumentType }))}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select document type...</option>
                                        {getFilteredDocumentTypes().map((docType) => (
                                            <option key={docType.type} value={docType.type}>
                                                {docType.label} {docType.required ? '*' : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {uploadState.documentType && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            {getFilteredDocumentTypes().find(dt => dt.type === uploadState.documentType)?.description}
                                        </p>
                                    )}
                                </div>

                                {/* File Upload Area */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Files *
                                    </label>
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-lg font-medium text-gray-700 mb-2">Choose files to upload</p>
                                        <p className="text-sm text-gray-500">Support for multiple files. Max 10MB per file.</p>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </div>

                                {/* Selected Files */}
                                {uploadState.selectedFiles.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Selected Files ({uploadState.selectedFiles.length})
                                        </label>
                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {uploadState.selectedFiles.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center flex-1 min-w-0">
                                                        <FiFile className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFile(index)}
                                                        className="p-1 hover:bg-gray-200 rounded transition-colors ml-2"
                                                    >
                                                        <FiTrash2 className="w-4 h-4 text-red-500" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={uploadState.description}
                                        onChange={(e) => setUploadState(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Add a description for these documents..."
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                    />
                                </div>

                                {/* Time Period */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Time Period
                                    </label>
                                    <input
                                        type="text"
                                        value={uploadState.timePeriod}
                                        onChange={(e) => setUploadState(prev => ({ ...prev, timePeriod: e.target.value }))}
                                        placeholder="e.g., Q1 2023, FY 2022, Jan 2023"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Public/Private Toggle */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="isPublic"
                                        checked={uploadState.isPublic}
                                        onChange={(e) => setUploadState(prev => ({ ...prev, isPublic: e.target.checked }))}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                                        Make these documents publicly visible on my profile
                                    </label>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl">
                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={closeUploadModal}
                                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        disabled={isUploading || uploadState.selectedFiles.length === 0 || !uploadState.documentType}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                                    >
                                        {isUploading ? (
                                            <>
                                                <SimpleSpinner />
                                                <span className="ml-2">Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiUpload className="w-4 h-4 mr-2" />
                                                Upload {uploadState.selectedFiles.length} File{uploadState.selectedFiles.length !== 1 ? 's' : ''}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>)}
            </AnimatePresence>

            {/* Edit Document Modal */}
            <AnimatePresence>
                {editingDoc && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
                        <motion.div
                            className="bg-white rounded-2xl shadow-xl max-w-lg w-full"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-xl font-bold text-gray-900">Edit Document</h3>
                                <p className="text-gray-600 mt-1">{editingDoc.originalName}</p>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Document Type
                                    </label>
                                    <select
                                        value={editingDoc.documentType}
                                        onChange={(e) => setEditingDoc(prev => prev ? { ...prev, documentType: e.target.value as DocumentType } : null)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {documentCategories.flatMap(cat =>
                                            cat.documents.filter(doc => doc.userType === 'both' || doc.userType === userType)
                                                .map(doc => (
                                                    <option key={doc.type} value={doc.type}>
                                                        {doc.label}
                                                    </option>
                                                ))
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={editingDoc.category}
                                        onChange={(e) => setEditingDoc(prev => prev ? { ...prev, category: e.target.value as DocumentCategory } : null)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        {documentCategories.map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={editingDoc.description}
                                        onChange={(e) => setEditingDoc(prev => prev ? { ...prev, description: e.target.value } : null)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Time Period
                                    </label>
                                    <input
                                        type="text"
                                        value={editingDoc.timePeriod || ''}
                                        onChange={(e) => setEditingDoc(prev => prev ? { ...prev, timePeriod: e.target.value } : null)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="editIsPublic"
                                        checked={editingDoc.isPublic}
                                        onChange={(e) => setEditingDoc(prev => prev ? { ...prev, isPublic: e.target.checked } : null)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="editIsPublic" className="ml-2 block text-sm text-gray-700">
                                        Make this document publicly visible on my profile
                                    </label>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-2xl">
                                <button
                                    onClick={handleCancelEdit}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                >
                                    <FiCheck className="w-4 h-4 mr-2" />
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deletingDoc && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center p-4 z-50">
                        <motion.div
                            className="bg-white rounded-2xl shadow-xl max-w-md w-full"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="p-3 bg-red-100 rounded-full mr-4">
                                        <FiAlertCircle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Delete Document</h3>
                                        <p className="text-sm text-gray-600">This action cannot be undone</p>
                                    </div>
                                </div>

                                <p className="text-gray-700 mb-6">
                                    Are you sure you want to delete <span className="font-medium">"{deletingDoc.originalName}"</span>?
                                    This will permanently remove the document from your profile.
                                </p>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setDeletingDoc(null)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                                    >
                                        <FiTrash2 className="w-4 h-4 mr-2" />
                                        Delete Document
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NewDocumentUploadSystem;

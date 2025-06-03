import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiUpload, FiFile, FiTrash2, FiDownload, FiEye, FiEyeOff,
    FiEdit, FiX, FiCheck, FiFileText, FiFolder, FiChevronDown,
    FiDollarSign, FiShield, FiPackage, FiPlus
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { profileService } from '../../services/api';
import SimpleSpinner from '../SimpleSpinner';

// SOLID Principle: Interface Segregation - Separate types for different document categories
type DocumentCategory = 'financial' | 'legal' | 'other';

type GeneralDocumentType = 'pitch_deck' | 'other' | 'miscellaneous';

type FinancialDocumentType =
    'financial_balance_sheet' | 'financial_income_statement' | 'financial_cash_flow' |
    'financial_tax_returns' | 'financial_audit_report' | 'financial_gst_returns' |
    'financial_bank_statements' | 'financial_projections' | 'financial_valuation_report' |
    'financial_cap_table' | 'financial_funding_history' | 'financial_debt_schedule';

type LegalDocumentType =
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

type DocumentType = GeneralDocumentType | FinancialDocumentType | LegalDocumentType;

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

// SOLID Principle: Single Responsibility - Each document definition serves a specific purpose
interface DocumentDefinition {
    type: DocumentType;
    label: string;
    description: string;
    category: DocumentCategory;
    userType: 'startup' | 'investor' | 'both';
    required: boolean;
}

// DRY Principle: Centralized document configurations
class DocumentConfigService {
    private static financialDocuments: DocumentDefinition[] = [
        { type: 'financial_balance_sheet', label: 'Balance Sheet', description: 'Annual balance sheet showing assets, liabilities, and equity', category: 'financial', userType: 'both', required: true },
        { type: 'financial_income_statement', label: 'Income Statement', description: 'Profit & loss statement showing revenue and expenses', category: 'financial', userType: 'both', required: true },
        { type: 'financial_cash_flow', label: 'Cash Flow Statement', description: 'Statement showing cash inflows and outflows', category: 'financial', userType: 'both', required: true },
        { type: 'financial_tax_returns', label: 'Tax Returns', description: 'Income tax returns for the last 2-3 years', category: 'financial', userType: 'both', required: true },
        { type: 'financial_gst_returns', label: 'GST Returns', description: 'GST returns for the last 4-6 quarters', category: 'financial', userType: 'both', required: true },
        { type: 'financial_bank_statements', label: 'Bank Statements', description: 'Bank statements for the last 6-12 months', category: 'financial', userType: 'both', required: true },
        { type: 'financial_projections', label: 'Financial Projections', description: 'Future financial forecasts for 3-5 years', category: 'financial', userType: 'startup', required: true },
        { type: 'financial_cap_table', label: 'Cap Table', description: 'Capitalization table showing ownership structure', category: 'financial', userType: 'startup', required: true },
        { type: 'financial_audit_report', label: 'Audit Report', description: 'Independent audit report of financial statements', category: 'financial', userType: 'investor', required: true },
        { type: 'financial_valuation_report', label: 'Valuation Report', description: 'Company valuation report if available', category: 'financial', userType: 'startup', required: false },
        { type: 'financial_funding_history', label: 'Funding History', description: 'Details of previous funding rounds', category: 'financial', userType: 'startup', required: false },
        { type: 'financial_debt_schedule', label: 'Debt Schedule', description: 'Schedule of outstanding debts and payment terms', category: 'financial', userType: 'investor', required: false },
    ];

    private static legalDocuments: DocumentDefinition[] = [
        // Startup-specific legal documents
        { type: 'legal_incorporation_certificate', label: 'Certificate of Incorporation', description: 'Official certificate of company incorporation', category: 'legal', userType: 'startup', required: true },
        { type: 'legal_moa_aoa', label: 'Memorandum & Articles of Association', description: 'MoA/AoA or LLP Agreement', category: 'legal', userType: 'startup', required: true },
        { type: 'legal_llp_agreement', label: 'LLP Agreement', description: 'Limited Liability Partnership Agreement (if applicable)', category: 'legal', userType: 'startup', required: false },
        { type: 'legal_pan_tan_gst', label: 'PAN, TAN, GST Certificates', description: 'Tax registration certificates', category: 'legal', userType: 'both', required: true },
        { type: 'legal_shop_establishment', label: 'Shop & Establishment Registration', description: 'State-specific business registration', category: 'legal', userType: 'startup', required: true },
        { type: 'legal_iec', label: 'Import Export Code (IEC)', description: 'IEC registration if applicable', category: 'legal', userType: 'startup', required: false },
        { type: 'legal_board_resolutions', label: 'Board Resolutions', description: 'Minutes of Board & General Meetings', category: 'legal', userType: 'startup', required: true },
        { type: 'legal_statutory_registers', label: 'Statutory Registers', description: 'Directors, Shareholders, Charges registers', category: 'legal', userType: 'startup', required: true },
        { type: 'legal_annual_filings', label: 'Annual Filings', description: 'MCA Master Data & Annual Filing copies (AOC-4, MGT-7)', category: 'legal', userType: 'startup', required: true },
        { type: 'legal_auditor_appointment', label: 'Auditor Appointment', description: 'Auditor appointment and audit reports', category: 'legal', userType: 'startup', required: true },
        { type: 'legal_share_certificates', label: 'Share Certificates', description: 'Share certificates and related documents', category: 'legal', userType: 'startup', required: true },
        { type: 'legal_sha_ssa', label: 'SHA, SSA, ESOP Plan', description: 'Shareholders agreements and ESOP documents', category: 'legal', userType: 'startup', required: false },
        { type: 'legal_esop_plan', label: 'ESOP Register', description: 'Employee Stock Option Plan and register', category: 'legal', userType: 'startup', required: false },
        { type: 'legal_convertible_notes', label: 'Convertible Notes', description: 'CCPS/CCD agreements', category: 'legal', userType: 'startup', required: false },
        { type: 'legal_angel_tax_exemption', label: 'Angel Tax Exemption', description: 'Angel tax exemption certificate', category: 'legal', userType: 'startup', required: false },
        { type: 'legal_customer_contracts', label: 'Customer Contracts', description: 'Key customer and vendor contracts', category: 'legal', userType: 'startup', required: false },
        { type: 'legal_vendor_contracts', label: 'Vendor Contracts', description: 'Important vendor and supplier agreements', category: 'legal', userType: 'startup', required: false },
        { type: 'legal_nda_agreements', label: 'NDA Agreements', description: 'Non-disclosure agreements', category: 'legal', userType: 'both', required: false },
        { type: 'legal_saas_agreements', label: 'SaaS Agreements', description: 'Software as a Service agreements', category: 'legal', userType: 'startup', required: false },
        { type: 'legal_lease_agreements', label: 'Lease Agreements', description: 'Office and property lease agreements', category: 'legal', userType: 'both', required: false },
        { type: 'legal_government_licenses', label: 'Government Licenses', description: 'FSSAI, SEZ, and other regulatory licenses', category: 'legal', userType: 'startup', required: false },
        { type: 'legal_employment_agreements', label: 'Employment Agreements', description: 'Offer letters and employment agreements', category: 'legal', userType: 'startup', required: true },
        { type: 'legal_hr_policies', label: 'HR Policies', description: 'Leave, gratuity, termination policies', category: 'legal', userType: 'startup', required: true },
        { type: 'legal_posh_policy', label: 'POSH Policy', description: 'Prevention of Sexual Harassment policy and committee formation', category: 'legal', userType: 'startup', required: true },
        { type: 'legal_labour_registrations', label: 'Labour Registrations', description: 'PF, ESI, Bonus, Gratuity registrations', category: 'legal', userType: 'startup', required: true },
        { type: 'legal_ip_assignments', label: 'IP Assignment Agreements', description: 'Intellectual property assignment agreements', category: 'legal', userType: 'startup', required: false },
        { type: 'legal_trademark_filings', label: 'Trademark Filings', description: 'Trademark registration and filings', category: 'legal', userType: 'startup', required: false },
        { type: 'legal_patent_filings', label: 'Patent Filings', description: 'Patent applications and registrations', category: 'legal', userType: 'startup', required: false },
        { type: 'legal_website_policies', label: 'Website Policies', description: 'Terms of Use, Privacy Policy, Cookie Policy', category: 'legal', userType: 'startup', required: true },
        { type: 'legal_data_protection', label: 'Data Protection Policy', description: 'DPDP Act and IT Act compliance', category: 'legal', userType: 'startup', required: true },
        { type: 'legal_litigation_details', label: 'Litigation Details', description: 'Ongoing/past litigation and arbitration records', category: 'legal', userType: 'both', required: false },
        { type: 'legal_regulatory_notices', label: 'Regulatory Notices', description: 'Notices from regulators and authorities', category: 'legal', userType: 'both', required: false },

        // Investor-specific legal documents
        { type: 'legal_aif_registration', label: 'SEBI AIF Registration', description: 'SEBI Alternative Investment Fund registration certificate', category: 'legal', userType: 'investor', required: true },
        { type: 'legal_firc_copies', label: 'FIRC Copies', description: 'Foreign Inward Remittance Certificate copies', category: 'legal', userType: 'investor', required: true },
        { type: 'legal_fc_gpr', label: 'FC-GPR Filings', description: 'Foreign Collaboration-General Permission Route filings', category: 'legal', userType: 'investor', required: true },
        { type: 'legal_fla_returns', label: 'FLA Returns', description: 'Foreign Liability and Asset returns to RBI', category: 'legal', userType: 'investor', required: true },
        { type: 'legal_odi_documents', label: 'ODI Documents', description: 'Overseas Direct Investment documents', category: 'legal', userType: 'investor', required: false },
        { type: 'legal_ppm', label: 'Private Placement Memorandum', description: 'PPM and investment strategy documents', category: 'legal', userType: 'investor', required: true },
        { type: 'legal_investment_strategy', label: 'Investment Strategy', description: 'Risk disclosure and investment strategy', category: 'legal', userType: 'investor', required: true },
        { type: 'legal_capital_commitments', label: 'Capital Commitments', description: 'Capital commitments from LPs/Trust Deed', category: 'legal', userType: 'investor', required: true },
        { type: 'legal_trc', label: 'Tax Residency Certificate', description: 'TRC for foreign investors', category: 'legal', userType: 'investor', required: false },
        { type: 'legal_fatca_crs', label: 'FATCA/CRS Declarations', description: 'FATCA and CRS compliance declarations', category: 'legal', userType: 'investor', required: false },
        { type: 'legal_dtaa_applications', label: 'DTAA Applications', description: 'Double Taxation Avoidance Agreement applications', category: 'legal', userType: 'investor', required: false },
        { type: 'legal_stt_documents', label: 'STT Documents', description: 'Securities Transaction Tax documents', category: 'legal', userType: 'investor', required: false },

        // Common legal documents
        { type: 'legal_term_sheet', label: 'Term Sheet', description: 'Investment term sheet', category: 'legal', userType: 'both', required: false },
        { type: 'legal_shareholders_agreement', label: 'Shareholders Agreement', description: 'SHA with voting rights and clauses', category: 'legal', userType: 'both', required: false },
        { type: 'legal_share_subscription', label: 'Share Subscription Agreement', description: 'SSA for share issuance', category: 'legal', userType: 'both', required: false },
        { type: 'legal_voting_rights', label: 'Voting Rights Documents', description: 'Voting rights and board representation', category: 'legal', userType: 'both', required: false },
        { type: 'legal_rofr_agreements', label: 'ROFR Agreements', description: 'Right of First Refusal and Tag-along/Drag-along', category: 'legal', userType: 'both', required: false },
        { type: 'legal_ben_declarations', label: 'BEN Declarations', description: 'BEN-1/BEN-2 beneficial ownership declarations', category: 'legal', userType: 'both', required: true },
        { type: 'legal_sbo_register', label: 'SBO Register', description: 'Significant Beneficial Owners register', category: 'legal', userType: 'both', required: true },
        { type: 'legal_director_kyc', label: 'Director KYC', description: 'Director/Partner KYC (DIN, Aadhaar, Passport)', category: 'legal', userType: 'both', required: true },
        { type: 'legal_ubo_declaration', label: 'UBO Declaration', description: 'Ultimate Beneficial Owner declaration', category: 'legal', userType: 'both', required: true },
        { type: 'legal_loan_agreements', label: 'Loan Agreements', description: 'Inter-corporate loans and RPT disclosures', category: 'legal', userType: 'both', required: false },
        { type: 'legal_rpt_disclosures', label: 'RPT Disclosures', description: 'Related Party Transaction disclosures under Sec 185/186', category: 'legal', userType: 'both', required: false },
    ];

    private static otherDocuments: DocumentDefinition[] = [
        { type: 'pitch_deck', label: 'Pitch Deck', description: 'Presentation for potential investors', category: 'other', userType: 'startup', required: true },
        { type: 'miscellaneous', label: 'Miscellaneous', description: 'Other relevant documents', category: 'other', userType: 'both', required: false },
        { type: 'other', label: 'Other', description: 'General documents', category: 'other', userType: 'both', required: false },
    ];

    static getDocumentsByCategory(category: DocumentCategory): DocumentDefinition[] {
        switch (category) {
            case 'financial': return this.financialDocuments;
            case 'legal': return this.legalDocuments;
            case 'other': return this.otherDocuments;
            default: return [];
        }
    }

    static getAllDocuments(): DocumentDefinition[] {
        return [...this.financialDocuments, ...this.legalDocuments, ...this.otherDocuments];
    }

    static getDocumentDefinition(type: DocumentType): DocumentDefinition | undefined {
        return this.getAllDocuments().find(doc => doc.type === type);
    }
}

const DocumentUpload: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [userType, setUserType] = useState<'startup' | 'investor' | ''>('');

    // Form states
    const [description, setDescription] = useState('');
    const [documentType, setDocumentType] = useState<DocumentType>('other');
    const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>('other');
    const [timePeriod, setTimePeriod] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Dropdown states
    const [openDropdown, setOpenDropdown] = useState<DocumentCategory | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchDocuments();
        fetchUserType();
    }, []);

    const fetchUserType = async () => {
        try {
            const response = await profileService.getUserType();
            setUserType(response.userType);
        } catch (error) {
            console.error('Error fetching user type:', error);
            toast.error('Failed to determine user type');
        }
    };

    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            const docs = await profileService.getUserDocuments();
            setDocuments(docs);
        } catch (error) {
            toast.error('Failed to load documents');
            console.error('Error fetching documents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a file to upload');
            return;
        }

        try {
            setIsUploading(true);
            await profileService.uploadDocument(selectedFile, {
                description,
                documentType,
                category: selectedCategory,
                timePeriod,
                isPublic
            });

            toast.success('Document uploaded successfully');
            setUploadModalOpen(false);
            resetForm();
            fetchDocuments();
        } catch (error) {
            toast.error('Failed to upload document');
            console.error('Error uploading document:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (documentId: string) => {
        if (!confirm('Are you sure you want to delete this document?')) {
            return;
        }

        try {
            await profileService.deleteDocument(documentId);
            toast.success('Document deleted successfully');
            setDocuments(documents.filter(doc => doc.id !== documentId));
        } catch (error) {
            toast.error('Failed to delete document');
            console.error('Error deleting document:', error);
        }
    };

    const handleDownload = (documentId: string) => {
        window.open(profileService.getDocumentDownloadUrl(documentId), '_blank');
    };

    const resetForm = () => {
        setSelectedFile(null);
        setDescription('');
        setDocumentType('other');
        setSelectedCategory('other');
        setTimePeriod('');
        setIsPublic(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('presentation')) return '📊';
        if (fileType.includes('word')) return '📝';
        if (fileType.includes('image')) return '🖼️';
        return '📁';
    };

    const getCategoryIcon = (category: DocumentCategory) => {
        switch (category) {
            case 'financial': return <FiDollarSign className="text-green-600" />;
            case 'legal': return <FiShield className="text-blue-600" />;
            case 'other': return <FiPackage className="text-purple-600" />;
        }
    };

    const getCategoryColor = (category: DocumentCategory) => {
        switch (category) {
            case 'financial': return 'green';
            case 'legal': return 'blue';
            case 'other': return 'purple';
        }
    };

    const getDocumentsByCategory = (category: DocumentCategory) => {
        return documents.filter(doc => doc.category === category);
    };

    const openUploadModal = (category: DocumentCategory, docType?: DocumentType) => {
        setSelectedCategory(category);
        if (docType) {
            setDocumentType(docType);
        }
        setUploadModalOpen(true);
    };

    // SOLID Principle: Open/Closed - Easy to extend with new categories
    const CategorySection: React.FC<{ category: DocumentCategory; title: string }> = ({ category, title }) => {
        const categoryDocs = getDocumentsByCategory(category);
        const availableDocs = DocumentConfigService.getDocumentsByCategory(category)
            .filter(doc => doc.userType === userType || doc.userType === 'both');
        const color = getCategoryColor(category);
        const isOpen = openDropdown === category;

        return (
            <div className="mb-8">
                <motion.div
                    className={`bg-gradient-to-r from-${color}-50 to-white rounded-xl border border-${color}-200 shadow-lg overflow-hidden`}
                >
                    <div
                        className={`p-6 cursor-pointer bg-gradient-to-r from-${color}-100 to-${color}-50 border-b border-${color}-200`}
                        onClick={() => setOpenDropdown(isOpen ? null : category)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className={`w-12 h-12 rounded-full bg-${color}-100 flex items-center justify-center mr-4`}>
                                    {getCategoryIcon(category)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                                    <p className="text-sm text-gray-600">
                                        {categoryDocs.length} uploaded • {availableDocs.length} available types
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <motion.button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openUploadModal(category);
                                    }}
                                    className={`flex items-center px-4 py-2 bg-${color}-600 hover:bg-${color}-700 text-white rounded-lg shadow-md transition-all font-medium`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FiPlus className="mr-2" />
                                    Upload
                                </motion.button>
                                <motion.div
                                    animate={{ rotate: isOpen ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <FiChevronDown className="text-gray-600" />
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                        {availableDocs.map(docDef => {
                                            const hasDoc = documents.some(doc => doc.documentType === docDef.type);
                                            return (
                                                <motion.div
                                                    key={docDef.type}
                                                    className={`p-4 rounded-lg border transition-all cursor-pointer ${hasDoc
                                                            ? `bg-${color}-50 border-${color}-200`
                                                            : `bg-white border-gray-200 hover:border-${color}-300 hover:bg-${color}-25`
                                                        }`}
                                                    whileHover={{ scale: 1.02 }}
                                                    onClick={() => openUploadModal(category, docDef.type)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center mb-2">
                                                                <h4 className="text-sm font-medium text-gray-800">{docDef.label}</h4>
                                                                {docDef.required && (
                                                                    <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                                                        Required
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-600 mb-2">{docDef.description}</p>
                                                            {hasDoc && (
                                                                <div className="flex items-center text-xs text-green-600">
                                                                    <FiCheck className="mr-1" />
                                                                    Uploaded
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    {categoryDocs.length > 0 && (
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Documents</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {categoryDocs.map(doc => (
                                                    <motion.div
                                                        key={doc.id}
                                                        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                    >
                                                        <div className="p-4">
                                                            <div className="flex items-center mb-3">
                                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                                                    <div className="text-sm">{getFileIcon(doc.fileType)}</div>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="text-sm font-medium text-gray-800 truncate">{doc.originalName}</h3>
                                                                    <p className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</p>
                                                                </div>
                                                                <div className="ml-2">
                                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${doc.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                                        }`}>
                                                                        {doc.isPublic ? <FiEye className="mr-1" /> : <FiEyeOff className="mr-1" />}
                                                                        {doc.isPublic ? 'Public' : 'Private'}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                                                <div className="flex items-center space-x-2">
                                                                    <span className={`text-xs font-medium text-${color}-700 bg-${color}-50 px-2 py-1 rounded-md`}>
                                                                        {DocumentConfigService.getDocumentDefinition(doc.documentType)?.label || doc.documentType}
                                                                    </span>
                                                                    {doc.timePeriod && (
                                                                        <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                                                                            {doc.timePeriod}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex space-x-1">
                                                                    <button
                                                                        onClick={() => handleDownload(doc.id)}
                                                                        className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg"
                                                                        title="View & Download"
                                                                    >
                                                                        <FiEye size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedDocument(doc);
                                                                            setDescription(doc.description);
                                                                            setDocumentType(doc.documentType);
                                                                            setSelectedCategory(doc.category);
                                                                            setTimePeriod(doc.timePeriod || '');
                                                                            setIsPublic(doc.isPublic);
                                                                            setEditModalOpen(true);
                                                                        }}
                                                                        className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg"
                                                                        title="Edit"
                                                                    >
                                                                        <FiEdit size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(doc.id)}
                                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                                                        title="Delete"
                                                                    >
                                                                        <FiTrash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                        <FiFolder className="mr-3 text-indigo-600" />
                        Document Management
                    </h2>
                    <p className="text-gray-600 text-sm max-w-2xl">
                        Upload and manage your documents across Financial, Legal, and Other categories.
                        Click on each category to explore document types and upload files.
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <SimpleSpinner size="lg" />
                </div>
            ) : (
                <div>
                    <CategorySection category="financial" title="Financial Documents" />
                    <CategorySection category="legal" title="Legal Documents" />
                    <CategorySection category="other" title="Other Documents" />

                    {documents.length === 0 && (
                        <div className="text-center py-16 bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
                            <div className="w-20 h-20 mx-auto bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                                <FiFileText className="text-4xl text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">No documents yet</h3>
                            <p className="text-gray-600 max-w-md mx-auto mb-6 px-4">
                                Start by uploading documents in the Financial, Legal, or Other categories above.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Upload Modal */}
            <AnimatePresence>
                {uploadModalOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setUploadModalOpen(false)}
                    >
                        <motion.div
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={`px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-${getCategoryColor(selectedCategory)}-600 to-${getCategoryColor(selectedCategory)}-700`}>
                                <h3 className="text-lg font-semibold text-white">Upload Document</h3>
                                <button
                                    onClick={() => setUploadModalOpen(false)}
                                    className="text-white hover:text-gray-200"
                                >
                                    <FiX className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* File Upload */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Document *</label>
                                    <div
                                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${selectedFile ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-gray-500'
                                            }`}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {selectedFile ? (
                                            <div className="flex flex-col items-center">
                                                <FiFile className="text-3xl text-green-600 mb-2" />
                                                <span className="text-sm font-medium text-gray-800">{selectedFile.name}</span>
                                                <span className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <FiUpload className="text-2xl text-gray-600 mb-2" />
                                                <span className="text-sm font-medium text-gray-800">Click to select a file</span>
                                                <span className="text-xs text-gray-500">PDF, PPT, DOC, or image files (Max: 10MB)</span>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png"
                                    />
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Category *</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value as DocumentCategory)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="financial">Financial</option>
                                        <option value="legal">Legal</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                {/* Document Type */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Document Type *</label>
                                    <select
                                        value={documentType}
                                        onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        {DocumentConfigService.getDocumentsByCategory(selectedCategory)
                                            .filter(doc => doc.userType === userType || doc.userType === 'both')
                                            .map(doc => (
                                                <option key={doc.type} value={doc.type}>
                                                    {doc.label}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                {/* Time Period */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Time Period</label>
                                    <input
                                        type="text"
                                        value={timePeriod}
                                        onChange={(e) => setTimePeriod(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="e.g., Q1 2023, FY 2022"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        rows={3}
                                        placeholder="Brief description of this document"
                                    />
                                </div>

                                {/* Public Toggle */}
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        id="isPublic"
                                        checked={isPublic}
                                        onChange={(e) => setIsPublic(e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                    />
                                    <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                                        Make this document public
                                    </label>
                                </div>

                                {/* Upload Button */}
                                <button
                                    onClick={handleUpload}
                                    disabled={isUploading || !selectedFile}
                                    className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2 font-medium ${isUploading || !selectedFile
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : `bg-${getCategoryColor(selectedCategory)}-600 hover:bg-${getCategoryColor(selectedCategory)}-700 text-white`
                                        }`}
                                >
                                    {isUploading ? (
                                        <>
                                            <SimpleSpinner size="sm" color="text-white" />
                                            <span>Uploading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiUpload />
                                            <span>Upload Document</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {editModalOpen && selectedDocument && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setEditModalOpen(false)}
                    >
                        <motion.div
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-blue-600">
                                <h3 className="text-lg font-semibold text-white">Edit Document</h3>
                                <button
                                    onClick={() => setEditModalOpen(false)}
                                    className="text-white hover:text-gray-200"
                                >
                                    <FiX className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Document Info */}
                                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                                        <div className="text-2xl">{getFileIcon(selectedDocument.fileType)}</div>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-800">{selectedDocument.originalName}</h3>
                                        <span className="text-xs text-gray-500">{formatFileSize(selectedDocument.fileSize)}</span>
                                    </div>
                                </div>

                                {/* Similar form fields as upload modal but for editing */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Category *</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value as DocumentCategory)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="financial">Financial</option>
                                        <option value="legal">Legal</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Document Type *</label>
                                    <select
                                        value={documentType}
                                        onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        {DocumentConfigService.getDocumentsByCategory(selectedCategory)
                                            .filter(doc => doc.userType === userType || doc.userType === 'both')
                                            .map(doc => (
                                                <option key={doc.type} value={doc.type}>
                                                    {doc.label}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Time Period</label>
                                    <input
                                        type="text"
                                        value={timePeriod}
                                        onChange={(e) => setTimePeriod(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="e.g., Q1 2023, FY 2022"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        rows={3}
                                        placeholder="Brief description of this document"
                                    />
                                </div>

                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        id="editIsPublic"
                                        checked={isPublic}
                                        onChange={(e) => setIsPublic(e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                                    />
                                    <label htmlFor="editIsPublic" className="text-sm font-medium text-gray-700">
                                        Make this document public
                                    </label>
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        onClick={() => setEditModalOpen(false)}
                                        className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            try {
                                                await profileService.updateDocumentMetadata(selectedDocument.id, {
                                                    description,
                                                    documentType,
                                                    category: selectedCategory,
                                                    timePeriod,
                                                    isPublic
                                                });
                                                toast.success('Document updated successfully');
                                                setEditModalOpen(false);
                                                fetchDocuments();
                                            } catch (error) {
                                                toast.error('Failed to update document');
                                            }
                                        }}
                                        className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center"
                                    >
                                        <FiCheck className="mr-2" />
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DocumentUpload;

// Enhanced Document Upload System with Individual File Customization
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiUpload, FiFile, FiTrash2, FiDownload, FiEye, FiEyeOff,
    FiEdit, FiX, FiCheck, FiFileText, FiFolder, FiChevronDown,
    FiDollarSign, FiShield, FiPackage, FiPlus, FiSave, FiGrid,
    FiList, FiRotateCcw, FiSettings
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { profileService } from '../../services/api';
import SimpleSpinner from '../SimpleSpinner';

// Enhanced Types for Multi-File Upload with Individual Customization
type DocumentCategory = 'financial' | 'legal' | 'other';

type GeneralDocumentType = 'pitch_deck' | 'other' | 'miscellaneous';

type FinancialDocumentType =
    'financial_balance_sheet' | 'financial_income_statement' | 'financial_cash_flow' |
    'financial_tax_returns' | 'financial_audit_report' | 'financial_gst_returns' |
    'financial_bank_statements' | 'financial_projections' | 'financial_valuation_report' |
    'financial_cap_table' | 'financial_funding_history' | 'financial_debt_schedule';

type LegalDocumentType =
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
    'legal_aif_registration' | 'legal_firc_copies' | 'legal_fc_gpr' | 'legal_fla_returns' |
    'legal_odi_documents' | 'legal_ppm' | 'legal_investment_strategy' | 'legal_capital_commitments' |
    'legal_trc' | 'legal_fatca_crs' | 'legal_dtaa_applications' | 'legal_stt_documents' |
    'legal_term_sheet' | 'legal_shareholders_agreement' | 'legal_share_subscription' |
    'legal_voting_rights' | 'legal_rofr_agreements' | 'legal_ben_declarations' |
    'legal_sbo_register' | 'legal_director_kyc' | 'legal_ubo_declaration' |
    'legal_loan_agreements' | 'legal_rpt_disclosures';

type DocumentType = GeneralDocumentType | FinancialDocumentType | LegalDocumentType;

// Enhanced interface for individual file customization
interface FileWithMetadata {
    id: string;
    file: File;
    originalName: string;
    customName: string;
    documentType: DocumentType;
    category: DocumentCategory;
    description: string;
    timePeriod: string;
    isPublic: boolean;
    progress?: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    errorMessage?: string;
}

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

interface DocumentDefinition {
    type: DocumentType;
    label: string;
    description: string;
    category: DocumentCategory;
    userType: 'startup' | 'investor' | 'both';
    required: boolean;
}

// Enhanced Document Configuration Service with Custom Types
class EnhancedDocumentConfigService {
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
        { type: 'legal_incorporation_certificate', label: 'Certificate of Incorporation', description: 'Official certificate of company incorporation', category: 'legal', userType: 'startup', required: true },
        { type: 'legal_moa_aoa', label: 'Memorandum & Articles of Association', description: 'MoA/AoA or LLP Agreement', category: 'legal', userType: 'startup', required: true },
        { type: 'legal_pan_tan_gst', label: 'PAN, TAN, GST Certificates', description: 'Tax registration certificates', category: 'legal', userType: 'both', required: true },
        { type: 'legal_board_resolutions', label: 'Board Resolutions', description: 'Minutes of Board & General Meetings', category: 'legal', userType: 'startup', required: true },
        { type: 'legal_statutory_registers', label: 'Statutory Registers', description: 'Directors, Shareholders, Charges registers', category: 'legal', userType: 'startup', required: true },
        { type: 'legal_annual_filings', label: 'Annual Filings', description: 'MCA Master Data & Annual Filing copies (AOC-4, MGT-7)', category: 'legal', userType: 'startup', required: true },
        // Add more legal documents as needed
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

const EnhancedDocumentUpload: React.FC = () => {
    // State Management
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userType, setUserType] = useState<'startup' | 'investor' | ''>('');

    // Multi-file upload state
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>('other');
    const [filesWithMetadata, setFilesWithMetadata] = useState<FileWithMetadata[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [currentUploadingIndex, setCurrentUploadingIndex] = useState(-1);

    // UI State
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [openDropdown, setOpenDropdown] = useState<DocumentCategory | null>(null);
    const [editingFileId, setEditingFileId] = useState<string | null>(null);

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

    // Enhanced file selection with individual customization
    const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        const newFilesWithMetadata: FileWithMetadata[] = files.map((file, index) => ({
            id: `file_${Date.now()}_${index}`,
            file,
            originalName: file.name,
            customName: file.name.split('.')[0], // Remove extension for editing
            documentType: 'other' as DocumentType,
            category: selectedCategory,
            description: '',
            timePeriod: '',
            isPublic: false,
            status: 'pending' as const
        }));

        setFilesWithMetadata(prev => [...prev, ...newFilesWithMetadata]);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Individual file metadata update
    const updateFileMetadata = (fileId: string, updates: Partial<FileWithMetadata>) => {
        setFilesWithMetadata(prev =>
            prev.map(fileData =>
                fileData.id === fileId
                    ? { ...fileData, ...updates }
                    : fileData
            )
        );
    };

    // Remove file from upload queue
    const removeFile = (fileId: string) => {
        setFilesWithMetadata(prev => prev.filter(file => file.id !== fileId));
    };

    // Enhanced upload handler with progress tracking
    const handleBatchUpload = async () => {
        if (filesWithMetadata.length === 0) {
            toast.error('Please select files to upload');
            return;
        }

        // Validate all files have required metadata
        const invalidFiles = filesWithMetadata.filter(file =>
            !file.customName.trim() || !file.documentType
        );

        if (invalidFiles.length > 0) {
            toast.error('Please provide names and document types for all files');
            return;
        }

        setIsUploading(true);
        let successCount = 0;
        let errorCount = 0;

        try {
            for (let i = 0; i < filesWithMetadata.length; i++) {
                const fileData = filesWithMetadata[i];
                setCurrentUploadingIndex(i);

                // Update status to uploading
                updateFileMetadata(fileData.id, {
                    status: 'uploading',
                    progress: 0
                });

                try {
                    // Create a new file with custom name
                    const fileExtension = fileData.file.name.split('.').pop() || '';
                    const customFile = new File(
                        [fileData.file],
                        `${fileData.customName}.${fileExtension}`,
                        { type: fileData.file.type }
                    );

                    await profileService.uploadDocument(customFile, {
                        description: fileData.description,
                        documentType: fileData.documentType,
                        category: fileData.category,
                        timePeriod: fileData.timePeriod,
                        isPublic: fileData.isPublic
                    });

                    updateFileMetadata(fileData.id, {
                        status: 'completed',
                        progress: 100
                    });
                    successCount++;

                } catch (error) {
                    console.error(`Error uploading ${fileData.customName}:`, error);
                    updateFileMetadata(fileData.id, {
                        status: 'error',
                        errorMessage: 'Upload failed',
                        progress: 0
                    });
                    errorCount++;
                }
            }

            // Show results
            if (successCount > 0) {
                toast.success(`${successCount} document(s) uploaded successfully!`);
            }
            if (errorCount > 0) {
                toast.error(`${errorCount} document(s) failed to upload`);
            }

            // Refresh document list
            await fetchDocuments();

            // Clear successful uploads
            if (successCount === filesWithMetadata.length) {
                setFilesWithMetadata([]);
                setIsUploadModalOpen(false);
            } else {
                // Keep only failed uploads
                setFilesWithMetadata(prev =>
                    prev.filter(file => file.status === 'error')
                );
            }

        } finally {
            setIsUploading(false);
            setCurrentUploadingIndex(-1);
        }
    };

    // Utility functions
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

    const openUploadModal = (category: DocumentCategory) => {
        setSelectedCategory(category);
        setIsUploadModalOpen(true);
        setFilesWithMetadata([]);
    };

    const closeUploadModal = () => {
        setIsUploadModalOpen(false);
        setFilesWithMetadata([]);
        setEditingFileId(null);
    };

    // Enhanced File Customization Component
    const FileCustomizationCard: React.FC<{ fileData: FileWithMetadata }> = ({ fileData }) => {
        const isEditing = editingFileId === fileData.id;
        const availableDocTypes = EnhancedDocumentConfigService.getDocumentsByCategory(fileData.category)
            .filter(doc => doc.userType === userType || doc.userType === 'both');

        return (
            <motion.div
                className={`border-2 rounded-xl p-4 transition-all ${fileData.status === 'completed' ? 'border-green-300 bg-green-50' :
                        fileData.status === 'error' ? 'border-red-300 bg-red-50' :
                            fileData.status === 'uploading' ? 'border-blue-300 bg-blue-50' :
                                'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
            >
                {/* File Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <span className="text-lg">{getFileIcon(fileData.file.type)}</span>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-800">{fileData.originalName}</h4>
                            <p className="text-sm text-gray-500">{formatFileSize(fileData.file.size)}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {fileData.status === 'pending' && (
                            <button
                                onClick={() => setEditingFileId(isEditing ? null : fileData.id)}
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title={isEditing ? "Cancel editing" : "Edit details"}
                            >
                                {isEditing ? <FiX className="w-4 h-4" /> : <FiEdit className="w-4 h-4" />}
                            </button>
                        )}
                        {fileData.status === 'pending' && (
                            <button
                                onClick={() => removeFile(fileData.id)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove file"
                            >
                                <FiTrash2 className="w-4 h-4" />
                            </button>
                        )}
                        {fileData.status === 'completed' && (
                            <div className="text-green-600">
                                <FiCheck className="w-5 h-5" />
                            </div>
                        )}
                        {fileData.status === 'error' && (
                            <button
                                onClick={() => updateFileMetadata(fileData.id, { status: 'pending' })}
                                className="p-2 text-red-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Retry upload"
                            >
                                <FiRotateCcw className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Upload Progress */}
                {fileData.status === 'uploading' && fileData.progress !== undefined && (
                    <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Uploading...</span>
                            <span>{fileData.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${fileData.progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {fileData.status === 'error' && fileData.errorMessage && (
                    <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">
                        {fileData.errorMessage}
                    </div>
                )}

                {/* File Customization Form */}
                {(isEditing || fileData.status === 'pending') && (
                    <div className="space-y-3 pt-3 border-t border-gray-200">
                        {/* Custom Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Custom Name *
                            </label>
                            <input
                                type="text"
                                value={fileData.customName}
                                onChange={(e) => updateFileMetadata(fileData.id, { customName: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter custom name for this document"
                            />
                        </div>

                        {/* Document Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Document Type *
                            </label>
                            <select
                                value={fileData.documentType}
                                onChange={(e) => updateFileMetadata(fileData.id, { documentType: e.target.value as DocumentType })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Select document type...</option>
                                {availableDocTypes.map(docType => (
                                    <option key={docType.type} value={docType.type}>
                                        {docType.label} {docType.required ? '*' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                value={fileData.category}
                                onChange={(e) => updateFileMetadata(fileData.id, {
                                    category: e.target.value as DocumentCategory,
                                    documentType: 'other' // Reset document type when category changes
                                })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="financial">Financial</option>
                                <option value="legal">Legal</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={fileData.description}
                                onChange={(e) => updateFileMetadata(fileData.id, { description: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows={2}
                                placeholder="Brief description of this document"
                            />
                        </div>

                        {/* Time Period */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Time Period
                            </label>
                            <input
                                type="text"
                                value={fileData.timePeriod}
                                onChange={(e) => updateFileMetadata(fileData.id, { timePeriod: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., Q1 2023, FY 2022"
                            />
                        </div>

                        {/* Public Toggle */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id={`public_${fileData.id}`}
                                checked={fileData.isPublic}
                                onChange={(e) => updateFileMetadata(fileData.id, { isPublic: e.target.checked })}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`public_${fileData.id}`} className="text-sm text-gray-700">
                                Make this document public
                            </label>
                        </div>
                    </div>
                )}

                {/* Minimal display for non-editing files */}
                {!isEditing && fileData.status === 'pending' && (
                    <div className="pt-3 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span className="text-gray-500">Name:</span>
                                <div className="font-medium">{fileData.customName || 'Not set'}</div>
                            </div>
                            <div>
                                <span className="text-gray-500">Type:</span>
                                <div className="font-medium">
                                    {fileData.documentType
                                        ? EnhancedDocumentConfigService.getDocumentDefinition(fileData.documentType)?.label || fileData.documentType
                                        : 'Not set'
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        );
    };

    // Category Section Component
    const CategorySection: React.FC<{ category: DocumentCategory; title: string }> = ({ category, title }) => {
        const categoryDocs = documents.filter(doc => doc.category === category);
        const availableDocs = EnhancedDocumentConfigService.getDocumentsByCategory(category)
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
                                    Upload Multiple
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
                                    {/* Available Document Types */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                        {availableDocs.map(docDef => {
                                            const hasDoc = documents.some(doc => doc.documentType === docDef.type);
                                            return (
                                                <motion.div
                                                    key={docDef.type}
                                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${hasDoc
                                                            ? `bg-${color}-50 border-${color}-200`
                                                            : `bg-white border-gray-200 hover:border-${color}-300 hover:bg-${color}-25`
                                                        }`}
                                                    whileHover={{ scale: 1.02 }}
                                                    onClick={() => openUploadModal(category)}
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
                                                        <div className="ml-2">
                                                            <FiPlus className="text-gray-400" size={16} />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    {/* Uploaded Documents in this category */}
                                    {categoryDocs.length > 0 && (
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Documents</h4>
                                            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 gap-4' : 'grid-cols-1 gap-2'}`}>
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
                                                                        {EnhancedDocumentConfigService.getDocumentDefinition(doc.documentType)?.label || doc.documentType}
                                                                    </span>
                                                                    {doc.timePeriod && (
                                                                        <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md">
                                                                            {doc.timePeriod}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex space-x-1">
                                                                    <button
                                                                        onClick={() => window.open(profileService.getDocumentDownloadUrl(doc.id), '_blank')}
                                                                        className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg"
                                                                        title="View & Download"
                                                                    >
                                                                        <FiEye size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            // Handle edit existing document
                                                                        }}
                                                                        className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg"
                                                                        title="Edit"
                                                                    >
                                                                        <FiEdit size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={async () => {
                                                                            if (confirm('Are you sure you want to delete this document?')) {
                                                                                try {
                                                                                    await profileService.deleteDocument(doc.id);
                                                                                    toast.success('Document deleted successfully');
                                                                                    fetchDocuments();
                                                                                } catch (error) {
                                                                                    toast.error('Failed to delete document');
                                                                                }
                                                                            }
                                                                        }}
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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                        <FiFolder className="mr-3 text-indigo-600" />
                        Enhanced Document Management
                    </h2>
                    <p className="text-gray-600 text-sm max-w-2xl">
                        Upload multiple documents with individual customization. Rename files, assign categories,
                        and provide metadata for each document separately.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        className="flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        {viewMode === 'grid' ? <FiList className="w-4 h-4" /> : <FiGrid className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <SimpleSpinner size="lg" />
                </div>
            ) : (
                <div>
                    {/* Category Sections */}
                    <CategorySection category="financial" title="Financial Documents" />
                    <CategorySection category="legal" title="Legal Documents" />
                    <CategorySection category="other" title="Other Documents" />

                    {/* All Documents Summary */}
                    {documents.length > 0 && (
                        <div className="mt-8">
                            <div className="flex items-center mb-6">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                                    <FiFileText className="text-indigo-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">All Uploaded Documents ({documents.length})</h3>
                            </div>
                            <div className="text-center py-8 text-gray-500">
                                <p>View all documents by expanding the categories above</p>
                            </div>
                        </div>
                    )}

                    {documents.length === 0 && (
                        <div className="text-center py-16 bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm">
                            <div className="w-20 h-20 mx-auto bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                                <FiFileText className="text-4xl text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">No documents yet</h3>
                            <p className="text-gray-600 max-w-md mx-auto mb-6 px-4">
                                Start by uploading documents in the Financial, Legal, or Other categories above.
                                You can upload multiple files and customize each one individually.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Enhanced Multi-File Upload Modal */}
            <AnimatePresence>
                {isUploadModalOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeUploadModal}
                    >
                        <motion.div
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className={`px-6 py-4 bg-gradient-to-r from-${getCategoryColor(selectedCategory)}-600 to-${getCategoryColor(selectedCategory)}-700 text-white`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-3">
                                            {getCategoryIcon(selectedCategory)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold">Upload {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Documents</h3>
                                            <p className="text-sm opacity-90">Select multiple files and customize each one individually</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={closeUploadModal}
                                        className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                                    >
                                        <FiX className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto">
                                <div className="p-6">
                                    {/* File Selection Area */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Select Files
                                        </label>
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-lg font-medium text-gray-700 mb-2">
                                                Choose files to upload
                                            </p>
                                            <p className="text-sm text-gray-500 mb-4">
                                                Support for multiple files. PDF, DOC, XLS, Images (Max 10MB per file)
                                            </p>
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <FiPlus className="w-4 h-4 mr-2" />
                                                Select Files
                                            </button>
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                                            onChange={handleFileSelection}
                                            className="hidden"
                                        />
                                    </div>

                                    {/* Selected Files with Individual Customization */}
                                    {filesWithMetadata.length > 0 && (
                                        <div className="mb-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-lg font-semibold text-gray-800">
                                                    Selected Files ({filesWithMetadata.length})
                                                </h4>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => setEditingFileId(null)}
                                                        className="text-sm text-gray-600 hover:text-gray-800"
                                                    >
                                                        Collapse All
                                                    </button>
                                                    <button
                                                        onClick={() => setFilesWithMetadata([])}
                                                        className="text-sm text-red-600 hover:text-red-800"
                                                    >
                                                        Remove All
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                                <AnimatePresence>
                                                    {filesWithMetadata.map(fileData => (
                                                        <FileCustomizationCard
                                                            key={fileData.id}
                                                            fileData={fileData}
                                                        />
                                                    ))}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer */}
                            {filesWithMetadata.length > 0 && (
                                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-600">
                                            {filesWithMetadata.filter(f => f.status === 'completed').length} of {filesWithMetadata.length} files uploaded
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={closeUploadModal}
                                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleBatchUpload}
                                                disabled={
                                                    isUploading ||
                                                    filesWithMetadata.filter(f => f.status === 'pending').length === 0 ||
                                                    filesWithMetadata.some(f => f.status === 'pending' && (!f.customName.trim() || !f.documentType))
                                                }
                                                className={`px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors ${isUploading ||
                                                        filesWithMetadata.filter(f => f.status === 'pending').length === 0 ||
                                                        filesWithMetadata.some(f => f.status === 'pending' && (!f.customName.trim() || !f.documentType))
                                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                                        : `bg-${getCategoryColor(selectedCategory)}-600 hover:bg-${getCategoryColor(selectedCategory)}-700 text-white`
                                                    }`}
                                            >
                                                {isUploading ? (
                                                    <>
                                                        <SimpleSpinner size="sm" color="text-white" />
                                                        <span>
                                                            Uploading... ({currentUploadingIndex + 1}/{filesWithMetadata.length})
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiUpload className="w-4 h-4" />
                                                        <span>
                                                            Upload {filesWithMetadata.filter(f => f.status === 'pending').length} Files
                                                        </span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EnhancedDocumentUpload;

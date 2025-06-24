import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiUpload,
    FiFile,
    FiTrash2,
    FiEdit3,
    FiCheck,
    FiX,
    FiEye,
    FiEyeOff,
    FiDownload,
    FiPlus,
    FiFolder,
    FiInfo,
    FiAlertCircle,
    FiInbox,
    FiLock,
    FiUnlock
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { profileService } from '../../services/api';
import { truncateUploadName } from '../../utils/documentNameUtils';
import { sanitizeUserInput } from '../../utils/security';
import { validateDocumentMetadata, hasSuspiciousContent } from '../../utils/validation';

// Document type definitions based on backend schema
const DOCUMENT_CATEGORIES = {
    financial: 'Financial',
    legal: 'Legal',
    other: 'Other'
} as const;

// Document type definitions with label for display and value for backend enum
const FINANCIAL_DOCUMENT_TYPES = [
    { label: 'Financial Statements', value: 'other' }, // Mapped to 'other' as no direct backend enum
    { label: 'Balance Sheet', value: 'financial_balance_sheet' },
    { label: 'Income Statement', value: 'financial_income_statement' },
    { label: 'Cash Flow Statement', value: 'financial_cash_flow' },
    { label: 'Budget and Forecast', value: 'financial_projections' },
    { label: 'Revenue Projections', value: 'financial_projections' },
    { label: 'Expense Reports', value: 'other' },
    { label: 'Tax Returns', value: 'financial_tax_returns' },
    { label: 'Bank Statements', value: 'financial_bank_statements' },
    { label: 'Audit Reports', value: 'financial_audit_report' },
    { label: 'Investment Records', value: 'other' },
    { label: 'Funding History', value: 'financial_funding_history' },
    { label: 'Valuation Reports', value: 'financial_valuation_report' },
    { label: 'Financial Due Diligence Reports', value: 'other' },
    { label: 'Cost Structure Analysis', value: 'other' },
    { label: 'Unit Economics', value: 'other' },
    { label: 'KPI Dashboard', value: 'other' },
    { label: 'Monthly/Quarterly Reports', value: 'other' }
];

const LEGAL_DOCUMENT_TYPES = [
    { label: 'Articles of Incorporation', value: 'legal_incorporation_certificate' },
    { label: 'Bylaws', value: 'legal_moa_aoa' },
    { label: 'Operating Agreement', value: 'legal_llp_agreement' },
    { label: 'Shareholder Agreements', value: 'legal_sha_ssa' },
    { label: 'Stock Certificates', value: 'legal_share_certificates' },
    { label: 'Cap Table', value: 'legal_cap_table_legal' },
    { label: 'Board Resolutions', value: 'legal_board_resolutions' },
    { label: 'Contracts and Agreements', value: 'other' },
    { label: 'Employment Agreements', value: 'legal_employment_agreements' },
    { label: 'Non-Disclosure Agreements', value: 'legal_nda_agreements' },
    { label: 'Intellectual Property Documents', value: 'other' },
    { label: 'Patents and Trademarks', value: 'legal_patent_filings' },
    { label: 'Licenses and Permits', value: 'legal_government_licenses' },
    { label: 'Compliance Documents', value: 'other' },
    { label: 'Legal Opinions', value: 'other' },
    { label: 'Litigation Records', value: 'legal_litigation_details' },
    { label: 'Insurance Policies', value: 'other' },
    { label: 'Terms of Service', value: 'legal_website_policies' },
    { label: 'Privacy Policy', value: 'legal_website_policies' }
];

const OTHER_DOCUMENT_TYPES = [
    { label: 'Business Plan', value: 'pitch_deck' },
    { label: 'Pitch Deck', value: 'pitch_deck' },
    { label: 'Executive Summary', value: 'other' },
    { label: 'Market Research', value: 'other' },
    { label: 'Product Documentation', value: 'other' },
    { label: 'Technical Specifications', value: 'other' },
    { label: 'User Manuals', value: 'other' },
    { label: 'Marketing Materials', value: 'other' },
    { label: 'Press Releases', value: 'other' },
    { label: 'Meeting Minutes', value: 'other' },
    { label: 'Reports', value: 'other' },
    { label: 'Presentations', value: 'other' },
    { label: 'Spreadsheets', value: 'other' },
    { label: 'Images', value: 'other' },
    { label: 'Videos', value: 'other' },
    { label: 'Other', value: 'other' }
];

const TIME_PERIODS = [
    'Current',
    'Q1 2024',
    'Q2 2024',
    'Q3 2024',
    'Q4 2024',
    'Q1 2025',
    'Q2 2025',
    '2023',
    '2024',
    '2025',
    'Historical',
    'Projected'
];

interface FileWithMetadata {
    id: string;
    file: File;
    category: keyof typeof DOCUMENT_CATEGORIES;
    documentType: string;
    timePeriod?: string;
    description: string;
    isPublic: boolean;
    uploadProgress: number;
    isUploading: boolean;
    isUploaded: boolean;
    error?: string;
    editMode: boolean;
}

interface ExistingDocument {
    _id?: string;
    id?: string;
    fileName: string;
    originalName: string;
    category: string;
    documentType: string;
    timePeriod?: string;
    description?: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
    fileSize: number;
    size: number;
    filePath: string;
}

const ComprehensiveDocumentUpload: React.FC = () => {
    const [files, setFiles] = useState<FileWithMetadata[]>([]);
    const [existingDocuments, setExistingDocuments] = useState<ExistingDocument[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<keyof typeof DOCUMENT_CATEGORIES>('financial');
    const [bulkMetadata, setBulkMetadata] = useState({
        category: 'financial' as keyof typeof DOCUMENT_CATEGORIES,
        documentType: '',
        timePeriod: '',
        isPublic: false
    });
    const [editingDocument, setEditingDocument] = useState<ExistingDocument | null>(null);
    const [editForm, setEditForm] = useState({
        description: '',
        documentType: '',
        timePeriod: '',
        isPublic: false
    });
    const [documentToDelete, setDocumentToDelete] = useState<ExistingDocument | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load existing documents on component mount
    React.useEffect(() => {
        loadExistingDocuments();
    }, []);

    // Update bulk metadata when selected category changes
    React.useEffect(() => {
        setBulkMetadata(prev => ({
            ...prev,
            category: selectedCategory,
            documentType: ''
        }));
    }, [selectedCategory]);

    const loadExistingDocuments = async () => {
        setIsLoading(true);
        try {
            const documentsFromServer = await profileService.getUserDocuments();

            if (!Array.isArray(documentsFromServer)) {
                console.error("Loaded documents is not an array:", documentsFromServer);
                toast.error("Failed to load documents: Invalid data format.");
                setExistingDocuments([]);
                setIsLoading(false);
                return;
            }

            const processedDocuments = documentsFromServer.map((doc: any) => {
                const newDoc = {
                    _id: doc._id,
                    id: doc.id,
                    fileName: doc.fileName,
                    originalName: doc.originalName || doc.fileName,
                    category: doc.category,
                    documentType: doc.documentType,
                    timePeriod: doc.timePeriod,
                    description: doc.description,
                    isPublic: doc.isPublic,
                    createdAt: doc.createdAt,
                    updatedAt: doc.updatedAt,
                    fileSize: doc.fileSize || doc.size,
                    size: doc.size || doc.fileSize,
                    filePath: doc.filePath,
                };
                if (!newDoc._id && !newDoc.id) {
                    console.warn("Document loaded from server is missing an ID. Full document object:", doc);
                }
                return newDoc as ExistingDocument;
            });
            setExistingDocuments(processedDocuments);
        } catch (error) {
            console.error('Error loading documents:', error);
            toast.error('Failed to load existing documents');
        } finally {
            setIsLoading(false);
        }
    };

    const getDocumentTypesByCategory = (category: keyof typeof DOCUMENT_CATEGORIES) => {
        switch (category) {
            case 'financial':
                return FINANCIAL_DOCUMENT_TYPES;
            case 'legal':
                return LEGAL_DOCUMENT_TYPES;
            case 'other':
                return OTHER_DOCUMENT_TYPES;
            default:
                return [];
        }
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFiles(droppedFiles);
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        handleFiles(selectedFiles);
    };

    const handleFiles = (selectedFiles: File[]) => {
        const newFiles: FileWithMetadata[] = selectedFiles.map(file => ({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            category: bulkMetadata.category,
            documentType: bulkMetadata.documentType || (getDocumentTypesByCategory(bulkMetadata.category)[0]?.value || 'other'),
            timePeriod: bulkMetadata.timePeriod,
            description: '',
            isPublic: bulkMetadata.isPublic,
            uploadProgress: 0,
            isUploading: false,
            isUploaded: false,
            editMode: true
        }));

        setFiles(prev => [...prev, ...newFiles]);
    }; const updateFileMetadata = (fileId: string, updates: Partial<FileWithMetadata>) => {
        // Validate and sanitize text inputs
        const sanitizedUpdates = { ...updates };

        if (updates.description && typeof updates.description === 'string') {
            // Check for suspicious content
            if (hasSuspiciousContent(updates.description)) {
                toast.error('Invalid description content detected');
                return;
            }
            // Validate using document metadata validation
            const validation = validateDocumentMetadata({
                description: updates.description,
                documentType: 'other', // default
                category: 'other',
                timePeriod: ''
            });

            if (!validation.isValid) {
                toast.error(validation.errors[0].message);
                return;
            }

            sanitizedUpdates.description = sanitizeUserInput(updates.description);
        }

        if (updates.documentType && typeof updates.documentType === 'string') {
            sanitizedUpdates.documentType = sanitizeUserInput(updates.documentType);
        }

        if (updates.timePeriod && typeof updates.timePeriod === 'string') {
            sanitizedUpdates.timePeriod = sanitizeUserInput(updates.timePeriod);
        }

        setFiles(prev => prev.map(file =>
            file.id === fileId ? { ...file, ...sanitizedUpdates } : file
        ));
    };

    const removeFile = (fileId: string) => {
        setFiles(prev => prev.filter(file => file.id !== fileId));
    };

    const uploadFile = async (fileData: FileWithMetadata) => {
        try {
            updateFileMetadata(fileData.id, { isUploading: true, error: undefined });
            const progressInterval = setInterval(() => {
                setFiles(prev => prev.map(file =>
                    file.id === fileData.id
                        ? { ...file, uploadProgress: Math.min((file.uploadProgress || 0) + Math.random() * 20, 85) }
                        : file
                ));
            }, 200);

            const response = await profileService.uploadDocument(fileData.file, {
                category: fileData.category,
                documentType: fileData.documentType,
                description: fileData.description,
                isPublic: fileData.isPublic,
                timePeriod: fileData.timePeriod
            });

            clearInterval(progressInterval);
            updateFileMetadata(fileData.id, {
                isUploading: false,
                isUploaded: true,
                uploadProgress: 100,
                editMode: false
            });

            toast.success(`${fileData.file.name} uploaded successfully`);

            await loadExistingDocuments();

        } catch (error: any) {
            console.error('Upload error:', error);
            updateFileMetadata(fileData.id, {
                isUploading: false,
                error: error.response?.data?.message || 'Upload failed'
            });
            toast.error(`Failed to upload ${fileData.file.name}`);
        }
    };

    const uploadAllFiles = async () => {
        const pendingFiles = files.filter(file => !file.isUploaded && !file.isUploading);

        if (pendingFiles.length === 0) {
            toast.error('No files to upload');
            return;
        }

        const invalidFilesDetails = pendingFiles
            .map(file => {
                const missingFields = [];
                if (!file.documentType) missingFields.push("Document Type");
                if (!file.description.trim()) missingFields.push("Description");
                return { name: file.file.name, missing: missingFields, id: file.id };
            })
            .filter(fileDetail => fileDetail.missing.length > 0);

        if (invalidFilesDetails.length > 0) {
            const errorMessages = invalidFilesDetails.map(fileDetail =>
                `${fileDetail.name} is missing: ${fileDetail.missing.join(', ')}`
            );
            toast.error(`Please complete required fields for all files:\n${errorMessages.join('\n')}`, { duration: 6000 });
            setFiles(prevFiles => prevFiles.map(pf => {
                if (invalidFilesDetails.find(ifd => ifd.id === pf.id)) {
                    return { ...pf, editMode: true };
                }
                return pf;
            }));
        }

        setIsLoading(true);

        try {
            for (const file of pendingFiles) {
                await uploadFile(file);
            }

            toast.success(`Successfully uploaded ${pendingFiles.length} files`);

            setTimeout(() => {
                setFiles(prev => prev.filter(file => !file.isUploaded));
            }, 2000);

        } catch (error) {
            console.error('Bulk upload error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getDocumentId = (document: ExistingDocument): string => {
        return document._id || document.id || '';
    };

    const isValidDocumentId = (document: ExistingDocument): boolean => {
        const docId = getDocumentId(document);
        return docId && docId !== 'undefined' && docId !== 'null' && docId.trim() !== '';
    };

    const deleteExistingDocument = async (documentId: string | undefined) => {
        if (!documentId) {
            console.error("deleteExistingDocument called with invalid ID:", documentId);
            return;
        }
        try {
            await profileService.deleteDocument(documentId);
            setExistingDocuments(prev => prev.filter(doc => getDocumentId(doc) !== documentId)); // Use getDocumentId for consistency
            setDocumentToDelete(null);
            toast.success('Document deleted successfully');
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete document');
        }
    };

    const handleDeleteClick = (document: ExistingDocument) => {
        if (!isValidDocumentId(document)) {
            toast.error("Cannot delete document: ID is missing or invalid.");
            console.error("Attempted to initiate delete for document with invalid ID:", JSON.stringify(document));
            return;
        }
        setDocumentToDelete(document);
    };

    const confirmDelete = () => {
        if (documentToDelete) {
            const docId = getDocumentId(documentToDelete);
            if (!docId) {
                toast.error("Cannot delete document: ID is missing or invalid.");
                console.error("Confirm delete for document with invalid ID:", JSON.stringify(documentToDelete));
                setDocumentToDelete(null);
                return;
            }
            deleteExistingDocument(docId);
        }
        setDocumentToDelete(null);
    };

    const cancelDelete = () => {
        setDocumentToDelete(null);
    };

    const downloadDocument = async (doc: ExistingDocument) => { // Renamed parameter to avoid conflict
        if (!isValidDocumentId(doc)) {
            toast.error("Cannot download document: ID is missing or invalid.");
            console.error("Attempted to download document with invalid ID:", JSON.stringify(doc));
            return;
        }
        const docId = getDocumentId(doc);
        try {
            // Use getDocumentDownloadUrl from profileService and open in a new tab
            const url = profileService.getDocumentDownloadUrl(docId);
            window.open(url, '_blank');
            // No need to revokeObjectURL as we are not creating one here
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Failed to download document.");
        }
    };

    const handleEditDocument = (document: ExistingDocument) => {
        if (!isValidDocumentId(document)) {
            toast.error("Cannot edit document: ID is missing or invalid.");
            console.error("Attempted to edit document with invalid ID:", JSON.stringify(document));
            return;
        }
        setEditingDocument(document);
        setEditForm({
            description: document.description || '',
            documentType: document.documentType,
            timePeriod: document.timePeriod || '',
            isPublic: document.isPublic
        });
    };

    const handleSaveEdit = async () => {
        if (!editingDocument) return;

        if (!isValidDocumentId(editingDocument)) {
            toast.error("Cannot save changes: Document ID is missing or invalid.");
            console.error("Attempted to save edit for document with invalid ID:", JSON.stringify(editingDocument));
            return;
        }
        const docId = getDocumentId(editingDocument);

        try {
            const updatedDocFromServer = await profileService.updateDocumentMetadata(docId, {
                description: editForm.description,
                documentType: editForm.documentType,
                timePeriod: editForm.timePeriod,
                isPublic: editForm.isPublic,
            });
            setExistingDocuments(prev => prev.map(doc => (getDocumentId(doc) === docId ? { ...doc, ...updatedDocFromServer } : doc)));
            setEditingDocument(null);
            toast.success('Document updated successfully.');
        } catch (error) {
            console.error("Edit error:", error);
            toast.error("Failed to update document.");
        }
    };

    const handleCancelEdit = () => {
        setEditingDocument(null);
    };

    const handleViewDocument = (document: ExistingDocument) => {
        if (!isValidDocumentId(document)) {
            toast.error("Cannot view document: ID is missing or invalid.");
            console.error("Attempted to view document with invalid ID:", JSON.stringify(document));
            return;
        }
        const docId = getDocumentId(document);
        try {
            const url = profileService.getDocumentDownloadUrl(docId);
            window.open(url, '_blank');
        } catch (error) {
            console.error("Error getting document view URL:", error);
            toast.error("Could not generate document view link.");
        }
    };

    const toggleDocumentVisibility = async (document: ExistingDocument) => {
        if (!isValidDocumentId(document)) {
            toast.error("Cannot toggle visibility: Document ID is missing or invalid.");
            console.error("Attempted to toggle visibility for document with invalid ID. Document details:", JSON.stringify(document));
            return;
        }
        const docId = getDocumentId(document);
        const newIsPublicState = !document.isPublic; // Determine the new state

        try {
            // Call the service to update metadata, sending the new state
            await profileService.updateDocumentMetadata(docId, { isPublic: newIsPublicState });

            // Update local state based on the intended new state
            setExistingDocuments(prevDocs =>
                prevDocs.map(d => {
                    if (getDocumentId(d) === docId) {
                        return { ...d, isPublic: newIsPublicState }; // Apply the new state
                    }
                    return d;
                })
            );
            // Update toast message to reflect the new state
            toast.success(`Document visibility updated to ${newIsPublicState ? 'Public (Unlocked)' : 'Private (Locked)'}.`);
        } catch (error) {
            console.error('Error toggling document visibility:', error);
            toast.error('Failed to update document visibility.');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-8">            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 sm:p-6 lg:p-8 border border-blue-100 shadow-sm"
            >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="text-center lg:text-left">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">Document Management Center</h2>
                        <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Organize, upload, and manage your business documents with ease</p>
                    </div>
                    <div className="flex items-center justify-center space-x-3 bg-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 shadow-sm border">
                        <FiFolder className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                        <div className="text-center">
                            <div className="text-xl sm:text-2xl font-bold text-gray-900">{existingDocuments.length}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Documents</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Enhanced Category Tabs */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >                <div className="flex flex-wrap bg-gray-50 border-b border-gray-200">
                    {Object.entries(DOCUMENT_CATEGORIES).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setSelectedCategory(key as keyof typeof DOCUMENT_CATEGORIES)}
                            className={`flex-1 min-w-[140px] px-3 sm:px-6 py-3 sm:py-4 font-semibold text-center transition-all duration-200 ${selectedCategory === key
                                ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                                {key === 'financial' && <span className="text-green-500 text-lg sm:text-base">💰</span>}
                                {key === 'legal' && <span className="text-blue-500 text-lg sm:text-base">⚖️</span>}
                                {key === 'other' && <span className="text-purple-500 text-lg sm:text-base">📄</span>}
                                <span className="text-sm sm:text-base">{label}</span>
                                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                                    {existingDocuments.filter(doc =>
                                        key === 'financial' ? doc.category === 'financial' :
                                            key === 'legal' ? doc.category === 'legal' :
                                                doc.category === 'other'
                                    ).length}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Bulk Upload Settings */}                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 sm:p-6 bg-gray-50"
                >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                        <FiPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Quick Upload Settings for {DOCUMENT_CATEGORIES[selectedCategory]}
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Default Document Type
                            </label>
                            <select
                                value={bulkMetadata.documentType}
                                onChange={(e) => setBulkMetadata(prev => ({ ...prev, documentType: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="">Select document type</option>
                                {getDocumentTypesByCategory(selectedCategory).map((type, index) => (
                                    <option key={`${type.label}-${type.value}-${index}`} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Default Time Period
                            </label>
                            <select
                                value={bulkMetadata.timePeriod}
                                onChange={(e) => setBulkMetadata(prev => ({ ...prev, timePeriod: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="">Select time period</option>
                                {TIME_PERIODS.map(period => (
                                    <option key={period} value={period}>{period}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center justify-center lg:justify-start">
                            <label className="flex items-center space-x-2 sm:space-x-3 bg-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={bulkMetadata.isPublic}
                                    onChange={(e) => setBulkMetadata(prev => ({ ...prev, isPublic: e.target.checked }))}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <div className="flex items-center space-x-2">
                                    {bulkMetadata.isPublic ? <FiUnlock className="w-4 h-4 text-green-600" /> : <FiLock className="w-4 h-4 text-gray-400" />}
                                    <span className="text-xs sm:text-sm text-gray-700">Make documents public (unlocked) by default</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* File Upload Area */}            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 sm:p-8 lg:p-12 text-center transition-all duration-300 ${dragActive
                    ? 'border-blue-500 bg-blue-50 scale-105'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileInput}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                />

                <div className="space-y-4 sm:space-y-6">
                    <div className={`transition-transform duration-300 ${dragActive ? 'scale-110' : ''}`}>
                        <div className="relative">
                            <FiUpload className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                            <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                                {selectedCategory === 'financial' && <span className="text-xl sm:text-2xl">💰</span>}
                                {selectedCategory === 'legal' && <span className="text-xl sm:text-2xl">⚖️</span>}
                                {selectedCategory === 'other' && <span className="text-xl sm:text-2xl">📄</span>}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                        <p className="text-lg sm:text-xl font-semibold text-gray-900">
                            Drop your {DOCUMENT_CATEGORIES[selectedCategory].toLowerCase()} documents here
                        </p>
                        <p className="text-gray-500 text-base sm:text-lg">or</p>
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        Select Documents
                    </button>
                    <div className="space-y-1">
                        <p className="text-xs sm:text-sm text-gray-500">
                            Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG, GIF
                        </p>
                        <p className="text-xs text-gray-400">
                            Maximum file size: 50MB per file
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Files to Upload */}
            {files.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm"
                >                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                                <FiFile className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                                Selected Documents ({files.length})
                            </h3>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-blue-600 hover:text-blue-700 px-3 sm:px-4 py-2 border border-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium text-sm sm:text-base text-center"
                                >
                                    Add More Files
                                </button>
                                <button
                                    onClick={uploadAllFiles}
                                    disabled={isLoading || files.every(f => f.isUploaded)}
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-sm sm:text-base"
                                >
                                    <FiUpload className="w-4 h-4" />
                                    <span>{isLoading ? 'Uploading...' : 'Upload Documents'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-200">
                        <AnimatePresence>
                            {files.map((fileData) => (
                                <motion.div
                                    key={fileData.id}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }} className="p-4 sm:p-6"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                                        <div className="flex-shrink-0 mt-0 sm:mt-1">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <FiFile className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                                            <h4 className="text-sm font-medium text-gray-900 truncate" title={fileData.file.name}>
                                                {truncateUploadName(fileData.file.name)}
                                            </h4>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => updateFileMetadata(fileData.id, { editMode: !fileData.editMode })}
                                                    className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
                                                >
                                                    {fileData.editMode ? <FiCheck className="w-4 h-4" /> : <FiEdit3 className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => removeFile(fileData.id)}
                                                    className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                            <p className="text-xs sm:text-sm text-gray-500 mb-3 flex flex-wrap items-center gap-1 sm:gap-2">
                                                <span>{formatFileSize(fileData.file.size)}</span>
                                                <span className="text-gray-300 hidden sm:inline">•</span>
                                                <span className="capitalize">{fileData.category}</span>
                                                {fileData.documentType && (
                                                    <>
                                                        <span className="text-gray-300 hidden sm:inline">•</span>
                                                        <span className="text-xs">{getDocumentTypesByCategory(fileData.category).find(dt => dt.value === fileData.documentType)?.label || fileData.documentType}</span>
                                                    </>
                                                )}
                                            </p>                                            {fileData.editMode && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Category *
                                                        </label>
                                                        <select
                                                            value={fileData.category}
                                                            onChange={(e) => updateFileMetadata(fileData.id, {
                                                                category: e.target.value as keyof typeof DOCUMENT_CATEGORIES,
                                                                documentType: '' // Reset document type when category changes
                                                            })}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        >
                                                            {Object.entries(DOCUMENT_CATEGORIES).map(([key, label]) => (
                                                                <option key={key} value={key}>{label}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Document Type *
                                                        </label>
                                                        <select
                                                            value={fileData.documentType}
                                                            onChange={(e) => updateFileMetadata(fileData.id, { documentType: e.target.value })}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        >
                                                            <option value="">Select type</option>
                                                            {getDocumentTypesByCategory(fileData.category).map((type, index) => (
                                                                <option key={`${type.label}-${type.value}-${index}`} value={type.value}>{type.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Time Period
                                                        </label>
                                                        <select
                                                            value={fileData.timePeriod || ''}
                                                            onChange={(e) => updateFileMetadata(fileData.id, { timePeriod: e.target.value })}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        >
                                                            <option value="">Select period</option>
                                                            {TIME_PERIODS.map((period, index) => (
                                                                <option key={`${period}-${index}`} value={period}>{period}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="flex items-center justify-center sm:justify-start">
                                                        <label className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={fileData.isPublic}
                                                                onChange={(e) => updateFileMetadata(fileData.id, { isPublic: e.target.checked })}
                                                                className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                            />
                                                            <span className="text-xs text-gray-700">Public</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mb-4">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Description *
                                                </label>
                                                <textarea
                                                    value={fileData.description}
                                                    onChange={(e) => updateFileMetadata(fileData.id, { description: e.target.value })}
                                                    placeholder="Enter document description..."
                                                    rows={2}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            </div>

                                            {/* Upload Progress */}
                                            {fileData.isUploading && (
                                                <div className="mb-2">
                                                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                                        <span>Uploading...</span>
                                                        <span>{fileData.uploadProgress}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${fileData.uploadProgress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Upload Status */}
                                            {fileData.isUploaded && (
                                                <div className="flex items-center text-green-600 text-sm">
                                                    <FiCheck className="w-4 h-4 mr-1" />
                                                    Successfully uploaded
                                                </div>
                                            )}

                                            {fileData.error && (
                                                <div className="flex items-center text-red-600 text-sm">
                                                    <FiAlertCircle className="w-4 h-4 mr-1" />
                                                    {fileData.error}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}

            {/* Existing Documents */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm"
            >                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                            <FiFolder className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                            {DOCUMENT_CATEGORIES[selectedCategory]} Documents ({existingDocuments.filter(doc =>
                                selectedCategory === 'financial' ? doc.category === 'financial' :
                                    selectedCategory === 'legal' ? doc.category === 'legal' :
                                        doc.category === 'other'
                            ).length})
                        </h3>
                        <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
                            {existingDocuments.filter(doc =>
                                selectedCategory === 'financial' ? doc.category === 'financial' :
                                    selectedCategory === 'legal' ? doc.category === 'legal' :
                                        doc.category === 'other'
                            ).length} of {existingDocuments.length} total documents
                        </div>
                    </div>
                </div>

                {isLoading && <div className="p-6 text-center">Loading documents...</div>}

                {!isLoading && existingDocuments.length === 0 && (<div className="p-8 sm:p-12 text-center">
                    <FiInbox className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                        No documents uploaded yet
                    </h4>
                    <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
                        Use the uploader above to add your first document.
                    </p>
                </div>
                )}

                {!isLoading && existingDocuments.length > 0 && (
                    <div className="divide-y divide-gray-200">
                        <AnimatePresence>
                            {existingDocuments
                                .filter(doc =>
                                    selectedCategory === 'financial' ? doc.category === 'financial' :
                                        selectedCategory === 'legal' ? doc.category === 'legal' :
                                            doc.category === 'other'
                                )
                                .map((document, index) => (
                                    <motion.div
                                        key={getDocumentId(document) || `existing-doc-${document.originalName || document.fileName}-${index}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-200"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="flex items-center space-x-3 sm:space-x-4">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <FiFile className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                                </div>                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-sm font-medium text-gray-900 truncate" title={document.originalName || document.fileName}>
                                                        {truncateUploadName(document.originalName || document.fileName)}
                                                    </h4>
                                                    <p className="text-xs sm:text-sm text-gray-500 flex flex-wrap items-center gap-1 sm:gap-2">
                                                        <span>{getDocumentTypesByCategory(document.category as keyof typeof DOCUMENT_CATEGORIES).find(dt => dt.value === document.documentType)?.label || document.documentType}</span>
                                                        <span className="text-gray-300 hidden sm:inline">•</span>
                                                        <span>{formatFileSize(document.fileSize || document.size)}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        Uploaded {new Date(document.createdAt).toLocaleDateString()}
                                                    </p>
                                                    {document.description && (
                                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                            {document.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                                                <div className="flex items-center text-xs text-gray-500">
                                                    {document.isPublic ? (
                                                        <><FiUnlock className="w-3 h-3 mr-1 text-green-600" />Public</>
                                                    ) : (
                                                        <><FiLock className="w-3 h-3 mr-1 text-red-600" />Private</>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-1 sm:space-x-2">
                                                    <button
                                                        onClick={() => handleViewDocument(document)}
                                                        className="text-green-600 hover:text-green-800 p-1.5 sm:p-2 rounded-md hover:bg-green-50 transition-colors"
                                                        title="View Document"
                                                    >
                                                        <FiEye className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleDocumentVisibility(document)}
                                                        className={`p-1.5 sm:p-2 rounded-md transition-colors ${document.isPublic
                                                            ? 'text-green-600 hover:text-green-800 hover:bg-green-50'
                                                            : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                                                            }`}
                                                        title="Toggle Visibility"
                                                    >
                                                        {document.isPublic ? <FiUnlock className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" /> : <FiLock className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditDocument(document)}
                                                        className="text-indigo-600 hover:text-indigo-800 p-1.5 sm:p-2 rounded-md hover:bg-indigo-50 transition-colors"
                                                        title="Edit Document"
                                                    >
                                                        <FiEdit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => downloadDocument(document)}
                                                        className="text-blue-600 hover:text-blue-800 p-1.5 sm:p-2 rounded-md hover:bg-blue-50 transition-colors"
                                                        title="Download Document"
                                                    >
                                                        <FiDownload className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(document)}
                                                        className="text-red-600 hover:text-red-800 p-1.5 sm:p-2 rounded-md hover:bg-red-50 transition-colors"
                                                        title="Delete Document"
                                                    >
                                                        <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                        </AnimatePresence>
                        {existingDocuments.filter(doc =>
                            selectedCategory === 'financial' ? doc.category === 'financial' :
                                selectedCategory === 'legal' ? doc.category === 'legal' :
                                    doc.category === 'other'
                        ).length === 0 && (<div className="p-8 sm:p-12 text-center text-gray-500">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                <FiInfo className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                            </div>
                            <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                                No {DOCUMENT_CATEGORIES[selectedCategory].toLowerCase()} documents yet
                            </h4>
                            <p className="text-sm sm:text-base text-gray-500 mb-4">
                                Upload your first {DOCUMENT_CATEGORIES[selectedCategory].toLowerCase()} document to get started
                            </p>
                        </div>
                            )}
                    </div>
                )}
            </motion.div>

            {/* Edit Document Modal */}
            {editingDocument && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">
                                Edit Document
                            </h3>
                            <button
                                onClick={handleCancelEdit}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Document Name
                                </label>
                                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                                    {editingDocument.originalName}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Document Type
                                </label>
                                <select
                                    value={editForm.documentType}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, documentType: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select type</option>
                                    {getDocumentTypesByCategory(editingDocument.category as keyof typeof DOCUMENT_CATEGORIES).map((type, index) => (
                                        <option key={`${type.label}-${type.value}-${index}`} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Time Period
                                </label>
                                <select
                                    value={editForm.timePeriod}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, timePeriod: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select period</option>
                                    {TIME_PERIODS.map((period, index) => (
                                        <option key={`${period}-${index}`} value={period}>
                                            {period}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows={3}
                                    placeholder="Enter document description..."
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="editIsPublic"
                                    checked={editForm.isPublic}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="editIsPublic" className="text-sm text-gray-700">
                                    Make this document public
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={handleCancelEdit}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {documentToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
                    >
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                                <FiTrash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Delete Document
                                </h3>
                                <p className="text-sm text-gray-500">
                                    This action cannot be undone
                                </p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-700 mb-2">
                                Are you sure you want to delete this document?
                            </p>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="font-medium text-gray-900">
                                    {documentToDelete.originalName || documentToDelete.fileName}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {getDocumentTypesByCategory(documentToDelete.category as keyof typeof DOCUMENT_CATEGORIES)
                                        .find(dt => dt.value === documentToDelete.documentType)?.label || documentToDelete.documentType}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete Document
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ComprehensiveDocumentUpload;

import { Request, Response } from 'express';
import dotenv from 'dotenv';
import LegalDueDiligenceReportModel from '../models/Analytics/LegalDueDiligenceReport';
import DocumentModel, { DocumentType } from '../models/Profile/Document';
import ApiUsageModel from '../models/ApiUsageModel/ApiUsage';
import StartupProfileModel from '../models/Profile/StartupProfile';
import InvestorProfileModel from '../models/InvestorModels/InvestorProfile';
import NewLegalDueDiligenceService from '../services/NewLegalDueDiligenceService';
import fileLogger from '../utils/fileLogger';
import { Types } from 'mongoose';

// Load environment variables
dotenv.config();

// Initialize the legal due diligence service
const newLegalDueDiligenceService = new NewLegalDueDiligenceService();

// Constants
const LEGAL_DD_COST = 0.05; // Cost per legal DD request
const MAX_DAILY_REQUESTS = 50; // Maximum legal DD requests per day

/**
 * Helper function to handle errors in a standardized way
 */
const handleControllerError = (
    res: Response,
    error: any,
    defaultMessage: string = 'An error occurred',
    statusCode: number = 500
) => {
    console.error(`${defaultMessage}:`, error);

    const isValidationError = error instanceof Error &&
        error.message &&
        error.message.includes('validation failed');

    let validationDetails: Record<string, any> = {};
    if (isValidationError && 'errors' in error) {
        const validationErrors = error.errors as Record<string, any>;
        Object.keys(validationErrors).forEach(key => {
            validationDetails[key] = {
                message: validationErrors[key]?.message || 'Unknown validation error',
                value: validationErrors[key]?.value || 'Unknown value',
                path: validationErrors[key]?.path || key
            };
        });
    }

    res.status(isValidationError ? 400 : statusCode).json({
        message: isValidationError
            ? 'Validation failed. Please check the data format.'
            : defaultMessage,
        errorCode: isValidationError ? 'VALIDATION_ERROR' : 'PROCESSING_ERROR',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        validationDetails: isValidationError ? validationDetails : undefined,
        suggestedAction: isValidationError
            ? 'Please check the data format and ensure all required fields have valid values.'
            : 'Please try again or contact support if the issue persists.',
        timestamp: new Date().toISOString()
    });
};

/**
 * Check API usage rate limiting for legal due diligence
 */
const checkLegalDDRateLimit = async (userId: string): Promise<{
    underLimit: boolean;
    usageCount: number;
    maxRequests: number;
}> => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const usageCount = await ApiUsageModel.countDocuments({
            userId: new Types.ObjectId(userId),
            apiType: 'legal_due_diligence',
            timestamp: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        return {
            underLimit: usageCount < MAX_DAILY_REQUESTS,
            usageCount,
            maxRequests: MAX_DAILY_REQUESTS
        };
    } catch (error) {
        console.error('Error checking legal DD rate limit:', error);
        return {
            underLimit: true,
            usageCount: 0,
            maxRequests: MAX_DAILY_REQUESTS
        };
    }
};

/**
 * Get available legal document types for validation
 */
const getLegalDocumentTypes = (): DocumentType[] => {
    return [
        // Startup-specific legal documents
        'legal_incorporation_certificate',
        'legal_moa_aoa',
        'legal_llp_agreement',
        'legal_pan_tan_gst',
        'legal_shop_establishment',
        'legal_board_resolutions',
        'legal_statutory_registers',
        'legal_annual_filings',
        'legal_auditor_appointment',
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
 * Process legal documents and generate legal due diligence report
 * This endpoint handles document-based legal analysis
 */
export const processLegalDocuments = async (req: Request, res: Response): Promise<void> => {
    try {
        // Check authentication
        if (!req.user?.userId) {
            res.status(401).json({
                message: 'Unauthorized: User authentication required',
                errorCode: 'AUTH_REQUIRED'
            });
            return;
        }

        const { entityId } = req.params;
        const { entityType = 'startup', forceRefresh = false } = req.body;

        console.log(`Processing legal documents for entityId: ${entityId}, entityType: ${entityType}`);

        if (!entityId) {
            res.status(400).json({
                message: 'Entity ID is required',
                errorCode: 'MISSING_ENTITY_ID'
            });
            return;
        }

        // Check rate limiting
        const rateLimitResult = await checkLegalDDRateLimit(req.user.userId);
        if (!rateLimitResult.underLimit) {
            res.status(429).json({
                message: `Daily API limit reached. You have used ${rateLimitResult.usageCount}/${rateLimitResult.maxRequests} requests today.`,
                errorCode: 'RATE_LIMIT_EXCEEDED',
                usageInfo: rateLimitResult,
                resetTime: 'Midnight UTC'
            });
            return;
        }

        // Get entity profile for company name
        let entityProfile;
        let companyName = '';

        if (entityType === 'startup') {
            entityProfile = await StartupProfileModel.findOne({ userId: entityId });
            companyName = entityProfile?.companyName || 'Startup Company';
        } else {
            entityProfile = await InvestorProfileModel.findOne({ userId: entityId });
            companyName = entityProfile?.companyName || 'Investor Company';
        }

        if (!entityProfile) {
            res.status(404).json({
                message: `${entityType === 'startup' ? 'Startup' : 'Investor'} profile not found`,
                errorCode: 'ENTITY_NOT_FOUND'
            });
            return;
        }

        // Check for existing analysis unless force refresh is requested
        if (!forceRefresh) {
            const existingAnalysis = await LegalDueDiligenceReportModel.findOne({
                entityId: entityId,
                entityType: entityType,
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // 7 days cache
            }).sort({ createdAt: -1 });

            if (existingAnalysis) {
                console.log('Found recent legal analysis in cache, returning cached result');
                res.status(200).json({
                    ...existingAnalysis.toObject(),
                    cached: true,
                    cacheAge: Math.floor((Date.now() - existingAnalysis.createdAt.getTime()) / (1000 * 60 * 60))
                });
                return;
            }
        }

        // Get legal document types
        const legalDocumentTypes = getLegalDocumentTypes();

        // Find legal documents for the entity
        const legalDocuments = await DocumentModel.find({
            userId: entityId,
            documentType: { $in: legalDocumentTypes }
        });

        if (legalDocuments.length === 0) {
            res.status(404).json({
                message: 'No legal documents found for analysis',
                errorCode: 'NO_LEGAL_DOCUMENTS',
                suggestion: 'Please upload legal documents such as incorporation certificate, MOA/AOA, board resolutions, etc.',
                requiredDocuments: [
                    'Certificate of Incorporation',
                    'Memorandum & Articles of Association',
                    'Board Resolutions',
                    'Shareholders Agreement',
                    'PAN, TAN, GST Certificates'
                ]
            });
            return;
        }

        console.log(`Found ${legalDocuments.length} legal documents for analysis`);

        // Prepare documents for processing
        const documentsForProcessing = legalDocuments.map(doc => ({
            filePath: doc.filePath || `/path/to/uploads/${doc.fileName}`,
            documentType: doc.documentType,
            originalName: doc.originalName,
            description: doc.description,
            fileType: doc.fileType,
            fileSize: doc.fileSize,
            createdAt: doc.createdAt?.toISOString(),
            updatedAt: doc.updatedAt?.toISOString()
        }));

        // Generate legal due diligence report
        console.log('Generating legal due diligence report...');
        const analysisResult = await newLegalDueDiligenceService.processLegalDocumentsAndGenerateReport(
            documentsForProcessing,
            companyName,
            `Entity Type: ${entityType}, Analysis requested by: ${req.user.userId}`
        );

        // Record API usage
        const apiUsage = new ApiUsageModel({
            userId: new Types.ObjectId(req.user.userId),
            apiType: 'legal_due_diligence',
            tokensUsed: Math.ceil(JSON.stringify(analysisResult).length / 4),
            cost: LEGAL_DD_COST,
            timestamp: new Date(),
            entityId: new Types.ObjectId(entityId),
            entityType: entityType,
            documentsProcessed: legalDocuments.length
        });
        await apiUsage.save();

        // Prepare data for saving to database
        const availableDocuments = legalDocuments.map(doc => ({
            documentId: doc._id ? doc._id.toString() : '',
            documentName: doc.originalName || doc.fileName || '',
            documentType: doc.documentType || '',
            uploadDate: doc.createdAt || new Date()
        }));

        const availableDocumentTypes = legalDocuments.map(doc => doc.documentType);
        const missingDocumentTypes = legalDocumentTypes.filter(
            (type: DocumentType) => !availableDocumentTypes.includes(type)
        );

        // Save the analysis to database
        const reportData = {
            entityId: entityId,
            entityType: entityType,
            entityProfile: {
                companyName: companyName,
                industry: (entityProfile as any).industry || 'Not specified',
                incorporationDate: (entityProfile as any).incorporationDate || undefined,
                registrationNumber: (entityProfile as any).registrationNumber || undefined,
                address: (entityProfile as any).address || undefined
            },
            legalAnalysis: analysisResult,
            reportCalculated: true,
            processingNotes: `Analysis requested by user ${req.user.userId} for ${entityType} entity`,
            availableDocuments: availableDocuments,
            missingDocumentTypes: missingDocumentTypes
        };

        const savedReport = await LegalDueDiligenceReportModel.create(reportData);

        console.log(`Legal due diligence report saved with ID: ${savedReport._id}`);

        // Log successful completion
        fileLogger.logTextToFile(
            `Legal DD Report Generated Successfully:\nEntity: ${companyName} (${entityId})\nUser: ${req.user.userId}\nDocuments: ${legalDocuments.length}\nReport ID: ${savedReport._id}\nGenerated at: ${new Date().toISOString()}`,
            'legal_dd_success'
        );

        res.status(200).json({
            reportId: savedReport._id,
            companyName: savedReport.entityProfile?.companyName,
            reportGeneratedAt: savedReport.createdAt,
            processingStatus: 'completed',
            documentsAnalyzed: legalDocuments.length,
            overallRisk: savedReport.legalAnalysis?.riskScore?.riskLevel,
            complianceRating: savedReport.legalAnalysis?.complianceAssessment?.complianceScore,
            cached: false,
            processingInfo: {
                documentsProcessed: legalDocuments.length,
                processingTime: 'Generated in real-time',
                apiUsage: {
                    dailyUsage: rateLimitResult.usageCount + 1,
                    dailyLimit: rateLimitResult.maxRequests
                }
            },
            analysisResult: analysisResult
        });

    } catch (error) {
        console.error('Error in processLegalDocuments:', error);

        // Log detailed error
        fileLogger.logTextToFile(
            `Legal DD Controller Error:\nUser: ${req.user?.userId}\nEntity: ${req.params.entityId}\nError: ${error instanceof Error ? error.message : String(error)}\nStack: ${error instanceof Error ? error.stack : 'No stack trace'}\nTimestamp: ${new Date().toISOString()}`,
            'legal_dd_error'
        );

        handleControllerError(res, error, 'Error processing legal documents for due diligence');
    }
};

/**
 * Get specific legal due diligence report by ID
 */
export const getLegalDueDiligenceReport = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { reportId } = req.params;

        if (!reportId) {
            res.status(400).json({ message: 'Report ID is required' });
            return;
        }

        const report = await LegalDueDiligenceReportModel.findById(reportId);

        if (!report) {
            res.status(404).json({
                message: 'Legal due diligence report not found',
                errorCode: 'REPORT_NOT_FOUND'
            });
            return;
        }

        // Check if user has access to this report (basic ownership check)
        // You may want to implement more sophisticated access control here

        res.status(200).json({
            reportId: report._id,
            companyName: report.entityProfile?.companyName,
            reportGeneratedAt: report.createdAt,
            processingStatus: report.reportCalculated ? 'completed' : 'pending',
            documentsAnalyzed: report.availableDocuments?.length || 0,
            overallRisk: report.legalAnalysis?.riskScore?.riskLevel,
            complianceRating: report.legalAnalysis?.complianceAssessment?.complianceScore,
            analysisResult: report.legalAnalysis
        });

    } catch (error) {
        handleControllerError(res, error, 'Error fetching legal due diligence report');
    }
};

/**
 * Health check endpoint for legal due diligence service
 */
export const healthCheck = async (req: Request, res: Response): Promise<void> => {
    try {
        const healthStatus = await newLegalDueDiligenceService.healthCheck();

        res.status(healthStatus.status === 'healthy' ? 200 : 503).json({
            service: 'Legal Due Diligence',
            status: healthStatus.status,
            timestamp: new Date().toISOString(),
            details: healthStatus
        });

    } catch (error) {
        res.status(503).json({
            service: 'Legal Due Diligence',
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export default {
    processLegalDocuments,
    getLegalDueDiligenceReport,
    healthCheck
};

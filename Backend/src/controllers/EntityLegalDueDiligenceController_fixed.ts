import { Request, Response } from 'express';
import dotenv from 'dotenv';
import LegalDueDiligenceReportModel from '../models/Analytics/LegalDueDiligenceReport';
import DocumentModel, { DocumentType } from '../models/Profile/Document';
import ApiUsageModel from '../models/ApiUsageModel/ApiUsage';
import StartupProfileModel from '../models/Profile/StartupProfile';
import InvestorProfileModel from '../models/InvestorModels/InvestorProfile';
import ExtendedProfileModel from '../models/Profile/ExtendedProfile';
import NewLegalDueDiligenceService from '../services/NewLegalDueDiligenceService';
import fileLogger from '../utils/fileLogger';
import { Types } from 'mongoose';

/**
 * Helper function to handle errors in a standardized way
 * @param res Express response object
 * @param error Error object
 * @param defaultMessage Default error message
 * @param statusCode HTTP status code to return
 */
const handleControllerError = (
    res: Response,
    error: any,
    defaultMessage: string = 'An error occurred',
    statusCode: number = 500
) => {
    console.error(`${defaultMessage}:`, error);

    // Determine if this is a validation error
    const isValidationError = error instanceof Error &&
        error.message &&
        error.message.includes('validation failed');

    // Extract specific validation error details if available
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

    // Return appropriate error response
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

// Load environment variables
dotenv.config();

// Initialize the legal due diligence service
const newLegalDueDiligenceService = new NewLegalDueDiligenceService();

// Maximum API requests per day
const MAX_DAILY_REQUESTS = 100;

interface RateLimitResult {
    underLimit: boolean;
    usageCount: number;
    maxRequests: number;
}

/**
 * Check if the user has exceeded the daily API usage limit for legal DD
 * @param userId User ID
 * @returns RateLimitResult object with limit information
 */
async function checkLegalDDRateLimit(userId: string): Promise<RateLimitResult> {
    try {
        // Count legal DD API usage for today
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
        // Default to allowing the request if we can't check the limit
        return {
            underLimit: true,
            usageCount: 0,
            maxRequests: MAX_DAILY_REQUESTS
        };
    }
}

/**
 * Get legal due diligence analysis for a specific entity
 * This is the main endpoint for generating legal DD reports
 */
export const getLegalDueDiligenceForEntity = async (req: Request, res: Response): Promise<void> => {
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
        const entityType = (req.query.entityType as 'startup' | 'investor') || 'startup';
        const forceRefresh = req.query.forceRefresh === 'true';

        console.log(`Legal DD request for entityId: ${entityId}, entityType: ${entityType}, forceRefresh: ${forceRefresh}`);

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

        // Check for existing analysis unless force refresh is requested
        if (!forceRefresh) {
            const existingAnalysis = await LegalDueDiligenceReportModel.findOne({
                entityId: entityId,
                entityType: entityType,
                // Only use cached results if less than 7 days old for legal DD
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }).sort({ createdAt: -1 });

            if (existingAnalysis) {
                console.log('Found recent legal analysis in cache, returning cached result');
                res.status(200).json({
                    ...existingAnalysis.toObject(),
                    cached: true,
                    cacheAge: Math.floor((Date.now() - existingAnalysis.createdAt.getTime()) / (1000 * 60 * 60)) // Age in hours
                });
                return;
            }
        }

        // Get entity profile
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

        // Define legal document types (using correct names from DocumentType enum)
        const legalDocumentTypes: DocumentType[] = [
            // Core corporate documents
            'legal_incorporation_certificate',
            'legal_moa_aoa',
            'legal_llp_agreement',
            'legal_board_resolutions',
            'legal_shareholders_agreement',
            'legal_statutory_registers',
            // Investment and funding documents
            'legal_term_sheet',
            'legal_share_subscription',
            'legal_convertible_notes',
            // Compliance and regulatory
            'legal_annual_filings',
            'legal_government_licenses',
            'legal_pan_tan_gst',
            'legal_shop_establishment',
            // Intellectual property
            'legal_ip_assignments',
            'legal_trademark_filings',
            'legal_patent_filings',
            // Employment and HR
            'legal_employment_agreements',
            'legal_nda_agreements',
            'legal_hr_policies',
            // Commercial agreements
            'legal_customer_contracts',
            'legal_vendor_contracts',
            'legal_saas_agreements',
            'legal_lease_agreements',
            // Legal proceedings and compliance
            'legal_litigation_details',
            'legal_regulatory_notices',
            // Investor-specific
            'legal_aif_registration',
            'legal_firc_copies',
            'legal_fc_gpr',
            'legal_odi_documents',
            'legal_ppm',
            // Other legal documents
            'legal_loan_agreements',
            'legal_rpt_disclosures',
            'legal_valuation_reports',
            'legal_data_protection'
        ];

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
                    'Incorporation Certificate',
                    'Memorandum of Association',
                    'Articles of Association',
                    'Board Resolutions',
                    'Shareholders Agreement'
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
            tokensUsed: Math.ceil(JSON.stringify(analysisResult).length / 4), // Rough estimate
            cost: 0.05, // Placeholder cost for legal DD
            timestamp: new Date(),
            entityId: new Types.ObjectId(entityId),
            entityType: entityType,
            documentsProcessed: legalDocuments.length
        });
        await apiUsage.save();

        // Prepare available documents for storage
        const availableDocuments = legalDocuments.map(doc => ({
            documentId: doc._id ? doc._id.toString() : '',
            documentName: doc.originalName || doc.fileName || '',
            documentType: doc.documentType || '',
            uploadDate: doc.createdAt || new Date()
        }));

        // Prepare missing document types
        const availableDocumentTypes = legalDocuments.map(doc => doc.documentType);
        const missingDocumentTypes = legalDocumentTypes.filter(
            (type: DocumentType) => !availableDocumentTypes.includes(type)
        );

        // Save the analysis to database using the correct model structure
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
            legalAnalysis: analysisResult, // This should match the ILegalAnalysis interface
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
            'legal_dd_entity_success'
        );

        res.status(200).json({
            ...savedReport.toObject(),
            cached: false,
            processingInfo: {
                documentsProcessed: legalDocuments.length,
                processingTime: 'Generated in real-time',
                apiUsage: {
                    dailyUsage: rateLimitResult.usageCount + 1,
                    dailyLimit: rateLimitResult.maxRequests
                }
            }
        });

    } catch (error) {
        console.error('Error in getLegalDueDiligenceForEntity:', error);

        // Log detailed error
        fileLogger.logTextToFile(
            `Legal DD Entity Controller Error:\nUser: ${req.user?.userId}\nEntity: ${req.params.entityId}\nError: ${error instanceof Error ? error.message : String(error)}\nStack: ${error instanceof Error ? error.stack : 'No stack trace'}\nTimestamp: ${new Date().toISOString()}`,
            'legal_dd_entity_error'
        );

        handleControllerError(res, error, 'Error generating legal due diligence analysis');
    }
};

/**
 * Get all legal due diligence reports for an entity
 */
export const getLegalDueDiligenceHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { entityId } = req.params;
        const entityType = (req.query.entityType as 'startup' | 'investor') || 'startup';
        const limit = parseInt(req.query.limit as string) || 10;

        if (!entityId) {
            res.status(400).json({ message: 'Entity ID is required' });
            return;
        }

        const reports = await LegalDueDiligenceReportModel.find({
            entityId: entityId,
            entityType: entityType
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('_id entityProfile.companyName createdAt reportCalculated legalAnalysis.riskScore legalAnalysis.complianceAssessment');

        res.status(200).json({
            reports: reports.map(report => ({
                id: report._id,
                companyName: report.entityProfile?.companyName,
                reportGeneratedAt: report.createdAt,
                processingStatus: report.reportCalculated ? 'completed' : 'pending',
                summary: {
                    overallRisk: report.legalAnalysis?.riskScore?.riskLevel,
                    complianceRating: report.legalAnalysis?.complianceAssessment?.complianceScore
                }
            }))
        });

    } catch (error) {
        handleControllerError(res, error, 'Error fetching legal due diligence history');
    }
};

/**
 * Get entity profile with legal due diligence summary
 */
export const getEntityLegalProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { entityId } = req.params;
        const entityType = (req.query.entityType as 'startup' | 'investor') || 'startup';

        if (!entityId) {
            res.status(400).json({ message: 'Entity ID is required' });
            return;
        }

        // Get entity profile
        let entityProfile;
        if (entityType === 'startup') {
            entityProfile = await StartupProfileModel.findOne({ userId: entityId });
        } else {
            entityProfile = await InvestorProfileModel.findOne({ userId: entityId });
        }

        if (!entityProfile) {
            res.status(404).json({ message: 'Entity profile not found' });
            return;
        }

        // Get latest legal due diligence report
        const latestReport = await LegalDueDiligenceReportModel.findOne({
            entityId: entityId,
            entityType: entityType
        }).sort({ createdAt: -1 });

        // Get legal document count
        const legalDocumentTypes: DocumentType[] = [
            'legal_incorporation_certificate',
            'legal_moa_aoa',
            'legal_llp_agreement',
            'legal_board_resolutions',
            'legal_shareholders_agreement',
            'legal_statutory_registers',
            'legal_term_sheet',
            'legal_share_subscription',
            'legal_convertible_notes',
            'legal_annual_filings',
            'legal_government_licenses',
            'legal_pan_tan_gst',
            'legal_shop_establishment',
            'legal_ip_assignments',
            'legal_trademark_filings',
            'legal_patent_filings',
            'legal_employment_agreements',
            'legal_nda_agreements',
            'legal_hr_policies',
            'legal_customer_contracts',
            'legal_vendor_contracts',
            'legal_saas_agreements',
            'legal_lease_agreements',
            'legal_litigation_details',
            'legal_regulatory_notices',
            'legal_aif_registration',
            'legal_firc_copies',
            'legal_fc_gpr',
            'legal_odi_documents',
            'legal_ppm',
            'legal_loan_agreements',
            'legal_rpt_disclosures',
            'legal_valuation_reports',
            'legal_data_protection'
        ];

        const legalDocumentCount = await DocumentModel.countDocuments({
            userId: entityId,
            documentType: { $in: legalDocumentTypes }
        });

        res.status(200).json({
            entityProfile: {
                id: entityProfile._id,
                companyName: (entityProfile as any).companyName,
                entityType: entityType,
                // Add other relevant profile fields
            },
            legalDueDiligence: {
                hasReports: !!latestReport,
                latestReport: latestReport ? {
                    id: latestReport._id,
                    reportGeneratedAt: latestReport.createdAt,
                    overallRisk: latestReport.legalAnalysis?.riskScore?.riskLevel,
                    complianceRating: latestReport.legalAnalysis?.complianceAssessment?.complianceScore
                } : null,
                documentCount: legalDocumentCount,
                lastAnalysis: latestReport?.createdAt || null
            }
        });

    } catch (error) {
        handleControllerError(res, error, 'Error fetching entity legal profile');
    }
};

export default {
    getLegalDueDiligenceForEntity,
    getLegalDueDiligenceHistory,
    getEntityLegalProfile
};

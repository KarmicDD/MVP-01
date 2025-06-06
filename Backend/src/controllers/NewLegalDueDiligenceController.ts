import { Request, Response } from 'express';
import dotenv from 'dotenv';
import LegalDueDiligenceReportModel from '../models/Analytics/LegalDueDiligenceReport';
import DocumentModel, { DocumentType } from '../models/Profile/Document';
import ApiUsageModel from '../models/ApiUsageModel/ApiUsage';
import StartupProfileModel from '../models/Profile/StartupProfile';
import InvestorProfileModel from '../models/InvestorModels/InvestorProfile';
import NewLegalDueDiligenceService from '../services/NewLegalDueDiligenceService';
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
 * Check if legal documents are available for an entity
 */
export const checkLegalDocumentsAvailability = async (req: Request, res: Response) => {
    try {
        const { entityId } = req.params;
        const entityType = req.query.entityType as 'startup' | 'investor' || 'startup';

        if (!entityId) {
            return res.status(400).json({
                message: 'Entity ID is required',
                success: false
            });
        }

        // Using correct DocumentType enum values based on the schema
        const legalDocumentTypes: DocumentType[] = [
            'legal_incorporation_certificate',
            'legal_moa_aoa',
            'legal_board_resolutions',
            'legal_shareholders_agreement',
            'legal_share_certificates',
            'legal_valuation_reports',
            'legal_loan_agreements',
            'legal_annual_filings'
        ];

        // Find documents using userId field (not entityId) to match the document schema
        const documents = await DocumentModel.find({
            userId: entityId,
            documentType: { $in: legalDocumentTypes }
        });

        // Get entity profile information
        let entityProfile;
        if (entityType === 'startup') {
            entityProfile = await StartupProfileModel.findOne({ userId: entityId });
        } else {
            entityProfile = await InvestorProfileModel.findOne({ userId: entityId });
        }

        // Get available and missing document types
        const availableDocumentTypes = documents.map(doc => doc.documentType);
        const missingDocumentTypes = legalDocumentTypes.filter(
            docType => !availableDocumentTypes.includes(docType)
        );

        res.status(200).json({
            message: 'Legal documents availability checked successfully',
            success: true,
            documentsAvailable: documents.length > 0,
            availableDocuments: documents.map(doc => ({
                documentId: doc._id?.toString(),
                documentName: doc.originalName,
                documentType: doc.documentType,
                uploadDate: doc.createdAt || new Date()
            })),
            missingDocumentTypes,
            entityInfo: entityProfile ? {
                companyName: entityType === 'startup'
                    ? (entityProfile as any).companyName
                    : (entityProfile as any).companyName || (entityProfile as any).name
            } : null
        });
    } catch (error) {
        handleControllerError(res, error, 'Error checking legal documents availability');
    }
};

/**
 * Analyze legal due diligence for a new entity
 */
export const analyzeNewLegalDueDiligence = async (req: Request, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                message: 'Unauthorized',
                success: false
            });
        }

        const { entityId } = req.params;
        const entityType = (req.query.entityType as 'startup' | 'investor') || 'startup';

        console.log(`Processing legal due diligence request for entityId: ${entityId}, entityType: ${entityType}`);        // Validate required fields
        if (!entityId) {
            return res.status(400).json({
                message: 'Entity ID is required',
                success: false
            });
        }

        // Check if report already exists
        const existingReport = await LegalDueDiligenceReportModel.findOne({ entityId });
        if (existingReport) {
            return res.status(400).json({
                message: 'Legal due diligence report already exists for this entity',
                success: false,
                data: {
                    reportId: existingReport._id,
                    entityId: existingReport.entityId,
                    companyName: existingReport.entityProfile?.companyName || 'Unknown Company',
                    reportGeneratedAt: existingReport.createdAt
                }
            });
        }        // Check if entity exists
        let entity = await StartupProfileModel.findOne({ userId: entityId });
        if (!entity) {
            entity = await InvestorProfileModel.findOne({ userId: entityId });
        }

        if (!entity) {
            return res.status(404).json({
                message: 'Entity not found',
                success: false
            });
        }

        // Check API usage limits using the authenticated user's ID
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayUsage = await ApiUsageModel.countDocuments({
            userId: new Types.ObjectId(req.user.userId),
            createdAt: { $gte: today, $lt: tomorrow }
        });

        if (todayUsage >= MAX_DAILY_REQUESTS) {
            return res.status(429).json({
                message: `Daily limit of ${MAX_DAILY_REQUESTS} legal due diligence requests exceeded`,
                success: false
            });
        }

        // Log API usage
        const apiUsage = new ApiUsageModel({
            userId: new Types.ObjectId(req.user.userId)
        });

        await apiUsage.save();

        // Generate the report using the service with proper parameters
        const report = await newLegalDueDiligenceService.generateLegalDueDiligenceReport(entityId, req.user.userId);

        if (!report) {
            return res.status(500).json({
                message: 'Failed to generate legal due diligence report',
                success: false
            });
        }

        res.status(201).json({
            message: 'Legal due diligence analysis completed successfully',
            success: true,
            data: {
                reportId: report._id,
                entityId: report.entityId,
                companyName: report.entityProfile?.companyName || 'Unknown Company',
                reportGeneratedAt: report.createdAt,
                processingStatus: report.reportCalculated ? 'completed' : 'pending',
                apiUsage: {
                    id: apiUsage._id,
                    remainingRequests: MAX_DAILY_REQUESTS - todayUsage - 1
                }
            }
        });
    } catch (error) {
        handleControllerError(res, error, 'Error analyzing legal due diligence');
    }
};

/**
 * Get all legal due diligence reports
 */
export const getLegalDueDiligenceReports = async (req: Request, res: Response) => {
    try {
        const reports = await LegalDueDiligenceReportModel.find({})
            .select('entityId entityProfile legalAnalysis reportCalculated createdAt updatedAt')
            .sort({ createdAt: -1 });

        const formattedReports = reports.map(report => ({
            reportId: report._id,
            entityId: report.entityId,
            companyName: report.entityProfile?.companyName || 'Unknown Company',
            reportGeneratedAt: report.createdAt,
            processingStatus: report.reportCalculated ? 'completed' : 'pending',
            analysisResult: report.legalAnalysis,
            createdAt: report.createdAt,
            updatedAt: report.updatedAt
        }));

        res.status(200).json({
            message: 'Legal due diligence reports retrieved successfully',
            success: true,
            data: formattedReports,
            total: formattedReports.length
        });
    } catch (error) {
        handleControllerError(res, error, 'Error retrieving legal due diligence reports');
    }
};

/**
 * Get specific legal due diligence report by ID
 */
export const getLegalDueDiligenceReportById = async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;

        if (!reportId) {
            return res.status(400).json({
                message: 'Report ID is required',
                success: false
            });
        }

        const report = await LegalDueDiligenceReportModel.findById(reportId);

        if (!report) {
            return res.status(404).json({
                message: 'Legal due diligence report not found',
                success: false
            });
        }

        res.status(200).json({
            message: 'Legal due diligence report retrieved successfully',
            success: true,
            data: {
                reportId: report._id,
                entityId: report.entityId,
                companyName: report.entityProfile?.companyName || 'Unknown Company',
                reportGeneratedAt: report.createdAt,
                processingStatus: report.reportCalculated ? 'completed' : 'pending',
                analysisResult: report.legalAnalysis,
                createdAt: report.createdAt,
                updatedAt: report.updatedAt
            }
        });
    } catch (error) {
        handleControllerError(res, error, 'Error retrieving legal due diligence report');
    }
};

/**
 * Delete legal due diligence report by ID
 */
export const deleteLegalDueDiligenceReport = async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;

        if (!reportId) {
            return res.status(400).json({
                message: 'Report ID is required',
                success: false
            });
        }

        const report = await LegalDueDiligenceReportModel.findByIdAndDelete(reportId);

        if (!report) {
            return res.status(404).json({
                message: 'Legal due diligence report not found',
                success: false
            });
        }

        res.status(200).json({
            message: 'Legal due diligence report deleted successfully',
            success: true,
            data: {
                deletedReportId: report._id,
                entityId: report.entityId
            }
        });
    } catch (error) {
        handleControllerError(res, error, 'Error deleting legal due diligence report');
    }
};

/**
 * Health check for the legal due diligence service
 */
export const healthCheck = async (req: Request, res: Response) => {
    try {
        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'Legal Due Diligence Controller',
            version: '1.0.0'
        };

        res.status(200).json({
            message: 'Legal due diligence service is healthy',
            success: true,
            data: healthStatus
        });
    } catch (error) {
        handleControllerError(res, error, 'Error checking service health');
    }
};

// Default export for module compatibility
export default {
    checkLegalDocumentsAvailability,
    analyzeNewLegalDueDiligence,
    getLegalDueDiligenceReports,
    getLegalDueDiligenceReportById,
    deleteLegalDueDiligenceReport,
    healthCheck
};

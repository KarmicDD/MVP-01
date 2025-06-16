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
 * Helper function to safely convert userId to ObjectId or use as string
 * Follows DRY principle for userId handling throughout the controller
 */
const getUserIdForQuery = (userId: string): Types.ObjectId | string => {
    // Check if userId is a valid ObjectId format (24 character hex string)
    if (Types.ObjectId.isValid(userId) && userId.length === 24) {
        return new Types.ObjectId(userId);
    }
    // If not a valid ObjectId, use as string (for UUID or other formats)
    return userId;
};

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

        console.log(`Processing legal due diligence request for entityId: ${entityId}, entityType: ${entityType}`);

        if (!entityId) {
            return res.status(400).json({
                message: 'Entity ID is required',
                success: false
            });
        }

        const existingReport = await LegalDueDiligenceReportModel.findOne({ entityId, entityType }); if (existingReport) {
            console.log(`Existing legal due diligence report found for entity ${entityId}`);
            return res.status(200).json({
                message: 'Legal due diligence report already exists',
                success: true,
                data: {
                    reportId: existingReport._id,
                    processingStatus: 'completed'
                }
            });
        } let entityProfile;

        if (entityType === 'startup') {
            entityProfile = await StartupProfileModel.findOne({ userId: entityId });
        } else {
            entityProfile = await InvestorProfileModel.findOne({ userId: entityId });
        }

        if (!entityProfile) {
            return res.status(404).json({
                message: `${entityType === 'startup' ? 'Startup' : 'Investor'} profile not found`,
                success: false,
                errorCode: 'PROFILE_NOT_FOUND',
                suggestion: 'Please ensure the entity profile is properly created before requesting legal due diligence analysis.'
            });
        }        // Strict validation: Ensure company name is available
        const companyName = entityProfile.companyName;
        if (!companyName || companyName.trim() === '') {
            return res.status(422).json({
                message: 'Company name is required for legal due diligence analysis',
                success: false,
                errorCode: 'MISSING_COMPANY_NAME',
                suggestion: 'Please update the entity profile with a valid company name before proceeding.'
            });
        }

        // Strict validation: Ensure industry is available
        const industry = (entityProfile as any).industry;
        if (!industry || industry.trim() === '') {
            return res.status(422).json({
                message: 'Company industry is required for legal due diligence analysis',
                success: false,
                errorCode: 'MISSING_INDUSTRY',
                suggestion: 'Please update the entity profile with a valid industry before proceeding.'
            });
        }

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

        const legalDocuments = await DocumentModel.find({
            userId: entityId,
            documentType: { $in: legalDocumentTypes }
        });

        if (legalDocuments.length === 0) {
            return res.status(404).json({
                message: 'No legal documents found for analysis',
                success: false,
                errorCode: 'NO_LEGAL_DOCUMENTS',
                suggestion: 'Please upload legal documents such as incorporation certificate, MOA/AOA, board resolutions, etc.'
            });
        }

        console.log(`Found ${legalDocuments.length} legal documents for analysis`);

        const documentsForProcessing = legalDocuments.map(doc => ({
            filePath: doc.filePath || `/path/to/uploads/${doc.fileName}`,
            documentType: doc.documentType,
            originalName: doc.originalName,
            description: doc.description,
            fileType: doc.fileType,
            fileSize: doc.fileSize,
            createdAt: doc.createdAt?.toISOString(),
            updatedAt: doc.updatedAt?.toISOString()
        }));        // Process documents and generate report with strict validation
        let analysisResult;
        try {
            analysisResult = await newLegalDueDiligenceService.processLegalDocumentsAndGenerateReport(
                documentsForProcessing,
                companyName,
                `Entity Type: ${entityType}, Analysis requested by: ${req.user.userId}`
            );

            // Validate that the AI response contains required data
            if (!analysisResult) {
                throw new Error('AI analysis failed: No report data generated');
            }

            if (!analysisResult.missingDocuments) {
                throw new Error('AI analysis failed: Missing required field "missingDocuments"');
            }

            console.log('Legal due diligence analysis completed successfully with strict validation');

        } catch (analysisError: any) {
            console.error('Analysis failed with validation error:', analysisError);

            // Check if this is a validation error from our strict validation
            if (analysisError.message && analysisError.message.includes('Invalid')) {
                return res.status(422).json({
                    message: 'AI analysis did not provide complete legal due diligence data',
                    success: false,
                    errorCode: 'INCOMPLETE_AI_ANALYSIS',
                    details: analysisError.message,
                    suggestion: 'The AI was unable to generate a complete legal analysis from the provided documents. Please ensure all required legal documents are properly formatted and try again.',
                    timestamp: new Date().toISOString()
                });
            }

            // Re-throw other errors to be handled by the general error handler
            throw analysisError;
        } const reportData = {
            entityId: entityId,
            entityType: entityType,
            entityProfile: {
                companyName: companyName,
                industry: industry,
                incorporationDate: (entityProfile as any).incorporationDate || undefined,
                registrationNumber: (entityProfile as any).registrationNumber || undefined,
                address: (entityProfile as any).address || undefined
            },
            legalAnalysis: analysisResult,
            reportCalculated: true,
            processingNotes: `Analysis requested by user ${req.user.userId} for ${entityType} entity`,
            availableDocuments: legalDocuments.map(doc => ({
                documentId: doc._id ? doc._id.toString() : '',
                documentName: doc.originalName || doc.fileName || '',
                documentType: doc.documentType || '',
                uploadDate: doc.createdAt || new Date()
            })),
            missingDocumentTypes: legalDocumentTypes.filter(
                docType => !legalDocuments.map(doc => doc.documentType).includes(docType)
            )
        }; const newReport = new LegalDueDiligenceReportModel(reportData);
        await newReport.save();

        res.status(201).json({
            message: 'Legal due diligence report generated successfully',
            success: true,
            data: newReport
        });
    } catch (error) {
        handleControllerError(res, error, 'Error analyzing legal due diligence');
    }
};

/**
 * Get legal due diligence reports for a specific entity or all reports
 * This function supports filtering by entity ID when called via /entity/:entityId/reports route
 */
export const getLegalDueDiligenceReports = async (req: Request, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                message: 'Unauthorized',
                success: false
            });
        }

        const { entityId } = req.params;
        const entityType = (req.query.entityType as 'startup' | 'investor') || 'startup';

        console.log(`Getting legal DD reports for entityId: ${entityId}, entityType: ${entityType}`);

        // Build the query filter
        let queryFilter: any = {};

        if (entityId) {
            // If entityId is provided, filter by entity
            queryFilter = {
                entityId: entityId,
                entityType: entityType
            };
        }
        // If no entityId is provided, return all reports (for admin/general use)

        const reports = await LegalDueDiligenceReportModel.find(queryFilter)
            .select('entityId entityType entityProfile legalAnalysis reportCalculated createdAt updatedAt availableDocuments missingDocumentTypes')
            .sort({ createdAt: -1 }); const formattedReports = reports.map(report => ({
                reportId: report._id,
                entityId: report.entityId,
                entityType: report.entityType,
                companyName: report.entityProfile?.companyName || '',
                reportGeneratedAt: report.createdAt,
                processingStatus: report.reportCalculated ? 'completed' : 'pending',
                analysisResult: report.legalAnalysis,
                availableDocuments: report.availableDocuments || [],
                missingDocumentTypes: report.missingDocumentTypes || [],
                summary: {
                    overallRisk: report.legalAnalysis?.riskScore?.riskLevel || 'Not assessed',
                    complianceRating: report.legalAnalysis?.complianceAssessment?.complianceScore || 'Not assessed'
                },
                createdAt: report.createdAt,
                updatedAt: report.updatedAt
            }));

        console.log(`Found ${formattedReports.length} legal DD reports`);

        res.status(200).json({
            message: entityId
                ? `Legal due diligence reports for entity ${entityId} retrieved successfully`
                : 'Legal due diligence reports retrieved successfully',
            success: true,
            data: formattedReports,
            total: formattedReports.length,
            entityId: entityId || null,
            entityType: entityId ? entityType : null
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
            success: true, data: {
                reportId: report._id,
                entityId: report.entityId,
                companyName: report.entityProfile?.companyName || '',
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

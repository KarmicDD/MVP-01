import { Request, Response } from 'express';
import dotenv from 'dotenv';
import FinancialDueDiligenceReport from '../models/Analytics/FinancialDueDiligenceReport';
import NewFinancialDueDiligenceReport from '../models/Analytics/NewFinancialDueDiligenceReport';
import DocumentModel, { DocumentType } from '../models/Profile/Document';
import ApiUsageModel from '../models/ApiUsageModel/ApiUsage';
import StartupProfileModel from '../models/Profile/StartupProfile';
import InvestorProfileModel from '../models/InvestorModels/InvestorProfile';
import ExtendedProfileModel from '../models/Profile/ExtendedProfile';
import QuestionnaireSubmissionModel from '../models/question/QuestionnaireSubmission';
import TaskModel from '../models/Task';
import enhancedDocumentProcessingService from '../services/EnhancedDocumentProcessingService';
import newFinancialDueDiligenceService from '../services/NewFinancialDueDiligenceService';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import path from 'path';

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

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || '';
if (!apiKey) {
    console.warn('Warning: GEMINI_API_KEY is not defined in environment variables');
}

// Maximum API requests per day
const MAX_DAILY_REQUESTS = 100;

interface RateLimitResult {
    underLimit: boolean;
    usageCount: number;
    maxRequests: number;
}

/**
 * Check if the user has exceeded the daily API usage limit
 * @param userId User ID
 * @returns RateLimitResult object with limit information
 */
async function checkRateLimit(userId: string): Promise<RateLimitResult> {
    // Find or create usage record for this user
    let usageRecord = await ApiUsageModel.findOne({ userId });

    if (!usageRecord) {
        usageRecord = await ApiUsageModel.create({
            userId,
            compatibilityRequestCount: 0,
            beliefSystemRequestCount: 0,
            financialAnalysisRequestCount: 0,
            recommendationRequestCount: 0,
            date: new Date(),
            lastReset: new Date()
        });
    }

    // Check if we need to reset the counter (new day)
    const now = new Date();
    const lastReset = new Date(usageRecord.lastReset);
    if (now.getDate() !== lastReset.getDate() ||
        now.getMonth() !== lastReset.getMonth() ||
        now.getFullYear() !== lastReset.getFullYear()) {
        // Reset counter for new day
        usageRecord.financialAnalysisRequestCount = 0;
        usageRecord.lastReset = now;
        await usageRecord.save();
    }

    // Check if under limit
    const underLimit = usageRecord.financialAnalysisRequestCount < MAX_DAILY_REQUESTS;

    if (!underLimit) {
        return {
            underLimit: false,
            usageCount: usageRecord.financialAnalysisRequestCount,
            maxRequests: MAX_DAILY_REQUESTS
        };
    }

    // If under limit, increment the counter
    usageRecord.financialAnalysisRequestCount += 1;
    await usageRecord.save();

    return {
        underLimit: true,
        usageCount: usageRecord.financialAnalysisRequestCount,
        maxRequests: MAX_DAILY_REQUESTS
    };
}

/**
 * Get document information for an entity
 * @param entityId The ID of the entity to get documents for
 * @returns Object containing available documents and missing document types
 */
async function getEntityDocuments(entityId: string, entityType: 'startup' | 'investor') {
    // Define required financial document types
    const requiredFinancialDocumentTypes: DocumentType[] = [
        'financial_balance_sheet',
        'financial_income_statement',
        'financial_cash_flow',
        'financial_tax_returns',
        'financial_gst_returns',
        'financial_bank_statements'
    ];

    // Additional startup-specific document types
    const startupSpecificDocumentTypes: DocumentType[] = [
        'financial_projections',
        'financial_cap_table'
    ];

    // Additional investor-specific document types
    const investorSpecificDocumentTypes: DocumentType[] = [
        'financial_audit_report'
    ];

    // Determine which document types to look for based on entity type
    const documentTypesToCheck = [
        ...requiredFinancialDocumentTypes,
        ...(entityType === 'startup' ? startupSpecificDocumentTypes : []),
        ...(entityType === 'investor' ? investorSpecificDocumentTypes : [])];

    // Fetch ALL documents for the entity to ensure comprehensive analysis
    // This matches the approach used in NewFinancialDueDiligenceController
    const documents = await DocumentModel.find({
        userId: entityId
    });

    // Check which required documents are missing
    const availableDocumentTypes = documents.map(doc => doc.documentType);
    const missingDocumentTypes = documentTypesToCheck.filter(
        docType => !availableDocumentTypes.includes(docType)
    );

    // Format available documents for the response
    const availableDocuments = documents.map(doc => ({
        documentId: doc._id ? doc._id.toString() : '',
        documentName: doc.originalName || doc.fileName || '',
        documentType: doc.documentType || '',
        uploadDate: doc.createdAt || new Date()
    }));

    return {
        availableDocuments,
        missingDocumentTypes
    };
}

/**
 * Analyze financial due diligence for a single entity
 */
export const analyzeFinancialDueDiligence = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Received request for financial due diligence analysis');
        console.log('Params:', req.params);

        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Check rate limit
        const rateLimitResult = await checkRateLimit(req.user.userId);

        if (!rateLimitResult.underLimit) {
            // If limit reached, check for any existing analysis regardless of age
            const { entityId } = req.params;
            const entityType = req.query.entityType as 'startup' | 'investor' || 'startup';
            const version = req.query.version as string;

            // Look for any existing analysis, regardless of age
            // Global caching: only look for entity ID and type, not the requesting user
            if (version === 'new') {
                // For new version, use the NewFinancialDueDiligenceReport model
                const oldNewAnalysis = await NewFinancialDueDiligenceReport.findOne({
                    targetEntityId: entityId,
                    targetEntityType: entityType
                }).sort({ createdAt: -1 }); // Get the most recent one

                if (oldNewAnalysis) {
                    // Return old analysis with a flag indicating it's old data
                    const oldReportObj = oldNewAnalysis.toObject() as any;
                    res.json({
                        // Core fields
                        companyName: oldReportObj.companyName,
                        reportDate: oldReportObj.reportDate,

                        // Report content based on FINALREPORT.MD structure
                        introduction: oldReportObj.introduction,
                        items: oldReportObj.items,
                        missingDocuments: oldReportObj.missingDocuments,
                        riskScore: oldReportObj.riskScore,
                        disclaimer: oldReportObj.disclaimer,

                        // Document tracking
                        availableDocuments: oldReportObj.availableDocuments,

                        // Metadata
                        generatedDate: oldReportObj.createdAt,
                        reportCalculated: oldReportObj.reportCalculated,
                        isOldData: true,
                        message: 'Daily request limit reached. Showing previously generated data.'
                    });
                    return;
                }
            } else {
                // For standard version, use the legacy FinancialDueDiligenceReport model
                const oldAnalysis = await FinancialDueDiligenceReport.findOne({
                    targetEntityId: entityId,
                    targetEntityType: entityType
                }).sort({ createdAt: -1 }); // Get the most recent one

                if (oldAnalysis) {
                    // Return old analysis with a flag indicating it's old data
                    res.json({
                        // Include the report type and perspective
                        reportType: oldAnalysis.reportType,
                        reportPerspective: oldAnalysis.reportPerspective,

                        // Include the total company score
                        totalCompanyScore: oldAnalysis.totalCompanyScore,

                        // Include the investment decision
                        investmentDecision: oldAnalysis.investmentDecision,

                        // Include the compatibility analysis
                        compatibilityAnalysis: oldAnalysis.compatibilityAnalysis,

                        // Include the Forward-Looking Analysis
                        forwardLookingAnalysis: oldAnalysis.forwardLookingAnalysis,

                        // Include the scoring breakdown
                        scoringBreakdown: oldAnalysis.scoringBreakdown,

                        // Standard sections
                        executiveSummary: oldAnalysis.executiveSummary,
                        financialAnalysis: oldAnalysis.financialAnalysis,
                        recommendations: oldAnalysis.recommendations,
                        riskFactors: oldAnalysis.riskFactors,
                        complianceItems: oldAnalysis.complianceItems,
                        financialStatements: oldAnalysis.financialStatements,
                        ratioAnalysis: oldAnalysis.ratioAnalysis,
                        taxCompliance: oldAnalysis.taxCompliance,
                        auditFindings: oldAnalysis.auditFindings,
                        documentAnalysis: oldAnalysis.documentAnalysis,

                        // Add the table sections
                        directorsTable: oldAnalysis.directorsTable,
                        keyBusinessAgreements: oldAnalysis.keyBusinessAgreements,
                        leavePolicy: oldAnalysis.leavePolicy,
                        provisionsAndPrepayments: oldAnalysis.provisionsAndPrepayments,
                        deferredTaxAssets: oldAnalysis.deferredTaxAssets,

                        availableDocuments: oldAnalysis.availableDocuments,
                        missingDocumentTypes: oldAnalysis.missingDocumentTypes,
                        generatedDate: oldAnalysis.createdAt,
                        reportCalculated: oldAnalysis.reportCalculated,
                        isOldData: true,
                        message: 'Daily request limit reached. Showing previously generated data.'
                    });
                    return;
                }
            }

            // If no old data exists, return the rate limit error
            res.status(429).json({
                message: 'Daily request limit reached',
                limit: MAX_DAILY_REQUESTS,
                nextReset: 'Tomorrow'
            });
            return;
        }

        const { entityId } = req.params;
        const entityType = req.query.entityType as 'startup' | 'investor' || 'startup';
        const version = req.query.version as string;

        console.log(`Processing request for entityId: ${entityId}, entityType: ${entityType}, version: ${version || 'standard'}`);

        if (!entityId) {
            res.status(400).json({ message: 'Entity ID is required' });
            return;
        }

        try {
            // Check if we have a recent analysis in MongoDB cache
            // Global caching: only look for entity ID and type, not the requesting user
            // Use 30 days as cache validity period instead of 7 days

            // Use the appropriate model based on the version parameter
            if (version === 'new') {
                // For new version, use the NewFinancialDueDiligenceReport model
                console.log('Checking for cached new financial due diligence report');
                const existingNewAnalysis = await NewFinancialDueDiligenceReport.findOne({
                    targetEntityId: entityId,
                    targetEntityType: entityType,
                    // Only use cached results if less than 30 days old
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                });

                if (existingNewAnalysis) {
                    // Return cached new analysis
                    console.log('Found existing new analysis, returning cached result');
                    res.json({
                        // Core fields
                        companyName: existingNewAnalysis.companyName,
                        reportDate: existingNewAnalysis.reportDate,

                        // Report content based on FINALREPORT.MD structure
                        introduction: existingNewAnalysis.introduction,
                        items: existingNewAnalysis.items,
                        missingDocuments: existingNewAnalysis.missingDocuments,
                        riskScore: existingNewAnalysis.riskScore,
                        disclaimer: existingNewAnalysis.disclaimer,

                        // Document tracking
                        availableDocuments: existingNewAnalysis.availableDocuments,

                        // Metadata
                        generatedDate: existingNewAnalysis.createdAt,
                        reportCalculated: existingNewAnalysis.reportCalculated
                    });
                    return;
                }
            } else {
                // For standard version, use the legacy FinancialDueDiligenceReport model
                const existingAnalysis = await FinancialDueDiligenceReport.findOne({
                    targetEntityId: entityId,
                    targetEntityType: entityType,
                    // Only use cached results if less than 30 days old
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                });

                if (existingAnalysis) {
                    // Return cached analysis
                    console.log('Found existing analysis, returning cached result');
                    res.json({
                        // Include the report type and perspective
                        reportType: existingAnalysis.reportType,
                        reportPerspective: existingAnalysis.reportPerspective,

                        // Include the total company score
                        totalCompanyScore: existingAnalysis.totalCompanyScore,

                        // Include the investment decision
                        investmentDecision: existingAnalysis.investmentDecision,

                        // Include the compatibility analysis
                        compatibilityAnalysis: existingAnalysis.compatibilityAnalysis,

                        // Include the Forward-Looking Analysis
                        forwardLookingAnalysis: existingAnalysis.forwardLookingAnalysis,

                        // Include the scoring breakdown
                        scoringBreakdown: existingAnalysis.scoringBreakdown,

                        // Standard sections
                        executiveSummary: existingAnalysis.executiveSummary,
                        financialAnalysis: existingAnalysis.financialAnalysis,
                        recommendations: existingAnalysis.recommendations,
                        riskFactors: existingAnalysis.riskFactors,
                        complianceItems: existingAnalysis.complianceItems,
                        financialStatements: existingAnalysis.financialStatements,
                        ratioAnalysis: existingAnalysis.ratioAnalysis,
                        taxCompliance: existingAnalysis.taxCompliance,
                        auditFindings: existingAnalysis.auditFindings,
                        documentAnalysis: existingAnalysis.documentAnalysis,

                        // Add the table sections
                        directorsTable: existingAnalysis.directorsTable,
                        keyBusinessAgreements: existingAnalysis.keyBusinessAgreements,
                        leavePolicy: existingAnalysis.leavePolicy,
                        provisionsAndPrepayments: existingAnalysis.provisionsAndPrepayments,
                        deferredTaxAssets: existingAnalysis.deferredTaxAssets,

                        availableDocuments: existingAnalysis.availableDocuments,
                        missingDocumentTypes: existingAnalysis.missingDocumentTypes,
                        generatedDate: existingAnalysis.createdAt,
                        reportCalculated: existingAnalysis.reportCalculated
                    });
                    return;
                }
            }

            // Fetch entity data from MongoDB
            let entityProfile;
            let companyName;

            if (entityType === 'startup') {
                entityProfile = await StartupProfileModel.findOne({ userId: entityId });
                if (!entityProfile) {
                    res.status(404).json({ message: 'Startup not found' });
                    return;
                }
                companyName = entityProfile.companyName;
            } else {
                entityProfile = await InvestorProfileModel.findOne({ userId: entityId });
                if (!entityProfile) {
                    res.status(404).json({ message: 'Investor not found' });
                    return;
                }
                // For investor profiles, use companyName if available, otherwise try to use name property
                // Cast to any to avoid TypeScript errors since the property might not be defined in the interface
                companyName = entityProfile.companyName || (entityProfile as any).name || 'Unknown Company';
            }

            // Get document information for the entity
            const { availableDocuments, missingDocumentTypes } = await getEntityDocuments(entityId, entityType);

            // If no documents are found at all
            if (availableDocuments.length === 0) {
                // Return entity info and missing documents
                res.status(404).json({
                    message: `No financial documents found for this ${entityType}`,
                    errorCode: 'NO_FINANCIAL_DOCUMENTS',
                    entityProfile,
                    missingDocumentTypes,
                    availableDocuments: []
                });
                return;
            }

            // Check if there are at least 2 documents available
            if (availableDocuments.length < 2) {
                res.status(400).json({
                    message: `At least 2 financial documents are required for analysis. Currently only ${availableDocuments.length} document is available.`,
                    errorCode: 'INSUFFICIENT_DOCUMENTS',
                    entityProfile,
                    missingDocumentTypes,
                    availableDocuments
                });
                return;
            }

            // Get document IDs for processing
            const documentIds = availableDocuments.map(doc => doc.documentId);

            // Fetch the actual documents
            const documents = await DocumentModel.find({
                _id: { $in: documentIds }
            });

            // Prepare documents with comprehensive metadata for processing
            const documentsWithMetadata = documents.map(doc => ({
                filePath: doc.filePath,
                documentType: doc.documentType,
                originalName: doc.originalName || path.basename(doc.filePath),
                description: doc.description || '',
                timePeriod: doc.timePeriod || '',
                fileType: doc.fileType || '',
                fileSize: doc.fileSize || 0,
                createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
                updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString()
            }));

            // Log document metadata for debugging
            console.log('Processing documents with metadata:', documentsWithMetadata.map(d => ({
                type: d.documentType,
                name: d.originalName,
                timePeriod: d.timePeriod || 'Not specified',
                description: d.description ? (d.description.length > 30 ? d.description.substring(0, 30) + '...' : d.description) : 'No description'
            })));

            // Extract financial data using Gemini with enhanced context
            // Choose the appropriate service based on the version parameter
            console.log(`Using ${version === 'new' ? 'new' : 'standard'} financial due diligence service`);
            let financialData;
            try {
                // If version is 'new', use the NewFinancialDueDiligenceService
                if (version === 'new') {
                    console.log('Using NewFinancialDueDiligenceService for financial data extraction');
                    // First process the documents to get the combined content
                    console.log('Processing documents in batches of maximum 3 documents...');

                    // Use the existing documentsWithMetadata variable instead of redeclaring it
                    // This avoids variable shadowing
                    const combinedDocumentContent = await newFinancialDueDiligenceService.processDocumentsInBatches(
                        documentsWithMetadata
                    );

                    // Then generate the financial due diligence report
                    financialData = await newFinancialDueDiligenceService.generateFinancialDueDiligenceReport(
                        combinedDocumentContent,
                        companyName,
                        entityType,
                        missingDocumentTypes
                    );
                    console.log('Successfully extracted financial data using NewFinancialDueDiligenceService');
                } else {
                    // Otherwise use the standard approach
                    console.log('Using standard approach for financial data extraction');
                    // Fetch additional data sources for enhanced analysis
                    console.log('Fetching additional data sources for enhanced analysis');

                    // Get extended profile data
                    const extendedProfile = await ExtendedProfileModel.findOne({ userId: entityId });

                    // Get questionnaire submission data
                    const questionnaireSubmission = await QuestionnaireSubmissionModel.findOne({
                        userId: entityId
                    }).sort({ createdAt: -1 });

                    // Get task data to evaluate execution capability
                    const tasks = await TaskModel.find({
                        assignedTo: entityId
                    }).sort({ createdAt: -1 }).limit(50);

                    // Get previous financial reports for historical metrics and industry benchmarks
                    const financialReports = await FinancialDueDiligenceReport.find({
                        targetEntityType: entityType
                    }).sort({ createdAt: -1 }).limit(10);

                    // Prepare historical metrics from previous reports if available
                    const historicalMetrics: Record<string, any> = {};
                    if (financialReports && financialReports.length > 0) {
                        // Extract metrics from previous reports
                        financialReports.forEach(report => {
                            if (report.financialAnalysis && report.financialAnalysis.metrics) {
                                report.financialAnalysis.metrics.forEach((metric: any) => {
                                    if (metric.name && metric.value) {
                                        historicalMetrics[metric.name] = metric.value;
                                    }
                                });
                            }
                        });
                    }

                    console.log('Additional data sources fetched successfully');

                    // Pass the document objects directly to extractFinancialData with additional data sources
                    // This will use the new approach that extracts raw data first
                    financialData = await enhancedDocumentProcessingService.extractFinancialData(
                        documentsWithMetadata, // Pass documents directly instead of combined content
                        companyName,
                        entityProfile,
                        null, // No counterparty info needed
                        missingDocumentTypes, // Pass missing document types to Gemini
                        { // Pass additional data sources for enhanced analysis
                            extendedProfile,
                            questionnaireSubmission,
                            tasks,
                            financialReports,
                            historicalMetrics
                        }
                    );
                }
            } catch (error) {
                console.error('Error extracting financial data:', error);

                // Check if it's a network-related error
                if (error instanceof Error && (
                    error.message.includes('fetch failed') ||
                    error.message.includes('network') ||
                    error.message.includes('connection')
                )) {
                    res.status(503).json({
                        message: 'Internet connection error at server. Please wait 10 minutes and try again.',
                        errorCode: 'SERVER_CONNECTIVITY_ERROR',
                        availableDocuments,
                        missingDocumentTypes
                    });
                    return;
                }

                // For other errors
                res.status(500).json({
                    message: 'Failed to extract financial data from documents',
                    errorCode: 'FINANCIAL_DATA_EXTRACTION_FAILED',
                    availableDocuments,
                    missingDocumentTypes
                });
                return;
            }

            // Process ratio analysis data to ensure all required fields are present
            const processRatioData = (ratios: any[] = []) => {
                return ratios.map(ratio => {
                    // Get the status value, defaulting to 'warning' if not present
                    let status = ratio.status || 'warning';

                    // If status is 'N/A' or any other non-standard value, normalize it to 'warning'
                    if (!['good', 'warning', 'critical', 'moderate', 'low'].includes(status)) {
                        console.log(`Normalizing non-standard ratio status "${status}" to "warning".`);
                        status = 'warning';
                    }

                    return {
                        name: ratio.name || 'Unknown Ratio',
                        value: ratio.value !== undefined ? ratio.value : null,
                        industry_average: ratio.industry_average,
                        description: ratio.description || 'No description available',
                        status: status
                    };
                });
            };

            // Get ratio analysis from financial data or create empty structure
            const ratioAnalysis = financialData.ratioAnalysis || {
                liquidityRatios: [],
                profitabilityRatios: [],
                solvencyRatios: [],
                efficiencyRatios: []
            };

            // Process each ratio category
            const processedRatioAnalysis = {
                liquidityRatios: processRatioData(ratioAnalysis.liquidityRatios),
                profitabilityRatios: processRatioData(ratioAnalysis.profitabilityRatios),
                solvencyRatios: processRatioData(ratioAnalysis.solvencyRatios),
                efficiencyRatios: processRatioData(ratioAnalysis.efficiencyRatios)
            };

            // Check if we have actual financial data using the reportCalculated field
            const reportCalculated = financialData && financialData.reportCalculated === true;

            if (!reportCalculated) {
                console.log('Financial data extraction was not successful according to Gemini');

                // Log more detailed information about the extraction failure
                console.log('Available documents:', availableDocuments.map(doc => doc.documentType));
                console.log('Missing document types:', missingDocumentTypes);

                // Log more detailed error information
                console.log('Error details:', {
                    availableDocumentCount: availableDocuments.length,
                    availableDocumentTypes: availableDocuments.map(doc => doc.documentType),
                    missingDocumentTypes: missingDocumentTypes,
                    possibleReasons: [
                        "Documents may be in a format that's difficult to extract data from",
                        "The content of the documents may not contain sufficient financial information",
                        "There might be OCR errors in processing the documents",
                        "The documents might be password protected or encrypted"
                    ]
                });

                // Even though extraction wasn't fully successful, we'll still save and return what we have
                console.log('Saving partial financial data to database');
            }

            // Declare the financialReport variable that will hold the report to save
            let financialReport;

            // Choose the appropriate model based on the version parameter
            if (version === 'new') {
                // For new version, use the NewFinancialDueDiligenceReport model
                console.log('Using NewFinancialDueDiligenceReport model for storing data');

                // Check if there's an existing report for this entity (regardless of age)
                let newFinancialReport = await NewFinancialDueDiligenceReport.findOne({
                    targetEntityId: entityId,
                    targetEntityType: entityType
                });

                if (newFinancialReport) {
                    console.log('Found existing new report, updating it instead of creating a new one');

                    // Update the existing report with new data
                    newFinancialReport.companyName = companyName;
                    newFinancialReport.reportDate = new Date();

                    // Report content based on FINALREPORT.MD structure
                    newFinancialReport.introduction = financialData.introduction ||
                        `This report presents the findings of the financial due diligence conducted on ${companyName} as of ${new Date().toISOString().split('T')[0]}.`;

                    newFinancialReport.items = financialData.items || [];

                    newFinancialReport.missingDocuments = financialData.missingDocuments || {
                        documentList: missingDocumentTypes.map(docType => ({
                            documentCategory: 'Financial',
                            specificDocument: docType.replace('financial_', '').replace(/_/g, ' '),
                            requirementReference: 'Standard financial due diligence'
                        })),
                        note: 'The following documents were not available for analysis.'
                    };

                    newFinancialReport.riskScore = financialData.riskScore || {
                        score: '5/10',
                        riskLevel: 'Moderate',
                        justification: 'Based on available documents and analysis.'
                    };

                    newFinancialReport.disclaimer = financialData.disclaimer;

                    // Document tracking
                    newFinancialReport.availableDocuments = availableDocuments;
                    newFinancialReport.documentSources = documents.map(doc => doc._id ? doc._id.toString() : '');

                    // Metadata
                    newFinancialReport.reportCalculated = reportCalculated;
                    newFinancialReport.updatedAt = new Date();
                    newFinancialReport.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Expire after 30 days

                    // Save the updated report
                    financialReport = newFinancialReport;
                } else {
                    console.log('No existing new report found, creating a new one');

                    // Create a new financial due diligence report with the new model
                    newFinancialReport = new NewFinancialDueDiligenceReport({
                        // Core fields
                        targetEntityId: entityId,
                        targetEntityType: entityType,
                        requestedById: req.user.userId,
                        companyName: companyName,
                        reportDate: new Date(),
                        generatedBy: 'KarmicDD AI',

                        // Report content based on FINALREPORT.MD structure
                        introduction: financialData.introduction ||
                            `This report presents the findings of the financial due diligence conducted on ${companyName} as of ${new Date().toISOString().split('T')[0]}.`,

                        items: financialData.items || [],

                        missingDocuments: financialData.missingDocuments || {
                            documentList: missingDocumentTypes.map(docType => ({
                                documentCategory: 'Financial',
                                specificDocument: docType.replace('financial_', '').replace(/_/g, ' '),
                                requirementReference: 'Standard financial due diligence'
                            })),
                            note: 'The following documents were not available for analysis.'
                        },

                        riskScore: financialData.riskScore || {
                            score: '5/10',
                            riskLevel: 'Moderate',
                            justification: 'Based on available documents and analysis.'
                        },

                        disclaimer: financialData.disclaimer,

                        // Document tracking
                        availableDocuments: availableDocuments,
                        documentSources: documents.map(doc => doc._id ? doc._id.toString() : ''),

                        // Metadata
                        status: 'final',
                        reportCalculated: reportCalculated,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expire after 30 days
                    });

                    // Set the financial report to the new report
                    financialReport = newFinancialReport;
                }
            } else {
                // For standard version, use the legacy FinancialDueDiligenceReport model
                console.log('Using legacy FinancialDueDiligenceReport model for storing data');

                // Check if there's an existing report for this entity (regardless of age)
                let legacyFinancialReport = await FinancialDueDiligenceReport.findOne({
                    targetEntityId: entityId,
                    targetEntityType: entityType
                });

                if (legacyFinancialReport) {
                    console.log('Found existing legacy report, updating it instead of creating a new one');

                    // Update the existing report with new data
                    legacyFinancialReport.companyName = companyName;

                    // Report Type and Perspective
                    legacyFinancialReport.reportType = financialData.reportType;
                    legacyFinancialReport.reportPerspective = financialData.reportPerspective;

                    // Total Company Score
                    legacyFinancialReport.totalCompanyScore = financialData.totalCompanyScore;

                    // Investment Decision
                    legacyFinancialReport.investmentDecision = financialData.investmentDecision;

                    // Compatibility Analysis
                    legacyFinancialReport.compatibilityAnalysis = financialData.compatibilityAnalysis;

                    // Forward-Looking Analysis
                    legacyFinancialReport.forwardLookingAnalysis = financialData.forwardLookingAnalysis;

                    // Scoring Breakdown
                    legacyFinancialReport.scoringBreakdown = financialData.scoringBreakdown;

                    legacyFinancialReport.availableDocuments = availableDocuments;
                    legacyFinancialReport.missingDocumentTypes = missingDocumentTypes;
                    legacyFinancialReport.reportCalculated = reportCalculated;
                    legacyFinancialReport.executiveSummary = financialData.executiveSummary || {
                        headline: "Financial Due Diligence Report",
                        summary: financialData.summary || "Financial analysis of the provided documents.",
                        keyFindings: [],
                        recommendedActions: [],
                        keyMetrics: financialData.metrics || []
                    };
                    legacyFinancialReport.financialAnalysis = financialData.financialAnalysis || {
                        metrics: financialData.metrics || [],
                        trends: []
                    };
                    legacyFinancialReport.recommendations = financialData.recommendations || [];
                    legacyFinancialReport.riskFactors = financialData.riskFactors || [];
                    legacyFinancialReport.complianceItems = financialData.complianceItems || [];
                    legacyFinancialReport.financialStatements = financialData.financialStatements || {};
                    legacyFinancialReport.ratioAnalysis = processedRatioAnalysis;
                    legacyFinancialReport.taxCompliance = financialData.taxCompliance || {
                        gst: { status: 'compliant', details: 'Not evaluated' },
                        incomeTax: { status: 'compliant', details: 'Not evaluated' },
                        tds: { status: 'compliant', details: 'Not evaluated' }
                    };
                    legacyFinancialReport.auditFindings = financialData.auditFindings || {
                        findings: [],
                        overallAssessment: "No audit findings available."
                    };
                    legacyFinancialReport.documentAnalysis = financialData.documentAnalysis || {
                        availableDocuments: availableDocuments.map(doc => ({
                            documentType: doc.documentType,
                            quality: "moderate",
                            completeness: "partial",
                            keyInsights: ["Document was processed but detailed analysis not available"]
                        })),
                        missingDocuments: {
                            list: missingDocumentTypes,
                            impact: "Missing documents may limit the completeness of the financial analysis.",
                            recommendations: ["Upload the missing documents to improve analysis quality."]
                        }
                    };
                    legacyFinancialReport.directorsTable = financialData.directorsTable || {
                        overview: "No directors information available in the provided documents.",
                        directors: [],
                        analysis: "Unable to analyze directors information due to lack of data.",
                        recommendations: ["Provide company incorporation documents or annual returns to analyze the board of directors."]
                    };
                    legacyFinancialReport.keyBusinessAgreements = financialData.keyBusinessAgreements || {
                        overview: "No key business agreements information available in the provided documents.",
                        agreements: [],
                        analysis: "Unable to analyze key business agreements due to lack of data.",
                        recommendations: ["Provide contracts and business agreements for analysis."]
                    };
                    legacyFinancialReport.leavePolicy = financialData.leavePolicy || {
                        overview: "No leave policy information available in the provided documents.",
                        policies: [],
                        analysis: "Unable to analyze leave policy due to lack of data.",
                        recommendations: ["Provide HR policy documents for analysis."]
                    };
                    legacyFinancialReport.provisionsAndPrepayments = financialData.provisionsAndPrepayments || {
                        overview: "No provisions and prepayments information available in the provided documents.",
                        items: [],
                        analysis: "Unable to analyze provisions and prepayments due to lack of data.",
                        recommendations: ["Provide detailed balance sheet and notes to accounts for analysis."]
                    };
                    legacyFinancialReport.deferredTaxAssets = financialData.deferredTaxAssets || {
                        overview: "No deferred tax assets information available in the provided documents.",
                        items: [],
                        analysis: "Unable to analyze deferred tax assets due to lack of data.",
                        recommendations: ["Provide tax computation documents and notes to accounts for analysis."]
                    };
                    legacyFinancialReport.documentSources = documents.map(doc => doc._id ? doc._id.toString() : '');
                    legacyFinancialReport.updatedAt = new Date();
                    legacyFinancialReport.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Expire after 30 days

                    // Set the financial report to the legacy report
                    financialReport = legacyFinancialReport;
                } else {
                    console.log('No existing legacy report found, creating a new one');

                    // Create a new financial due diligence report with all available data
                    legacyFinancialReport = new FinancialDueDiligenceReport({
                        targetEntityId: entityId,
                        targetEntityType: entityType,
                        requestedById: req.user.userId,
                        companyName,
                        generatedBy: 'KarmicDD AI',

                        // Report Type and Perspective
                        reportType: financialData.reportType,
                        reportPerspective: financialData.reportPerspective,

                        // Total Company Score
                        totalCompanyScore: financialData.totalCompanyScore,

                        // Investment Decision
                        investmentDecision: financialData.investmentDecision,

                        // Compatibility Analysis
                        compatibilityAnalysis: financialData.compatibilityAnalysis,

                        // Forward-Looking Analysis
                        forwardLookingAnalysis: financialData.forwardLookingAnalysis,

                        // Scoring Breakdown
                        scoringBreakdown: financialData.scoringBreakdown,

                        // Document tracking
                        availableDocuments,
                        missingDocumentTypes,

                        // Report calculation status
                        reportCalculated: reportCalculated,

                        // Executive Summary Section
                        executiveSummary: financialData.executiveSummary || {
                            headline: "Financial Due Diligence Report",
                            summary: financialData.summary || "Financial analysis of the provided documents.",
                            keyFindings: [],
                            recommendedActions: [],
                            keyMetrics: financialData.metrics || []
                        },

                        // Financial Analysis Section
                        financialAnalysis: financialData.financialAnalysis || {
                            metrics: financialData.metrics || [],
                            trends: []
                        },

                        // Other sections
                        recommendations: financialData.recommendations || [],
                        riskFactors: financialData.riskFactors || [],
                        complianceItems: financialData.complianceItems || [],
                        financialStatements: financialData.financialStatements || {},
                        ratioAnalysis: processedRatioAnalysis,
                        taxCompliance: financialData.taxCompliance || {
                            gst: { status: 'compliant', details: 'Not evaluated' },
                            incomeTax: { status: 'compliant', details: 'Not evaluated' },
                            tds: { status: 'compliant', details: 'Not evaluated' }
                        },

                        // Audit Findings
                        auditFindings: financialData.auditFindings || {
                            findings: [],
                            overallAssessment: "No audit findings available."
                        },

                        // Document Analysis - new section
                        documentAnalysis: financialData.documentAnalysis || {
                            availableDocuments: availableDocuments.map(doc => ({
                                documentType: doc.documentType,
                                quality: "moderate",
                                completeness: "partial", // Using valid enum value: 'complete', 'partial', or 'incomplete'
                                keyInsights: ["Document was processed but detailed analysis not available"]
                            })),
                            missingDocuments: {
                                list: missingDocumentTypes,
                                impact: "Missing documents may limit the completeness of the financial analysis.",
                                recommendations: ["Upload the missing documents to improve analysis quality."]
                            }
                        },

                        // Directors Table Section
                        directorsTable: financialData.directorsTable || {
                            overview: "No directors information available in the provided documents.",
                            directors: [],
                            analysis: "Unable to analyze directors information due to lack of data.",
                            recommendations: ["Provide company incorporation documents or annual returns to analyze the board of directors."]
                        },

                        // Key Business Agreements Section
                        keyBusinessAgreements: financialData.keyBusinessAgreements || {
                            overview: "No key business agreements information available in the provided documents.",
                            agreements: [],
                            analysis: "Unable to analyze key business agreements due to lack of data.",
                            recommendations: ["Provide contracts and business agreements for analysis."]
                        },

                        // Leave Policy Section
                        leavePolicy: financialData.leavePolicy || {
                            overview: "No leave policy information available in the provided documents.",
                            policies: [],
                            analysis: "Unable to analyze leave policy due to lack of data.",
                            recommendations: ["Provide HR policy documents for analysis."]
                        },

                        // Provisions & Prepayments Section
                        provisionsAndPrepayments: financialData.provisionsAndPrepayments || {
                            overview: "No provisions and prepayments information available in the provided documents.",
                            items: [],
                            analysis: "Unable to analyze provisions and prepayments due to lack of data.",
                            recommendations: ["Provide detailed balance sheet and notes to accounts for analysis."]
                        },

                        // Deferred Tax Assets Section
                        deferredTaxAssets: financialData.deferredTaxAssets || {
                            overview: "No deferred tax assets information available in the provided documents.",
                            items: [],
                            analysis: "Unable to analyze deferred tax assets due to lack of data.",
                            recommendations: ["Provide tax computation documents and notes to accounts for analysis."]
                        },

                        // Metadata
                        documentSources: documents.map(doc => doc._id ? doc._id.toString() : ''),
                        status: 'final',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expire after 30 days
                    });

                    // Set the financial report to the legacy report
                    financialReport = legacyFinancialReport;
                }
            }

            // Log and process Forward-Looking Analysis data
            const forwardLookingStartTime = Date.now();
            console.log('Processing Forward-Looking Analysis data');
            if (financialData.forwardLookingAnalysis) {
                const analysis = financialData.forwardLookingAnalysis as Record<string, any>;
                console.log('Forward-Looking Analysis sections available:',
                    Object.keys(analysis).filter(key =>
                        analysis[key] && typeof analysis[key] === 'object' &&
                        Object.keys(analysis[key]).length > 0
                    ).join(', ')
                );

                // Process growth trajectory data if available
                if (analysis.growthTrajectory) {
                    console.log('Processing Growth Trajectory data');

                    // Process unitEconomics data
                    if (analysis.growthTrajectory.unitEconomics) {
                        const unitEconomics = analysis.growthTrajectory.unitEconomics;
                        console.log('Processing unitEconomics data:', JSON.stringify(unitEconomics));

                        // Ensure all fields are properly formatted for MongoDB
                        // Keep "N/A" as strings rather than trying to convert to numbers
                        // This works with our updated schema that accepts both numbers and strings
                    }

                    // Process scenarios data
                    if (analysis.growthTrajectory.scenarios) {
                        const scenarios = analysis.growthTrajectory.scenarios;
                        console.log('Processing scenarios data:', JSON.stringify(scenarios));

                        // Ensure all fields are properly formatted for MongoDB
                        // Keep "N/A" as strings rather than trying to convert to numbers
                    }

                    console.log('Growth Trajectory data processed successfully');
                }

                // Process innovation assessment data if available
                if (analysis.innovationAssessment) {
                    console.log('Processing Innovation Assessment data');
                    // Keep uniquenessScore as is, our schema now accepts both numbers and strings
                }

                // Process team capability data if available
                if (analysis.teamCapability) {
                    console.log('Processing Team Capability data');
                    // Keep executionScore as is, our schema now accepts both numbers and strings
                }

                // Process dimensions data if available
                if (analysis.dimensions) {
                    console.log('Processing Dimensions data');
                    // Keep score as is, our schema now accepts both numbers and strings
                }

                console.log('Forward-Looking Analysis data processed successfully');
            } else {
                console.log('No Forward-Looking Analysis data available');
            }
            console.log('Forward-Looking Analysis processing time:', Date.now() - forwardLookingStartTime, 'ms');

            await financialReport.save();
            console.log('Saved financial report to database');

            // Return complete analysis data with current date as generation date
            // Format the response based on the version parameter
            if (version === 'new') {
                // For new version, return the new model structure
                // Use type assertion to tell TypeScript this is a NewFinancialDueDiligenceReport
                const newReportObj = financialReport.toObject() as any;

                res.json({
                    // Core fields
                    companyName: newReportObj.companyName,
                    reportDate: newReportObj.reportDate,

                    // Report content based on FINALREPORT.MD structure
                    introduction: newReportObj.introduction,
                    items: newReportObj.items,
                    missingDocuments: newReportObj.missingDocuments,
                    riskScore: newReportObj.riskScore,
                    disclaimer: newReportObj.disclaimer,

                    // Document tracking
                    availableDocuments: newReportObj.availableDocuments,

                    // Metadata
                    generatedDate: newReportObj.createdAt,
                    reportCalculated: newReportObj.reportCalculated,
                    entityProfile
                });
            } else {
                // For standard version, return the legacy model structure
                // Use type assertion to tell TypeScript this is a FinancialDueDiligenceReport
                const legacyReportObj = financialReport.toObject() as any;

                res.json({
                    // Include the report type and perspective
                    reportType: legacyReportObj.reportType,
                    reportPerspective: legacyReportObj.reportPerspective,

                    // Include the total company score
                    totalCompanyScore: legacyReportObj.totalCompanyScore,

                    // Include the investment decision
                    investmentDecision: legacyReportObj.investmentDecision,

                    // Include the compatibility analysis
                    compatibilityAnalysis: legacyReportObj.compatibilityAnalysis,

                    // Include the Forward-Looking Analysis
                    forwardLookingAnalysis: legacyReportObj.forwardLookingAnalysis,

                    // Include the scoring breakdown
                    scoringBreakdown: legacyReportObj.scoringBreakdown,

                    // Standard sections
                    executiveSummary: legacyReportObj.executiveSummary,
                    financialAnalysis: legacyReportObj.financialAnalysis,
                    recommendations: legacyReportObj.recommendations,
                    riskFactors: legacyReportObj.riskFactors,
                    complianceItems: legacyReportObj.complianceItems,
                    financialStatements: legacyReportObj.financialStatements,
                    ratioAnalysis: legacyReportObj.ratioAnalysis,
                    taxCompliance: legacyReportObj.taxCompliance,
                    auditFindings: legacyReportObj.auditFindings,
                    documentAnalysis: legacyReportObj.documentAnalysis,

                    // Add the table sections
                    directorsTable: legacyReportObj.directorsTable,
                    keyBusinessAgreements: legacyReportObj.keyBusinessAgreements,
                    leavePolicy: legacyReportObj.leavePolicy,
                    provisionsAndPrepayments: legacyReportObj.provisionsAndPrepayments,
                    deferredTaxAssets: legacyReportObj.deferredTaxAssets,

                    availableDocuments: legacyReportObj.availableDocuments,
                    missingDocumentTypes: legacyReportObj.missingDocumentTypes,
                    generatedDate: legacyReportObj.createdAt,
                    reportCalculated: legacyReportObj.reportCalculated,
                    entityProfile
                });
            }
        } catch (error) {
            handleControllerError(
                res,
                error,
                'Failed to process financial documents or extract financial data',
                400
            );
        }
    } catch (error) {
        handleControllerError(
            res,
            error,
            'Server error occurred while processing financial due diligence',
            500
        );
    }
};

/**
 * Get a financial due diligence report for an entity
 */
export const getFinancialDueDiligenceReport = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Received request for financial due diligence report');
        console.log('Params:', req.params);
        console.log('Query:', req.query);

        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { entityId } = req.params;
        const entityType = req.query.entityType as 'startup' | 'investor' || 'startup';
        const version = req.query.version as string;

        if (!entityId) {
            res.status(400).json({ message: 'Entity ID is required' });
            return;
        }

        // Find the report in MongoDB
        // Global caching: only look for entity ID and type, not the requesting user
        const report = await FinancialDueDiligenceReport.findOne({
            targetEntityId: entityId,
            targetEntityType: entityType
        }).sort({ createdAt: -1 });

        if (!report) {
            console.log('No report found, returning 404');
            res.status(404).json({ message: 'Financial due diligence report not found' });
            return;
        }

        // Check if the report was successfully calculated (for new version)
        if (version === 'new' && report.reportCalculated === false) {
            console.log('Report exists but was not successfully calculated');
            res.status(422).json({
                message: 'Financial due diligence report exists but was not successfully calculated',
                reportId: report._id,
                reportCalculated: false
            });
            return;
        }

        console.log(`Found report (version: ${version || 'standard'}), returning data`);

        // Convert the Mongoose document to a plain JavaScript object
        const reportObj = report.toObject();

        // Log Forward-Looking Analysis data for debugging
        const forwardLookingStartTime = Date.now();
        console.log('Retrieving Forward-Looking Analysis data');
        if (reportObj.forwardLookingAnalysis) {
            console.log('Forward-Looking Analysis sections available:',
                Object.keys(reportObj.forwardLookingAnalysis).filter(key => {
                    const analysis = reportObj.forwardLookingAnalysis as Record<string, any>;
                    return analysis[key] && typeof analysis[key] === 'object' &&
                        Object.keys(analysis[key]).length > 0;
                }).join(', ')
            );

            // Log growth trajectory data if available
            if (reportObj.forwardLookingAnalysis.growthTrajectory) {
                const growthTrajectory = reportObj.forwardLookingAnalysis.growthTrajectory as Record<string, any>;

                // Log unitEconomics data
                if (growthTrajectory.unitEconomics) {
                    console.log('Retrieved unitEconomics data:',
                        JSON.stringify(growthTrajectory.unitEconomics));
                }

                // Log scenarios data
                if (growthTrajectory.scenarios) {
                    console.log('Retrieved scenarios data:',
                        JSON.stringify(growthTrajectory.scenarios));
                }
            }
        } else {
            console.log('No Forward-Looking Analysis data available in report');
        }
        console.log('Forward-Looking Analysis retrieval time:', Date.now() - forwardLookingStartTime, 'ms');

        // Return the report with all fields
        res.json({
            // Report Type and Perspective
            reportType: reportObj.reportType,
            reportPerspective: reportObj.reportPerspective,

            // Total Company Score
            totalCompanyScore: reportObj.totalCompanyScore,

            // Investment Decision
            investmentDecision: reportObj.investmentDecision,

            // Compatibility Analysis
            compatibilityAnalysis: reportObj.compatibilityAnalysis,

            // Forward-Looking Analysis
            forwardLookingAnalysis: reportObj.forwardLookingAnalysis,

            // Scoring Breakdown
            scoringBreakdown: reportObj.scoringBreakdown,

            // Original fields
            executiveSummary: reportObj.executiveSummary,
            financialAnalysis: reportObj.financialAnalysis,
            recommendations: reportObj.recommendations,
            riskFactors: reportObj.riskFactors,
            complianceItems: reportObj.complianceItems,
            financialStatements: reportObj.financialStatements,
            ratioAnalysis: reportObj.ratioAnalysis,
            taxCompliance: reportObj.taxCompliance,
            auditFindings: reportObj.auditFindings,
            documentAnalysis: reportObj.documentAnalysis,
            documentContentAnalysis: reportObj.documentContentAnalysis,

            // Add the table sections
            directorsTable: reportObj.directorsTable,
            keyBusinessAgreements: reportObj.keyBusinessAgreements,
            leavePolicy: reportObj.leavePolicy,
            provisionsAndPrepayments: reportObj.provisionsAndPrepayments,
            deferredTaxAssets: reportObj.deferredTaxAssets,

            availableDocuments: reportObj.availableDocuments,
            missingDocumentTypes: reportObj.missingDocumentTypes,
            generatedDate: reportObj.createdAt,
            reportCalculated: reportObj.reportCalculated
        });
    } catch (error) {
        handleControllerError(
            res,
            error,
            'Error retrieving financial due diligence report',
            500
        );
    }
};

/**
 * Generate a new financial due diligence report for an entity
 */
export const generateFinancialDueDiligenceReport = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Received request to generate financial due diligence report');
        console.log('Params:', req.params);
        console.log('Query:', req.query);

        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { entityId } = req.params;
        const entityType = req.body.entityType as 'startup' | 'investor' || 'startup';
        const version = req.query.version as string;

        if (!entityId) {
            res.status(400).json({ message: 'Entity ID is required' });
            return;
        }

        // Create a new request object with the required parameters
        const modifiedReq = {
            ...req,
            params: { entityId },
            query: {
                entityType,
                // Preserve the version parameter if it exists
                ...(version ? { version } : {})
            }
        };

        // Forward to the analyze endpoint to generate a new report
        // Cast to unknown first to avoid TypeScript errors
        await analyzeFinancialDueDiligence(modifiedReq as unknown as Request, res);
    } catch (error) {
        handleControllerError(
            res,
            error,
            'Error generating financial due diligence report',
            500
        );
    }
};

/**
 * Share a financial due diligence report
 */
export const shareFinancialDueDiligenceReport = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Received request to share financial due diligence report');
        console.log('Params:', req.params);

        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { entityId } = req.params;
        const entityType = req.query.entityType as 'startup' | 'investor' || 'startup';
        const { emails } = req.body;

        if (!entityId) {
            res.status(400).json({ message: 'Entity ID is required' });
            return;
        }

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            res.status(400).json({ message: 'Email addresses are required' });
            return;
        }

        // Find the report in MongoDB
        // Global caching: only look for entity ID and type, not the requesting user
        const report = await FinancialDueDiligenceReport.findOne({
            targetEntityId: entityId,
            targetEntityType: entityType
        }).sort({ createdAt: -1 });

        if (!report) {
            res.status(404).json({ message: 'Financial due diligence report not found' });
            return;
        }

        // In a real implementation, we would send emails here
        // For now, just return success
        res.json({
            message: 'Financial due diligence report shared successfully',
            recipientCount: emails.length
        });
    } catch (error) {
        handleControllerError(
            res,
            error,
            'Error sharing financial due diligence report',
            500
        );
    }
};

/**
 * Export a financial due diligence report as PDF
 */
export const exportFinancialDueDiligenceReportPdf = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Received request to export financial due diligence report as PDF');
        console.log('Params:', req.params);

        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { entityId } = req.params;
        const entityType = req.query.entityType as 'startup' | 'investor' || 'startup';

        if (!entityId) {
            res.status(400).json({ message: 'Entity ID is required' });
            return;
        }

        // Find the report in MongoDB
        // Global caching: only look for entity ID and type, not the requesting user
        const report = await FinancialDueDiligenceReport.findOne({
            targetEntityId: entityId,
            targetEntityType: entityType
        }).sort({ createdAt: -1 });

        if (!report) {
            console.log('No report found, returning 404');
            res.status(404).json({ message: 'Financial due diligence report not found' });
            return;
        }

        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

        // Add a page to the document
        const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
        const { height } = page.getSize();

        // Set font size and line height
        const fontSize = 12;
        const lineHeight = fontSize * 1.2;

        // Add title
        page.drawText(report.executiveSummary?.headline || 'Financial Due Diligence Report', {
            x: 50,
            y: height - 50,
            size: 24,
            font: timesRomanBoldFont,
            color: rgb(0, 0, 0.8)
        });

        // Add company name
        page.drawText(`Company: ${report.companyName}`, {
            x: 50,
            y: height - 80,
            size: 16,
            font: timesRomanBoldFont
        });

        // Add report date
        page.drawText(`Report Date: ${new Date(report.reportDate).toLocaleDateString()}`, {
            x: 50,
            y: height - 100,
            size: 12,
            font: timesRomanFont
        });

        // Add document information
        page.drawText('Available Documents:', {
            x: 50,
            y: height - 130,
            size: 14,
            font: timesRomanBoldFont
        });

        let currentY = height - 150;

        // List available documents
        for (const doc of report.availableDocuments) {
            page.drawText(`• ${doc.documentName} (${doc.documentType})`, {
                x: 50,
                y: currentY,
                size: fontSize,
                font: timesRomanFont
            });
            currentY -= lineHeight;
        }

        // List missing documents
        if (report.missingDocumentTypes && report.missingDocumentTypes.length > 0) {
            currentY -= 10;
            page.drawText('Missing Documents:', {
                x: 50,
                y: currentY,
                size: 14,
                font: timesRomanBoldFont
            });
            currentY -= 20;

            for (const docType of report.missingDocumentTypes) {
                page.drawText(`• ${docType}`, {
                    x: 50,
                    y: currentY,
                    size: fontSize,
                    font: timesRomanFont
                });
                currentY -= lineHeight;
            }
        }

        // Add summary
        currentY -= 20;
        page.drawText('Executive Summary:', {
            x: 50,
            y: currentY,
            size: 14,
            font: timesRomanBoldFont
        });
        currentY -= 20;

        // Split summary into lines to fit the page width
        const summaryLines = splitTextIntoLines(report.executiveSummary?.summary || '', 70);

        for (const line of summaryLines) {
            page.drawText(line, {
                x: 50,
                y: currentY,
                size: fontSize,
                font: timesRomanFont
            });
            currentY -= lineHeight;
        }

        // Serialize the PDF to bytes
        const pdfBytes = await pdfDoc.save();

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${report.companyName.replace(/\s+/g, '_')}_financial_report.pdf"`);

        // Send the PDF as the response
        res.send(Buffer.from(pdfBytes));
    } catch (error) {
        handleControllerError(
            res,
            error,
            'Error exporting financial due diligence report as PDF',
            500
        );
    }
};

/**
 * Get document details for an entity
 */
export const getEntityDocumentDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Received request for entity document details');
        console.log('Params:', req.params);
        console.log('Query:', req.query);

        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { entityId } = req.params;
        const entityType = req.query.entityType as 'startup' | 'investor' || 'startup';

        if (!entityId) {
            res.status(400).json({ message: 'Entity ID is required' });
            return;
        }

        // Get entity profile information
        let entityProfile;
        if (entityType === 'startup') {
            entityProfile = await StartupProfileModel.findOne({ userId: entityId });
        } else {
            entityProfile = await InvestorProfileModel.findOne({ userId: entityId });
        }

        // Find financial documents for the entity
        const documents = await DocumentModel.find({
            userId: entityId,
            documentType: { $regex: /^financial_/ }
        });

        // Get document information for the entity
        const { availableDocuments, missingDocumentTypes } = await getEntityDocuments(entityId, entityType);

        // Check if documents are available
        const hasDocuments = documents.length > 0;

        // Return document availability status with more details
        res.status(200).json({
            documentsAvailable: hasDocuments,
            documentCount: documents.length,
            documents: documents.map(doc => ({
                id: doc._id,
                documentType: doc.documentType,
                originalName: doc.originalName,
                description: doc.description,
                timePeriod: doc.timePeriod,
                fileType: doc.fileType,
                fileSize: doc.fileSize,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt
            })),
            availableDocuments,
            missingDocumentTypes,
            entityProfile: entityProfile ? {
                companyName: entityProfile.companyName,
                entityType
            } : null
        });
    } catch (error) {
        handleControllerError(
            res,
            error,
            'Error retrieving entity document details',
            500
        );
    }
};

/**
 * Get ALL document details for an entity (financial and non-financial documents)
 * This endpoint returns all documents uploaded by the entity for comprehensive analysis
 */
export const getAllEntityDocuments = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { entityId } = req.params;
        const entityType = req.query.entityType as 'startup' | 'investor' || 'startup';

        if (!entityId) {
            res.status(400).json({ message: 'Entity ID is required' });
            return;
        }

        // Find ALL documents for the entity - no filtering by type
        const documents = await DocumentModel.find({
            userId: entityId
        });

        // Get entity profile information
        let entityProfile;
        if (entityType === 'startup') {
            entityProfile = await StartupProfileModel.findOne({ userId: entityId });
        } else {
            entityProfile = await InvestorProfileModel.findOne({ userId: entityId });
        }

        // Format all documents for the response
        const allDocuments = documents.map(doc => ({
            documentId: doc._id ? doc._id.toString() : '',
            documentName: doc.originalName || doc.fileName || '',
            documentType: doc.documentType || '',
            uploadDate: doc.createdAt || new Date(),
            fileSize: doc.fileSize,
            fileType: doc.fileType
        }));

        // Categorize documents for easier frontend handling
        const categorizedDocuments = {
            financial: allDocuments.filter(doc =>
                doc.documentType.startsWith('financial_') ||
                doc.documentName.toLowerCase().includes('financial') ||
                doc.documentName.toLowerCase().includes('balance') ||
                doc.documentName.toLowerCase().includes('income') ||
                doc.documentName.toLowerCase().includes('cash')
            ),
            legal: allDocuments.filter(doc =>
                doc.documentType.startsWith('legal_') ||
                doc.documentName.toLowerCase().includes('legal') ||
                doc.documentName.toLowerCase().includes('contract') ||
                doc.documentName.toLowerCase().includes('agreement')
            ),
            other: allDocuments.filter(doc =>
                !doc.documentType.startsWith('financial_') &&
                !doc.documentType.startsWith('legal_') &&
                !doc.documentName.toLowerCase().includes('financial') &&
                !doc.documentName.toLowerCase().includes('legal')
            )
        };

        res.status(200).json({
            message: 'All documents retrieved successfully',
            documentsAvailable: documents.length > 0,
            totalDocuments: documents.length,
            documents: allDocuments,
            categorizedDocuments,
            entityProfile: entityProfile ? {
                companyName: entityType === 'startup'
                    ? (entityProfile as any).companyName
                    : (entityProfile as any).companyName || (entityProfile as any).name,
                entityType
            } : null
        });
    } catch (err) {
        handleControllerError(res, err, 'Error retrieving all entity documents');
    }
};

// Helper function to split text into lines
function splitTextIntoLines(text: string, maxCharsPerLine: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        if (currentLine.length + word.length + 1 <= maxCharsPerLine) {
            currentLine += (currentLine.length > 0 ? ' ' : '') + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }

    if (currentLine.length > 0) {
        lines.push(currentLine);
    }

    return lines;
}

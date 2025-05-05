import { Request, Response } from 'express';
import dotenv from 'dotenv';
import FinancialDueDiligenceReport from '../models/Analytics/FinancialDueDiligenceReport';
import DocumentModel, { DocumentType } from '../models/Profile/Document';
import ApiUsageModel from '../models/ApiUsageModel/ApiUsage';
import StartupProfileModel from '../models/Profile/StartupProfile';
import InvestorProfileModel from '../models/InvestorModels/InvestorProfile';
import enhancedDocumentProcessingService from '../services/EnhancedDocumentProcessingService';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
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
        ...(entityType === 'investor' ? investorSpecificDocumentTypes : [])
    ];

    // Fetch all financial documents for the entity
    const documents = await DocumentModel.find({
        userId: entityId,
        documentType: { $regex: /^financial_/ }
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

            // Look for any existing analysis, regardless of age
            const oldAnalysis = await FinancialDueDiligenceReport.findOne({
                targetEntityId: entityId,
                targetEntityType: entityType,
                requestedById: req.user.userId
            }).sort({ createdAt: -1 }); // Get the most recent one

            if (oldAnalysis) {
                // Return old analysis with a flag indicating it's old data
                res.json({
                    executiveSummary: oldAnalysis.executiveSummary,
                    financialAnalysis: oldAnalysis.financialAnalysis,
                    recommendations: oldAnalysis.recommendations,
                    riskFactors: oldAnalysis.riskFactors,
                    complianceItems: oldAnalysis.complianceItems,
                    financialStatements: oldAnalysis.financialStatements,
                    ratioAnalysis: oldAnalysis.ratioAnalysis,
                    taxCompliance: oldAnalysis.taxCompliance,
                    auditFindings: oldAnalysis.auditFindings,

                    // Add the table sections
                    directorsTable: oldAnalysis.directorsTable,
                    keyBusinessAgreements: oldAnalysis.keyBusinessAgreements,
                    leavePolicy: oldAnalysis.leavePolicy,
                    provisionsAndPrepayments: oldAnalysis.provisionsAndPrepayments,
                    deferredTaxAssets: oldAnalysis.deferredTaxAssets,

                    availableDocuments: oldAnalysis.availableDocuments,
                    missingDocumentTypes: oldAnalysis.missingDocumentTypes,
                    generatedDate: oldAnalysis.createdAt,
                    isOldData: true,
                    message: 'Daily request limit reached. Showing previously generated data.'
                });
                return;
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

        console.log(`Processing request for entityId: ${entityId}, entityType: ${entityType}`);

        if (!entityId) {
            res.status(400).json({ message: 'Entity ID is required' });
            return;
        }

        try {
            // Check if we have a recent analysis in MongoDB cache
            const existingAnalysis = await FinancialDueDiligenceReport.findOne({
                targetEntityId: entityId,
                targetEntityType: entityType,
                requestedById: req.user.userId,
                // Only use cached results if less than 7 days old
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            });

            if (existingAnalysis) {
                // Return cached analysis
                console.log('Found existing analysis, returning cached result');
                res.json({
                    executiveSummary: existingAnalysis.executiveSummary,
                    financialAnalysis: existingAnalysis.financialAnalysis,
                    recommendations: existingAnalysis.recommendations,
                    riskFactors: existingAnalysis.riskFactors,
                    complianceItems: existingAnalysis.complianceItems,
                    financialStatements: existingAnalysis.financialStatements,
                    ratioAnalysis: existingAnalysis.ratioAnalysis,
                    taxCompliance: existingAnalysis.taxCompliance,
                    auditFindings: existingAnalysis.auditFindings,

                    // Add the table sections
                    directorsTable: existingAnalysis.directorsTable,
                    keyBusinessAgreements: existingAnalysis.keyBusinessAgreements,
                    leavePolicy: existingAnalysis.leavePolicy,
                    provisionsAndPrepayments: existingAnalysis.provisionsAndPrepayments,
                    deferredTaxAssets: existingAnalysis.deferredTaxAssets,

                    availableDocuments: existingAnalysis.availableDocuments,
                    missingDocumentTypes: existingAnalysis.missingDocumentTypes,
                    generatedDate: existingAnalysis.createdAt
                });
                return;
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
            // Using the new approach that extracts raw data first, then sends to Gemini
            console.log('Extracting financial data using raw extraction first, then Gemini');
            let financialData;
            try {
                // Pass the document objects directly to extractFinancialData
                // This will use the new approach that extracts raw data first
                financialData = await enhancedDocumentProcessingService.extractFinancialData(
                    documentsWithMetadata, // Pass documents directly instead of combined content
                    companyName,
                    entityProfile,
                    null, // No counterparty info needed
                    missingDocumentTypes // Pass missing document types to Gemini
                );
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

            // Check if there's an existing report for this entity (regardless of age)
            // We'll update it instead of creating a new one to avoid duplicate reports
            let financialReport = await FinancialDueDiligenceReport.findOne({
                targetEntityId: entityId,
                targetEntityType: entityType,
                requestedById: req.user.userId
            });

            if (financialReport) {
                console.log('Found existing report, updating it instead of creating a new one');

                // Update the existing report with new data
                financialReport.companyName = companyName;
                financialReport.availableDocuments = availableDocuments;
                financialReport.missingDocumentTypes = missingDocumentTypes;
                financialReport.reportCalculated = reportCalculated;
                financialReport.executiveSummary = financialData.executiveSummary || {
                    headline: "Financial Due Diligence Report",
                    summary: financialData.summary || "Financial analysis of the provided documents.",
                    keyFindings: [],
                    recommendedActions: [],
                    keyMetrics: financialData.metrics || []
                };
                financialReport.financialAnalysis = financialData.financialAnalysis || {
                    metrics: financialData.metrics || [],
                    trends: []
                };
                financialReport.recommendations = financialData.recommendations || [];
                financialReport.riskFactors = financialData.riskFactors || [];
                financialReport.complianceItems = financialData.complianceItems || [];
                financialReport.financialStatements = financialData.financialStatements || {};
                financialReport.ratioAnalysis = processedRatioAnalysis;
                financialReport.taxCompliance = financialData.taxCompliance || {
                    gst: { status: 'compliant', details: 'Not evaluated' },
                    incomeTax: { status: 'compliant', details: 'Not evaluated' },
                    tds: { status: 'compliant', details: 'Not evaluated' }
                };
                financialReport.auditFindings = financialData.auditFindings || {
                    findings: [],
                    overallAssessment: "No audit findings available."
                };
                financialReport.documentAnalysis = financialData.documentAnalysis || {
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
                financialReport.directorsTable = financialData.directorsTable || {
                    overview: "No directors information available in the provided documents.",
                    directors: [],
                    analysis: "Unable to analyze directors information due to lack of data.",
                    recommendations: ["Provide company incorporation documents or annual returns to analyze the board of directors."]
                };
                financialReport.keyBusinessAgreements = financialData.keyBusinessAgreements || {
                    overview: "No key business agreements information available in the provided documents.",
                    agreements: [],
                    analysis: "Unable to analyze key business agreements due to lack of data.",
                    recommendations: ["Provide contracts and business agreements for analysis."]
                };
                financialReport.leavePolicy = financialData.leavePolicy || {
                    overview: "No leave policy information available in the provided documents.",
                    policies: [],
                    analysis: "Unable to analyze leave policy due to lack of data.",
                    recommendations: ["Provide HR policy documents for analysis."]
                };
                financialReport.provisionsAndPrepayments = financialData.provisionsAndPrepayments || {
                    overview: "No provisions and prepayments information available in the provided documents.",
                    items: [],
                    analysis: "Unable to analyze provisions and prepayments due to lack of data.",
                    recommendations: ["Provide detailed balance sheet and notes to accounts for analysis."]
                };
                financialReport.deferredTaxAssets = financialData.deferredTaxAssets || {
                    overview: "No deferred tax assets information available in the provided documents.",
                    items: [],
                    analysis: "Unable to analyze deferred tax assets due to lack of data.",
                    recommendations: ["Provide tax computation documents and notes to accounts for analysis."]
                };
                financialReport.documentSources = documents.map(doc => doc._id ? doc._id.toString() : '');
                financialReport.updatedAt = new Date();
                financialReport.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Expire after 30 days
            } else {
                console.log('No existing report found, creating a new one');

                // Create a new financial due diligence report with all available data
                financialReport = new FinancialDueDiligenceReport({
                    targetEntityId: entityId,
                    targetEntityType: entityType,
                    requestedById: req.user.userId,
                    companyName,
                    generatedBy: 'KarmicDD AI',

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
            }

            await financialReport.save();
            console.log('Saved financial report to database');

            // Return complete analysis data with current date as generation date
            res.json({
                executiveSummary: financialReport.executiveSummary,
                financialAnalysis: financialReport.financialAnalysis,
                recommendations: financialReport.recommendations,
                riskFactors: financialReport.riskFactors,
                complianceItems: financialReport.complianceItems,
                financialStatements: financialReport.financialStatements,
                ratioAnalysis: financialReport.ratioAnalysis,
                taxCompliance: financialReport.taxCompliance,
                auditFindings: financialReport.auditFindings,
                documentAnalysis: financialReport.documentAnalysis,

                // Add the table sections
                directorsTable: financialReport.directorsTable,
                keyBusinessAgreements: financialReport.keyBusinessAgreements,
                leavePolicy: financialReport.leavePolicy,
                provisionsAndPrepayments: financialReport.provisionsAndPrepayments,
                deferredTaxAssets: financialReport.deferredTaxAssets,

                availableDocuments: financialReport.availableDocuments,
                missingDocumentTypes: financialReport.missingDocumentTypes,
                generatedDate: financialReport.createdAt,
                reportCalculated: financialReport.reportCalculated,
                entityProfile
            });
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
        const report = await FinancialDueDiligenceReport.findOne({
            targetEntityId: entityId,
            targetEntityType: entityType,
            requestedById: req.user.userId
        }).sort({ createdAt: -1 });

        if (!report) {
            console.log('No report found, returning 404');
            res.status(404).json({ message: 'Financial due diligence report not found' });
            return;
        }

        console.log('Found report, returning data');

        // Return the report
        res.json({
            executiveSummary: report.executiveSummary,
            financialAnalysis: report.financialAnalysis,
            recommendations: report.recommendations,
            riskFactors: report.riskFactors,
            complianceItems: report.complianceItems,
            financialStatements: report.financialStatements,
            ratioAnalysis: report.ratioAnalysis,
            taxCompliance: report.taxCompliance,
            auditFindings: report.auditFindings,
            documentAnalysis: report.documentAnalysis,
            documentContentAnalysis: report.documentContentAnalysis, // Add the new document content analysis section

            // Add the table sections
            directorsTable: report.directorsTable,
            keyBusinessAgreements: report.keyBusinessAgreements,
            leavePolicy: report.leavePolicy,
            provisionsAndPrepayments: report.provisionsAndPrepayments,
            deferredTaxAssets: report.deferredTaxAssets,

            availableDocuments: report.availableDocuments,
            missingDocumentTypes: report.missingDocumentTypes,
            generatedDate: report.createdAt,
            reportCalculated: report.reportCalculated
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

        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { entityId } = req.params;
        const entityType = req.body.entityType as 'startup' | 'investor' || 'startup';

        if (!entityId) {
            res.status(400).json({ message: 'Entity ID is required' });
            return;
        }

        // Create a new request object with the required parameters
        const modifiedReq = {
            ...req,
            params: { entityId },
            query: { entityType }
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
        const report = await FinancialDueDiligenceReport.findOne({
            targetEntityId: entityId,
            targetEntityType: entityType,
            requestedById: req.user.userId
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
        const report = await FinancialDueDiligenceReport.findOne({
            targetEntityId: entityId,
            targetEntityType: entityType,
            requestedById: req.user.userId
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

        // Get document information for the entity
        const { availableDocuments, missingDocumentTypes } = await getEntityDocuments(entityId, entityType);

        // Return document information
        res.json({
            availableDocuments,
            missingDocumentTypes
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

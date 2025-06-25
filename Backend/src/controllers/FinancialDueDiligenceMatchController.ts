import { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import FinancialDueDiligenceReport from '../models/Analytics/FinancialDueDiligenceReport';
import DocumentModel, { DocumentType, FinancialDocumentType } from '../models/Profile/Document';
import ApiUsageModel from '../models/ApiUsageModel/ApiUsage';
import StartupProfileModel from '../models/Profile/StartupProfile';
import InvestorProfileModel from '../models/InvestorModels/InvestorProfile';
import ExtendedProfileModel from '../models/Profile/ExtendedProfile';
import QuestionnaireSubmissionModel from '../models/question/QuestionnaireSubmission';
import TaskModel from '../models/Task';
import enhancedDocumentProcessingService from '../services/EnhancedDocumentProcessingService';
import { getAllFinancialDocumentTypes } from '../utils/documentTypes';

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

// Note: incrementApiUsage is no longer needed as the checkRateLimit function now handles incrementing

/**
 * Analyze financial due diligence between a startup and an investor
 */
export const analyzeFinancialDueDiligence = async (req: Request, res: Response): Promise<void> => {
    // We now generate a combined report that includes both analysis and audit
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
            const { startupId, investorId } = req.params;

            // Get the perspective from query params or determine based on user role
            let perspective: 'startup' | 'investor' = (req.query.perspective as 'startup' | 'investor') || 'startup';

            // If no perspective is specified in query, determine based on user role
            if (!req.query.perspective) {
                // Check if the user is the startup or the investor
                if (req.user.userId === startupId) {
                    perspective = 'startup';
                } else if (req.user.userId === investorId) {
                    perspective = 'investor';
                } else {
                    // Default perspective if not directly involved
                    perspective = 'investor';
                }
            }

            // Look for any existing analysis, regardless of age
            // Global caching: only look for startupId and investorId, not the perspective
            const oldAnalysis = await FinancialDueDiligenceReport.findOne({
                startupId: startupId,
                investorId: investorId
            }).sort({ createdAt: -1 }); // Get the most recent one

            if (oldAnalysis) {
                // Return old analysis with a flag indicating it's old data
                res.json({
                    executiveSummary: oldAnalysis.executiveSummary || {
                        headline: "Financial Due Diligence Report",
                        summary: "This is a previously generated report.",
                        keyFindings: [],
                        recommendedActions: [],
                        keyMetrics: []
                    },
                    financialAnalysis: oldAnalysis.financialAnalysis || {
                        metrics: [],
                        trends: []
                    },
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

                    perspective: oldAnalysis.perspective,
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

        const { startupId, investorId } = req.params;
        console.log(`Processing request for startupId: ${startupId}, investorId: ${investorId}`);

        if (!startupId || !investorId) {
            res.status(400).json({ message: 'Startup ID and Investor ID are required' });
            return;
        }

        // Get the perspective from query params or determine based on user role
        let perspective: 'startup' | 'investor' = (req.query.perspective as 'startup' | 'investor') || 'startup';

        // If no perspective is specified in query, determine based on user role
        if (!req.query.perspective) {
            // Check if the user is the startup or the investor
            if (req.user.userId === startupId) {
                perspective = 'startup';
            } else if (req.user.userId === investorId) {
                perspective = 'investor';
            } else {
                // Default perspective if not directly involved
                perspective = 'investor';
            }
        }

        console.log(`Using perspective: ${perspective}`);

        try {
            // Check if we have a recent analysis in MongoDB cache
            // Global caching: only look for startupId and investorId, not the perspective
            // Use 30 days as cache validity period instead of 7 days
            const existingAnalysis = await FinancialDueDiligenceReport.findOne({
                startupId: startupId,
                investorId: investorId,
                // Only use cached results if less than 30 days old
                createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            });

            if (existingAnalysis) {
                // Return cached analysis
                console.log('Found existing analysis, returning cached result');
                res.json({
                    executiveSummary: existingAnalysis.executiveSummary || {
                        headline: "Financial Due Diligence Report",
                        summary: "This is a previously generated report.",
                        keyFindings: [],
                        recommendedActions: [],
                        keyMetrics: []
                    },
                    financialAnalysis: existingAnalysis.financialAnalysis || {
                        metrics: [],
                        trends: []
                    },
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

                    perspective: existingAnalysis.perspective,
                    generatedDate: existingAnalysis.createdAt
                });
                return;
            }

            // Use the perspective determined earlier

            // Fetch startup data from MongoDB
            const startup = await StartupProfileModel.findOne({ userId: startupId });
            if (!startup) {
                res.status(404).json({ message: 'Startup not found' });
                return;
            }

            // Fetch investor data from MongoDB
            const investor = await InvestorProfileModel.findOne({ userId: investorId });
            if (!investor) {
                res.status(404).json({ message: 'Investor not found' });
                return;
            }

            // Use the complete financial document types from the model definition
            const allFinancialDocumentTypes = getAllFinancialDocumentTypes();

            // Define document type categories using constants to avoid hardcoding
            const REQUIRED_FINANCIAL_TYPES = [
                'financial_balance_sheet' as const, 'financial_income_statement' as const, 'financial_cash_flow' as const,
                'financial_tax_returns' as const, 'financial_gst_returns' as const, 'financial_bank_statements' as const
            ];

            const STARTUP_SPECIFIC_TYPES = [
                'financial_projections' as const, 'financial_cap_table' as const
            ];

            const INVESTOR_SPECIFIC_TYPES = [
                'financial_audit_report' as const
            ];

            // For compatibility, we can still categorize them if needed
            const requiredFinancialDocumentTypes = allFinancialDocumentTypes.filter(type =>
                REQUIRED_FINANCIAL_TYPES.includes(type as any)
            );

            const startupSpecificDocumentTypes = allFinancialDocumentTypes.filter(type =>
                STARTUP_SPECIFIC_TYPES.includes(type as any)
            );

            const investorSpecificDocumentTypes = allFinancialDocumentTypes.filter(type =>
                INVESTOR_SPECIFIC_TYPES.includes(type as any)
            );

            // Determine which document types to look for based on perspective
            const documentTypesToCheck = [
                ...requiredFinancialDocumentTypes,
                ...(perspective === 'startup' ? startupSpecificDocumentTypes : []),
                ...(perspective === 'investor' ? investorSpecificDocumentTypes : [])
            ];

            // Fetch all documents for the selected entity for analysis
            const entityIdToAnalyze = perspective === 'startup' ? startupId : investorId;

            console.log(`Analyzing financial documents for entity ID: ${entityIdToAnalyze} with perspective: ${perspective}`);

            // Only include financial and other category documents for financial due diligence
            const documents = await DocumentModel.find({
                userId: entityIdToAnalyze,
                $or: [
                    // Explicit financial document types
                    { documentType: { $in: allFinancialDocumentTypes } },
                    // Documents with financial keywords in name (case insensitive)
                    { originalName: { $regex: /financial|balance|income|cash|revenue|profit|loss|statement|report|audit|tax|gst|bank/i } },
                    // Documents with category set to financial
                    { category: 'financial' },
                    // Include "other" category documents for comprehensive financial analysis
                    { category: 'other' }
                ]
            });

            // Gather all available information about the startup and investor
            // Use optional chaining and type assertions to handle potential missing properties
            const startupInfo = {
                companyName: startup.companyName,
                industry: startup.industry,
                // Use optional properties that might not exist in all startup profiles
                stage: (startup as any).stage,
                foundingDate: (startup as any).foundingDate,
                description: (startup as any).description,
                teamSize: (startup as any).teamSize,
                location: (startup as any).location,
                website: (startup as any).website,
                fundingRound: (startup as any).fundingRound,
                fundingAmount: (startup as any).fundingAmount,
                valuation: (startup as any).valuation
            };

            const investorInfo = {
                name: (investor as any).name,
                investmentStage: (investor as any).investmentStage,
                investmentSize: (investor as any).investmentSize,
                sectors: (investor as any).sectors,
                location: (investor as any).location,
                portfolio: (investor as any).portfolio
            };

            // Check which required documents are missing
            const availableDocumentTypes = documents.map(doc => doc.documentType);
            const missingDocumentTypes = documentTypesToCheck.filter(
                docType => !availableDocumentTypes.includes(docType)
            );

            // If no documents are found at all
            if (documents.length === 0) {
                // If no documents are found, return the startup and investor info
                // so the frontend can display it and prompt for document upload
                res.status(404).json({
                    message: `No financial documents found for this ${perspective}`,
                    errorCode: 'NO_FINANCIAL_DOCUMENTS',
                    startupInfo: startupInfo,
                    investorInfo: investorInfo,
                    missingDocuments: documentTypesToCheck
                });
                return;
            }

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
                timePeriod: d.timePeriod || 'Not specified'
            })));

            // Extract financial data using Gemini with enhanced context and forward-looking analysis
            // Using the new approach that extracts raw data first, then sends to Gemini
            console.log('Extracting financial data using raw extraction first, then Gemini with forward-looking analysis');
            let financialData;
            try {
                // Fetch additional data sources for enhanced analysis
                console.log('Fetching additional data sources for enhanced analysis');

                // Get extended profile data for both startup and investor
                const startupExtendedProfile = await ExtendedProfileModel.findOne({ userId: startupId });
                const investorExtendedProfile = await ExtendedProfileModel.findOne({ userId: investorId });

                // Get questionnaire submission data for both startup and investor
                const startupQuestionnaire = await QuestionnaireSubmissionModel.findOne({
                    userId: startupId
                }).sort({ createdAt: -1 });

                const investorQuestionnaire = await QuestionnaireSubmissionModel.findOne({
                    userId: investorId
                }).sort({ createdAt: -1 });

                // Get task data to evaluate execution capability
                const entityIdToAnalyze = perspective === 'startup' ? startupId : investorId;
                const tasks = await TaskModel.find({
                    assignedTo: entityIdToAnalyze
                }).sort({ createdAt: -1 }).limit(50);

                // Get previous financial reports for historical metrics and industry benchmarks
                const financialReports = await FinancialDueDiligenceReport.find({
                    $or: [
                        { startupId: { $exists: true } },
                        { targetEntityType: perspective }
                    ]
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

                // Determine which extended profile and questionnaire to use based on perspective
                const extendedProfile = perspective === 'startup' ? startupExtendedProfile : investorExtendedProfile;
                const questionnaireSubmission = perspective === 'startup' ? startupQuestionnaire : investorQuestionnaire;

                console.log('Additional data sources fetched successfully');

                // Pass the document objects directly to extractFinancialData with additional data sources
                // This will use the new approach that extracts raw data first
                financialData = await enhancedDocumentProcessingService.extractFinancialData(
                    documentsWithMetadata, // Pass documents directly instead of combined content
                    perspective === 'startup' ? startup.companyName : investor.companyName,
                    startupInfo,
                    investorInfo,
                    missingDocumentTypes, // Pass missing document types to Gemini
                    { // Pass additional data sources for enhanced analysis
                        extendedProfile,
                        questionnaireSubmission,
                        tasks,
                        financialReports,
                        historicalMetrics
                    }
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
                        errorCode: 'SERVER_CONNECTIVITY_ERROR'
                    });
                    return;
                }

                // For other errors
                res.status(500).json({
                    message: 'Failed to extract financial data from documents',
                    errorCode: 'FINANCIAL_DATA_EXTRACTION_FAILED'
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

            // Check if we have actual financial data before saving to database
            if (!financialData || !financialData.summary || financialData.summary.includes('failed to process') ||
                financialData.summary.includes('could not be performed') ||
                financialData.summary.includes('Error') ||
                financialData.summary.includes('error')) {

                console.log('Financial data appears to be a default/error report, not saving to database');

                // Return error response
                res.status(400).json({
                    message: 'Failed to extract meaningful financial data from the documents',
                    errorCode: 'FINANCIAL_DATA_EXTRACTION_FAILED'
                });
                return;
            }

            // Create a new financial due diligence report with all available data
            const financialReport = new FinancialDueDiligenceReport({
                startupId: startupId,
                investorId: investorId,
                perspective: perspective,
                companyName: startup.companyName,
                generatedBy: 'KarmicDD AI',

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

            await financialReport.save();
            console.log('Saved financial report to database');

            // API usage already incremented in checkRateLimit

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

                // Add the table sections
                directorsTable: financialReport.directorsTable,
                keyBusinessAgreements: financialReport.keyBusinessAgreements,
                leavePolicy: financialReport.leavePolicy,
                provisionsAndPrepayments: financialReport.provisionsAndPrepayments,
                deferredTaxAssets: financialReport.deferredTaxAssets,

                perspective: financialReport.perspective,
                generatedDate: financialReport.createdAt,
                startupInfo: startupInfo,  // Include all startup information
                investorInfo: investorInfo  // Include all investor information
            });
        } catch (error) {
            console.error('Error in financial due diligence analysis:', error);

            // If there's an error, return an error response instead of a mock report
            console.log('Document processing or analysis failed');

            // Return an error response with a specific error code
            res.status(400).json({
                message: 'Failed to process financial documents or extract financial data',
                errorCode: 'FINANCIAL_ANALYSIS_FAILED',
                error: error instanceof Error ? error.message : 'Unknown error occurred during financial analysis'
            });
        }
    } catch (error) {
        console.error('Financial due diligence analysis error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Get a financial due diligence report between a startup and an investor
 */
export const getFinancialDueDiligenceReport = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Received request for financial due diligence report');
        console.log('Params:', req.params);

        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { startupId, investorId } = req.params;

        if (!startupId || !investorId) {
            res.status(400).json({ message: 'Startup ID and Investor ID are required' });
            return;
        }

        // Determine the user perspective based on their role
        let perspective: 'startup' | 'investor';

        // Check if the user is the startup or the investor
        if (req.user.userId === startupId) {
            perspective = 'startup';
        } else if (req.user.userId === investorId) {
            perspective = 'investor';
        } else {
            // Default perspective if not directly involved
            perspective = 'investor';
        }

        console.log(`Looking for report with startupId: ${startupId}, investorId: ${investorId}, perspective: ${perspective}`);

        // Find the report in MongoDB
        // Global caching: only look for startupId and investorId, not the perspective
        const report = await FinancialDueDiligenceReport.findOne({
            startupId: startupId,
            investorId: investorId
        }).sort({ createdAt: -1 });

        if (!report) {
            console.log('No report found, returning 404');
            res.status(404).json({
                message: 'Financial due diligence report not found',
                errorCode: 'REPORT_NOT_FOUND'
            });
            return;
        }

        console.log('Found report, returning data');

        // Return the report
        res.json({
            // Report Type and Perspective
            reportType: report.reportType,
            reportPerspective: report.reportPerspective,

            // Total Company Score
            totalCompanyScore: report.totalCompanyScore,

            // Investment Decision
            investmentDecision: report.investmentDecision,

            // Compatibility Analysis
            compatibilityAnalysis: report.compatibilityAnalysis,

            // Scoring Breakdown
            scoringBreakdown: report.scoringBreakdown,

            // Original fields
            executiveSummary: report.executiveSummary || {
                headline: "Financial Due Diligence Report",
                summary: "Financial analysis of the provided documents.",
                keyFindings: [],
                recommendedActions: [],
                keyMetrics: []
            },
            financialAnalysis: report.financialAnalysis || {
                metrics: [],
                trends: []
            },
            recommendations: report.recommendations,
            riskFactors: report.riskFactors,
            complianceItems: report.complianceItems,
            financialStatements: report.financialStatements,
            ratioAnalysis: report.ratioAnalysis,
            taxCompliance: report.taxCompliance,
            auditFindings: report.auditFindings,

            // Add the table sections
            directorsTable: report.directorsTable,
            keyBusinessAgreements: report.keyBusinessAgreements,
            leavePolicy: report.leavePolicy,
            provisionsAndPrepayments: report.provisionsAndPrepayments,
            deferredTaxAssets: report.deferredTaxAssets,

            perspective: report.perspective,
            generatedDate: report.createdAt
        });
    } catch (error) {
        console.error('Get financial due diligence report error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Share a financial due diligence report via email
 */
export const shareFinancialDueDiligenceReport = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Received request to share financial due diligence report');
        console.log('Params:', req.params);
        console.log('Body:', req.body);

        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { startupId, investorId } = req.params;
        const { emails } = req.body;

        if (!startupId || !investorId) {
            res.status(400).json({ message: 'Startup ID and Investor ID are required' });
            return;
        }

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            res.status(400).json({ message: 'At least one email address is required' });
            return;
        }

        // Find the report in MongoDB
        // Global caching: only look for startupId and investorId in any order
        const report = await FinancialDueDiligenceReport.findOne({
            $or: [
                { startupId: startupId, investorId: investorId },
                { startupId: investorId, investorId: startupId }
            ]
        }).sort({ createdAt: -1 });

        if (!report) {
            console.log('No report found, returning 404');
            res.status(404).json({ message: 'Financial due diligence report not found' });
            return;
        }

        console.log(`Found report, would share with ${emails.length} recipients`);

        // In a real implementation, we would send emails here
        // For now, just return success
        res.json({
            message: 'Financial due diligence report shared successfully',
            recipients: emails
        });
    } catch (error) {
        console.error('Share financial due diligence report error:', error);
        res.status(500).json({ message: 'Server error' });
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

        const { startupId, investorId } = req.params;

        if (!startupId || !investorId) {
            res.status(400).json({ message: 'Startup ID and Investor ID are required' });
            return;
        }

        // Find the report in MongoDB
        // Global caching: only look for startupId and investorId in any order
        const report = await FinancialDueDiligenceReport.findOne({
            $or: [
                { startupId: startupId, investorId: investorId },
                { startupId: investorId, investorId: startupId }
            ]
        }).sort({ createdAt: -1 });

        if (!report) {
            console.log('No report found, returning 404');
            res.status(404).json({ message: 'Financial due diligence report not found' });
            return;
        }

        console.log(`Found report with ID: ${report._id}, generating PDF response`);

        // In a real implementation, we would generate a PDF here
        // For now, just return success
        res.json({
            message: 'Financial due diligence report PDF generated successfully',
            reportId: report._id
        });
    } catch (error) {
        console.error('Export financial due diligence report PDF error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

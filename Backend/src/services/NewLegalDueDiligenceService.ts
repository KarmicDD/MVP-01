import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { cleanJsonResponse, safeJsonParse } from '../utils/jsonHelper';
import { NEW_LEGAL_DD_PROMPT, NEW_LEGAL_DD_STRUCTURE } from './document-processing/newLegalDDPrompt';
import fileLogger from '../utils/fileLogger';
import { MemoryBasedOcrPdfService, DocumentMetadata } from './MemoryBasedOcrPdfService';

// Load environment variables
dotenv.config();

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || '';
if (!apiKey) {
    console.warn('Warning: GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

// Create specialized model for legal analysis
// Using gemini-2.5-flash-preview for legal due diligence with optimized settings
const legalAnalysisModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-preview-05-20",
    generationConfig: {
        maxOutputTokens: 65536,
        temperature: 0.1, // Very low temperature for more consistent legal analysis
        topK: 40,
        topP: 0.95,
        responseMimeType: 'application/json',
    },
    systemInstruction: NEW_LEGAL_DD_PROMPT
});

/**
 * Utility function to execute a Gemini API call with dynamic retry logic based on error response
 * @param apiCallFn Function that makes the actual API call
 * @param maxRetries Maximum number of retry attempts
 * @param initialDelay Initial delay in milliseconds before the first retry if no retryDelay is provided
 * @returns Promise with the API call result
 */
async function executeGeminiWithDynamicRetry<T>(
    apiCallFn: () => Promise<T>,
    maxRetries: number = 5,
    initialDelay: number = 30000 // 30 seconds initial delay
): Promise<T> {
    let lastError: any = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            // Attempt the API call
            return await apiCallFn();
        } catch (error: any) {
            lastError = error;
            console.error(`Gemini API call failed (attempt ${attempt + 1}/${maxRetries + 1}):`, error);

            // Check if we've reached the maximum number of retries
            if (attempt === maxRetries) {
                console.error(`All ${maxRetries} retry attempts failed for Gemini API call`);
                throw lastError;
            }

            // Extract retryDelay from error if available
            let retryDelayMs = initialDelay;

            // Check for retryDelay in error details
            if (error && error.errorDetails) {
                for (const detail of error.errorDetails) {
                    if (detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo' && detail.retryDelay) {
                        // Parse the retryDelay string (e.g., "25s") to milliseconds
                        const retryDelayStr = detail.retryDelay;
                        const secondsMatch = retryDelayStr.match(/(\d+)s/);
                        if (secondsMatch && secondsMatch[1]) {
                            const seconds = parseInt(secondsMatch[1], 10);
                            // Add 1 second to the retry delay
                            retryDelayMs = (seconds + 1) * 1000;
                            console.log(`Using dynamic retry delay from API response: ${seconds}s + 1s = ${retryDelayMs / 1000}s`);
                        }
                    }
                }
            }

            // For rate limit errors (429), use exponential backoff if no specific delay provided
            if (error.status === 429 && retryDelayMs === initialDelay) {
                retryDelayMs = initialDelay * Math.pow(2, attempt);
                console.log(`Rate limit error (429) with no specific delay. Using exponential backoff: ${retryDelayMs / 1000}s`);
            }

            console.log(`Waiting ${retryDelayMs / 1000} seconds before retry attempt ${attempt + 2}...`);

            // Wait before the next retry
            await new Promise(resolve => setTimeout(resolve, retryDelayMs));
        }
    }

    // This should never be reached due to the throw in the loop, but TypeScript needs it
    throw lastError || new Error('Unknown error occurred during API call retries');
}

// Promisify fs functions
const readFileAsync = promisify(fs.readFile);

/**
 * Service for handling the new Legal Due Diligence feature
 * Follows SOLID principles with single responsibility for legal due diligence
 * Uses memory-based OCR PDF processing for improved performance and no local storage
 */
class NewLegalDueDiligenceService {
    private memoryBasedOcrService: MemoryBasedOcrPdfService;

    constructor() {
        this.memoryBasedOcrService = new MemoryBasedOcrPdfService();
    }

    /**
     * Process documents for legal due diligence using memory-based OCR
     * Processes PDFs in memory without saving to disk, optimized for batch processing
     * @param documents Array of document objects with file paths and metadata
     * @returns Processed document content with OCR results
     */
    async processDocumentsInBatches(documents: Array<{
        filePath: string,
        documentType: string,
        originalName: string,
        description?: string,
        timePeriod?: string,
        fileType?: string,
        fileSize?: number,
        createdAt?: string,
        updatedAt?: string
    }>): Promise<string> {
        try {
            console.log(`Processing ${documents.length} legal documents using memory-based OCR service`);

            // Filter PDF documents for OCR processing
            const pdfDocuments = documents.filter(doc => {
                const fileExt = path.extname(doc.filePath).toLowerCase();
                return fileExt === '.pdf';
            });

            // Process non-PDF documents with traditional methods (if any)
            const nonPdfDocuments = documents.filter(doc => {
                const fileExt = path.extname(doc.filePath).toLowerCase();
                return fileExt !== '.pdf';
            });

            let combinedContent = '';

            // Process PDF documents with memory-based OCR
            if (pdfDocuments.length > 0) {
                console.log(`Processing ${pdfDocuments.length} PDF documents with memory-based OCR using combine-first approach`);

                // Prepare documents for memory-based processing
                const documentsWithBuffers: Array<{
                    buffer: Buffer;
                    metadata: DocumentMetadata;
                }> = [];

                // Read PDF files into memory
                for (const doc of pdfDocuments) {
                    try {
                        if (!fs.existsSync(doc.filePath)) {
                            console.error(`PDF file not found: ${doc.filePath}`);
                            combinedContent += `## Error processing ${doc.originalName || 'Unnamed Document'}\n`;
                            combinedContent += `[File not found: The document appears to be missing from the server.]\n\n`;
                            continue;
                        }

                        const buffer = await readFileAsync(doc.filePath);
                        const metadata: DocumentMetadata = {
                            originalName: doc.originalName,
                            documentType: doc.documentType,
                            description: doc.description,
                            timePeriod: doc.timePeriod,
                            fileType: 'pdf',
                            fileSize: doc.fileSize
                        };

                        documentsWithBuffers.push({ buffer, metadata });
                    } catch (error) {
                        console.error(`Error reading PDF file ${doc.filePath}:`, error);
                        combinedContent += `## Error processing ${doc.originalName || 'Unnamed Document'}\n`;
                        combinedContent += `[Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}]\n\n`;
                    }
                }

                // Process PDFs with memory-based OCR service using the new combine-first approach
                if (documentsWithBuffers.length > 0) {
                    try {
                        console.log(`Using new combine-first approach: will combine ${documentsWithBuffers.length} PDFs into one before chunking`);

                        // Use the new processMultiplePdfDocuments method which combines first, then chunks
                        const ocrResult = await this.memoryBasedOcrService.processMultiplePdfDocuments(
                            documentsWithBuffers
                        );
                        combinedContent += ocrResult + '\n\n';
                    } catch (ocrError) {
                        console.error('Error in memory-based OCR processing:', ocrError);
                        combinedContent += `## Error in OCR Processing\n`;
                        combinedContent += `[OCR processing failed: ${ocrError instanceof Error ? ocrError.message : 'Unknown error'}]\n\n`;
                    }
                }
            }

            // Process non-PDF documents with traditional methods (if any)
            if (nonPdfDocuments.length > 0) {
                console.log(`Processing ${nonPdfDocuments.length} non-PDF documents with traditional methods`);

                for (const doc of nonPdfDocuments) {
                    try {
                        if (!fs.existsSync(doc.filePath)) {
                            console.error(`File not found: ${doc.filePath}`);
                            combinedContent += `## Error processing ${doc.originalName || 'Unnamed Document'}\n`;
                            combinedContent += `[File not found: The document appears to be missing from the server.]\n\n`;
                            continue;
                        }

                        // For non-PDF files, add basic file information
                        // In the future, this could be extended to handle other file types
                        const formattedType = doc.documentType.replace('legal_', '').replace(/_/g, ' ');
                        combinedContent += `## ${formattedType} - ${doc.originalName || 'Unnamed Document'}\n`;
                        combinedContent += `Time Period: ${doc.timePeriod || 'Not specified'}\n`;
                        combinedContent += `[Non-PDF document - OCR processing not available for this file type]\n\n`;
                    } catch (error) {
                        console.error(`Error processing non-PDF file ${doc.filePath}:`, error);
                        combinedContent += `## Error processing ${doc.originalName || 'Unnamed Document'}\n`;
                        combinedContent += `[Error: ${error instanceof Error ? error.message : 'Unknown error'}]\n\n`;
                    }
                }
            }

            return combinedContent;
        } catch (error) {
            console.error('Error processing legal documents in batches:', error);

            // Log batch processing error to file
            fileLogger.logTextToFile(
                `Legal memory-based batch processing error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nStack trace: ${error instanceof Error ? error.stack : 'No stack trace available'}\n\nDocuments info: ${JSON.stringify(documents.map(doc => ({ name: doc.originalName, type: doc.documentType })))}`,
                'legal_memory_batch_processing_error'
            );

            throw error;
        }
    }

    /**
     * Generate a legal due diligence report using Gemini
     * @param documentContent Combined document content
     * @param companyName Name of the company being analyzed
     * @param additionalContext Any additional context for the analysis
     * @returns Legal due diligence report in JSON format
     */
    async generateLegalDueDiligenceReport(
        documentContent: string,
        companyName: string,
        additionalContext?: string
    ): Promise<any> {
        try {
            console.log(`Generating legal due diligence report for ${companyName}`);

            // Prepare the analysis prompt with document content
            const analysisPrompt = `
${NEW_LEGAL_DD_STRUCTURE}

COMPANY NAME: ${companyName}
${additionalContext ? `ADDITIONAL CONTEXT: ${additionalContext}` : ''}

LEGAL DOCUMENTS TO ANALYZE:

${documentContent}

Please analyze the above legal documents and provide a comprehensive legal due diligence report following the exact JSON structure specified. Focus on legal risks, compliance issues, corporate governance matters, and regulatory requirements.

Remember to:
1. Analyze every legal document and provision mentioned
2. Cross-reference documents for consistency
3. Identify all compliance gaps and legal risks
4. Provide specific recommendations with timelines
5. Assess materiality and priority of issues
6. Consider the transaction context in your analysis
`;

            console.log('Calling Gemini API for legal due diligence analysis...');

            // Use the retry mechanism for API calls
            const result = await executeGeminiWithDynamicRetry(async () => {
                return await legalAnalysisModel.generateContent(analysisPrompt);
            });

            const response = await result.response;
            let responseText = response.text();

            console.log('Received response from Gemini API for legal analysis');

            // Log the raw response for debugging
            fileLogger.logTextToFile(
                `Legal DD Raw Gemini Response for ${companyName}:\n\n${responseText}`,
                'legal_dd_raw_response'
            );

            // Clean the JSON response
            const cleanedResponse = cleanJsonResponse(responseText);            // Parse the JSON response
            const parsedReport = safeJsonParse(cleanedResponse);

            if (!parsedReport) {
                throw new Error('Failed to parse legal due diligence report JSON from Gemini response');
            }            // Transform the AI response to match our MongoDB schema
            const transformedReport = this.transformAIResponseToSchema(parsedReport);

            // Log the processed report with recommendations info
            console.log(`Recommendations in transformed report: ${transformedReport.recommendations?.length || 0}`);
            fileLogger.logTextToFile(
                `Legal DD Processed Report for ${companyName}:\n\nRecommendations count: ${transformedReport.recommendations?.length || 0}\n\n${JSON.stringify(transformedReport, null, 2)}`,
                'legal_dd_processed_report'
            );

            console.log('Successfully generated legal due diligence report');
            return transformedReport;

        } catch (error) {
            console.error('Error generating legal due diligence report:', error);

            // Log detailed error information
            fileLogger.logTextToFile(
                `Legal DD Report Generation Error for ${companyName}:\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nStack trace: ${error instanceof Error ? error.stack : 'No stack trace available'}\n\nDocument content length: ${documentContent.length} characters`,
                'legal_dd_generation_error'
            );

            throw error;
        }
    }    /**
     * Transform AI response to match MongoDB schema with strict validation
     * NO FALLBACK LOGIC - throws errors if required fields are missing or invalid
     * This ensures only genuine AI-generated legal analysis data is used for real companies
     * @param aiResponse Raw AI response
     * @returns Validated and transformed response matching ILegalAnalysis schema
     */
    private transformAIResponseToSchema(aiResponse: any): any {
        console.log('Transforming AI response to match MongoDB schema with strict validation...');

        // STRICT VALIDATION: Validate AI response structure
        this.validateAIResponse(aiResponse);

        // Handle missingDocuments transformation with validation
        let missingDocuments = this.validateAndTransformMissingDocuments(aiResponse.missingDocuments);

        // STRICT SCHEMA TRANSFORMATION: Only include fields that AI explicitly provides
        // Remove all fallback logic and backward compatibility fields
        const transformedResponse: any = {
            // Core required fields - validated presence
            missingDocuments: missingDocuments
        };

        // Risk and compliance - use only primary field names (remove backward compatibility)
        if (aiResponse.riskScore) {
            this.validateRiskScore(aiResponse.riskScore);
            transformedResponse.riskScore = aiResponse.riskScore;
        }

        if (aiResponse.complianceAssessment) {
            this.validateComplianceAssessment(aiResponse.complianceAssessment);
            transformedResponse.complianceAssessment = aiResponse.complianceAssessment;
        }        // Items array is required - AI must provide this
        if (aiResponse.items && Array.isArray(aiResponse.items) && aiResponse.items.length > 0) {
            this.validateItems(aiResponse.items);
            transformedResponse.items = aiResponse.items;
        } else {
            throw new Error('AI analysis failed: Missing required field "items" - Legal due diligence analysis must provide detailed itemized findings');
        }        // Executive summary is required - AI must provide this
        if (aiResponse.executiveSummary) {
            this.validateExecutiveSummary(aiResponse.executiveSummary);
            transformedResponse.executiveSummary = aiResponse.executiveSummary;
        } else {
            throw new Error('AI analysis failed: Missing required field "executiveSummary" - Legal due diligence analysis must provide executive summary');
        }        // Total company score is MANDATORY - AI must provide this
        if (aiResponse.totalCompanyScore) {
            this.validateTotalCompanyScore(aiResponse.totalCompanyScore);
            transformedResponse.totalCompanyScore = aiResponse.totalCompanyScore;
        } else {
            throw new Error('AI analysis failed: Missing required field "totalCompanyScore" - Legal due diligence analysis must provide company scoring');
        }        // Investment decision is MANDATORY - AI must provide this
        if (aiResponse.investmentDecision) {
            this.validateInvestmentDecision(aiResponse.investmentDecision);
            transformedResponse.investmentDecision = aiResponse.investmentDecision;
        } else {
            throw new Error('AI analysis failed: Missing required field "investmentDecision" - Legal due diligence analysis must provide investment recommendation');
        }

        if (aiResponse.detailedFindings && Array.isArray(aiResponse.detailedFindings)) {
            this.validateDetailedFindings(aiResponse.detailedFindings);
            transformedResponse.detailedFindings = aiResponse.detailedFindings;
        }

        if (aiResponse.recommendations && Array.isArray(aiResponse.recommendations)) {
            this.validateRecommendations(aiResponse.recommendations);
            transformedResponse.recommendations = aiResponse.recommendations;
        }

        if (aiResponse.reportMetadata) {
            this.validateReportMetadata(aiResponse.reportMetadata);
            transformedResponse.reportMetadata = aiResponse.reportMetadata;
        }        // Simple optional fields (no complex validation needed)
        if (aiResponse.introduction) transformedResponse.introduction = aiResponse.introduction;
        if (aiResponse.disclaimer) transformedResponse.disclaimer = aiResponse.disclaimer;

        // Additional analysis sections from JSON structure
        if (aiResponse.corporateStructure) {
            this.validateAnalysisSection(aiResponse.corporateStructure, 'corporateStructure');
            transformedResponse.corporateStructure = aiResponse.corporateStructure;
        }

        if (aiResponse.regulatoryCompliance) {
            this.validateAnalysisSection(aiResponse.regulatoryCompliance, 'regulatoryCompliance');
            transformedResponse.regulatoryCompliance = aiResponse.regulatoryCompliance;
        }

        if (aiResponse.materialAgreements) {
            this.validateAnalysisSection(aiResponse.materialAgreements, 'materialAgreements');
            transformedResponse.materialAgreements = aiResponse.materialAgreements;
        }

        if (aiResponse.intellectualProperty) {
            this.validateAnalysisSection(aiResponse.intellectualProperty, 'intellectualProperty');
            transformedResponse.intellectualProperty = aiResponse.intellectualProperty;
        }

        if (aiResponse.litigationAndDisputes) {
            this.validateAnalysisSection(aiResponse.litigationAndDisputes, 'litigationAndDisputes');
            transformedResponse.litigationAndDisputes = aiResponse.litigationAndDisputes;
        }

        if (aiResponse.regulatoryFilings) {
            this.validateAnalysisSection(aiResponse.regulatoryFilings, 'regulatoryFilings');
            transformedResponse.regulatoryFilings = aiResponse.regulatoryFilings;
        } console.log(`Strict validation passed. Transformed AI response with validated structure - all required fields provided by AI.`);
        return transformedResponse;
    }    /**
     * Validate the overall AI response structure
     */
    private validateAIResponse(aiResponse: any): void {
        if (!aiResponse || typeof aiResponse !== 'object') {
            throw new Error('Invalid AI response: Response must be a valid JSON object');
        }

        // Validate that required fields are present - no fallbacks allowed
        if (!aiResponse.missingDocuments) {
            throw new Error('Invalid AI response: Missing required field "missingDocuments"');
        }

        if (!aiResponse.totalCompanyScore) {
            throw new Error('Invalid AI response: Missing required field "totalCompanyScore"');
        }

        if (!aiResponse.investmentDecision) {
            throw new Error('Invalid AI response: Missing required field "investmentDecision"');
        }

        if (!aiResponse.items || !Array.isArray(aiResponse.items) || aiResponse.items.length === 0) {
            throw new Error('Invalid AI response: Missing or empty required field "items"');
        }

        if (!aiResponse.executiveSummary || !aiResponse.executiveSummary.headline || !aiResponse.executiveSummary.summary) {
            throw new Error('Invalid AI response: Missing required executiveSummary fields (headline and summary)');
        }
    }

    /**
     * Validate and transform missingDocuments field
     */
    private validateAndTransformMissingDocuments(missingDocuments: any): any {
        if (!missingDocuments) {
            throw new Error('Missing required field: missingDocuments');
        }

        // Handle if AI returns array format (transform to expected object format)
        if (Array.isArray(missingDocuments)) {
            const missingDocsArray = missingDocuments as string[];
            return {
                documentList: missingDocsArray.map(docString => {
                    if (typeof docString !== 'string') {
                        throw new Error('Invalid missingDocuments: Each document must be a string');
                    }
                    return {
                        documentCategory: 'Legal Documents',
                        specificDocument: docString,
                        requirementReference: 'Required for comprehensive legal due diligence'
                    };
                }),
                note: missingDocsArray.length > 0
                    ? `Missing ${missingDocsArray.length} document(s) may limit the completeness of legal compliance assessment and risk evaluation.`
                    : 'No missing documents identified.'
            };
        }

        // Validate object format
        if (typeof missingDocuments !== 'object') {
            throw new Error('Invalid missingDocuments: Must be an object or array');
        }

        if (!missingDocuments.documentList || !Array.isArray(missingDocuments.documentList)) {
            throw new Error('Invalid missingDocuments: documentList must be an array');
        }

        // Validate each document in the list
        missingDocuments.documentList.forEach((doc: any, index: number) => {
            if (!doc || typeof doc !== 'object') {
                throw new Error(`Invalid missingDocuments: documentList[${index}] must be an object`);
            }
            if (!doc.documentCategory || typeof doc.documentCategory !== 'string') {
                throw new Error(`Invalid missingDocuments: documentList[${index}].documentCategory is required and must be a string`);
            }
            if (!doc.specificDocument || typeof doc.specificDocument !== 'string') {
                throw new Error(`Invalid missingDocuments: documentList[${index}].specificDocument is required and must be a string`);
            }
            if (!doc.requirementReference || typeof doc.requirementReference !== 'string') {
                throw new Error(`Invalid missingDocuments: documentList[${index}].requirementReference is required and must be a string`);
            }
        });

        return missingDocuments;
    }

    /**
     * Validate risk score structure
     */
    private validateRiskScore(riskScore: any): void {
        if (!riskScore || typeof riskScore !== 'object') {
            throw new Error('Invalid riskScore: Must be an object');
        }

        const requiredFields = ['score', 'riskLevel', 'justification'];
        for (const field of requiredFields) {
            if (!riskScore[field] || typeof riskScore[field] !== 'string') {
                throw new Error(`Invalid riskScore: ${field} is required and must be a string`);
            }
        }

        const validRiskLevels = ['High', 'Medium', 'Low', 'Critical', 'Significant', 'Moderate', 'Minor', 'Informational'];
        if (!validRiskLevels.includes(riskScore.riskLevel)) {
            throw new Error(`Invalid riskScore: riskLevel must be one of ${validRiskLevels.join(', ')}`);
        }
    }

    /**
     * Validate compliance assessment structure
     */
    private validateComplianceAssessment(complianceAssessment: any): void {
        if (!complianceAssessment || typeof complianceAssessment !== 'object') {
            throw new Error('Invalid complianceAssessment: Must be an object');
        }

        const requiredFields = ['complianceScore', 'details'];
        for (const field of requiredFields) {
            if (!complianceAssessment[field] || typeof complianceAssessment[field] !== 'string') {
                throw new Error(`Invalid complianceAssessment: ${field} is required and must be a string`);
            }
        }

        if (complianceAssessment.status) {
            const validStatuses = ['Compliant', 'Partially Compliant', 'Non-Compliant', 'Not Assessed'];
            if (!validStatuses.includes(complianceAssessment.status)) {
                throw new Error(`Invalid complianceAssessment: status must be one of ${validStatuses.join(', ')}`);
            }
        }
    }

    /**
     * Validate items array structure
     */
    private validateItems(items: any[]): void {
        items.forEach((item: any, index: number) => {
            if (!item || typeof item !== 'object') {
                throw new Error(`Invalid items[${index}]: Must be an object`);
            }

            const requiredFields = ['title'];
            for (const field of requiredFields) {
                if (!item[field] || typeof item[field] !== 'string') {
                    throw new Error(`Invalid items[${index}]: ${field} is required and must be a string`);
                }
            }            // Validate array fields that should remain as arrays
            const arrayFields = ['facts', 'keyFindings'];
            for (const field of arrayFields) {
                if (item[field] && !Array.isArray(item[field])) {
                    throw new Error(`Invalid items[${index}]: ${field} must be an array`);
                }
            }

            // Validate string fields that should be strings (including recommendedActions)
            const stringFields = ['recommendedActions'];
            for (const field of stringFields) {
                if (item[field] && typeof item[field] !== 'string') {
                    throw new Error(`Invalid items[${index}]: ${field} must be a string`);
                }
            }
        });
    }    /**
     * Validate executive summary structure
     */
    private validateExecutiveSummary(executiveSummary: any): void {
        if (!executiveSummary || typeof executiveSummary !== 'object') {
            throw new Error('Invalid executiveSummary: Must be an object');
        }

        // Require critical fields - no defaults/fallbacks
        if (!executiveSummary.headline || typeof executiveSummary.headline !== 'string') {
            throw new Error('Invalid executiveSummary: headline is required and must be a string');
        }

        if (!executiveSummary.summary || typeof executiveSummary.summary !== 'string') {
            throw new Error('Invalid executiveSummary: summary is required and must be a string');
        }        // Validate array fields that should remain as arrays
        const arrayFields = ['keyFindings'];
        for (const field of arrayFields) {
            if (executiveSummary[field] && !Array.isArray(executiveSummary[field])) {
                throw new Error(`Invalid executiveSummary: ${field} must be an array`);
            }
        }

        // Validate string fields that should be strings (including recommendedActions)
        const stringFields = ['recommendedActions'];
        for (const field of stringFields) {
            if (executiveSummary[field] && typeof executiveSummary[field] !== 'string') {
                throw new Error(`Invalid executiveSummary: ${field} must be a string`);
            }
        }
    }

    /**
     * Validate total company score structure
     */
    private validateTotalCompanyScore(totalCompanyScore: any): void {
        if (!totalCompanyScore || typeof totalCompanyScore !== 'object') {
            throw new Error('Invalid totalCompanyScore: Must be an object');
        }

        const requiredFields = ['score', 'rating', 'description'];
        for (const field of requiredFields) {
            if (totalCompanyScore[field] === undefined || totalCompanyScore[field] === null) {
                throw new Error(`Invalid totalCompanyScore: ${field} is required`);
            }
        }

        if (typeof totalCompanyScore.score !== 'number') {
            throw new Error('Invalid totalCompanyScore: score must be a number');
        }

        if (typeof totalCompanyScore.rating !== 'string' || typeof totalCompanyScore.description !== 'string') {
            throw new Error('Invalid totalCompanyScore: rating and description must be strings');
        }
    }    /**
     * Validate investment decision structure
     */
    private validateInvestmentDecision(investmentDecision: any): void {
        if (!investmentDecision || typeof investmentDecision !== 'object') {
            throw new Error('Invalid investmentDecision: Must be an object');
        }

        const requiredFields = ['recommendation', 'justification'];
        for (const field of requiredFields) {
            if (!investmentDecision[field] || typeof investmentDecision[field] !== 'string') {
                throw new Error(`Invalid investmentDecision: ${field} is required and must be a string`);
            }
        }        // Ensure successProbability is a number between 0 and 100 (set default if invalid)
        if (investmentDecision.successProbability !== undefined && investmentDecision.successProbability !== null) {
            if (typeof investmentDecision.successProbability !== 'number' ||
                investmentDecision.successProbability < 0 ||
                investmentDecision.successProbability > 100) {
                console.log(`Invalid investmentDecision.successProbability: ${investmentDecision.successProbability}. Setting default.`);
                investmentDecision.successProbability = 50;
            }
        } else {
            // Set default value if not provided or null
            console.log(`Missing or null investmentDecision.successProbability: ${investmentDecision.successProbability}. Setting default.`);
            investmentDecision.successProbability = 50;
        }

        const arrayFields = ['keyConsiderations', 'suggestedTerms'];
        for (const field of arrayFields) {
            if (investmentDecision[field] && !Array.isArray(investmentDecision[field])) {
                throw new Error(`Invalid investmentDecision: ${field} must be an array`);
            }
        }
    }

    /**
     * Validate detailed findings array structure
     */
    private validateDetailedFindings(detailedFindings: any[]): void {
        detailedFindings.forEach((finding: any, index: number) => {
            if (!finding || typeof finding !== 'object') {
                throw new Error(`Invalid detailedFindings[${index}]: Must be an object`);
            }

            const requiredFields = ['area', 'document', 'finding', 'riskLevel', 'recommendation', 'timeline', 'impact'];
            for (const field of requiredFields) {
                if (!finding[field] || typeof finding[field] !== 'string') {
                    throw new Error(`Invalid detailedFindings[${index}]: ${field} is required and must be a string`);
                }
            }
        });
    }

    /**
     * Validate recommendations array structure
     */
    private validateRecommendations(recommendations: any[]): void {
        recommendations.forEach((recommendation: any, index: number) => {
            if (!recommendation || typeof recommendation !== 'object') {
                throw new Error(`Invalid recommendations[${index}]: Must be an object`);
            }

            const requiredFields = ['area', 'recommendation', 'priority', 'timeline', 'responsibleParty'];
            for (const field of requiredFields) {
                if (!recommendation[field] || typeof recommendation[field] !== 'string') {
                    throw new Error(`Invalid recommendations[${index}]: ${field} is required and must be a string`);
                }
            }
        });
    }

    /**
     * Validate report metadata structure
     */
    private validateReportMetadata(reportMetadata: any): void {
        if (!reportMetadata || typeof reportMetadata !== 'object') {
            throw new Error('Invalid reportMetadata: Must be an object');
        }

        const requiredNumberFields = [
            'documentsReviewed', 'complianceAreasChecked', 'totalFindings',
            'criticalIssuesCount', 'highPriorityIssuesCount', 'mediumPriorityIssuesCount', 'lowPriorityIssuesCount'
        ];

        for (const field of requiredNumberFields) {
            if (reportMetadata[field] === undefined || typeof reportMetadata[field] !== 'number') {
                throw new Error(`Invalid reportMetadata: ${field} is required and must be a number`);
            }
        }
    }

    /**
     * Validate analysis section structure (used for corporate structure, regulatory compliance, etc.)
     */
    private validateAnalysisSection(section: any, sectionName: string): void {
        if (!section || typeof section !== 'object') {
            throw new Error(`Invalid ${sectionName}: Must be an object`);
        }

        // Basic validation - analysis sections should have some content
        if (Object.keys(section).length === 0) {
            throw new Error(`Invalid ${sectionName}: Cannot be empty`);
        }

        // If it has common analysis fields, validate them
        if (section.summary && typeof section.summary !== 'string') {
            throw new Error(`Invalid ${sectionName}: summary must be a string`);
        }

        if (section.findings && !Array.isArray(section.findings)) {
            throw new Error(`Invalid ${sectionName}: findings must be an array`);
        }

        if (section.riskLevel && typeof section.riskLevel !== 'string') {
            throw new Error(`Invalid ${sectionName}: riskLevel must be a string`);
        }

        if (section.recommendations && !Array.isArray(section.recommendations) && typeof section.recommendations !== 'string') {
            throw new Error(`Invalid ${sectionName}: recommendations must be an array or string`);
        }
    }

    /**
     * Process legal documents and generate a complete legal due diligence report
     * This is the main method that combines document processing and report generation
     * @param documents Array of document objects with file paths and metadata
     * @param companyName Name of the company being analyzed
     * @param additionalContext Any additional context for the analysis
     * @returns Complete legal due diligence report
     */
    async processLegalDocumentsAndGenerateReport(
        documents: Array<{
            filePath: string,
            documentType: string,
            originalName: string,
            description?: string,
            timePeriod?: string,
            fileType?: string,
            fileSize?: number,
            createdAt?: string,
            updatedAt?: string
        }>,
        companyName: string,
        additionalContext?: string
    ): Promise<any> {
        try {
            console.log(`Starting complete legal due diligence process for ${companyName} with ${documents.length} documents`);

            // Step 1: Process all documents
            const processedContent = await this.processDocumentsInBatches(documents);

            if (!processedContent || processedContent.trim().length === 0) {
                throw new Error('No content was extracted from the provided legal documents');
            }

            console.log(`Processed content length: ${processedContent.length} characters`);

            // Step 2: Generate the legal due diligence report
            const report = await this.generateLegalDueDiligenceReport(processedContent, companyName, additionalContext);

            console.log('Legal due diligence process completed successfully');
            return report;

        } catch (error) {
            console.error('Error in complete legal due diligence process:', error);

            // Log comprehensive error information
            fileLogger.logTextToFile(
                `Complete Legal DD Process Error for ${companyName}:\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nStack trace: ${error instanceof Error ? error.stack : 'No stack trace available'}\n\nDocuments: ${JSON.stringify(documents.map(doc => ({ name: doc.originalName, type: doc.documentType, path: doc.filePath })))}`,
                'complete_legal_dd_process_error'
            );

            throw error;
        }
    }

    /**
     * Health check method to verify service dependencies
     * @returns Service health status
     */
    async healthCheck(): Promise<{
        status: string;
        geminiApiAvailable: boolean;
        ocrServiceAvailable: boolean;
        timestamp: string;
    }> {
        try {
            // Check if Gemini API key is available
            const geminiApiAvailable = !!apiKey;

            // Check OCR service availability
            const ocrServiceAvailable = !!this.memoryBasedOcrService;

            const status = geminiApiAvailable && ocrServiceAvailable ? 'healthy' : 'degraded';

            return {
                status,
                geminiApiAvailable,
                ocrServiceAvailable,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Legal due diligence service health check failed:', error);
            return {
                status: 'unhealthy',
                geminiApiAvailable: false,
                ocrServiceAvailable: false,
                timestamp: new Date().toISOString()
            };
        }
    }
}

export default NewLegalDueDiligenceService;

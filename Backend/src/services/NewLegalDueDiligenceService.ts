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
            const cleanedResponse = cleanJsonResponse(responseText);

            // Parse the JSON response
            const parsedReport = safeJsonParse(cleanedResponse);

            if (!parsedReport) {
                throw new Error('Failed to parse legal due diligence report JSON from Gemini response');
            }

            // Log the processed report
            fileLogger.logTextToFile(
                `Legal DD Processed Report for ${companyName}:\n\n${JSON.stringify(parsedReport, null, 2)}`,
                'legal_dd_processed_report'
            );

            console.log('Successfully generated legal due diligence report');
            return parsedReport;

        } catch (error) {
            console.error('Error generating legal due diligence report:', error);

            // Log detailed error information
            fileLogger.logTextToFile(
                `Legal DD Report Generation Error for ${companyName}:\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nStack trace: ${error instanceof Error ? error.stack : 'No stack trace available'}\n\nDocument content length: ${documentContent.length} characters`,
                'legal_dd_generation_error'
            );

            throw error;
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

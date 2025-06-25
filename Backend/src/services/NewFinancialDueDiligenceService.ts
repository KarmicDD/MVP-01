import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { cleanJsonResponse, safeJsonParse } from '../utils/jsonHelper';
import { NEW_FINANCIAL_DD_PROMPT, NEW_FINANCIAL_DD_STRUCTURE } from './document-processing/newFinancialDDPrompt';
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

// Create specialized model for financial analysis
// Using gemini-2.5-pro-exp-03-25 as specified in requirements for financial due diligence
const financialAnalysisModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-preview-05-20",
  generationConfig: {
    maxOutputTokens: 65536,
    temperature: 0.1, // Very low temperature for more consistent financial analysis
    topK: 40,
    topP: 0.95,
    responseMimeType: 'application/json',
  },
  systemInstruction: NEW_FINANCIAL_DD_PROMPT
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
 * Service for handling the new Financial Due Diligence feature
 * Follows SOLID principles with single responsibility for financial due diligence
 * Now uses memory-based OCR PDF processing for improved performance and no local storage
 */
class NewFinancialDueDiligenceService {
  private memoryBasedOcrService: MemoryBasedOcrPdfService;

  constructor() {
    this.memoryBasedOcrService = new MemoryBasedOcrPdfService();
  }
  /**
   * Process documents for financial due diligence using memory-based OCR
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
      console.log(`[FINANCIAL DD] Processing ${documents.length} financial documents using memory-based OCR service`);

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
        console.log(`[FINANCIAL DD] Processing ${pdfDocuments.length} PDF documents with memory-based OCR using combine-first approach`);

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
            console.log(`[FINANCIAL DD] Using new combine-first approach: will combine ${documentsWithBuffers.length} PDFs into one before chunking`);

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
        console.log(`[FINANCIAL DD] Processing ${nonPdfDocuments.length} non-PDF documents with traditional methods`);

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
            const formattedType = doc.documentType.replace('financial_', '').replace(/_/g, ' ');
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
      console.error('Error processing documents in batches:', error);

      // Log batch processing error to file
      fileLogger.logTextToFile(
        `Memory-based batch processing error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nStack trace: ${error instanceof Error ? error.stack : 'No stack trace available'}\n\nDocuments info: ${JSON.stringify(documents.map(doc => ({ name: doc.originalName, type: doc.documentType })))}`,
        'memory_batch_processing_error'
      );

      throw error;
    }
  }



  /**
   * Generate a financial due diligence report using Gemini
   * @param documentContent Combined document content
   * @param companyName Name of the company being analyzed
   * @param entityType Type of entity (startup or investor)
   * @param missingDocumentTypes Array of missing document types
   * @returns Financial due diligence report data
   */
  async generateFinancialDueDiligenceReport(
    documentContent: string,
    companyName: string,
    entityType: 'startup' | 'investor',
    missingDocumentTypes: string[] = []
  ): Promise<any> {
    try {
      console.log(`[FINANCIAL DD] Generating financial due diligence report for ${companyName} (${entityType})`);

      // Create missing documents context
      const missingDocumentsContext = missingDocumentTypes.length > 0
        ? `Missing Documents: ${missingDocumentTypes.join(', ')}`
        : 'All required documents are available.';

      // Create the prompt for financial due diligence analysis
      const prompt = `
      PERFORM A THOROUGH FINANCIAL DUE DILIGENCE ANALYSIS,
      USING THE FOLLOWING DOCUMENTS AND CONTEXT.
      COMPANY NAME: ${companyName}

      IF YOU FIND MORE INCOMPLETE DOCS, ADD THEM TO THE MISSING DOCUMENTS TABLE.
      IF DOCUMENTS LISTED AS MISSING ARE ACTUALLY PRESENT, REMOVE THEM FROM THE FINAL TABLE.

      DOCUMENT CONTENT:
      ${documentContent}

      RESPONSE FORMAT:
      ${NEW_FINANCIAL_DD_STRUCTURE}
      `;

      // Call Gemini API
      console.log('[FINANCIAL DD] Calling Gemini API for financial due diligence analysis...');
      const result = await executeGeminiWithDynamicRetry(async () => {
        return await financialAnalysisModel.generateContent(prompt);
      });

      if (!result || !result.response) {
        console.error('Invalid or empty response from Gemini API.');
        throw new Error('Invalid response from AI service');
      }

      const response = result.response;
      let responseText = response.text();

      // Parse the JSON response
      try {
        console.log('[FINANCIAL DD] Received response from Gemini API, cleaning and parsing JSON...');

        // Log the entire response to a file (but not to console)
        const logFilePath = fileLogger.logToFile(responseText, 'financial_dd_raw_response');
        console.log(`Raw financial due diligence response logged to file: ${logFilePath}`);

        // Clean and parse the JSON response
        const cleanedResponse = cleanJsonResponse(responseText);
        console.log('Cleaned response, attempting to parse as JSON...');

        const financialData = safeJsonParse(cleanedResponse);

        if (!financialData) {
          console.error('Failed to parse financial due diligence response as JSON');
          throw new Error('Invalid response format from AI model');
        }

        // Log the structure of the parsed data for debugging
        console.log('Successfully parsed JSON. Data structure:',
          Object.keys(financialData).map(key => `${key}: ${typeof financialData[key]}`).join(', ')
        );

        // Log the parsed financial data to a file
        const parsedDataLogPath = fileLogger.logObjectToJsonFile(financialData, 'financial_dd_parsed_data');
        console.log(`Parsed financial due diligence data logged to: ${parsedDataLogPath}`);

        // Check for required fields
        const requiredFields = ['companyName', 'introduction', 'items', 'missingDocuments', 'riskScore'];
        const missingFields = requiredFields.filter(field => !financialData[field]);

        if (missingFields.length > 0) {
          console.warn(`Warning: Missing required fields in Gemini response: ${missingFields.join(', ')}`);
          // Log the missing fields warning
          fileLogger.logTextToFile(
            `Missing required fields: ${missingFields.join(', ')}\nData structure: ${Object.keys(financialData).join(', ')}`,
            'financial_dd_missing_fields'
          );
        }

        return financialData;
      } catch (parseError) {
        console.error('Error parsing financial due diligence response:', parseError);

        // Create a minimal valid object as fallback
        console.log('Creating minimal valid object as fallback due to parsing error');

        // Log the parse error
        fileLogger.logTextToFile(
          `Parse error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}\n\nOriginal response:\n${responseText}`,
          'financial_dd_parse_error'
        );

        // Create fallback object
        const fallbackObject = {
          companyName: companyName,
          introduction: "Failed to generate a complete financial due diligence report due to parsing errors.",
          items: [],
          missingDocuments: {
            documentList: missingDocumentTypes.map(docType => ({
              documentCategory: "Unknown",
              specificDocument: docType,
              requirementReference: "Required for analysis"
            })),
            note: "Unable to process documents due to technical issues."
          },
          riskScore: {
            score: "N/A",
            riskLevel: "Unknown",
            justification: "Unable to assess risk due to technical issues with report generation."
          },
          reportCalculated: false
        };

        // Log the fallback object
        fileLogger.logObjectToJsonFile(fallbackObject, 'financial_dd_fallback_object');

        return fallbackObject;
      }
    } catch (error) {
      console.error('Error generating financial due diligence report:', error);

      // Log the error
      fileLogger.logTextToFile(
        `Error generating financial due diligence report: ${error instanceof Error ? error.message : 'Unknown error'}\n\nStack trace: ${error instanceof Error ? error.stack : 'No stack trace available'}`,
        'financial_dd_generation_error'
      );

      // Return a fallback object instead of throwing an error
      // This ensures the frontend always gets a response even if Gemini API fails
      const errorFallbackObject = {
        companyName: companyName,
        introduction: "Failed to generate a complete financial due diligence report due to an error with the AI service.",
        items: [],
        missingDocuments: {
          documentList: missingDocumentTypes.map(docType => ({
            documentCategory: "Unknown",
            specificDocument: docType,
            requirementReference: "Required for analysis"
          })),
          note: "Unable to process documents due to technical issues with the AI service."
        },
        riskScore: {
          score: "N/A",
          riskLevel: "Unknown",
          justification: "Unable to assess risk due to technical issues with the AI service."
        },
        reportCalculated: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };

      // Log the error fallback object
      fileLogger.logObjectToJsonFile(errorFallbackObject, 'financial_dd_error_fallback_object');

      return errorFallbackObject;
    }
  }
}

export default new NewFinancialDueDiligenceService();

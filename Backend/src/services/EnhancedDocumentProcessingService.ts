import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import axios from 'axios';
import ExcelJS from 'exceljs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import mammoth from 'mammoth';
import { Document } from 'mongoose';
import { cleanJsonResponse, safeJsonParse } from '../utils/jsonHelper';
import { FIN_DD_PROMPT, structure } from './document-processing/prompt';
import { MemoryBasedOcrPdfService, DocumentMetadata } from './MemoryBasedOcrPdfService';

// Load environment variables
dotenv.config();

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
  initialDelay: number = 30000 // 30 seconds initial delay as preferred by user
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
              // Add 1 second to the retry delay as requested by user
              retryDelayMs = (seconds + 1) * 1000;
              console.log(`Using dynamic retry delay from API response: ${seconds}s + 1s = ${retryDelayMs / 1000}s`);
            }
          }
        }
      }

      // For rate limit errors (429), use exponential backoff if no specific delay provided
      const status = error?.status ?? error?.response?.status;
      if (status === 429 && retryDelayMs === initialDelay) {
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

/**
 * Interface for document extraction results that includes both raw text and AI-processed content
 */
export interface DocumentExtractionResult {
  rawText: string;           // Text extracted using traditional methods or memory-based OCR
  aiProcessedText: string;   // Text extracted using AI (Gemini, Memory-based OCR)
  combinedText: string;      // Combined text (typically AI if available, otherwise raw)
  extractionMethod: string;  // Method used for the combined text (e.g., "memory-based-ocr", "gemini", "traditional")
  metadata?: {               // Optional metadata about the extraction
    fileType: string;
    fileName: string;
    extractionTime: Date;
    aiConfidence?: number;   // Confidence score if available
    [key: string]: any;      // Additional metadata
  };
}

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || '';
if (!apiKey) {
  console.warn('Warning: GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-preview-04-17", // Updated from preview to exp as recommended by API error message
  generationConfig: {
    maxOutputTokens: 65536,
    temperature: 0.2,
    responseMimeType: 'application/json',
    topK: 1,
    topP: 0.95,
  }
});


// Document extraction model - using gemini-2.0-flash as requested
const documentExtractionModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-preview-04-17", // Updated from preview to exp as recommended by API error message
  generationConfig: {
    maxOutputTokens: 65536,
    temperature: 0.2, // Very low temperature for more accurate extraction
  }
});

// Promisify fs functions
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

/**
 * Enhanced service for processing different types of documents and extracting their content
 */
export class EnhancedDocumentProcessingService {
  private memoryBasedOcrService: MemoryBasedOcrPdfService;

  constructor() {
    this.memoryBasedOcrService = new MemoryBasedOcrPdfService();
  }
  /**
   * Extract text content from a PDF file using the new Memory-based OCR service
   * @param filePath Path to the PDF file
   * @param metadata Optional metadata to provide context for extraction
   * @returns Extracted text content with preserved formatting
   */
  async extractPdfText(filePath: string, metadata?: {
    documentType?: string;
    name?: string;
    timePeriod?: string;
    description?: string;
  }): Promise<string> {
    try {
      // First check if the file exists
      if (!fs.existsSync(filePath)) {
        console.error(`PDF file not found: ${filePath}`);
        return `[File not found: The document appears to be missing from the server. It may have been deleted or moved.]`;
      }

      // Read the PDF file as buffer
      const fileBuffer = await readFileAsync(filePath);

      // Prepare metadata for the new service
      const documentMetadata = {
        originalName: metadata?.name || path.basename(filePath),
        documentType: metadata?.documentType || 'unknown',
        description: metadata?.description,
        timePeriod: metadata?.timePeriod,
        fileType: 'pdf',
        fileSize: fileBuffer.length
      };

      // Use the new memory-based OCR service
      const extractedText = await this.memoryBasedOcrService.processPdfDocument(fileBuffer, documentMetadata);

      return extractedText || '[No text content extracted from PDF]';
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      return `[Error processing PDF: ${error instanceof Error ? error.message : 'Unknown error'}]`;
    }
  }
  /**
   * Extract text content from a PDF file using Gemini AI (now delegated to MemoryBasedOcrPdfService)
   * @param filePath Path to the PDF file
   * @param metadata Optional metadata to provide context for extraction
   * @returns Extracted text content with preserved formatting
   */
  async extractPdfTextWithGemini(filePath: string, metadata?: {
    documentType?: string;
    name?: string;
    timePeriod?: string;
    description?: string;
  }): Promise<string> {
    // Delegate to the new extractPdfText method which uses MemoryBasedOcrPdfService
    return this.extractPdfText(filePath, metadata);
  }
  /**
   * Extract text content from multiple PDF files using the new Memory-based OCR service
   * @param filePaths Array of PDF file paths
   * @param metadataArray Array of metadata objects corresponding to each PDF
   * @returns Array of extracted text content with preserved formatting
   */
  async extractPdfTextWithGeminiBatch(
    filePaths: string[],
    metadataArray: Array<{
      documentType?: string;
      name?: string;
      timePeriod?: string;
      description?: string;
    }>
  ): Promise<string[]> {
    try {
      // Validate input arrays
      if (filePaths.length !== metadataArray.length) {
        throw new Error('File paths array and metadata array must have the same length');
      }

      if (filePaths.length === 0) {
        return [];
      }

      // Process each PDF individually using the new service
      const results: string[] = [];

      for (let i = 0; i < filePaths.length; i++) {
        const filePath = filePaths[i];
        const metadata = metadataArray[i];

        try {
          const extractedText = await this.extractPdfText(filePath, metadata);
          results.push(extractedText);
        } catch (error) {
          console.error(`Error processing PDF ${filePath}:`, error);
          results.push(`[Error processing PDF: ${error instanceof Error ? error.message : 'Unknown error'}]`);
        }
      }

      return results;
    } catch (error) {
      console.error('Error extracting PDF text with batch:', error);
      return filePaths.map(() => `[Error processing PDF batch: ${error instanceof Error ? error.message : 'Unknown error'}]`);
    }
  }
  /**
   * Extract text content from a PDF file using the new Memory-based OCR service
   * @param filePath Path to the PDF file
   * @param metadata Optional metadata to provide context for extraction
   * @returns DocumentExtractionResult containing extraction details
   */
  async extractPdfTextWithBothMethods(filePath: string, metadata?: {
    documentType?: string;
    name?: string;
    timePeriod?: string;
    description?: string;
  }): Promise<DocumentExtractionResult> {
    const fileName = path.basename(filePath);
    const fileType = path.extname(filePath).toLowerCase().substring(1);
    const startTime = new Date();

    try {
      // First check if the file exists
      if (!fs.existsSync(filePath)) {
        console.error(`PDF file not found: ${filePath}`);
        const errorMsg = `[File not found: The document appears to be missing from the server. It may have been deleted or moved.]`;
        return {
          rawText: errorMsg,
          aiProcessedText: errorMsg,
          combinedText: errorMsg,
          extractionMethod: 'error',
          metadata: {
            fileType,
            fileName,
            extractionTime: new Date(),
            error: 'File not found',
            documentType: metadata?.documentType,
            timePeriod: metadata?.timePeriod,
            description: metadata?.description
          }
        };
      }

      // Extract text using the new memory-based OCR service
      const extractedText = await this.extractPdfText(filePath, metadata);

      const endTime = new Date();
      const processingTime = endTime.getTime() - startTime.getTime();

      // Create a comprehensive metadata object
      const resultMetadata = {
        fileType,
        fileName,
        extractionTime: endTime,
        processingTimeMs: processingTime,
        documentType: metadata?.documentType,
        timePeriod: metadata?.timePeriod,
        description: metadata?.description,
        extractionQuality: 'high' // Memory-based OCR provides high quality
      };

      return {
        rawText: extractedText, // Same as AI processed for the new service
        aiProcessedText: extractedText,
        combinedText: extractedText,
        extractionMethod: 'memory-based-ocr',
        metadata: resultMetadata
      };
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      const errorMsg = `[Error processing PDF: ${error instanceof Error ? error.message : 'Unknown error'}]`;

      return {
        rawText: errorMsg,
        aiProcessedText: errorMsg,
        combinedText: errorMsg,
        extractionMethod: 'error',
        metadata: {
          fileType,
          fileName,
          extractionTime: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
          documentType: metadata?.documentType,
          timePeriod: metadata?.timePeriod,
          description: metadata?.description
        }
      };
    }
  }

  /**
   * Extract text and data from an Excel file with enhanced financial data handling
   * @param filePath Path to the Excel file
   * @param metadata Optional metadata to provide context for extraction
   * @returns Extracted data as a string with improved structure preservation
   */
  async extractExcelData(filePath: string, metadata?: {
    documentType?: string;
    name?: string;
    timePeriod?: string;
    description?: string;
  }): Promise<string> {
    try {
      // First check if the file exists
      if (!fs.existsSync(filePath)) {
        console.error(`Excel file not found: ${filePath}`);
        return `[File not found: The document appears to be missing from the server. It may have been deleted or moved.]`;
      }

      try {
        // First try using Gemini for better extraction, especially for complex spreadsheets
        const fileBuffer = await readFileAsync(filePath);

        // Format document type for display in prompt
        let documentTypeInfo = '';
        if (metadata?.documentType) {
          const formattedType = metadata.documentType.replace('financial_', '').replace(/_/g, ' ');
          documentTypeInfo = `Document Type: ${formattedType}\n`;
        }

        // Add time period if available
        let timePeriodInfo = '';
        if (metadata?.timePeriod) {
          timePeriodInfo = `Time Period: ${metadata.timePeriod}\n`;
        }

        // Add description if available
        let descriptionInfo = '';
        if (metadata?.description && metadata.description !== 'No description') {
          descriptionInfo = `Description: ${metadata.description}\n`;
        }

        // Create a context-aware prompt for Gemini to extract data from the Excel file
        const prompt = `
        Extract all data from this Excel spreadsheet with maximum accuracy and completeness.
        ${documentTypeInfo}${timePeriodInfo}${descriptionInfo}
        This is a financial document that requires precise extraction of all data.

        CRITICAL EXTRACTION INSTRUCTIONS:
        1. Extract ABSOLUTELY ALL data from ALL sheets in the spreadsheet, leaving nothing out
        2. Maintain the exact original structure of the data with precise preservation of:
           - Table layouts and alignments
           - Column and row relationships
           - Headers and subheaders
           - Merged cells (represent them appropriately)
           - Hierarchical structures
        3. Preserve all table formats and data relationships with exact fidelity
        4. Include sheet names as clear section headers
        5. Format the data in a way that perfectly maintains the row and column structure
        6. Include ALL numbers, dates, formulas (as their calculated values), and text exactly as they appear
        7. Preserve ALL formatting that conveys meaning (bold headers, indentation patterns, etc.)
        8. If you can't read certain parts, indicate with [unreadable data] but try to infer from context
        9. For each sheet, start with "Sheet: [sheet name]" followed by the data
        10. Pay special attention to financial data, ensuring all numbers, calculations, and financial terms are captured with 100% accuracy
        11. Preserve any headers, footers, and notes that may contain important information
        12. For financial tables, ensure all totals, subtotals, and calculations are clearly represented

        Return the extracted content as plain text with tabs separating columns and newlines separating rows, maintaining the exact structure of the original spreadsheet.
        `;

        const result = await executeGeminiWithDynamicRetry(async () => {
          return await documentExtractionModel.generateContent([
            prompt,
            { inlineData: { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', data: fileBuffer.toString('base64') } }
          ]);
        });

        const response = result.response;
        const extractedText = response.text();

        if (extractedText && extractedText.length > 0) {
          return extractedText;
        }

        // Fall back to ExcelJS if Gemini fails
        console.log(`Falling back to ExcelJS for Excel file: ${filePath}`);
      } catch (geminiError) {
        console.error('Error extracting Excel data with Gemini:', geminiError);
        // Continue to fallback method
      }

      // Enhanced fallback to ExcelJS with improved financial data extraction
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      let result = '';

      // Add metadata header if available
      if (metadata) {
        result += '=== DOCUMENT INFORMATION ===\n';
        if (metadata.name) result += `Filename: ${metadata.name}\n`;
        if (metadata.documentType) {
          const formattedType = metadata.documentType.replace('financial_', '').replace(/_/g, ' ');
          result += `Type: ${formattedType}\n`;
        }
        if (metadata.timePeriod) result += `Time Period: ${metadata.timePeriod}\n`;
        if (metadata.description && metadata.description !== 'No description') {
          result += `Description: ${metadata.description}\n`;
        }
        result += '\n';
      }

      // First pass: analyze all sheets to identify financial data patterns
      const financialSheets: string[] = [];
      const potentialHeaderRows: { [sheet: string]: number[] } = {};
      const potentialFinancialColumns: { [sheet: string]: number[] } = {};

      workbook.eachSheet((worksheet, _sheetId) => {
        const sheetName = worksheet.name.toLowerCase();

        // Check if sheet name suggests financial data
        if (
          sheetName.includes('financ') ||
          sheetName.includes('balance') ||
          sheetName.includes('income') ||
          sheetName.includes('cash flow') ||
          sheetName.includes('p&l') ||
          sheetName.includes('profit') ||
          sheetName.includes('loss') ||
          sheetName.includes('statement') ||
          sheetName.includes('budget') ||
          sheetName.includes('forecast') ||
          sheetName.includes('revenue') ||
          sheetName.includes('expense')
        ) {
          financialSheets.push(worksheet.name);
        }

        // Identify potential header rows (rows with mostly text cells)
        const headerRows: number[] = [];

        worksheet.eachRow((row, rowNumber) => {
          let textCellCount = 0;
          let totalCellCount = 0;

          row.eachCell(cell => {
            totalCellCount++;
            if (cell.type === ExcelJS.ValueType.String || cell.font?.bold) {
              textCellCount++;
            }
          });

          // If more than 70% of cells are text or the first cell is bold, likely a header
          if (totalCellCount > 0 && (textCellCount / totalCellCount > 0.7 || row.getCell(1).font?.bold)) {
            headerRows.push(rowNumber);
          }
        });

        potentialHeaderRows[worksheet.name] = headerRows;

        // Identify potential financial columns (columns with mostly numeric cells)
        const financialColumns: number[] = [];
        const columnCounts: { [col: number]: { total: number, numeric: number } } = {};

        worksheet.eachRow((row, _rowNumber) => {
          row.eachCell((cell, colNumber) => {
            if (!columnCounts[colNumber]) {
              columnCounts[colNumber] = { total: 0, numeric: 0 };
            }

            columnCounts[colNumber].total++;

            if (
              cell.type === ExcelJS.ValueType.Number ||
              (cell.type === ExcelJS.ValueType.Formula && typeof cell.value === 'number')
            ) {
              columnCounts[colNumber].numeric++;
            }
          });
        });

        // Columns with more than 60% numeric cells are likely financial data columns
        Object.entries(columnCounts).forEach(([colNumber, counts]) => {
          if (counts.total > 0 && counts.numeric / counts.total > 0.6) {
            financialColumns.push(parseInt(colNumber));
          }
        });

        potentialFinancialColumns[worksheet.name] = financialColumns;
      });

      // Process each sheet with enhanced financial data awareness
      workbook.eachSheet((worksheet, _sheetId) => {
        const sheetName = worksheet.name;
        const isFinancialSheet = financialSheets.includes(sheetName);
        const headerRows = potentialHeaderRows[sheetName] || [];
        const financialColumns = potentialFinancialColumns[sheetName] || [];

        result += `=== SHEET: ${sheetName} ===\n`;
        if (isFinancialSheet) {
          result += `[FINANCIAL DATA SHEET]\n`;
        }
        result += '\n';

        // Get merged cells to handle them properly
        const mergedCells = (worksheet.model as any).mergeCells || {};
        const mergedCellsMap = new Map();

        // Convert merged cells to a more usable format
        Object.keys(mergedCells).forEach(key => {
          const range = key.split(':');
          if (range.length === 2) {
            const [start, end] = range;

            // Convert Excel cell references (e.g., 'A1') to row/column indices
            const startMatch = start.match(/([A-Z]+)(\d+)/);
            const endMatch = end.match(/([A-Z]+)(\d+)/);

            if (startMatch && endMatch) {
              const startCol = this.columnLetterToNumber(startMatch[1]);
              const startRow = parseInt(startMatch[2]);
              const endCol = this.columnLetterToNumber(endMatch[1]);
              const endRow = parseInt(endMatch[2]);

              // Store the merged cell info
              for (let row = startRow; row <= endRow; row++) {
                for (let col = startCol; col <= endCol; col++) {
                  if (row === startRow && col === startCol) {
                    // This is the master cell
                    mergedCellsMap.set(`${row},${col}`, { isMaster: true, startRow, startCol, endRow, endCol });
                  } else {
                    // This is a merged cell that should be skipped
                    mergedCellsMap.set(`${row},${col}`, { isMaster: false, masterRow: startRow, masterCol: startCol });
                  }
                }
              }
            }
          }
        });

        // Get column widths for better formatting
        const columnWidths: { [key: number]: number } = {};
        const maxCellsInRow: number = worksheet.actualColumnCount || 0;

        // First pass to determine column widths
        worksheet.eachRow((row, _rowNumber) => {
          row.eachCell((cell, colNumber) => {
            // Check if this is part of a merged cell
            const mergedInfo = mergedCellsMap.get(`${row.number},${colNumber}`);

            if (mergedInfo && !mergedInfo.isMaster) {
              // Skip non-master cells in merged ranges
              return;
            }

            let value = '';

            // Enhanced value formatting for financial data
            if (cell.type === ExcelJS.ValueType.Number ||
              (cell.type === ExcelJS.ValueType.Formula && typeof cell.value === 'number')) {
              // Format numbers with appropriate precision
              const numValue = cell.value as number;

              // Check if this might be a currency value
              if (financialColumns.includes(colNumber)) {
                // Format with commas for thousands and 2 decimal places
                value = numValue.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                });
              } else {
                // Regular number formatting
                value = numValue.toString();
                // Add decimal places only if needed
                if (Math.floor(numValue) !== numValue) {
                  value = numValue.toFixed(2);
                }
              }
            } else if (cell.type === ExcelJS.ValueType.Date) {
              // Format dates consistently
              const dateValue = cell.value as Date;
              value = dateValue.toISOString().split('T')[0];
            } else {
              // String or other value types
              value = cell.value?.toString() || '';
            }

            // Handle merged cells - use wider width for master cells
            if (mergedInfo && mergedInfo.isMaster) {
              const { startCol, endCol } = mergedInfo;
              const mergeWidth = (endCol - startCol + 1) * 15; // Estimate width based on merged columns
              if (!columnWidths[colNumber] || mergeWidth > columnWidths[colNumber]) {
                columnWidths[colNumber] = Math.min(mergeWidth, 50); // Cap at 50 chars
              }
            } else {
              // Regular cell width calculation
              if (!columnWidths[colNumber] || value.length > columnWidths[colNumber]) {
                columnWidths[colNumber] = Math.min(value.length, 30); // Cap at 30 chars
              }
            }
          });
        });

        // Create a table-like structure with proper column alignment
        const columnSeparator = ' | ';

        // Process each row with enhanced formatting
        worksheet.eachRow((row, rowNumber) => {
          // Skip empty rows
          if (row.cellCount === 0) {
            result += '\n';
            return;
          }

          const rowValues: string[] = [];
          const isHeader = headerRows.includes(rowNumber);

          // Fill in empty cells up to the maximum column count for proper alignment
          for (let colNumber = 1; colNumber <= maxCellsInRow; colNumber++) {
            // Check if this is part of a merged cell
            const mergedInfo = mergedCellsMap.get(`${rowNumber},${colNumber}`);

            if (mergedInfo && !mergedInfo.isMaster) {
              // Skip non-master cells in merged ranges
              rowValues.push(''); // Add empty value to maintain column alignment
              continue;
            }

            const cell = row.getCell(colNumber);
            let value = '';

            // Enhanced value formatting for financial data
            if (cell.type === ExcelJS.ValueType.Number ||
              (cell.type === ExcelJS.ValueType.Formula && typeof cell.value === 'number')) {
              // Format numbers with appropriate precision
              const numValue = cell.value as number;

              // Check if this might be a currency value
              if (financialColumns.includes(colNumber)) {
                // Format with commas for thousands and 2 decimal places
                value = numValue.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                });
              } else {
                // Regular number formatting
                value = numValue.toString();
                // Add decimal places only if needed
                if (Math.floor(numValue) !== numValue) {
                  value = numValue.toFixed(2);
                }
              }
            } else if (cell.type === ExcelJS.ValueType.Date) {
              // Format dates consistently
              const dateValue = cell.value as Date;
              value = dateValue.toISOString().split('T')[0];
            } else if (cell.type === ExcelJS.ValueType.Formula) {
              // Handle formula results
              if (typeof cell.value === 'string') {
                value = cell.value;
              } else if (typeof cell.value === 'number') {
                if (financialColumns.includes(colNumber)) {
                  value = (cell.value as number).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  });
                } else {
                  value = (cell.value as number).toString();
                  if (Math.floor(cell.value as number) !== (cell.value as number)) {
                    value = (cell.value as number).toFixed(2);
                  }
                }
              } else if (cell.value instanceof Date) {
                value = (cell.value as Date).toISOString().split('T')[0];
              } else {
                value = cell.value?.toString() || '';
              }
            } else {
              // String or other value types
              value = cell.value?.toString() || '';
            }

            // Handle merged cells - span the value across multiple columns
            if (mergedInfo && mergedInfo.isMaster) {
              const { startCol, endCol } = mergedInfo;
              const mergeWidth = endCol - startCol;

              // Make the value span across the merged columns
              if (value.length > 0) {
                // Center the text in the merged cell
                const totalWidth = mergeWidth * 15; // Approximate width
                const padding = Math.max(0, totalWidth - value.length) / 2;
                value = ' '.repeat(Math.floor(padding)) + value;
              }
            }

            // Format the value for display
            // Pad or truncate to column width
            const colWidth = columnWidths[colNumber] || 10;
            if (value.length > colWidth) {
              value = value.substring(0, colWidth - 3) + '...';
            } else {
              // Right-align numbers, left-align text
              if (financialColumns.includes(colNumber) && !isHeader) {
                value = value.padStart(colWidth);
              } else {
                value = value.padEnd(colWidth);
              }
            }

            rowValues.push(value);
          }

          // Add the row to the result
          if (rowValues.length > 0) {
            // Add separator line after headers
            if (isHeader) {
              // Make header text bold by adding asterisks
              const boldRowValues = rowValues.map(val => val.trim() ? `${val}` : val);
              result += boldRowValues.join(columnSeparator) + '\n';

              // Add separator line
              const separatorLine = rowValues.map((_, i) => '-'.repeat(columnWidths[i + 1] || 10));
              result += separatorLine.join('-+-') + '\n';
            } else {
              result += rowValues.join(columnSeparator) + '\n';
            }
          }
        });

        // Add extra information for financial sheets
        if (isFinancialSheet) {
          result += '\n[FINANCIAL DATA SUMMARY]\n';

          // Identify key financial metrics if possible
          const metrics: string[] = [];

          // Look for common financial terms in the sheet
          worksheet.eachRow((row, _rowNumber) => {
            row.eachCell((cell, colNumber) => {
              if (cell.type === ExcelJS.ValueType.String) {
                const cellText = cell.value?.toString().toLowerCase() || '';

                // Check for common financial terms
                if (
                  cellText.includes('revenue') ||
                  cellText.includes('income') ||
                  cellText.includes('profit') ||
                  cellText.includes('ebitda') ||
                  cellText.includes('net income') ||
                  cellText.includes('total assets') ||
                  cellText.includes('total liabilities') ||
                  cellText.includes('equity') ||
                  cellText.includes('cash flow') ||
                  cellText.includes('balance')
                ) {
                  // Get the value from the next cell if it exists and is a number
                  const valueCell = row.getCell(colNumber + 1);
                  if (valueCell && (valueCell.type === ExcelJS.ValueType.Number ||
                    (valueCell.type === ExcelJS.ValueType.Formula && typeof valueCell.value === 'number'))) {
                    const value = valueCell.value as number;
                    metrics.push(`${cell.value}: ${value.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}`);
                  } else {
                    metrics.push(`${cell.value}: [Value not found]`);
                  }
                }
              }
            });
          });

          if (metrics.length > 0) {
            result += 'Key Financial Metrics Detected:\n';
            metrics.forEach(metric => {
              result += `- ${metric}\n`;
            });
          } else {
            result += 'No specific financial metrics automatically detected.\n';
          }
        }

        result += '\n\n';
      });

      return result || '[No data extracted from Excel file]';
    } catch (error) {
      console.error('Error extracting Excel data:', error);
      // Return a placeholder message instead of throwing an error
      return `[Error processing Excel file: ${error instanceof Error ? error.message : 'Unknown error'}]`;
    }
  }

  /**
   * Helper method to convert Excel column letters to column numbers
   * @param columnLetters Column letters (e.g., 'A', 'BC')
   * @returns Column number (1-based)
   */
  private columnLetterToNumber(columnLetters: string): number {
    let result = 0;
    const letters = columnLetters.toUpperCase();

    for (let i = 0; i < letters.length; i++) {
      result = result * 26 + (letters.charCodeAt(i) - 64);
    }

    return result;
  }

  /**
   * Extract data from a CSV file with enhanced structure preservation
   * @param filePath Path to the CSV file
   * @param metadata Optional metadata to provide context for extraction
   * @returns Extracted data as a string with improved structure preservation
   */
  async extractCsvData(filePath: string, metadata?: {
    documentType?: string;
    name?: string;
    timePeriod?: string;
    description?: string;
  }): Promise<string> {
    try {
      // First check if the file exists
      if (!fs.existsSync(filePath)) {
        console.error(`CSV file not found: ${filePath}`);
        return `[File not found: The document appears to be missing from the server. It may have been deleted or moved.]`;
      }

      const content = await readFileAsync(filePath, 'utf8');

      // Detect the delimiter (comma, semicolon, tab)
      const firstLine = content.split('\n')[0];
      let delimiter = ','; // Default delimiter

      // Check for common delimiters and choose the one that appears most frequently
      const delimiterCounts = {
        ',': (firstLine.match(/,/g) || []).length,
        ';': (firstLine.match(/;/g) || []).length,
        '\t': (firstLine.match(/\t/g) || []).length,
        '|': (firstLine.match(/\|/g) || []).length
      };

      // Find the delimiter with the highest count
      let maxCount = 0;
      Object.entries(delimiterCounts).forEach(([delim, count]) => {
        if (count > maxCount) {
          maxCount = count;
          delimiter = delim;
        }
      });

      // Split the content into lines
      const lines = content.split('\n');

      // Check if this might be a financial CSV
      const isFinancialData = this.detectFinancialData(lines, delimiter);

      // Parse the CSV data
      const parsedData: string[][] = [];
      lines.forEach(line => {
        if (line.trim()) {
          // Handle quoted values correctly
          const row: string[] = [];
          let inQuotes = false;
          let currentValue = '';

          for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
              // Toggle quote state
              inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
              // End of field
              row.push(currentValue);
              currentValue = '';
            } else {
              // Add character to current field
              currentValue += char;
            }
          }

          // Add the last field
          row.push(currentValue);

          // Remove quotes from values
          const cleanedRow = row.map(value => {
            if (value.startsWith('"') && value.endsWith('"')) {
              return value.substring(1, value.length - 1);
            }
            return value;
          });

          parsedData.push(cleanedRow);
        }
      });

      // Determine column widths for better formatting
      const columnWidths: number[] = [];
      parsedData.forEach(row => {
        row.forEach((value, colIndex) => {
          if (!columnWidths[colIndex] || value.length > columnWidths[colIndex]) {
            columnWidths[colIndex] = Math.min(value.length, 30); // Cap at 30 chars
          }
        });
      });

      // Format the data as a table
      let result = '';

      // Add metadata header if available
      if (metadata) {
        result += '=== DOCUMENT INFORMATION ===\n';
        if (metadata.name) result += `Filename: ${metadata.name}\n`;
        if (metadata.documentType) {
          const formattedType = metadata.documentType.replace('financial_', '').replace(/_/g, ' ');
          result += `Type: ${formattedType}\n`;
        }
        if (metadata.timePeriod) result += `Time Period: ${metadata.timePeriod}\n`;
        if (metadata.description && metadata.description !== 'No description') {
          result += `Description: ${metadata.description}\n`;
        }
        result += '\n';
      }

      if (isFinancialData) {
        result += '[FINANCIAL DATA DETECTED - ALL DATA WILL BE INCLUDED]\n\n';
      }

      // Process the header row
      if (parsedData.length > 0) {
        const headerRow = parsedData[0];
        const formattedHeader = headerRow.map((value, colIndex) => {
          // Pad or truncate to column width
          if (value.length > columnWidths[colIndex]) {
            return value.substring(0, columnWidths[colIndex] - 3) + '...';
          } else {
            return value.padEnd(columnWidths[colIndex]);
          }
        });

        result += formattedHeader.join(' | ') + '\n';

        // Add separator line
        const separatorLine = headerRow.map((_, colIndex) => '-'.repeat(columnWidths[colIndex]));
        result += separatorLine.join('-+-') + '\n';

        // Process data rows
        for (let i = 1; i < parsedData.length; i++) {
          const row = parsedData[i];

          // Skip empty rows
          if (row.every(cell => cell.trim() === '')) {
            continue;
          }

          const formattedRow = row.map((value, colIndex) => {
            // Format numbers with commas for thousands if this is financial data
            if (isFinancialData && this.isNumeric(value)) {
              const numValue = parseFloat(value);

              // Format with commas for thousands and 2 decimal places if needed
              if (Math.floor(numValue) !== numValue) {
                value = numValue.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                });
              } else {
                value = numValue.toLocaleString('en-US');
              }
            }

            // Pad or truncate to column width
            if (value.length > columnWidths[colIndex]) {
              return value.substring(0, columnWidths[colIndex] - 3) + '...';
            } else {
              // Right-align numbers, left-align text
              if (this.isNumeric(value) && isFinancialData) {
                return value.padStart(columnWidths[colIndex]);
              } else {
                return value.padEnd(columnWidths[colIndex]);
              }
            }
          });

          result += formattedRow.join(' | ') + '\n';
        }
      }

      // Add data summary for all columns, regardless of whether it's financial data
      if (parsedData.length > 0) {
        result += '\n[DATA SUMMARY - ALL COLUMNS]\n';

        // Include all columns in the summary
        const headerRow = parsedData[0];
        const allColumns: number[] = [];

        // Include all columns in the analysis
        for (let colIndex = 0; colIndex < headerRow.length; colIndex++) {
          allColumns.push(colIndex);
        }

        // Extract metrics for all columns
        if (allColumns.length > 0) {
          result += 'Column Metrics:\n';

          allColumns.forEach(colIndex => {
            const header = headerRow[colIndex];

            // Calculate sum and average for this column if it contains numeric values
            let sum = 0;
            let count = 0;
            let hasNumericValues = false;

            for (let i = 1; i < parsedData.length; i++) {
              const value = parsedData[i][colIndex];
              if (this.isNumeric(value)) {
                sum += parseFloat(value);
                count++;
                hasNumericValues = true;
              }
            }

            if (hasNumericValues && count > 0) {
              const average = sum / count;
              result += `- ${header}: Sum = ${sum.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}, Average = ${average.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}\n`;
            } else {
              // For non-numeric columns, provide a count of unique values
              const uniqueValues = new Set();
              for (let i = 1; i < parsedData.length; i++) {
                if (parsedData[i][colIndex] && parsedData[i][colIndex].trim()) {
                  uniqueValues.add(parsedData[i][colIndex]);
                }
              }
              result += `- ${header}: ${uniqueValues.size} unique values\n`;
            }
          });
        } else {
          result += 'No columns detected for analysis.\n';
        }
      }

      return result || '[No data extracted from CSV file]';
    } catch (error) {
      console.error('Error extracting CSV data:', error);
      // Return a placeholder message instead of throwing an error
      return `[Error processing CSV file: ${error instanceof Error ? error.message : 'Unknown error'}]`;
    }
  }

  /**
   * Helper method to detect if a CSV file contains financial data
   * @param lines Array of CSV lines
   * @param delimiter CSV delimiter
   * @returns True if financial data is detected
   */
  private detectFinancialData(lines: string[], delimiter: string): boolean {
    // Check if the header row contains financial terms
    if (lines.length === 0) {
      return false;
    }

    const headerRow = lines[0].toLowerCase();
    const financialTerms = [
      'amount', 'value', 'price', 'cost', 'revenue', 'income', 'expense',
      'profit', 'loss', 'total', 'balance', 'asset', 'liability', 'equity',
      'cash', 'flow', 'tax', 'interest', 'dividend', 'payment', 'receipt',
      'budget', 'forecast', 'actual', 'variance', 'fiscal', 'quarter', 'year'
    ];

    // Check if any financial terms appear in the header
    if (financialTerms.some(term => headerRow.includes(term))) {
      return true;
    }

    // Check if there are multiple numeric columns
    if (lines.length > 1) {
      const secondRow = lines[1].split(delimiter);
      let numericColumnCount = 0;

      secondRow.forEach(value => {
        if (this.isNumeric(value)) {
          numericColumnCount++;
        }
      });

      // If more than 30% of columns are numeric, likely financial data
      if (numericColumnCount > 0 && numericColumnCount / secondRow.length > 0.3) {
        return true;
      }
    }

    return false;
  }

  /**
   * Helper method to check if a string is numeric
   * @param value String value to check
   * @returns True if the string is numeric
   */
  private isNumeric(value: string): boolean {
    // Remove commas and currency symbols
    const cleanedValue = value.replace(/[$,£€]/g, '').trim();
    // Check if it's a valid number
    return !isNaN(parseFloat(cleanedValue)) && isFinite(Number(cleanedValue));
  }

  // detectFinancialContent method removed as it was not essential

  /**
   * Extract text from a PowerPoint file using traditional methods (placeholder)
   * @param filePath Path to the PowerPoint file
   * @returns Extracted text content
   */
  async extractPptTextTraditional(filePath: string): Promise<string> {
    try {
      // First check if the file exists
      if (!fs.existsSync(filePath)) {
        console.error(`PowerPoint file not found: ${filePath}`);
        return `[File not found: The document appears to be missing from the server. It may have been deleted or moved.]`;
      }

      // Note: There's no good library for extracting text from PowerPoint in Node.js
      // This is a placeholder that would normally use a library like pptx-parser
      // For now, we'll return a message indicating we're relying on Gemini for PPT extraction
      return "[PowerPoint text extraction requires Gemini AI. Using Gemini for extraction.]";
    } catch (error) {
      console.error('Error extracting PPT text with traditional method:', error);
      return `[Error processing PowerPoint file with traditional method: ${error instanceof Error ? error.message : 'Unknown error'}]`;
    }
  }

  /**
   * Extract text from a PowerPoint file using Gemini API
   * @param filePath Path to the PowerPoint file
   * @param metadata Optional metadata to provide context for extraction
   * @returns Extracted text content
   */
  async extractPptTextWithGemini(filePath: string, metadata?: {
    documentType?: string;
    name?: string;
    timePeriod?: string;
    description?: string;
  }): Promise<string> {
    try {
      // First check if the file exists
      if (!fs.existsSync(filePath)) {
        console.error(`PowerPoint file not found: ${filePath}`);
        return `[File not found: The document appears to be missing from the server. It may have been deleted or moved.]`;
      }

      const fileBuffer = await readFileAsync(filePath);

      // Format document type for display in prompt
      let documentTypeInfo = '';
      if (metadata?.documentType) {
        const formattedType = metadata.documentType.replace('financial_', '').replace(/_/g, ' ');
        documentTypeInfo = `Document Type: ${formattedType}\n`;
      }

      // Add time period if available
      let timePeriodInfo = '';
      if (metadata?.timePeriod) {
        timePeriodInfo = `Time Period: ${metadata.timePeriod}\n`;
      }

      // Add description if available
      let descriptionInfo = '';
      if (metadata?.description && metadata.description !== 'No description') {
        descriptionInfo = `Description: ${metadata.description}\n`;
      }

      // Enhanced prompt for PowerPoint extraction with better handling of tables and graphs
      // Check if this might be a financial presentation
      const isFinancialPresentation =
        metadata?.documentType?.includes('financial_') ||
        metadata?.name?.toLowerCase().includes('financ') ||
        metadata?.description?.toLowerCase().includes('financ');

      // Enhanced prompt with special handling for financial presentations
      const prompt = `
      Extract all text content from this PowerPoint presentation with maximum accuracy and completeness.
      ${documentTypeInfo}${timePeriodInfo}${descriptionInfo}
      This presentation requires precise extraction of all information, including tables and graphs.
      ${isFinancialPresentation ? 'This appears to be a FINANCIAL PRESENTATION, so pay special attention to financial data, tables, and charts.' : ''}

      CRITICAL EXTRACTION INSTRUCTIONS:
      1. Extract ABSOLUTELY ALL text content from the presentation, including:
         - Slide titles and headings
         - Bullet points and numbered lists
         - Body text and paragraphs
         - Speaker notes
         - Text in headers, footers, and slide numbers
         - Text embedded in images, charts, and diagrams
         - Any hidden slides or content

      2. Maintain the original structure and formatting:
         - Clearly indicate each slide with "--- Slide X: [Slide Title] ---"
         - Preserve the hierarchy of headings and subheadings
         - Maintain bullet point and numbered list formatting
         - Preserve paragraph breaks and text alignment

      3. FOR TABLES - EXTREMELY IMPORTANT:
         - Preserve the exact table structure with proper column alignment
         - Maintain header rows and column relationships
         - Format tables using a clear tabular format with column separators (| or tabs)
         - Include column headers and maintain their relationship to data
         - Ensure all cells, including empty ones, are properly represented
         - For financial tables, ensure all numbers, calculations, and totals are precisely captured
         - Format financial numbers with proper decimal places and thousands separators

      4. FOR GRAPHS AND CHARTS - EXTREMELY IMPORTANT:
         - Extract and describe all graphs and charts in detail
         - Include all data points, labels, legends, and axes information
         - For bar charts: list all categories and their corresponding values in a table format
         - For line graphs: list all data points with their x and y coordinates in a table format
         - For pie charts: list all segments with their labels and percentage values in a table format
         - Include any trend lines, annotations, or other visual elements
         - Format the extracted graph data in a structured way (tables if appropriate)
         - For financial charts, ensure all values are precisely captured with proper formatting

      5. Include ALL numbers, dates, currencies, percentages, and special characters exactly as they appear
      6. If you can't read certain parts, indicate with [unreadable text] but try to infer content from context
      7. Pay special attention to financial data, ensuring all numbers, calculations, and financial terms are captured with 100% accuracy
      8. For financial presentations, identify and highlight key financial metrics, KPIs, and performance indicators

      ${isFinancialPresentation ? `
      ADDITIONAL FINANCIAL DATA EXTRACTION INSTRUCTIONS:
      1. For financial tables, ensure proper alignment of numbers (right-aligned)
      2. Preserve currency symbols and formatting (e.g., $1,234.56)
      3. Clearly indicate negative numbers with proper formatting (e.g., -$1,234.56 or ($1,234.56))
      4. For balance sheets, clearly separate assets, liabilities, and equity sections
      5. For income statements, clearly separate revenue, expenses, and profit/loss sections
      6. For cash flow statements, clearly separate operating, investing, and financing activities
      7. Identify and highlight key financial metrics such as:
         - Revenue growth
         - Profit margins
         - EBITDA
         - Return on investment
         - Debt-to-equity ratio
         - Current ratio
         - Quick ratio
         - Asset turnover
         - Inventory turnover
         - Accounts receivable turnover
      8. Preserve any financial footnotes or explanatory notes
      9. Identify any financial projections or forecasts and clearly label them as such
      10. Preserve any financial ratios or calculations
      ` : ''}

      Return the extracted content as plain text with formatting preserved through spacing and structure.
      For tables, use a clear tabular format with column separators (|).
      For graphs, include both a description and the underlying data in a structured table format.
      `;

      const result = await executeGeminiWithDynamicRetry(async () => {
        return await documentExtractionModel.generateContent([
          prompt,
          { inlineData: { mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', data: fileBuffer.toString('base64') } }
        ]);
      });

      const response = result.response;
      const extractedText = response.text();

      if (!extractedText || extractedText.trim().length === 0) {
        console.warn(`Gemini returned empty or null text for PowerPoint: ${filePath}`);
        return '[No text content extracted from PowerPoint using Gemini]';
      }

      return extractedText;
    } catch (error) {
      console.error('Error extracting PPT text with Gemini:', error);
      // Return a placeholder message instead of throwing an error
      return `[Error processing PowerPoint file with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}]`;
    }
  }

  /**
   * Extract text from a PowerPoint file using both traditional methods and Gemini AI
   * @param filePath Path to the PowerPoint file
   * @param metadata Optional metadata to provide context for extraction
   * @returns DocumentExtractionResult containing both raw and AI-processed text
   */
  async extractPptTextWithBothMethods(filePath: string, metadata?: {
    documentType?: string;
    name?: string;
    timePeriod?: string;
    description?: string;
  }): Promise<DocumentExtractionResult> {
    const fileName = path.basename(filePath);
    const fileType = path.extname(filePath).toLowerCase().substring(1);
    const startTime = new Date();

    try {
      // First check if the file exists
      if (!fs.existsSync(filePath)) {
        console.error(`PowerPoint file not found: ${filePath}`);
        const errorMsg = `[File not found: The document appears to be missing from the server. It may have been deleted or moved.]`;
        return {
          rawText: errorMsg,
          aiProcessedText: errorMsg,
          combinedText: errorMsg,
          extractionMethod: 'error',
          metadata: {
            fileType,
            fileName,
            extractionTime: new Date(),
            error: 'File not found',
            documentType: metadata?.documentType,
            timePeriod: metadata?.timePeriod,
            description: metadata?.description
          }
        };
      }

      // Extract text using both methods in parallel with enhanced metadata handling
      const [rawText, aiProcessedText] = await Promise.all([
        this.extractPptTextTraditional(filePath),
        this.extractPptTextWithGemini(filePath, metadata)
      ]);

      // Determine which text to use as the combined result
      // For PowerPoint, we almost always prefer the AI-processed text
      let combinedText = aiProcessedText;
      let extractionMethod = 'gemini';

      if (
        !aiProcessedText ||
        aiProcessedText.includes('[Error processing PowerPoint file with Gemini:') ||
        aiProcessedText.includes('[No text content extracted from PowerPoint using Gemini]')
      ) {
        combinedText = rawText;
        extractionMethod = 'traditional';
      }

      const endTime = new Date();
      const processingTime = endTime.getTime() - startTime.getTime();

      // Create a more comprehensive metadata object
      const resultMetadata = {
        fileType,
        fileName,
        extractionTime: endTime,
        processingTimeMs: processingTime,
        documentType: metadata?.documentType,
        timePeriod: metadata?.timePeriod,
        description: metadata?.description,
        extractionQuality: extractionMethod === 'gemini' ? 'high' : 'standard'
      };

      return {
        rawText,
        aiProcessedText,
        combinedText,
        extractionMethod,
        metadata: resultMetadata
      };
    } catch (error) {
      console.error('Error extracting PowerPoint text with both methods:', error);
      const errorMsg = `[Error processing PowerPoint: ${error instanceof Error ? error.message : 'Unknown error'}]`;

      return {
        rawText: errorMsg,
        aiProcessedText: errorMsg,
        combinedText: errorMsg,
        extractionMethod: 'error',
        metadata: {
          fileType,
          fileName,
          extractionTime: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
          documentType: metadata?.documentType,
          timePeriod: metadata?.timePeriod,
          description: metadata?.description
        }
      };
    }
  }

  /**
   * Extract text from a PowerPoint file (legacy method for backward compatibility)
   * @param filePath Path to the PowerPoint file
   * @returns Extracted text content
   */
  async extractPptText(filePath: string): Promise<string> {
    try {
      const result = await this.extractPptTextWithGemini(filePath);
      return result;
    } catch (error) {
      console.error('Error in legacy extractPptText method:', error);
      return `[Error processing PowerPoint file: ${error instanceof Error ? error.message : 'Unknown error'}]`;
    }
  }

  /**
   * Extract text from a Word document
   * @param filePath Path to the Word document
   * @param metadata Optional metadata to provide context for extraction
   * @returns Extracted text content
   */
  async extractWordText(filePath: string, metadata?: {
    documentType?: string;
    name?: string;
    timePeriod?: string;
    description?: string;
  }): Promise<string> {
    try {
      // First check if the file exists
      if (!fs.existsSync(filePath)) {
        console.error(`Word document not found: ${filePath}`);
        return `[File not found: The document appears to be missing from the server. It may have been deleted or moved.]`;
      }

      try {
        // First try using Gemini for better extraction, especially for complex documents
        const fileBuffer = await readFileAsync(filePath);

        // Format document type for display in prompt
        let documentTypeInfo = '';
        if (metadata?.documentType) {
          const formattedType = metadata.documentType.replace('financial_', '').replace(/_/g, ' ');
          documentTypeInfo = `Document Type: ${formattedType}\n`;
        }

        // Add time period if available
        let timePeriodInfo = '';
        if (metadata?.timePeriod) {
          timePeriodInfo = `Time Period: ${metadata.timePeriod}\n`;
        }

        // Add description if available
        let descriptionInfo = '';
        if (metadata?.description && metadata.description !== 'No description') {
          descriptionInfo = `Description: ${metadata.description}\n`;
        }

        // Create a context-aware prompt for Gemini to extract text from the Word document
        const prompt = `
        Extract all text content from this Word document with maximum accuracy and completeness.
        ${documentTypeInfo}${timePeriodInfo}${descriptionInfo}
        This document may contain important financial or business information that needs to be precisely extracted.

        CRITICAL EXTRACTION INSTRUCTIONS:
        1. Extract ABSOLUTELY ALL text content from the document, including headers, footers, footnotes, endnotes, and any text in images or charts
        2. Maintain the original formatting with exact preservation of:
           - Document structure and hierarchy
           - Section headings and subheadings
           - Paragraph breaks and indentation
           - Bullet points and numbered lists
           - Table structures (preserve rows, columns, and cell alignment)
           - Text formatting that conveys meaning (bold, italic, underline)
        3. For tables:
           - Preserve the exact table structure with proper column alignment
           - Maintain header rows and column relationships
           - Format as tab-separated values or in a way that perfectly maintains the structure
           - Ensure all cells, including empty ones, are properly represented
        4. Include ALL numbers, dates, currencies, percentages, and special characters exactly as they appear
        5. Preserve ALL paragraph breaks, section divisions, and page structure
        6. If there are multiple pages, maintain the document flow and structure
        7. If you can't read certain parts, indicate with [unreadable text] but try to infer content from context
        8. Extract ALL information possible, even from complex documents, using context clues when necessary
        9. Pay special attention to financial data, ensuring all numbers, calculations, and financial terms are captured with 100% accuracy
        10. Preserve any headers, footers, watermarks, and marginalia that may contain important information

        Return the extracted content as plain text with formatting preserved through spacing and structure.
        `;

        const result = await executeGeminiWithDynamicRetry(async () => {
          return await documentExtractionModel.generateContent([
            prompt,
            { inlineData: { mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', data: fileBuffer.toString('base64') } }
          ]);
        });

        const response = result.response;
        const extractedText = response.text();

        if (extractedText && extractedText.length > 0) {
          return extractedText;
        }

        // Fall back to mammoth if Gemini fails
        console.log(`Falling back to mammoth for Word document: ${filePath}`);
      } catch (geminiError) {
        console.error('Error extracting Word text with Gemini:', geminiError);
        // Continue to fallback method
      }

      // Enhanced fallback to mammoth with improved options for financial documents
      const options = {
        path: filePath,
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Heading 4'] => h4:fresh",
          "r[style-name='Strong'] => strong",
          "r[style-name='Emphasis'] => em",
          "table => table",
          "tr => tr",
          "td => td",
          // Additional mappings for financial documents
          "p[style-name='Title'] => h1:fresh",
          "p[style-name='Subtitle'] => h2:fresh",
          "p[style-name='TOC Heading'] => h2:fresh",
          "p[style-name='List Paragraph'] => ul > li:fresh",
          // Preserve numbering
          "p[style-name='List Number'] => ol > li:fresh",
          // Financial document specific styles
          "p[style-name='Balance Sheet'] => div.financial-statement:fresh",
          "p[style-name='Income Statement'] => div.financial-statement:fresh",
          "p[style-name='Cash Flow'] => div.financial-statement:fresh",
          "p[style-name='Financial Data'] => div.financial-data:fresh"
        ],
        includeDefaultStyleMap: true,
        preserveEmptyParagraphs: true,
        // Skip image conversion for plain text extraction
        preserveImageSize: true
      };

      // First try to extract with HTML to better preserve tables
      try {
        const htmlResult = await mammoth.convertToHtml(options);
        const htmlContent = htmlResult.value;

        // Convert HTML to plain text while preserving table structure
        let plainText = '';

        // Process the HTML content
        let inTable = false;
        let inTableRow = false;
        let inTableCell = false;
        let currentTableRow: string[] = [];
        let tableRows: string[][] = [];
        let columnWidths: number[] = [];
        let currentText = '';
        let inHeading = false;

        // Simple HTML parsing to extract structured text
        for (let i = 0; i < htmlContent.length; i++) {
          // Check for table start
          if (htmlContent.substring(i, i + 7) === '<table>') {
            if (currentText.trim()) {
              plainText += currentText.trim() + '\n\n';
              currentText = '';
            }
            inTable = true;
            tableRows = [];
            columnWidths = [];
            i += 6; // Skip the tag
            continue;
          }

          // Check for table end
          if (inTable && htmlContent.substring(i, i + 8) === '</table>') {
            // Format the table
            if (tableRows.length > 0) {
              // Calculate column widths
              tableRows.forEach(row => {
                row.forEach((cell, colIndex) => {
                  const cellLength = cell.length;
                  if (!columnWidths[colIndex] || cellLength > columnWidths[colIndex]) {
                    columnWidths[colIndex] = Math.min(cellLength, 30); // Cap at 30 chars
                  }
                });
              });

              // Format the table with proper alignment
              tableRows.forEach((row, rowIndex) => {
                const formattedRow = row.map((cell, colIndex) => {
                  // Pad or truncate to column width
                  if (cell.length > columnWidths[colIndex]) {
                    return cell.substring(0, columnWidths[colIndex] - 3) + '...';
                  } else {
                    // Right-align numbers, left-align text
                    if (this.isNumeric(cell)) {
                      return cell.padStart(columnWidths[colIndex]);
                    } else {
                      return cell.padEnd(columnWidths[colIndex]);
                    }
                  }
                });

                plainText += formattedRow.join(' | ') + '\n';

                // Add separator line after header row
                if (rowIndex === 0) {
                  const separatorLine = row.map((_, colIndex) => '-'.repeat(columnWidths[colIndex]));
                  plainText += separatorLine.join('-+-') + '\n';
                }
              });

              plainText += '\n';
            }

            inTable = false;
            i += 7; // Skip the tag
            continue;
          }

          // Check for table row start
          if (inTable && htmlContent.substring(i, i + 4) === '<tr>') {
            inTableRow = true;
            currentTableRow = [];
            i += 3; // Skip the tag
            continue;
          }

          // Check for table row end
          if (inTableRow && htmlContent.substring(i, i + 5) === '</tr>') {
            inTableRow = false;
            tableRows.push(currentTableRow);
            i += 4; // Skip the tag
            continue;
          }

          // Check for table cell start
          if (inTableRow && (htmlContent.substring(i, i + 4) === '<td>' || htmlContent.substring(i, i + 4) === '<th>')) {
            inTableCell = true;
            currentText = '';
            i += 3; // Skip the tag
            continue;
          }

          // Check for table cell end
          if (inTableCell && (htmlContent.substring(i, i + 5) === '</td>' || htmlContent.substring(i, i + 5) === '</th>')) {
            inTableCell = false;
            currentTableRow.push(currentText.trim());
            i += 4; // Skip the tag
            continue;
          }

          // Check for heading start
          if (htmlContent.substring(i, i + 3) === '<h1') {
            inHeading = true;
            if (currentText.trim()) {
              plainText += currentText.trim() + '\n\n';
              currentText = '';
            }
            // Skip to the end of the tag
            while (i < htmlContent.length && htmlContent[i] !== '>') i++;
            continue;
          }

          if (htmlContent.substring(i, i + 3) === '<h2') {
            inHeading = true;
            if (currentText.trim()) {
              plainText += currentText.trim() + '\n\n';
              currentText = '';
            }
            // Skip to the end of the tag
            while (i < htmlContent.length && htmlContent[i] !== '>') i++;
            continue;
          }

          if (htmlContent.substring(i, i + 3) === '<h3') {
            inHeading = true;
            if (currentText.trim()) {
              plainText += currentText.trim() + '\n\n';
              currentText = '';
            }
            // Skip to the end of the tag
            while (i < htmlContent.length && htmlContent[i] !== '>') i++;
            continue;
          }

          // Check for heading end
          if (inHeading && htmlContent.substring(i, i + 4) === '</h1') {
            inHeading = false;
            plainText += '\n' + currentText.trim().toUpperCase() + '\n';
            plainText += '='.repeat(currentText.trim().length) + '\n\n';
            currentText = '';
            // Skip to the end of the tag
            while (i < htmlContent.length && htmlContent[i] !== '>') i++;
            continue;
          }

          if (inHeading && htmlContent.substring(i, i + 4) === '</h2') {
            inHeading = false;
            plainText += '\n' + currentText.trim() + '\n';
            plainText += '-'.repeat(currentText.trim().length) + '\n\n';
            currentText = '';
            // Skip to the end of the tag
            while (i < htmlContent.length && htmlContent[i] !== '>') i++;
            continue;
          }

          if (inHeading && htmlContent.substring(i, i + 4) === '</h3') {
            inHeading = false;
            plainText += '\n' + currentText.trim() + '\n\n';
            currentText = '';
            // Skip to the end of the tag
            while (i < htmlContent.length && htmlContent[i] !== '>') i++;
            continue;
          }

          // Check for paragraph break
          if (htmlContent.substring(i, i + 4) === '</p>' || htmlContent.substring(i, i + 5) === '</div') {
            if (!inTable && !inTableRow && !inTableCell) {
              plainText += currentText.trim() + '\n\n';
              currentText = '';
            }
            // Skip to the end of the tag
            while (i < htmlContent.length && htmlContent[i] !== '>') i++;
            continue;
          }

          // Check for list item
          if (htmlContent.substring(i, i + 5) === '</li>') {
            if (!inTable && !inTableRow && !inTableCell) {
              plainText += '- ' + currentText.trim() + '\n';
              currentText = '';
            }
            // Skip to the end of the tag
            while (i < htmlContent.length && htmlContent[i] !== '>') i++;
            continue;
          }

          // Skip other HTML tags
          if (htmlContent[i] === '<') {
            while (i < htmlContent.length && htmlContent[i] !== '>') i++;
            continue;
          }

          // Add character to current text
          if (inTableCell || inHeading || (!inTable && !inTableRow)) {
            currentText += htmlContent[i];
          }
        }

        // Add any remaining text
        if (currentText.trim()) {
          plainText += currentText.trim() + '\n';
        }

        // Clean up the text
        plainText = plainText
          .replace(/\n{3,}/g, '\n\n')  // Replace 3+ newlines with 2
          .replace(/&nbsp;/g, ' ')     // Replace HTML non-breaking spaces
          .replace(/&lt;/g, '<')       // Replace HTML entities
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim();

        // Add metadata header if available
        let finalText = '';
        if (metadata) {
          finalText += '=== DOCUMENT INFORMATION ===\n';
          if (metadata.name) finalText += `Filename: ${metadata.name}\n`;
          if (metadata.documentType) {
            const formattedType = metadata.documentType.replace('financial_', '').replace(/_/g, ' ');
            finalText += `Type: ${formattedType}\n`;
          }
          if (metadata.timePeriod) finalText += `Time Period: ${metadata.timePeriod}\n`;
          if (metadata.description && metadata.description !== 'No description') {
            finalText += `Description: ${metadata.description}\n`;
          }
          finalText += '\n=== DOCUMENT CONTENT ===\n\n';
        }

        finalText += plainText;
        return finalText;
      } catch (htmlError) {
        console.error('Error extracting Word document with HTML conversion:', htmlError);
        // Fall back to raw text extraction
      }

      // Fallback to raw text extraction if HTML conversion fails
      const result = await mammoth.extractRawText(options);

      // Add metadata header if available
      let finalText = '';
      if (metadata) {
        finalText += '=== DOCUMENT INFORMATION ===\n';
        if (metadata.name) finalText += `Filename: ${metadata.name}\n`;
        if (metadata.documentType) {
          const formattedType = metadata.documentType.replace('financial_', '').replace(/_/g, ' ');
          finalText += `Type: ${formattedType}\n`;
        }
        if (metadata.timePeriod) finalText += `Time Period: ${metadata.timePeriod}\n`;
        if (metadata.description && metadata.description !== 'No description') {
          finalText += `Description: ${metadata.description}\n`;
        }
        finalText += '\n=== DOCUMENT CONTENT ===\n\n';
      }

      finalText += result.value || '[No text content extracted from Word document]';
      return finalText;
    } catch (error) {
      console.error('Error extracting Word text:', error);
      // Return a placeholder message instead of throwing an error
      return `[Error processing Word document: ${error instanceof Error ? error.message : 'Unknown error'}]`;
    }
  }
  /**
   * Extract text from an image using OCR (now delegated to Gemini AI)
   * @param filePath Path to the image file
   * @returns Extracted text content
   */
  async extractImageTextWithTesseract(filePath: string): Promise<string> {
    // Delegate to Gemini-based image extraction for consistency
    return this.extractImageTextWithGemini(filePath);
  }

  /**
   * Extract text from an image using Gemini AI
   * @param filePath Path to the image file
   * @param metadata Optional metadata to provide context for extraction
   * @returns Extracted text content
   */
  async extractImageTextWithGemini(filePath: string, metadata?: {
    documentType?: string;
    name?: string;
    timePeriod?: string;
    description?: string;
  }): Promise<string> {
    try {
      // First check if the file exists
      if (!fs.existsSync(filePath)) {
        console.error(`Image file not found: ${filePath}`);
        return `[File not found: The document appears to be missing from the server. It may have been deleted or moved.]`;
      }

      // Read the file as a buffer
      const fileBuffer = await readFileAsync(filePath);
      const fileExtension = path.extname(filePath).toLowerCase();
      let mimeType = 'image/jpeg'; // Default mime type

      // Set the correct mime type based on file extension
      if (fileExtension === '.png') {
        mimeType = 'image/png';
      } else if (fileExtension === '.gif') {
        mimeType = 'image/gif';
      } else if (fileExtension === '.bmp') {
        mimeType = 'image/bmp';
      }

      // Check if this might be a financial image based on the file path or metadata
      const isFinancialImage = filePath.toLowerCase().includes('financ') ||
        filePath.toLowerCase().includes('report') ||
        filePath.toLowerCase().includes('statement') ||
        filePath.toLowerCase().includes('balance') ||
        filePath.toLowerCase().includes('income') ||
        filePath.toLowerCase().includes('cash flow') ||
        metadata?.documentType?.includes('financial_') ||
        metadata?.name?.toLowerCase().includes('financ') ||
        metadata?.description?.toLowerCase().includes('financ');

      // Format document type for display in prompt
      let documentTypeInfo = '';
      if (metadata?.documentType) {
        const formattedType = metadata.documentType.replace('financial_', '').replace(/_/g, ' ');
        documentTypeInfo = `Document Type: ${formattedType}\n`;
      }

      // Add time period if available
      let timePeriodInfo = '';
      if (metadata?.timePeriod) {
        timePeriodInfo = `Time Period: ${metadata.timePeriod}\n`;
      }

      // Add description if available
      let descriptionInfo = '';
      if (metadata?.description && metadata.description !== 'No description') {
        descriptionInfo = `Description: ${metadata.description}\n`;
      }

      // Create an enhanced prompt for Gemini to extract text from the image with better handling of financial content
      const prompt = `
      Extract all text content from this image using OCR with maximum accuracy and completeness.
      ${documentTypeInfo}${timePeriodInfo}${descriptionInfo}
      ${isFinancialImage ? 'This appears to be a FINANCIAL IMAGE, so pay special attention to financial data, tables, and charts.' : ''}

      CRITICAL EXTRACTION INSTRUCTIONS:
      1. Extract ABSOLUTELY ALL text visible in the image, including small text and text in any orientation
      2. Maintain the original formatting as much as possible
      3. For tables:
         - Preserve the exact table structure with proper column alignment
         - Maintain header rows and column relationships
         - Format tables using a clear tabular format with column separators (|)
         - Include column headers and maintain their relationship to data
         - Ensure all cells, including empty ones, are properly represented
         ${isFinancialImage ? '- For financial tables, ensure all numbers, calculations, and totals are precisely captured' : ''}
         ${isFinancialImage ? '- Format financial numbers with proper decimal places and thousands separators' : ''}
      4. For charts and graphs:
         - Extract and describe all graphs and charts in detail
         - Include all data points, labels, legends, and axes information
         - For bar charts: list all categories and their corresponding values in a table format
         - For line graphs: list all data points with their x and y coordinates in a table format
         - For pie charts: list all segments with their labels and percentage values in a table format
         ${isFinancialImage ? '- For financial charts, ensure all values are precisely captured with proper formatting' : ''}
      5. Include ALL numbers, dates, currencies, percentages, and special characters exactly as they appear
      6. Preserve paragraph breaks and section divisions
      7. If you can't read certain parts, indicate with [unreadable text] but try to infer from context
      ${isFinancialImage ? '8. Pay special attention to financial data, ensuring all numbers, calculations, and financial terms are captured with 100% accuracy' : ''}

      ${isFinancialImage ? `
      ADDITIONAL FINANCIAL DATA EXTRACTION INSTRUCTIONS:
      1. For financial tables, ensure proper alignment of numbers (right-aligned)
      2. Preserve currency symbols and formatting (e.g., $1,234.56)
      3. Clearly indicate negative numbers with proper formatting (e.g., -$1,234.56 or ($1,234.56))
      4. For balance sheets, clearly separate assets, liabilities, and equity sections
      5. For income statements, clearly separate revenue, expenses, and profit/loss sections
      6. For cash flow statements, clearly separate operating, investing, and financing activities
      7. Identify and highlight key financial metrics such as:
         - Revenue growth
         - Profit margins
         - EBITDA
         - Return on investment
         - Debt-to-equity ratio
         - Current ratio
         - Quick ratio
      8. Preserve any financial footnotes or explanatory notes
      ` : ''}

      Return the extracted content as plain text with formatting preserved through spacing and structure.
      For tables, use a clear tabular format with column separators (|).
      For graphs, include both a description and the underlying data in a structured table format.
      `;

      const result = await executeGeminiWithDynamicRetry(async () => {
        return await documentExtractionModel.generateContent([
          prompt,
          { inlineData: { mimeType, data: fileBuffer.toString('base64') } }
        ]);
      });

      const response = result.response;
      const extractedText = response.text();

      return extractedText || '[No text content extracted from image using Gemini]';
    } catch (error) {
      console.error('Error extracting image text with Gemini:', error);
      // Return a placeholder message instead of throwing an error
      return `[Error processing image file with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}]`;
    }
  }

  /**
   * Extract text from an image using both Tesseract OCR and Gemini AI
   * @param filePath Path to the image file
   * @param metadata Optional metadata to provide context for extraction
   * @returns DocumentExtractionResult containing both raw and AI-processed text
   */
  async extractImageTextWithBothMethods(filePath: string, metadata?: {
    documentType?: string;
    name?: string;
    timePeriod?: string;
    description?: string;
  }): Promise<DocumentExtractionResult> {
    const fileName = path.basename(filePath);
    const fileExtension = path.extname(filePath).toLowerCase();
    const fileType = fileExtension.substring(1);
    const startTime = new Date();

    try {
      // First check if the file exists
      if (!fs.existsSync(filePath)) {
        console.error(`Image file not found: ${filePath}`);
        const errorMsg = `[File not found: The document appears to be missing from the server. It may have been deleted or moved.]`;
        return {
          rawText: errorMsg,
          aiProcessedText: errorMsg,
          combinedText: errorMsg,
          extractionMethod: 'error',
          metadata: {
            fileType,
            fileName,
            extractionTime: new Date(),
            error: 'File not found'
          }
        };
      }      // Extract text using Gemini AI (simplified from both methods)
      const aiProcessedText = await this.extractImageTextWithGemini(filePath, metadata);

      // Since we now only use Gemini, both raw and AI processed are the same
      const combinedText = aiProcessedText;
      const extractionMethod = 'gemini';

      const endTime = new Date();
      const processingTime = endTime.getTime() - startTime.getTime();

      return {
        rawText: aiProcessedText, // Same as AI processed
        aiProcessedText,
        combinedText,
        extractionMethod,
        metadata: {
          fileType,
          fileName,
          extractionTime: endTime,
          processingTimeMs: processingTime,
          documentType: metadata?.documentType,
          timePeriod: metadata?.timePeriod,
          description: metadata?.description,
          extractionQuality: 'high'
        }
      };
    } catch (error) {
      console.error('Error extracting image text with both methods:', error);
      const errorMsg = `[Error processing image file: ${error instanceof Error ? error.message : 'Unknown error'}]`;

      return {
        rawText: errorMsg,
        aiProcessedText: errorMsg,
        combinedText: errorMsg,
        extractionMethod: 'error',
        metadata: {
          fileType,
          fileName,
          extractionTime: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
          documentType: metadata?.documentType,
          timePeriod: metadata?.timePeriod,
          description: metadata?.description
        }
      };
    }
  }

  /**
   * Extract text from an image using OCR (legacy method for backward compatibility)
   * @param filePath Path to the image file
   * @param metadata Optional metadata to provide context for extraction
   * @returns Extracted text content
   */
  async extractImageText(filePath: string, metadata?: {
    documentType?: string;
    name?: string;
    timePeriod?: string;
    description?: string;
  }): Promise<string> {
    // Delegate to Gemini AI extraction
    return this.extractImageTextWithGemini(filePath, metadata);
  }

  /**
   * Extract text from a text file
   * @param filePath Path to the text file
   * @returns Extracted text content
   */
  async extractTextFileContent(filePath: string): Promise<string> {
    try {
      // First check if the file exists
      if (!fs.existsSync(filePath)) {
        console.error(`Text file not found: ${filePath}`);
        return `[File not found: The document appears to be missing from the server. It may have been deleted or moved.]`;
      }

      const content = await readFileAsync(filePath, 'utf8');
      return content || '[No content extracted from text file]';
    } catch (error) {
      console.error('Error extracting text file content:', error);
      // Return a placeholder message instead of throwing an error
      return `[Error processing text file: ${error instanceof Error ? error.message : 'Unknown error'}]`;
    }
  }

  /**
   * Process a document and extract its content based on file type
   * @param filePath Path to the document (relative or absolute)
   * @param returnBothExtractions Whether to return both raw and AI-processed text
   * @param metadata Optional metadata to provide context for extraction
   * @returns Extracted content or DocumentExtractionResult if returnBothExtractions is true
   */
  async processDocument(
    filePath: string,
    returnBothExtractions: boolean = false,
    metadata?: {
      documentType?: string;
      name?: string;
      timePeriod?: string;
      description?: string;
    }
  ): Promise<string | DocumentExtractionResult> {
    try {
      // Convert to absolute path if it's a relative path
      const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '../..', filePath);

      // Check if file exists before processing
      if (!fs.existsSync(absolutePath)) {
        console.error(`File not found: ${absolutePath}`);
        const errorMsg = `[File not found: The document appears to be missing from the server. It may have been deleted or moved.]`;

        if (returnBothExtractions) {
          return {
            rawText: errorMsg,
            aiProcessedText: errorMsg,
            combinedText: errorMsg,
            extractionMethod: 'error',
            metadata: {
              fileType: path.extname(absolutePath).toLowerCase().substring(1),
              fileName: path.basename(absolutePath),
              extractionTime: new Date(),
              error: 'File not found',
              documentType: metadata?.documentType,
              timePeriod: metadata?.timePeriod,
              description: metadata?.description
            }
          };
        }

        return errorMsg;
      }

      const fileExtension = path.extname(absolutePath).toLowerCase();
      let result: string | DocumentExtractionResult;

      switch (fileExtension) {
        case '.pdf':
          // Always use both extraction methods for PDFs
          const pdfResult = await this.extractPdfTextWithBothMethods(absolutePath, metadata);

          if (returnBothExtractions) {
            // If caller wants both extractions, return the full result
            result = pdfResult;
          } else {
            // Otherwise, just return the combined text
            result = pdfResult.combinedText;
          }
          break;
        case '.jpg':
        case '.jpeg':
        case '.png':
        case '.gif':
        case '.bmp':
          if (returnBothExtractions) {
            result = await this.extractImageTextWithBothMethods(absolutePath, metadata);
          } else {
            // For backward compatibility, we still use the legacy method for single extraction
            result = await this.extractImageText(absolutePath, metadata);
          }
          break;
        case '.ppt':
        case '.pptx':
          // Always use both extraction methods for PowerPoint files with enhanced metadata handling
          const pptResult = await this.extractPptTextWithBothMethods(absolutePath, metadata);

          if (returnBothExtractions) {
            // If caller wants both extractions, return the full result
            result = pptResult;
          } else {
            // Otherwise, just return the combined text
            result = pptResult.combinedText;
          }
          break;
        case '.xls':
        case '.xlsx':
          result = await this.extractExcelData(absolutePath, metadata);
          if (returnBothExtractions) {
            result = {
              rawText: result,
              aiProcessedText: result, // Currently only one method for Excel
              combinedText: result,
              extractionMethod: 'combined',
              metadata: {
                fileType: fileExtension.substring(1),
                fileName: path.basename(absolutePath),
                extractionTime: new Date(),
                documentType: metadata?.documentType,
                timePeriod: metadata?.timePeriod,
                description: metadata?.description,
                extractionQuality: 'high'
              }
            };
          }
          break;
        case '.csv':
          result = await this.extractCsvData(absolutePath, metadata);
          if (returnBothExtractions) {
            result = {
              rawText: result,
              aiProcessedText: result, // Currently only one method for CSV
              combinedText: result,
              extractionMethod: 'traditional',
              metadata: {
                fileType: 'csv',
                fileName: path.basename(absolutePath),
                extractionTime: new Date(),
                documentType: metadata?.documentType,
                timePeriod: metadata?.timePeriod,
                description: metadata?.description,
                extractionQuality: 'high'
              }
            };
          }
          break;
        case '.doc':
        case '.docx':
          result = await this.extractWordText(absolutePath, metadata);
          if (returnBothExtractions) {
            result = {
              rawText: result,
              aiProcessedText: result, // Currently only one method for Word
              combinedText: result,
              extractionMethod: 'combined',
              metadata: {
                fileType: fileExtension.substring(1),
                fileName: path.basename(absolutePath),
                extractionTime: new Date(),
                documentType: metadata?.documentType,
                timePeriod: metadata?.timePeriod,
                description: metadata?.description,
                extractionQuality: 'high'
              }
            };
          }
          break;
        case '.txt':
        case '.md':
        case '.json':
        case '.xml':
          result = await this.extractTextFileContent(absolutePath);
          if (returnBothExtractions) {
            result = {
              rawText: result,
              aiProcessedText: result, // Plain text doesn't need AI processing
              combinedText: result,
              extractionMethod: 'traditional',
              metadata: {
                fileType: fileExtension.substring(1),
                fileName: path.basename(absolutePath),
                extractionTime: new Date()
              }
            };
          }
          break;
        default:
          const unsupportedMsg = `[Unsupported file type: ${fileExtension}. The system cannot process this type of document.]`;
          if (returnBothExtractions) {
            result = {
              rawText: unsupportedMsg,
              aiProcessedText: unsupportedMsg,
              combinedText: unsupportedMsg,
              extractionMethod: 'error',
              metadata: {
                fileType: fileExtension.substring(1) || 'unknown',
                fileName: path.basename(absolutePath),
                extractionTime: new Date(),
                error: 'Unsupported file type'
              }
            };
          } else {
            result = unsupportedMsg;
          }
      }

      return result;
    } catch (error) {
      console.error(`Error processing document ${filePath}:`, error);
      const errorMsg = `[Error processing document: ${error instanceof Error ? error.message : 'Unknown error'}]`;

      if (returnBothExtractions) {
        return {
          rawText: errorMsg,
          aiProcessedText: errorMsg,
          combinedText: errorMsg,
          extractionMethod: 'error',
          metadata: {
            fileType: path.extname(filePath).toLowerCase().substring(1) || 'unknown',
            fileName: path.basename(filePath),
            extractionTime: new Date(),
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        };
      }

      return errorMsg;
    }
  }



  /**
   * Process documents for financial due diligence by combining raw text, OCR text, and metadata
   * This method ensures all PDFs and PPTs are processed through Gemini for OCR
   * Optimized to batch process documents by file type to reduce API calls
   * @param documents Array of document objects with filePath, documentType, and additional metadata
   * @returns Combined document content with preserved structure and metadata
   */
  async processDocumentsForFinancialDD(documents: Array<{
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
    console.log('Processing documents for financial due diligence with optimized batching...');

    // Create a map to store content by document type
    const contentByType: { [key: string]: any[] } = {};

    // Group documents by file extension for batch processing
    const documentsByExtension: { [key: string]: Array<any> } = {};

    // First, group documents by their file extension
    documents.forEach(doc => {
      const fileExtension = path.extname(doc.filePath).toLowerCase();
      if (!documentsByExtension[fileExtension]) {
        documentsByExtension[fileExtension] = [];
      }
      documentsByExtension[fileExtension].push(doc);
    });

    console.log(`Grouped documents by extension: ${Object.keys(documentsByExtension).join(', ')}`);

    // Process each group of documents by file type
    for (const [extension, docs] of Object.entries(documentsByExtension)) {
      console.log(`Processing batch of ${docs.length} ${extension} documents...`);

      // Process PDFs as a batch
      if (extension === '.pdf') {
        await this.processPdfDocumentsBatch(docs, contentByType);
      }
      // Process PowerPoint files as a batch
      else if (extension === '.ppt' || extension === '.pptx') {
        await this.processPptDocumentsBatch(docs, contentByType);
      }
      // Process other document types individually
      else {
        await this.processOtherDocumentsBatch(docs, contentByType);
      }
    }

    // Create a structured JSON object for all document types
    const combinedData: { [key: string]: any[] } = {};

    // Process each document type
    for (const [docType, contents] of Object.entries(contentByType)) {
      // Format document type for display (remove 'financial_' prefix, replace underscores with spaces, and capitalize)
      const formattedDocType = docType.replace('financial_', '')
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Add to combined data
      combinedData[formattedDocType] = contents;
    }

    // Return the combined data as a JSON string
    return JSON.stringify(combinedData, null, 2);
  }

  /**
   * Process a batch of PDF documents using memory-based OCR service
   * @param documents Array of PDF document objects
   * @param contentByType Map to store content by document type
   */
  private async processPdfDocumentsBatch(
    documents: Array<any>,
    contentByType: { [key: string]: any[] }
  ): Promise<void> {
    console.log(`Processing batch of ${documents.length} PDF documents with memory-based OCR...`);

    try {
      // Prepare documents for memory-based processing
      const documentsWithBuffers: Array<{
        buffer: Buffer;
        metadata: DocumentMetadata;
        originalDoc: any;
      }> = [];

      // Read PDF files into memory
      for (const doc of documents) {
        try {
          if (!fs.existsSync(doc.filePath)) {
            console.error(`PDF file not found: ${doc.filePath}`);

            // Initialize array for this document type if it doesn't exist
            if (!contentByType[doc.documentType]) {
              contentByType[doc.documentType] = [];
            }

            // Add error document
            contentByType[doc.documentType].push({
              metadata: {
                filename: doc.originalName,
                type: doc.documentType.replace('financial_', '').replace(/_/g, ' '),
                description: doc.description || 'No description provided',
                timePeriod: doc.timePeriod || 'Not specified',
                status: 'ERROR - File not found'
              },
              content: '[File not found: The document appears to be missing from the server.]',
              error: true
            });
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

          documentsWithBuffers.push({ buffer, metadata, originalDoc: doc });
        } catch (error) {
          console.error(`Error reading PDF file ${doc.filePath}:`, error);

          // Initialize array for this document type if it doesn't exist
          if (!contentByType[doc.documentType]) {
            contentByType[doc.documentType] = [];
          }

          // Add error document
          contentByType[doc.documentType].push({
            metadata: {
              filename: doc.originalName,
              type: doc.documentType.replace('financial_', '').replace(/_/g, ' '),
              description: doc.description || 'No description provided',
              timePeriod: doc.timePeriod || 'Not specified',
              status: 'ERROR - File read error'
            },
            content: `[Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}]`,
            error: true
          });
        }
      }      // Process PDFs with memory-based OCR service using the new combine-first approach
      if (documentsWithBuffers.length > 0) {
        console.log(`Processing ${documentsWithBuffers.length} PDFs using combine-first approach...`);        try {
          // Use the new processMultiplePdfDocuments method which combines first, then chunks
          const combinedResult = await this.memoryBasedOcrService.processMultiplePdfDocuments(
            documentsWithBuffers.map(item => ({ buffer: item.buffer, metadata: item.metadata }))
          );          // Store the full combined OCR result for reference
          contentByType['__combinedPdfText'] = [combinedResult];

          // The combined result contains the full text from all documents
          // We need to parse the document mapping information to create individual document entries
          const lines = combinedResult.split('\n');
          const documentMappingStart = lines.findIndex(line => line.includes('Document Mapping:'));
          const contentStart = lines.findIndex(line => line.includes('=== COMBINED CONTENT ==='));
          const contentEnd = lines.findIndex(line => line.includes('=== END OF COMBINED CONTENT ==='));          // Store the full combined OCR result for reference and further processing
          contentByType['__combinedPdfText'] = [{
            metadata: {
              type: 'Combined PDF OCR Result',
              totalDocuments: documentsWithBuffers.length,
              processingMethod: 'memory-based-ocr-combined',
              timestamp: new Date().toISOString(),
              documentList: documentsWithBuffers.map(item => item.originalDoc.originalName)
            },
            content: combinedResult,
            fullOcrOutput: true
          }];

          // Extract document mapping information
          const mappingLines = lines.slice(documentMappingStart + 1, contentStart);
          const documentMappings: Array<{ index: number, name: string, pages: string, startPage: number, endPage: number }> = [];

          mappingLines.forEach(line => {
            const match = line.match(/Document (\d+): (.+) \(Pages (\d+)-(\d+)\)/);
            if (match) {
              documentMappings.push({
                index: parseInt(match[1]) - 1, // Convert to 0-based index
                name: match[2],
                pages: `${match[3]}-${match[4]}`,
                startPage: parseInt(match[3]),
                endPage: parseInt(match[4])
              });
            }
          });

          // Extract the actual combined content text
          const combinedContentLines = lines.slice(contentStart + 1, contentEnd > 0 ? contentEnd : lines.length);
          const fullCombinedText = combinedContentLines.join('\n').trim();

          // Improved function to extract individual document content
          const extractDocumentContent = (documentIndex: number, mapping: any): string => {
            if (!mapping || !fullCombinedText) {
              return fullCombinedText || '[No content available]';
            }

            // Try to find document-specific markers in the combined text
            const documentName = mapping.name;
            const searchPattern = new RegExp(`(?:Document\\s+${documentIndex + 1}|${documentName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i');
            
            // Look for natural document boundaries in the text
            const paragraphs = fullCombinedText.split(/\n\s*\n/);
            let documentStart = -1;
            let documentEnd = -1;

            // Find paragraphs that might belong to this document
            for (let i = 0; i < paragraphs.length; i++) {
              if (searchPattern.test(paragraphs[i]) || 
                  paragraphs[i].toLowerCase().includes(documentName.toLowerCase().substring(0, 10))) {
                if (documentStart === -1) documentStart = i;
                documentEnd = i;
              }
            }

            // If we found document-specific content, extract it
            if (documentStart !== -1 && documentEnd !== -1) {
              // Include some context around the identified sections
              const contextStart = Math.max(0, documentStart - 1);
              const contextEnd = Math.min(paragraphs.length - 1, documentEnd + 3);
              const extractedParagraphs = paragraphs.slice(contextStart, contextEnd + 1);
              const extractedContent = extractedParagraphs.join('\n\n');
              
              if (extractedContent.length > 200) {
                return extractedContent;
              }
            }

            // Fallback: Use page-based estimation with improved logic
            const totalPages = documentMappings[documentMappings.length - 1]?.endPage || 1;
            const docStartPage = mapping.startPage;
            const docEndPage = mapping.endPage;
            
            // Calculate more accurate position based on page distribution
            const startRatio = (docStartPage - 1) / totalPages;
            const endRatio = docEndPage / totalPages;
            
            const startPos = Math.floor(fullCombinedText.length * startRatio);
            const endPos = Math.floor(fullCombinedText.length * endRatio);
            
            // Ensure we get a reasonable amount of content
            const minContentLength = Math.max(500, fullCombinedText.length / documentsWithBuffers.length * 0.5);
            const adjustedEndPos = Math.max(endPos, startPos + minContentLength);
            
            return fullCombinedText.substring(startPos, Math.min(adjustedEndPos, fullCombinedText.length)) || fullCombinedText;
          };          // Create document entries for each original document
          documentsWithBuffers.forEach((item, index) => {
            const { originalDoc } = item;

            // Initialize array for this document type if it doesn't exist
            if (!contentByType[originalDoc.documentType]) {
              contentByType[originalDoc.documentType] = [];
            }

            // Find the mapping for this document
            const mapping = documentMappings.find(m => m.index === index);
            const documentInfo = mapping ? ` (${mapping.pages})` : '';

            // Extract individual document content from the combined result
            let documentContent: string;
            if (mapping && fullCombinedText) {
              documentContent = extractDocumentContent(index, mapping);
              
              // Additional fallback if content is still too short
              if (documentContent.length < 200) {
                // Try to get a larger section based on document position
                const docsPerSection = Math.ceil(documentsWithBuffers.length / 3);
                const sectionIndex = Math.floor(index / docsPerSection);
                const totalSections = Math.ceil(documentsWithBuffers.length / docsPerSection);
                
                const sectionStart = Math.floor((fullCombinedText.length * sectionIndex) / totalSections);
                const sectionEnd = Math.floor((fullCombinedText.length * (sectionIndex + 1)) / totalSections);
                
                const sectionContent = fullCombinedText.substring(sectionStart, sectionEnd);
                if (sectionContent.length > documentContent.length) {
                  documentContent = sectionContent;
                }
              }
              
              // Final fallback: use a portion of the full text
              if (documentContent.length < 100) {
                const contentPerDoc = Math.floor(fullCombinedText.length / documentsWithBuffers.length);
                const startPos = index * contentPerDoc;
                const endPos = (index + 1) * contentPerDoc;
                documentContent = fullCombinedText.substring(startPos, endPos) || fullCombinedText;
              }
            } else {
              // Fallback: distribute content evenly
              const contentPerDoc = Math.floor(fullCombinedText.length / documentsWithBuffers.length);
              const startPos = index * contentPerDoc;
              const endPos = (index + 1) * contentPerDoc;
              documentContent = fullCombinedText.substring(startPos, endPos) || fullCombinedText;
            }

            // Create document data object with actual extracted content
            const documentData = {
              metadata: {
                filename: originalDoc.originalName,
                type: originalDoc.documentType.replace('financial_', '').replace(/_/g, ' '),
                description: originalDoc.description || 'No description provided',
                timePeriod: originalDoc.timePeriod || 'Not specified',
                processingNote: `Processed as part of combined document set${documentInfo}`,
                combinedProcessing: true,
                documentMapping: mapping
              },
              content: documentContent,
              extractionMethod: 'memory-based-ocr-combined',
              combinedResult: true
            };

            contentByType[originalDoc.documentType].push(documentData);
          });

        } catch (ocrError) {
          console.error('Error in memory-based OCR processing:', ocrError);

          // Handle OCR error for all documents
          documentsWithBuffers.forEach(({ originalDoc }) => {
            // Initialize array for this document type if it doesn't exist
            if (!contentByType[originalDoc.documentType]) {
              contentByType[originalDoc.documentType] = [];
            }

            contentByType[originalDoc.documentType].push({
              metadata: {
                filename: originalDoc.originalName,
                type: originalDoc.documentType.replace('financial_', '').replace(/_/g, ' '),
                description: originalDoc.description || 'No description provided',
                timePeriod: originalDoc.timePeriod || 'Not specified',
                status: 'ERROR - OCR processing failed'
              },
              content: `[OCR processing failed: ${ocrError instanceof Error ? ocrError.message : 'Unknown error'}]`,
              error: true
            });
          });
        }
      }

    } catch (error) {
      console.error('Error in PDF batch processing:', error);

      // Handle general error for all documents
      documents.forEach((doc) => {
        // Initialize array for this document type if it doesn't exist
        if (!contentByType[doc.documentType]) {
          contentByType[doc.documentType] = [];
        }

        contentByType[doc.documentType].push({
          metadata: {
            filename: doc.originalName,
            type: doc.documentType.replace('financial_', '').replace(/_/g, ' '),
            description: doc.description || 'No description provided',
            timePeriod: doc.timePeriod || 'Not specified',
            status: 'ERROR - Batch processing failed'
          },
          content: `[Batch processing failed: ${error instanceof Error ? error.message : 'Unknown error'}]`,
          error: true
        });
      });
    }
  }



  /**
   * Process a batch of PowerPoint documents together to reduce API calls
   * @param documents Array of PowerPoint document objects
   * @param contentByType Map to store content by document type
   */
  private async processPptDocumentsBatch(
    documents: Array<any>,
    contentByType: { [key: string]: any[] }
  ): Promise<void> {
    console.log(`Processing batch of ${documents.length} PowerPoint documents...`);

    // Process each PowerPoint document with traditional extraction first
    const traditionalResults = await Promise.all(documents.map(async (doc) => {
      try {
        const rawText = await this.extractPptTextTraditional(doc.filePath);
        return {
          doc,
          rawText,
          success: true
        };
      } catch (error) {
        console.error(`Error extracting raw text from PowerPoint ${doc.originalName}: `, error);
        return {
          doc,
          rawText: `[Error extracting text: ${error instanceof Error ? error.message : 'Unknown error'}]`,
          success: false
        };
      }
    }));

    // Process PowerPoints in smaller batches
    const BATCH_SIZE = 3; // Process 3 PowerPoints at a time to avoid token limits
    const batches = [];

    for (let i = 0; i < traditionalResults.length; i += BATCH_SIZE) {
      batches.push(traditionalResults.slice(i, i + BATCH_SIZE));
    }

    console.log(`Split ${traditionalResults.length} PowerPoints into ${batches.length} batches of up to ${BATCH_SIZE} documents each`);

    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`Processing PowerPoint batch ${batchIndex + 1} of ${batches.length} with ${batch.length} documents...`);

      try {
        // Process each document in the batch individually to avoid rate limits
        for (const result of batch) {
          const { doc, rawText } = result;
          const {
            documentType,
            originalName,
            description,
            timePeriod
          } = doc;

          // Create metadata object
          const metadata = {
            documentType,
            name: originalName,
            timePeriod,
            description
          };

          // Process with Gemini individually
          let aiProcessedText;
          try {
            aiProcessedText = await this.extractPptTextWithGemini(doc.filePath, metadata);
            console.log(`Successfully processed PowerPoint with Gemini: ${originalName} `);
          } catch (error) {
            console.error(`Error processing PowerPoint with Gemini: ${originalName} `, error);
            aiProcessedText = `[Error processing with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}]`;
          }

          // Determine which text to use as the combined result
          let combinedText = aiProcessedText;
          let extractionMethod = 'gemini';

          if (
            !aiProcessedText ||
            aiProcessedText.includes('[Error processing PowerPoint with Gemini:') ||
            aiProcessedText.includes('[No text content extracted from PowerPoint using Gemini]')
          ) {
            combinedText = rawText;
            extractionMethod = 'traditional';
          }

          // Initialize array for this document type if it doesn't exist
          if (!contentByType[documentType]) {
            contentByType[documentType] = [];
          }

          // Create a structured object for the document data
          const documentData = {
            metadata: {
              filename: originalName,
              type: documentType.replace('financial_', '').replace(/_/g, ' '),
              description: description || 'No description provided',
              timePeriod: timePeriod || 'Not specified'
            },
            content: combinedText,
            rawText: rawText,
            aiProcessedText: aiProcessedText,
            extractionMethod: extractionMethod
          };

          // Add content with document name and metadata
          contentByType[documentType].push(documentData);
        }
      } catch (error) {
        console.error(`Error processing PowerPoint batch ${batchIndex + 1}: `, error);

        // Handle the error for each document in the batch
        for (const result of batch) {
          const { doc } = result;
          const { documentType, originalName, description, timePeriod } = doc;

          // Initialize array for this document type if it doesn't exist
          if (!contentByType[documentType]) {
            contentByType[documentType] = [];
          }

          // Create a structured object for the error document data
          const errorDocumentData = {
            metadata: {
              filename: originalName,
              type: documentType.replace('financial_', '').replace(/_/g, ' '),
              description: description || 'No description provided',
              timePeriod: timePeriod || 'Not specified',
              status: 'ERROR - Document processing failed'
            },
            content: `Error: Failed to process this document.${error instanceof Error ? error.message : 'Unknown error'} `,
            error: true
          };

          // Add error content
          contentByType[documentType].push(errorDocumentData);
        }
      }

      // Add a delay between batches to avoid rate limits
      if (batchIndex < batches.length - 1) {
        console.log('Waiting 2 seconds before processing next batch to avoid rate limits...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  /**
   * Process other types of documents (Excel, Word, etc.)
   * @param documents Array of document objects
   * @param contentByType Map to store content by document type
   */
  private async processOtherDocumentsBatch(
    documents: Array<any>,
    contentByType: { [key: string]: any[] }
  ): Promise<void> {
    console.log(`Processing batch of ${documents.length} other documents...`);

    // Process each document individually
    for (const doc of documents) {
      const {
        filePath,
        documentType,
        originalName,
        description,
        timePeriod
      } = doc;

      try {
        // Create metadata object
        const metadata = {
          documentType,
          name: originalName,
          timePeriod,
          description
        };

        // Process document with both extraction methods
        const result = await this.processDocument(filePath, true, metadata);

        // Ensure we have a DocumentExtractionResult
        if (typeof result === 'string') {
          console.error(`Unexpected string result from processDocument for ${originalName}`);
          throw new Error('Expected DocumentExtractionResult but got string');
        }

        const { rawText, aiProcessedText, combinedText, extractionMethod } = result;

        // Initialize array for this document type if it doesn't exist
        if (!contentByType[documentType]) {
          contentByType[documentType] = [];
        }

        // Create a structured object for the document data
        const documentData = {
          metadata: {
            filename: originalName,
            type: documentType.replace('financial_', '').replace(/_/g, ' '),
            description: description || 'No description provided',
            timePeriod: timePeriod || 'Not specified'
          },
          content: combinedText,
          rawText: rawText,
          aiProcessedText: aiProcessedText,
          extractionMethod: extractionMethod
        };

        // Add content with document name and metadata
        contentByType[documentType].push(documentData);
      } catch (error) {
        console.error(`Error processing ${originalName}: `, error);

        // Initialize array for this document type if it doesn't exist
        if (!contentByType[documentType]) {
          contentByType[documentType] = [];
        }

        // Create a structured object for the error document data
        const errorDocumentData = {
          metadata: {
            filename: originalName,
            type: documentType.replace('financial_', '').replace(/_/g, ' '),
            description: description || 'No description provided',
            timePeriod: timePeriod || 'Not specified',
            status: 'ERROR - Document processing failed'
          },
          content: `Error: Failed to process this document.${error instanceof Error ? error.message : 'Unknown error'} `,
          error: true
        };

        // Add error content
        contentByType[documentType].push(errorDocumentData);
      }

      // Add a small delay between documents to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  /**
   * Process multiple documents with comprehensive metadata and combine their content with document type identifiers
   * @param documents Array of document objects with filePath, documentType, and additional metadata
   * @param returnBothExtractions Whether to include both raw and AI-processed text in the metadata
   * @returns Combined extracted content with document type identifiers and metadata
   */
  async processMultipleDocumentsWithMetadata(documents: Array<{
    filePath: string,
    documentType: string,
    originalName: string,
    description?: string,
    timePeriod?: string,
    fileType?: string,
    fileSize?: number,
    createdAt?: string,
    updatedAt?: string
  }>, returnBothExtractions: boolean = false): Promise<string> {
    // Create a map to store content by document type
    const contentByType: { [key: string]: string[] } = {};

    // Process each document and categorize by type
    const contentPromises = documents.map(async (doc) => {
      const {
        filePath,
        documentType,
        originalName,
        description,
        timePeriod,
        fileType,
        fileSize,
        createdAt
      } = doc;

      try {
        // Create metadata object to pass to document processing
        const metadata = {
          documentType,
          name: originalName,
          timePeriod,
          description
        };

        // Process document with both extraction methods if requested, passing metadata
        const result = await this.processDocument(filePath, returnBothExtractions, metadata);

        // Get the content to display
        let content: string;
        let extractionMethod: string = 'standard';
        let rawText: string | null = null;
        let aiProcessedText: string | null = null;

        if (returnBothExtractions && typeof result !== 'string') {
          content = result.combinedText;
          extractionMethod = result.extractionMethod;
          rawText = result.rawText;
          aiProcessedText = result.aiProcessedText;
        } else {
          content = result as string;
        }

        // Initialize array for this document type if it doesn't exist
        if (!contentByType[documentType]) {
          contentByType[documentType] = [];
        }

        // Create a structured JSON object for the document data
        const documentData: any = {
          metadata: {
            filename: originalName,
            type: documentType.replace('financial_', '').replace(/_/g, ' '),
            description: description || 'No description provided',
            timePeriod: timePeriod || 'Not specified'
          },
          content: content
        };

        // Add raw and AI-processed text if both extractions were performed
        if (returnBothExtractions && rawText && aiProcessedText) {
          documentData.rawText = rawText;
          documentData.aiProcessedText = aiProcessedText;
        }

        // Convert to JSON string for storage
        const documentContent = JSON.stringify(documentData, null, 2);

        // Add content with document name and metadata
        contentByType[documentType].push(documentContent);

        return {
          documentType,
          originalName,
          description,
          timePeriod,
          fileType,
          fileSize,
          createdAt,
          content,
          extractionMethod: returnBothExtractions ? extractionMethod : undefined,
          rawText: returnBothExtractions ? rawText : undefined,
          aiProcessedText: returnBothExtractions ? aiProcessedText : undefined
        };
      } catch (error) {
        console.error(`Error processing ${originalName}: `, error);

        // Initialize array for this document type if it doesn't exist
        if (!contentByType[documentType]) {
          contentByType[documentType] = [];
        }

        // Create a structured JSON object for the error document data
        const errorDocumentData = {
          metadata: {
            filename: originalName,
            type: documentType.replace('financial_', '').replace(/_/g, ' '),
            description: description || 'No description provided',
            timePeriod: timePeriod || 'Not specified',
            status: 'ERROR - Document processing failed'
          },
          content: 'Error: Failed to process this document. Please check the file format and try again.',
          error: true
        };

        // Convert to JSON string for storage
        const errorContent = JSON.stringify(errorDocumentData, null, 2);

        // Add error content
        contentByType[documentType].push(errorContent);

        return {
          documentType,
          originalName,
          description,
          timePeriod,
          fileType,
          fileSize,
          createdAt,
          error: true
        };
      }
    });

    // Wait for all documents to be processed
    await Promise.all(contentPromises);

    // Create a structured JSON object for all document types
    const combinedData: { [key: string]: any[] } = {};

    // Process each document type
    for (const [docType, contents] of Object.entries(contentByType)) {
      // Format document type for display (remove 'financial_' prefix, replace underscores with spaces, and capitalize)
      const formattedDocType = docType.replace('financial_', '')
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Parse each JSON string back to an object
      const parsedContents = contents.map(content => {
        try {
          return JSON.parse(content);
        } catch (error) {
          console.error(`Error parsing JSON content for ${docType}: `, error);
          return { error: true, content: content };
        }
      });

      // Add to combined data
      combinedData[formattedDocType] = parsedContents;
    }

    // Return the combined data as a JSON string
    return JSON.stringify(combinedData, null, 2);
  }

  /**
   * Process multiple documents and combine their content with document type identifiers
   * @param filePaths Array of file paths
   * @param returnBothExtractions Whether to include both raw and AI-processed text in the output
   * @returns Combined extracted content with document type identifiers
   */
  async processMultipleDocuments(filePaths: string[], returnBothExtractions: boolean = false): Promise<string> {
    // Create a map to store content by document type
    const contentByType: { [key: string]: string[] } = {};

    // Process each document and categorize by type
    const contentPromises = filePaths.map(async (filePath) => {
      // Convert to absolute path if it's a relative path
      const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '../..', filePath);
      const fileName = path.basename(absolutePath);

      // Extract document type from the file path if it contains financial_*
      // Default to 'other' if no specific type is identified
      let documentType = 'other';
      const match = filePath.match(/financial_([a-z_]+)/);
      if (match && match[1]) {
        documentType = `financial_${match[1]} `;
      }

      // Create basic metadata from filename and path
      const metadata = {
        documentType,
        name: fileName,
        // Try to extract time period from filename (e.g., 2023, 2022-2023)
        timePeriod: fileName.match(/\b(20\d\d(-20\d\d)?)\b/)?.[1] || '',
        description: ''
      };

      try {
        // Process document with both extraction methods if requested, passing metadata
        const result = await this.processDocument(filePath, returnBothExtractions, metadata);

        // Get the content to display
        let content: string;
        let extractionMethod: string = 'standard';
        let rawText: string | null = null;
        let aiProcessedText: string | null = null;

        if (returnBothExtractions && typeof result !== 'string') {
          content = result.combinedText;
          extractionMethod = result.extractionMethod;
          rawText = result.rawText;
          aiProcessedText = result.aiProcessedText;
        } else {
          content = result as string;
        }

        // Initialize array for this document type if it doesn't exist
        if (!contentByType[documentType]) {
          contentByType[documentType] = [];
        }

        // Create a structured JSON object for the document data
        const documentData: any = {
          metadata: {
            filename: fileName,
            type: documentType.replace('financial_', '').replace(/_/g, ' '),
            timePeriod: metadata.timePeriod || 'Not specified'
          },
          content: content
        };

        // Add raw and AI-processed text if both extractions were performed
        if (returnBothExtractions && rawText && aiProcessedText) {
          documentData.rawText = rawText;
          documentData.aiProcessedText = aiProcessedText;
        }

        // Convert to JSON string for storage
        const documentContent = JSON.stringify(documentData, null, 2);

        // Add content with document name
        contentByType[documentType].push(documentContent);

        return {
          documentType,
          fileName,
          content,
          extractionMethod: returnBothExtractions ? extractionMethod : undefined,
          rawText: returnBothExtractions ? rawText : undefined,
          aiProcessedText: returnBothExtractions ? aiProcessedText : undefined
        };
      } catch (error) {
        console.error(`Error processing ${fileName}: `, error);

        // Initialize array for this document type if it doesn't exist
        if (!contentByType[documentType]) {
          contentByType[documentType] = [];
        }

        // Create a structured JSON object for the error document data
        const errorDocumentData = {
          metadata: {
            filename: fileName,
            type: documentType.replace('financial_', '').replace(/_/g, ' '),
            timePeriod: metadata.timePeriod || 'Not specified',
            status: 'ERROR - Document processing failed'
          },
          content: 'Error: Failed to process this document. Please check the file format and try again.',
          error: true
        };

        // Convert to JSON string for storage
        const errorContent = JSON.stringify(errorDocumentData, null, 2);

        // Add error content
        contentByType[documentType].push(errorContent);

        return {
          documentType,
          fileName,
          error: true
        };
      }
    });

    // Wait for all documents to be processed
    await Promise.all(contentPromises);

    // Create a structured JSON object for all document types
    const combinedData: { [key: string]: any[] } = {};

    // Process each document type
    for (const [docType, contents] of Object.entries(contentByType)) {
      // Format document type for display (remove 'financial_' prefix, replace underscores with spaces, and capitalize)
      const formattedDocType = docType.replace('financial_', '')
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Parse each JSON string back to an object
      const parsedContents = contents.map(content => {
        try {
          return JSON.parse(content);
        } catch (error) {
          console.error(`Error parsing JSON content for ${docType}: `, error);
          return { error: true, content: content };
        }
      });

      // Add to combined data
      combinedData[formattedDocType] = parsedContents;
    }

    // Return the combined data as a JSON string
    return JSON.stringify(combinedData, null, 2);
  }

  /**
   * Validates and fixes compliance items status values to ensure they match the allowed enum values
   * @param data The parsed data from Gemini API
   */
  validateAndFixComplianceItems(data: any): void {
    // Valid status values according to the Mongoose schema
    const validStatusValues = ['compliant', 'partial', 'non-compliant'];

    // Check if complianceItems exists and is an array
    if (data && data.complianceItems && Array.isArray(data.complianceItems)) {
      console.log('Validating compliance items...');

      // Loop through each compliance item
      data.complianceItems.forEach((item: any, index: number) => {
        if (item && item.status) {
          // Check if the status is not a valid value
          if (!validStatusValues.includes(item.status)) {
            console.log(`Invalid compliance status "${item.status}" found at index ${index}. Fixing to "partial".`);

            // Map invalid status values to a valid one (using 'partial' as default)
            item.status = 'partial';
          }
        }
      });
    }

    // Also check taxCompliance sections if they exist
    if (data && data.taxCompliance) {
      const taxSections = ['gst', 'incomeTax', 'tds'];

      taxSections.forEach(section => {
        if (data.taxCompliance[section] && data.taxCompliance[section].status) {
          if (!validStatusValues.includes(data.taxCompliance[section].status)) {
            console.log(`Invalid tax compliance status "${data.taxCompliance[section].status}" in ${section}. Fixing to "partial".`);
            data.taxCompliance[section].status = 'partial';
          }
        }
      });
    }


  }

  /**
   * Validates and normalizes ratio analysis status values
   * @param data The parsed data from Gemini API
   */
  validateAndNormalizeRatioAnalysis(data: any): void {
    // Check if ratioAnalysis exists
    if (data && data.ratioAnalysis) {
      console.log('Validating ratio analysis...');

      // Categories of ratios to check
      const ratioCategories = ['liquidityRatios', 'profitabilityRatios', 'solvencyRatios', 'efficiencyRatios'];

      // Process each category
      ratioCategories.forEach(category => {
        if (data.ratioAnalysis[category] && Array.isArray(data.ratioAnalysis[category])) {
          // Process each ratio in the category
          data.ratioAnalysis[category].forEach((ratio: any, index: number) => {
            if (ratio && ratio.status) {
              // If status is 'N/A' or any other non-standard value, normalize it to 'warning'
              if (!['good', 'warning', 'critical', 'moderate', 'low'].includes(ratio.status)) {
                console.log(`Normalizing non - standard ratio status "${ratio.status}" in ${category} at index ${index} to "warning".`);
                ratio.status = 'warning';
              }
            } else if (ratio) {
              // If status is missing, set a default
              console.log(`Missing status in ${category} at index ${index}. Setting to "warning".`);
              ratio.status = 'warning';
            }
          });
        }
      });
    }
  }

  /**
   * Validates and ensures proper structure for all new sections
   * @param data The parsed data from Gemini API
   */
  validateNewSections(data: any): void {
    // Validate totalCompanyScore
    if (data && data.totalCompanyScore) {
      console.log('Validating totalCompanyScore...');

      // Ensure score is a number
      if (typeof data.totalCompanyScore.score !== 'number') {
        console.log(`Invalid totalCompanyScore.score: ${data.totalCompanyScore.score}. Converting to number.`);
        data.totalCompanyScore.score = parseInt(data.totalCompanyScore.score) || 50;
      }

      // Ensure rating is a string
      if (!data.totalCompanyScore.rating || typeof data.totalCompanyScore.rating !== 'string') {
        console.log(`Missing or invalid totalCompanyScore.rating.Setting default.`);
        data.totalCompanyScore.rating = 'Moderate';
      }

      // Ensure description is a string
      if (!data.totalCompanyScore.description || typeof data.totalCompanyScore.description !== 'string') {
        console.log(`Missing or invalid totalCompanyScore.description.Setting default.`);
        data.totalCompanyScore.description = 'Financial health assessment based on available documents.';
      }
    }

    // Validate investmentDecision
    if (data && data.investmentDecision) {
      console.log('Validating investmentDecision...');

      // Ensure recommendation is a valid string
      const validRecommendations = ['Invest', 'Consider with Conditions', 'Do Not Invest'];
      if (!data.investmentDecision.recommendation ||
        !validRecommendations.includes(data.investmentDecision.recommendation)) {
        console.log(`Invalid investmentDecision.recommendation: ${data.investmentDecision.recommendation}. Setting default.`);
        data.investmentDecision.recommendation = 'Consider with Conditions';
      }

      // Ensure successProbability is a number between 0 and 100
      if (typeof data.investmentDecision.successProbability !== 'number' ||
        data.investmentDecision.successProbability < 0 ||
        data.investmentDecision.successProbability > 100) {
        console.log(`Invalid investmentDecision.successProbability: ${data.investmentDecision.successProbability}. Setting default.`);
        data.investmentDecision.successProbability = 50;
      }

      // Ensure justification is a string
      if (!data.investmentDecision.justification || typeof data.investmentDecision.justification !== 'string') {
        console.log(`Missing or invalid investmentDecision.justification.Setting default.`);
        data.investmentDecision.justification = 'Investment decision based on financial analysis of available documents.';
      }

      // Ensure keyConsiderations is an array
      if (!data.investmentDecision.keyConsiderations || !Array.isArray(data.investmentDecision.keyConsiderations)) {
        console.log(`Missing or invalid investmentDecision.keyConsiderations.Setting default.`);
        data.investmentDecision.keyConsiderations = ['Financial performance', 'Market potential', 'Risk assessment'];
      }

      // Ensure suggestedTerms is an array
      if (!data.investmentDecision.suggestedTerms || !Array.isArray(data.investmentDecision.suggestedTerms)) {
        console.log(`Missing or invalid investmentDecision.suggestedTerms.Setting default.`);
        data.investmentDecision.suggestedTerms = [];
      }
    }

    // Validate compatibilityAnalysis
    if (data && data.compatibilityAnalysis) {
      console.log('Validating compatibilityAnalysis...');

      // Ensure overallMatch is a valid string
      const validMatches = ['Strong Match', 'Moderate Match', 'Weak Match'];
      if (!data.compatibilityAnalysis.overallMatch ||
        !validMatches.includes(data.compatibilityAnalysis.overallMatch)) {
        console.log(`Invalid compatibilityAnalysis.overallMatch: ${data.compatibilityAnalysis.overallMatch}. Setting default.`);
        data.compatibilityAnalysis.overallMatch = 'Moderate Match';
      }

      // Ensure overallScore is a number between 0 and 100
      if (typeof data.compatibilityAnalysis.overallScore !== 'number' ||
        data.compatibilityAnalysis.overallScore < 0 ||
        data.compatibilityAnalysis.overallScore > 100) {
        console.log(`Invalid compatibilityAnalysis.overallScore: ${data.compatibilityAnalysis.overallScore}. Setting default.`);
        data.compatibilityAnalysis.overallScore = 50;
      }

      // Ensure dimensions is an array
      if (!data.compatibilityAnalysis.dimensions || !Array.isArray(data.compatibilityAnalysis.dimensions)) {
        console.log(`Missing or invalid compatibilityAnalysis.dimensions.Setting default.`);
        data.compatibilityAnalysis.dimensions = [];
      } else {
        // Validate each dimension
        data.compatibilityAnalysis.dimensions.forEach((dimension: any, index: number) => {
          if (!dimension.name) {
            console.log(`Missing name for dimension at index ${index}. Adding placeholder.`);
            dimension.name = `Dimension ${index + 1} `;
          }

          if (typeof dimension.score !== 'number' || dimension.score < 0 || dimension.score > 100) {
            console.log(`Invalid score for dimension ${dimension.name}.Setting default.`);
            dimension.score = 50;
          }

          // Validate status field - ensure it's a valid value
          const validStatusValues = ['excellent', 'good', 'moderate', 'poor', 'critical'];
          if (!dimension.status || !validStatusValues.includes(dimension.status)) {
            console.log(`Invalid status for dimension ${dimension.name}.Setting default.`);
            dimension.status = 'moderate'; // Use 'moderate' as a safe default
          }

          if (!dimension.description || typeof dimension.description !== 'string') {
            console.log(`Missing or invalid description for dimension ${dimension.name}.Setting default.`);
            dimension.description = `Assessment of ${dimension.name.toLowerCase()}.`;
          }

          const validStatuses = ['excellent', 'good', 'moderate', 'poor'];
          if (!dimension.status || !validStatuses.includes(dimension.status)) {
            console.log(`Invalid status for dimension ${dimension.name}.Setting default.`);
            dimension.status = 'moderate';
          }
        });
      }

      // Ensure keyInvestmentStrengths is an array
      if (!data.compatibilityAnalysis.keyInvestmentStrengths || !Array.isArray(data.compatibilityAnalysis.keyInvestmentStrengths)) {
        console.log(`Missing or invalid compatibilityAnalysis.keyInvestmentStrengths.Setting default.`);
        data.compatibilityAnalysis.keyInvestmentStrengths = [];
      }

      // Ensure keyInvestmentChallenges is an array
      if (!data.compatibilityAnalysis.keyInvestmentChallenges || !Array.isArray(data.compatibilityAnalysis.keyInvestmentChallenges)) {
        console.log(`Missing or invalid compatibilityAnalysis.keyInvestmentChallenges.Setting default.`);
        data.compatibilityAnalysis.keyInvestmentChallenges = [];
      }

      // Ensure investmentRecommendations is an array
      if (!data.compatibilityAnalysis.investmentRecommendations || !Array.isArray(data.compatibilityAnalysis.investmentRecommendations)) {
        console.log(`Missing or invalid compatibilityAnalysis.investmentRecommendations.Setting default.`);
        data.compatibilityAnalysis.investmentRecommendations = [];
      }
    }

    // Validate forwardLookingAnalysis
    if (data) {
      console.log('Validating forwardLookingAnalysis...');

      // Create forwardLookingAnalysis if it doesn't exist
      if (!data.forwardLookingAnalysis) {
        data.forwardLookingAnalysis = {};
      }

      // Validate marketPotential
      if (!data.forwardLookingAnalysis.marketPotential) {
        data.forwardLookingAnalysis.marketPotential = {
          tamSize: "Not available",
          growthRate: "Not available",
          adoptionStage: "Not available",
          targetSegments: [],
          entryStrategy: "Not available",
          competitiveLandscape: "Not available",
          historicalComparisons: [],
          goToMarketRecommendations: [],
          metrics: []
        };
      } else {
        // Ensure metrics is an array
        if (!data.forwardLookingAnalysis.marketPotential.metrics || !Array.isArray(data.forwardLookingAnalysis.marketPotential.metrics)) {
          data.forwardLookingAnalysis.marketPotential.metrics = [];
        }

        // Ensure targetSegments is an array
        if (!data.forwardLookingAnalysis.marketPotential.targetSegments || !Array.isArray(data.forwardLookingAnalysis.marketPotential.targetSegments)) {
          data.forwardLookingAnalysis.marketPotential.targetSegments = [];
        }

        // Ensure entryStrategy exists
        if (!data.forwardLookingAnalysis.marketPotential.entryStrategy) {
          data.forwardLookingAnalysis.marketPotential.entryStrategy = "Not available";
        }

        // Ensure competitiveLandscape exists
        if (!data.forwardLookingAnalysis.marketPotential.competitiveLandscape) {
          data.forwardLookingAnalysis.marketPotential.competitiveLandscape = "Not available";
        }

        // Ensure historicalComparisons is an array
        if (!data.forwardLookingAnalysis.marketPotential.historicalComparisons || !Array.isArray(data.forwardLookingAnalysis.marketPotential.historicalComparisons)) {
          data.forwardLookingAnalysis.marketPotential.historicalComparisons = [];
        }

        // Ensure goToMarketRecommendations is an array
        if (!data.forwardLookingAnalysis.marketPotential.goToMarketRecommendations || !Array.isArray(data.forwardLookingAnalysis.marketPotential.goToMarketRecommendations)) {
          data.forwardLookingAnalysis.marketPotential.goToMarketRecommendations = [];
        } else {
          // Validate each recommendation
          data.forwardLookingAnalysis.marketPotential.goToMarketRecommendations.forEach((rec: any, index: number) => {
            if (!rec.recommendation) {
              console.log(`Missing recommendation for go - to - market recommendation at index ${index}. Adding placeholder.`);
              rec.recommendation = `Recommendation ${index + 1} `;
            }

            if (!rec.implementationSteps || !Array.isArray(rec.implementationSteps)) {
              rec.implementationSteps = [];
            }

            if (!rec.timeline) {
              rec.timeline = "Not specified";
            }

            if (!rec.resourceRequirements) {
              rec.resourceRequirements = "Not specified";
            }

            if (!rec.expectedOutcome) {
              rec.expectedOutcome = "Not specified";
            }
          });
        }
      }

      // Validate innovationAssessment
      if (!data.forwardLookingAnalysis.innovationAssessment) {
        data.forwardLookingAnalysis.innovationAssessment = {
          uniquenessScore: 50,
          ipStrength: "Not available",
          competitiveAdvantage: "Not available",
          keyDifferentiators: [],
          protectionStrategies: [],
          innovationGaps: [],
          rdRoadmap: [],
          historicalComparisons: [],
          metrics: []
        };
      } else {
        // Ensure uniquenessScore is a number
        if (typeof data.forwardLookingAnalysis.innovationAssessment.uniquenessScore !== 'number') {
          data.forwardLookingAnalysis.innovationAssessment.uniquenessScore =
            parseInt(data.forwardLookingAnalysis.innovationAssessment.uniquenessScore) || 50;
        }

        // Ensure metrics is an array
        if (!data.forwardLookingAnalysis.innovationAssessment.metrics || !Array.isArray(data.forwardLookingAnalysis.innovationAssessment.metrics)) {
          data.forwardLookingAnalysis.innovationAssessment.metrics = [];
        }

        // Ensure keyDifferentiators is an array
        if (!data.forwardLookingAnalysis.innovationAssessment.keyDifferentiators || !Array.isArray(data.forwardLookingAnalysis.innovationAssessment.keyDifferentiators)) {
          data.forwardLookingAnalysis.innovationAssessment.keyDifferentiators = [];
        }

        // Ensure protectionStrategies is an array
        if (!data.forwardLookingAnalysis.innovationAssessment.protectionStrategies || !Array.isArray(data.forwardLookingAnalysis.innovationAssessment.protectionStrategies)) {
          data.forwardLookingAnalysis.innovationAssessment.protectionStrategies = [];
        }

        // Ensure innovationGaps is an array
        if (!data.forwardLookingAnalysis.innovationAssessment.innovationGaps || !Array.isArray(data.forwardLookingAnalysis.innovationAssessment.innovationGaps)) {
          data.forwardLookingAnalysis.innovationAssessment.innovationGaps = [];
        }

        // Ensure rdRoadmap is an array
        if (!data.forwardLookingAnalysis.innovationAssessment.rdRoadmap || !Array.isArray(data.forwardLookingAnalysis.innovationAssessment.rdRoadmap)) {
          data.forwardLookingAnalysis.innovationAssessment.rdRoadmap = [];
        } else {
          // Validate each roadmap item
          data.forwardLookingAnalysis.innovationAssessment.rdRoadmap.forEach((item: any, index: number) => {
            if (!item.priority) {
              console.log(`Missing priority for R & D roadmap item at index ${index}. Setting default.`);
              item.priority = "Medium";
            }

            if (!item.initiative) {
              console.log(`Missing initiative for R & D roadmap item at index ${index}. Adding placeholder.`);
              item.initiative = `R & D Initiative ${index + 1} `;
            }

            if (!item.timeline) {
              item.timeline = "Not specified";
            }

            if (!item.resourceRequirements) {
              item.resourceRequirements = "Not specified";
            }

            if (!item.expectedOutcome) {
              item.expectedOutcome = "Not specified";
            }
          });
        }

        // Ensure historicalComparisons is an array
        if (!data.forwardLookingAnalysis.innovationAssessment.historicalComparisons || !Array.isArray(data.forwardLookingAnalysis.innovationAssessment.historicalComparisons)) {
          data.forwardLookingAnalysis.innovationAssessment.historicalComparisons = [];
        }
      }

      // Validate teamCapability
      if (!data.forwardLookingAnalysis.teamCapability) {
        data.forwardLookingAnalysis.teamCapability = {
          executionScore: 50,
          experienceLevel: "Not available",
          trackRecord: "Not available",
          founderAchievements: [],
          identifiedSkillGaps: [],
          hiringPriorities: [],
          organizationalImprovements: [],
          historicalComparisons: [],
          metrics: []
        };
      } else {
        // Ensure executionScore is a number
        if (typeof data.forwardLookingAnalysis.teamCapability.executionScore !== 'number') {
          data.forwardLookingAnalysis.teamCapability.executionScore =
            parseInt(data.forwardLookingAnalysis.teamCapability.executionScore) || 50;
        }

        // Ensure metrics is an array
        if (!data.forwardLookingAnalysis.teamCapability.metrics || !Array.isArray(data.forwardLookingAnalysis.teamCapability.metrics)) {
          data.forwardLookingAnalysis.teamCapability.metrics = [];
        }

        // Ensure founderAchievements is an array
        if (!data.forwardLookingAnalysis.teamCapability.founderAchievements || !Array.isArray(data.forwardLookingAnalysis.teamCapability.founderAchievements)) {
          data.forwardLookingAnalysis.teamCapability.founderAchievements = [];
        }

        // Ensure identifiedSkillGaps is an array
        if (!data.forwardLookingAnalysis.teamCapability.identifiedSkillGaps || !Array.isArray(data.forwardLookingAnalysis.teamCapability.identifiedSkillGaps)) {
          data.forwardLookingAnalysis.teamCapability.identifiedSkillGaps = [];
        }

        // Ensure hiringPriorities is an array
        if (!data.forwardLookingAnalysis.teamCapability.hiringPriorities || !Array.isArray(data.forwardLookingAnalysis.teamCapability.hiringPriorities)) {
          data.forwardLookingAnalysis.teamCapability.hiringPriorities = [];
        } else {
          // Validate each hiring priority
          data.forwardLookingAnalysis.teamCapability.hiringPriorities.forEach((priority: any, index: number) => {
            if (!priority.role) {
              console.log(`Missing role for hiring priority at index ${index}. Adding placeholder.`);
              priority.role = `Role ${index + 1} `;
            }

            if (!priority.responsibilities || !Array.isArray(priority.responsibilities)) {
              priority.responsibilities = [];
            }

            if (!priority.impact) {
              priority.impact = "Not specified";
            }

            if (!priority.timeline) {
              priority.timeline = "Not specified";
            }
          });
        }

        // Ensure organizationalImprovements is an array
        if (!data.forwardLookingAnalysis.teamCapability.organizationalImprovements || !Array.isArray(data.forwardLookingAnalysis.teamCapability.organizationalImprovements)) {
          data.forwardLookingAnalysis.teamCapability.organizationalImprovements = [];
        } else {
          // Validate each organizational improvement
          data.forwardLookingAnalysis.teamCapability.organizationalImprovements.forEach((improvement: any, index: number) => {
            if (!improvement.area) {
              console.log(`Missing area for organizational improvement at index ${index}. Adding placeholder.`);
              improvement.area = `Improvement Area ${index + 1} `;
            }

            if (!improvement.recommendation) {
              improvement.recommendation = "Not specified";
            }

            if (!improvement.implementationSteps || !Array.isArray(improvement.implementationSteps)) {
              improvement.implementationSteps = [];
            }

            if (!improvement.expectedOutcome) {
              improvement.expectedOutcome = "Not specified";
            }
          });
        }

        // Ensure historicalComparisons is an array
        if (!data.forwardLookingAnalysis.teamCapability.historicalComparisons || !Array.isArray(data.forwardLookingAnalysis.teamCapability.historicalComparisons)) {
          data.forwardLookingAnalysis.teamCapability.historicalComparisons = [];
        }
      }

      // Validate growthTrajectory
      if (!data.forwardLookingAnalysis.growthTrajectory) {
        data.forwardLookingAnalysis.growthTrajectory = {
          scenarios: {
            conservative: 5,
            moderate: 15,
            aggressive: 30
          },
          assumptions: [],
          unitEconomics: {
            currentCac: 0,
            projectedCac: 0,
            currentLtv: 0,
            projectedLtv: 0
          },
          scalingStrategies: [],
          growthLevers: [],
          optimizationTactics: [],
          historicalComparisons: [],
          metrics: []
        };
      } else {
        // Ensure scenarios exists
        if (!data.forwardLookingAnalysis.growthTrajectory.scenarios) {
          data.forwardLookingAnalysis.growthTrajectory.scenarios = {
            conservative: 5,
            moderate: 15,
            aggressive: 30
          };
        }

        // Ensure unitEconomics exists
        if (!data.forwardLookingAnalysis.growthTrajectory.unitEconomics) {
          data.forwardLookingAnalysis.growthTrajectory.unitEconomics = {
            currentCac: 0,
            projectedCac: 0,
            currentLtv: 0,
            projectedLtv: 0
          };
        }

        // Ensure metrics is an array
        if (!data.forwardLookingAnalysis.growthTrajectory.metrics || !Array.isArray(data.forwardLookingAnalysis.growthTrajectory.metrics)) {
          data.forwardLookingAnalysis.growthTrajectory.metrics = [];
        }

        // Ensure assumptions is an array
        if (!data.forwardLookingAnalysis.growthTrajectory.assumptions || !Array.isArray(data.forwardLookingAnalysis.growthTrajectory.assumptions)) {
          data.forwardLookingAnalysis.growthTrajectory.assumptions = [];
        } else {
          // Validate each assumption
          data.forwardLookingAnalysis.growthTrajectory.assumptions.forEach((assumption: any, index: number) => {
            if (!assumption.scenario) {
              console.log(`Missing scenario for growth assumption at index ${index}. Setting default.`);
              assumption.scenario = "moderate";
            }

            if (!assumption.assumptions || !Array.isArray(assumption.assumptions)) {
              assumption.assumptions = [];
            }
          });
        }

        // Ensure scalingStrategies is an array
        if (!data.forwardLookingAnalysis.growthTrajectory.scalingStrategies || !Array.isArray(data.forwardLookingAnalysis.growthTrajectory.scalingStrategies)) {
          data.forwardLookingAnalysis.growthTrajectory.scalingStrategies = [];
        } else {
          // Validate each scaling strategy
          data.forwardLookingAnalysis.growthTrajectory.scalingStrategies.forEach((strategy: any, index: number) => {
            if (!strategy.strategy) {
              console.log(`Missing strategy for scaling strategy at index ${index}. Adding placeholder.`);
              strategy.strategy = `Scaling Strategy ${index + 1} `;
            }

            if (!strategy.implementationSteps || !Array.isArray(strategy.implementationSteps)) {
              strategy.implementationSteps = [];
            }

            if (!strategy.resourceRequirements) {
              strategy.resourceRequirements = "Not specified";
            }

            if (!strategy.timeline) {
              strategy.timeline = "Not specified";
            }

            if (!strategy.expectedOutcome) {
              strategy.expectedOutcome = "Not specified";
            }
          });
        }

        // Ensure growthLevers is an array
        if (!data.forwardLookingAnalysis.growthTrajectory.growthLevers || !Array.isArray(data.forwardLookingAnalysis.growthTrajectory.growthLevers)) {
          data.forwardLookingAnalysis.growthTrajectory.growthLevers = [];
        }

        // Ensure optimizationTactics is an array
        if (!data.forwardLookingAnalysis.growthTrajectory.optimizationTactics || !Array.isArray(data.forwardLookingAnalysis.growthTrajectory.optimizationTactics)) {
          data.forwardLookingAnalysis.growthTrajectory.optimizationTactics = [];
        }

        // Ensure historicalComparisons is an array
        if (!data.forwardLookingAnalysis.growthTrajectory.historicalComparisons || !Array.isArray(data.forwardLookingAnalysis.growthTrajectory.historicalComparisons)) {
          data.forwardLookingAnalysis.growthTrajectory.historicalComparisons = [];
        }
      }

      // Validate dimensions
      if (!data.forwardLookingAnalysis.dimensions || !Array.isArray(data.forwardLookingAnalysis.dimensions)) {
        data.forwardLookingAnalysis.dimensions = [];
      } else {
        // Validate each dimension
        data.forwardLookingAnalysis.dimensions.forEach((dimension: any, index: number) => {
          if (!dimension.name) {
            console.log(`Missing name for forward - looking dimension at index ${index}. Adding placeholder.`);
            dimension.name = `Dimension ${index + 1} `;
          }

          if (typeof dimension.score !== 'number' || dimension.score < 0 || dimension.score > 100) {
            console.log(`Invalid score for forward - looking dimension ${dimension.name}. Setting default.`);
            dimension.score = 50;
          }

          if (!dimension.description) {
            dimension.description = `No description available for ${dimension.name}.`;
          }

          if (!dimension.status) {
            // Determine status based on score
            if (dimension.score >= 80) {
              dimension.status = 'excellent';
            } else if (dimension.score >= 60) {
              dimension.status = 'good';
            } else if (dimension.score >= 40) {
              dimension.status = 'moderate';
            } else {
              dimension.status = 'poor';
            }
          }
        });
      }
    }

    // Validate scoringBreakdown
    if (data && data.scoringBreakdown) {
      console.log('Validating scoringBreakdown...');

      // Ensure overview is a string
      if (!data.scoringBreakdown.overview || typeof data.scoringBreakdown.overview !== 'string') {
        console.log(`Missing or invalid scoringBreakdown.overview.Setting default.`);
        data.scoringBreakdown.overview = 'Scoring breakdown across key operational and financial dimensions.';
      }

      // Ensure categories is an array
      if (!data.scoringBreakdown.categories || !Array.isArray(data.scoringBreakdown.categories)) {
        console.log(`Missing or invalid scoringBreakdown.categories.Setting default.`);
        data.scoringBreakdown.categories = [];
      } else {
        // Validate each category
        data.scoringBreakdown.categories.forEach((category: any, index: number) => {
          if (!category.name) {
            console.log(`Missing name for category at index ${index}. Adding placeholder.`);
            category.name = `Category ${index + 1} `;
          }

          if (typeof category.score !== 'number' || category.score < 0 || category.score > 100) {
            console.log(`Invalid score for category ${category.name}.Setting default.`);
            category.score = 50;
          }

          // Validate status field - ensure it's a valid value
          const validStatusValues = ['excellent', 'good', 'moderate', 'poor', 'critical'];
          if (!category.status || !validStatusValues.includes(category.status)) {
            console.log(`Invalid status for category ${category.name}.Setting default.`);
            category.status = 'moderate'; // Use 'moderate' as a safe default
          }

          if (!category.description || typeof category.description !== 'string') {
            console.log(`Missing or invalid description for category ${category.name}.Setting default.`);
            category.description = `Assessment of ${category.name.toLowerCase()}.`;
          }

          const validStatuses = ['excellent', 'good', 'moderate', 'poor'];
          if (!category.status || !validStatuses.includes(category.status)) {
            console.log(`Invalid status for category ${category.name}.Setting default.`);
            category.status = 'moderate';
          }

          if (!category.keyPoints || !Array.isArray(category.keyPoints)) {
            console.log(`Missing or invalid keyPoints for category ${category.name}.Setting default.`);
            category.keyPoints = [];
          }
        });
      }
    }

    // Validate shareholders table
    if (data && data.shareholdersTable) {
      console.log('Validating shareholders table...');

      // Check if shareholders is a string that looks like an array (from JSON stringification)
      if (data.shareholdersTable.shareholders && typeof data.shareholdersTable.shareholders === 'string') {
        try {
          // Try to parse the string as JSON
          const parsedShareholders = JSON.parse(data.shareholdersTable.shareholders);
          if (Array.isArray(parsedShareholders)) {
            data.shareholdersTable.shareholders = parsedShareholders;
            console.log('Successfully parsed shareholdersTable.shareholders from string to array');
          }
        } catch (error) {
          // If it's not valid JSON but looks like an array representation
          if (typeof data.shareholdersTable.shareholders === 'string' &&
            data.shareholdersTable.shareholders.trim().startsWith('[') &&
            data.shareholdersTable.shareholders.trim().endsWith(']')) {
            console.log('Attempting to evaluate shareholdersTable.shareholders string as array');
            try {
              // This is a safer alternative to eval
              const shareholdersStr = data.shareholdersTable.shareholders.replace(/'/g, '"');
              data.shareholdersTable.shareholders = JSON.parse(shareholdersStr);
            } catch (evalError) {
              console.error('Failed to parse shareholdersTable.shareholders string:', evalError);
              // Reset to empty array if parsing fails
              data.shareholdersTable.shareholders = [];
            }
          } else {
            console.error('Failed to parse shareholdersTable.shareholders:', error);
            // Reset to empty array
            data.shareholdersTable.shareholders = [];
          }
        }
      }

      // Ensure shareholders array exists
      if (!data.shareholdersTable.shareholders || !Array.isArray(data.shareholdersTable.shareholders)) {
        data.shareholdersTable.shareholders = [];
      }

      // Ensure each shareholder has required fields
      data.shareholdersTable.shareholders.forEach((shareholder: any, index: number) => {
        if (!shareholder.name) {
          console.log(`Missing name for shareholder at index ${index}. Adding placeholder.`);
          shareholder.name = `Shareholder ${index + 1} `;
        }

        // Ensure equityPercentage is a string
        if (shareholder.equityPercentage === undefined || shareholder.equityPercentage === null) {
          shareholder.equityPercentage = "0%";
        } else if (typeof shareholder.equityPercentage !== 'string') {
          // If it's a number, convert to percentage string
          if (typeof shareholder.equityPercentage === 'number') {
            shareholder.equityPercentage = `${shareholder.equityPercentage}% `;
          } else {
            shareholder.equityPercentage = String(shareholder.equityPercentage);
          }

          // Add % sign if not present
          if (!shareholder.equityPercentage.includes('%')) {
            shareholder.equityPercentage = `${shareholder.equityPercentage}% `;
          }
        }

        // Ensure shareCount is a number or string
        if (shareholder.shareCount === undefined || shareholder.shareCount === null) {
          shareholder.shareCount = "0";
        } else if (typeof shareholder.shareCount !== 'string' && typeof shareholder.shareCount !== 'number') {
          shareholder.shareCount = String(shareholder.shareCount);
        }

        // Ensure shareClass is a string
        if (!shareholder.shareClass) {
          shareholder.shareClass = "Equity";
        }

        // Ensure all other fields are strings
        if (shareholder.faceValue && typeof shareholder.faceValue !== 'string') {
          shareholder.faceValue = String(shareholder.faceValue);
        }

        if (shareholder.investmentAmount && typeof shareholder.investmentAmount !== 'string') {
          shareholder.investmentAmount = String(shareholder.investmentAmount);
        }

        if (shareholder.votingRights && typeof shareholder.votingRights !== 'string') {
          shareholder.votingRights = String(shareholder.votingRights);
        }

        if (shareholder.notes && typeof shareholder.notes !== 'string') {
          shareholder.notes = String(shareholder.notes);
        }
      });

      // Check if recommendations is a string that looks like an array
      if (data.shareholdersTable.recommendations && typeof data.shareholdersTable.recommendations === 'string') {
        try {
          const parsedRecommendations = JSON.parse(data.shareholdersTable.recommendations);
          if (Array.isArray(parsedRecommendations)) {
            data.shareholdersTable.recommendations = parsedRecommendations;
          }
        } catch (error) {
          // If it's not valid JSON but looks like an array representation
          if (typeof data.shareholdersTable.recommendations === 'string' &&
            data.shareholdersTable.recommendations.trim().startsWith('[') &&
            data.shareholdersTable.recommendations.trim().endsWith(']')) {
            try {
              const recommendationsStr = data.shareholdersTable.recommendations.replace(/'/g, '"');
              data.shareholdersTable.recommendations = JSON.parse(recommendationsStr);
            } catch (evalError) {
              data.shareholdersTable.recommendations = [];
            }
          } else {
            data.shareholdersTable.recommendations = [];
          }
        }
      }

      // Ensure recommendations array exists
      if (!data.shareholdersTable.recommendations || !Array.isArray(data.shareholdersTable.recommendations)) {
        data.shareholdersTable.recommendations = [];
      }

      // Ensure overview and analysis exist
      if (!data.shareholdersTable.overview) {
        data.shareholdersTable.overview = "No overview available for the shareholding structure.";
      }
      if (!data.shareholdersTable.analysis) {
        data.shareholdersTable.analysis = "No analysis available for the shareholding structure.";
      }

      // Ensure totalShares and totalEquity exist
      if (!data.shareholdersTable.totalShares) {
        data.shareholdersTable.totalShares = "0";
      }

      if (!data.shareholdersTable.totalEquity) {
        data.shareholdersTable.totalEquity = "100%";
      }
    }

    // If shareholdersTable doesn't exist, create it with default values
    if (!data.shareholdersTable) {
      console.log('Creating default shareholders table...');
      data.shareholdersTable = {
        overview: "No shareholders information available in the provided documents.",
        shareholders: [],
        totalShares: "0",
        totalEquity: "100%",
        analysis: "Unable to analyze shareholding structure due to lack of data.",
        recommendations: ["Provide cap table or shareholding documents for analysis."]
      };
    }

    // Validate directors table
    if (data && data.directorsTable) {
      console.log('Validating directors table...');

      // Check if directors is a string that looks like an array (from JSON stringification)
      if (data.directorsTable.directors && typeof data.directorsTable.directors === 'string') {
        try {
          // Try to parse the string as JSON
          const parsedDirectors = JSON.parse(data.directorsTable.directors);
          if (Array.isArray(parsedDirectors)) {
            data.directorsTable.directors = parsedDirectors;
            console.log('Successfully parsed directorsTable.directors from string to array');
          }
        } catch (error) {
          // If it's not valid JSON but looks like an array representation
          if (typeof data.directorsTable.directors === 'string' &&
            data.directorsTable.directors.trim().startsWith('[') &&
            data.directorsTable.directors.trim().endsWith(']')) {
            console.log('Attempting to evaluate directorsTable.directors string as array');
            try {
              // This is a safer alternative to eval
              const directorsStr = data.directorsTable.directors.replace(/'/g, '"');
              data.directorsTable.directors = JSON.parse(directorsStr);
            } catch (evalError) {
              console.error('Failed to parse directorsTable.directors string:', evalError);
              // Reset to empty array if parsing fails
              data.directorsTable.directors = [];
            }
          } else {
            console.error('Failed to parse directorsTable.directors:', error);
            // Reset to empty array
            data.directorsTable.directors = [];
          }
        }
      }

      // Ensure directors array exists
      if (!data.directorsTable.directors || !Array.isArray(data.directorsTable.directors)) {
        data.directorsTable.directors = [];
      }

      // Ensure each director has required fields
      data.directorsTable.directors.forEach((director: any, index: number) => {
        if (!director.name) {
          console.log(`Missing name for director at index ${index}. Adding placeholder.`);
          director.name = `Director ${index + 1} `;
        }

        if (!director.position) {
          console.log(`Missing position for director at index ${index}. Adding placeholder.`);
          director.position = 'Director';
        }

        // Ensure DIN is a string
        if (director.din !== undefined && director.din !== null && typeof director.din !== 'string') {
          director.din = String(director.din);
        }

        // Ensure appointmentDate is a string
        if (director.appointmentDate !== undefined && director.appointmentDate !== null && typeof director.appointmentDate !== 'string') {
          try {
            // Try to convert to a date string if it's a Date object
            director.appointmentDate = new Date(director.appointmentDate).toISOString().split('T')[0];
          } catch (e) {
            director.appointmentDate = String(director.appointmentDate);
          }
        }

        // Ensure shareholding is a string or number
        if (director.shareholding === undefined || director.shareholding === null) {
          director.shareholding = "0%";
        } else if (typeof director.shareholding !== 'string') {
          director.shareholding = String(director.shareholding);

          // Add % sign if it's a percentage and doesn't already have it
          if (!director.shareholding.includes('%') &&
            !isNaN(parseFloat(director.shareholding)) &&
            parseFloat(director.shareholding) <= 100) {
            director.shareholding = `${director.shareholding}% `;
          }
        }

        // Ensure expertise is a string
        if (director.expertise && typeof director.expertise !== 'string') {
          director.expertise = String(director.expertise);
        }

        // Ensure notes is a string
        if (director.notes && typeof director.notes !== 'string') {
          director.notes = String(director.notes);
        }

        // Ensure otherDirectorships is an array of strings
        if (director.otherDirectorships) {
          if (typeof director.otherDirectorships === 'string') {
            try {
              const parsedDirectorships = JSON.parse(director.otherDirectorships);
              if (Array.isArray(parsedDirectorships)) {
                director.otherDirectorships = parsedDirectorships;
              } else {
                director.otherDirectorships = [String(director.otherDirectorships)];
              }
            } catch (error) {
              director.otherDirectorships = [String(director.otherDirectorships)];
            }
          } else if (!Array.isArray(director.otherDirectorships)) {
            director.otherDirectorships = [String(director.otherDirectorships)];
          }
        } else {
          director.otherDirectorships = [];
        }
      });

      // Check if recommendations is a string that looks like an array
      if (data.directorsTable.recommendations && typeof data.directorsTable.recommendations === 'string') {
        try {
          const parsedRecommendations = JSON.parse(data.directorsTable.recommendations);
          if (Array.isArray(parsedRecommendations)) {
            data.directorsTable.recommendations = parsedRecommendations;
          }
        } catch (error) {
          // If it's not valid JSON but looks like an array representation
          if (typeof data.directorsTable.recommendations === 'string' &&
            data.directorsTable.recommendations.trim().startsWith('[') &&
            data.directorsTable.recommendations.trim().endsWith(']')) {
            try {
              const recommendationsStr = data.directorsTable.recommendations.replace(/'/g, '"');
              data.directorsTable.recommendations = JSON.parse(recommendationsStr);
            } catch (evalError) {
              data.directorsTable.recommendations = [];
            }
          } else {
            data.directorsTable.recommendations = [];
          }
        }
      }

      // Ensure recommendations array exists
      if (!data.directorsTable.recommendations || !Array.isArray(data.directorsTable.recommendations)) {
        data.directorsTable.recommendations = [];
      }

      // Ensure overview and analysis exist
      if (!data.directorsTable.overview) {
        data.directorsTable.overview = "No overview available for the board of directors.";
      }
      if (!data.directorsTable.analysis) {
        data.directorsTable.analysis = "No analysis available for the board of directors.";
      }
    }

    // Validate key business agreements
    if (data && data.keyBusinessAgreements) {
      console.log('Validating key business agreements...');

      // Check if agreements is a string that looks like an array (from JSON stringification)
      if (data.keyBusinessAgreements.agreements && typeof data.keyBusinessAgreements.agreements === 'string') {
        try {
          // Try to parse the string as JSON
          const parsedAgreements = JSON.parse(data.keyBusinessAgreements.agreements);
          if (Array.isArray(parsedAgreements)) {
            data.keyBusinessAgreements.agreements = parsedAgreements;
            console.log('Successfully parsed keyBusinessAgreements.agreements from string to array');
          }
        } catch (error) {
          // If it's not valid JSON but looks like an array representation
          if (typeof data.keyBusinessAgreements.agreements === 'string' &&
            data.keyBusinessAgreements.agreements.trim().startsWith('[') &&
            data.keyBusinessAgreements.agreements.trim().endsWith(']')) {
            console.log('Attempting to evaluate keyBusinessAgreements.agreements string as array');
            try {
              // This is a safer alternative to eval
              const agreementsStr = data.keyBusinessAgreements.agreements.replace(/'/g, '"');
              data.keyBusinessAgreements.agreements = JSON.parse(agreementsStr);
            } catch (evalError) {
              console.error('Failed to parse keyBusinessAgreements.agreements string:', evalError);
              // Reset to empty array if parsing fails
              data.keyBusinessAgreements.agreements = [];
            }
          } else {
            console.error('Failed to parse keyBusinessAgreements.agreements:', error);
            // Reset to empty array
            data.keyBusinessAgreements.agreements = [];
          }
        }
      }

      // Ensure agreements array exists
      if (!data.keyBusinessAgreements.agreements || !Array.isArray(data.keyBusinessAgreements.agreements)) {
        data.keyBusinessAgreements.agreements = [];
      }

      // Ensure each agreement has required fields
      data.keyBusinessAgreements.agreements.forEach((agreement: any, index: number) => {
        if (!agreement.type && !agreement.agreementType) {
          console.log(`Missing type for agreement at index ${index}. Adding placeholder.`);
          agreement.type = `Agreement ${index + 1} `;
        }

        // Convert agreementType to type if needed for consistency
        if (agreement.agreementType && !agreement.type) {
          agreement.type = agreement.agreementType;
        }

        // Ensure type is a string
        if (agreement.type && typeof agreement.type !== 'string') {
          agreement.type = String(agreement.type);
        }

        // Handle parties field - could be string, array, or other
        if (!agreement.parties) {
          agreement.parties = [];
        } else if (typeof agreement.parties === 'string') {
          // Check if it's a stringified array
          if (agreement.parties.trim().startsWith('[') && agreement.parties.trim().endsWith(']')) {
            try {
              const partiesStr = agreement.parties.replace(/'/g, '"');
              const parsedParties = JSON.parse(partiesStr);
              if (Array.isArray(parsedParties)) {
                agreement.parties = parsedParties;
              } else {
                agreement.parties = [agreement.parties];
              }
            } catch (error) {
              agreement.parties = [agreement.parties];
            }
          } else {
            // It's a regular string, keep as is or convert to array based on your needs
            agreement.parties = [agreement.parties];
          }
        } else if (!Array.isArray(agreement.parties)) {
          // Convert any other type to string and put in array
          agreement.parties = [String(agreement.parties)];
        }

        // Ensure all other fields are strings
        if (agreement.effectiveDate && typeof agreement.effectiveDate !== 'string') {
          agreement.effectiveDate = String(agreement.effectiveDate);
        }

        if (agreement.expiryDate && typeof agreement.expiryDate !== 'string') {
          agreement.expiryDate = String(agreement.expiryDate);
        }

        if (agreement.financialImpact && typeof agreement.financialImpact !== 'string') {
          agreement.financialImpact = String(agreement.financialImpact);
        }

        if (agreement.notes && typeof agreement.notes !== 'string') {
          agreement.notes = String(agreement.notes);
        }

        // Handle keyTerms field - could be string, array, or other
        if (agreement.keyTerms) {
          if (typeof agreement.keyTerms === 'string') {
            // Check if it's a stringified array
            if (agreement.keyTerms.trim().startsWith('[') && agreement.keyTerms.trim().endsWith(']')) {
              try {
                const keyTermsStr = agreement.keyTerms.replace(/'/g, '"');
                const parsedKeyTerms = JSON.parse(keyTermsStr);
                if (Array.isArray(parsedKeyTerms)) {
                  agreement.keyTerms = parsedKeyTerms;
                } else {
                  agreement.keyTerms = [agreement.keyTerms];
                }
              } catch (error) {
                agreement.keyTerms = [agreement.keyTerms];
              }
            } else {
              agreement.keyTerms = [agreement.keyTerms];
            }
          } else if (!Array.isArray(agreement.keyTerms)) {
            agreement.keyTerms = [String(agreement.keyTerms)];
          }
        } else {
          agreement.keyTerms = [];
        }

        // Handle risks field - could be string, array, or other
        if (agreement.risks) {
          if (typeof agreement.risks === 'string') {
            // Check if it's a stringified array
            if (agreement.risks.trim().startsWith('[') && agreement.risks.trim().endsWith(']')) {
              try {
                const risksStr = agreement.risks.replace(/'/g, '"');
                const parsedRisks = JSON.parse(risksStr);
                if (Array.isArray(parsedRisks)) {
                  agreement.risks = parsedRisks;
                } else {
                  agreement.risks = [agreement.risks];
                }
              } catch (error) {
                agreement.risks = [agreement.risks];
              }
            } else {
              agreement.risks = [agreement.risks];
            }
          } else if (!Array.isArray(agreement.risks)) {
            agreement.risks = [String(agreement.risks)];
          }
        } else {
          agreement.risks = [];
        }
      });

      // Check if recommendations is a string that looks like an array
      if (data.keyBusinessAgreements.recommendations && typeof data.keyBusinessAgreements.recommendations === 'string') {
        try {
          const parsedRecommendations = JSON.parse(data.keyBusinessAgreements.recommendations);
          if (Array.isArray(parsedRecommendations)) {
            data.keyBusinessAgreements.recommendations = parsedRecommendations;
          }
        } catch (error) {
          // If it's not valid JSON but looks like an array representation
          if (typeof data.keyBusinessAgreements.recommendations === 'string' &&
            data.keyBusinessAgreements.recommendations.trim().startsWith('[') &&
            data.keyBusinessAgreements.recommendations.trim().endsWith(']')) {
            try {
              const recommendationsStr = data.keyBusinessAgreements.recommendations.replace(/'/g, '"');
              data.keyBusinessAgreements.recommendations = JSON.parse(recommendationsStr);
            } catch (evalError) {
              data.keyBusinessAgreements.recommendations = [];
            }
          } else {
            data.keyBusinessAgreements.recommendations = [];
          }
        }
      }

      // Ensure recommendations array exists
      if (!data.keyBusinessAgreements.recommendations || !Array.isArray(data.keyBusinessAgreements.recommendations)) {
        data.keyBusinessAgreements.recommendations = [];
      }

      // Ensure overview and analysis exist
      if (!data.keyBusinessAgreements.overview) {
        data.keyBusinessAgreements.overview = "No overview available for key business agreements.";
      }

      if (!data.keyBusinessAgreements.analysis) {
        data.keyBusinessAgreements.analysis = "No analysis available for key business agreements.";
      }
    }

    // Validate leave policy
    if (data && data.leavePolicy) {
      console.log('Validating leave policy...');

      // Check if policies is a string that looks like an array (from JSON stringification)
      if (data.leavePolicy.policies && typeof data.leavePolicy.policies === 'string') {
        try {
          // Try to parse the string as JSON
          const parsedPolicies = JSON.parse(data.leavePolicy.policies);
          if (Array.isArray(parsedPolicies)) {
            data.leavePolicy.policies = parsedPolicies;
            console.log('Successfully parsed leavePolicy.policies from string to array');
          }
        } catch (error) {
          // If it's not valid JSON but looks like an array representation
          if (typeof data.leavePolicy.policies === 'string' &&
            data.leavePolicy.policies.trim().startsWith('[') &&
            data.leavePolicy.policies.trim().endsWith(']')) {
            console.log('Attempting to evaluate leavePolicy.policies string as array');
            try {
              // This is a safer alternative to eval
              const policiesStr = data.leavePolicy.policies.replace(/'/g, '"');
              data.leavePolicy.policies = JSON.parse(policiesStr);
            } catch (evalError) {
              console.error('Failed to parse leavePolicy.policies string:', evalError);
              // Reset to empty array if parsing fails
              data.leavePolicy.policies = [];
            }
          } else {
            console.error('Failed to parse leavePolicy.policies:', error);
            // Reset to empty array
            data.leavePolicy.policies = [];
          }
        }
      }

      // Ensure policies array exists
      if (!data.leavePolicy.policies || !Array.isArray(data.leavePolicy.policies)) {
        data.leavePolicy.policies = [];
      }

      // Ensure each policy has required fields
      data.leavePolicy.policies.forEach((policy: any, index: number) => {
        if (!policy.type) {
          console.log(`Missing type for leave policy at index ${index}. Adding placeholder.`);
          policy.type = `Leave Type ${index + 1} `;
        }

        // Ensure type is a string
        if (policy.type && typeof policy.type !== 'string') {
          policy.type = String(policy.type);
        }

        // Handle carryForward field - could be string, boolean, or other
        if (policy.carryForward === undefined || policy.carryForward === null) {
          policy.carryForward = false;
        } else if (typeof policy.carryForward === 'string') {
          // Convert string representations to boolean
          policy.carryForward = policy.carryForward.toLowerCase() === 'true' ||
            policy.carryForward.toLowerCase() === 'yes' ||
            policy.carryForward === '1';
        } else if (typeof policy.carryForward !== 'boolean') {
          // Convert any other type to boolean
          policy.carryForward = Boolean(policy.carryForward);
        }

        // Handle encashment field - could be string, boolean, or other
        if (policy.encashment === undefined || policy.encashment === null) {
          policy.encashment = false;
        } else if (typeof policy.encashment === 'string') {
          // Convert string representations to boolean
          policy.encashment = policy.encashment.toLowerCase() === 'true' ||
            policy.encashment.toLowerCase() === 'yes' ||
            policy.encashment === '1';
        } else if (typeof policy.encashment !== 'boolean') {
          // Convert any other type to boolean
          policy.encashment = Boolean(policy.encashment);
        }

        // Ensure daysAllowed is a number or string
        if (policy.daysAllowed === undefined || policy.daysAllowed === null) {
          policy.daysAllowed = "Not specified";
        } else if (typeof policy.daysAllowed !== 'string' && typeof policy.daysAllowed !== 'number') {
          policy.daysAllowed = String(policy.daysAllowed);
        }

        // Ensure eligibility is a string
        if (policy.eligibility && typeof policy.eligibility !== 'string') {
          policy.eligibility = String(policy.eligibility);
        }

        // Ensure notes is a string
        if (policy.notes && typeof policy.notes !== 'string') {
          policy.notes = String(policy.notes);
        }
      });

      // Check if recommendations is a string that looks like an array
      if (data.leavePolicy.recommendations && typeof data.leavePolicy.recommendations === 'string') {
        try {
          const parsedRecommendations = JSON.parse(data.leavePolicy.recommendations);
          if (Array.isArray(parsedRecommendations)) {
            data.leavePolicy.recommendations = parsedRecommendations;
          }
        } catch (error) {
          // If it's not valid JSON but looks like an array representation
          if (typeof data.leavePolicy.recommendations === 'string' &&
            data.leavePolicy.recommendations.trim().startsWith('[') &&
            data.leavePolicy.recommendations.trim().endsWith(']')) {
            try {
              const recommendationsStr = data.leavePolicy.recommendations.replace(/'/g, '"');
              data.leavePolicy.recommendations = JSON.parse(recommendationsStr);
            } catch (evalError) {
              data.leavePolicy.recommendations = [];
            }
          } else {
            data.leavePolicy.recommendations = [];
          }
        }
      }

      // Ensure recommendations array exists
      if (!data.leavePolicy.recommendations || !Array.isArray(data.leavePolicy.recommendations)) {
        data.leavePolicy.recommendations = [];
      }

      // Ensure overview and analysis exist
      if (!data.leavePolicy.overview) {
        data.leavePolicy.overview = "No overview available for the leave policy.";
      }
      if (!data.leavePolicy.analysis) {
        data.leavePolicy.analysis = "No analysis available for the leave policy.";
      }
    }

    // Validate provisions and prepayments
    if (data && data.provisionsAndPrepayments) {
      console.log('Validating provisions and prepayments...');

      // Check if items is a string that looks like an array (from JSON stringification)
      if (data.provisionsAndPrepayments.items && typeof data.provisionsAndPrepayments.items === 'string') {
        try {
          // Try to parse the string as JSON
          const parsedItems = JSON.parse(data.provisionsAndPrepayments.items);
          if (Array.isArray(parsedItems)) {
            data.provisionsAndPrepayments.items = parsedItems;
            console.log('Successfully parsed provisionsAndPrepayments.items from string to array');
          }
        } catch (error) {
          // If it's not valid JSON but looks like an array representation
          if (typeof data.provisionsAndPrepayments.items === 'string' &&
            data.provisionsAndPrepayments.items.trim().startsWith('[') &&
            data.provisionsAndPrepayments.items.trim().endsWith(']')) {
            console.log('Attempting to evaluate provisionsAndPrepayments.items string as array');
            try {
              // This is a safer alternative to eval
              const itemsStr = data.provisionsAndPrepayments.items.replace(/'/g, '"');
              data.provisionsAndPrepayments.items = JSON.parse(itemsStr);
            } catch (evalError) {
              console.error('Failed to parse provisionsAndPrepayments.items string:', evalError);
              // Reset to empty array if parsing fails
              data.provisionsAndPrepayments.items = [];
            }
          } else {
            console.error('Failed to parse provisionsAndPrepayments.items:', error);
            // Reset to empty array
            data.provisionsAndPrepayments.items = [];
          }
        }
      }

      // Ensure items array exists
      if (!data.provisionsAndPrepayments.items || !Array.isArray(data.provisionsAndPrepayments.items)) {
        data.provisionsAndPrepayments.items = [];
      }

      // Ensure each item has required fields
      data.provisionsAndPrepayments.items.forEach((item: any, index: number) => {
        if (!item.name) {
          console.log(`Missing name for provision / prepayment at index ${index}. Adding placeholder.`);
          item.name = `Item ${index + 1} `;
        }

        if (!item.type) {
          console.log(`Missing type for provision / prepayment at index ${index}. Adding placeholder.`);
          item.type = 'Provision';
        }

        if (!item.status) {
          item.status = 'uncertain';
        }

        // Ensure all fields are strings
        if (item.amount && typeof item.amount !== 'string') {
          item.amount = String(item.amount);
        }

        if (item.period && typeof item.period !== 'string') {
          item.period = String(item.period);
        }

        if (item.status && typeof item.status !== 'string') {
          item.status = String(item.status);
        }

        if (item.notes && typeof item.notes !== 'string') {
          item.notes = String(item.notes);
        }
      });

      // Ensure recommendations array exists
      if (!data.provisionsAndPrepayments.recommendations || !Array.isArray(data.provisionsAndPrepayments.recommendations)) {
        data.provisionsAndPrepayments.recommendations = [];
      }

      // Ensure overview and analysis exist
      if (!data.provisionsAndPrepayments.overview) {
        data.provisionsAndPrepayments.overview = "No overview available for provisions and prepayments.";
      }

      if (!data.provisionsAndPrepayments.analysis) {
        data.provisionsAndPrepayments.analysis = "No analysis available for provisions and prepayments.";
      }
    }

    // Validate deferred tax assets
    if (data && data.deferredTaxAssets) {
      console.log('Validating deferred tax assets...');

      // Check if items is a string that looks like an array (from JSON stringification)
      if (data.deferredTaxAssets.items && typeof data.deferredTaxAssets.items === 'string') {
        try {
          // Try to parse the string as JSON
          const parsedItems = JSON.parse(data.deferredTaxAssets.items);
          if (Array.isArray(parsedItems)) {
            data.deferredTaxAssets.items = parsedItems;
            console.log('Successfully parsed deferredTaxAssets.items from string to array');
          }
        } catch (error) {
          // If it's not valid JSON but looks like an array representation
          if (typeof data.deferredTaxAssets.items === 'string' &&
            data.deferredTaxAssets.items.trim().startsWith('[') &&
            data.deferredTaxAssets.items.trim().endsWith(']')) {
            console.log('Attempting to evaluate deferredTaxAssets.items string as array');
            try {
              // This is a safer alternative to eval
              const itemsStr = data.deferredTaxAssets.items.replace(/'/g, '"');
              data.deferredTaxAssets.items = JSON.parse(itemsStr);
            } catch (evalError) {
              console.error('Failed to parse deferredTaxAssets.items string:', evalError);
              // Reset to empty array if parsing fails
              data.deferredTaxAssets.items = [];
            }
          } else {
            console.error('Failed to parse deferredTaxAssets.items:', error);
            // Reset to empty array
            data.deferredTaxAssets.items = [];
          }
        }
      }

      // Ensure items array exists
      if (!data.deferredTaxAssets.items || !Array.isArray(data.deferredTaxAssets.items)) {
        data.deferredTaxAssets.items = [];
      }

      // Ensure each item has required fields
      data.deferredTaxAssets.items.forEach((item: any, index: number) => {
        if (!item.name) {
          console.log(`Missing name for deferred tax asset at index ${index}. Adding placeholder.`);
          item.name = `Asset ${index + 1} `;
        }

        if (!item.riskLevel) {
          console.log(`Missing risk level for deferred tax asset at index ${index}. Setting to medium.`);
          item.riskLevel = 'medium';
        } else if (!['low', 'medium', 'high'].includes(item.riskLevel)) {
          console.log(`Invalid risk level "${item.riskLevel}" for deferred tax asset at index ${index}. Setting to medium.`);
          item.riskLevel = 'medium';
        }

        // Ensure all fields are strings
        if (item.amount && typeof item.amount !== 'string') {
          item.amount = String(item.amount);
        }

        if (item.origin && typeof item.origin !== 'string') {
          item.origin = String(item.origin);
        }

        if (item.expectedUtilization && typeof item.expectedUtilization !== 'string') {
          item.expectedUtilization = String(item.expectedUtilization);
        }

        if (item.riskLevel && typeof item.riskLevel !== 'string') {
          item.riskLevel = String(item.riskLevel);
        }

        if (item.notes && typeof item.notes !== 'string') {
          item.notes = String(item.notes);
        }
      });

      // Ensure recommendations array exists
      if (!data.deferredTaxAssets.recommendations || !Array.isArray(data.deferredTaxAssets.recommendations)) {
        data.deferredTaxAssets.recommendations = [];
      }

      // Ensure overview and analysis exist
      if (!data.deferredTaxAssets.overview) {
        data.deferredTaxAssets.overview = "No overview available for deferred tax assets.";
      }
      if (!data.deferredTaxAssets.analysis) {
        data.deferredTaxAssets.analysis = "No analysis available for deferred tax assets.";
      }
    }

    // If any of the table sections don't exist, create them with default values
    if (!data.directorsTable) {
      console.log('Creating default directors table...');
      data.directorsTable = {
        overview: "No directors information available in the provided documents.",
        directors: [],
        analysis: "Unable to analyze directors information due to lack of data.",
        recommendations: ["Provide company incorporation documents or annual returns to analyze the board of directors."]
      };
    }

    if (!data.keyBusinessAgreements) {
      console.log('Creating default key business agreements...');
      data.keyBusinessAgreements = {
        overview: "No key business agreements information available in the provided documents.",
        agreements: [],
        analysis: "Unable to analyze key business agreements due to lack of data.",
        recommendations: ["Provide contracts and business agreements for analysis."]
      };
    }

    if (!data.leavePolicy) {
      console.log('Creating default leave policy...');
      data.leavePolicy = {
        overview: "No leave policy information available in the provided documents.",
        policies: [],
        analysis: "Unable to analyze leave policy due to lack of data.",
        recommendations: ["Provide HR policy documents for analysis."]
      };
    }

    if (!data.provisionsAndPrepayments) {
      console.log('Creating default provisions and prepayments...');
      data.provisionsAndPrepayments = {
        overview: "No provisions and prepayments information available in the provided documents.",
        items: [],
        analysis: "Unable to analyze provisions and prepayments due to lack of data.",
        recommendations: ["Provide detailed balance sheet and notes to accounts for analysis."]
      };
    }

    if (!data.deferredTaxAssets) {
      console.log('Creating default deferred tax assets...');
      data.deferredTaxAssets = {
        overview: "No deferred tax assets information available in the provided documents.",
        items: [],
        analysis: "Unable to analyze deferred tax assets due to lack of data.",
        recommendations: ["Provide tax computation documents and notes to accounts for analysis."]
      };
    }
  }

  /**
   * Extract raw data from documents without using AI
   * @param documents Array of document objects with file paths and metadata
   * @returns Structured raw data from all documents
   */
  async extractRawDataFromDocuments(documents: Array<{
    filePath: string,
    documentType: string,
    originalName: string,
    description?: string,
    timePeriod?: string,
    fileType?: string,
    fileSize?: number,
    createdAt?: string,
    updatedAt?: string
  }>): Promise<{
    rawContent: string,
    documentsByType: { [key: string]: Array<any> }
  }> {
    console.log('Extracting raw data from documents without AI...');

    // Create a map to store documents by type
    const documentsByType: { [key: string]: Array<any> } = {};
    let combinedRawContent = '';

    // Process each document to extract raw text
    await Promise.all(documents.map(async (doc) => {
      const {
        filePath,
        documentType,
        originalName,
        description,
        timePeriod,
        fileType,
        fileSize,
        createdAt
      } = doc;

      try {
        // Process document using traditional methods (not AI)
        // We'll use our existing methods but extract only the raw text
        const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '../..', filePath);

        if (!fs.existsSync(absolutePath)) {
          console.error(`File not found: ${absolutePath} `);
          return {
            documentType,
            originalName,
            description,
            timePeriod,
            fileType,
            fileSize,
            createdAt,
            content: `[File not found: ${originalName}]`,
            error: true
          };
        }

        // Extract text based on file type using traditional methods
        const fileExtension = path.extname(absolutePath).toLowerCase();
        let rawContent = '';

        switch (fileExtension) {
          case '.pdf':
            rawContent = await this.extractPdfText(absolutePath);
            break;
          case '.xls':
          case '.xlsx':
            // Use ExcelJS directly instead of Gemini
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(absolutePath);
            let excelContent = '';

            // Process each sheet
            workbook.eachSheet((worksheet, _sheetId) => {
              const sheetName = worksheet.name;
              excelContent += `=== SHEET: ${sheetName} ===\n\n`;

              // Process each row
              worksheet.eachRow((row, _rowNumber) => {
                const rowValues: string[] = [];

                row.eachCell((cell, _colNumber) => {
                  let value = cell.value?.toString() || '';
                  rowValues.push(value);
                });

                if (rowValues.length > 0) {
                  excelContent += rowValues.join('\t') + '\n';
                }
              });

              excelContent += '\n\n';
            });

            rawContent = excelContent || '[No data extracted from Excel file]';
            break;
          case '.csv':
            rawContent = await this.extractCsvData(absolutePath);
            break;
          case '.doc':
          case '.docx':
            // Use mammoth directly instead of Gemini
            const result = await mammoth.extractRawText({ path: absolutePath });
            rawContent = result.value || '[No text content extracted from Word document]';
            break;
          case '.txt':
          case '.md':
          case '.json':
          case '.xml':
            rawContent = await this.extractTextFileContent(absolutePath);
            break; case '.jpg':
          case '.jpeg':
          case '.png':
          case '.gif':
          case '.bmp':
            // Use image OCR extraction (delegated to Gemini AI)
            rawContent = await this.extractImageTextWithTesseract(absolutePath);
            break;
          case '.ppt':
          case '.pptx':
            // For PowerPoint, we don't have a traditional extraction method
            // We'll use a placeholder message
            rawContent = '[PowerPoint content requires AI extraction - raw text unavailable]';
            break;
          default:
            rawContent = `[Unsupported file type: ${fileExtension}]`;
        }

        // No need to format file size and date as we're using JSON

        // Create a structured JSON object for the document data
        const documentData = {
          metadata: {
            filename: originalName,
            type: documentType.replace('financial_', '').replace(/_/g, ' '),
            description: description || 'No description provided',
            timePeriod: timePeriod || 'Not specified'
          },
          content: rawContent
        };

        // Convert to JSON string for storage
        const documentContent = JSON.stringify(documentData, null, 2);

        // Add to combined content
        combinedRawContent += documentContent + '\n\n';

        // Initialize array for this document type if it doesn't exist
        if (!documentsByType[documentType]) {
          documentsByType[documentType] = [];
        }

        // Add document to the appropriate type
        documentsByType[documentType].push({
          documentType,
          originalName,
          description,
          timePeriod,
          fileType,
          fileSize,
          createdAt,
          content: rawContent,
          metadata: documentData.metadata,
          formattedContent: documentContent
        });

        return {
          documentType,
          originalName,
          description,
          timePeriod,
          fileType,
          fileSize,
          createdAt,
          content: rawContent,
          metadata: documentData.metadata,
          formattedContent: documentContent
        };
      } catch (error) {
        console.error(`Error processing ${originalName}: `, error);

        // Initialize array for this document type if it doesn't exist
        if (!documentsByType[documentType]) {
          documentsByType[documentType] = [];
        }

        // Add error document to the appropriate type
        documentsByType[documentType].push({
          documentType,
          originalName,
          description,
          timePeriod,
          fileType,
          fileSize,
          createdAt,
          error: true,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });

        return {
          documentType,
          originalName,
          description,
          timePeriod,
          fileType,
          fileSize,
          createdAt,
          error: true,
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }));

    // Create a structured JSON object for all document types
    const combinedData: { [key: string]: any[] } = {};

    // Process each document type
    for (const [docType, docs] of Object.entries(documentsByType)) {
      // Format document type for display (remove 'financial_' prefix, replace underscores with spaces, and capitalize)
      const formattedDocType = docType.replace('financial_', '')
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Process each document
      const processedDocs = docs.map(doc => {
        if (doc.error) {
          // Create error document data
          return {
            metadata: {
              filename: doc.originalName,
              type: doc.documentType.replace('financial_', '').replace(/_/g, ' '),
              description: doc.description || 'No description provided',
              timePeriod: doc.timePeriod || 'Not specified',
              status: 'ERROR - Document processing failed'
            },
            content: `Error: Failed to process this document.${doc.errorMessage || 'Please check the file format and try again.'} `,
            error: true
          };
        } else {
          // Return the document data
          return {
            metadata: doc.metadata,
            content: doc.content
          };
        }
      });

      // Add to combined data
      combinedData[formattedDocType] = processedDocs;
    }

    // Convert the combined data to JSON string
    const finalCombinedContent = JSON.stringify(combinedData, null, 2);

    return {
      rawContent: finalCombinedContent,
      documentsByType
    };
  }

  /**
   * Extract financial data from documents using Gemini AI with enhanced forward-looking analysis
   * This method can work with either:
   * 1. Pre-combined document content (legacy mode)
   * 2. An array of document objects (new mode that extracts raw data first)
   *
   * Enhanced to incorporate additional data sources and forward-looking analysis
   * to better evaluate future potential and investment value
   *
   * @param documentContentOrDocuments Combined document content string or array of document objects
   * @param companyName Name of the company
   * @param startupInfo Additional startup information
   * @param investorInfo Additional investor information
   * @param missingDocumentTypes Array of missing document types
   * @param additionalDataSources Optional additional data from MongoDB models
   * @returns Extracted financial data with enhanced forward-looking analysis
   */
  async extractFinancialData(
    documentContentOrDocuments: string | Array<{
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
    startupInfo?: any,
    investorInfo?: any,
    missingDocumentTypes?: string[],
    additionalDataSources?: {
      extendedProfile?: any,
      questionnaireSubmission?: any,
      tasks?: any[],
      financialReports?: any[],
      historicalMetrics?: any
    }
  ): Promise<any> {
    try {
      // Determine if we're using the new or legacy mode
      let documentContent: string;

      if (typeof documentContentOrDocuments === 'string') {
        // Legacy mode - documentContent is already a string
        console.log('Using legacy mode with pre-combined document content');
        documentContent = documentContentOrDocuments;
      } else {
        // Enhanced mode - process documents with our new flow:
        // 1. Extract raw text from all documents
        // 2. Send PDFs and PPTs to Gemini for OCR (preserving tables and graphs)
        // 3. Combine raw text, OCR text, and metadata
        console.log('Using enhanced mode with improved document processing flow');
        documentContent = await this.processDocumentsForFinancialDD(documentContentOrDocuments);
        console.log('Enhanced document processing complete, sending to Gemini for financial analysis');
      }

      // Prepare enhanced startup context with more detailed information
      let startupContext = '';
      if (startupInfo) {
        // Extract team information from extended profile if available
        let teamInfo = '';
        if (additionalDataSources?.extendedProfile?.teamMembers && additionalDataSources.extendedProfile.teamMembers.length > 0) {
          teamInfo = `
                TEAM INFORMATION:
                ${additionalDataSources.extendedProfile.teamMembers.map((member: any, index: number) =>
            `Team Member ${index + 1}:
                   Name: ${member.name || 'Not specified'}
                   Role: ${member.role || 'Not specified'}
                   Bio: ${member.bio || 'Not specified'}`
          ).join('\n                ')
            }
`;
        }

        // Extract vision and mission from questionnaire if available
        let visionMissionInfo = '';
        if (additionalDataSources?.questionnaireSubmission?.responses) {
          const responses = additionalDataSources.questionnaireSubmission.responses;
          // Convert Map to object if needed
          const responsesObj = responses instanceof Map ? Object.fromEntries(responses) : responses;

          if (responsesObj.vision || responsesObj.mission || responsesObj.longTermGoals) {
            visionMissionInfo = `
                VISION AND MISSION:
Vision: ${responsesObj.vision || 'Not specified'}
Mission: ${responsesObj.mission || 'Not specified'}
Long - term Goals: ${responsesObj.longTermGoals || 'Not specified'}
`;
          }
        }

        // Extract execution capability indicators from tasks if available
        let executionInfo = '';
        if (additionalDataSources?.tasks && additionalDataSources.tasks.length > 0) {
          const completedTasks = additionalDataSources.tasks.filter((task: any) => task.completed).length;
          const totalTasks = additionalDataSources.tasks.length;
          const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(2) : 'N/A';

          executionInfo = `
                EXECUTION CAPABILITY:
                Task Completion Rate: ${completionRate}%
  Completed Tasks: ${completedTasks}/${totalTasks}
    `;
        }

        // Extract historical metrics if available
        let historicalMetricsInfo = '';
        if (additionalDataSources?.historicalMetrics) {
          historicalMetricsInfo = `
                HISTORICAL METRICS:
                ${Object.entries(additionalDataSources.historicalMetrics).map(([key, value]) =>
            `${key}: ${value}`
          ).join('\n                ')
            }
`;
        }

        // Combine all startup information
        startupContext = `
                STARTUP INFORMATION:
                Company Name: ${startupInfo.companyName || companyName}
Industry: ${startupInfo.industry || 'Not specified'}
Stage: ${startupInfo.stage || 'Not specified'}
Founded: ${startupInfo.foundingDate || 'Not specified'}
Description: ${startupInfo.description || 'Not specified'}
                Team Size: ${startupInfo.teamSize || 'Not specified'}
Location: ${startupInfo.location || 'Not specified'}
Website: ${startupInfo.website || 'Not specified'}
                Funding Round: ${startupInfo.fundingRound || 'Not specified'}
                Funding Amount: ${startupInfo.fundingAmount || 'Not specified'}
Valuation: ${startupInfo.valuation || 'Not specified'}
                ${teamInfo}
                ${visionMissionInfo}
                ${executionInfo}
                ${historicalMetricsInfo}
`;
      }

      // Prepare missing documents information
      const missingDocumentsContext = missingDocumentTypes && missingDocumentTypes.length > 0 ? `
                MISSING DOCUMENTS:
                The following required financial documents are missing:
                ${missingDocumentTypes.map(type => {
        // Convert document type to readable format
        const readableType = type.replace('financial_', '').replace(/_/g, ' ');
        return `- ${readableType.charAt(0).toUpperCase() + readableType.slice(1)}`;
      }).join('\n                ')
        }
` : '';

      // Enhance investor context with more detailed information
      let investorContext = '';
      if (investorInfo) {
        // Extract additional investor preferences if available
        let additionalPreferences = '';
        if (additionalDataSources?.questionnaireSubmission?.responses &&
          additionalDataSources.questionnaireSubmission.userRole === 'investor') {
          const responses = additionalDataSources.questionnaireSubmission.responses;
          // Convert Map to object if needed
          const responsesObj = responses instanceof Map ? Object.fromEntries(responses) : responses;

          if (responsesObj.investmentCriteria || responsesObj.returnExpectations) {
            additionalPreferences = `
                INVESTMENT PREFERENCES:
                Investment Criteria: ${responsesObj.investmentCriteria || 'Not specified'}
                Return Expectations: ${responsesObj.returnExpectations || 'Not specified'}
                Risk Tolerance: ${responsesObj.riskTolerance || 'Not specified'}
                Investment Horizon: ${responsesObj.investmentHorizon || 'Not specified'}
`;
          }
        }

        // Combine all investor information
        investorContext = `
                INVESTOR INFORMATION:
Name: ${investorInfo.name || 'Not specified'}
                Investment Stage: ${investorInfo.investmentStage || 'Not specified'}
                Investment Size: ${investorInfo.investmentSize || 'Not specified'}
Sectors: ${Array.isArray(investorInfo.sectors) ? investorInfo.sectors.join(', ') : (investorInfo.sectors || 'Not specified')}
Location: ${investorInfo.location || 'Not specified'}
Portfolio: ${Array.isArray(investorInfo.portfolio) ? investorInfo.portfolio.join(', ') : (investorInfo.portfolio || 'Not specified')}
                ${additionalPreferences}
`;
      }

      // Add industry benchmarks and success patterns if available
      let benchmarksContext = '';
      if (additionalDataSources?.financialReports && additionalDataSources.financialReports.length > 0) {
        // Extract industry benchmarks from previous financial reports
        const industryBenchmarks = additionalDataSources.financialReports
          .filter((report: any) => report.industryBenchmarking && report.industryBenchmarking.metrics)
          .flatMap((report: any) => report.industryBenchmarking.metrics)
          .filter((metric: any) => metric.name && metric.industryAverage);

        if (industryBenchmarks.length > 0) {
          benchmarksContext = `
                INDUSTRY BENCHMARKS:
                ${industryBenchmarks.map((metric: any) =>
            `${metric.name}: ${metric.industryAverage} (Industry Average)`
          ).join('\n                ')
            }
`;
        }
      }

      // Combine all context information for enhanced analysis
      const enhancedStartupContext = `${startupContext}
                ${benchmarksContext} `;

      const PROMPT = FIN_DD_PROMPT(companyName, enhancedStartupContext, investorContext, missingDocumentsContext, documentContent, structure);

      // Call Gemini API with dynamic retry logic
      console.log('Calling Gemini API for enhanced financial analysis with dynamic retry logic...');

      let text = '';
      const result = await executeGeminiWithDynamicRetry(async () => {
        return await model.generateContent(PROMPT);
      });

      const response = result.response;
      text = response.text();

      console.log('Successfully received response from Gemini API');

      // Log the raw response to a file for debugging
      try {
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const logDir = path.join(__dirname, '..', '..', 'logs');

        // Create logs directory if it doesn't exist
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true });
        }

        const logFilePath = path.join(logDir, `gemini_raw_response_${timestamp}.json`);
        fs.writeFileSync(logFilePath, text);
        console.log(`Raw Gemini response logged to: ${logFilePath} `);
      } catch (logError) {
        console.error('Error logging raw Gemini response:', logError);
      }

      // Parse the JSON response
      try {
        // Clean the response text by removing markdown code block markers
        const cleanedText = cleanJsonResponse(text);

        // Use our safe JSON parser that can handle common issues
        const parsedData = safeJsonParse(cleanedText);
        if (parsedData === null) {
          console.error('Failed to parse Gemini response even with error correction');
          console.log('Raw response:', text);
          throw new Error('Failed to parse financial data from Gemini response');
        }

        // Validate and fix compliance items status values
        this.validateAndFixComplianceItems(parsedData);

        // Validate and normalize ratio analysis status values
        this.validateAndNormalizeRatioAnalysis(parsedData);

        // Validate and ensure proper structure for new sections
        this.validateNewSections(parsedData);

        // Add metadata about the enhanced analysis
        parsedData.analysisMetadata = {
          enhancedAnalysis: true,
          dataSourcesUsed: {
            documents: true,
            startupProfile: !!startupInfo,
            investorProfile: !!investorInfo,
            extendedProfile: !!additionalDataSources?.extendedProfile,
            questionnaire: !!additionalDataSources?.questionnaireSubmission,
            tasks: !!additionalDataSources?.tasks,
            financialReports: !!additionalDataSources?.financialReports,
            historicalMetrics: !!additionalDataSources?.historicalMetrics
          },
          analysisTimestamp: new Date().toISOString()
        };

        return parsedData;
      } catch (error) {
        console.error('Error parsing Gemini response:', error);
        console.log('Raw response:', text);
        throw new Error('Failed to parse financial data from Gemini response');
      }
    } catch (error) {
      console.error('Error extracting financial data:', error);
      throw new Error('Failed to extract financial data from documents');
    }
  }
}

export default new EnhancedDocumentProcessingService()
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import axios from 'axios';
import ExcelJS from 'exceljs';
import { PDFExtract, PDFExtractOptions } from 'pdf.js-extract';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';
import { Document } from 'mongoose';
import { cleanJsonResponse, safeJsonParse } from '../utils/jsonHelper';

// Load environment variables
dotenv.config();

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || '';
if (!apiKey) {
  console.warn('Warning: GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-preview-04-17",
  generationConfig: {
    maxOutputTokens: 65536, // Set to maximum allowed for Gemini 2.0 Flash
    temperature: 0.2, // Lower temperature for more deterministic outputs
  }
});

// Promisify fs functions
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

// Promisify PDF extraction
const pdfExtract = new PDFExtract();
const pdfExtractAsync = promisify(pdfExtract.extract.bind(pdfExtract));

/**
 * Enhanced service for processing different types of documents and extracting their content
 */
export class EnhancedDocumentProcessingService {
  /**
   * Extract text content from a PDF file
   * @param filePath Path to the PDF file
   * @returns Extracted text content
   */
  async extractPdfText(filePath: string): Promise<string> {
    try {
      // First check if the file exists
      if (!fs.existsSync(filePath)) {
        console.error(`PDF file not found: ${filePath}`);
        return `[File not found: The document appears to be missing from the server. It may have been deleted or moved.]`;
      }

      const options: PDFExtractOptions = {};
      const data = await pdfExtractAsync(filePath, options);

      // Combine all page content
      let textContent = '';
      if (data && typeof data === 'object' && 'pages' in data && Array.isArray(data.pages)) {
        data.pages.forEach((page: any) => {
          if (page && typeof page === 'object' && 'content' in page && Array.isArray(page.content)) {
            page.content.forEach((item: any) => {
              textContent += item.str + ' ';
            });
          }
          textContent += '\n\n';
        });
      }

      return textContent || '[No text content extracted from PDF]';
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      // Return a placeholder message instead of throwing an error
      return `[Error processing PDF: ${error instanceof Error ? error.message : 'Unknown error'}]`;
    }
  }

  /**
   * Extract text and data from an Excel file
   * @param filePath Path to the Excel file
   * @returns Extracted data as a string
   */
  async extractExcelData(filePath: string): Promise<string> {
    try {
      // First check if the file exists
      if (!fs.existsSync(filePath)) {
        console.error(`Excel file not found: ${filePath}`);
        return `[File not found: The document appears to be missing from the server. It may have been deleted or moved.]`;
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      let result = '';

      // Process each sheet
      workbook.eachSheet((worksheet, sheetId) => {
        const sheetName = worksheet.name;
        result += `Sheet: ${sheetName}\n\n`;

        // Process each row
        worksheet.eachRow((row, rowNumber) => {
          const rowValues: string[] = [];
          row.eachCell((cell, colNumber) => {
            rowValues.push(cell.value?.toString() || '');
          });

          if (rowValues.length > 0) {
            result += rowValues.join('\t') + '\n';
          }
        });

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
   * Extract data from a CSV file
   * @param filePath Path to the CSV file
   * @returns Extracted data as a string
   */
  async extractCsvData(filePath: string): Promise<string> {
    try {
      // First check if the file exists
      if (!fs.existsSync(filePath)) {
        console.error(`CSV file not found: ${filePath}`);
        return `[File not found: The document appears to be missing from the server. It may have been deleted or moved.]`;
      }

      const content = await readFileAsync(filePath, 'utf8');
      const lines = content.split('\n');

      // Process CSV data
      let result = '';
      lines.forEach(line => {
        if (line.trim()) {
          result += line + '\n';
        }
      });

      return result || '[No data extracted from CSV file]';
    } catch (error) {
      console.error('Error extracting CSV data:', error);
      // Return a placeholder message instead of throwing an error
      return `[Error processing CSV file: ${error instanceof Error ? error.message : 'Unknown error'}]`;
    }
  }

  /**
   * Extract text from a PowerPoint file using Gemini API
   * @param filePath Path to the PowerPoint file
   * @returns Extracted text content
   */
  async extractPptText(filePath: string): Promise<string> {
    try {
      // First check if the file exists
      if (!fs.existsSync(filePath)) {
        console.error(`PowerPoint file not found: ${filePath}`);
        return `[File not found: The document appears to be missing from the server. It may have been deleted or moved.]`;
      }

      const fileBuffer = await readFileAsync(filePath);

      // Use Gemini to extract text from PowerPoint
      const prompt = `
            Extract all text content from this PowerPoint presentation.
            Include slide titles, bullet points, notes, and any other textual information.

            Format the output as plain text, preserving the structure of the slides.
            `;

      const result = await model.generateContent([
        prompt,
        { fileData: { mime_type: 'application/vnd.ms-powerpoint', data: fileBuffer.toString('base64') } as any }
      ]);

      const response = result.response;
      return response.text() || '[No text content extracted from PowerPoint]';
    } catch (error) {
      console.error('Error extracting PPT text:', error);
      // Return a placeholder message instead of throwing an error
      return `[Error processing PowerPoint file: ${error instanceof Error ? error.message : 'Unknown error'}]`;
    }
  }

  /**
   * Extract text from a Word document
   * @param filePath Path to the Word document
   * @returns Extracted text content
   */
  async extractWordText(filePath: string): Promise<string> {
    try {
      // First check if the file exists
      if (!fs.existsSync(filePath)) {
        console.error(`Word document not found: ${filePath}`);
        return `[File not found: The document appears to be missing from the server. It may have been deleted or moved.]`;
      }

      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || '[No text content extracted from Word document]';
    } catch (error) {
      console.error('Error extracting Word text:', error);
      // Return a placeholder message instead of throwing an error
      return `[Error processing Word document: ${error instanceof Error ? error.message : 'Unknown error'}]`;
    }
  }

  /**
   * Extract text from an image using OCR
   * @param filePath Path to the image file
   * @returns Extracted text content
   */
  async extractImageText(filePath: string): Promise<string> {
    try {
      // First check if the file exists
      if (!fs.existsSync(filePath)) {
        console.error(`Image file not found: ${filePath}`);
        return `[File not found: The document appears to be missing from the server. It may have been deleted or moved.]`;
      }

      const worker = await createWorker();
      // Use the correct methods for Tesseract.js v6
      await worker.reinitialize('eng');

      const result = await worker.recognize(filePath);
      const text = result.data.text;
      await worker.terminate();

      return text || '[No text content extracted from image]';
    } catch (error) {
      console.error('Error extracting image text:', error);
      // Return a placeholder message instead of throwing an error
      return `[Error processing image file: ${error instanceof Error ? error.message : 'Unknown error'}]`;
    }
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
   * @returns Extracted content
   */
  async processDocument(filePath: string): Promise<string> {
    try {
      // Convert to absolute path if it's a relative path
      const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '../..', filePath);

      // Check if file exists before processing
      if (!fs.existsSync(absolutePath)) {
        console.error(`File not found: ${absolutePath}`);
        return `[File not found: The document appears to be missing from the server. It may have been deleted or moved.]`;
      }

      const fileExtension = path.extname(absolutePath).toLowerCase();

      switch (fileExtension) {
        case '.pdf':
          return this.extractPdfText(absolutePath);
        case '.ppt':
        case '.pptx':
          return this.extractPptText(absolutePath);
        case '.xls':
        case '.xlsx':
          return this.extractExcelData(absolutePath);
        case '.csv':
          return this.extractCsvData(absolutePath);
        case '.doc':
        case '.docx':
          return this.extractWordText(absolutePath);
        case '.jpg':
        case '.jpeg':
        case '.png':
        case '.gif':
        case '.bmp':
          return this.extractImageText(absolutePath);
        case '.txt':
        case '.md':
        case '.json':
        case '.xml':
          return this.extractTextFileContent(absolutePath);
        default:
          return `[Unsupported file type: ${fileExtension}. The system cannot process this type of document.]`;
      }
    } catch (error) {
      console.error(`Error processing document ${filePath}:`, error);
      return `[Error processing document: ${error instanceof Error ? error.message : 'Unknown error'}]`;
    }
  }



  /**
   * Process multiple documents with comprehensive metadata and combine their content with document type identifiers
   * @param documents Array of document objects with filePath, documentType, and additional metadata
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
  }>): Promise<string> {
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
        const content = await this.processDocument(filePath); // This will handle the path conversion internally

        // Initialize array for this document type if it doesn't exist
        if (!contentByType[documentType]) {
          contentByType[documentType] = [];
        }

        // Format file size in a readable way
        const formattedFileSize = fileSize ? `${(fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown size';

        // Format date in a readable way
        const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString() : 'Unknown date';

        // Create metadata section
        const metadataSection = `
--- Document Metadata ---
Filename: ${originalName}
Type: ${documentType.replace('financial_', '').replace(/_/g, ' ')}
Description: ${description || 'No description provided'}
Time Period: ${timePeriod || 'Not specified'}
File Format: ${fileType || 'Unknown format'}
Size: ${formattedFileSize}
Created: ${formattedDate}
`;

        // Add content with document name and metadata
        contentByType[documentType].push(`--- Document: ${originalName} ---\n${metadataSection}\n--- Document Content ---\n\n${content}\n\n`);

        return {
          documentType,
          originalName,
          description,
          timePeriod,
          fileType,
          fileSize,
          createdAt,
          content
        };
      } catch (error) {
        console.error(`Error processing ${originalName}:`, error);

        // Initialize array for this document type if it doesn't exist
        if (!contentByType[documentType]) {
          contentByType[documentType] = [];
        }

        // Format file size in a readable way
        const formattedFileSize = fileSize ? `${(fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown size';

        // Format date in a readable way
        const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString() : 'Unknown date';

        // Create metadata section even for failed documents
        const metadataSection = `
--- Document Metadata ---
Filename: ${originalName}
Type: ${documentType.replace('financial_', '').replace(/_/g, ' ')}
Description: ${description || 'No description provided'}
Time Period: ${timePeriod || 'Not specified'}
File Format: ${fileType || 'Unknown format'}
Size: ${formattedFileSize}
Created: ${formattedDate}
`;

        // Add error message with metadata
        contentByType[documentType].push(`--- Document: ${originalName} ---\n${metadataSection}\n--- Document Content ---\n\nError: Failed to process this document\n\n`);

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

    // Combine content with document type identifiers
    let combinedContent = '';

    // Add each document type section
    for (const [docType, contents] of Object.entries(contentByType)) {
      // Format document type for display (remove 'financial_' prefix, replace underscores with spaces, and capitalize)
      const formattedDocType = docType.replace('financial_', '')
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      combinedContent += `=== ${formattedDocType} ===\n\n`;
      combinedContent += contents.join('\n');
      combinedContent += '\n\n';
    }

    return combinedContent;
  }

  /**
   * Process multiple documents and combine their content with document type identifiers
   * @param filePaths Array of file paths
   * @returns Combined extracted content with document type identifiers
   */
  async processMultipleDocuments(filePaths: string[]): Promise<string> {
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
        documentType = `financial_${match[1]}`;
      }

      try {
        const content = await this.processDocument(filePath); // This will handle the path conversion internally

        // Initialize array for this document type if it doesn't exist
        if (!contentByType[documentType]) {
          contentByType[documentType] = [];
        }

        // Add content with document name
        contentByType[documentType].push(`--- Document: ${fileName} ---\n\n${content}\n\n`);

        return {
          documentType,
          fileName,
          content
        };
      } catch (error) {
        console.error(`Error processing ${fileName}:`, error);

        // Initialize array for this document type if it doesn't exist
        if (!contentByType[documentType]) {
          contentByType[documentType] = [];
        }

        // Add error message
        contentByType[documentType].push(`--- Document: ${fileName} ---\n\nError: Failed to process this document\n\n`);

        return {
          documentType,
          fileName,
          error: true
        };
      }
    });

    // Wait for all documents to be processed
    await Promise.all(contentPromises);

    // Combine content with document type identifiers
    let combinedContent = '';

    // Add each document type section
    for (const [docType, contents] of Object.entries(contentByType)) {
      // Format document type for display (remove 'financial_' prefix, replace underscores with spaces, and capitalize)
      const formattedDocType = docType.replace('financial_', '')
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      combinedContent += `=== ${formattedDocType} ===\n\n`;
      combinedContent += contents.join('\n');
      combinedContent += '\n\n';
    }

    return combinedContent;
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

    // Check legal and regulatory compliance areas if they exist
    if (data && data.legalAndRegulatoryCompliance &&
      data.legalAndRegulatoryCompliance.complianceAreas &&
      Array.isArray(data.legalAndRegulatoryCompliance.complianceAreas)) {

      data.legalAndRegulatoryCompliance.complianceAreas.forEach((area: any, index: number) => {
        if (area && area.status) {
          if (!validStatusValues.includes(area.status)) {
            console.log(`Invalid legal compliance status "${area.status}" found at index ${index}. Fixing to "partial".`);
            area.status = 'partial';
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
                console.log(`Normalizing non-standard ratio status "${ratio.status}" in ${category} at index ${index} to "warning".`);
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
    // Validate shareholders table
    if (data && data.shareholdersTable) {
      console.log('Validating shareholders table...');

      // Ensure shareholders array exists
      if (!data.shareholdersTable.shareholders || !Array.isArray(data.shareholdersTable.shareholders)) {
        data.shareholdersTable.shareholders = [];
      }

      // Ensure each shareholder has required fields
      data.shareholdersTable.shareholders.forEach((shareholder: any, index: number) => {
        if (!shareholder.name) {
          console.log(`Missing name for shareholder at index ${index}. Adding placeholder.`);
          shareholder.name = `Shareholder ${index + 1}`;
        }

        // Ensure numeric fields are properly formatted
        ['equityPercentage', 'shareCount', 'faceValue', 'investmentAmount'].forEach(field => {
          if (shareholder[field] && typeof shareholder[field] !== 'number' && shareholder[field] !== 'N/A') {
            // Try to convert to number if possible
            const numValue = parseFloat(shareholder[field]);
            if (!isNaN(numValue)) {
              shareholder[field] = numValue;
            } else {
              shareholder[field] = 'N/A';
            }
          }
        });
      });

      // Ensure totalShares and totalEquity are properly formatted
      ['totalShares', 'totalEquity'].forEach(field => {
        if (data.shareholdersTable[field] && typeof data.shareholdersTable[field] !== 'number' && data.shareholdersTable[field] !== 'N/A') {
          // Try to convert to number if possible
          const numValue = parseFloat(data.shareholdersTable[field]);
          if (!isNaN(numValue)) {
            data.shareholdersTable[field] = numValue;
          } else {
            data.shareholdersTable[field] = 'N/A';
          }
        }
      });

      // Ensure recommendations array exists
      if (!data.shareholdersTable.recommendations || !Array.isArray(data.shareholdersTable.recommendations)) {
        data.shareholdersTable.recommendations = [];
      }
    }

    // Validate directors table
    if (data && data.directorsTable) {
      console.log('Validating directors table...');

      // Ensure directors array exists
      if (!data.directorsTable.directors || !Array.isArray(data.directorsTable.directors)) {
        data.directorsTable.directors = [];
      }

      // Ensure each director has required fields
      data.directorsTable.directors.forEach((director: any, index: number) => {
        if (!director.name) {
          console.log(`Missing name for director at index ${index}. Adding placeholder.`);
          director.name = `Director ${index + 1}`;
        }

        if (!director.position) {
          console.log(`Missing position for director at index ${index}. Adding placeholder.`);
          director.position = 'Director';
        }

        // Ensure shareholding is properly formatted
        if (director.shareholding && typeof director.shareholding !== 'number' && director.shareholding !== 'N/A') {
          // Try to convert to number if possible
          const numValue = parseFloat(director.shareholding);
          if (!isNaN(numValue)) {
            director.shareholding = numValue;
          } else {
            director.shareholding = 'N/A';
          }
        }

        // Ensure otherDirectorships is an array
        if (!director.otherDirectorships || !Array.isArray(director.otherDirectorships)) {
          director.otherDirectorships = [];
        }
      });

      // Ensure recommendations array exists
      if (!data.directorsTable.recommendations || !Array.isArray(data.directorsTable.recommendations)) {
        data.directorsTable.recommendations = [];
      }
    }

    // Validate key business agreements
    if (data && data.keyBusinessAgreements) {
      if (!data.keyBusinessAgreements.agreements || !Array.isArray(data.keyBusinessAgreements.agreements)) {
        data.keyBusinessAgreements.agreements = [];
      }
      if (!data.keyBusinessAgreements.recommendations || !Array.isArray(data.keyBusinessAgreements.recommendations)) {
        data.keyBusinessAgreements.recommendations = [];
      }
    }

    // Validate leave policy
    if (data && data.leavePolicy) {
      if (!data.leavePolicy.policyDetails) {
        data.leavePolicy.policyDetails = { leaveTypes: [] };
      }
      if (!data.leavePolicy.policyDetails.leaveTypes || !Array.isArray(data.leavePolicy.policyDetails.leaveTypes)) {
        data.leavePolicy.policyDetails.leaveTypes = [];
      }
      if (!data.leavePolicy.recommendations || !Array.isArray(data.leavePolicy.recommendations)) {
        data.leavePolicy.recommendations = [];
      }
    }

    // Validate provisions and prepayments
    if (data && data.provisionsAndPrepayments) {
      if (!data.provisionsAndPrepayments.provisions || !Array.isArray(data.provisionsAndPrepayments.provisions)) {
        data.provisionsAndPrepayments.provisions = [];
      }
      if (!data.provisionsAndPrepayments.prepayments || !Array.isArray(data.provisionsAndPrepayments.prepayments)) {
        data.provisionsAndPrepayments.prepayments = [];
      }
      if (!data.provisionsAndPrepayments.recommendations || !Array.isArray(data.provisionsAndPrepayments.recommendations)) {
        data.provisionsAndPrepayments.recommendations = [];
      }
    }

    // Validate deferred tax assets
    if (data && data.deferredTaxAssets) {
      if (!data.deferredTaxAssets.assets || !Array.isArray(data.deferredTaxAssets.assets)) {
        data.deferredTaxAssets.assets = [];
      }
      if (!data.deferredTaxAssets.recommendations || !Array.isArray(data.deferredTaxAssets.recommendations)) {
        data.deferredTaxAssets.recommendations = [];
      }
    }
  }

  /**
   * Extract financial data from documents using Gemini AI
   * @param documentContent Combined document content
   * @param companyName Name of the company
   * @param startupInfo Additional startup information
   * @param investorInfo Additional investor information
   * @returns Extracted financial data
   */
  async extractFinancialData(
    documentContent: string,
    companyName: string,
    startupInfo?: any,
    investorInfo?: any,
    missingDocumentTypes?: string[]
  ): Promise<any> {
    try {
      // Create a prompt for Gemini based on the report type
      let prompt = '';

      // Prepare context information
      const startupContext = startupInfo ? `
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
            ` : '';

      // Prepare missing documents information
      const missingDocumentsContext = missingDocumentTypes && missingDocumentTypes.length > 0 ? `
                MISSING DOCUMENTS:
                The following required financial documents are missing:
                ${missingDocumentTypes.map(type => {
        // Convert document type to readable format
        const readableType = type.replace('financial_', '').replace(/_/g, ' ');
        return `- ${readableType.charAt(0).toUpperCase() + readableType.slice(1)}`;
      }).join('\n                ')}
            ` : '';

      const investorContext = investorInfo ? `
                INVESTOR INFORMATION:
                Name: ${investorInfo.name || 'Not specified'}
                Investment Stage: ${investorInfo.investmentStage || 'Not specified'}
                Investment Size: ${investorInfo.investmentSize || 'Not specified'}
                Sectors: ${Array.isArray(investorInfo.sectors) ? investorInfo.sectors.join(', ') : (investorInfo.sectors || 'Not specified')}
                Location: ${investorInfo.location || 'Not specified'}
                Portfolio: ${Array.isArray(investorInfo.portfolio) ? investorInfo.portfolio.join(', ') : (investorInfo.portfolio || 'Not specified')}
            ` : '';

      prompt = `
                *** IMPORTANT: THIS IS A REPORT THAT SEPARATES FINANCIAL DUE DILIGENCE FROM FORMAL FINANCIAL AUDITING. YOUR ANALYSIS MUST MEET PROFESSIONAL STANDARDS THAT COULD REPLACE THE WORK OF LAWYERS AND CHARTERED ACCOUNTANTS. ***
                WRITE HIGH IMPACT AND ACTIONABLE POINTS AND FINDINGS. DO NOT USE GENERIC OR VAGUE LANGUAGE. WRITE IN A FORMAL, PROFESSIONAL TONE APPROPRIATE FOR A FINANCIAL REPORT.
                THE POINTS MUST BE ACTIONABLE AND SPECIFIC TO ${companyName}. DO NOT USE GENERIC STATEMENTS OR VAGUE LANGUAGE.
                WRITE AS MUCH AS YOU CAN. DO NOT USE SHORT OR VAGUE RESPONSES. BE DETAILED AND THOROUGH. WRITE VERY DETAILED AND THOROUGH RESPONSES.
                GIVE MORE GRAPHS, CHARTS, AND VISUALIZATIONS. USE COLOR-CODED METRICS AND GRAPHS. MAKE IT VISUALLY APPEALING.
                EACH SECTION SHOULD HAVE MAXIMUM DATA.

                *** CRITICAL INSTRUCTION: SEPARATE FINANCIAL DUE DILIGENCE FROM AUDITING ***
                You are a specialized financial analyst and auditor with expertise in Indian company standards and regulations. Your task is to perform TWO DISTINCT ANALYSES for ${companyName}:
                KEEP THE TOTAL RESPONSE LENGTH UNDER 62,536 TOKENS.

                1. FINANCIAL DUE DILIGENCE: Focus on investment worthiness, growth potential, financial health, and business viability
                   - Analyze financial performance, market position, and growth trajectory
                   - Evaluate investment potential and risks
                   - Assess business model sustainability and competitive advantages
                   - Provide insights relevant for investors making investment decisions

                2. FORMAL FINANCIAL AUDITING: Focus on compliance, accuracy, fraud detection, and adherence to accounting standards
                   - Verify compliance with accounting standards and regulatory requirements
                   - Identify potential fraud risks or accounting irregularities
                   - Assess internal controls and financial reporting processes
                   - Provide insights relevant for regulatory compliance and financial accuracy

                Do not use generic or vague language. Write in a formal, professional tone appropriate for a financial report.
                Focus on providing clear, actionable insights and recommendations based on the financial documents provided. Your analysis should be thorough, detailed, and presented in a visually appealing format with color-coded metrics and graphical data.
                WRITE AS MUCH AS YOU CAN. BE VERY DETAILED AND THOROUGH. WRITE VERY DETAILED AND THOROUGH RESPONSES. EVERY SECTION SHOULD HAVE MAXIMUM DATA.
                DO NOT USE SHORT OR VAGUE RESPONSES. WRITE AS MUCH AS YOU CAN. BE DETAILED AND THOROUGH. WRITE VERY DETAILED AND THOROUGH RESPONSES.
                HAVE AS MANY GRAPHS, CHARTS, AND VISUALIZATIONS AS POSSIBLE. USE COLOR-CODED METRICS AND GRAPHS. MAKE IT VISUALLY APPEALING.
                ACT LIKE YOU ARE A FINANCIAL ANALYST AND AUDITOR. AND BE PROFESSIONAL.
                TASK: Analyze the following financial documents for ${companyName} and provide a comprehensive, professional report that CLEARLY SEPARATES financial due diligence analysis from audit findings. Your analysis should be thorough, detailed, and presented in a visually appealing format with color-coded metrics and graphical data. Include data visualizations and charts wherever possible.

                IMPORTANT REPORT STYLE GUIDELINES:
                1. Write in a formal, professional tone appropriate for a financial audit report
                2. Be specific and precise about ${companyName}'s financial situation - avoid generic statements
                3. Frame findings as clear, actionable insights about ${companyName} specifically (e.g., "${companyName} shows deficiencies in cash flow management" rather than "There are cash flow issues")
                4. Use plain language that is easy to understand while maintaining professional standards
                5. For each deficiency or issue identified, clearly state:
                   - The specific problem at ${companyName}
                   - The potential impact on ${companyName}'s financial health
                   - Concrete recommendations tailored to ${companyName}'s situation
                6. Highlight both strengths and weaknesses specific to ${companyName}'s financial position
                7. Make all metrics, ratios, and findings directly relevant to ${companyName}'s industry and business model
                8. Present information as if you are a third-party auditor conducting this analysis for a client interested in ${companyName}

                ${startupContext}
                ${investorContext}
                ${missingDocumentsContext}

                IMPORTANT DOCUMENT ORGANIZATION:
                The document content is organized by document type. Each document type section begins with a header in the format "=== Document Type ===" (e.g., "=== Balance Sheet ===").
                Within each section, individual documents are marked with "--- Document: filename ---".

                Each document includes a metadata section with the following information:
                - Filename: The original name of the document
                - Type: The type of document (e.g., balance sheet, income statement)
                - Description: A description of the document provided by the user
                - Time Period: The time period covered by the document (e.g., Q1 2023, FY 2022)
                - File Format: The format of the document (e.g., PDF, XLSX)
                - Size: The size of the document in MB
                - Created: The date the document was created or uploaded

                Pay special attention to these document type headers and metadata to correctly identify which documents are available.
                For example, if you see a "=== Balance Sheet ===" section, you should NOT report balance sheet as missing.

                USE THE METADATA IN YOUR ANALYSIS:
                - Pay special attention to the Time Period field to understand the timeframe of each document
                - Use the Description field to gain additional context about each document
                - Consider the File Format and Size when assessing document quality
                - If multiple documents of the same type exist, use the Time Period to identify the most recent or relevant ones

                DOCUMENT TYPE HANDLING GUIDELINES:
                - For each document type, extract all relevant financial information with the precision of a professional auditor
                - Balance Sheet: Extract assets, liabilities, equity, and calculate key ratios; verify asset valuation methods and liability recognition
                - Income Statement: Extract revenue, expenses, profits, and calculate profitability ratios; verify revenue recognition policies and expense categorization
                - Cash Flow Statement: Extract operating, investing, and financing cash flows; verify cash flow classification and reconciliation with other statements
                - Tax Documents: Extract GST, income tax, and TDS compliance information; verify tax calculation methods and compliance with latest tax regulations
                - Bank Statements: Extract cash position, major transactions, and cash flow patterns; verify reconciliation with accounting records
                - Financial Projections: Extract growth forecasts and assess reasonableness; verify assumptions and methodologies
                - Audit Reports: Extract key findings, compliance issues, and recommendations; verify implementation of previous audit recommendations
                - Cap Table: Analyze ownership structure, equity distribution, and valuation implications
                - If a document appears to be in a non-standard format, make your best effort to extract relevant information using professional judgment
                - If a document is partially readable or has quality issues, extract what you can and note the limitations with appropriate audit qualifications

                DOCUMENT METADATA ANALYSIS GUIDELINES:
                - Use the Time Period metadata to properly sequence and analyze financial data across time periods
                - For documents covering different time periods, perform trend analysis and highlight significant changes
                - When multiple documents of the same type exist, prioritize the most recent ones while noting historical trends
                - Use the Description metadata to understand the context and purpose of each document
                - If documents have different time periods, clearly indicate this in your analysis (e.g., "Based on Q1 2023 balance sheet...")
                - For documents with quality issues (as noted in metadata or content), acknowledge these limitations in your analysis
                - When analyzing financial projections, clearly state the time period they cover and assess their reasonableness

                FOLLOW THE RESPONSE FORMAT STRICTLY:
                DO NOT DEVIATE FROM THE RESPONSE FORMAT.
                ALWAYS RETURN VALID JSON. WITH CORRECT FORMAT.
                DO NOT INCLUDE ANY EXPLANATIONS OR MARKDOWN FORMATTING.
                FOLLOW THE STRUCTURE AS IT IS.
                DO NOT ADD OR REMOVE ANY FIELDS.
                DO NOT CHANGE THE FIELD NAMES OR TYPES.

                RESPONSE FORMAT: Return ONLY valid JSON with this exact structure:
                {
                  "reportCalculated": true or false, // IMPORTANT: Set to true if you were able to extract meaningful financial data, false otherwise
                  "reportType": "Financial Due Diligence and Audit Report", // Always include this exact title
                  "executiveSummary": {
                    "headline": "Brief headline summarizing the financial health",
                    "summary": "Detailed summary of financial analysis and audit findings",
                    "keyFindings": ["Key finding 1", "Key finding 2", "Key finding 3", "Key finding 4", "Key finding 5"],
                    "recommendedActions": ["Action 1", "Action 2", "Action 3", "Action 4", "Action 5"],
                    "keyMetrics": [
                      {
                        "name": "Key metric name",
                        "value": "Metric value",
                        "status": "good" or "warning" or "critical",
                        "description": "Brief description of the metric",
                        "trend": "Any trend description (e.g., increasing, decreasing, stable, improving, deteriorating, N/A)",
                        "percentChange": "Percentage change from previous period (e.g., +15%)",
                        "chartData": {
                          "type": "line" or "bar" or "pie", // Type of chart that would best represent this data
                          "labels": ["Period 1", "Period 2", "Period 3"], // Time periods or categories
                          "datasets": [
                            {
                              "label": "Dataset label",
                              "data": [value1, value2, value3], // Numeric values for each period
                              "backgroundColor": ["#4CAF50", "#FFC107", "#F44336"] // Suggested colors (green, yellow, red)
                            }
                          ]
                        }
                      }
                    ],
                    "dueDiligenceSummary": {
                      "investmentWorthiness": "high" or "medium" or "low",
                      "statement": "Summary statement about investment worthiness",
                      "keyStrengths": ["Strength 1", "Strength 2"],
                      "keyRisks": ["Risk 1", "Risk 2"]
                    },
                    "auditOpinion": {
                      "type": "unqualified" or "qualified" or "adverse" or "disclaimer", // Professional audit opinion type
                      "statement": "Professional audit opinion statement",
                      "qualifications": ["Qualification 1", "Qualification 2"] // Only if qualified, adverse, or disclaimer
                    }
                  },
                  "financialAnalysis": {
                    "overview": "Comprehensive overview of the financial analysis",
                    "metrics": [
                      {
                        "name": "Metric name",
                        "value": "Metric value",
                        "status": "good" or "warning" or "critical",
                        "description": "Brief description of the metric",
                        "trend": "Any trend description (e.g., increasing, decreasing, stable, improving, deteriorating, N/A)",
                        "percentChange": "Percentage change from previous period (e.g., +15%)",
                        "industryComparison": "above_average" or "average" or "below_average" or "N/A",
                        "industryValue": "Industry average value",
                        "chartData": {
                          "type": "line" or "bar" or "pie", // Type of chart that would best represent this data
                          "labels": ["Period 1", "Period 2", "Period 3"], // Time periods or categories
                          "datasets": [
                            {
                              "label": "Dataset label",
                              "data": [value1, value2, value3], // Numeric values for each period
                              "backgroundColor": ["#4CAF50", "#FFC107", "#F44336"] // Suggested colors (green, yellow, red)
                            }
                          ]
                        }
                      }
                    ],
                    "trends": [
                      {
                        "name": "Trend name",
                        "description": "Description of the trend",
                        "trend": "Any trend description (e.g., increasing, decreasing, stable, improving, deteriorating)",
                        "impact": "positive" or "negative" or "neutral",
                        "data": [
                          {"period": "Period 1 (e.g., Q1 2023)", "value": numeric value or "N/A"},
                          {"period": "Period 2 (e.g., Q2 2023)", "value": numeric value or "N/A"},
                          {"period": "Period 3 (e.g., Q3 2023)", "value": numeric value or "N/A"}
                        ],
                        "chartData": {
                          "type": "line" or "bar" or "pie", // Type of chart that would best represent this data
                          "labels": ["Period 1", "Period 2", "Period 3"], // Time periods or categories
                          "datasets": [
                            {
                              "label": "Dataset label",
                              "data": [value1, value2, value3], // Numeric values for each period
                              "backgroundColor": ["#4CAF50", "#FFC107", "#F44336"] // Suggested colors
                            }
                          ]
                        }
                              "borderColor": "#2196F3", // Suggested color for line charts
                              "backgroundColor": "rgba(33, 150, 243, 0.2)" // Suggested background color with transparency
                            }
                          ]
                        }
                      }
                    ],
                    "growthProjections": [
                      {
                        "metric": "Metric name (e.g., Revenue, Profit)",
                        "currentValue": numeric value or "N/A",
                        "projectedValue": numeric value or "N/A",
                        "timeframe": "Timeframe (e.g., 1 year, 3 years)",
                        "cagr": "Compound Annual Growth Rate (e.g., 12.5%)",
                        "confidence": "high" or "medium" or "low",
                        "chartData": {
                          "type": "bar" or "line", // Type of chart that would best represent this projection
                          "labels": ["Current", "Year 1", "Year 2", "Year 3"], // Projection periods
                          "datasets": [
                            {
                              "label": "Projected Growth",
                              "data": [currentValue, year1Value, year2Value, year3Value], // Numeric values for each period
                              "backgroundColor": ["#9C27B0", "#9C27B0", "#9C27B0", "#9C27B0"] // Suggested color for projections
                            }
                          ]
                        }
                      }
                    ],
                    "financialHealthScore": {
                      "score": numeric value between 0 and 100,
                      "rating": "Excellent" or "Good" or "Fair" or "Poor" or "Critical",
                      "description": "Description of the financial health score",
                      "components": [
                        {
                          "category": "Category name (e.g., Liquidity, Profitability)",
                          "score": numeric value between 0 and 100,
                          "weight": numeric value between 0 and 1 (sum of all weights should be 1)
                        }
                      ],
                      "chartData": {
                        "type": "radar", // Radar chart for financial health components
                        "labels": ["Liquidity", "Profitability", "Solvency", "Efficiency", "Growth"],
                        "datasets": [
                          {
                            "label": "Company Score",
                            "data": [score1, score2, score3, score4, score5], // Scores for each component
                            "backgroundColor": "rgba(33, 150, 243, 0.2)",
                            "borderColor": "#2196F3"
                          },
                          {
                            "label": "Industry Average",
                            "data": [avg1, avg2, avg3, avg4, avg5], // Industry average scores
                            "backgroundColor": "rgba(156, 39, 176, 0.2)",
                            "borderColor": "#9C27B0"
                          }
                        ]
                      }
                    }
                  },
                  "recommendations": [
                    "Recommendation 1",
                    "Recommendation 2",
                    "Recommendation 3",
                    "Recommendation 4",
                    "Recommendation 5"
                  ],
                  "riskFactors": [
                    {
                      "category": "Risk category",
                      "level": "high" or "medium" or "low",
                      "description": "Description of risk",
                      "impact": "Potential impact",
                      "mitigationStrategy": "Suggested mitigation strategy",
                      "timeHorizon": "short_term" or "medium_term" or "long_term"
                    }
                  ],
                  "complianceItems": [
                    {
                      "requirement": "Compliance requirement",
                      "status": "compliant" or "partial" or "non-compliant", // IMPORTANT: Only these three values are allowed - do NOT use "unknown" or any other value
                      "details": "Details about compliance status",
                      "severity": "high" or "medium" or "low",
                      "recommendation": "Recommendation to address compliance issue",
                      "deadline": "Suggested deadline for compliance (if applicable)",
                      "regulatoryBody": "Relevant regulatory body (e.g., SEBI, MCA)"
                    }
                  ],
                  "financialStatements": {
                    "balanceSheet": {
                      "assets": {...},
                      "liabilities": {...},
                      "equity": {...},
                      "yearOverYearChange": {
                        "assets": "Percentage change",
                        "liabilities": "Percentage change",
                        "equity": "Percentage change"
                      }
                    },
                    "incomeStatement": {
                      "revenue": numeric value or "N/A",
                      "costOfGoodsSold": numeric value or "N/A",
                      "grossProfit": numeric value or "N/A",
                      "operatingExpenses": numeric value or "N/A",
                      "operatingIncome": numeric value or "N/A",
                      "netIncome": numeric value or "N/A",
                      "yearOverYearChange": {
                        "revenue": "Percentage change",
                        "grossProfit": "Percentage change",
                        "netIncome": "Percentage change"
                      }
                    },
                    "cashFlow": {
                      "operatingActivities": numeric value or "N/A",
                      "investingActivities": numeric value or "N/A",
                      "financingActivities": numeric value or "N/A",
                      "netCashFlow": numeric value or "N/A",
                      "yearOverYearChange": {
                        "operatingActivities": "Percentage change",
                        "netCashFlow": "Percentage change"
                      }
                    }
                  },
                  "ratioAnalysis": {
                    "overview": "Overview of the ratio analysis with key insights",
                    "liquidityRatios": [
                      {
                        "name": "Ratio name",
                        "value": numeric value or "N/A",
                        "formula": "Formula used to calculate the ratio",
                        "industry_average": numeric value or "N/A",
                        "description": "Description of ratio",
                        "interpretation": "Professional interpretation of the ratio value",
                        "status": "good" or "warning" or "critical",
                        "trend": "Any trend description (e.g., improving, stable, deteriorating, increasing, decreasing)",
                        "historicalData": [
                          {"period": "Period 1", "value": numeric value or "N/A"},
                          {"period": "Period 2", "value": numeric value or "N/A"}
                        ],
                        "chartData": {
                          "type": "line", // Type of chart that would best represent this ratio
                          "labels": ["Period 1", "Period 2", "Period 3"], // Time periods
                          "datasets": [
                            {
                              "label": "Company Ratio",
                              "data": [value1, value2, value3], // Numeric values for each period
                              "borderColor": "#2196F3",
                              "backgroundColor": "rgba(33, 150, 243, 0.2)"
                            },
                            {
                              "label": "Industry Average",
                              "data": [avg1, avg2, avg3], // Industry average values
                              "borderColor": "#9C27B0",
                              "backgroundColor": "rgba(156, 39, 176, 0.2)",
                              "borderDash": [5, 5] // Dashed line for industry average
                            }
                          ]
                        }
                      }
                    ],
                    "profitabilityRatios": [
                      {
                        "name": "Ratio name",
                        "value": numeric value or "N/A",
                        "formula": "Formula used to calculate the ratio",
                        "industry_average": numeric value or "N/A",
                        "description": "Description of ratio",
                        "interpretation": "Professional interpretation of the ratio value",
                        "status": "good" or "warning" or "critical",
                        "trend": "Any trend description (e.g., improving, stable, deteriorating, increasing, decreasing)",
                        "historicalData": [
                          {"period": "Period 1", "value": numeric value or "N/A"},
                          {"period": "Period 2", "value": numeric value or "N/A"}
                        ],
                        "chartData": {
                          "type": "line", // Type of chart that would best represent this ratio
                          "labels": ["Period 1", "Period 2", "Period 3"], // Time periods
                          "datasets": [
                            {
                              "label": "Company Ratio",
                              "data": [value1, value2, value3], // Numeric values for each period
                              "borderColor": "#4CAF50",
                              "backgroundColor": "rgba(76, 175, 80, 0.2)"
                            },
                            {
                              "label": "Industry Average",
                              "data": [avg1, avg2, avg3], // Industry average values
                              "borderColor": "#9C27B0",
                              "backgroundColor": "rgba(156, 39, 176, 0.2)",
                              "borderDash": [5, 5] // Dashed line for industry average
                            }
                          ]
                        }
                      }
                    ],
                    "solvencyRatios": [
                      {
                        "name": "Ratio name",
                        "value": numeric value or "N/A",
                        "formula": "Formula used to calculate the ratio",
                        "industry_average": numeric value or "N/A",
                        "description": "Description of ratio",
                        "interpretation": "Professional interpretation of the ratio value",
                        "status": "good" or "warning" or "critical",
                        "trend": "Any trend description (e.g., improving, stable, deteriorating, increasing, decreasing)",
                        "historicalData": [
                          {"period": "Period 1", "value": numeric value or "N/A"},
                          {"period": "Period 2", "value": numeric value or "N/A"}
                        ],
                        "chartData": {
                          "type": "line", // Type of chart that would best represent this ratio
                          "labels": ["Period 1", "Period 2", "Period 3"], // Time periods
                          "datasets": [
                            {
                              "label": "Company Ratio",
                              "data": [value1, value2, value3], // Numeric values for each period
                              "borderColor": "#FF9800",
                              "backgroundColor": "rgba(255, 152, 0, 0.2)"
                            },
                            {
                              "label": "Industry Average",
                              "data": [avg1, avg2, avg3], // Industry average values
                              "borderColor": "#9C27B0",
                              "backgroundColor": "rgba(156, 39, 176, 0.2)",
                              "borderDash": [5, 5] // Dashed line for industry average
                            }
                          ]
                        }
                      }
                    ],
                    "efficiencyRatios": [
                      {
                        "name": "Ratio name",
                        "value": numeric value or "N/A",
                        "formula": "Formula used to calculate the ratio",
                        "industry_average": numeric value or "N/A",
                        "description": "Description of ratio",
                        "interpretation": "Professional interpretation of the ratio value",
                        "status": "good" or "warning" or "critical",
                        "trend": "Any trend description (e.g., improving, stable, deteriorating, increasing, decreasing)",
                        "historicalData": [
                          {"period": "Period 1", "value": numeric value or "N/A"},
                          {"period": "Period 2", "value": numeric value or "N/A"}
                        ],
                        "chartData": {
                          "type": "line", // Type of chart that would best represent this ratio
                          "labels": ["Period 1", "Period 2", "Period 3"], // Time periods
                          "datasets": [
                            {
                              "label": "Company Ratio",
                              "data": [value1, value2, value3], // Numeric values for each period
                              "borderColor": "#9C27B0",
                              "backgroundColor": "rgba(156, 39, 176, 0.2)"
                            },
                            {
                              "label": "Industry Average",
                              "data": [avg1, avg2, avg3], // Industry average values
                              "borderColor": "#607D8B",
                              "backgroundColor": "rgba(96, 125, 139, 0.2)",
                              "borderDash": [5, 5] // Dashed line for industry average
                            }
                          ]
                        }
                      }
                    ],
                    "ratioComparisonChart": {
                      "type": "radar", // Radar chart for comparing all ratio categories
                      "labels": ["Liquidity", "Profitability", "Solvency", "Efficiency"],
                      "datasets": [
                        {
                          "label": "Company Performance",
                          "data": [liquidityScore, profitabilityScore, solvencyScore, efficiencyScore], // Normalized scores (0-100)
                          "backgroundColor": "rgba(33, 150, 243, 0.2)",
                          "borderColor": "#2196F3"
                        },
                        {
                          "label": "Industry Average",
                          "data": [industryLiquidityScore, industryProfitabilityScore, industrySolvencyScore, industryEfficiencyScore], // Industry average scores
                          "backgroundColor": "rgba(156, 39, 176, 0.2)",
                          "borderColor": "#9C27B0"
                        }
                      ]
                    }
                  },
                  "taxCompliance": {
                    "gst": {
                      "status": "compliant" or "partial" or "non-compliant", // IMPORTANT: Only these three values are allowed - do NOT use "unknown" or any other value
                      "details": "Details about GST compliance",
                      "filingHistory": [
                        {"period": "Period", "status": "filed" or "pending" or "overdue", "dueDate": "Due date"}
                      ],
                      "recommendations": ["Recommendation 1", "Recommendation 2"]
                    },
                    "incomeTax": {
                      "status": "compliant" or "partial" or "non-compliant", // IMPORTANT: Only these three values are allowed - do NOT use "unknown" or any other value
                      "details": "Details about income tax compliance",
                      "filingHistory": [
                        {"period": "Period", "status": "filed" or "pending" or "overdue", "dueDate": "Due date"}
                      ],
                      "recommendations": ["Recommendation 1", "Recommendation 2"]
                    },
                    "tds": {
                      "status": "compliant" or "partial" or "non-compliant", // IMPORTANT: Only these three values are allowed - do NOT use "unknown" or any other value
                      "details": "Details about TDS compliance",
                      "filingHistory": [
                        {"period": "Period", "status": "filed" or "pending" or "overdue", "dueDate": "Due date"}
                      ],
                      "recommendations": ["Recommendation 1", "Recommendation 2"]
                    }
                  },
                  "auditFindings": {
                    "auditScope": "Description of the scope of the audit",
                    "auditMethodology": "Description of the audit methodology used",
                    "auditStandards": ["Relevant Indian Accounting Standard 1", "Relevant Indian Accounting Standard 2"],
                    "findings": [
                      {
                        "area": "Area of finding",
                        "severity": "high" or "medium" or "low",
                        "description": "Description of finding",
                        "recommendation": "Recommendation to address finding",
                        "impact": "Financial or operational impact",
                        "timelineToResolve": "Suggested timeline to resolve",
                        "regulatoryImplications": "Potential regulatory implications",
                        "financialImpact": numeric value or "Not quantifiable",
                        "status": "new" or "recurring" or "resolved"
                      }
                    ],
                    "overallAssessment": "Overall assessment of audit findings",
                    "complianceScore": "Score out of 100",
                    "keyStrengths": ["Strength 1", "Strength 2"],
                    "keyWeaknesses": ["Weakness 1", "Weakness 2"],
                    "materialWeaknesses": [
                      {
                        "area": "Area with material weakness",
                        "description": "Description of the material weakness",
                        "impact": "Impact on financial reporting",
                        "remediation": "Recommended remediation steps"
                      }
                    ],
                    "internalControlAssessment": {
                      "overview": "Overview of internal control assessment",
                      "controlEnvironment": "Assessment of control environment",
                      "riskAssessment": "Assessment of risk assessment processes",
                      "controlActivities": "Assessment of control activities",
                      "informationAndCommunication": "Assessment of information and communication systems",
                      "monitoring": "Assessment of monitoring activities",
                      "significantDeficiencies": [
                        {
                          "area": "Area with significant deficiency",
                          "description": "Description of the deficiency",
                          "impact": "Impact on financial reporting",
                          "recommendation": "Recommendation to address the deficiency"
                        }
                      ]
                    },
                    "findingsByCategory": {
                      "type": "pie", // Pie chart for findings by category
                      "labels": ["Financial Reporting", "Regulatory Compliance", "Operational", "IT Controls", "Governance"],
                      "datasets": [
                        {
                          "data": [count1, count2, count3, count4, count5], // Count of findings in each category
                          "backgroundColor": ["#F44336", "#FF9800", "#FFEB3B", "#4CAF50", "#2196F3"]
                        }
                      ]
                    },
                    "findingsBySeverity": {
                      "type": "bar", // Bar chart for findings by severity
                      "labels": ["High", "Medium", "Low"],
                      "datasets": [
                        {
                          "label": "Number of Findings",
                          "data": [highCount, mediumCount, lowCount], // Count of findings by severity
                          "backgroundColor": ["#F44336", "#FF9800", "#4CAF50"]
                        }
                      ]
                    }
                  },
                  "documentAnalysis": {
                    "availableDocuments": [
                      {
                        "documentType": "Document type name",
                        "quality": "good" or "moderate" or "poor",
                        "completeness": "complete" or "partial" or "incomplete",
                        "keyInsights": ["Detailed financial insight 1 about specific numbers/metrics in this document", "Detailed financial insight 2 about specific numbers/metrics in this document"],
                        "dataReliability": "high" or "medium" or "low" or "N/A",
                        "financialHighlights": ["Key financial figure 1: value with context", "Key financial figure 2: value with context"],
                        "redFlags": ["Specific financial concern 1 with details", "Specific financial concern 2 with details"],
                        "recommendations": ["Specific recommendation for improving financial data quality"]
                      }
                    ],
                    "missingDocuments": {
                      "list": ["Document type 1", "Document type 2"],
                      "impact": "Detailed description of how missing documents impact specific financial analysis areas",
                      "recommendations": ["Specific recommendation for obtaining missing financial documents"],
                      "priorityLevel": "high" or "medium" or "low"
                    }
                  },
                  "documentContentAnalysis": {
                    "overview": "Comprehensive overview of the financial content analysis findings across all documents",
                    "dueDiligenceFindings": {
                      "summary": "Detailed summary of financial due diligence findings with specific metrics and figures from document content",
                      "keyInsights": ["Specific financial insight with exact figures and time periods", "Detailed analysis of financial performance with exact metrics"],
                      "investmentImplications": ["Specific investment implication with financial reasoning and data points", "Detailed ROI/valuation analysis with supporting figures"],
                      "growthIndicators": ["Specific growth metric with exact figures and comparison to industry standards", "Detailed trend analysis with percentage changes over time"],
                      "riskFactors": ["Specific financial risk with quantified potential impact", "Detailed analysis of financial vulnerability with supporting data"]
                    },
                    "auditFindings": {
                      "summary": "Detailed summary of audit findings with specific accounting issues identified in the documents",
                      "complianceIssues": ["Specific compliance issue with exact regulatory requirement and financial impact", "Detailed analysis of compliance gap with recommended remediation"],
                      "accountingConcerns": ["Specific accounting concern with exact figures and GAAP/Ind AS reference", "Detailed analysis of accounting treatment with financial impact"],
                      "internalControlWeaknesses": ["Specific internal control weakness with financial process affected and risk quantification", "Detailed control gap analysis with recommended improvements"],
                      "fraudRiskIndicators": ["Specific fraud risk indicator with exact suspicious patterns/transactions", "Detailed analysis of potential fraud risk with financial impact"]
                    },
                    "documentSpecificAnalysis": [
                      {
                        "documentType": "Document type name",
                        "contentSummary": "Detailed summary of the document's financial content with time period and key figures",
                        "dueDiligenceInsights": ["Specific financial insight from this document with exact figures and implications", "Detailed analysis of financial performance metrics from this document"],
                        "auditInsights": ["Specific audit insight from this document with accounting standards reference", "Detailed analysis of financial reporting quality from this document"],
                        "keyFinancialData": ["Specific financial figure: exact value with context and trend", "Key ratio: exact value with industry comparison and interpretation"],
                        "inconsistencies": ["Specific inconsistency between figures with exact values and locations", "Detailed analysis of data discrepancy with potential causes"],
                        "recommendations": ["Specific recommendation based on document content with expected financial impact", "Detailed improvement suggestion with implementation steps"]
                      }
                    ]
                  },
                  "industryBenchmarking": {
                    "overview": "Overview of industry benchmarking",
                    "industryContext": "Description of the industry context and trends",
                    "peerComparison": "Analysis of how the company compares to direct peers",
                    "metrics": [
                      {
                        "name": "Metric name",
                        "companyValue": numeric value or "N/A",
                        "industryAverage": numeric value or "N/A",
                        "percentile": "Percentile within industry (e.g., 75th)",
                        "status": "above_average" or "average" or "below_average" or "N/A",
                        "interpretation": "Professional interpretation of the company's position",
                        "chartData": {
                          "type": "bar", // Bar chart for company vs industry comparison
                          "labels": ["Company", "Industry Average", "Top Quartile", "Bottom Quartile"],
                          "datasets": [
                            {
                              "label": "Metric Values",
                              "data": [companyValue, industryAvg, topQuartile, bottomQuartile], // Values for comparison
                              "backgroundColor": ["#2196F3", "#9C27B0", "#4CAF50", "#F44336"]
                            }
                          ]
                        }
                      }
                    ],
                    "competitivePosition": "Description of competitive position",
                    "marketShareAnalysis": "Analysis of the company's market share and positioning",
                    "strengths": ["Strength 1", "Strength 2"],
                    "challenges": ["Challenge 1", "Challenge 2"],
                    "opportunities": ["Opportunity 1", "Opportunity 2"],
                    "threats": ["Threat 1", "Threat 2"],
                    "industryOutlook": "Outlook for the industry over the next 1-3 years",
                    "benchmarkingCharts": {
                      "financialPerformance": {
                        "type": "radar", // Radar chart for financial performance benchmarking
                        "labels": ["Revenue Growth", "Profit Margin", "ROI", "Cash Flow", "Debt Ratio"],
                        "datasets": [
                          {
                            "label": "Company",
                            "data": [companyScore1, companyScore2, companyScore3, companyScore4, companyScore5], // Normalized scores (0-100)
                            "backgroundColor": "rgba(33, 150, 243, 0.2)",
                            "borderColor": "#2196F3"
                          },
                          {
                            "label": "Industry Average",
                            "data": [industryScore1, industryScore2, industryScore3, industryScore4, industryScore5], // Industry average scores
                            "backgroundColor": "rgba(156, 39, 176, 0.2)",
                            "borderColor": "#9C27B0"
                          },
                          {
                            "label": "Top Performers",
                            "data": [topScore1, topScore2, topScore3, topScore4, topScore5], // Top performers scores
                            "backgroundColor": "rgba(76, 175, 80, 0.2)",
                            "borderColor": "#4CAF50"
                          }
                        ]
                      },
                      "operationalEfficiency": {
                        "type": "radar", // Radar chart for operational efficiency benchmarking
                        "labels": ["Asset Turnover", "Inventory Turnover", "Receivables Turnover", "Employee Productivity", "Operating Cycle"],
                        "datasets": [
                          {
                            "label": "Company",
                            "data": [companyScore1, companyScore2, companyScore3, companyScore4, companyScore5], // Normalized scores (0-100)
                            "backgroundColor": "rgba(33, 150, 243, 0.2)",
                            "borderColor": "#2196F3"
                          },
                          {
                            "label": "Industry Average",
                            "data": [industryScore1, industryScore2, industryScore3, industryScore4, industryScore5], // Industry average scores
                            "backgroundColor": "rgba(156, 39, 176, 0.2)",
                            "borderColor": "#9C27B0"
                          }
                        ]
                      }
                    }
                  },
                  "legalAndRegulatoryCompliance": {
                    "overview": "Overview of legal and regulatory compliance",
                    "complianceAreas": [
                      {
                        "area": "Area name (e.g., Companies Act, GST, Income Tax)",
                        "status": "compliant" or "partial" or "non-compliant", // IMPORTANT: Only these three values are allowed - do NOT use "unknown" or any other value
                        "description": "Description of compliance status",
                        "risks": ["Risk 1", "Risk 2"],
                        "recommendations": ["Recommendation 1", "Recommendation 2"],
                        "deadlines": "Upcoming compliance deadlines"
                      }
                    ],
                    "pendingLegalMatters": [
                      {
                        "matter": "Description of legal matter",
                        "status": "pending" or "resolved" or "in_progress",
                        "potentialImpact": "Description of potential impact",
                        "recommendedAction": "Recommended action"
                      }
                    ],
                    "complianceChart": {
                      "type": "pie", // Pie chart for compliance status
                      "labels": ["Compliant", "Partial", "Non-compliant"],
                      "datasets": [
                        {
                          "data": [compliantCount, partialCount, nonCompliantCount], // Count of compliance areas by status
                          "backgroundColor": ["#4CAF50", "#FF9800", "#F44336"]
                        }
                      ]
                    }
                  },
                  "shareholdersTable": {
                    "overview": "Overview of the company's shareholding structure",
                    "shareholders": [
                      {
                        "name": "Shareholder name",
                        "equityPercentage": numeric value or "N/A",
                        "shareCount": numeric value or "N/A",
                        "faceValue": numeric value or "N/A",
                        "investmentAmount": numeric value or "N/A",
                        "shareClass": "Share class (e.g., Equity, Preference)",
                        "votingRights": "Description of voting rights",
                        "notes": "Additional notes about this shareholder"
                      }
                    ],
                    "totalShares": numeric value or "N/A",
                    "totalEquity": numeric value or "N/A",
                    "analysis": "Detailed analysis of the shareholding structure",
                    "recommendations": ["Recommendation 1", "Recommendation 2"]
                  },
                  "directorsTable": {
                    "overview": "Overview of the company's board of directors",
                    "directors": [
                      {
                        "name": "Director name",
                        "position": "Position/designation",
                        "appointmentDate": "Date of appointment",
                        "din": "Director Identification Number",
                        "shareholding": numeric value or "N/A",
                        "expertise": "Area of expertise/background",
                        "otherDirectorships": ["Company 1", "Company 2"],
                        "notes": "Additional notes about this director"
                      }
                    ],
                    "analysis": "Detailed analysis of the board composition",
                    "recommendations": ["Recommendation 1", "Recommendation 2"]
                  },
                  "keyBusinessAgreements": {
                    "overview": "Overview of key business agreements",
                    "agreements": [
                      {
                        "agreementType": "Type of agreement",
                        "parties": ["Party 1", "Party 2"],
                        "effectiveDate": "Effective date",
                        "expiryDate": "Expiry date",
                        "keyTerms": ["Key term 1", "Key term 2"],
                        "financialImpact": "Description of financial impact",
                        "risks": ["Risk 1", "Risk 2"],
                        "notes": "Additional notes about this agreement"
                      }
                    ],
                    "analysis": "Detailed analysis of the business agreements",
                    "recommendations": ["Recommendation 1", "Recommendation 2"]
                  },
                  "leavePolicy": {
                    "overview": "Overview of the company's leave policy",
                    "policyDetails": {
                      "leaveTypes": [
                        {
                          "type": "Type of leave",
                          "entitlement": "Entitlement details",
                          "carryForward": "Carry forward policy",
                          "encashment": "Encashment policy",
                          "conditions": "Conditions for availing"
                        }
                      ],
                      "complianceStatus": "Compliance status with labor laws",
                      "financialImplications": "Financial implications of the leave policy"
                    },
                    "analysis": "Detailed analysis of the leave policy",
                    "recommendations": ["Recommendation 1", "Recommendation 2"]
                  },
                  "provisionsAndPrepayments": {
                    "overview": "Overview of provisions and prepayments",
                    "provisions": [
                      {
                        "type": "Type of provision",
                        "amount": numeric value or "N/A",
                        "purpose": "Purpose of provision",
                        "accountingTreatment": "Accounting treatment",
                        "adequacy": "Assessment of adequacy",
                        "notes": "Additional notes"
                      }
                    ],
                    "prepayments": [
                      {
                        "type": "Type of prepayment",
                        "amount": numeric value or "N/A",
                        "period": "Period covered",
                        "amortizationSchedule": "Amortization schedule",
                        "notes": "Additional notes"
                      }
                    ],
                    "analysis": "Detailed analysis of provisions and prepayments",
                    "recommendations": ["Recommendation 1", "Recommendation 2"]
                  },
                  "deferredTaxAssets": {
                    "overview": "Overview of deferred tax assets",
                    "assets": [
                      {
                        "type": "Type of deferred tax asset",
                        "amount": numeric value or "N/A",
                        "origin": "Origin/source",
                        "expectedUtilization": "Expected utilization timeline",
                        "recoverability": "Assessment of recoverability",
                        "notes": "Additional notes"
                      }
                    ],
                    "analysis": "Detailed analysis of deferred tax position",
                    "recommendations": ["Recommendation 1", "Recommendation 2"]
                  }
                }

                COMPREHENSIVE DUE DILIGENCE AND AUDIT GUIDELINES:
                - *** CRITICAL: This report MUST meet professional standards that could replace the work of lawyers and chartered accountants ***
                - Set "reportCalculated" to true ONLY if you were able to extract meaningful financial data and generate a useful report
                - Set "reportCalculated" to false if you cannot extract sufficient financial information from the documents
                - Even if reportCalculated is false, still provide as much analysis as possible with the available data
                - NEVER leave the report empty - always provide some analysis even if limited
                - *** IMPORTANT: For ALL compliance status fields, ONLY use "compliant", "partial", or "non-compliant" values - NEVER use "unknown" or any other values ***
                - Include a formal audit opinion section that follows professional auditing standards
                - Provide a professional, detailed executive summary with key findings and recommended actions
                - Focus on key financial indicators, trends, and growth metrics with color-coded status indicators
                - Include data visualizations and charts for all key metrics and trends
                - Identify strengths, weaknesses, and areas for improvement with specific, actionable recommendations
                - Evaluate compliance with Indian accounting standards and regulations in detail
                - Assess internal controls and financial reporting processes with specific findings
                - Identify potential fraud risks and irregularities with severity ratings
                - Verify accuracy and completeness of financial statements with detailed analysis
                - Evaluate tax compliance (GST, Income Tax, TDS) with specific recommendations
                - Provide detailed recommendations for improving financial governance
                - Evaluate financial health, profitability, liquidity, and solvency with industry benchmarks
                - Assess growth potential and investment opportunities with projected returns
                - Include historical data and trends wherever possible to show performance over time
                - Provide industry benchmarking to show how the company compares to peers
                - Include growth projections based on historical performance and industry trends
                - Include a detailed analysis of available documents in the documentAnalysis section
                - For each available document, go beyond assessing quality and completeness - analyze the actual financial content
                - Extract specific financial figures, metrics, ratios, and trends from each document
                - Identify key financial highlights that reveal the company's true financial position
                - Flag any concerning financial indicators or red flags found in the document content
                - Provide specific insights about what the financial data in each document reveals about the company
                - For missing documents, explain specifically how this impacts particular financial analysis areas
                - Ensure all metrics have appropriate status indicators (good/warning/critical)
                - Include percentage changes and trends for all key metrics
                - Provide detailed ratio analysis with industry comparisons
                - Include specific, actionable recommendations for improvement
                - Provide a comprehensive legal and regulatory compliance assessment
                - Include a financial health score with detailed breakdown of components is
                - Provide a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats)
                - Include radar charts comparing company performance to industry benchmarks
                - Provide trend analysis with line charts showing historical performance
                - Include bar charts comparing key metrics to industry averages
                - Provide pie charts showing breakdowns of key financial components
                - Include a formal audit findings section with material weaknesses and significant deficiencies
                - Provide a detailed internal control assessment following professional auditing standards
                - Include a formal audit methodology section describing the approach used

                ENTITY-SPECIFIC REPORTING GUIDELINES:
                - Always refer to ${companyName} by name throughout the report
                - For each finding, clearly state: "${companyName} exhibits [specific issue]" rather than using generic language
                - When describing deficiencies, be precise: "${companyName}'s accounts receivable turnover ratio is significantly below industry standards at X days compared to the industry average of Y days"
                - For recommendations, be specific: "${companyName} should implement [specific action] to address [specific issue]"
                - When highlighting strengths, be concrete: "${companyName} demonstrates strong [specific area] as evidenced by [specific metric]"
                - For risk factors, clearly state: "${companyName} faces [specific risk] due to [specific factor]"
                - For compliance issues, be direct: "${companyName} is non-compliant with [specific requirement]"
                - For financial metrics, provide context: "${companyName}'s [metric] of [value] is [comparison] to the industry average of [value]"
                - For audit findings, be explicit: "Our audit of ${companyName} identified [specific finding]"
                - For each recommendation, explain the expected benefit: "By implementing [recommendation], ${companyName} could improve [specific area] by approximately [estimated impact]"

                TREND ANALYSIS GUIDELINES:
                - GENERATE AT LEAST 6-8 DIFFERENT FINANCIAL TREND GRAPHS covering various aspects of financial performance
                - EACH TREND MUST INCLUDE CHART DATA with appropriate visualization type (line, bar, etc.)
                - Include the following ESSENTIAL FINANCIAL TRENDS (with monthly or quarterly data points):
                  * Revenue Growth Trend
                  * EBITDA/Profit Margin Trend
                  * Cash Flow Trend
                  * Burn Rate Trend
                  * Customer Acquisition Cost (CAC) Trend
                  * Lifetime Value (LTV) Trend
                  * Debt-to-Equity Ratio Trend
                  * Working Capital Trend
                  * Accounts Receivable/Payable Trend
                  * Operational Efficiency Metrics Trend
                - Use any appropriate term to describe trends (increasing, decreasing, stable, improving, deteriorating, etc.)
                - Be consistent in your terminology within each section
                - For financial metrics, use terms like "increasing", "decreasing", "stable", "volatile", "improving", "deteriorating"
                - For ratios, use terms like "improving", "stable", "deteriorating", "strengthening", "weakening"
                - Always explain the significance of the trend in the context of ${companyName}'s financial health
                - Indicate whether a trend is positive or negative for ${companyName} specifically
                - Compare ${companyName}'s trends to industry standards where possible
                - Highlight any unusual or concerning trends specific to ${companyName}'s financial data
                - Explain potential causes for significant trends observed in ${companyName}'s financial statements
                - Provide forward-looking implications of current trends for ${companyName}'s future performance
                - ENSURE EACH TREND HAS COMPLETE CHART DATA with appropriate labels, datasets, and colors

                DOCUMENT CONTENT ANALYSIS AND SEPARATE FINANCIAL DD & AUDITING:
                - For each of ${companyName}'s documents, perform an EXTREMELY DETAILED ANALYSIS OF THE FINANCIAL CONTENT with specific figures and metrics
                - SEPARATE FINANCIAL DUE DILIGENCE from AUDITING in your analysis with clear distinction:
                  * FINANCIAL DUE DILIGENCE: Focus on investment worthiness, growth potential, financial health, and business viability with specific ROI calculations and valuation metrics
                  * AUDITING: Focus on compliance, accuracy, fraud detection, and adherence to accounting standards with specific references to Indian accounting standards

                - DOCUMENT-SPECIFIC FINANCIAL ANALYSIS REQUIREMENTS:
                  * Balance Sheet: Extract and analyze specific asset values, liability amounts, equity position, debt structure, working capital, and key financial ratios
                  * Income Statement: Extract and analyze revenue figures, expense breakdowns, profit margins, operating efficiency, and year-over-year growth rates
                  * Cash Flow Statement: Extract and analyze operating cash flows, investing activities, financing activities, free cash flow, and cash conversion metrics
                  * Cap Table: Extract and analyze ownership structure, equity dilution, valuation history, investor stakes, and capitalization metrics
                  * Financial Projections: Extract and analyze growth forecasts, revenue projections, expense projections, and assess realism of assumptions
                  * Tax Returns: Extract and analyze tax liabilities, effective tax rates, tax planning strategies, and compliance with tax regulations
                  * Pitch Deck: Extract and analyze equity distribution, face value, and other ownership parameters
                  * Other/Miscellaneous Documents: Extract any relevant financial information, especially related to shareholders, directors, business agreements, leave policies, provisions, and deferred tax assets

                - DETAILED FINANCIAL CONTENT EXTRACTION:
                  * Extract exact financial figures with proper currency notation (₹) and time periods
                  * Calculate key financial ratios from the raw data and compare to industry benchmarks
                  * Identify specific year-over-year or quarter-over-quarter growth rates with exact percentages
                  * Extract specific business segments or revenue streams and their contribution percentages
                  * Identify exact debt amounts, interest rates, and maturity schedules
                  * Extract specific capital expenditure amounts and investment activities
                  * Identify exact shareholder equity changes and dividend distributions
                  * Extract specific tax payment amounts and compliance status

                - FINANCIAL RED FLAGS AND INCONSISTENCIES:
                  * Identify specific mathematical errors in calculations with exact figures
                  * Flag unusual fluctuations in financial metrics with exact percentage changes
                  * Identify specific inconsistencies between related financial statements with exact figures
                  * Flag unusual accounting treatments with specific examples and amounts
                  * Identify specific transactions that appear irregular with exact amounts
                  * Flag any concerning financial ratios with exact values compared to industry norms
                  * Identify specific disclosure inadequacies with references to required disclosures
                  * Flag any concerning trends in key metrics with exact figures showing the trend

                - DOCUMENT QUALITY AND RELIABILITY ASSESSMENT:
                  * Assess data completeness with specific missing elements identified
                  * Evaluate data consistency with specific examples of consistent/inconsistent figures
                  * Assess adherence to accounting standards with specific standard references
                  * Evaluate disclosure adequacy with specific missing disclosures identified
                  * Assess internal controls based on evidence in financial reporting
                  * Evaluate the reliability of projections based on historical accuracy

                - COMPREHENSIVE CROSS-DOCUMENT ANALYSIS:
                  * Compare specific figures across different documents to verify consistency
                  * Analyze financial trends across multiple time periods with exact growth rates
                  * Identify specific discrepancies between related documents with exact figures
                  * Evaluate the overall financial story told across all documents
                  * Assess whether the combined documents provide a complete financial picture
                  * Identify specific information gaps across the document collection

                - ADDITIONAL REQUIRED SECTIONS:
                  * SHAREHOLDERS TABLE: Create a detailed shareholders table with the following information:
                    - Name of each shareholder
                    - Equity percentage held by each shareholder
                    - Number of shares held by each shareholder
                    - Face value of shares
                    - Investment amount (if available)
                    - Share class (if applicable)
                    - Voting rights information
                    - Analysis of the equity distribution
                    - Recommendations related to shareholding structure

                  * DIRECTORS TABLE: Create a detailed directors table with the following information:
                    - Name of each director
                    - Position/designation
                    - Appointment date (if available)
                    - Director Identification Number (DIN) if available
                    - Shareholding percentage (if applicable)
                    - Expertise/background
                    - Other directorships (if available)
                    - Analysis of the board composition
                    - Recommendations related to board structure

                  * KEY BUSINESS AGREEMENTS: Analyze and summarize key business agreements with:
                    - Types of agreements
                    - Parties involved
                    - Effective dates and expiry dates
                    - Key terms and conditions
                    - Financial impact of agreements
                    - Risks associated with agreements
                    - Analysis of the agreements' impact on business
                    - Recommendations related to business agreements

                  * LEAVE POLICY ANALYSIS: Analyze the company's leave policy with:
                    - Types of leave available
                    - Entitlement for each leave type
                    - Carry forward and encashment policies
                    - Compliance status with labor laws
                    - Financial implications of leave policy
                    - Analysis of the leave policy
                    - Recommendations for improvement

                  * PROVISIONS & PREPAYMENTS: Analyze provisions and prepayments with:
                    - Types of provisions made
                    - Amounts allocated
                    - Purpose of provisions
                    - Accounting treatment
                    - Adequacy assessment
                    - Types of prepayments
                    - Amortization schedules
                    - Analysis of provisions and prepayments
                    - Recommendations for improvement

                  * DEFERRED TAX ASSETS (DTA): Analyze deferred tax assets with:
                    - Types of deferred tax assets
                    - Amounts recognized
                    - Origin/source of DTAs
                    - Expected utilization timeline
                    - Recoverability assessment
                    - Analysis of deferred tax position
                    - Recommendations for tax planning

                DOCUMENT CONTENT:
                ${documentContent}
                `;

      // Call Gemini API
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

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

export default new EnhancedDocumentProcessingService();
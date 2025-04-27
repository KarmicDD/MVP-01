import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import axios from 'axios';
import * as XLSX from 'xlsx';
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
  model: "gemini-2.0-flash-thinking-exp-01-21",
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

      const workbook = XLSX.readFile(filePath);
      let result = '';

      // Process each sheet
      workbook.SheetNames.forEach(sheetName => {
        result += `Sheet: ${sheetName}\n\n`;

        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Convert to formatted string
        jsonData.forEach((row: any) => {
          if (row.length > 0) {
            result += row.join('\t') + '\n';
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
   * Process multiple documents with metadata and combine their content with document type identifiers
   * @param documents Array of document objects with filePath and documentType
   * @returns Combined extracted content with document type identifiers
   */
  async processMultipleDocumentsWithMetadata(documents: Array<{ filePath: string, documentType: string, originalName: string }>): Promise<string> {
    // Create a map to store content by document type
    const contentByType: { [key: string]: string[] } = {};

    // Process each document and categorize by type
    const contentPromises = documents.map(async (doc) => {
      const { filePath, documentType, originalName } = doc;

      try {
        const content = await this.processDocument(filePath); // This will handle the path conversion internally

        // Initialize array for this document type if it doesn't exist
        if (!contentByType[documentType]) {
          contentByType[documentType] = [];
        }

        // Add content with document name
        contentByType[documentType].push(`--- Document: ${originalName} ---\n\n${content}\n\n`);

        return {
          documentType,
          originalName,
          content
        };
      } catch (error) {
        console.error(`Error processing ${originalName}:`, error);

        // Initialize array for this document type if it doesn't exist
        if (!contentByType[documentType]) {
          contentByType[documentType] = [];
        }

        // Add error message
        contentByType[documentType].push(`--- Document: ${originalName} ---\n\nError: Failed to process this document\n\n`);

        return {
          documentType,
          originalName,
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
                You are a specialized financial analyst and auditor with expertise in Indian company standards and regulations. Your task is to perform a comprehensive financial due diligence analysis and audit for ${companyName}.

                TASK: Analyze the following financial documents for ${companyName} and provide a comprehensive, professional financial due diligence report that combines both financial analysis and audit findings. Your analysis should be thorough, detailed, and presented in a visually appealing format with color-coded metrics and graphical data.
                ${startupContext}
                ${investorContext}
                ${missingDocumentsContext}

                IMPORTANT DOCUMENT ORGANIZATION:
                The document content is organized by document type. Each document type section begins with a header in the format "=== Document Type ===" (e.g., "=== Balance Sheet ===").
                Within each section, individual documents are marked with "--- Document: filename ---".

                Pay special attention to these document type headers to correctly identify which documents are available.
                For example, if you see a "=== Balance Sheet ===" section, you should NOT report balance sheet as missing.

                RESPONSE FORMAT: Return ONLY valid JSON with this exact structure:
                {
                  "reportCalculated": true or false, // IMPORTANT: Set to true if you were able to extract meaningful financial data, false otherwise
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
                        "trend": "increasing" or "decreasing" or "stable" or "N/A",
                        "percentChange": "Percentage change from previous period (e.g., +15%)"
                      }
                    ]
                  },
                  "financialAnalysis": {
                    "metrics": [
                      {
                        "name": "Metric name",
                        "value": "Metric value",
                        "status": "good" or "warning" or "critical",
                        "description": "Brief description of the metric",
                        "trend": "increasing" or "decreasing" or "stable" or "N/A",
                        "percentChange": "Percentage change from previous period (e.g., +15%)",
                        "industryComparison": "above_average" or "average" or "below_average" or "N/A",
                        "industryValue": "Industry average value"
                      }
                    ],
                    "trends": [
                      {
                        "name": "Trend name",
                        "description": "Description of the trend",
                        "trend": "increasing" or "decreasing" or "stable",
                        "impact": "positive" or "negative" or "neutral",
                        "data": [
                          {"period": "Period 1 (e.g., Q1 2023)", "value": numeric value or "N/A"},
                          {"period": "Period 2 (e.g., Q2 2023)", "value": numeric value or "N/A"},
                          {"period": "Period 3 (e.g., Q3 2023)", "value": numeric value or "N/A"}
                        ]
                      }
                    ],
                    "growthProjections": [
                      {
                        "metric": "Metric name (e.g., Revenue, Profit)",
                        "currentValue": numeric value or "N/A",
                        "projectedValue": numeric value or "N/A",
                        "timeframe": "Timeframe (e.g., 1 year, 3 years)",
                        "cagr": "Compound Annual Growth Rate (e.g., 12.5%)",
                        "confidence": "high" or "medium" or "low"
                      }
                    ]
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
                      "status": "compliant" or "partial" or "non-compliant",
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
                    "liquidityRatios": [
                      {
                        "name": "Ratio name",
                        "value": numeric value or "N/A",
                        "industry_average": numeric value or "N/A",
                        "description": "Description of ratio",
                        "status": "good" or "warning" or "critical",
                        "trend": "improving" or "stable" or "deteriorating",
                        "historicalData": [
                          {"period": "Period 1", "value": numeric value or "N/A"},
                          {"period": "Period 2", "value": numeric value or "N/A"}
                        ]
                      }
                    ],
                    "profitabilityRatios": [...],
                    "solvencyRatios": [...],
                    "efficiencyRatios": [...]
                  },
                  "taxCompliance": {
                    "gst": {
                      "status": "compliant" or "partial" or "non-compliant",
                      "details": "Details about GST compliance",
                      "filingHistory": [
                        {"period": "Period", "status": "filed" or "pending" or "overdue", "dueDate": "Due date"}
                      ],
                      "recommendations": ["Recommendation 1", "Recommendation 2"]
                    },
                    "incomeTax": {
                      "status": "compliant" or "partial" or "non-compliant",
                      "details": "Details about income tax compliance",
                      "filingHistory": [
                        {"period": "Period", "status": "filed" or "pending" or "overdue", "dueDate": "Due date"}
                      ],
                      "recommendations": ["Recommendation 1", "Recommendation 2"]
                    },
                    "tds": {
                      "status": "compliant" or "partial" or "non-compliant",
                      "details": "Details about TDS compliance",
                      "filingHistory": [
                        {"period": "Period", "status": "filed" or "pending" or "overdue", "dueDate": "Due date"}
                      ],
                      "recommendations": ["Recommendation 1", "Recommendation 2"]
                    }
                  },
                  "auditFindings": {
                    "findings": [
                      {
                        "area": "Area of finding",
                        "severity": "high" or "medium" or "low",
                        "description": "Description of finding",
                        "recommendation": "Recommendation to address finding",
                        "impact": "Financial or operational impact",
                        "timelineToResolve": "Suggested timeline to resolve"
                      }
                    ],
                    "overallAssessment": "Overall assessment of audit findings",
                    "complianceScore": "Score out of 100",
                    "keyStrengths": ["Strength 1", "Strength 2"],
                    "keyWeaknesses": ["Weakness 1", "Weakness 2"]
                  },
                  "documentAnalysis": {
                    "availableDocuments": [
                      {
                        "documentType": "Document type name",
                        "quality": "good" or "moderate" or "poor",
                        "completeness": "complete" or "partial" or "incomplete",
                        "keyInsights": ["Key insight 1", "Key insight 2"],
                        "dataReliability": "high" or "medium" or "low" or "N/A",
                        "recommendations": ["Recommendation for document improvement"]
                      }
                    ],
                    "missingDocuments": {
                      "list": ["Document type 1", "Document type 2"],
                      "impact": "Description of how missing documents impact the analysis",
                      "recommendations": ["Recommendation for missing documents"],
                      "priorityLevel": "high" or "medium" or "low"
                    }
                  },
                  "industryBenchmarking": {
                    "overview": "Overview of industry benchmarking",
                    "metrics": [
                      {
                        "name": "Metric name",
                        "companyValue": numeric value or "N/A",
                        "industryAverage": numeric value or "N/A",
                        "percentile": "Percentile within industry (e.g., 75th)",
                        "status": "above_average" or "average" or "below_average" or "N/A"
                      }
                    ],
                    "competitivePosition": "Description of competitive position",
                    "strengths": ["Strength 1", "Strength 2"],
                    "challenges": ["Challenge 1", "Challenge 2"]
                  }
                }

                COMPREHENSIVE DUE DILIGENCE GUIDELINES:
                - CRITICAL: Set "reportCalculated" to true ONLY if you were able to extract meaningful financial data and generate a useful report
                - Set "reportCalculated" to false if you cannot extract sufficient financial information from the documents
                - Even if reportCalculated is false, still provide as much analysis as possible with the available data
                - NEVER leave the report empty - always provide some analysis even if limited
                - Provide a professional, detailed executive summary with key findings and recommended actions
                - Focus on key financial indicators, trends, and growth metrics with color-coded status indicators
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
                - IMPORTANT: Include a detailed analysis of available documents in the documentAnalysis section
                - For each available document, assess its quality, completeness, and key insights
                - For missing documents, explain how this impacts the analysis and provide recommendations
                - Ensure all metrics have appropriate status indicators (good/warning/critical)
                - Include percentage changes and trends for all key metrics
                - Provide detailed ratio analysis with industry comparisons
                - Include specific, actionable recommendations for improvement

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

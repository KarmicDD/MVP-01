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
import { cleanJsonResponse } from '../utils/jsonHelper';

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

      return textContent;
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  /**
   * Extract text and data from an Excel file
   * @param filePath Path to the Excel file
   * @returns Extracted data as a string
   */
  async extractExcelData(filePath: string): Promise<string> {
    try {
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

      return result;
    } catch (error) {
      console.error('Error extracting Excel data:', error);
      throw new Error('Failed to extract data from Excel file');
    }
  }

  /**
   * Extract data from a CSV file
   * @param filePath Path to the CSV file
   * @returns Extracted data as a string
   */
  async extractCsvData(filePath: string): Promise<string> {
    try {
      const content = await readFileAsync(filePath, 'utf8');
      const lines = content.split('\n');

      // Process CSV data
      let result = '';
      lines.forEach(line => {
        if (line.trim()) {
          result += line + '\n';
        }
      });

      return result;
    } catch (error) {
      console.error('Error extracting CSV data:', error);
      throw new Error('Failed to extract data from CSV file');
    }
  }

  /**
   * Extract text from a PowerPoint file using Gemini API
   * @param filePath Path to the PowerPoint file
   * @returns Extracted text content
   */
  async extractPptText(filePath: string): Promise<string> {
    try {
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

      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error extracting PPT text:', error);
      throw new Error('Failed to extract text from PowerPoint');
    }
  }

  /**
   * Extract text from a Word document
   * @param filePath Path to the Word document
   * @returns Extracted text content
   */
  async extractWordText(filePath: string): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (error) {
      console.error('Error extracting Word text:', error);
      throw new Error('Failed to extract text from Word document');
    }
  }

  /**
   * Extract text from an image using OCR
   * @param filePath Path to the image file
   * @returns Extracted text content
   */
  async extractImageText(filePath: string): Promise<string> {
    try {
      const worker = await createWorker();
      // Use the correct methods for Tesseract.js v6
      await worker.reinitialize('eng');

      const result = await worker.recognize(filePath);
      const text = result.data.text;
      await worker.terminate();

      return text;
    } catch (error) {
      console.error('Error extracting image text:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  /**
   * Extract text from a text file
   * @param filePath Path to the text file
   * @returns Extracted text content
   */
  async extractTextFileContent(filePath: string): Promise<string> {
    try {
      const content = await readFileAsync(filePath, 'utf8');
      return content;
    } catch (error) {
      console.error('Error extracting text file content:', error);
      throw new Error('Failed to extract content from text file');
    }
  }

  /**
   * Process a document and extract its content based on file type
   * @param filePath Path to the document (relative or absolute)
   * @returns Extracted content
   */
  async processDocument(filePath: string): Promise<string> {
    // Convert to absolute path if it's a relative path
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '../..', filePath);
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
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }
  }

  /**
   * Process multiple documents and combine their content
   * @param filePaths Array of file paths
   * @returns Combined extracted content
   */
  async processMultipleDocuments(filePaths: string[]): Promise<string> {
    const contentPromises = filePaths.map(async (filePath) => {
      // Convert to absolute path if it's a relative path
      const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '../..', filePath);
      const fileExtension = path.extname(absolutePath).toLowerCase();
      const fileName = path.basename(absolutePath);

      try {
        const content = await this.processDocument(filePath); // This will handle the path conversion internally
        return `--- Document: ${fileName} ---\n\n${content}\n\n`;
      } catch (error) {
        console.error(`Error processing ${fileName}:`, error);
        return `--- Document: ${fileName} ---\n\nError: Failed to process this document\n\n`;
      }
    });

    const contents = await Promise.all(contentPromises);
    return contents.join('\n');
  }

  /**
   * Extract financial data from documents using Gemini AI
   * @param documentContent Combined document content
   * @param companyName Name of the company
   * @param reportType Type of report to generate
   * @param startupInfo Additional startup information
   * @param investorInfo Additional investor information
   * @returns Extracted financial data
   */
  async extractFinancialData(
    documentContent: string,
    companyName: string,
    reportType: 'analysis' | 'audit',
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

      if (reportType === 'analysis') {
        prompt = `
                You are a specialized financial analyst with expertise in Indian company standards and regulations.

                TASK: Analyze the following financial documents for ${companyName} and provide a comprehensive financial analysis.
                ${startupContext}
                ${investorContext}
                ${missingDocumentsContext}

                RESPONSE FORMAT: Return ONLY valid JSON with this exact structure:
                {
                  "summary": "Detailed summary of financial analysis",
                  "metrics": [
                    {
                      "name": "Metric name",
                      "value": "Metric value",
                      "status": "good" or "warning" or "critical",
                      "description": "Brief description of the metric"
                    }
                  ],
                  "recommendations": [
                    "Recommendation 1",
                    "Recommendation 2",
                    "Recommendation 3"
                  ],
                  "riskFactors": [
                    {
                      "category": "Risk category",
                      "level": "high" or "medium" or "low",
                      "description": "Description of risk",
                      "impact": "Potential impact"
                    }
                  ],
                  "ratioAnalysis": {
                    "liquidityRatios": [
                      {
                        "name": "Ratio name",
                        "value": numeric value,
                        "industry_average": numeric value,
                        "description": "Description of ratio",
                        "status": "good" or "warning" or "critical"
                      }
                    ],
                    "profitabilityRatios": [...],
                    "solvencyRatios": [...],
                    "efficiencyRatios": [...]
                  },
                  "financialStatements": {
                    "balanceSheet": {
                      "assets": {...},
                      "liabilities": {...},
                      "equity": {...}
                    },
                    "incomeStatement": {...},
                    "cashFlow": {...}
                  },
                  "missingDocuments": {
                    "list": ["Document type 1", "Document type 2"],
                    "impact": "Description of how missing documents impact the analysis",
                    "recommendations": ["Recommendation for missing documents"]
                  }
                }

                ANALYSIS GUIDELINES:
                - Focus on key financial indicators and trends
                - Identify strengths, weaknesses, and areas for improvement
                - Provide actionable recommendations based on the analysis
                - Consider Indian accounting standards and regulatory requirements
                - Evaluate financial health, profitability, liquidity, and solvency
                - Assess growth potential and investment opportunities
                - If documents are missing, explain how this impacts the analysis
                - For missing documents, provide recommendations on what information they would provide

                DOCUMENT CONTENT:
                ${documentContent}
                `;
      } else {
        prompt = `
                You are a specialized financial auditor with expertise in Indian company standards and regulations.

                TASK: Conduct a thorough financial audit for ${companyName} based on the provided documents.
                ${startupContext}
                ${investorContext}
                ${missingDocumentsContext}

                RESPONSE FORMAT: Return ONLY valid JSON with this exact structure:
                {
                  "summary": "Detailed summary of audit findings",
                  "metrics": [
                    {
                      "name": "Metric name",
                      "value": "Metric value",
                      "status": "good" or "warning" or "critical",
                      "description": "Brief description of the metric"
                    }
                  ],
                  "recommendations": [
                    "Recommendation 1",
                    "Recommendation 2",
                    "Recommendation 3"
                  ],
                  "riskFactors": [
                    {
                      "category": "Risk category",
                      "level": "high" or "medium" or "low",
                      "description": "Description of risk",
                      "impact": "Potential impact"
                    }
                  ],
                  "complianceItems": [
                    {
                      "requirement": "Compliance requirement",
                      "status": "compliant" or "partial" or "non-compliant",
                      "details": "Details about compliance status",
                      "severity": "high" or "medium" or "low",
                      "recommendation": "Recommendation to address compliance issue"
                    }
                  ],
                  "taxCompliance": {
                    "gst": {
                      "status": "compliant" or "partial" or "non-compliant",
                      "details": "Details about GST compliance"
                    },
                    "incomeTax": {
                      "status": "compliant" or "partial" or "non-compliant",
                      "details": "Details about income tax compliance"
                    },
                    "tds": {
                      "status": "compliant" or "partial" or "non-compliant",
                      "details": "Details about TDS compliance"
                    }
                  },
                  "missingDocuments": {
                    "list": ["Document type 1", "Document type 2"],
                    "impact": "Description of how missing documents impact the audit",
                    "recommendations": ["Recommendation for missing documents"]
                  }
                }

                AUDIT GUIDELINES:
                - Evaluate compliance with Indian accounting standards and regulations
                - Assess internal controls and financial reporting processes
                - Identify potential fraud risks and irregularities
                - Verify accuracy and completeness of financial statements
                - Evaluate tax compliance (GST, Income Tax, TDS)
                - Provide recommendations for improving financial governance
                - If documents are missing, explain how this impacts the audit
                - For missing documents, provide recommendations on what information they would provide

                DOCUMENT CONTENT:
                ${documentContent}
                `;
      }

      // Call Gemini API
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the JSON response
      try {
        // Clean the response text by removing markdown code block markers
        const cleanedText = cleanJsonResponse(text);

        return JSON.parse(cleanedText);
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

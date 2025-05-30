// import fs from 'fs';
// import path from 'path';
// import { promisify } from 'util';
// import axios from 'axios';
// import ExcelJS from 'exceljs';
// import { PDFExtract, PDFExtractOptions } from 'pdf.js-extract';
// import { GoogleGenerativeAI } from '@google/generative-ai';
// import dotenv from 'dotenv';

// // Load environment variables
// dotenv.config();

// // Initialize Gemini API
// const apiKey = process.env.GEMINI_API_KEY || '';
// if (!apiKey) {
//     console.warn('Warning: GEMINI_API_KEY is not defined in environment variables');
// }

// const genAI = new GoogleGenerativeAI(apiKey);
// const model = genAI.getGenerativeModel({
//     model: "gemini-2.0-flash-thinking-exp-01-21",
//     generationConfig: {
//         maxOutputTokens: 8192, // Maximum allowed value
//     }
// });

// const readFileAsync = promisify(fs.readFile);
// const pdfExtract = new PDFExtract();
// const pdfExtractAsync = promisify(pdfExtract.extract.bind(pdfExtract));

// /**
//  * @deprecated This service is deprecated and should not be used.
//  * Use EnhancedDocumentProcessingService instead, which provides better performance
//  * and uses the new MemoryBasedOcrPdfService for PDF processing.
//  *
//  * This file is kept for reference only and may be removed in future versions.
//  *
//  * Service for processing different types of documents and extracting their content
//  */
// export class DocumentProcessingService {
//     /**
//      * Extract text content from a PDF file
//      * @param filePath Path to the PDF file
//      * @returns Extracted text content
//      */
//     async extractPdfText(filePath: string): Promise<string> {
//         try {
//             const options: PDFExtractOptions = {};
//             const data = await pdfExtractAsync(filePath, options);

//             // Combine all page content
//             let textContent = '';
//             if (data && typeof data === 'object' && 'pages' in data && Array.isArray(data.pages)) {
//                 data.pages.forEach((page: any) => {
//                     if (page && typeof page === 'object' && 'content' in page && Array.isArray(page.content)) {
//                         page.content.forEach((item: any) => {
//                             textContent += item.str + ' ';
//                         });
//                     }
//                     textContent += '\n\n';
//                 });
//             }

//             return textContent;
//         } catch (error) {
//             console.error('Error extracting PDF text:', error);
//             throw new Error('Failed to extract text from PDF');
//         }
//     }

//     /**
//      * Extract text content from a PowerPoint file
//      * @param filePath Path to the PowerPoint file
//      * @returns Extracted text content
//      */
//     async extractPptText(filePath: string): Promise<string> {
//         try {
//             // For PPT files, we'll use a simple approach to extract text
//             // In a production environment, you might want to use a more robust solution

//             // Read the file as binary
//             const fileBuffer = await readFileAsync(filePath);

//             // Use Gemini to extract text from the PPT
//             const prompt = `
//             I have a PowerPoint presentation file. Please extract all the text content from it.
//             The file is in binary format, so I'll provide it as base64.

//             Please extract all text including:
//             - Slide titles
//             - Bullet points
//             - Notes
//             - Tables
//             - Charts descriptions

//             Format the output as plain text, preserving the structure of the slides.
//             `;

//             const result = await model.generateContent([
//                 prompt,
//                 { fileData: { mime_type: 'application/vnd.ms-powerpoint', data: fileBuffer.toString('base64') } as any }
//             ]);

//             const response = await result.response;
//             return response.text();
//         } catch (error) {
//             console.error('Error extracting PPT text:', error);
//             throw new Error('Failed to extract text from PowerPoint');
//         }
//     }

//     /**
//      * Extract data from an Excel file
//      * @param filePath Path to the Excel file
//      * @returns Extracted data as JSON string
//      */
//     async extractExcelData(filePath: string): Promise<string> {
//         try {
//             // Read the Excel file
//             const workbook = new ExcelJS.Workbook();
//             await workbook.xlsx.readFile(filePath);
//             const result: Record<string, any[]> = {};

//             // Extract data from each sheet
//             workbook.eachSheet((worksheet, sheetId) => {
//                 const sheetName = worksheet.name;
//                 const data: any[] = [];

//                 // Get header row
//                 const headerRow = worksheet.getRow(1);
//                 const headers: string[] = [];
//                 headerRow.eachCell((cell, colNumber) => {
//                     headers[colNumber - 1] = cell.value?.toString() || `Column${colNumber}`;
//                 });

//                 // Process each row
//                 worksheet.eachRow((row, rowNumber) => {
//                     if (rowNumber > 1) { // Skip header row
//                         const rowData: Record<string, any> = {};
//                         row.eachCell((cell, colNumber) => {
//                             const header = headers[colNumber - 1];
//                             rowData[header] = cell.value;
//                         });
//                         data.push(rowData);
//                     }
//                 });

//                 result[sheetName] = data;
//             });

//             return JSON.stringify(result, null, 2);
//         } catch (error) {
//             console.error('Error extracting Excel data:', error);
//             throw new Error('Failed to extract data from Excel');
//         }
//     }

//     /**
//      * Extract data from a CSV file
//      * @param filePath Path to the CSV file
//      * @returns Extracted data as JSON string
//      */
//     async extractCsvData(filePath: string): Promise<string> {
//         try {
//             // Read the CSV file using ExcelJS
//             const workbook = new ExcelJS.Workbook();
//             await workbook.csv.readFile(filePath);

//             // Get the first worksheet (CSV files have only one sheet)
//             const worksheet = workbook.getWorksheet(1);
//             if (!worksheet) {
//                 throw new Error('No worksheet found in CSV file');
//             }

//             const data: any[] = [];

//             // Get header row
//             const headerRow = worksheet.getRow(1);
//             const headers: string[] = [];
//             headerRow.eachCell((cell, colNumber) => {
//                 headers[colNumber - 1] = cell.value?.toString() || `Column${colNumber}`;
//             });

//             // Process each row
//             worksheet.eachRow((row, rowNumber) => {
//                 if (rowNumber > 1) { // Skip header row
//                     const rowData: Record<string, any> = {};
//                     row.eachCell((cell, colNumber) => {
//                         const header = headers[colNumber - 1];
//                         rowData[header] = cell.value;
//                     });
//                     data.push(rowData);
//                 }
//             });

//             return JSON.stringify(data, null, 2);
//         } catch (error) {
//             console.error('Error extracting CSV data:', error);
//             throw new Error('Failed to extract data from CSV');
//         }
//     }

//     /**
//      * Process a document and extract its content based on file type
//      * @param filePath Path to the document
//      * @returns Extracted content
//      */
//     async processDocument(filePath: string): Promise<string> {
//         const fileExtension = path.extname(filePath).toLowerCase();

//         switch (fileExtension) {
//             case '.pdf':
//                 return this.extractPdfText(filePath);
//             case '.ppt':
//             case '.pptx':
//                 return this.extractPptText(filePath);
//             case '.xls':
//             case '.xlsx':
//                 return this.extractExcelData(filePath);
//             case '.csv':
//                 return this.extractCsvData(filePath);
//             default:
//                 throw new Error(`Unsupported file type: ${fileExtension}`);
//         }
//     }

//     /**
//      * Process multiple documents and combine their content
//      * @param filePaths Array of file paths
//      * @returns Combined extracted content
//      */
//     async processMultipleDocuments(filePaths: string[]): Promise<string> {
//         const contentPromises = filePaths.map(async (filePath) => {
//             const fileExtension = path.extname(filePath).toLowerCase();
//             const fileName = path.basename(filePath);

//             try {
//                 const content = await this.processDocument(filePath);
//                 return `--- Document: ${fileName} ---\n\n${content}\n\n`;
//             } catch (error) {
//                 console.error(`Error processing ${fileName}:`, error);
//                 return `--- Document: ${fileName} ---\n\nError: Failed to process this document\n\n`;
//             }
//         });

//         const contents = await Promise.all(contentPromises);
//         return contents.join('\n');
//     }
// }

// export default new DocumentProcessingService();

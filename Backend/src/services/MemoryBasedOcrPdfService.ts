import { GoogleGenerativeAI } from '@google/generative-ai';
import { PDFDocument } from 'pdf-lib';
import dotenv from 'dotenv';
import { NEW_OCR_PROMPT } from './document-processing/newFinancialDDPrompt';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || '';
if (!apiKey) {
  console.warn('Warning: GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

// Document extraction model for OCR
const documentExtractionModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-preview-05-20",
  generationConfig: {
    maxOutputTokens: 65536,
    temperature: 0.1, // Low temperature for more accurate extraction
  },
  systemInstruction: NEW_OCR_PROMPT
});

/**
 * Interface for document metadata
 */
export interface DocumentMetadata {
  originalName: string;
  documentType: string;
  description?: string;
  timePeriod?: string;
  fileType?: string;
  fileSize?: number;
}

/**
 * Interface for PDF chunk
 */
export interface PdfChunk {
  buffer: Buffer;
  chunkIndex: number;
  totalChunks: number;
  sourceMetadata: DocumentMetadata;
  pageCount: number;
}

/**
 * Interface for OCR result
 */
export interface OcrResult {
  extractedText: string;
  chunkIndex: number;
  sourceMetadata: DocumentMetadata;
  processingTime: number;
  success: boolean;
  error?: string;
}

/**
 * Interface for batch processing result
 */
export interface BatchProcessingResult {
  combinedText: string;
  individualResults: OcrResult[];
  totalProcessingTime: number;
  successCount: number;
  errorCount: number;
}

/**
 * Configuration for PDF splitting
 */
export interface SplitConfig {
  pagesPerChunk: number;
  maxChunksPerBatch: number;
}

/**
 * Memory-based OCR PDF Service
 * Processes PDFs entirely in memory without saving to disk
 * Designed for integration with existing Financial DD and future DD services
 */
export class MemoryBasedOcrPdfService {
  private readonly defaultSplitConfig: SplitConfig = {
    pagesPerChunk: 38, // Based on original config
    maxChunksPerBatch: 1
  };

  /**
   * Combine multiple PDF buffers into a single PDF document
   * @param documents Array of document objects with buffers and metadata
   * @returns Combined PDF buffer and merged metadata
   */
  async combinePdfDocuments(
    documents: Array<{
      buffer: Buffer;
      metadata: DocumentMetadata;
    }>
  ): Promise<{
    combinedBuffer: Buffer;
    combinedMetadata: DocumentMetadata;
    documentMap: Array<{ startPage: number; endPage: number; originalMetadata: DocumentMetadata }>;
  }> {
    try {
      console.log(`Combining ${documents.length} PDF documents into one`);

      // Create new combined PDF document
      const combinedPdf = await PDFDocument.create();
      const documentMap: Array<{ startPage: number; endPage: number; originalMetadata: DocumentMetadata }> = [];
      let currentPageOffset = 0;

      // Process each document
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        console.log(`Adding document ${i + 1}/${documents.length}: ${doc.metadata.originalName}`);

        try {
          // Load the source PDF
          const sourcePdf = await PDFDocument.load(doc.buffer);
          const pageCount = sourcePdf.getPageCount();

          // Copy all pages from source to combined PDF
          const pageIndices = Array.from({ length: pageCount }, (_, i) => i);
          const copiedPages = await combinedPdf.copyPages(sourcePdf, pageIndices);

          copiedPages.forEach(page => {
            combinedPdf.addPage(page);
          });

          // Track page mapping
          documentMap.push({
            startPage: currentPageOffset + 1,
            endPage: currentPageOffset + pageCount,
            originalMetadata: doc.metadata
          });

          currentPageOffset += pageCount;
          console.log(`Document ${doc.metadata.originalName} added: ${pageCount} pages (total: ${currentPageOffset} pages)`);

        } catch (docError) {
          console.error(`Error processing document ${doc.metadata.originalName}:`, docError);
          // Continue with other documents instead of failing completely
          documentMap.push({
            startPage: currentPageOffset + 1,
            endPage: currentPageOffset + 1,
            originalMetadata: {
              ...doc.metadata,
              originalName: `${doc.metadata.originalName} (ERROR: ${docError instanceof Error ? docError.message : 'Unknown error'})`
            }
          });
          currentPageOffset += 1; // Add placeholder page
        }
      }

      // Generate combined PDF buffer
      const combinedBuffer = Buffer.from(await combinedPdf.save());

      // Create combined metadata
      const combinedMetadata: DocumentMetadata = {
        originalName: `Combined_PDF_${documents.length}_Documents`,
        documentType: 'combined_financial',
        description: `Combined PDF containing ${documents.length} documents: ${documents.map(d => d.metadata.originalName).join(', ')}`,
        timePeriod: documents.map(d => d.metadata.timePeriod).filter(Boolean).join(', ') || undefined,
        fileType: 'pdf',
        fileSize: combinedBuffer.length
      };

      console.log(`PDF combination complete: ${currentPageOffset} total pages, ${combinedBuffer.length} bytes`);

      return {
        combinedBuffer,
        combinedMetadata,
        documentMap
      };

    } catch (error) {
      console.error('Error combining PDF documents:', error);
      throw new Error(`Failed to combine PDF documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Split a PDF buffer into smaller chunks in memory
   * @param pdfBuffer PDF file buffer
   * @param metadata Document metadata
   * @param config Split configuration
   * @returns Array of PDF chunks
   */
  async splitPdfInMemory(
    pdfBuffer: Buffer,
    metadata: DocumentMetadata,
    config: Partial<SplitConfig> = {}
  ): Promise<PdfChunk[]> {
    const splitConfig = { ...this.defaultSplitConfig, ...config };

    try {
      console.log(`Starting PDF split for ${metadata.originalName} (${pdfBuffer.length} bytes)`);

      // Load PDF document
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const totalPages = pdfDoc.getPageCount();

      console.log(`PDF has ${totalPages} pages, splitting into chunks of ${splitConfig.pagesPerChunk} pages`);

      // Calculate number of chunks
      const totalChunks = Math.ceil(totalPages / splitConfig.pagesPerChunk);
      const chunks: PdfChunk[] = [];

      // Create chunks
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const startPage = chunkIndex * splitConfig.pagesPerChunk;
        const endPage = Math.min((chunkIndex + 1) * splitConfig.pagesPerChunk, totalPages);
        const pageCount = endPage - startPage;

        console.log(`Creating chunk ${chunkIndex + 1}/${totalChunks} with pages ${startPage + 1}-${endPage}`);

        // Create new PDF document for this chunk
        const chunkDocument = await PDFDocument.create();

        // Copy pages to chunk document
        const pageIndices = Array.from(
          { length: pageCount },
          (_, i) => startPage + i
        );

        const copiedPages = await chunkDocument.copyPages(pdfDoc, pageIndices);
        copiedPages.forEach(page => {
          chunkDocument.addPage(page);
        });

        // Save chunk to buffer
        const chunkBuffer = Buffer.from(await chunkDocument.save());

        chunks.push({
          buffer: chunkBuffer,
          chunkIndex,
          totalChunks,
          sourceMetadata: metadata,
          pageCount
        });

        console.log(`Chunk ${chunkIndex + 1} created: ${pageCount} pages, ${chunkBuffer.length} bytes`);
      }

      console.log(`PDF split complete: ${chunks.length} chunks created`);
      return chunks;

    } catch (error) {
      console.error(`Error splitting PDF ${metadata.originalName}:`, error);
      throw new Error(`Failed to split PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process a single PDF chunk with OCR
   * @param chunk PDF chunk to process
   * @returns OCR result
   */
  async processChunkWithOcr(chunk: PdfChunk): Promise<OcrResult> {
    const startTime = Date.now();

    try {
      console.log(`Processing chunk ${chunk.chunkIndex + 1}/${chunk.totalChunks} from ${chunk.sourceMetadata.originalName}`);

      // Check buffer size and warn if large
      const bufferSizeMB = chunk.buffer.length / (1024 * 1024);
      console.log(`Chunk buffer size: ${bufferSizeMB.toFixed(2)} MB`);

      if (bufferSizeMB > 20) {
        console.warn(`WARNING: Chunk is large (${bufferSizeMB.toFixed(2)} MB). May exceed Gemini API limits.`);
      }

      // Prepare content for Gemini
      const contentParts = [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: chunk.buffer.toString('base64')
          }
        }
      ];

      // Call Gemini API with retry mechanism
      let retries = 0;
      const maxRetries = 3;
      let result;

      while (retries < maxRetries) {
        try {
          result = await documentExtractionModel.generateContent({
            contents: [{ role: "user", parts: contentParts }],
          });
          break;
        } catch (apiError) {
          retries++;
          console.error(`OCR attempt ${retries}/${maxRetries} failed: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);

          if (retries >= maxRetries) {
            throw new Error(`OCR failed after ${maxRetries} attempts: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
          }

          // Exponential backoff
          const waitTime = Math.pow(2, retries) * 1000;
          console.log(`Waiting ${waitTime / 1000} seconds before retrying...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }

      const extractedText = result!.response.text();
      const processingTime = Date.now() - startTime;

      console.log(`OCR completed for chunk ${chunk.chunkIndex + 1}: ${extractedText.length} characters in ${processingTime}ms`);

      return {
        extractedText,
        chunkIndex: chunk.chunkIndex,
        sourceMetadata: chunk.sourceMetadata,
        processingTime,
        success: true
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`OCR failed for chunk ${chunk.chunkIndex + 1}:`, error);

      return {
        extractedText: `**ERROR PROCESSING CHUNK ${chunk.chunkIndex + 1}**\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\n---\n\n`,
        chunkIndex: chunk.chunkIndex,
        sourceMetadata: chunk.sourceMetadata,
        processingTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Process multiple chunks in batches
   * @param chunks Array of PDF chunks to process
   * @returns Batch processing result
   */
  async processChunksInBatches(chunks: PdfChunk[]): Promise<BatchProcessingResult> {
    const startTime = Date.now();
    const allResults: OcrResult[] = [];

    console.log(`Processing ${chunks.length} chunks in batches of ${this.defaultSplitConfig.maxChunksPerBatch}`);

    // Process chunks in batches
    for (let i = 0; i < chunks.length; i += this.defaultSplitConfig.maxChunksPerBatch) {
      const batch = chunks.slice(i, i + this.defaultSplitConfig.maxChunksPerBatch);
      console.log(`Processing batch ${Math.floor(i / this.defaultSplitConfig.maxChunksPerBatch) + 1}: chunks ${i + 1}-${i + batch.length}`);

      // Process batch in parallel
      const batchResults = await Promise.all(
        batch.map(chunk => this.processChunkWithOcr(chunk))
      );

      allResults.push(...batchResults);

      // Add delay between batches to respect API limits
      if (i + this.defaultSplitConfig.maxChunksPerBatch < chunks.length) {
        console.log('Waiting 2 seconds between batches...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Combine all results
    const combinedText = allResults
      .sort((a, b) => a.chunkIndex - b.chunkIndex) // Ensure correct order
      .map(result => result.extractedText)
      .join('\n\n');

    const totalProcessingTime = Date.now() - startTime;
    const successCount = allResults.filter(r => r.success).length;
    const errorCount = allResults.filter(r => !r.success).length;

    console.log(`Batch processing complete: ${successCount} successful, ${errorCount} errors, ${totalProcessingTime}ms total`);

    return {
      combinedText,
      individualResults: allResults,
      totalProcessingTime,
      successCount,
      errorCount
    };
  }

  /**
   * Process a single PDF document (split and OCR)
   * @param pdfBuffer PDF file buffer
   * @param metadata Document metadata
   * @param config Optional split configuration
   * @returns Combined OCR text
   */
  async processPdfDocument(
    pdfBuffer: Buffer,
    metadata: DocumentMetadata,
    config: Partial<SplitConfig> = {}
  ): Promise<string> {
    try {
      console.log(`Processing PDF document: ${metadata.originalName}`);

      // Split PDF into chunks
      const chunks = await this.splitPdfInMemory(pdfBuffer, metadata, config);

      // Process chunks with OCR
      const result = await this.processChunksInBatches(chunks);

      if (result.errorCount > 0) {
        console.warn(`Document processing completed with ${result.errorCount} errors out of ${chunks.length} chunks`);
      }

      return result.combinedText;

    } catch (error) {
      console.error(`Error processing PDF document ${metadata.originalName}:`, error);
      throw new Error(`Failed to process PDF document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process multiple PDF documents by combining first, then chunking
   * @param documents Array of document objects with buffer and metadata
   * @param config Optional split configuration
   * @returns Combined text from all documents
   */
  async processMultiplePdfDocuments(
    documents: Array<{
      buffer: Buffer;
      metadata: DocumentMetadata;
    }>,
    config: Partial<SplitConfig> = {}
  ): Promise<string> {
    try {
      console.log(`Processing ${documents.length} PDF documents using combine-first approach`);

      if (documents.length === 0) {
        console.warn('No documents provided for processing');
        return '';
      }

      if (documents.length === 1) {
        // If only one document, process it directly
        console.log('Single document detected, processing directly');
        return await this.processPdfDocument(documents[0].buffer, documents[0].metadata, config);
      }

      // Step 1: Combine all PDFs into one
      console.log('Step 1: Combining all PDF documents into one');
      const { combinedBuffer, combinedMetadata, documentMap } = await this.combinePdfDocuments(documents);

      // Step 2: Process the combined PDF (split and OCR)
      console.log('Step 2: Processing combined PDF with chunking and OCR');
      const combinedText = await this.processPdfDocument(combinedBuffer, combinedMetadata, config);

      // Step 3: Add document mapping information at the beginning
      const documentMapInfo = documentMap.map((mapping, index) =>
        `Document ${index + 1}: ${mapping.originalMetadata.originalName} (Pages ${mapping.startPage}-${mapping.endPage})`
      ).join('\n');

      const finalResult = `
=== COMBINED DOCUMENT PROCESSING REPORT ===
Total Documents Combined: ${documents.length}
Total Pages: ${documentMap[documentMap.length - 1]?.endPage || 0}

Document Mapping:
${documentMapInfo}

=== COMBINED CONTENT ===

${combinedText}

=== END OF COMBINED CONTENT ===
`;

      // Save the final combined OCR result to a .md file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputDir = path.join(__dirname, '..', '..', 'ocr_outputs'); // Create a directory for outputs if it doesn't exist
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      const filePath = path.join(outputDir, `final_ocr_combined_${timestamp}.md`);
      try {
        fs.writeFileSync(filePath, finalResult);
        console.log(`Final combined OCR result saved to: ${filePath}`);
      } catch (writeError) {
        console.error(`Error saving final combined OCR result to file: ${filePath}`, writeError);
      }

      console.log(`Combined document processing complete. Total length: ${finalResult.length} characters`);
      return finalResult;

    } catch (error) {
      console.error('Error processing multiple PDF documents:', error);
      throw new Error(`Failed to process multiple PDF documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Universal processing method for different DD types
   * @param documents Array of document objects
   * @param processingType Type of due diligence processing
   * @param config Optional configuration
   * @returns Processed text ready for analysis
   */
  async processForDueDiligence(
    documents: Array<{
      buffer: Buffer;
      metadata: DocumentMetadata;
    }>,
    processingType: 'financial' | 'legal' | 'forensics' = 'financial',
    config: Partial<SplitConfig> = {}
  ): Promise<string> {
    try {
      console.log(`Processing documents for ${processingType} due diligence`);

      // Filter PDF documents only
      const pdfDocuments = documents.filter(doc =>
        doc.metadata.fileType?.toLowerCase() === 'pdf' ||
        doc.metadata.originalName.toLowerCase().endsWith('.pdf')
      );

      if (pdfDocuments.length === 0) {
        console.warn('No PDF documents found for processing');
        return 'No PDF documents available for OCR processing.';
      }

      console.log(`Found ${pdfDocuments.length} PDF documents for OCR processing`);

      // Adjust configuration based on processing type
      const typeSpecificConfig = {
        ...config,
        pagesPerChunk: processingType === 'forensics' ? 20 : config.pagesPerChunk || 38, // Smaller chunks for forensics
        maxChunksPerBatch: processingType === 'financial' ? 2 : config.maxChunksPerBatch || 2
      };

      return await this.processMultiplePdfDocuments(pdfDocuments, typeSpecificConfig);

    } catch (error) {
      console.error(`Error in ${processingType} due diligence processing:`, error);
      throw new Error(`Failed to process documents for ${processingType} due diligence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear any cached data (for memory management)
   */
  clearCache(): void {
    // Currently no caching implemented, but method provided for future use
    console.log('Memory cache cleared');
  }
}

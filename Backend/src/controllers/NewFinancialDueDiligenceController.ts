import { Request, Response } from 'express';
import dotenv from 'dotenv';
import NewFinancialDueDiligenceReport from '../models/Analytics/NewFinancialDueDiligenceReport';
import DocumentModel, { DocumentType, FinancialDocumentType } from '../models/Profile/Document';
import ApiUsageModel from '../models/ApiUsageModel/ApiUsage';
import StartupProfileModel from '../models/Profile/StartupProfile';
import InvestorProfileModel from '../models/InvestorModels/InvestorProfile';
import newFinancialDueDiligenceService from '../services/NewFinancialDueDiligenceService';
import fileLogger from '../utils/fileLogger';
import { MemoryBasedOcrPdfService, DocumentMetadata } from '../services/MemoryBasedOcrPdfService';
import fs from 'fs/promises';
import path from 'path';
import { Types } from 'mongoose';
import { getAllFinancialDocumentTypes, getFinancialDocumentsQuery } from '../utils/documentTypes';

// Load environment variables
dotenv.config();

// Instantiate the OCR service
const memoryBasedOcrService = new MemoryBasedOcrPdfService();
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads'); // Define your uploads directory path

/**
 * Helper function to handle controller errors consistently
 */
const handleControllerError = (
  res: Response,
  error: any,
  message: string,
  statusCode: number = 500
): void => {
  console.error(`${message}:`, error);

  // Check if the error has a specific status code
  const errorStatusCode = error.statusCode || statusCode;

  // Check if the error has a specific message
  const errorMessage = error.message || message;

  res.status(errorStatusCode).json({
    message: errorMessage,
    error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
  });
};

/**
 * Check if financial documents are available for an entity
 */
export const checkDocumentsAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { entityId } = req.params;
    const entityType = req.query.entityType as 'startup' | 'investor' || 'startup';

    if (!entityId) {
      res.status(400).json({ message: 'Entity ID is required' });
      return;
    }

    // Use the complete financial document types from the model definition
    const financialDocumentTypes = getAllFinancialDocumentTypes();

    // Find documents that are financial - use flexible categorization
    // This includes both explicit financial document types AND documents that contain financial keywords
    const documents = await DocumentModel.find({
      userId: entityId,
      $or: [
        // Explicit financial document types
        { documentType: { $in: financialDocumentTypes } },
        // Documents with financial keywords in name (case insensitive)
        { originalName: { $regex: /financial|balance|income|cash|revenue|profit|loss|statement|report|audit|tax|gst|bank/i } },
        // Documents with category set to financial
        { category: 'financial' }
      ]
    });

    // Get entity profile information
    let entityProfile;
    if (entityType === 'startup') {
      entityProfile = await StartupProfileModel.findOne({ userId: entityId });
    } else {
      entityProfile = await InvestorProfileModel.findOne({ userId: entityId });
    }

    // Check if documents are available
    const documentsAvailable = documents.length > 0;

    console.log(`[FINANCIAL DD] Document availability check for ${entityId}: ${documentsAvailable} (${documents.length} financial documents found)`);

    res.status(200).json({
      documentsAvailable,
      documentCount: documents.length,
      documents: documents.map(doc => ({
        id: doc._id,
        originalName: doc.originalName,
        documentType: doc.documentType,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        uploadDate: doc.createdAt
      })),
      entityProfile: entityProfile ? {
        name: entityType === 'startup'
          ? (entityProfile as any).companyName
          : (entityProfile as any).companyName || (entityProfile as any).name
      } : null
    });
  } catch (error) {
    handleControllerError(res, error, 'Error checking documents availability');
  }
};

/**
 * Analyze financial due diligence for an entity
 */
export const analyzeNewFinancialDueDiligence = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { entityId } = req.params;
    const entityType = (req.query.entityType as 'startup' | 'investor') || 'startup';

    console.log(`Processing request for entityId: ${entityId}, entityType: ${entityType || 'startup'}`);

    if (!entityId) {
      res.status(400).json({ message: 'Entity ID is required' });
      return;
    }

    try {
      // Check if we have a recent analysis in MongoDB cache (30 days)
      const existingAnalysis = await NewFinancialDueDiligenceReport.findOne({
        targetEntityId: entityId,
        targetEntityType: entityType,
        // Only use cached results if less than 30 days old
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });

      if (existingAnalysis) {
        console.log('[FINANCIAL DD] Found recent analysis in cache, returning cached result');
        res.status(200).json(existingAnalysis.toObject());
        return;
      }

      // Use the complete financial document types from the model definition
      const financialDocumentTypes = getAllFinancialDocumentTypes();

      // Find financial documents using flexible categorization
      // This includes both explicit financial document types AND documents that contain financial keywords
      const documents = await DocumentModel.find({
        userId: entityId,
        $or: [
          // Explicit financial document types
          { documentType: { $in: financialDocumentTypes } },
          // Documents with financial keywords in name (case insensitive)
          { originalName: { $regex: /financial|balance|income|cash|revenue|profit|loss|statement|report|audit|tax|gst|bank/i } },
          // Documents with category set to financial
          { category: 'financial' },
          // Include ALL "other" category documents for comprehensive financial analysis
          { category: 'other' }
        ]
      });

      if (documents.length === 0) {
        console.log('[FINANCIAL DD] No documents found for entity');
        res.status(404).json({
          message: 'No documents found for financial analysis',
          documentsAvailable: false,
          errorCode: 'NO_DOCUMENTS_FOR_FINANCIAL_ANALYSIS',
          suggestion: 'Please upload financial documents such as balance sheets, income statements, cash flow statements, or any other relevant documents for financial due diligence analysis.'
        });
        return;
      }

      console.log(`[FINANCIAL DD] Found ${documents.length} documents for financial analysis (including financial, other category, and relevant documents)`);
      console.log('[FINANCIAL DD] Document breakdown:', documents.map(doc => ({
        type: doc.documentType,
        category: doc.category,
        name: doc.originalName
      })));

      // Get entity profile information
      let entityProfile;
      let companyName = '';
      if (entityType === 'startup') {
        entityProfile = await StartupProfileModel.findOne({ userId: entityId });
        companyName = entityProfile?.companyName || 'Startup Company';
      } else {
        entityProfile = await InvestorProfileModel.findOne({ userId: entityId });
        companyName = entityProfile?.companyName || 'Investor Company';
      }

      // Check for missing financial document types
      const allFinancialDocumentTypes = getAllFinancialDocumentTypes();

      const availableDocumentTypes = documents.map(doc => doc.documentType);
      const missingDocumentTypes = allFinancialDocumentTypes.filter(
        (type: DocumentType) => !availableDocumentTypes.includes(type)
      );

      console.log(`[FINANCIAL DD] Processing ${documents.length} financial documents, ${missingDocumentTypes.length} document types missing`);

      const pdfsToProcess: Array<{ buffer: Buffer; metadata: DocumentMetadata }> = [];
      let otherDocumentsContent = '';

      for (const doc of documents) {
        if (!doc.fileName) {
          console.warn(`Document ${doc.originalName} (ID: ${doc._id}) is missing fileName, skipping file read.`);
          otherDocumentsContent += `\n\n--- DOCUMENT METADATA: ${doc.originalName} (File path missing) ---\nType: ${doc.documentType}\n--- END OF METADATA ---`;
          continue;
        }
        const filePath = path.join(UPLOADS_DIR, doc.fileName);

        if (doc.fileType?.toLowerCase() === 'pdf' || doc.originalName.toLowerCase().endsWith('.pdf')) {
          try {
            console.log(`[FINANCIAL DD] Preparing PDF for OCR: ${doc.originalName} (Type: ${doc.documentType})`);
            const pdfBuffer = await fs.readFile(filePath);
            const metadata: DocumentMetadata = {
              originalName: doc.originalName,
              documentType: doc.documentType || 'unknown',
              fileType: 'pdf',
              fileSize: doc.fileSize || pdfBuffer.length
            };
            pdfsToProcess.push({ buffer: pdfBuffer, metadata });
          } catch (fileReadError) {
            console.error(`Error reading PDF file ${doc.originalName} at ${filePath}:`, fileReadError);
            otherDocumentsContent += `\n\n--- ERROR READING DOCUMENT: ${doc.originalName} ---\nError: ${fileReadError instanceof Error ? fileReadError.message : String(fileReadError)}\n--- END OF ERROR ---`;
          }
        } else {
          console.log(`Adding non-PDF document to context: ${doc.originalName}`);
          try {
            if (doc.fileType && ['txt', 'md', 'csv'].includes(doc.fileType.toLowerCase())) {
              const textContent = await fs.readFile(filePath, 'utf-8');
              otherDocumentsContent += `\n\n--- START OF DOCUMENT: ${doc.originalName} ---\nType: ${doc.documentType}\n\n${textContent}\n--- END OF DOCUMENT: ${doc.originalName} ---`;
            } else {
              otherDocumentsContent += `\n\n--- DOCUMENT METADATA: ${doc.originalName} ---\nType: ${doc.documentType}\nFile Type: ${doc.fileType || 'unknown'}\n(Content not extracted for this file type)\n--- END OF METADATA ---`;
            }
          } catch (fileReadError) {
            console.error(`Error reading non-PDF file ${doc.originalName} at ${filePath}:`, fileReadError);
            otherDocumentsContent += `\n\n--- ERROR READING DOCUMENT: ${doc.originalName} ---\nError: ${fileReadError instanceof Error ? fileReadError.message : String(fileReadError)}\n--- END OF ERROR ---`;
          }
        }
      }

      let combinedOcrText = '';
      if (pdfsToProcess.length > 0) {
        console.log(`[FINANCIAL DD] Processing ${pdfsToProcess.length} PDF documents with MemoryBasedOcrPdfService...`);
        try {
          combinedOcrText = await memoryBasedOcrService.processMultiplePdfDocuments(pdfsToProcess);
          console.log(`[FINANCIAL DD] PDF OCR processing complete. Text length: ${combinedOcrText.length}`);
        } catch (ocrError) {
          console.error('[FINANCIAL DD] Error during batch PDF OCR processing:', ocrError);
          combinedOcrText = `\n\n--- ERROR DURING BATCH PDF OCR ---\nError: ${ocrError instanceof Error ? ocrError.message : String(ocrError)}\n--- END OF OCR ERROR ---`;
        }
      }

      const fullDocumentContext = `
${combinedOcrText}

${otherDocumentsContent}
      `.trim();

      console.log(`[FINANCIAL DD] Preparing to call Gemini for financial analysis...`);
      console.log(`[FINANCIAL DD] Generating financial due diligence report for ${companyName} (${entityType})`);
      const financialData = await newFinancialDueDiligenceService.generateFinancialDueDiligenceReport(
        fullDocumentContext,
        companyName,
        entityType,
        missingDocumentTypes
      );

      const financialReport = new NewFinancialDueDiligenceReport({
        targetEntityId: entityId,
        targetEntityType: entityType,
        requestedById: req.user.userId,
        companyName: financialData.companyName || companyName,
        reportDate: financialData.reportDate ? new Date(financialData.reportDate) : new Date(),
        generatedBy: 'KarmicDD AI',
        introduction: financialData.introduction || `This report presents the findings of the financial due diligence conducted on ${companyName} as of ${new Date().toISOString().split('T')[0]}.`,
        items: financialData.items || [],
        missingDocuments: financialData.missingDocuments || {
          documentList: missingDocumentTypes.map(docType => ({
            documentCategory: "Financial Document",
            specificDocument: docType,
            requirementReference: "Required for analysis"
          })),
          note: "The following documents were not available for analysis."
        },
        riskScore: financialData.riskScore || {
          score: "N/A",
          riskLevel: "Unknown",
          justification: "Unable to assess risk due to insufficient data."
        },
        disclaimer: financialData.disclaimer,
        availableDocuments: documents.map(doc => ({
          documentId: String(doc._id),
          documentName: doc.originalName,
          documentType: doc.documentType,
          uploadDate: doc.createdAt || new Date()
        })),
        documentSources: documents.map(doc => String(doc._id)),
        status: 'final',
        reportCalculated: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      try {
        console.log('Saving financial report to MongoDB...');
        const reportLogPath = fileLogger.logObjectToJsonFile(financialReport.toObject(), 'financial_dd_mongodb_report');
        console.log(`Financial report object logged to: ${reportLogPath}`);

        const savedReport = await financialReport.save();
        console.log('Financial report saved successfully with ID:', savedReport._id);

        fileLogger.logObjectToJsonFile(
          {
            reportId: String(savedReport._id),
            savedAt: new Date().toISOString(),
            report: savedReport.toObject()
          },
          'financial_dd_saved_report'
        );

        res.status(200).json(savedReport.toObject());
      } catch (error) {
        handleControllerError(res, error, 'Error saving financial report to MongoDB');
        return;
      }
    } catch (error) {
      handleControllerError(res, error, 'Error analyzing financial due diligence');
      return;
    }
  } catch (error) {
    handleControllerError(
      res,
      error,
      'Error analyzing financial due diligence',
      500
    );
  }
};

/**
 * Get a financial due diligence report for an entity
 */
export const getNewFinancialDueDiligenceReport = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { entityId } = req.params;
    const entityType = req.query.entityType as 'startup' | 'investor';

    console.log(`[FINANCIAL DD] Getting financial due diligence report for entityId: ${entityId}, entityType: ${entityType}`);

    if (!entityId) {
      res.status(400).json({ message: 'Entity ID is required' });
      return;
    }

    if (!entityType) {
      console.log('[FINANCIAL DD] No entityType provided, defaulting to startup');
    }

    const finalEntityType = entityType || 'startup';

    try {
      const report = await NewFinancialDueDiligenceReport.findOne({
        targetEntityId: entityId,
        targetEntityType: finalEntityType
      }).sort({ createdAt: -1 });

      if (!report) {
        console.log(`[FINANCIAL DD] No report found for entityId: ${entityId}, entityType: ${finalEntityType}`);

        // Use the complete financial document types from the model definition
        // Use the complete financial document types from the model definition
        const financialDocumentTypes = getAllFinancialDocumentTypes();

        // Find financial documents using flexible categorization
        // This includes both explicit financial document types AND documents that contain financial keywords
        const documents = await DocumentModel.find({
          userId: entityId,
          $or: [
            // Explicit financial document types
            { documentType: { $in: financialDocumentTypes } },
            // Documents with financial keywords in name (case insensitive)
            { originalName: { $regex: /financial|balance|income|cash|revenue|profit|loss|statement|report|audit|tax|gst|bank/i } },
            // Documents with category set to financial
            { category: 'financial' }
          ]
        });

        if (documents.length === 0) {
          console.log('[FINANCIAL DD] No financial documents found for entity');
          res.status(404).json({
            message: 'No financial documents found for this entity',
            documentsAvailable: false,
            errorCode: 'NO_FINANCIAL_DOCUMENTS',
            suggestion: 'Please upload financial documents such as balance sheets, income statements, cash flow statements, etc.'
          });
          return;
        }

        res.status(404).json({
          message: 'Financial due diligence report not found. Financial documents are available, please generate a report.',
          documentsAvailable: true,
          documentCount: documents.length
        });
        return;
      }

      if (report.reportCalculated === false) {
        console.log('[FINANCIAL DD] Report exists but was not successfully calculated');
        res.status(200).json({
          ...report.toObject(),
          message: 'Financial due diligence report exists but was not successfully calculated',
          reportId: report._id,
          reportCalculated: false
        });
        return;
      }

      console.log('[FINANCIAL DD] Found valid report, returning data');
      res.status(200).json(report.toObject());
    } catch (dbError) {
      console.error('Database error when fetching report:', dbError);
      res.status(500).json({
        message: 'Error retrieving financial due diligence report from database',
        error: process.env.NODE_ENV === 'development' ?
          (dbError instanceof Error ? dbError.toString() : String(dbError)) :
          undefined
      });
    }
  } catch (error) {
    handleControllerError(
      res,
      error,
      'Error getting financial due diligence report',
      500
    );
  }
};

/**
 * Generate a new financial due diligence report for an entity
 */
export const generateNewFinancialDueDiligenceReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { entityId } = req.params;
    const { entityType, companyName, startupInfo, investorInfo, missingDocumentTypes, additionalDataSources } = req.body;

    if (!req.user?.userId) {
      return handleControllerError(res, new Error('Unauthorized'), 'User not authenticated', 401);
    }
    if (!entityId) {
      return handleControllerError(res, new Error('Entity ID is required'), 'Entity ID missing', 400);
    }
    if (!entityType) {
      return handleControllerError(res, new Error('Entity type is required'), 'Entity type missing', 400);
    }

    console.log(`[FINANCIAL DD] Generating report for entityId: ${entityId}, entityType: ${entityType}`);

    // Use the complete financial document types from the model definition
    const financialDocumentTypes = getAllFinancialDocumentTypes();

    // Fetch financial documents using flexible categorization
    const entityDocuments = await DocumentModel.find({
      userId: entityId,
      $or: [
        // Explicit financial document types
        { documentType: { $in: financialDocumentTypes } },
        // Documents with financial keywords in name (case insensitive)
        { originalName: { $regex: /financial|balance|income|cash|revenue|profit|loss|statement|report|audit|tax|gst|bank/i } },
        // Documents with category set to financial
        { category: 'financial' }
      ]
    });

    if (!entityDocuments || entityDocuments.length === 0) {
      return handleControllerError(res, new Error('No financial documents found for this entity'), 'No financial documents available', 404);
    }
    console.log(`[FINANCIAL DD] Found ${entityDocuments.length} financial documents for entity ${entityId}:`,
      entityDocuments.map(doc => ({ type: doc.documentType, name: doc.originalName })));

    const pdfsToProcess: Array<{ buffer: Buffer; metadata: DocumentMetadata }> = [];
    let otherDocumentsContent = '';

    for (const doc of entityDocuments) {
      if (!doc.fileName) {
        console.warn(`Document ${doc.originalName} (ID: ${doc._id}) is missing fileName, skipping file read.`);
        otherDocumentsContent += `\n\n--- DOCUMENT METADATA: ${doc.originalName} (File path missing) ---\nType: ${doc.documentType}\n--- END OF METADATA ---`;
        continue;
      }
      const filePath = path.join(UPLOADS_DIR, doc.fileName);

      if (doc.fileType?.toLowerCase() === 'pdf' || doc.originalName.toLowerCase().endsWith('.pdf')) {
        try {
          console.log(`[FINANCIAL DD] Preparing PDF for OCR: ${doc.originalName} (Type: ${doc.documentType})`);
          const pdfBuffer = await fs.readFile(filePath);
          const metadata: DocumentMetadata = {
            originalName: doc.originalName,
            documentType: doc.documentType || 'unknown',
            fileType: 'pdf',
            fileSize: doc.fileSize || pdfBuffer.length
          };
          pdfsToProcess.push({ buffer: pdfBuffer, metadata });
        } catch (fileReadError) {
          console.error(`[FINANCIAL DD] Error reading PDF file ${doc.originalName} at ${filePath}:`, fileReadError);
          otherDocumentsContent += `\n\n--- ERROR READING DOCUMENT: ${doc.originalName} ---\nError: ${fileReadError instanceof Error ? fileReadError.message : String(fileReadError)}\n--- END OF ERROR ---`;
        }
      } else {
        console.log(`Adding non-PDF document to context: ${doc.originalName}`);
        try {
          if (doc.fileType && ['txt', 'md', 'csv'].includes(doc.fileType.toLowerCase())) {
            const textContent = await fs.readFile(filePath, 'utf-8');
            otherDocumentsContent += `\n\n--- START OF DOCUMENT: ${doc.originalName} ---\nType: ${doc.documentType}\n\n${textContent}\n--- END OF DOCUMENT: ${doc.originalName} ---`;
          } else {
            otherDocumentsContent += `\n\n--- DOCUMENT METADATA: ${doc.originalName} ---\nType: ${doc.documentType}\nFile Type: ${doc.fileType || 'unknown'}\n(Content not extracted for this file type)\n--- END OF METADATA ---`;
          }
        } catch (fileReadError) {
          console.error(`[FINANCIAL DD] Error reading non-PDF file ${doc.originalName} at ${filePath}:`, fileReadError);
          otherDocumentsContent += `\n\n--- ERROR READING DOCUMENT: ${doc.originalName} ---\nError: ${fileReadError instanceof Error ? fileReadError.message : String(fileReadError)}\n--- END OF ERROR ---`;
        }
      }
    }

    let combinedOcrText = '';
    if (pdfsToProcess.length > 0) {
      console.log(`Processing ${pdfsToProcess.length} PDF documents with MemoryBasedOcrPdfService...`);
      try {
        combinedOcrText = await memoryBasedOcrService.processMultiplePdfDocuments(pdfsToProcess);
        console.log(`[FINANCIAL DD] PDF OCR processing complete. Text length: ${combinedOcrText.length}`);
      } catch (ocrError) {
        console.error('[FINANCIAL DD] Error during batch PDF OCR processing:', ocrError);
        combinedOcrText = `\n\n--- ERROR DURING BATCH PDF OCR ---\nError: ${ocrError instanceof Error ? ocrError.message : String(ocrError)}\n--- END OF OCR ERROR ---`;
      }
    }

    const fullDocumentContext = `
${combinedOcrText}

${otherDocumentsContent}
    `.trim();

    console.log('[FINANCIAL DD] Preparing to call Gemini for financial analysis...');

    // Entity IDs are UUIDs (strings), not MongoDB ObjectIds
    if (!entityId || typeof entityId !== 'string') {
      return handleControllerError(res, new Error(`Invalid entityId: ${entityId}`), 'Invalid entity ID', 400);
    }

    if (!req.user.userId || typeof req.user.userId !== 'string') {
      return handleControllerError(res, new Error(`Invalid userId: ${req.user.userId}`), 'Invalid user ID', 400);
    }

    // Call the service to get financial analysis
    const actualFinancialAnalysisResult = await newFinancialDueDiligenceService.generateFinancialDueDiligenceReport(
      fullDocumentContext,
      companyName, // This should be defined earlier in the function from req.body or fetched
      entityType,
      missingDocumentTypes || [] // Ensure missingDocumentTypes is an array
    );

    const reportData: any = {
      targetEntityId: entityId,
      targetEntityType: entityType,
      reportDate: new Date(),
      status: 'completed',
      version: 1,
      companyName: actualFinancialAnalysisResult.companyName || companyName,
      introduction: actualFinancialAnalysisResult.introduction || `Financial due diligence report for ${companyName}.`,
      items: actualFinancialAnalysisResult.items || [],
      missingDocuments: actualFinancialAnalysisResult.missingDocuments || {
        documentList: (missingDocumentTypes || []).map((docType: string) => ({
          documentCategory: "Financial Document",
          specificDocument: docType,
          requirementReference: "Required for analysis"
        })),
        note: "The following documents were not available for analysis or were explicitly listed as missing."
      },
      riskScore: actualFinancialAnalysisResult.riskScore || {
        score: "N/A",
        riskLevel: "Unknown",
        justification: "Risk assessment pending or could not be determined."
      },
      disclaimer: actualFinancialAnalysisResult.disclaimer || "This report is generated based on the provided documents and automated analysis. It should be used for informational purposes only.",
      availableDocuments: entityDocuments.map(doc => ({
        documentId: String(doc._id),
        documentName: doc.originalName,
        documentType: doc.documentType,
        uploadDate: doc.createdAt || new Date()
      })),
      documentSources: entityDocuments.map(doc => String(doc._id)),
      _rawContentPreview: fullDocumentContext.substring(0, 2000) + (fullDocumentContext.length > 2000 ? "..." : ""),
      generatedBy: 'KarmicDD AI',
      requestedById: req.user.userId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      reportCalculated: true,
    };

    let existingReport = await NewFinancialDueDiligenceReport.findOne({
      targetEntityId: entityId,
      targetEntityType: entityType
    });

    if (existingReport) {
      console.log(`Updating existing report for entity ${entityId}`);
      existingReport.set({
        ...reportData,
        updatedAt: new Date(),
      });
      await existingReport.save();
      res.status(200).json(existingReport);
    } else {
      console.log(`Creating new report for entity ${entityId}`);
      const newReport = new NewFinancialDueDiligenceReport(reportData);
      await newReport.save();
      res.status(201).json(newReport);
    }

  } catch (error) {
    handleControllerError(res, error, 'Failed to generate new financial due diligence report');
  }
};

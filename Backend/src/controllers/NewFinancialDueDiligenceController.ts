import { Request, Response } from 'express';
import dotenv from 'dotenv';
import NewFinancialDueDiligenceReport from '../models/Analytics/NewFinancialDueDiligenceReport';
import DocumentModel, { DocumentType } from '../models/Profile/Document';
import ApiUsageModel from '../models/ApiUsageModel/ApiUsage';
import StartupProfileModel from '../models/Profile/StartupProfile';
import InvestorProfileModel from '../models/InvestorModels/InvestorProfile';
import newFinancialDueDiligenceService from '../services/NewFinancialDueDiligenceService';
import fileLogger from '../utils/fileLogger';
import { MemoryBasedOcrPdfService, DocumentMetadata } from '../services/MemoryBasedOcrPdfService';
import fs from 'fs/promises';
import path from 'path';
import { Types } from 'mongoose';

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

    // Find ALL documents for the entity to ensure comprehensive analysis
    const documents = await DocumentModel.find({ userId: entityId });

    // Get entity profile information
    let entityProfile;
    if (entityType === 'startup') {
      entityProfile = await StartupProfileModel.findOne({ userId: entityId });
    } else {
      entityProfile = await InvestorProfileModel.findOne({ userId: entityId });
    }

    // Check if documents are available
    const documentsAvailable = documents.length > 0;

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
        console.log('Found recent analysis in cache, returning cached result');
        res.status(200).json(existingAnalysis.toObject());
        return;
      }

      // Find financial documents for the entity
      const documents = await DocumentModel.find({
        userId: entityId
      });

      if (documents.length === 0) {
        console.log('No financial documents found for entity');
        res.status(404).json({
          message: 'No financial documents found for this entity',
          documentsAvailable: false
        });
        return;
      }

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

      // Check for missing document types
      const allFinancialDocumentTypes: DocumentType[] = [
        'financial_balance_sheet',
        'financial_income_statement',
        'financial_cash_flow',
        'financial_tax_returns',
        'financial_audit_report',
        'financial_bank_statements',
        'financial_gst_returns',
        'financial_projections'
      ];

      const availableDocumentTypes = documents.map(doc => doc.documentType);
      const missingDocumentTypes = allFinancialDocumentTypes.filter(
        (type: DocumentType) => !availableDocumentTypes.includes(type)
      );

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
            console.log(`Preparing PDF for OCR: ${doc.originalName}`);
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
        console.log(`Processing ${pdfsToProcess.length} PDF documents with MemoryBasedOcrPdfService...`);
        try {
          combinedOcrText = await memoryBasedOcrService.processMultiplePdfDocuments(pdfsToProcess);
          console.log(`PDF OCR processing complete. Text length: ${combinedOcrText.length}`);
        } catch (ocrError) {
          console.error('Error during batch PDF OCR processing:', ocrError);
          combinedOcrText = `\n\n--- ERROR DURING BATCH PDF OCR ---\nError: ${ocrError instanceof Error ? ocrError.message : String(ocrError)}\n--- END OF OCR ERROR ---`;
        }
      }

      const fullDocumentContext = `
${combinedOcrText}

${otherDocumentsContent}
      `.trim();

      console.log('Generating financial due diligence report...');
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

    console.log(`Getting financial due diligence report for entityId: ${entityId}, entityType: ${entityType}`);

    if (!entityId) {
      res.status(400).json({ message: 'Entity ID is required' });
      return;
    }

    if (!entityType) {
      console.log('No entityType provided, defaulting to startup');
    }

    const finalEntityType = entityType || 'startup';

    try {
      const report = await NewFinancialDueDiligenceReport.findOne({
        targetEntityId: entityId,
        targetEntityType: finalEntityType
      }).sort({ createdAt: -1 });

      if (!report) {
        console.log(`No report found for entityId: ${entityId}, entityType: ${finalEntityType}`);

        const documents = await DocumentModel.find({
          userId: entityId
        });

        if (documents.length === 0) {
          console.log('No financial documents found for entity');
          res.status(404).json({
            message: 'No financial documents found for this entity',
            documentsAvailable: false
          });
          return;
        }

        res.status(404).json({
          message: 'Financial due diligence report not found. Documents are available, please generate a report.',
          documentsAvailable: true,
          documentCount: documents.length
        });
        return;
      }

      if (report.reportCalculated === false) {
        console.log('Report exists but was not successfully calculated');
        res.status(200).json({
          ...report.toObject(),
          message: 'Financial due diligence report exists but was not successfully calculated',
          reportId: report._id,
          reportCalculated: false
        });
        return;
      }

      console.log('Found valid report, returning data');
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

    console.log(`Generating report for entityId: ${entityId}, entityType: ${entityType}`);

    const entityDocuments = await DocumentModel.find({ userId: entityId });

    if (!entityDocuments || entityDocuments.length === 0) {
      return handleControllerError(res, new Error('No documents found for this entity'), 'No documents available', 404);
    }
    console.log(`Found ${entityDocuments.length} documents for entity ${entityId}`);

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
          console.log(`Preparing PDF for OCR: ${doc.originalName}`);
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
      console.log(`Processing ${pdfsToProcess.length} PDF documents with MemoryBasedOcrPdfService...`);
      try {
        combinedOcrText = await memoryBasedOcrService.processMultiplePdfDocuments(pdfsToProcess);
        console.log(`PDF OCR processing complete. Text length: ${combinedOcrText.length}`);
      } catch (ocrError) {
        console.error('Error during batch PDF OCR processing:', ocrError);
        combinedOcrText = `\n\n--- ERROR DURING BATCH PDF OCR ---\nError: ${ocrError instanceof Error ? ocrError.message : String(ocrError)}\n--- END OF OCR ERROR ---`;
      }
    }

    const fullDocumentContext = `
${combinedOcrText}

${otherDocumentsContent}
    `.trim();

    console.log('Preparing to call Gemini for financial analysis...');

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

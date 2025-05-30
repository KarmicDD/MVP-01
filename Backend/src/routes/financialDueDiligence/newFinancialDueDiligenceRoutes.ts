import express from 'express';
import { authenticateJWT } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';

// Import document details controller for reuse
import {
  getEntityDocumentDetails
} from '../../controllers/EntityFinancialDueDiligenceController';

// Import all the new controller functions
import {
  analyzeNewFinancialDueDiligence,
  getNewFinancialDueDiligenceReport,
  generateNewFinancialDueDiligenceReport,
  checkDocumentsAvailability
} from '../../controllers/NewFinancialDueDiligenceController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

/**
 * This file has been updated to use the new controller functions specifically designed
 * for the new financial due diligence feature. These controllers use the new MongoDB model
 * (NewFinancialDueDiligenceReport) instead of the draft model.
 */

// Check if financial documents are available for an entity
// We can still reuse this implementation as it only checks document availability
router.get('/entity/:entityId/documents', asyncHandler(getEntityDocumentDetails));

// Check document availability with the new controller
router.get('/entity/:entityId/check-documents', asyncHandler(checkDocumentsAvailability));

// Analyze financial due diligence for an entity using the new Gemini model
router.get('/entity/:entityId/analyze', asyncHandler(analyzeNewFinancialDueDiligence));

// Get a financial due diligence report for an entity
router.get('/entity/:entityId', asyncHandler(getNewFinancialDueDiligenceReport));

// Generate a new financial due diligence report for an entity
router.post('/entity/:entityId/generate', asyncHandler(generateNewFinancialDueDiligenceReport));

export default router;

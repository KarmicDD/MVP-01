import express from 'express';
import { authenticateJWT } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';

// Import controller functions
import {
    checkLegalDocumentsAvailability,
    analyzeNewLegalDueDiligence,
    getLegalDueDiligenceReports,
    getLegalDueDiligenceReportById,
    deleteLegalDueDiligenceReport,
    healthCheck
} from '../../controllers/NewLegalDueDiligenceController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

/**
 * Legal Due Diligence Routes
 * 
 * These routes handle the new legal due diligence feature using AI-powered analysis
 * of legal documents through the Gemini API with specialized legal prompts.
 * 
 * All routes require JWT authentication and follow RESTful conventions.
 */

// Health check endpoint for legal due diligence service
router.get('/health', asyncHandler(healthCheck));

// Check if legal documents are available for an entity
router.get('/entity/:entityId/check-documents', asyncHandler(checkLegalDocumentsAvailability));

// Analyze legal due diligence for an entity using the new Gemini model
router.post('/entity/:entityId/analyze', asyncHandler(analyzeNewLegalDueDiligence));

// Get all legal due diligence reports for an entity
router.get('/entity/:entityId/reports', asyncHandler(getLegalDueDiligenceReports));

// Get a specific legal due diligence report by ID
router.get('/reports/:reportId', asyncHandler(getLegalDueDiligenceReportById));

// Delete a specific legal due diligence report
router.delete('/reports/:reportId', asyncHandler(deleteLegalDueDiligenceReport));

export default router;

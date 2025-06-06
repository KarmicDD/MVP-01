import express from 'express';
import { authenticateJWT } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';

// Import new legal due diligence routes
import newLegalDueDiligenceRoutes from './newLegalDueDiligenceRoutes';
import entityLegalDueDiligenceRoutes from './entityLegalDueDiligenceRoutes';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

/**
 * Main Legal Due Diligence Routes
 * 
 * This file consolidates all legal due diligence related routes and provides
 * a unified entry point for the legal DD functionality.
 * 
 * Route Structure:
 * - /api/legal-due-diligence/new/* - New legal DD analysis endpoints
 * - /api/legal-due-diligence/entity/* - Entity-specific legal DD endpoints
 * 
 * Features:
 * - AI-powered legal document analysis using Gemini API
 * - Comprehensive corporate structure review
 * - Regulatory compliance assessment
 * - Legal risk identification and scoring
 * - Corporate governance evaluation
 * - Material agreement analysis
 * - Intellectual property review
 * - Litigation and dispute assessment
 */

// New legal due diligence routes (document-based analysis)
router.use('/new', newLegalDueDiligenceRoutes);

// Entity legal due diligence routes (comprehensive entity analysis)
router.use('/entity', entityLegalDueDiligenceRoutes);

export default router;

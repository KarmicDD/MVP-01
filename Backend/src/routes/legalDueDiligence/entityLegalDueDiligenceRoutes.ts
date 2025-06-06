import express from 'express';
import { authenticateJWT } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';

// Import controller functions from EntityLegalDueDiligenceController
import {
    getLegalDueDiligenceForEntity,
    getLegalDueDiligenceHistory,
    getEntityLegalProfile
} from '../../controllers/EntityLegalDueDiligenceController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

/**
 * Entity Legal Due Diligence Routes
 * 
 * These routes provide comprehensive legal due diligence analysis for entities
 * with caching, rate limiting, and detailed legal risk assessment.
 * 
 * Features:
 * - Intelligent caching (7-day cache for legal analysis)
 * - Rate limiting (100 requests per day)
 * - Comprehensive legal document analysis
 * - Legal risk assessment and compliance checking
 * - Corporate governance evaluation
 * - Regulatory compliance verification
 */

// Get comprehensive legal due diligence analysis for an entity
// This is the main endpoint that generates or retrieves cached legal DD reports
// Query parameters:
// - entityType: 'startup' | 'investor' (default: 'startup')
// - forceRefresh: 'true' | 'false' (default: 'false') - bypasses cache
router.get('/entity/:entityId', asyncHandler(getLegalDueDiligenceForEntity));

// Get legal due diligence history for an entity
// Returns a list of all legal DD reports generated for the entity
// Query parameters:
// - entityType: 'startup' | 'investor' (default: 'startup')
// - limit: number (default: 10) - maximum number of reports to return
router.get('/entity/:entityId/history', asyncHandler(getLegalDueDiligenceHistory));

// Get entity profile with legal due diligence summary
// Returns entity profile information along with legal DD summary
// Query parameters:
// - entityType: 'startup' | 'investor' (default: 'startup')
router.get('/entity/:entityId/profile', asyncHandler(getEntityLegalProfile));

export default router;

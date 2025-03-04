import express from 'express';
import { authenticateJWT, authorizeRole } from '../middleware/auth';
import { batchAnalyzeCompatibility, getStartupInvestorCompatibility } from '../controllers/compatibilityController';

const router = express.Router();

// Get detailed compatibility between a specific startup and investor
router.get(
    '/compatibility/:startupId/:investorId',
    authenticateJWT,
    getStartupInvestorCompatibility
);

// Get batch compatibility analysis based on user role
router.get(
    '/compatibility/batch',
    authenticateJWT,
    batchAnalyzeCompatibility
);

// Get AI-enhanced compatibility for startups
router.get(
    '/compatibility/startup',
    authenticateJWT,
    authorizeRole(['startup']),
    batchAnalyzeCompatibility
);

// Get AI-enhanced compatibility for investors
router.get(
    '/compatibility/investor',
    authenticateJWT,
    authorizeRole(['investor']),
    batchAnalyzeCompatibility
);

export default router;
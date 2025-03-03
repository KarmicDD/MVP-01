// routes/matchingRoutes.ts
import express from 'express';
import {
    findMatchesForStartup,
    findMatchesForInvestor
} from '../controllers/matchingController';
import { authenticateJWT, authorizeRole } from '../middleware/auth';

const router = express.Router();

// Get matches for startups
router.get(
    '/startup',
    authenticateJWT,
    authorizeRole(['startup']),
    findMatchesForStartup
);

// Get matches for investors
router.get(
    '/investor',
    authenticateJWT,
    authorizeRole(['investor']),
    findMatchesForInvestor
);

export default router;
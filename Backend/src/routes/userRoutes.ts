import express from 'express';
import { getUserProfile, getStartupDashboard, getInvestorDashboard } from '../controllers/userController';
import { authenticateJWT, authorizeRole } from '../middleware/auth';

const router = express.Router();

// Get user profile - requires authentication
router.get('/profile', authenticateJWT, getUserProfile);

// Startup-specific routes
router.get(
    '/startup/dashboard',
    authenticateJWT,
    authorizeRole(['startup']),
    getStartupDashboard
);

// Investor-specific routes
router.get(
    '/investor/dashboard',
    authenticateJWT,
    authorizeRole(['investor']),
    getInvestorDashboard
);

export default router;
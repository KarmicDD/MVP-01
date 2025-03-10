import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import { getFilterOptions, searchInvestors, searchStartups } from '../controllers/searchControllers';


const router = express.Router();

// Search APIs
router.get('/startups', authenticateJWT, searchStartups);
router.get('/investors', authenticateJWT, searchInvestors);
router.get('/options', authenticateJWT, getFilterOptions);

export default router;
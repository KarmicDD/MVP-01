import express from 'express';
import { authenticateJWT } from '../../middleware/auth';
import {
    recordDocumentView,
    recordDocumentDownload,
    getDocumentAnalytics,
    getUserDocumentAnalytics
} from '../../controllers/documentAnalyticsController';
import {
    recordDailyAnalytics,
    getDailyAnalytics,
    getAnalyticsChanges
} from '../../controllers/dailyAnalyticsController';

const router = express.Router();

// Document analytics routes
router.post('/document-view', authenticateJWT, recordDocumentView);
router.post('/document-download', authenticateJWT, recordDocumentDownload);
router.get('/document/:documentId', authenticateJWT, getDocumentAnalytics);
router.get('/user-documents', authenticateJWT, getUserDocumentAnalytics);

// Daily analytics routes
router.post('/daily', authenticateJWT, recordDailyAnalytics);
router.get('/daily', authenticateJWT, getDailyAnalytics);
router.get('/changes', authenticateJWT, getAnalyticsChanges);

export default router;

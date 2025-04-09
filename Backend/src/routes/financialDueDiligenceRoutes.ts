import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import {
    upload,
    uploadFinancialDocuments,
    generateFinancialAnalysis,
    getFinancialReports,
    getFinancialReport,
    generatePdfReport
} from '../controllers/financialDueDiligenceController';
import {
    analyzeFinancialDueDiligence,
    getFinancialDueDiligenceReport,
    shareFinancialDueDiligenceReport,
    exportFinancialDueDiligenceReportPdf
} from '../controllers/FinancialDueDiligenceMatchController';

const router = express.Router();

// Upload financial documents
router.post(
    '/upload',
    authenticateJWT,
    upload.array('documents', 10),
    uploadFinancialDocuments
);

// Generate financial analysis
router.post(
    '/generate',
    authenticateJWT,
    generateFinancialAnalysis
);

// Get all financial reports for a user
router.get(
    '/reports',
    authenticateJWT,
    getFinancialReports
);

// Get a specific financial report
router.get(
    '/reports/:reportId',
    authenticateJWT,
    getFinancialReport
);

// Generate PDF report
router.get(
    '/reports/:reportId/pdf',
    authenticateJWT,
    generatePdfReport
);

// Match-based financial due diligence routes
router.get(
    '/match/:startupId/:investorId',
    authenticateJWT,
    analyzeFinancialDueDiligence
);

router.get(
    '/match/:startupId/:investorId/report',
    authenticateJWT,
    getFinancialDueDiligenceReport
);

router.post(
    '/match/:startupId/:investorId/share',
    authenticateJWT,
    shareFinancialDueDiligenceReport
);

router.get(
    '/match/:startupId/:investorId/pdf',
    authenticateJWT,
    exportFinancialDueDiligenceReportPdf
);

export default router;

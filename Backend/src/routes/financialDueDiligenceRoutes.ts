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

/**
 * @swagger
 * /financial/upload:
 *   post:
 *     tags:
 *       - Financial Due Diligence
 *     summary: Upload financial documents
 *     description: Upload financial documents for analysis
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Financial documents to upload (max 10)
 *               documentType:
 *                 type: string
 *                 enum: [balance_sheet, income_statement, cash_flow, tax_return, financial_projection]
 *                 description: Type of financial document
 *               fiscalYear:
 *                 type: string
 *                 description: Fiscal year of the document
 *               description:
 *                 type: string
 *                 description: Description of the document
 *             required:
 *               - documents
 *               - documentType
 *     responses:
 *       '200':
 *         description: Documents uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Documents uploaded successfully
 *                 documentIds:
 *                   type: array
 *                   items:
 *                     type: string
 *       '400':
 *         description: Invalid input or file type
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.post(
    '/upload',
    authenticateJWT,
    upload.array('documents', 10),
    uploadFinancialDocuments
);

/**
 * @swagger
 * /financial/generate:
 *   post:
 *     tags:
 *       - Financial Due Diligence
 *     summary: Generate financial analysis
 *     description: Generate financial analysis from uploaded documents
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *                 description: Name of the company
 *               reportType:
 *                 type: string
 *                 enum: [analysis, audit]
 *                 description: Type of financial report to generate
 *               documentIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: IDs of uploaded documents to analyze
 *             required:
 *               - companyName
 *               - reportType
 *               - documentIds
 *     responses:
 *       '200':
 *         description: Financial analysis generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Financial report generated successfully
 *                 reportId:
 *                   type: string
 *                 report:
 *                   $ref: '#/components/schemas/FinancialReport'
 *       '400':
 *         description: Invalid input
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Documents not found
 *       '500':
 *         description: Server error
 */
router.post(
    '/generate',
    authenticateJWT,
    generateFinancialAnalysis
);

/**
 * @swagger
 * /financial/reports:
 *   get:
 *     tags:
 *       - Financial Due Diligence
 *     summary: Get all financial reports
 *     description: Get all financial reports for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *       - name: limit
 *         in: query
 *         description: Number of results per page
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *       - name: reportType
 *         in: query
 *         description: Filter by report type
 *         schema:
 *           type: string
 *           enum: [analysis, audit]
 *     responses:
 *       '200':
 *         description: Reports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reports:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FinancialReport'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.get(
    '/reports',
    authenticateJWT,
    getFinancialReports
);

/**
 * @swagger
 * /financial/reports/{reportId}:
 *   get:
 *     tags:
 *       - Financial Due Diligence
 *     summary: Get a specific financial report
 *     description: Get a specific financial report by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: reportId
 *         in: path
 *         description: ID of the financial report
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FinancialReport'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden - Not the owner of the report
 *       '404':
 *         description: Report not found
 *       '500':
 *         description: Server error
 */
router.get(
    '/reports/:reportId',
    authenticateJWT,
    getFinancialReport
);

/**
 * @swagger
 * /financial/reports/{reportId}/pdf:
 *   get:
 *     tags:
 *       - Financial Due Diligence
 *     summary: Generate PDF report
 *     description: Generate a PDF version of a financial report
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: reportId
 *         in: path
 *         description: ID of the financial report
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: PDF generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden - Not the owner of the report
 *       '404':
 *         description: Report not found
 *       '500':
 *         description: Server error
 */
router.get(
    '/reports/:reportId/pdf',
    authenticateJWT,
    generatePdfReport
);

/**
 * @swagger
 * /financial/match/{startupId}/{investorId}:
 *   get:
 *     tags:
 *       - Financial Due Diligence
 *     summary: Analyze financial due diligence
 *     description: Analyze financial due diligence between a startup and an investor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: startupId
 *         in: path
 *         description: ID of the startup
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: investorId
 *         in: path
 *         description: ID of the investor
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 analysisId:
 *                   type: string
 *                 summary:
 *                   type: string
 *                 metrics:
 *                   type: object
 *                   additionalProperties: true
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     type: string
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Startup or investor profile not found
 *       '500':
 *         description: Server error
 */
router.get(
    '/match/:startupId/:investorId',
    authenticateJWT,
    analyzeFinancialDueDiligence
);

/**
 * @swagger
 * /financial/match/{startupId}/{investorId}/report:
 *   get:
 *     tags:
 *       - Financial Due Diligence
 *     summary: Get financial due diligence report
 *     description: Get the financial due diligence report between a startup and an investor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: startupId
 *         in: path
 *         description: ID of the startup
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: investorId
 *         in: path
 *         description: ID of the investor
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: Report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 report:
 *                   $ref: '#/components/schemas/FinancialReport'
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Report not found
 *       '500':
 *         description: Server error
 */
router.get(
    '/match/:startupId/:investorId/report',
    authenticateJWT,
    getFinancialDueDiligenceReport
);

/**
 * @swagger
 * /financial/match/{startupId}/{investorId}/share:
 *   post:
 *     tags:
 *       - Financial Due Diligence
 *     summary: Share financial due diligence report
 *     description: Share the financial due diligence report with specified recipients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: startupId
 *         in: path
 *         description: ID of the startup
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: investorId
 *         in: path
 *         description: ID of the investor
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emails:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *                 description: List of recipient email addresses
 *               message:
 *                 type: string
 *                 description: Optional personal message to include
 *             required:
 *               - emails
 *     responses:
 *       '200':
 *         description: Report shared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Report shared successfully
 *                 recipientCount:
 *                   type: integer
 *       '400':
 *         description: Invalid input
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Report not found
 *       '500':
 *         description: Server error
 */
router.post(
    '/match/:startupId/:investorId/share',
    authenticateJWT,
    shareFinancialDueDiligenceReport
);

/**
 * @swagger
 * /financial/match/{startupId}/{investorId}/pdf:
 *   get:
 *     tags:
 *       - Financial Due Diligence
 *     summary: Export financial due diligence report as PDF
 *     description: Export the financial due diligence report as a PDF document
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: startupId
 *         in: path
 *         description: ID of the startup
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: investorId
 *         in: path
 *         description: ID of the investor
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       '200':
 *         description: PDF generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Report not found
 *       '500':
 *         description: Server error
 */
router.get(
    '/match/:startupId/:investorId/pdf',
    authenticateJWT,
    exportFinancialDueDiligenceReportPdf
);

export default router;

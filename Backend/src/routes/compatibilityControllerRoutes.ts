import express from 'express';
import { authenticateJWT, authorizeRole } from '../middleware/auth';
import { batchAnalyzeCompatibility, getStartupInvestorCompatibility } from '../controllers/compatibilityController';

const router = express.Router();

/**
 * @swagger
 * /score/compatibility/{startupId}/{investorId}:
 *   get:
 *     tags:
 *       - Compatibility
 *     summary: Get detailed compatibility
 *     description: Get detailed compatibility analysis between a specific startup and investor
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
 *       - name: perspective
 *         in: query
 *         description: Perspective of the analysis
 *         schema:
 *           type: string
 *           enum: [startup, investor]
 *           default: investor
 *     responses:
 *       '200':
 *         description: Compatibility analysis retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MatchAnalysis'
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Startup or investor profile not found
 *       '429':
 *         description: API usage limit exceeded
 *       '500':
 *         description: Server error
 */
router.get(
    '/compatibility/:startupId/:investorId',
    authenticateJWT,
    getStartupInvestorCompatibility
);

/**
 * @swagger
 * /score/compatibility/batch:
 *   get:
 *     tags:
 *       - Compatibility
 *     summary: Get batch compatibility analysis
 *     description: Get batch compatibility analysis based on the authenticated user's role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Maximum number of results to return
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *       - name: minScore
 *         in: query
 *         description: Minimum compatibility score (0-100)
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           default: 0
 *     responses:
 *       '200':
 *         description: Batch compatibility analysis retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 matches:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MatchAnalysis'
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: User profile not found
 *       '500':
 *         description: Server error
 */
router.get(
    '/compatibility/batch',
    authenticateJWT,
    batchAnalyzeCompatibility
);

/**
 * @swagger
 * /score/compatibility/startup:
 *   get:
 *     tags:
 *       - Compatibility
 *     summary: Get startup compatibility analysis
 *     description: Get AI-enhanced compatibility analysis for the authenticated startup user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Maximum number of results to return
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *       - name: minScore
 *         in: query
 *         description: Minimum compatibility score (0-100)
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           default: 0
 *     responses:
 *       '200':
 *         description: Compatibility analysis retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 matches:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MatchAnalysis'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden - Not a startup user
 *       '404':
 *         description: Startup profile not found
 *       '500':
 *         description: Server error
 */
router.get(
    '/compatibility/startup',
    authenticateJWT,
    authorizeRole(['startup']),
    batchAnalyzeCompatibility
);

/**
 * @swagger
 * /score/compatibility/investor:
 *   get:
 *     tags:
 *       - Compatibility
 *     summary: Get investor compatibility analysis
 *     description: Get AI-enhanced compatibility analysis for the authenticated investor user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Maximum number of results to return
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 50
 *       - name: minScore
 *         in: query
 *         description: Minimum compatibility score (0-100)
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           default: 0
 *     responses:
 *       '200':
 *         description: Compatibility analysis retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 matches:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MatchAnalysis'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden - Not an investor user
 *       '404':
 *         description: Investor profile not found
 *       '500':
 *         description: Server error
 */
router.get(
    '/compatibility/investor',
    authenticateJWT,
    authorizeRole(['investor']),
    batchAnalyzeCompatibility
);

export default router;
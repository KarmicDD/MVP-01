// routes/matchingRoutes.ts
import express from 'express';
import {
    findMatchesForStartup,
    findMatchesForInvestor
} from '../../controllers/matchingController';
import { authenticateJWT, authorizeRole } from '../../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /matching/startup:
 *   get:
 *     tags:
 *       - Matching
 *     summary: Find matches for startup
 *     description: Find potential investor matches for the authenticated startup user
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
 *           maximum: 100
 *       - name: minScore
 *         in: query
 *         description: Minimum match score (0-100)
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           default: 0
 *     responses:
 *       '200':
 *         description: Matches retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 matches:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       investorId:
 *                         type: string
 *                         format: uuid
 *                       email:
 *                         type: string
 *                         format: email
 *                       matchScore:
 *                         type: number
 *                         minimum: 0
 *                         maximum: 100
 *                       companyName:
 *                         type: string
 *                       industriesOfInterest:
 *                         type: array
 *                         items:
 *                           type: string
 *                       preferredStages:
 *                         type: array
 *                         items:
 *                           type: string
 *                       ticketSize:
 *                         type: string
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
 *       '403':
 *         description: Forbidden - Not a startup user
 *       '404':
 *         description: Startup profile not found
 *       '500':
 *         description: Server error
 */
router.get(
    '/startup',
    authenticateJWT,
    authorizeRole(['startup']),
    findMatchesForStartup
);

/**
 * @swagger
 * /matching/investor:
 *   get:
 *     tags:
 *       - Matching
 *     summary: Find matches for investor
 *     description: Find potential startup matches for the authenticated investor user
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
 *           maximum: 100
 *       - name: minScore
 *         in: query
 *         description: Minimum match score (0-100)
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           default: 0
 *     responses:
 *       '200':
 *         description: Matches retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 matches:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       startupId:
 *                         type: string
 *                         format: uuid
 *                       companyName:
 *                         type: string
 *                       email:
 *                         type: string
 *                         format: email
 *                       matchScore:
 *                         type: number
 *                         minimum: 0
 *                         maximum: 100
 *                       industry:
 *                         type: string
 *                       fundingStage:
 *                         type: string
 *                       location:
 *                         type: string
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
 *       '403':
 *         description: Forbidden - Not an investor user
 *       '404':
 *         description: Investor profile not found
 *       '500':
 *         description: Server error
 */
router.get(
    '/investor',
    authenticateJWT,
    authorizeRole(['investor']),
    findMatchesForInvestor
);

export default router;
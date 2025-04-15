import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import { getFilterOptions, searchInvestors, searchStartups } from '../controllers/searchControllers';


const router = express.Router();

/**
 * @swagger
 * /search/startups:
 *   get:
 *     tags:
 *       - Search
 *     summary: Search for startups
 *     description: Search for startups with various filters and criteria
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: industry
 *         in: query
 *         description: Filter by industry
 *         schema:
 *           type: string
 *       - name: fundingStage
 *         in: query
 *         description: Filter by funding stage
 *         schema:
 *           type: string
 *           enum: [pre-seed, seed, series-a, series-b, series-c, growth]
 *       - name: employeeCount
 *         in: query
 *         description: Filter by employee count range
 *         schema:
 *           type: string
 *           enum: [1-10, 11-50, 51-200, 201-500, 501+]
 *       - name: location
 *         in: query
 *         description: Filter by location
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of results per page
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       '200':
 *         description: Search results retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.get('/startups', authenticateJWT, searchStartups);

/**
 * @swagger
 * /search/investors:
 *   get:
 *     tags:
 *       - Search
 *     summary: Search for investors
 *     description: Search for investors with various filters and criteria
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: investorType
 *         in: query
 *         description: Filter by investor type
 *         schema:
 *           type: string
 *           enum: [angel, vc, pe, family-office, corporate]
 *       - name: preferredIndustry
 *         in: query
 *         description: Filter by preferred industry
 *         schema:
 *           type: string
 *       - name: ticketSize
 *         in: query
 *         description: Filter by ticket size
 *         schema:
 *           type: string
 *           enum: [0-10L, 10L-50L, 50L-1Cr, 1Cr-10Cr, 10Cr+]
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of results per page
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       '200':
 *         description: Search results retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.get('/investors', authenticateJWT, searchInvestors);

/**
 * @swagger
 * /search/options:
 *   get:
 *     tags:
 *       - Search
 *     summary: Get filter options
 *     description: Get available options for search filters
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Filter options retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 industries:
 *                   type: array
 *                   items:
 *                     type: string
 *                 fundingStages:
 *                   type: array
 *                   items:
 *                     type: string
 *                 employeeOptions:
 *                   type: array
 *                   items:
 *                     type: string
 *                 ticketSizes:
 *                   type: array
 *                   items:
 *                     type: string
 *                 locations:
 *                   type: array
 *                   items:
 *                     type: string
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.get('/options', authenticateJWT, getFilterOptions);

export default router;
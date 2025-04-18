import express from 'express';
import { getMatchRecommendations, getBatchRecommendations, testRecommendationCache } from '../controllers/recommendationController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/recommendations/match/{startupId}/{investorId}:
 *   get:
 *     summary: Get personalized recommendations for a startup-investor match
 *     description: Generates AI-powered personalized recommendations for a specific startup-investor match
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: startupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the startup
 *       - in: path
 *         name: investorId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the investor
 *     responses:
 *       200:
 *         description: Recommendations generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       summary:
 *                         type: string
 *                       details:
 *                         type: string
 *                       category:
 *                         type: string
 *                         enum: [strategic, operational, financial, communication, growth]
 *                       priority:
 *                         type: string
 *                         enum: [high, medium, low]
 *                       confidence:
 *                         type: number
 *                 precision:
 *                   type: number
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Startup or investor not found
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Server error
 */
router.get('/match/:startupId/:investorId', authenticateJWT, getMatchRecommendations);

/**
 * @swagger
 * /api/recommendations/batch:
 *   post:
 *     summary: Get personalized recommendations for multiple matches
 *     description: Generates AI-powered personalized recommendations for multiple matches in a batch
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               matchIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of match IDs (startup IDs for investors, investor IDs for startups)
 *     responses:
 *       200:
 *         description: Batch recommendations generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       matchId:
 *                         type: string
 *                       recommendations:
 *                         type: object
 *                         properties:
 *                           recommendations:
 *                             type: array
 *                             items:
 *                               type: object
 *                           precision:
 *                             type: number
 *                 batchSize:
 *                   type: number
 *                 totalRequested:
 *                   type: number
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Server error
 */
router.post('/batch', authenticateJWT, getBatchRecommendations);

/**
 * @swagger
 * /api/recommendations/test-cache:
 *   get:
 *     summary: Test MongoDB recommendation cache
 *     description: Tests the MongoDB connection and ability to save recommendations
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Test failed
 */
router.get('/test-cache', authenticateJWT, testRecommendationCache);

export default router;

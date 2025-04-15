import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import { analyzeBeliefSystemAlignment } from '../controllers/BeliefSystemAnalysisController';
import QuestionnaireSubmissionModel from '../models/question/QuestionnaireSubmission';

const router = express.Router();

/**
 * @swagger
 * /analysis/belief-system/{startupId}/{investorId}:
 *   get:
 *     tags:
 *       - Belief System Analysis
 *     summary: Analyze belief system alignment
 *     description: Analyze the belief system alignment between a startup and an investor
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
 *         description: Analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BeliefSystemAnalysis'
 *       '400':
 *         description: Invalid input or missing questionnaire data
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Startup or investor profile not found
 *       '429':
 *         description: API usage limit exceeded
 *       '500':
 *         description: Server error
 */
router.get('/belief-system/:startupId/:investorId', authenticateJWT, analyzeBeliefSystemAlignment);

/**
 * @swagger
 * /analysis/check-status:
 *   get:
 *     tags:
 *       - Belief System Analysis
 *     summary: Check questionnaire status
 *     description: Check if the user has completed the questionnaire
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isCompleted:
 *                   type: boolean
 *                   description: Whether the user has completed the questionnaire
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.get('/check-status', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user?.userId;

        // Find user's questionnaire submission
        const submission = await QuestionnaireSubmissionModel.findOne({
            userId: userId
        });

        // Check if it exists and is submitted
        const isCompleted = !!submission && submission.status === 'submitted';

        res.json({ isCompleted });
    } catch (error) {
        console.error('Error checking questionnaire status:', error);
        res.status(500).json({ error: 'Failed to check questionnaire status' });
    }
});

export default router;
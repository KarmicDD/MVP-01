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
 *     description: |
 *       Analyze the belief system alignment between a startup and an investor.
 *       The analysis shows only the counterparty's profile based on the user's perspective.
 *       Uses Gemini 2.0 Flash Thinking AI model to generate comprehensive due diligence reports.
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
 *         description: Perspective of the analysis (defaults to the requesting user's role)
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
 *         description: API usage limit exceeded (maximum 10 requests per day)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Daily request limit reached
 *                 limit:
 *                   type: number
 *                   example: 10
 *                 nextReset:
 *                   type: string
 *                   example: Tomorrow
 *                 usageCount:
 *                   type: number
 *                   example: 10
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
 *     description: Check if the user has completed the questionnaire required for belief system analysis
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
 *                 questionnaires:
 *                   type: object
 *                   properties:
 *                     startup:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [submitted, incomplete, not_started]
 *                           description: Status of the startup questionnaire
 *                         completedAt:
 *                           type: string
 *                           format: date-time
 *                           description: When the questionnaire was completed
 *                     profile:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [completed, incomplete, not_started]
 *                           description: Status of the profile completion
 *                         completedAt:
 *                           type: string
 *                           format: date-time
 *                           description: When the profile was completed
 *                   description: Status of individual questionnaires and profiles
 *                 eligibleForMatching:
 *                   type: boolean
 *                   description: Whether the user is eligible for matching and analysis
 *             example:
 *               isCompleted: true
 *               questionnaires:
 *                 startup:
 *                   status: submitted
 *                   completedAt: 2023-05-15T10:30:00Z
 *                 profile:
 *                   status: completed
 *                   completedAt: 2023-05-10T14:20:00Z
 *               eligibleForMatching: true
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
import express from 'express';
import {
    getQuestionnaireResponses,
    saveDraftResponses,
    submitQuestionnaire,
    getQuestionnaireStatus
} from '../../controllers/questionnaireController';
import { authenticateJWT } from '../../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

/**
 * @swagger
 * /questionnaire/status:
 *   get:
 *     tags:
 *       - Questionnaire
 *     summary: Get questionnaire status
 *     description: Get the status of the user's questionnaire submission
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
 *                 status:
 *                   type: string
 *                   description: Status of the questionnaire submission
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.get('/status', authenticateJWT, getQuestionnaireStatus);

/**
 * @swagger
 * /questionnaire/{role}:
 *   get:
 *     tags:
 *       - Questionnaire
 *     summary: Get questionnaire responses
 *     description: Get the user's questionnaire responses for a specific role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: role
 *         in: path
 *         description: User role (startup or investor)
 *         required: true
 *         schema:
 *           type: string
 *           enum: [startup, investor]
 *     responses:
 *       '200':
 *         description: Responses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestionnaireSubmission'
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Questionnaire not found
 *       '500':
 *         description: Server error
 */
router.get('/:role', authenticateJWT, getQuestionnaireResponses);

/**
 * @swagger
 * /questionnaire/{role}/save:
 *   post:
 *     tags:
 *       - Questionnaire
 *     summary: Save draft responses
 *     description: Save draft questionnaire responses for a specific role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: role
 *         in: path
 *         description: User role (startup or investor)
 *         required: true
 *         schema:
 *           type: string
 *           enum: [startup, investor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               responses:
 *                 type: object
 *                 additionalProperties: true
 *                 description: Map of question IDs to responses
 *             required:
 *               - responses
 *     responses:
 *       '200':
 *         description: Draft saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Draft saved successfully
 *                 submission:
 *                   $ref: '#/components/schemas/QuestionnaireSubmission'
 *       '400':
 *         description: Invalid input
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.post('/:role/save', authenticateJWT, saveDraftResponses);

/**
 * @swagger
 * /questionnaire/{role}/submit:
 *   post:
 *     tags:
 *       - Questionnaire
 *     summary: Submit questionnaire
 *     description: Submit completed questionnaire responses for a specific role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: role
 *         in: path
 *         description: User role (startup or investor)
 *         required: true
 *         schema:
 *           type: string
 *           enum: [startup, investor]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               responses:
 *                 type: object
 *                 additionalProperties: true
 *                 description: Map of question IDs to responses
 *             required:
 *               - responses
 *     responses:
 *       '200':
 *         description: Questionnaire submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Questionnaire submitted successfully
 *                 submission:
 *                   $ref: '#/components/schemas/QuestionnaireSubmission'
 *                 analysisResults:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: object
 *                       additionalProperties:
 *                         type: number
 *                     overallProfile:
 *                       type: array
 *                       items:
 *                         type: string
 *       '400':
 *         description: Invalid input or incomplete responses
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.post('/:role/submit', authenticateJWT, submitQuestionnaire);

export default router;
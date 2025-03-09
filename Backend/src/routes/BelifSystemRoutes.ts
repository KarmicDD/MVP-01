import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import { analyzeBeliefSystemAlignment } from '../controllers/BeliefSystemAnalysisController';
import QuestionnaireSubmissionModel from '../models/question/QuestionnaireSubmission';

const router = express.Router();

// Route for analyzing belief system alignment between startup and investor
router.get('/belief-system/:startupId/:investorId', authenticateJWT, analyzeBeliefSystemAlignment);

// In your backend routes
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
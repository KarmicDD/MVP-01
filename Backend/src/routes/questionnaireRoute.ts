import express from 'express';
import {
    getQuestionnaireResponses,
    saveDraftResponses,
    submitQuestionnaire,
    getQuestionnaireStatus
} from '../controllers/questionnaireController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Get questionnaire status
router.get('/status', getQuestionnaireStatus, authenticateJWT);

// Get questionnaire responses
router.get('/:role', getQuestionnaireResponses, authenticateJWT);

// Save draft responses
router.post('/:role/save', saveDraftResponses, authenticateJWT);

// Submit questionnaire
router.post('/:role/submit', submitQuestionnaire, authenticateJWT);

export default router;
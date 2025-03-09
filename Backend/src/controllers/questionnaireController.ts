import { Request, Response } from 'express';
import { analyzeResponses } from '../services/questionnaireMatcher';
import QuestionnaireSubmissionModel from '../models/question/QuestionnaireSubmission';
import logger from '../utils/logger';

export const getQuestionnaireResponses = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const userRole = req.params.role;

        // Validate role
        if (userRole !== 'startup' && userRole !== 'investor') {
            res.status(400).json({ message: 'Invalid role specified' });
            return;
        }

        // Check if user has the correct role
        if (req.user?.role !== userRole) {
            res.status(403).json({ message: 'You do not have permission to access this questionnaire' });
            return;
        }

        const submission = await QuestionnaireSubmissionModel.findOne({ userId, userRole });

        if (!submission) {
            res.status(200).json({
                message: 'No questionnaire found',
                responses: {}
            });
            return;
        }

        // Convert Map to plain object for response
        const responses = Object.fromEntries(submission.responses);

        res.status(200).json({
            status: submission.status,
            responses,
            analysisResults: submission.status === 'submitted' ? submission.analysisResults : null
        });
    } catch (error) {
        logger.error('Error fetching questionnaire responses:', error);
        res.status(500).json({ message: 'Error fetching questionnaire responses' });
    }
};

export const saveDraftResponses = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const userRole = req.params.role;
        const { responses } = req.body;

        // Validate role
        if (userRole !== 'startup' && userRole !== 'investor') {
            res.status(400).json({ message: 'Invalid role specified' });
            return;
        }

        // Check if user has the correct role
        if (req.user?.role !== userRole) {
            res.status(403).json({ message: 'You do not have permission to save this questionnaire' });
            return;
        }

        // Validate responses
        if (!responses || typeof responses !== 'object') {
            res.status(400).json({ message: 'Invalid responses format' });
            return;
        }

        // Find existing submission or create a new one
        let submission = await QuestionnaireSubmissionModel.findOne({ userId, userRole });

        if (!submission) {
            submission = new QuestionnaireSubmissionModel({
                userId,
                userRole,
                responses: new Map(Object.entries(responses)),
                status: 'draft'
            });
        } else {
            // Update existing responses
            submission.responses = new Map(Object.entries(responses));
            // If it was submitted before, set back to draft
            if (submission.status === 'submitted') {
                submission.status = 'draft';
            }
        }

        await submission.save();

        res.status(200).json({
            message: 'Questionnaire draft saved successfully',
            status: 'draft'
        });
    } catch (error) {
        logger.error('Error saving questionnaire draft:', error);
        res.status(500).json({ message: 'Error saving questionnaire draft' });
    }
};

export const submitQuestionnaire = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const userRole = req.params.role;
        const { responses } = req.body;

        // Validate role
        if (userRole !== 'startup' && userRole !== 'investor') {
            res.status(400).json({ message: 'Invalid role specified' });
            return;
        }

        // Check if user has the correct role
        if (req.user?.role !== userRole) {
            res.status(403).json({ message: 'You do not have permission to submit this questionnaire' });
            return;
        }

        // Validate responses
        if (!responses || typeof responses !== 'object') {
            res.status(400).json({ message: 'Invalid responses format' });
            return;
        }

        // Find existing submission or create a new one
        let submission = await QuestionnaireSubmissionModel.findOne({ userId, userRole });

        if (!submission) {
            submission = new QuestionnaireSubmissionModel({
                userId,
                userRole,
                responses: new Map(Object.entries(responses)),
                status: 'submitted'
            });
        } else {
            // Update existing responses
            submission.responses = new Map(Object.entries(responses));
            submission.status = 'submitted';
        }

        // Analyze responses to generate match profile
        const analysisResults = await analyzeResponses(responses, userRole as 'startup' | 'investor');
        submission.analysisResults = analysisResults;

        await submission.save();

        res.status(200).json({
            message: 'Questionnaire submitted successfully',
            status: 'submitted',
            analysisResults
        });
    } catch (error) {
        logger.error('Error submitting questionnaire:', error);
        res.status(500).json({ message: 'Error submitting questionnaire' });
    }
};

export const getQuestionnaireStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const userRole = req.user?.role;

        const submission = await QuestionnaireSubmissionModel.findOne({ userId, userRole });

        if (!submission) {
            res.status(200).json({
                isComplete: false,
                status: null
            });
            return;
        }

        res.status(200).json({
            isComplete: submission.status === 'submitted',
            status: submission.status
        });
    } catch (error) {
        logger.error('Error fetching questionnaire status:', error);
        res.status(500).json({ message: 'Error fetching questionnaire status' });
    }
};
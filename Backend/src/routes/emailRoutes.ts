import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import { sendWelcomeEmail, sendNewsletterSignup } from '../services/emailService';

const router = express.Router();

/**
 * @route POST /api/email/welcome
 * @desc Send welcome email to a new user
 * @access Private (admin only)
 */
router.post('/welcome', authenticateJWT, async (req, res): Promise<void> => {
    try {
        // Validate request
        const { email } = req.body;

        if (!email) {
            res.status(400).json({ message: 'Email address is required' });
            return;
        }

        // Send welcome email
        const result = await sendWelcomeEmail(email);

        if (!result || !result.id) {
            throw new Error('Failed to send welcome email, no ID returned');
        }

        res.status(200).json({
            message: 'Welcome email sent successfully',
            id: result.id
        });
    } catch (error) {
        console.error('Error sending welcome email:', error);
        res.status(500).json({
            message: 'Failed to send welcome email',
            error: (error as Error).message
        });
    }
});

export default router;
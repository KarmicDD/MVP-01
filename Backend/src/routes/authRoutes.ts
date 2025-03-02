import express from 'express';
// @ts-ignore
import { body } from 'express-validator';
import passport from '../config/passport';
import { register, login, updateOAuthUserRole, handleOAuthCallback } from '../controllers/authController';

const router = express.Router();

// Initialize passport
router.use(passport.initialize());

// Validation middleware
const registerValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').isIn(['startup', 'investor']).withMessage('Valid role is required')
];

const loginValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').exists().withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { session: false }));
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    handleOAuthCallback('google')
);

// LinkedIn OAuth routes
router.get('/linkedin', passport.authenticate('linkedin', { session: false }));
router.get('/linkedin/callback',
    passport.authenticate('linkedin', { session: false, failureRedirect: '/login' }),
    handleOAuthCallback('linkedin')
);

// Update OAuth user role
router.post(
    '/update-role',
    body('userId').exists().withMessage('User ID is required'),
    body('role').isIn(['startup', 'investor']).withMessage('Valid role is required'),
    updateOAuthUserRole
);

export default router;

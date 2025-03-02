import express from 'express';
// @ts-ignore
import { body } from 'express-validator';
import { register, login } from '../controllers/authController';

const router = express.Router();

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

// OAuth routes will be added later

export default router;

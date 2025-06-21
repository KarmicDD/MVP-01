import express from 'express';
// @ts-ignore
import { body } from 'express-validator';
import passport from '../../config/passport';
import { register, login, updateOAuthUserRole, handleOAuthCallback } from '../../controllers/authController';

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

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Create a new user account with email, password, and role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: User's password (min 8 characters)
 *               role:
 *                 type: string
 *                 enum: [startup, investor]
 *                 description: User's role in the system
 *             required:
 *               - email
 *               - password
 *               - role
 *           example:
 *             email: user@example.com
 *             password: password123
 *             role: startup
 *     responses:
 *       '201':
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                       format: email
 *                     role:
 *                       type: string
 *                       enum: [startup, investor]
 *       '400':
 *         description: Invalid input or user already exists
 *       '500':
 *         description: Server error
 */
router.post('/register', registerValidation, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login to the system
 *     description: Authenticate a user with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *             required:
 *               - email
 *               - password
 *           example:
 *             email: user@example.com
 *             password: password123
 *     responses:
 *       '200':
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                       format: email
 *                     role:
 *                       type: string
 *                       enum: [startup, investor] *       '401':
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   enum: 
 *                     - "No account found with this email address. Please register first."
 *                     - "Invalid credentials"
 *                     - "This account uses social login. Please sign in with your social provider."
 *       '500':
 *         description: Server error
 */
router.post('/login', loginValidation, login);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Initiate Google OAuth login
 *     description: Redirect to Google for OAuth authentication
 *     responses:
 *       '302':
 *         description: Redirect to Google OAuth
 */
router.get('/google', passport.authenticate('google', { session: false }));

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Google OAuth callback
 *     description: Callback endpoint for Google OAuth authentication
 *     parameters:
 *       - name: code
 *         in: query
 *         description: OAuth authorization code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '302':
 *         description: Redirect to frontend with token or role selection
 */
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    handleOAuthCallback('google')
);

/**
 * @swagger
 * /auth/linkedin:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Initiate LinkedIn OAuth login
 *     description: Redirect to LinkedIn for OAuth authentication
 *     responses:
 *       '302':
 *         description: Redirect to LinkedIn OAuth
 */
router.get('/linkedin', passport.authenticate('linkedin', { session: false }));

/**
 * @swagger
 * /auth/linkedin/callback:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: LinkedIn OAuth callback
 *     description: Callback endpoint for LinkedIn OAuth authentication
 *     parameters:
 *       - name: code
 *         in: query
 *         description: OAuth authorization code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '302':
 *         description: Redirect to frontend with token or role selection
 */
router.get('/linkedin/callback',
    passport.authenticate('linkedin', { session: false, failureRedirect: '/login' }),
    handleOAuthCallback('linkedin')
);

/**
 * @swagger
 * /auth/update-role:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Update role for OAuth user
 *     description: Set the role for a user who authenticated via OAuth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: User ID
 *               role:
 *                 type: string
 *                 enum: [startup, investor]
 *                 description: User's role in the system
 *             required:
 *               - userId
 *               - role
 *           example:
 *             userId: 123e4567-e89b-12d3-a456-426614174000
 *             role: startup
 *     responses:
 *       '200':
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Role updated successfully
 *                 token:
 *                   type: string
 *                   description: Updated JWT token with role
 *       '400':
 *         description: Invalid input
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Server error
 */
router.post(
    '/update-role',
    body('userId').exists().withMessage('User ID is required'),
    body('role').isIn(['startup', 'investor']).withMessage('Valid role is required'),
    updateOAuthUserRole
);

export default router;

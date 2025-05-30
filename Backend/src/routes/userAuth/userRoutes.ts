import express from 'express';
import { getUserProfile, getStartupDashboard, getInvestorDashboard } from '../../controllers/userController';
import { authenticateJWT, authorizeRole } from '../../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /users/profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user profile
 *     description: Retrieve the authenticated user's profile information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Server error
 */
router.get('/profile', authenticateJWT, getUserProfile);

/**
 * @swagger
 * /users/startup/dashboard:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get startup dashboard
 *     description: Retrieve dashboard data for a startup user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Startup dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 recentSubmissions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                       formType:
 *                         type: string
 *                       data:
 *                         type: object
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden - Not a startup user
 *       '500':
 *         description: Server error
 */
router.get(
    '/startup/dashboard',
    authenticateJWT,
    authorizeRole(['startup']),
    getStartupDashboard
);

/**
 * @swagger
 * /users/investor/dashboard:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get investor dashboard
 *     description: Retrieve dashboard data for an investor user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Investor dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden - Not an investor user
 *       '500':
 *         description: Server error
 */
router.get(
    '/investor/dashboard',
    authenticateJWT,
    authorizeRole(['investor']),
    getInvestorDashboard
);

export default router;
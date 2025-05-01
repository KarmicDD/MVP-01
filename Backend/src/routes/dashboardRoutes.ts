import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import {
    getDashboardStats,
    getRecentMatches,
    getRecentActivity,
    getUpcomingTasks,
    getAllDashboardData,
    getInsights
} from '../controllers/dashboardController';

const router = express.Router();

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get dashboard statistics
 *     description: Get statistics for the dashboard overview page
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Dashboard statistics retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.get('/stats', authenticateJWT, getDashboardStats);

/**
 * @swagger
 * /dashboard/matches:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get recent matches
 *     description: Get recent matches for the dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Maximum number of results to return
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       '200':
 *         description: Recent matches retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.get('/matches', authenticateJWT, getRecentMatches);

/**
 * @swagger
 * /dashboard/activity:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get recent activity
 *     description: Get recent activity for the dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Maximum number of results to return
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       '200':
 *         description: Recent activity retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.get('/activity', authenticateJWT, getRecentActivity);

/**
 * @swagger
 * /dashboard/tasks:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get upcoming tasks
 *     description: Get upcoming tasks for the dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Upcoming tasks retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.get('/tasks', authenticateJWT, getUpcomingTasks);

/**
 * @swagger
 * /dashboard/all:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get all dashboard data
 *     description: Get all dashboard data in a single request
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: All dashboard data retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.get('/all', authenticateJWT, getAllDashboardData);

/**
 * @swagger
 * /dashboard/insights:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get AI-generated insights
 *     description: Get AI-generated insights for the dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: AI insights retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.get('/insights', authenticateJWT, getInsights);

export default router;

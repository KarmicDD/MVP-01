import express from 'express';
import { authenticateJWT } from '../middleware/auth';
import {
    getUserTasks,
    createTask,
    updateTask,
    deleteTask,
    generateRecommendedTasks,
    verifyTaskCompletion
} from '../controllers/taskController';

const router = express.Router();

/**
 * @swagger
 * /tasks:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get all tasks for the current user
 *     description: Retrieves all tasks for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Tasks retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.get('/', authenticateJWT, getUserTasks);

/**
 * @swagger
 * /tasks:
 *   post:
 *     tags:
 *       - Tasks
 *     summary: Create a new task
 *     description: Creates a new task for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title
 *               description:
 *                 type: string
 *                 description: Task description
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Due date for the task
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *                 description: Task priority
 *               category:
 *                 type: string
 *                 enum: [profile, document, financial, match, other]
 *                 description: Task category
 *     responses:
 *       '201':
 *         description: Task created successfully
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.post('/', authenticateJWT, createTask);

/**
 * @swagger
 * /tasks/{taskId}:
 *   put:
 *     tags:
 *       - Tasks
 *     summary: Update a task
 *     description: Updates an existing task for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title
 *               description:
 *                 type: string
 *                 description: Task description
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Due date for the task
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *                 description: Task priority
 *               completed:
 *                 type: boolean
 *                 description: Whether the task is completed
 *               category:
 *                 type: string
 *                 enum: [profile, document, financial, match, other]
 *                 description: Task category
 *     responses:
 *       '200':
 *         description: Task updated successfully
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Task not found
 *       '500':
 *         description: Server error
 */
router.put('/:taskId', authenticateJWT, updateTask);

/**
 * @swagger
 * /tasks/{taskId}:
 *   delete:
 *     tags:
 *       - Tasks
 *     summary: Delete a task
 *     description: Deletes an existing task for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task to delete
 *     responses:
 *       '200':
 *         description: Task deleted successfully
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Task not found
 *       '500':
 *         description: Server error
 */
router.delete('/:taskId', authenticateJWT, deleteTask);

/**
 * @swagger
 * /tasks/generate:
 *   post:
 *     tags:
 *       - Tasks
 *     summary: Generate recommended tasks
 *     description: Generates recommended tasks based on user profile completeness
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Tasks generated successfully
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.post('/generate', authenticateJWT, generateRecommendedTasks);

/**
 * @swagger
 * /tasks/{taskId}/verify:
 *   post:
 *     tags:
 *       - Tasks
 *     summary: Verify task completion
 *     description: Uses AI to verify if a task has been completed based on user data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task to verify
 *     responses:
 *       '200':
 *         description: Task verification completed
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Task not found
 *       '500':
 *         description: Server error
 */
router.post('/:taskId/verify', authenticateJWT, verifyTaskCompletion);

export default router;

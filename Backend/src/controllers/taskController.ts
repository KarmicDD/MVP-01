import { Request, Response } from 'express';
import TaskModel, { Task } from '../models/Task';
import StartupProfileModel from '../models/Profile/StartupProfile';
import InvestorProfileModel from '../models/InvestorModels/InvestorProfile';
import DocumentModel from '../models/Profile/Document';
import ExtendedProfileModel from '../models/Profile/ExtendedProfile';
import QuestionnaireSubmissionModel from '../models/question/QuestionnaireSubmission';
import AITaskCacheModel from '../models/AITaskCache';
import TaskVerificationCacheModel from '../models/TaskVerificationCache';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { cleanJsonResponse, safeJsonParse } from '../utils/jsonHelper';

// Load environment variables
dotenv.config();

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || '';
if (!apiKey) {
    console.warn('Warning: GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite", // Using gemini-2.0-flash-lite as specified
    generationConfig: {
        maxOutputTokens: 32768, // Maximum allowed value
    }
});

/**
 * Get all tasks for the current user
 */
export const getUserTasks = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const userId = req.user.userId;
        const tasks = await TaskModel.find({ userId }).sort({ dueDate: 1 });

        res.json(tasks);
    } catch (error) {
        console.error('Error getting user tasks:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Create a new task
 */
export const createTask = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const userId = req.user.userId;
        const { title, description, dueDate, priority, category } = req.body;

        const task = new TaskModel({
            userId,
            title,
            description,
            dueDate,
            priority,
            category,
            completed: false,
            aiVerified: false
        });

        await task.save();
        res.status(201).json(task);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Update a task
 */
export const updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const userId = req.user.userId;
        const taskId = req.params.taskId;
        const { title, description, dueDate, priority, completed, category } = req.body;

        const task = await TaskModel.findOne({ _id: taskId, userId });
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }

        // Store original values for fields that might trigger re-verification
        const originalCategory = task.category;

        task.title = title || task.title;
        task.description = description !== undefined ? description : task.description;
        task.dueDate = dueDate || task.dueDate;
        task.priority = priority || task.priority;

        // Don't allow manual completion override - only AI verification can set completed status
        // If completed is being set to true, check if it's already AI verified
        if (completed === true && !task.aiVerified) {
            // If trying to mark as completed but not AI verified, return an error
            res.status(400).json({
                message: 'Tasks can only be marked as completed through AI verification. Please use the verify button instead.',
                task
            });
            return;
        } else if (completed !== undefined) {
            // Only allow setting completed to false (uncompleting a task)
            if (completed === false) {
                task.completed = false;
                task.aiVerified = false; // Reset AI verification when uncompleting
                task.verificationMessage = undefined;
                task.lastVerifiedAt = undefined;

                // Also clear the verification cache for this task
                await TaskVerificationCacheModel.deleteOne({ userId, taskId: task._id?.toString() });
            }
        }

        task.category = category || task.category;
        task.updatedAt = new Date();

        // If category changed, we need to re-verify the task
        if (originalCategory !== task.category) {
            // Clear verification cache to force re-verification
            await TaskVerificationCacheModel.deleteOne({ userId, taskId: task._id?.toString() });
            // Reset verification status
            task.aiVerified = false;
            task.verificationMessage = undefined;
            task.lastVerifiedAt = undefined;
        }

        await task.save();
        res.json(task);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Delete a task
 */
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const userId = req.user.userId;
        const taskId = req.params.taskId;

        const task = await TaskModel.findOne({ _id: taskId, userId });
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }

        await task.deleteOne();
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Generate recommended tasks for the user using AI
 */
export const generateRecommendedTasks = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const userId = req.user.userId;
        const role = req.user.role || 'startup';

        // Check if there are any incomplete AI-generated tasks
        const incompleteAITasks = await TaskModel.find({
            userId,
            completed: false,
            isAIGenerated: true
        });

        if (incompleteAITasks.length > 0) {
            res.status(400).json({
                message: 'Please complete your existing AI-generated tasks before generating new ones',
                incompleteTasks: incompleteAITasks.length
            });
            return;
        }

        // Check if we have recently generated tasks (within 7 days)
        const taskCache = await AITaskCacheModel.findOne({
            userId,
            expiresAt: { $gt: new Date() }
        });

        if (taskCache) {
            res.status(400).json({
                message: 'Tasks were recently generated. Please wait before generating new tasks.',
                lastGenerated: taskCache.lastGeneratedAt,
                nextAvailable: taskCache.expiresAt
            });
            return;
        }

        // First, gather user data for AI-powered task generation
        const { data: userData } = await gatherUserData(userId, role);

        // Initialize tasks array
        let tasks: Array<{
            userId: string;
            title: string;
            description: string;
            dueDate: Date;
            priority: 'high' | 'medium' | 'low';
            category: 'profile' | 'document' | 'financial' | 'match' | 'other';
            isAIGenerated: boolean;
        }> = [];

        try {
            console.log('Generating AI-powered tasks with Gemini 2.0 Flash Lite');
            const aiTasks = await generateAITasks(userData, role || 'startup');

            if (aiTasks && aiTasks.length > 0) {
                tasks = aiTasks.map(task => ({
                    userId,
                    title: task.title,
                    description: task.description,
                    dueDate: new Date(Date.now() + task.daysToComplete * 24 * 60 * 60 * 1000),
                    priority: task.priority as 'high' | 'medium' | 'low',
                    category: task.category as 'profile' | 'document' | 'financial' | 'match' | 'other',
                    isAIGenerated: true
                }));

                console.log(`Generated ${tasks.length} AI tasks`);
            }
        } catch (error) {
            console.error('Error generating AI tasks:', error);
            // Fall back to rule-based task generation if AI fails
        }

        // If AI task generation failed or returned no tasks, fall back to rule-based generation
        if (tasks.length === 0) {
            console.log('Falling back to rule-based task generation');
            tasks = [];

            // Check profile completeness
            if (role === 'startup') {
                const startupProfile = await StartupProfileModel.findOne({ userId });
                const extendedProfile = await ExtendedProfileModel.findOne({ userId });

                if (!startupProfile) {
                    tasks.push({
                        userId,
                        title: 'Complete your startup profile',
                        description: 'Add basic information about your startup',
                        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                        priority: 'high',
                        category: 'profile',
                        isAIGenerated: true
                    });
                } else {
                    // Check for missing fields
                    if (!startupProfile.industry) {
                        tasks.push({
                            userId,
                            title: 'Add your industry',
                            description: 'Specify your startup\'s industry to improve matching',
                            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                            priority: 'high',
                            category: 'profile',
                            isAIGenerated: true
                        });
                    }

                    if (!startupProfile.fundingStage) {
                        tasks.push({
                            userId,
                            title: 'Add your funding stage',
                            description: 'Specify your startup\'s current funding stage',
                            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                            priority: 'high',
                            category: 'profile',
                            isAIGenerated: true
                        });
                    }

                    if (!startupProfile.pitch) {
                        tasks.push({
                            userId,
                            title: 'Add your pitch',
                            description: 'Write a compelling pitch for your startup',
                            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
                            priority: 'medium',
                            category: 'profile',
                            isAIGenerated: true
                        });
                    }
                }

                // Check for extended profile
                if (!extendedProfile || !extendedProfile.teamMembers || extendedProfile.teamMembers.length === 0) {
                    tasks.push({
                        userId,
                        title: 'Add team members',
                        description: 'Add information about your team members',
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                        priority: 'medium',
                        category: 'profile',
                        isAIGenerated: true
                    });
                }
            } else if (role === 'investor') {
                const investorProfile = await InvestorProfileModel.findOne({ userId });
                const extendedProfile = await ExtendedProfileModel.findOne({ userId });

                if (!investorProfile) {
                    tasks.push({
                        userId,
                        title: 'Complete your investor profile',
                        description: 'Add basic information about your investment firm',
                        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                        priority: 'high',
                        category: 'profile',
                        isAIGenerated: true
                    });
                } else {
                    // Check for missing fields
                    if (!investorProfile.industriesOfInterest || investorProfile.industriesOfInterest.length === 0) {
                        tasks.push({
                            userId,
                            title: 'Add industries of interest',
                            description: 'Specify industries you are interested in investing in',
                            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                            priority: 'high',
                            category: 'profile',
                            isAIGenerated: true
                        });
                    }

                    if (!investorProfile.preferredStages || investorProfile.preferredStages.length === 0) {
                        tasks.push({
                            userId,
                            title: 'Add preferred funding stages',
                            description: 'Specify funding stages you prefer to invest in',
                            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                            priority: 'high',
                            category: 'profile',
                            isAIGenerated: true
                        });
                    }

                    if (!investorProfile.ticketSize) {
                        tasks.push({
                            userId,
                            title: 'Add your ticket size',
                            description: 'Specify your typical investment amount range',
                            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
                            priority: 'medium',
                            category: 'profile',
                            isAIGenerated: true
                        });
                    }
                }

                // Check for extended profile
                if (!extendedProfile || !extendedProfile.investmentHistory || extendedProfile.investmentHistory.length === 0) {
                    tasks.push({
                        userId,
                        title: 'Add investment history',
                        description: 'Add information about your past investments',
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                        priority: 'medium',
                        category: 'profile',
                        isAIGenerated: true
                    });
                }
            }

            // Check for documents
            const documents = await DocumentModel.find({ userId });
            if (documents.length === 0) {
                tasks.push({
                    userId,
                    title: 'Upload documents',
                    description: 'Upload relevant documents to enhance your profile',
                    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
                    priority: 'medium',
                    category: 'document',
                    isAIGenerated: true
                });
            }

            // Check for questionnaire
            const questionnaire = await QuestionnaireSubmissionModel.findOne({ userId });
            if (!questionnaire || questionnaire.status !== 'submitted') {
                tasks.push({
                    userId,
                    title: 'Complete questionnaire',
                    description: 'Fill out the questionnaire to improve matching',
                    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
                    priority: 'high',
                    category: 'profile',
                    isAIGenerated: true
                });
            }
        }

        // Create tasks in database if they don't already exist
        const existingTasks = await TaskModel.find({ userId });
        const newTasks: Task[] = [];

        for (const taskData of tasks) {
            // Check if a similar task already exists
            const taskExists = existingTasks.some(
                existingTask =>
                    existingTask.title === taskData.title &&
                    !existingTask.completed
            );

            if (!taskExists) {
                const newTask = new TaskModel(taskData);
                await newTask.save();
                newTasks.push(newTask);
            }
        }

        // Create or update task cache entry with 7-day TTL
        await AITaskCacheModel.findOneAndUpdate(
            { userId },
            {
                userId,
                role,
                tasksGenerated: true,
                lastGeneratedAt: new Date(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days TTL
            },
            { upsert: true, new: true }
        );

        console.log(`Created/updated task cache for user ${userId} with 7-day TTL`);
        res.json(newTasks);
    } catch (error) {
        console.error('Error generating recommended tasks:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Verify task completion using AI
 */
export const verifyTaskCompletion = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const userId = req.user.userId;
        const taskId = req.params.taskId;

        // Get the task
        const task = await TaskModel.findOne({ _id: taskId, userId });
        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }

        // Get user data and its last update timestamp
        const { data: userData, lastUpdated: userDataLastUpdated } = await gatherUserData(userId, req.user.role || undefined);

        // Get data dependencies timestamps
        const dataDependencies = {
            profileUpdated: getTimestampForData(userData.profile),
            documentsUpdated: getTimestampForData(userData.documents),
            questionnairesUpdated: getTimestampForData(userData.questionnaire),
            financialsUpdated: new Date(0), // Not implemented yet
            matchesUpdated: new Date(0) // Not implemented yet
        };

        // Check if we have a cached verification result
        const cachedVerification = await TaskVerificationCacheModel.findOne({
            userId,
            taskId: task._id?.toString()
        });

        let verificationResult;
        let useCache = false;

        // Only use cache if it exists and all relevant data dependencies are older than the cache
        if (cachedVerification) {
            // Check if any relevant data has been updated since the last verification
            const isDataUpdated = isDataNewerThanCache(task.category, cachedVerification, dataDependencies);

            if (!isDataUpdated) {
                console.log(`Using cached verification result for task ${taskId}`);
                verificationResult = cachedVerification.result;
                useCache = true;
            } else {
                console.log(`Data has been updated since last verification for task ${taskId}, re-verifying`);
            }
        }

        if (!useCache) {
            console.log(`Generating new verification for task ${taskId} (cache invalid or not found)`);

            // Use AI to verify if the task is completed
            verificationResult = await verifyTaskWithAI(task, userData);

            // Cache the verification result with the current data timestamp and dependencies
            await TaskVerificationCacheModel.findOneAndUpdate(
                { userId, taskId: task._id?.toString() },
                {
                    userId,
                    taskId: task._id?.toString(),
                    result: verificationResult,
                    createdAt: new Date(),
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days TTL
                    dataTimestamp: userDataLastUpdated, // Store when the data was last updated
                    dataDependencies // Store timestamps of all data dependencies
                },
                { upsert: true, new: true }
            );
            console.log(`Cached verification result for task ${taskId} with 7-day TTL`);
        }

        if (verificationResult && verificationResult.completed) {
            // Update the task as completed and mark as AI verified
            task.completed = true;
            task.aiVerified = true;
            task.verificationMessage = verificationResult.message || 'Task completed successfully';
            task.lastVerifiedAt = new Date();
            await task.save();

            // Check if all AI-generated tasks are now completed
            const remainingIncompleteAITasks = await TaskModel.countDocuments({
                userId,
                completed: false,
                isAIGenerated: true
            });

            // If all AI-generated tasks are completed, reset the task cache to allow generating new tasks
            if (remainingIncompleteAITasks === 0) {
                await AITaskCacheModel.deleteMany({ userId });
                // Also clear verification cache when all tasks are completed
                await TaskVerificationCacheModel.deleteMany({ userId });
                console.log(`All AI-generated tasks completed for user ${userId}. Task cache reset.`);
            }

            res.json({
                task,
                verification: {
                    completed: true,
                    message: verificationResult.message || 'Task completed successfully',
                    allTasksCompleted: remainingIncompleteAITasks === 0
                }
            });
        } else if (verificationResult) {
            // Update the task with verification result but not completed
            task.aiVerified = false;
            task.verificationMessage = verificationResult.message || 'Task not completed';
            task.lastVerifiedAt = new Date();
            await task.save();

            res.json({
                task,
                verification: {
                    completed: false,
                    message: verificationResult.message || 'Task not completed',
                    nextSteps: verificationResult.nextSteps || []
                }
            });
        } else {
            // Fallback if verificationResult is undefined
            res.json({
                task,
                verification: {
                    completed: false,
                    message: 'Unable to verify task completion',
                    nextSteps: ['Try again later']
                }
            });
        }
    } catch (error) {
        console.error('Error verifying task completion:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Helper function to get the latest timestamp from a data object or array
 */
export function getTimestampForData(data: any): Date {
    if (!data) return new Date(0);

    if (Array.isArray(data)) {
        // Find the most recent updatedAt timestamp in the array
        let latestDate = new Date(0);
        for (const item of data) {
            if (item.updatedAt && new Date(item.updatedAt) > latestDate) {
                latestDate = new Date(item.updatedAt);
            }
        }
        return latestDate;
    } else {
        // Return the updatedAt timestamp of the object
        return data.updatedAt ? new Date(data.updatedAt) : new Date(0);
    }
}

/**
 * Helper function to check if relevant data has been updated since the last verification
 */
export function isDataNewerThanCache(
    category: string,
    cache: any,
    dependencies: {
        profileUpdated: Date;
        documentsUpdated: Date;
        questionnairesUpdated: Date;
        financialsUpdated: Date;
        matchesUpdated: Date;
    }
): boolean {
    // If no dependencies in cache, consider data as updated
    if (!cache.dataDependencies) return true;

    // Check relevant dependencies based on task category
    switch (category) {
        case 'profile':
            return dependencies.profileUpdated > (cache.dataDependencies.profileUpdated || new Date(0));
        case 'document':
            return dependencies.documentsUpdated > (cache.dataDependencies.documentsUpdated || new Date(0));
        case 'financial':
            return dependencies.financialsUpdated > (cache.dataDependencies.financialsUpdated || new Date(0));
        case 'match':
            return dependencies.matchesUpdated > (cache.dataDependencies.matchesUpdated || new Date(0));
        default:
            // For 'other' category or any other case, check all dependencies
            return (
                dependencies.profileUpdated > (cache.dataDependencies.profileUpdated || new Date(0)) ||
                dependencies.documentsUpdated > (cache.dataDependencies.documentsUpdated || new Date(0)) ||
                dependencies.questionnairesUpdated > (cache.dataDependencies.questionnairesUpdated || new Date(0)) ||
                dependencies.financialsUpdated > (cache.dataDependencies.financialsUpdated || new Date(0)) ||
                dependencies.matchesUpdated > (cache.dataDependencies.matchesUpdated || new Date(0))
            );
    }
}

/**
 * Generate AI-powered tasks based on user data
 */
async function generateAITasks(userData: any, role: string): Promise<any[]> {
    try {
        // Create prompt for Gemini
        const prompt = `
        You are an AI assistant that generates personalized tasks for a ${role} user on a startup-investor matching platform.

        USER DATA:
        ${JSON.stringify(userData, null, 2)}

        TASK:
        Generate 3-5 personalized, actionable tasks for this user based on their data.
        Each task should be specific, data-driven, and provide clear value to the user.

        For each task, include:
        1. A clear, concise title
        2. A detailed description explaining why this task is important
        3. A priority level (high, medium, or low)
        4. A category (profile, document, financial, match, or other)
        5. A recommended number of days to complete (1-14)

        Format your response as a JSON array with this structure:
        [
          {
            "title": "Task title",
            "description": "Detailed task description",
            "priority": "high|medium|low",
            "category": "profile|document|financial|match|other",
            "daysToComplete": 3
          },
          ...
        ]

        IMPORTANT GUIDELINES:
        - Focus on tasks that will have the biggest impact on the user's success
        - Prioritize profile completion if it's incomplete
        - Suggest document uploads if they have few or no documents
        - Recommend questionnaire completion if not done
        - For investors, suggest reviewing potential startup matches
        - For startups, suggest preparing for investor meetings
        `;

        // Call Gemini API
        const result = await model.generateContent(prompt);
        const response = result.response;
        const textResponse = response.text();

        // Clean and parse the response
        const cleanedResponse = cleanJsonResponse(textResponse);
        const parsedResponse = safeJsonParse(cleanedResponse);

        if (Array.isArray(parsedResponse)) {
            return parsedResponse;
        }

        return [];
    } catch (error) {
        console.error('Error generating AI tasks:', error);
        return [];
    }
}

/**
 * Verify task completion using AI
 */
export async function verifyTaskWithAI(task: Task, userData: any): Promise<{ completed: boolean; message: string; nextSteps?: string[] }> {
    try {
        // Create prompt for Gemini
        const prompt = `
        You are an AI assistant that verifies task completion for users on a startup-investor matching platform.

        TASK:
        ${JSON.stringify({
            title: task.title,
            description: task.description,
            category: task.category
        }, null, 2)}

        USER DATA:
        ${JSON.stringify(userData, null, 2)}

        VERIFICATION TASK:
        Based on the user data, determine if the task has been completed.

        Format your response as a JSON object with this structure:
        {
          "completed": true|false,
          "message": "Explanation of why the task is considered completed or not",
          "nextSteps": ["Step 1 to complete the task", "Step 2", ...] (only if not completed)
        }

        IMPORTANT GUIDELINES:
        - Be thorough in your verification
        - If the task is about profile completion, check if the relevant fields are filled
        - If the task is about document uploads, check if documents exist
        - If the task is about questionnaire completion, check if it's submitted
        - Provide specific, actionable next steps if the task is not completed
        `;

        // Call Gemini API
        const result = await model.generateContent(prompt);
        const response = result.response;
        const textResponse = response.text();

        // Clean and parse the response
        const cleanedResponse = cleanJsonResponse(textResponse);
        const parsedResponse = safeJsonParse(cleanedResponse);

        if (parsedResponse && typeof parsedResponse.completed === 'boolean') {
            return {
                completed: parsedResponse.completed,
                message: parsedResponse.message || '',
                nextSteps: parsedResponse.nextSteps || []
            };
        }

        // Fallback to simple verification if AI fails
        return simpleTaskVerification(task, userData);
    } catch (error) {
        console.error('Error verifying task with AI:', error);
        // Fallback to simple verification if AI fails
        return simpleTaskVerification(task, userData);
    }
}

/**
 * Simple rule-based task verification
 */
function simpleTaskVerification(task: Task, userData: any): { completed: boolean; message: string; nextSteps?: string[] } {
    const { category, title } = task;

    // Check profile completion tasks
    if (category === 'profile') {
        if (title.includes('profile')) {
            const profile = userData.profile;
            if (!profile) {
                return {
                    completed: false,
                    message: 'Your profile is not yet created.',
                    nextSteps: ['Go to the profile section', 'Fill in your basic information']
                };
            }

            // Check if basic profile fields are filled
            const requiredFields = ['companyName', 'industry', 'location'];
            const missingFields = requiredFields.filter(field => !profile[field]);

            if (missingFields.length > 0) {
                return {
                    completed: false,
                    message: `Your profile is missing some required fields: ${missingFields.join(', ')}`,
                    nextSteps: ['Complete all required profile fields']
                };
            }

            return {
                completed: true,
                message: 'Your profile has been completed successfully.'
            };
        }
    }

    // Check document tasks
    if (category === 'document' || title.includes('document') || title.includes('upload')) {
        if (!userData.documents || userData.documents.length === 0) {
            return {
                completed: false,
                message: 'You have not uploaded any documents yet.',
                nextSteps: ['Go to the documents section', 'Upload relevant documents']
            };
        }

        return {
            completed: true,
            message: `You have uploaded ${userData.documents.length} documents.`
        };
    }

    // Check questionnaire tasks
    if (title.includes('questionnaire')) {
        if (!userData.questionnaire || userData.questionnaire.status !== 'submitted') {
            return {
                completed: false,
                message: 'You have not completed the questionnaire yet.',
                nextSteps: ['Go to the questionnaire section', 'Complete all questions', 'Submit the questionnaire']
            };
        }

        return {
            completed: true,
            message: 'You have successfully completed the questionnaire.'
        };
    }

    // Default to manual verification
    return {
        completed: true,
        message: 'Task marked as completed. (Manual verification)'
    };
}

/**
 * Gather user data for AI task generation and verification
 * @returns Object containing user data and the latest update timestamp
 */
async function gatherUserData(userId: string, role?: string): Promise<{ data: any, lastUpdated: Date }> {
    const userData: any = { userId };
    let lastUpdated = new Date(0); // Start with oldest possible date

    // Get profile data
    if (role === 'startup') {
        const startupProfile = await StartupProfileModel.findOne({ userId });
        if (startupProfile) {
            userData.profile = startupProfile;
            // Update lastUpdated if this data is newer
            if (startupProfile.updatedAt && startupProfile.updatedAt > lastUpdated) {
                lastUpdated = startupProfile.updatedAt;
            }
        }
    } else if (role === 'investor') {
        const investorProfile = await InvestorProfileModel.findOne({ userId });
        if (investorProfile) {
            userData.profile = investorProfile;
            // Update lastUpdated if this data is newer
            if (investorProfile.updatedAt && investorProfile.updatedAt > lastUpdated) {
                lastUpdated = investorProfile.updatedAt;
            }
        }
    }

    // Get extended profile
    const extendedProfile = await ExtendedProfileModel.findOne({ userId });
    if (extendedProfile) {
        userData.extendedProfile = extendedProfile;
        // Update lastUpdated if this data is newer
        if (extendedProfile.updatedAt && extendedProfile.updatedAt > lastUpdated) {
            lastUpdated = extendedProfile.updatedAt;
        }
    }

    // Get documents
    const documents = await DocumentModel.find({ userId });
    if (documents.length > 0) {
        userData.documents = documents;
        // Find the most recently updated document
        for (const doc of documents) {
            if (doc.updatedAt && doc.updatedAt > lastUpdated) {
                lastUpdated = doc.updatedAt;
            }
        }
    }

    // Get questionnaire
    const questionnaire = await QuestionnaireSubmissionModel.findOne({ userId });
    if (questionnaire) {
        userData.questionnaire = questionnaire;
        // Update lastUpdated if this data is newer
        if (questionnaire.updatedAt && questionnaire.updatedAt > lastUpdated) {
            lastUpdated = questionnaire.updatedAt;
        }
    }

    // Get tasks
    const tasks = await TaskModel.find({ userId });
    if (tasks.length > 0) {
        userData.tasks = tasks;
        // Find the most recently updated task
        for (const task of tasks) {
            if (task.updatedAt && task.updatedAt > lastUpdated) {
                lastUpdated = task.updatedAt;
            }
        }
    }

    return { data: userData, lastUpdated };
}

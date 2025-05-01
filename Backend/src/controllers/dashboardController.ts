import { Request, Response } from 'express';
import { prisma } from '../config/db';
import MatchAnalysisModel from '../models/MatchAnalysisSchema';
import StartupProfileModel from '../models/Profile/StartupProfile';
import InvestorProfileModel from '../models/InvestorModels/InvestorProfile';
import DocumentModel from '../models/Profile/Document';
import TaskModel from '../models/Task';
import ExtendedProfileModel from '../models/Profile/ExtendedProfile';
import QuestionnaireSubmissionModel from '../models/question/QuestionnaireSubmission';
import FinancialDueDiligenceReport from '../models/Analytics/FinancialDueDiligenceReport';
import AIInsightsService, { DashboardInsight } from '../services/AIInsightsService';
import TimeSeriesDataService from '../services/TimeSeriesDataService';

// Type for activity item
interface ActivityItem {
    id: string;
    type: string;
    title: string;
    entity: string;
    time: Date;
    icon: string;
    color: string;
    formattedTime?: string;
    details?: string;
    score?: number;
}

// Type for task with formatted date
interface TaskWithFormattedDate {
    id: string;
    userId: string;
    title: string;
    description?: string;
    dueDate: Date;
    priority: string;
    completed: boolean;
    category: string;
    createdAt: Date;
    updatedAt: Date;
    formattedDueDate?: string;
}

// Type for match result
interface MatchResult {
    id: any; // Using 'any' for MongoDB _id compatibility
    entityId: string;
    name: string;
    description: string;
    compatibilityScore: number;
    location: string;
    industry: string;
    isNew: boolean;
}

// Type for Mongoose document results

/**
 * Get overview statistics for the dashboard
 */
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const userId = req.user.userId;
        const role = req.user.role;

        // Get document count from MongoDB
        const documentCount = await DocumentModel.countDocuments({ userId });

        // Get document view count
        const documentViews = await prisma.documentView.count({
            where: { entity_id: userId }
        });

        // Get document download count
        const documentDownloads = await prisma.documentDownload.count({
            where: { entity_id: userId }
        });

        // Get profile view count from profile shares
        const profileShares = await prisma.profileShare.findMany({
            where: { user_id: userId }
        });

        // Sum up view counts from all profile shares
        const profileViews = profileShares.reduce((sum, share) => sum + share.view_count, 0);

        // Get match data based on role
        let matchData;
        let compatibilityScore = 0;
        let matchRate = 0;

        if (role === 'startup') {
            // For startups, get matches with investors
            const matches = await MatchAnalysisModel.find({
                startupId: userId,
                perspective: 'startup'
            }).sort({ overallScore: -1 });

            // Calculate average compatibility score
            if (matches.length > 0) {
                compatibilityScore = Math.round(
                    matches.reduce((sum, match) => sum + match.overallScore, 0) / matches.length
                );

                // Calculate match rate (percentage of matches above 70%)
                const goodMatches = matches.filter(match => match.overallScore >= 70).length;
                matchRate = Math.round((goodMatches / matches.length) * 100);
            }

            matchData = { matches, compatibilityScore, matchRate };
        } else if (role === 'investor') {
            // For investors, get matches with startups
            const matches = await MatchAnalysisModel.find({
                investorId: userId,
                perspective: 'investor'
            }).sort({ overallScore: -1 });

            // Calculate average compatibility score
            if (matches.length > 0) {
                compatibilityScore = Math.round(
                    matches.reduce((sum, match) => sum + match.overallScore, 0) / matches.length
                );

                // Calculate match rate (percentage of matches above 70%)
                const goodMatches = matches.filter(match => match.overallScore >= 70).length;
                matchRate = Math.round((goodMatches / matches.length) * 100);
            }

            matchData = { matches, compatibilityScore, matchRate };
        }

        // Return all stats
        res.json({
            documentCount,
            profileViews,
            documentViews,
            documentDownloads,
            compatibilityScore,
            matchRate,
            matchData
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Get recent matches for the dashboard
 */
export const getRecentMatches = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const userId = req.user.userId;
        const role = req.user.role;
        const limit = parseInt(req.query.limit as string) || 5;

        let matches: any[] = [];
        let matchEntities: any[] = [];

        if (role === 'startup') {
            // For startups, get matches with investors
            matches = await MatchAnalysisModel.find({
                startupId: userId,
                perspective: 'startup'
            })
                .sort({ createdAt: -1 })
                .limit(limit);

            // Get investor profiles for these matches
            const investorIds = matches.map(match => match.investorId);
            matchEntities = await InvestorProfileModel.find({
                userId: { $in: investorIds }
            });
        } else if (role === 'investor') {
            // For investors, get matches with startups
            matches = await MatchAnalysisModel.find({
                investorId: userId,
                perspective: 'investor'
            })
                .sort({ createdAt: -1 })
                .limit(limit);

            // Get startup profiles for these matches
            const startupIds = matches.map(match => match.startupId);
            matchEntities = await StartupProfileModel.find({
                userId: { $in: startupIds }
            });
        }

        // Combine match data with entity profiles
        const recentMatches: MatchResult[] = matches.map(match => {
            const entityId = role === 'startup' ? match.investorId : match.startupId;
            const entity = matchEntities.find(e => e.userId === entityId);

            // Get appropriate properties based on entity type
            const name = entity?.companyName || 'Unknown Company';
            const description = role === 'startup'
                ? 'Investment firm'
                : (entity?.pitch || 'Startup company');
            const location = entity?.location || 'Unknown Location';
            const industry = role === 'startup'
                ? (entity?.industriesOfInterest?.[0] || 'Investment')
                : (entity?.industry || 'Technology');

            return {
                id: match._id,
                entityId,
                name,
                description,
                compatibilityScore: match.overallScore,
                location,
                industry,
                isNew: new Date(match.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 // Within last 7 days
            };
        });

        res.json({ recentMatches });
    } catch (error) {
        console.error('Error getting recent matches:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Get recent activity for the dashboard
 */
export const getRecentActivity = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const userId = req.user.userId;
        const role = req.user.role;
        const limit = parseInt(req.query.limit as string) || 5;

        // Get document views (someone viewed your document)
        const documentViews = await prisma.documentView.findMany({
            where: { entity_id: userId },
            orderBy: { viewed_at: 'desc' },
            take: limit,
            include: {
                user: {
                    select: {
                        email: true,
                        role: true
                    }
                }
            }
        });

        // Get document downloads (someone downloaded your document)
        const documentDownloads = await prisma.documentDownload.findMany({
            where: { entity_id: userId },
            orderBy: { downloaded_at: 'desc' },
            take: limit,
            include: {
                user: {
                    select: {
                        email: true,
                        role: true
                    }
                }
            }
        });

        // Get recent matches
        let recentMatches: any[] = [];
        if (role === 'startup') {
            recentMatches = await MatchAnalysisModel.find({
                startupId: userId,
                perspective: 'startup'
            })
                .sort({ createdAt: -1 })
                .limit(limit);
        } else if (role === 'investor') {
            recentMatches = await MatchAnalysisModel.find({
                investorId: userId,
                perspective: 'investor'
            })
                .sort({ createdAt: -1 })
                .limit(limit);
        }

        // Combine all activities and sort by date
        const activities: ActivityItem[] = [
            ...documentViews.map(view => ({
                id: `view_${view.id}`,
                type: 'profile_view',
                title: role === 'startup' ? 'Investor viewed your profile' : 'Startup viewed your profile',
                entity: view.user.email,
                time: view.viewed_at,
                icon: 'user',
                color: '#3e60e9'
            })),
            ...documentDownloads.map(download => ({
                id: `download_${download.id}`,
                type: 'document_download',
                title: role === 'startup' ? 'Investor downloaded your document' : 'Startup downloaded your document',
                entity: download.user.email,
                time: download.downloaded_at,
                icon: 'file-text',
                color: '#10B981'
            })),
            ...recentMatches.map(match => ({
                id: `match_${match._id}`,
                type: 'match',
                title: 'New match found',
                entity: role === 'startup' ? 'Investor' : 'Startup',
                time: match.createdAt,
                icon: 'check-circle',
                color: '#F59E0B'
            }))
        ];

        // Sort by date (newest first)
        activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        // Take only the requested number
        const recentActivity = activities.slice(0, limit);

        // Format dates as relative time
        const formattedActivity = recentActivity.map(activity => {
            const date = new Date(activity.time);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor(diffMs / (1000 * 60));

            let formattedTime;
            if (diffDays > 7) {
                formattedTime = date.toLocaleDateString();
            } else if (diffDays > 0) {
                formattedTime = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            } else if (diffHours > 0) {
                formattedTime = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            } else if (diffMinutes > 0) {
                formattedTime = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
            } else {
                formattedTime = 'Just now';
            }

            return {
                ...activity,
                formattedTime
            };
        });

        res.json({ activities: formattedActivity });
    } catch (error) {
        console.error('Error getting recent activity:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Get upcoming tasks for the dashboard
 */
/**
 * Get AI-generated insights for the dashboard
 */
export const getInsights = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const userId = req.user.userId;
        const role = req.user.role || 'startup';

        // Gather user data for insights generation
        const userData = await gatherUserDataForInsights(userId, role);

        // Generate insights using AI service with caching
        console.log('Generating AI-powered insights with Gemini 2.0 Flash');
        const insights = await AIInsightsService.generateInsights(userData, role, userId);
        console.log(`Generated ${insights.length} insights`);

        res.json(insights);
    } catch (error) {
        console.error('Error generating insights:', error);
        res.status(500).json({
            message: 'Failed to generate insights. Please try again later.',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

/**
 * Helper function to gather user data for insights generation
 */
async function gatherUserDataForInsights(userId: string, role: string) {
    // Get document count from MongoDB
    const documentCount = await DocumentModel.countDocuments({ userId });

    // Get document view count
    const documentViews = await prisma.documentView.count({
        where: { entity_id: userId }
    });

    // Get document download count
    const documentDownloads = await prisma.documentDownload.count({
        where: { entity_id: userId }
    });

    // Get profile view count from profile shares
    const profileShares = await prisma.profileShare.findMany({
        where: { user_id: userId }
    });

    // Sum up view counts from all profile shares
    const profileViews = profileShares.reduce((sum, share) => sum + share.view_count, 0);

    // Get match data
    let matches: any[] = [];
    let compatibilityScore = 0;
    let matchRate = 0;

    if (role === 'startup') {
        matches = await MatchAnalysisModel.find({
            startupId: userId,
            perspective: 'startup'
        }).sort({ overallScore: -1 });
    } else {
        matches = await MatchAnalysisModel.find({
            investorId: userId,
            perspective: 'investor'
        }).sort({ overallScore: -1 });
    }

    // Calculate average compatibility score
    if (matches.length > 0) {
        compatibilityScore = Math.round(
            matches.reduce((sum, match) => sum + match.overallScore, 0) / matches.length
        );

        // Calculate match rate (percentage of matches above 70%)
        const goodMatches = matches.filter(match => match.overallScore >= 70).length;
        matchRate = Math.round((goodMatches / matches.length) * 100);
    }

    // Calculate profile completion percentage
    let profileCompletionPercentage = 0;
    if (role === 'startup') {
        const startupProfile = await StartupProfileModel.findOne({ userId });
        if (startupProfile) {
            const totalFields = 7; // Adjust based on your schema
            let completedFields = 0;

            if (startupProfile.companyName) completedFields++;
            if (startupProfile.industry) completedFields++;
            if (startupProfile.fundingStage) completedFields++;
            if (startupProfile.employeeCount) completedFields++;
            if (startupProfile.location) completedFields++;
            if (startupProfile.pitch) completedFields++;
            // Check for websiteUrl if it exists in the schema
            if ('websiteUrl' in startupProfile && startupProfile.websiteUrl) completedFields++;

            profileCompletionPercentage = Math.round((completedFields / totalFields) * 100);
        }
    } else {
        const investorProfile = await InvestorProfileModel.findOne({ userId });
        if (investorProfile) {
            const totalFields = 6; // Adjust based on your schema
            let completedFields = 0;

            if (investorProfile.companyName) completedFields++;
            if (investorProfile.industriesOfInterest && investorProfile.industriesOfInterest.length > 0) completedFields++;
            if (investorProfile.preferredStages && investorProfile.preferredStages.length > 0) completedFields++;
            if (investorProfile.ticketSize) completedFields++;
            if (investorProfile.investmentCriteria && investorProfile.investmentCriteria.length > 0) completedFields++;
            if (investorProfile.pastInvestments) completedFields++;

            profileCompletionPercentage = Math.round((completedFields / totalFields) * 100);
        }
    }

    // Return user data for insights generation
    return {
        stats: {
            documentCount,
            profileViews,
            documentViews,
            documentDownloads,
            compatibilityScore,
            matchRate,
            profileCompletionPercentage
        },
        matches
    };
}

/**
 * Get upcoming tasks for the dashboard
 */
export const getUpcomingTasks = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const userId = req.user.userId;

        // Get tasks from the database
        let tasks = await TaskModel.find({
            userId,
            completed: false,
            dueDate: { $gte: new Date() }
        }).sort({ dueDate: 1 }).limit(5);

        // If no tasks exist, generate recommended tasks
        if (tasks.length === 0) {
            const role = req.user.role;
            const taskItems: any[] = [];

            // Check profile completeness
            if (role === 'startup') {
                const startupProfile = await StartupProfileModel.findOne({ userId });
                const extendedProfile = await ExtendedProfileModel.findOne({ userId });

                if (!startupProfile) {
                    taskItems.push({
                        userId,
                        title: 'Complete your startup profile',
                        description: 'Add basic information about your startup',
                        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                        priority: 'high',
                        category: 'profile'
                    });
                } else {
                    // Check for missing fields
                    if (!startupProfile.industry) {
                        taskItems.push({
                            userId,
                            title: 'Add your industry',
                            description: 'Specify your startup\'s industry to improve matching',
                            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                            priority: 'high',
                            category: 'profile'
                        });
                    }

                    if (!startupProfile.fundingStage) {
                        taskItems.push({
                            userId,
                            title: 'Add your funding stage',
                            description: 'Specify your startup\'s current funding stage',
                            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                            priority: 'high',
                            category: 'profile'
                        });
                    }

                    if (!startupProfile.pitch) {
                        taskItems.push({
                            userId,
                            title: 'Add your pitch',
                            description: 'Write a compelling pitch for your startup',
                            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
                            priority: 'medium',
                            category: 'profile'
                        });
                    }
                }

                // Check for extended profile
                if (!extendedProfile || !extendedProfile.teamMembers || extendedProfile.teamMembers.length === 0) {
                    taskItems.push({
                        userId,
                        title: 'Add team members',
                        description: 'Add information about your team members',
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                        priority: 'medium',
                        category: 'profile'
                    });
                }
            } else if (role === 'investor') {
                const investorProfile = await InvestorProfileModel.findOne({ userId });
                const extendedProfile = await ExtendedProfileModel.findOne({ userId });

                if (!investorProfile) {
                    taskItems.push({
                        userId,
                        title: 'Complete your investor profile',
                        description: 'Add basic information about your investment firm',
                        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                        priority: 'high',
                        category: 'profile'
                    });
                } else {
                    // Check for missing fields
                    if (!investorProfile.industriesOfInterest || investorProfile.industriesOfInterest.length === 0) {
                        taskItems.push({
                            userId,
                            title: 'Add industries of interest',
                            description: 'Specify industries you are interested in investing in',
                            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                            priority: 'high',
                            category: 'profile'
                        });
                    }

                    if (!investorProfile.preferredStages || investorProfile.preferredStages.length === 0) {
                        taskItems.push({
                            userId,
                            title: 'Add preferred funding stages',
                            description: 'Specify funding stages you prefer to invest in',
                            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                            priority: 'high',
                            category: 'profile'
                        });
                    }

                    if (!investorProfile.ticketSize) {
                        taskItems.push({
                            userId,
                            title: 'Add your ticket size',
                            description: 'Specify your typical investment amount range',
                            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
                            priority: 'medium',
                            category: 'profile'
                        });
                    }
                }

                // Check for extended profile
                if (!extendedProfile || !extendedProfile.investmentHistory || extendedProfile.investmentHistory.length === 0) {
                    taskItems.push({
                        userId,
                        title: 'Add investment history',
                        description: 'Add information about your past investments',
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                        priority: 'medium',
                        category: 'profile'
                    });
                }
            }

            // Check for documents
            const documents = await DocumentModel.find({ userId });
            if (documents.length === 0) {
                taskItems.push({
                    userId,
                    title: 'Upload documents',
                    description: 'Upload relevant documents to enhance your profile',
                    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
                    priority: 'medium',
                    category: 'document'
                });
            }

            // Check for questionnaire
            const questionnaire = await QuestionnaireSubmissionModel.findOne({ userId });
            if (!questionnaire || questionnaire.status !== 'submitted') {
                taskItems.push({
                    userId,
                    title: 'Complete questionnaire',
                    description: 'Fill out the questionnaire to improve matching',
                    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
                    priority: 'high',
                    category: 'profile'
                });
            }

            // Create tasks in database
            for (const taskData of taskItems.slice(0, 3)) { // Limit to 3 tasks
                const newTask = new TaskModel(taskData);
                await newTask.save();
                tasks.push(newTask);
            }
        }

        // Format dates
        const formattedTasks = tasks.map(task => {
            const date = new Date(task.dueDate);
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);

            let formattedDueDate;
            if (date.toDateString() === now.toDateString()) {
                formattedDueDate = 'Today';
            } else if (date.toDateString() === tomorrow.toDateString()) {
                formattedDueDate = 'Tomorrow';
            } else {
                formattedDueDate = date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
            }

            const taskObj = task.toObject();
            return {
                id: String(taskObj._id),
                userId: taskObj.userId,
                title: taskObj.title,
                description: taskObj.description,
                dueDate: taskObj.dueDate,
                priority: taskObj.priority,
                completed: taskObj.completed,
                category: taskObj.category,
                createdAt: taskObj.createdAt,
                updatedAt: taskObj.updatedAt,
                formattedDueDate
            };
        });

        res.json({ tasks: formattedTasks });
    } catch (error) {
        console.error('Error getting upcoming tasks:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Get all dashboard data in a single request
 */
export const getAllDashboardData = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const userId = req.user.userId;
        const role = req.user.role;

        // Get document count from MongoDB
        const documentCount = await DocumentModel.countDocuments({ userId });

        // Get document view count
        const documentViews = await prisma.documentView.count({
            where: { entity_id: userId }
        });

        // Get document download count
        const documentDownloads = await prisma.documentDownload.count({
            where: { entity_id: userId }
        });

        // Get profile view count from profile shares
        const profileShares = await prisma.profileShare.findMany({
            where: { user_id: userId }
        });

        // Sum up view counts from all profile shares
        const profileViews = profileShares.reduce((sum, share) => sum + share.view_count, 0);

        // Get match data based on role
        let matches: any[] = [];
        let compatibilityScore = 0;
        let matchRate = 0;
        let matchEntities: any[] = [];

        if (role === 'startup') {
            // For startups, get matches with investors
            matches = await MatchAnalysisModel.find({
                startupId: userId,
                perspective: 'startup'
            }).sort({ overallScore: -1 });

            // Calculate average compatibility score
            if (matches.length > 0) {
                compatibilityScore = Math.round(
                    matches.reduce((sum, match) => sum + match.overallScore, 0) / matches.length
                );

                // Calculate match rate (percentage of matches above 70%)
                const goodMatches = matches.filter(match => match.overallScore >= 70).length;
                matchRate = Math.round((goodMatches / matches.length) * 100);
            }

            // Get investor profiles for these matches
            const investorIds = matches.map(match => match.investorId);
            matchEntities = await InvestorProfileModel.find({
                userId: { $in: investorIds }
            });
        } else if (role === 'investor') {
            // For investors, get matches with startups
            matches = await MatchAnalysisModel.find({
                investorId: userId,
                perspective: 'investor'
            }).sort({ overallScore: -1 });

            // Calculate average compatibility score
            if (matches.length > 0) {
                compatibilityScore = Math.round(
                    matches.reduce((sum, match) => sum + match.overallScore, 0) / matches.length
                );

                // Calculate match rate (percentage of matches above 70%)
                const goodMatches = matches.filter(match => match.overallScore >= 70).length;
                matchRate = Math.round((goodMatches / matches.length) * 100);
            }

            // Get startup profiles for these matches
            const startupIds = matches.map(match => match.startupId);
            matchEntities = await StartupProfileModel.find({
                userId: { $in: startupIds }
            });
        }

        // Combine match data with entity profiles for recent matches
        const recentMatches: MatchResult[] = matches.slice(0, 5).map(match => {
            const entityId = role === 'startup' ? match.investorId : match.startupId;
            const entity = matchEntities.find(e => e.userId === entityId);

            // Get appropriate properties based on entity type
            const name = entity?.companyName || 'Unknown Company';
            const description = role === 'startup'
                ? 'Investment firm'
                : (entity?.pitch || 'Startup company');
            const location = entity?.location || 'Unknown Location';
            const industry = role === 'startup'
                ? (entity?.industriesOfInterest?.[0] || 'Investment')
                : (entity?.industry || 'Technology');

            return {
                id: match._id,
                entityId,
                name,
                description,
                compatibilityScore: match.overallScore,
                location,
                industry,
                isNew: new Date(match.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 // Within last 7 days
            };
        });

        // Get document views (someone viewed your document)
        const documentViewsData = await prisma.documentView.findMany({
            where: { entity_id: userId },
            orderBy: { viewed_at: 'desc' },
            take: 5,
            include: {
                user: {
                    select: {
                        email: true,
                        role: true
                    }
                }
            }
        });

        // Get document downloads (someone downloaded your document)
        const documentDownloadsData = await prisma.documentDownload.findMany({
            where: { entity_id: userId },
            orderBy: { downloaded_at: 'desc' },
            take: 5,
            include: {
                user: {
                    select: {
                        email: true,
                        role: true
                    }
                }
            }
        });

        // Get entity names for matches
        const matchEntityIds = matches.slice(0, 5).map(match =>
            role === 'startup' ? match.investorId : match.startupId
        );

        // Fetch entity names for matches
        let matchEntityNames: Record<string, string> = {};

        if (matchEntityIds.length > 0) {
            if (role === 'startup') {
                const investorProfiles = await InvestorProfileModel.find({
                    userId: { $in: matchEntityIds }
                });

                investorProfiles.forEach(profile => {
                    matchEntityNames[profile.userId] = profile.companyName || profile.userId;
                });
            } else {
                const startupProfiles = await StartupProfileModel.find({
                    userId: { $in: matchEntityIds }
                });

                startupProfiles.forEach(profile => {
                    matchEntityNames[profile.userId] = profile.companyName || profile.userId;
                });
            }
        }

        // Combine all activities and sort by date with improved entity information
        const activities: ActivityItem[] = [
            ...documentViewsData.map(view => {
                // Get viewer role for better context
                const viewerRole = view.user.role;
                const viewerEmail = view.user.email;

                return {
                    id: `view_${view.id}`,
                    type: 'profile_view',
                    title: `${viewerRole === 'investor' ? 'Investor' : 'Startup'} viewed your profile`,
                    entity: viewerEmail,
                    time: view.viewed_at,
                    icon: 'user',
                    color: '#3e60e9',
                    details: `${viewerEmail} (${viewerRole}) viewed your profile`
                };
            }),
            ...documentDownloadsData.map(download => {
                // Get downloader role for better context
                const downloaderRole = download.user.role;
                const downloaderEmail = download.user.email;

                return {
                    id: `download_${download.id}`,
                    type: 'document_download',
                    title: `${downloaderRole === 'investor' ? 'Investor' : 'Startup'} downloaded your document`,
                    entity: downloaderEmail,
                    time: download.downloaded_at,
                    icon: 'file-text',
                    color: '#10B981',
                    details: `${downloaderEmail} (${downloaderRole}) downloaded your document`
                };
            }),
            ...matches.slice(0, 5).map(match => {
                const entityId = role === 'startup' ? match.investorId : match.startupId;
                const entityName = matchEntityNames[entityId] || (role === 'startup' ? 'Investor' : 'Startup');
                const matchScore = match.overallScore;

                return {
                    id: `match_${match._id}`,
                    type: 'match',
                    title: `New match with ${entityName}`,
                    entity: entityName,
                    time: match.createdAt,
                    icon: 'check-circle',
                    color: '#F59E0B',
                    details: `Match score: ${matchScore}%`,
                    score: matchScore
                };
            })
        ];

        // Sort by date (newest first)
        activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        // Take only the top 5
        const recentActivity = activities.slice(0, 5);

        // Format dates as relative time
        const formattedActivity = recentActivity.map(activity => {
            const date = new Date(activity.time);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor(diffMs / (1000 * 60));

            let formattedTime;
            if (diffDays > 7) {
                formattedTime = date.toLocaleDateString();
            } else if (diffDays > 0) {
                formattedTime = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
            } else if (diffHours > 0) {
                formattedTime = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
            } else if (diffMinutes > 0) {
                formattedTime = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
            } else {
                formattedTime = 'Just now';
            }

            return {
                ...activity,
                formattedTime
            };
        });

        // Get time-series data for analytics
        // 1. Document views over time (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const documentViewsTimeSeries = await prisma.documentView.groupBy({
            by: ['viewed_at'],
            where: {
                entity_id: userId,
                viewed_at: {
                    gte: thirtyDaysAgo
                }
            },
            _count: {
                id: true
            },
            orderBy: {
                viewed_at: 'asc'
            }
        });

        // 2. Document downloads over time (last 30 days)
        const documentDownloadsTimeSeries = await prisma.documentDownload.groupBy({
            by: ['downloaded_at'],
            where: {
                entity_id: userId,
                downloaded_at: {
                    gte: thirtyDaysAgo
                }
            },
            _count: {
                id: true
            },
            orderBy: {
                downloaded_at: 'asc'
            }
        });

        // 3. Get match creation dates from MongoDB for time-series data
        const matchesTimeSeries = await MatchAnalysisModel.aggregate([
            {
                $match: role === 'startup'
                    ? { startupId: userId, perspective: 'startup' }
                    : { investorId: userId, perspective: 'investor' }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 },
                    avgScore: { $avg: "$overallScore" }
                }
            },
            {
                $sort: { "_id": 1 }
            }
        ]);

        // Format and fill gaps in time-series data for frontend charts
        const today = new Date();

        // Map time series data
        const rawDocumentViews = documentViewsTimeSeries.map(item => ({
            date: new Date(item.viewed_at).toISOString().split('T')[0],
            count: item._count.id
        }));

        const rawDocumentDownloads = documentDownloadsTimeSeries.map(item => ({
            date: new Date(item.downloaded_at).toISOString().split('T')[0],
            count: item._count.id
        }));

        const rawMatches = matchesTimeSeries.map(item => ({
            date: item._id,
            count: item.count,
            avgScore: Math.round(item.avgScore)
        }));

        // Fill gaps in time-series data
        const filledDocumentViews = TimeSeriesDataService.fillTimeSeriesGaps(
            rawDocumentViews,
            thirtyDaysAgo,
            today
        );

        const filledDocumentDownloads = TimeSeriesDataService.fillTimeSeriesGaps(
            rawDocumentDownloads,
            thirtyDaysAgo,
            today
        );

        // For matches, we need to handle the avgScore field
        const filledMatches = TimeSeriesDataService.fillTimeSeriesGaps(
            rawMatches,
            thirtyDaysAgo,
            today
        ).map(item => ({
            ...item,
            avgScore: item.count > 0 ? item.avgScore || 0 : 0
        }));

        // Aggregate data by week for a higher-level view
        const weeklyDocumentViews = TimeSeriesDataService.aggregateByPeriod(
            rawDocumentViews,
            'week'
        );

        const weeklyDocumentDownloads = TimeSeriesDataService.aggregateByPeriod(
            rawDocumentDownloads,
            'week'
        );

        const engagementTrends = {
            documentViews: filledDocumentViews,
            documentDownloads: filledDocumentDownloads,
            matches: filledMatches,
            weekly: {
                documentViews: weeklyDocumentViews,
                documentDownloads: weeklyDocumentDownloads
            }
        };

        // Calculate engagement metrics with more sophisticated approach
        const totalEngagements = documentViews + documentDownloads + matches.length;

        // Get analytics changes for percentage calculations
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        // Get current period metrics (last 7 days)
        const currentPeriodViews = await prisma.documentView.count({
            where: {
                entity_id: userId,
                viewed_at: {
                    gte: sevenDaysAgo
                }
            }
        });

        const currentPeriodDownloads = await prisma.documentDownload.count({
            where: {
                entity_id: userId,
                downloaded_at: {
                    gte: sevenDaysAgo
                }
            }
        });

        // Get previous period metrics (7-14 days ago)
        const previousPeriodViews = await prisma.documentView.count({
            where: {
                entity_id: userId,
                viewed_at: {
                    gte: fourteenDaysAgo,
                    lt: sevenDaysAgo
                }
            }
        });

        const previousPeriodDownloads = await prisma.documentDownload.count({
            where: {
                entity_id: userId,
                downloaded_at: {
                    gte: fourteenDaysAgo,
                    lt: sevenDaysAgo
                }
            }
        });

        // Calculate percentage changes
        const calculatePercentageChange = (current: number, previous: number): number => {
            if (previous === 0) {
                return current > 0 ? 100 : 0;
            }
            return Math.round(((current - previous) / previous) * 100);
        };

        const viewsPercentChange = calculatePercentageChange(currentPeriodViews, previousPeriodViews);
        const downloadsPercentChange = calculatePercentageChange(currentPeriodDownloads, previousPeriodDownloads);

        // Calculate weighted engagement rate
        // This considers both volume and recency of engagement
        const viewWeight = 1;
        const downloadWeight = 2; // Downloads are more valuable than views
        const matchWeight = 3;    // Matches are most valuable

        const totalWeightedEngagements =
            (documentViews * viewWeight) +
            (documentDownloads * downloadWeight) +
            (matches.length * matchWeight);

        const maxPossibleScore = (documentViews + documentDownloads + matches.length) * matchWeight;

        const engagementRate = maxPossibleScore > 0
            ? Math.round((totalWeightedEngagements / maxPossibleScore) * 100) / 100
            : 0;

        // Store analytics changes for the frontend
        const analyticsChanges = {
            documentViews: {
                current: currentPeriodViews,
                previous: previousPeriodViews,
                percentageChange: viewsPercentChange
            },
            documentDownloads: {
                current: currentPeriodDownloads,
                previous: previousPeriodDownloads,
                percentageChange: downloadsPercentChange
            }
        };

        // Calculate profile completion percentage
        let profileCompletionPercentage = 0;

        if (role === 'startup') {
            const startupProfile = await StartupProfileModel.findOne({ userId });
            const extendedProfile = await ExtendedProfileModel.findOne({ userId });

            if (startupProfile) {
                // Required fields (50% of total score)
                const requiredFields = ['companyName', 'industry', 'fundingStage'];
                let requiredScore = 0;

                requiredFields.forEach(field => {
                    if (startupProfile.get(field)) {
                        requiredScore++;
                    }
                });

                const requiredPercentage = (requiredScore / requiredFields.length) * 50;

                // Optional fields (30% of total score)
                const optionalFields = ['employeeCount', 'location', 'pitch'];
                let optionalScore = 0;

                optionalFields.forEach(field => {
                    if (startupProfile.get(field)) {
                        optionalScore++;
                    }
                });

                const optionalPercentage = (optionalScore / optionalFields.length) * 30;

                // Bonus fields (20% of total score)
                let bonusScore = 0;
                let bonusTotal = 0;

                if (extendedProfile) {
                    if (extendedProfile.socialLinks && extendedProfile.socialLinks.length > 0) {
                        bonusScore++;
                    }
                    bonusTotal++;

                    if (extendedProfile.teamMembers && extendedProfile.teamMembers.length > 0) {
                        bonusScore++;
                    }
                    bonusTotal++;
                } else {
                    bonusTotal = 2; // Two bonus categories
                }

                const bonusPercentage = bonusTotal > 0 ? (bonusScore / bonusTotal) * 20 : 0;

                // Calculate total percentage
                profileCompletionPercentage = Math.round(requiredPercentage + optionalPercentage + bonusPercentage);
            }
        } else if (role === 'investor') {
            const investorProfile = await InvestorProfileModel.findOne({ userId });
            const extendedProfile = await ExtendedProfileModel.findOne({ userId });

            if (investorProfile) {
                // Required fields (50% of total score)
                const requiredFields = ['companyName', 'industriesOfInterest', 'preferredStages'];
                let requiredScore = 0;

                if (investorProfile.companyName) {
                    requiredScore++;
                }

                if (investorProfile.industriesOfInterest && investorProfile.industriesOfInterest.length > 0) {
                    requiredScore++;
                }

                if (investorProfile.preferredStages && investorProfile.preferredStages.length > 0) {
                    requiredScore++;
                }

                const requiredPercentage = (requiredScore / requiredFields.length) * 50;

                // Optional fields (30% of total score)
                const optionalFields = ['ticketSize', 'investmentCriteria', 'pastInvestments'];
                let optionalScore = 0;

                if (investorProfile.ticketSize) {
                    optionalScore++;
                }

                if (investorProfile.investmentCriteria && investorProfile.investmentCriteria.length > 0) {
                    optionalScore++;
                }

                if (investorProfile.pastInvestments) {
                    optionalScore++;
                }

                const optionalPercentage = (optionalScore / optionalFields.length) * 30;

                // Bonus fields (20% of total score)
                let bonusScore = 0;
                let bonusTotal = 0;

                if (extendedProfile) {
                    if (extendedProfile.socialLinks && extendedProfile.socialLinks.length > 0) {
                        bonusScore++;
                    }
                    bonusTotal++;

                    if (extendedProfile.investmentHistory && extendedProfile.investmentHistory.length > 0) {
                        bonusScore++;
                    }
                    bonusTotal++;
                } else {
                    bonusTotal = 2; // Two bonus categories
                }

                const bonusPercentage = bonusTotal > 0 ? (bonusScore / bonusTotal) * 20 : 0;

                // Calculate total percentage
                profileCompletionPercentage = Math.round(requiredPercentage + optionalPercentage + bonusPercentage);
            }
        }

        // Ensure percentage is between 0 and 100
        profileCompletionPercentage = Math.max(0, Math.min(100, profileCompletionPercentage));

        // Get financial health metrics if available (from MongoDB)
        let financialMetrics = null;

        if (role === 'startup') {
            try {
                // For startups, get financial metrics from financial due diligence reports
                const financialReport = await FinancialDueDiligenceReport.findOne({
                    targetEntityId: userId,
                    targetEntityType: 'startup',
                    reportCalculated: true // Only get reports that were successfully calculated
                }).sort({ createdAt: -1 });

                if (financialReport) {
                    financialMetrics = {
                        keyMetrics: financialReport.executiveSummary?.keyMetrics || [],
                        trends: financialReport.financialAnalysis?.metrics || [],
                        ratios: financialReport.ratioAnalysis || {},
                        growthProjections: financialReport.financialAnalysis?.growthProjections || []
                    };
                }
            } catch (err) {
                console.error('Error fetching financial metrics:', err);
                // Continue without financial metrics if there's an error
            }
        }

        // Get tasks from the database
        const tasks = await TaskModel.find({
            userId,
            completed: false,
            dueDate: { $gte: new Date() }
        }).sort({ dueDate: 1 }).limit(5);

        // If no tasks exist, generate recommended tasks
        if (tasks.length === 0) {
            // Generate tasks based on profile completeness
            const taskItems: any[] = [];

            // Check profile completeness
            if (role === 'startup') {
                const startupProfile = await StartupProfileModel.findOne({ userId });
                const extendedProfile = await ExtendedProfileModel.findOne({ userId });

                if (!startupProfile) {
                    taskItems.push({
                        userId,
                        title: 'Complete your startup profile',
                        description: 'Add basic information about your startup',
                        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                        priority: 'high',
                        category: 'profile'
                    });
                } else {
                    // Check for missing fields
                    if (!startupProfile.industry) {
                        taskItems.push({
                            userId,
                            title: 'Add your industry',
                            description: 'Specify your startup\'s industry to improve matching',
                            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                            priority: 'high',
                            category: 'profile'
                        });
                    }

                    if (!startupProfile.fundingStage) {
                        taskItems.push({
                            userId,
                            title: 'Add your funding stage',
                            description: 'Specify your startup\'s current funding stage',
                            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                            priority: 'high',
                            category: 'profile'
                        });
                    }

                    if (!startupProfile.pitch) {
                        taskItems.push({
                            userId,
                            title: 'Add your pitch',
                            description: 'Write a compelling pitch for your startup',
                            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
                            priority: 'medium',
                            category: 'profile'
                        });
                    }
                }

                // Check for extended profile
                if (!extendedProfile || !extendedProfile.teamMembers || extendedProfile.teamMembers.length === 0) {
                    taskItems.push({
                        userId,
                        title: 'Add team members',
                        description: 'Add information about your team members',
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                        priority: 'medium',
                        category: 'profile'
                    });
                }
            } else if (role === 'investor') {
                const investorProfile = await InvestorProfileModel.findOne({ userId });
                const extendedProfile = await ExtendedProfileModel.findOne({ userId });

                if (!investorProfile) {
                    taskItems.push({
                        userId,
                        title: 'Complete your investor profile',
                        description: 'Add basic information about your investment firm',
                        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                        priority: 'high',
                        category: 'profile'
                    });
                } else {
                    // Check for missing fields
                    if (!investorProfile.industriesOfInterest || investorProfile.industriesOfInterest.length === 0) {
                        taskItems.push({
                            userId,
                            title: 'Add industries of interest',
                            description: 'Specify industries you are interested in investing in',
                            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                            priority: 'high',
                            category: 'profile'
                        });
                    }

                    if (!investorProfile.preferredStages || investorProfile.preferredStages.length === 0) {
                        taskItems.push({
                            userId,
                            title: 'Add preferred funding stages',
                            description: 'Specify funding stages you prefer to invest in',
                            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                            priority: 'high',
                            category: 'profile'
                        });
                    }

                    if (!investorProfile.ticketSize) {
                        taskItems.push({
                            userId,
                            title: 'Add your ticket size',
                            description: 'Specify your typical investment amount range',
                            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
                            priority: 'medium',
                            category: 'profile'
                        });
                    }
                }

                // Check for extended profile
                if (!extendedProfile || !extendedProfile.investmentHistory || extendedProfile.investmentHistory.length === 0) {
                    taskItems.push({
                        userId,
                        title: 'Add investment history',
                        description: 'Add information about your past investments',
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                        priority: 'medium',
                        category: 'profile'
                    });
                }
            }

            // Create tasks in database
            for (const taskData of taskItems.slice(0, 3)) { // Limit to 3 tasks
                const newTask = new TaskModel(taskData);
                await newTask.save();
                tasks.push(newTask);
            }
        }

        // Format dates for tasks
        const formattedTasks = tasks.map(task => {
            const date = new Date(task.dueDate);
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);

            let formattedDueDate;
            if (date.toDateString() === now.toDateString()) {
                formattedDueDate = 'Today';
            } else if (date.toDateString() === tomorrow.toDateString()) {
                formattedDueDate = 'Tomorrow';
            } else {
                formattedDueDate = date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                });
            }

            const taskObj = task.toObject();
            return {
                id: String(taskObj._id),
                userId: taskObj.userId,
                title: taskObj.title,
                description: taskObj.description,
                dueDate: taskObj.dueDate,
                priority: taskObj.priority,
                completed: taskObj.completed,
                category: taskObj.category,
                createdAt: taskObj.createdAt,
                updatedAt: taskObj.updatedAt,
                formattedDueDate
            };
        });

        // Prepare data for AI insights generation
        const userData = {
            stats: {
                documentCount,
                profileViews,
                documentViews,
                documentDownloads,
                compatibilityScore,
                matchRate,
                totalEngagements,
                engagementRate,
                profileCompletionPercentage
            },
            recentMatches,
            activities: formattedActivity,
            analytics: {
                engagementTrends,
                analyticsChanges
            }
        };

        // Generate AI-powered insights using Gemini 2.0 Flash
        let insights: DashboardInsight[] = [];

        try {
            console.log('Generating AI-powered insights with Gemini 2.0 Flash');
            insights = await AIInsightsService.generateInsights(userData, role || 'startup', userId);
            console.log(`Generated ${insights.length} insights`);
        } catch (error) {
            console.error('Error generating AI insights:', error);

            // Fallback to basic insights if AI generation fails
            if (matches.length > 0) {
                insights.push({
                    id: 'insight_1',
                    title: 'Match Quality',
                    content: compatibilityScore > 75
                        ? 'Your matches show strong compatibility. Consider reaching out to your top matches.'
                        : 'Your match quality could be improved. Consider updating your profile with more details.',
                    type: compatibilityScore > 75 ? 'positive' : 'action',
                    icon: compatibilityScore > 75 ? 'trending-up' : 'edit'
                });
            }

            if (documentViews > 0 || documentDownloads > 0) {
                insights.push({
                    id: 'insight_2',
                    title: 'Document Engagement',
                    content: documentDownloads > 5
                        ? 'Your documents are getting good traction with downloads.'
                        : 'Consider uploading more documents to increase engagement.',
                    type: documentDownloads > 5 ? 'positive' : 'neutral',
                    icon: 'file-text'
                });
            }

            if (profileCompletionPercentage < 80) {
                insights.push({
                    id: 'insight_profile',
                    title: 'Complete Your Profile',
                    content: `Your profile is only ${profileCompletionPercentage}% complete. Completing your profile will significantly improve your match quality and visibility.`,
                    type: 'action',
                    icon: 'user-check'
                });
            } else if (role === 'startup') {
                insights.push({
                    id: 'insight_3',
                    title: 'Investor Interest',
                    content: 'Regularly update your profile with recent achievements and metrics to maintain investor interest.',
                    type: 'action',
                    icon: 'users'
                });
            } else {
                insights.push({
                    id: 'insight_3',
                    title: 'Startup Discovery',
                    content: 'Refine your investment criteria to find better startup matches that align with your investment strategy.',
                    type: 'action',
                    icon: 'search'
                });
            }
        }

        // Return all dashboard data with enhanced analytics
        res.json({
            stats: {
                documentCount,
                profileViews,
                documentViews,
                documentDownloads,
                compatibilityScore,
                matchRate,
                totalEngagements,
                engagementRate,
                profileCompletionPercentage
            },
            recentMatches,
            activities: formattedActivity,
            tasks: formattedTasks,
            analytics: {
                engagementTrends,
                financialMetrics,
                changes: analyticsChanges
            },
            insights
        });
    } catch (error) {
        console.error('Error getting all dashboard data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

import { Request, Response } from 'express';
import { prisma } from '../config/db';
import MatchAnalysisModel, { MatchAnalysis } from '../models/MatchAnalysisSchema';
import StartupProfileModel, { StartupProfile } from '../models/Profile/StartupProfile';
import InvestorProfileModel, { InvestorProfile } from '../models/InvestorModels/InvestorProfile';
import DocumentModel from '../models/Profile/Document';

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
}

// Type for task item
interface TaskItem {
    id: string;
    title: string;
    dueDate: Date;
    priority: string;
    completed: boolean;
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
type MatchAnalysisDocument = MatchAnalysis & Document;
type StartupProfileDocument = StartupProfile & Document;
type InvestorProfileDocument = InvestorProfile & Document;

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

        // Get profile view count (using document views as a proxy for now)
        const profileViews = documentViews + Math.floor(Math.random() * 100) + 50; // Placeholder with random data

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
export const getUpcomingTasks = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // For now, return mock data
        // In a real implementation, this would fetch from a tasks database
        const tasks: TaskItem[] = [
            {
                id: '1',
                title: 'Complete profile information',
                dueDate: new Date(),
                priority: 'high',
                completed: false
            },
            {
                id: '2',
                title: 'Upload financial documents',
                dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                priority: 'medium',
                completed: false
            },
            {
                id: '3',
                title: 'Review belief system analysis',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
                priority: 'low',
                completed: false
            }
        ];

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

            return {
                ...task,
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

        // Get profile view count (using document views as a proxy for now)
        const profileViews = documentViews + Math.floor(Math.random() * 100) + 50; // Placeholder with random data

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

        // Combine all activities and sort by date
        const activities: ActivityItem[] = [
            ...documentViewsData.map(view => ({
                id: `view_${view.id}`,
                type: 'profile_view',
                title: role === 'startup' ? 'Investor viewed your profile' : 'Startup viewed your profile',
                entity: view.user.email,
                time: view.viewed_at,
                icon: 'user',
                color: '#3e60e9'
            })),
            ...documentDownloadsData.map(download => ({
                id: `download_${download.id}`,
                type: 'document_download',
                title: role === 'startup' ? 'Investor downloaded your document' : 'Startup downloaded your document',
                entity: download.user.email,
                time: download.downloaded_at,
                icon: 'file-text',
                color: '#10B981'
            })),
            ...matches.slice(0, 5).map(match => ({
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

        // Mock tasks data
        const tasks: TaskItem[] = [
            {
                id: '1',
                title: 'Complete profile information',
                dueDate: new Date(),
                priority: 'high',
                completed: false
            },
            {
                id: '2',
                title: 'Upload financial documents',
                dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                priority: 'medium',
                completed: false
            },
            {
                id: '3',
                title: 'Review belief system analysis',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
                priority: 'low',
                completed: false
            }
        ];

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

            return {
                ...task,
                formattedDueDate
            };
        });

        // Return all dashboard data
        res.json({
            stats: {
                documentCount,
                profileViews,
                documentViews,
                documentDownloads,
                compatibilityScore,
                matchRate
            },
            recentMatches,
            activities: formattedActivity,
            tasks: formattedTasks
        });
    } catch (error) {
        console.error('Error getting all dashboard data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

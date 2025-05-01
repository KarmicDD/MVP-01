import { Request, Response } from 'express';
import { prisma } from '../config/db';

/**
 * Record daily analytics for a user
 * This should be called at the end of the day or when significant events occur
 */
export const recordDailyAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const userId = req.user.userId;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day

        // Get document views for today
        const documentViews = await prisma.documentView.count({
            where: {
                entity_id: userId,
                viewed_at: {
                    gte: today
                }
            }
        });

        // Get document downloads for today
        const documentDownloads = await prisma.documentDownload.count({
            where: {
                entity_id: userId,
                downloaded_at: {
                    gte: today
                }
            }
        });

        // Get profile shares for today
        const profileShares = await prisma.profileShareAnalytics.count({
            where: {
                user_id: userId,
                created_at: {
                    gte: today
                }
            }
        });

        // Upsert daily analytics
        const dailyAnalytics = await prisma.dailyAnalytics.upsert({
            where: {
                user_id_date: {
                    user_id: userId,
                    date: today
                }
            },
            update: {
                document_views: documentViews,
                document_downloads: documentDownloads,
                profile_shares: profileShares,
                updated_at: new Date()
            },
            create: {
                user_id: userId,
                date: today,
                document_views: documentViews,
                document_downloads: documentDownloads,
                profile_shares: profileShares
            }
        });

        res.json(dailyAnalytics);
    } catch (error) {
        console.error('Error recording daily analytics:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Get daily analytics for a user over a period of time
 */
export const getDailyAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const userId = req.user.userId;
        const days = parseInt(req.query.days as string) || 30;
        
        // Calculate start date
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        // Get daily analytics
        const analytics = await prisma.dailyAnalytics.findMany({
            where: {
                user_id: userId,
                date: {
                    gte: startDate
                }
            },
            orderBy: {
                date: 'asc'
            }
        });

        res.json(analytics);
    } catch (error) {
        console.error('Error getting daily analytics:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Calculate percentage changes for analytics metrics
 */
export const getAnalyticsChanges = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const userId = req.user.userId;
        
        // Calculate current period (last 7 days)
        const currentPeriodEnd = new Date();
        currentPeriodEnd.setHours(23, 59, 59, 999);
        
        const currentPeriodStart = new Date();
        currentPeriodStart.setDate(currentPeriodStart.getDate() - 7);
        currentPeriodStart.setHours(0, 0, 0, 0);
        
        // Calculate previous period (7 days before current period)
        const previousPeriodEnd = new Date(currentPeriodStart);
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
        previousPeriodEnd.setHours(23, 59, 59, 999);
        
        const previousPeriodStart = new Date(previousPeriodEnd);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);
        previousPeriodStart.setHours(0, 0, 0, 0);

        // Get current period metrics
        const currentDocumentViews = await prisma.documentView.count({
            where: {
                entity_id: userId,
                viewed_at: {
                    gte: currentPeriodStart,
                    lte: currentPeriodEnd
                }
            }
        });

        const currentDocumentDownloads = await prisma.documentDownload.count({
            where: {
                entity_id: userId,
                downloaded_at: {
                    gte: currentPeriodStart,
                    lte: currentPeriodEnd
                }
            }
        });

        const currentProfileShares = await prisma.profileShareAnalytics.count({
            where: {
                user_id: userId,
                created_at: {
                    gte: currentPeriodStart,
                    lte: currentPeriodEnd
                }
            }
        });

        // Get previous period metrics
        const previousDocumentViews = await prisma.documentView.count({
            where: {
                entity_id: userId,
                viewed_at: {
                    gte: previousPeriodStart,
                    lte: previousPeriodEnd
                }
            }
        });

        const previousDocumentDownloads = await prisma.documentDownload.count({
            where: {
                entity_id: userId,
                downloaded_at: {
                    gte: previousPeriodStart,
                    lte: previousPeriodEnd
                }
            }
        });

        const previousProfileShares = await prisma.profileShareAnalytics.count({
            where: {
                user_id: userId,
                created_at: {
                    gte: previousPeriodStart,
                    lte: previousPeriodEnd
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

        const changes = {
            documentViews: {
                current: currentDocumentViews,
                previous: previousDocumentViews,
                percentageChange: calculatePercentageChange(currentDocumentViews, previousDocumentViews)
            },
            documentDownloads: {
                current: currentDocumentDownloads,
                previous: previousDocumentDownloads,
                percentageChange: calculatePercentageChange(currentDocumentDownloads, previousDocumentDownloads)
            },
            profileShares: {
                current: currentProfileShares,
                previous: previousProfileShares,
                percentageChange: calculatePercentageChange(currentProfileShares, previousProfileShares)
            }
        };

        res.json(changes);
    } catch (error) {
        console.error('Error calculating analytics changes:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

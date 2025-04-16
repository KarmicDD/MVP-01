import { Request, Response } from 'express';
import RecommendationService from '../services/RecommendationService';
import StartupProfileModel from '../models/Profile/StartupProfile';
import InvestorProfileModel from '../models/InvestorModels/InvestorProfile';
import ApiUsageModel from '../models/ApiUsageModel/ApiUsage';

// Maximum API requests per day
const MAX_DAILY_REQUESTS = 10;

/**
 * Check if user has reached their daily API usage limit
 */
async function checkRateLimit(userId: string): Promise<{ underLimit: boolean; usageCount: number; maxRequests: number }> {
    try {
        // Find or create usage record for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let usageRecord = await ApiUsageModel.findOne({
            userId: userId,
            date: {
                $gte: today
            }
        });

        if (!usageRecord) {
            usageRecord = new ApiUsageModel({
                userId: userId,
                date: today,
                compatibilityRequestCount: 0,
                beliefSystemRequestCount: 0,
                financialAnalysisRequestCount: 0,
                recommendationRequestCount: 0
            });
        }

        // Check if user has reached limit
        if (usageRecord.recommendationRequestCount >= MAX_DAILY_REQUESTS) {
            return {
                underLimit: false,
                usageCount: usageRecord.recommendationRequestCount,
                maxRequests: MAX_DAILY_REQUESTS
            }; // Limit reached
        }

        // Update counter and save
        usageRecord.recommendationRequestCount = (usageRecord.recommendationRequestCount || 0) + 1;
        await usageRecord.save();

        return {
            underLimit: true,
            usageCount: usageRecord.recommendationRequestCount,
            maxRequests: MAX_DAILY_REQUESTS
        }; // Under limit
    } catch (error) {
        console.error('Error checking rate limit:', error);
        // If there's an error with rate limiting, allow the request to proceed
        return {
            underLimit: true,
            usageCount: 0,
            maxRequests: MAX_DAILY_REQUESTS
        };
    }
}

/**
 * Generate personalized recommendations for a startup-investor match
 */
export const getMatchRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
        // Check authentication
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Check rate limit
        try {
            const rateLimitResult = await checkRateLimit(userId);

            if (!rateLimitResult.underLimit) {
                res.status(429).json({
                    message: 'Daily request limit reached',
                    limit: MAX_DAILY_REQUESTS,
                    nextReset: 'Tomorrow'
                });
                return;
            }
        } catch (rateLimitError) {
            console.error('Rate limit check error:', rateLimitError);
            // Continue even if rate limiting fails
        }

        const { startupId, investorId } = req.params;

        if (!startupId || !investorId) {
            res.status(400).json({ message: 'Startup ID and Investor ID are required' });
            return;
        }

        // Determine the user perspective based on their role
        let perspective: 'startup' | 'investor';

        // Check if the user is the startup or the investor
        if (userId === startupId) {
            perspective = 'startup';
        } else if (userId === investorId) {
            perspective = 'investor';
        } else {
            // Default perspective if not directly involved
            perspective = 'investor';
        }

        // Verify that both profiles exist
        try {
            const startup = await StartupProfileModel.findOne({ userId: startupId });
            if (!startup) {
                res.status(404).json({ message: 'Startup not found' });
                return;
            }

            const investor = await InvestorProfileModel.findOne({ userId: investorId });
            if (!investor) {
                res.status(404).json({ message: 'Investor not found' });
                return;
            }
        } catch (profileError) {
            console.error('Error fetching profiles:', profileError);
            res.status(500).json({ message: 'Error fetching profiles' });
            return;
        }

        // Generate recommendations
        const recommendations = await RecommendationService.generateRecommendations(
            startupId,
            investorId,
            perspective
        );

        res.json(recommendations);
    } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Generate personalized recommendations for multiple matches
 */
export const getBatchRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
        // Check authentication
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Check rate limit
        try {
            const rateLimitResult = await checkRateLimit(userId);

            if (!rateLimitResult.underLimit) {
                res.status(429).json({
                    message: 'Daily request limit reached',
                    limit: MAX_DAILY_REQUESTS,
                    nextReset: 'Tomorrow'
                });
                return;
            }
        } catch (rateLimitError) {
            console.error('Rate limit check error:', rateLimitError);
            // Continue even if rate limiting fails
        }

        const { matchIds } = req.body;

        if (!matchIds || !Array.isArray(matchIds) || matchIds.length === 0) {
            res.status(400).json({ message: 'Match IDs are required' });
            return;
        }

        // Limit batch size
        const batchSize = Math.min(matchIds.length, 5);
        const batchIds = matchIds.slice(0, batchSize);

        // Determine user role
        let userProfile = null;
        let investorProfile = null;

        try {
            userProfile = await StartupProfileModel.findOne({ userId });
            if (!userProfile) {
                investorProfile = await InvestorProfileModel.findOne({ userId });
            }

            if (!userProfile && !investorProfile) {
                res.status(404).json({ message: 'User profile not found' });
                return;
            }
        } catch (profileError) {
            console.error('Error fetching user profile:', profileError);
            res.status(500).json({ message: 'Error fetching user profile' });
            return;
        }

        const perspective = userProfile ? 'startup' : 'investor';

        // Generate recommendations for each match
        const recommendationsPromises = batchIds.map(async (matchId) => {
            try {
                if (!matchId) {
                    return {
                        matchId: 'unknown',
                        error: 'Invalid match ID'
                    };
                }

                if (perspective === 'startup') {
                    // Verify investor exists
                    const investor = await InvestorProfileModel.findOne({ userId: matchId });
                    if (!investor) {
                        return {
                            matchId,
                            error: 'Investor not found'
                        };
                    }

                    // Ensure req.user exists
                    if (!req.user?.userId) {
                        return {
                            matchId,
                            error: 'User not authenticated'
                        };
                    }

                    return {
                        matchId,
                        recommendations: await RecommendationService.generateRecommendations(
                            req.user.userId,
                            matchId,
                            'startup'
                        )
                    };
                } else {
                    // Verify startup exists
                    const startup = await StartupProfileModel.findOne({ userId: matchId });
                    if (!startup) {
                        return {
                            matchId,
                            error: 'Startup not found'
                        };
                    }

                    // Ensure req.user exists
                    if (!req.user?.userId) {
                        return {
                            matchId,
                            error: 'User not authenticated'
                        };
                    }

                    return {
                        matchId,
                        recommendations: await RecommendationService.generateRecommendations(
                            matchId,
                            req.user.userId,
                            'investor'
                        )
                    };
                }
            } catch (error) {
                console.error(`Error generating recommendations for match ${matchId}:`, error);
                return {
                    matchId,
                    error: 'Failed to generate recommendations'
                };
            }
        });

        const results = await Promise.all(recommendationsPromises);

        res.json({
            results,
            batchSize,
            totalRequested: matchIds.length
        });
    } catch (error) {
        console.error('Error generating batch recommendations:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

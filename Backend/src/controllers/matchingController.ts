import { Request, Response } from 'express';
import { prisma } from '../config/db';
import StartupProfileModel from '../models/Profile/StartupProfile';
import InvestorProfileModel from '../models/InvestorModels/InvestorProfile';
import MLMatchingService from '../services/MLMatchingService';

// Find potential matches for startups
export const findMatchesForStartup = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Get startup details from MongoDB
        const startup = await StartupProfileModel.findOne({ userId: req.user.userId });

        if (!startup) {
            res.status(404).json({ message: 'Startup profile not found' });
            return;
        }

        // Get limit from query params or use default
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

        // Use ML matching service to find matches
        const matches = await MLMatchingService.findMatchesForStartup(req.user.userId, limit);

        // Get user emails from PostgreSQL in a single query
        const investorIds = matches.map(match => match.investorId);
        const userEmails = await prisma.user.findMany({
            where: {
                user_id: { in: investorIds }
            },
            select: {
                user_id: true,
                email: true
            }
        });

        // Create a lookup table for emails
        const emailLookup = userEmails.reduce((acc, user) => {
            acc[user.user_id] = user.email;
            return acc;
        }, {} as Record<string, string>);

        // Add emails to matches
        const matchesWithEmails = matches.map(match => ({
            ...match,
            email: emailLookup[match.investorId] || ''
        }));

        res.json({
            matches: matchesWithEmails,
            usedEnhancedMatching: true
        });
    } catch (error) {
        console.error('Find matches error:', error);

        // Fallback to basic matching if ML matching fails
        try {
            // Check if user is authenticated
            if (!req.user?.userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            // Get startup details from MongoDB
            const startup = await StartupProfileModel.findOne({ userId: req.user.userId });

            // Check if startup exists
            if (!startup) {
                res.status(404).json({ message: 'Startup profile not found' });
                return;
            }

            // Find matching investors in MongoDB
            const matchingInvestors = await InvestorProfileModel.find({
                industriesOfInterest: startup.industry,
                preferredStages: startup.fundingStage
            });

            // Get user emails from PostgreSQL in a single query
            const investorIds = matchingInvestors.map(investor => investor.userId);
            const userEmails = await prisma.user.findMany({
                where: {
                    user_id: { in: investorIds }
                },
                select: {
                    user_id: true,
                    email: true
                }
            });

            // Create a lookup table for emails
            const emailLookup = userEmails.reduce((acc, user) => {
                acc[user.user_id] = user.email;
                return acc;
            }, {} as Record<string, string>);

            // Calculate match score using basic algorithm
            const scoredMatches = matchingInvestors.map(investor => {
                let score = 0;
                if (startup && investor.industriesOfInterest && investor.industriesOfInterest.includes(startup.industry)) {
                    score += 30;
                }
                if (startup && investor.preferredStages && investor.preferredStages.includes(startup.fundingStage)) {
                    score += 30;
                }
                return {
                    investorId: investor.userId,
                    email: emailLookup[investor.userId] || '',
                    matchScore: score,
                    companyName: investor.companyName,
                    industriesOfInterest: investor.industriesOfInterest,
                    preferredStages: investor.preferredStages,
                    ticketSize: investor.ticketSize
                };
            });

            // Sort by match score (highest first)
            const sortedMatches = scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

            res.json({
                matches: sortedMatches,
                usedEnhancedMatching: false
            });
        } catch (fallbackError) {
            console.error('Fallback matching error:', fallbackError);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

// Find potential matches for investors
export const findMatchesForInvestor = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Get investor details from MongoDB
        const investor = await InvestorProfileModel.findOne({ userId: req.user.userId });

        if (!investor) {
            res.status(404).json({ message: 'Investor profile not found' });
            return;
        }

        // Get limit from query params or use default
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

        // Use ML matching service to find matches
        const matches = await MLMatchingService.findMatchesForInvestor(req.user.userId, limit);

        // Get user emails from PostgreSQL in a single query
        const startupIds = matches.map(match => match.startupId);
        const userEmails = await prisma.user.findMany({
            where: {
                user_id: { in: startupIds }
            },
            select: {
                user_id: true,
                email: true
            }
        });

        // Create a lookup table for emails
        const emailLookup = userEmails.reduce((acc, user) => {
            acc[user.user_id] = user.email;
            return acc;
        }, {} as Record<string, string>);

        // Add emails to matches
        const matchesWithEmails = matches.map(match => ({
            ...match,
            email: emailLookup[match.startupId] || ''
        }));

        res.json({
            matches: matchesWithEmails,
            usedEnhancedMatching: true
        });
    } catch (error) {
        console.error('Find matches error:', error);

        // Fallback to basic matching if ML matching fails
        try {
            // Check if user is authenticated
            if (!req.user?.userId) {
                res.status(401).json({ message: 'Unauthorized' });
                return;
            }

            // Get investor details from MongoDB
            const investor = await InvestorProfileModel.findOne({ userId: req.user.userId });

            // Check if investor exists
            if (!investor) {
                res.status(404).json({ message: 'Investor profile not found' });
                return;
            }

            // Find matching startups in MongoDB
            const matchingStartups = await StartupProfileModel.find({
                $or: [
                    { industry: { $in: investor.industriesOfInterest || [] } },
                    { fundingStage: { $in: investor.preferredStages || [] } }
                ]
            });

            // Get user emails from PostgreSQL in a single query
            const startupIds = matchingStartups.map(startup => startup.userId);
            const userEmails = await prisma.user.findMany({
                where: {
                    user_id: { in: startupIds }
                },
                select: {
                    user_id: true,
                    email: true
                }
            });

            // Create a lookup table for emails
            const emailLookup = userEmails.reduce((acc, user) => {
                acc[user.user_id] = user.email;
                return acc;
            }, {} as Record<string, string>);

            // Calculate match score using basic algorithm
            const scoredMatches = matchingStartups.map(startup => {
                let score = 0;
                if (investor && investor.industriesOfInterest && startup.industry &&
                    investor.industriesOfInterest.includes(startup.industry)) {
                    score += 30;
                }
                if (investor && investor.preferredStages && startup.fundingStage &&
                    investor.preferredStages.includes(startup.fundingStage)) {
                    score += 30;
                }
                return {
                    startupId: startup.userId,
                    companyName: startup.companyName,
                    email: emailLookup[startup.userId] || '',
                    matchScore: score,
                    industry: startup.industry,
                    fundingStage: startup.fundingStage,
                    location: startup.location
                };
            });

            // Sort by match score (highest first)
            const sortedMatches = scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

            res.json({
                matches: sortedMatches,
                usedEnhancedMatching: false
            });
        } catch (fallbackError) {
            console.error('Fallback matching error:', fallbackError);
            res.status(500).json({ message: 'Server error' });
        }
    }
};
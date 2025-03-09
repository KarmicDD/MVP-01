import { Request, Response } from 'express';
import { prisma } from '../config/db';
import StartupProfileModel from '../models/Profile/StartupProfile';
import InvestorProfileModel from '../models/InvestorModels/InvestorProfile';

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

        // Calculate match score for each investor
        const scoredMatches = matchingInvestors.map(investor => {
            let score = 0;

            // Score based on industry match
            if (investor.industriesOfInterest.includes(startup.industry)) {
                score += 30;
            }

            // Score based on funding stage match
            if (investor.preferredStages.includes(startup.fundingStage)) {
                score += 30;
            }

            // Additional scoring logic can be added here

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

        res.json({ matches: sortedMatches });
    } catch (error) {
        console.error('Find matches error:', error);
        res.status(500).json({ message: 'Server error' });
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

        // Find matching startups in MongoDB
        const matchingStartups = await StartupProfileModel.find({
            $or: [
                { industry: { $in: investor.industriesOfInterest } },
                { fundingStage: { $in: investor.preferredStages } }
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

        // Calculate match score for each startup
        const scoredMatches = matchingStartups.map(startup => {
            let score = 0;

            // Score based on industry match
            if (investor.industriesOfInterest.includes(startup.industry)) {
                score += 30;
            }

            // Score based on funding stage match
            if (investor.preferredStages.includes(startup.fundingStage)) {
                score += 30;
            }

            // Additional scoring logic can be added here

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

        res.json({ matches: sortedMatches });
    } catch (error) {
        console.error('Find matches error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
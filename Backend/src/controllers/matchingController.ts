// controllers/matchingController.ts
import { Request, Response } from 'express';
import { prisma } from '../config/db';

// Find potential matches for startups
export const findMatchesForStartup = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Get startup details
        const startup = await prisma.startup.findUnique({
            where: {
                user_id: req.user.userId,
            },
        });

        if (!startup) {
            res.status(404).json({ message: 'Startup profile not found' });
            return;
        }

        // Find matching investors based on criteria
        const matchingInvestors = await prisma.investor.findMany({
            where: {
                industries_of_interest: {
                    has: startup.industry,
                },
                preferred_stages: {
                    has: startup.funding_stage,
                },
            },
            include: {
                user: {
                    select: {
                        email: true,
                    },
                },
            },
        });

        // Calculate match score for each investor
        const scoredMatches = matchingInvestors.map(investor => {
            let score = 0;

            // Score based on industry match
            if (investor.industries_of_interest.includes(startup.industry)) {
                score += 30;
            }

            // Score based on funding stage match
            if (investor.preferred_stages.includes(startup.funding_stage)) {
                score += 30;
            }

            // Additional scoring logic can be added here

            return {
                investorId: investor.user_id,
                email: investor.user.email,
                matchScore: score,
                industriesOfInterest: investor.industries_of_interest,
                preferredStages: investor.preferred_stages,
                ticketSize: investor.ticket_size,
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

        // Get investor details
        const investor = await prisma.investor.findUnique({
            where: {
                user_id: req.user.userId,
            },
        });

        if (!investor) {
            res.status(404).json({ message: 'Investor profile not found' });
            return;
        }

        // Find matching startups based on criteria
        const matchingStartups = await prisma.startup.findMany({
            where: {
                industry: {
                    in: investor.industries_of_interest,
                },
                funding_stage: {
                    in: investor.preferred_stages,
                },
            },
            include: {
                user: {
                    select: {
                        email: true,
                    },
                },
            },
        });

        // Calculate match score for each startup
        const scoredMatches = matchingStartups.map(startup => {
            let score = 0;

            // Score based on industry match
            if (investor.industries_of_interest.includes(startup.industry)) {
                score += 30;
            }

            // Score based on funding stage match
            if (investor.preferred_stages.includes(startup.funding_stage)) {
                score += 30;
            }

            // Additional scoring logic can be added here

            return {
                startupId: startup.user_id,
                companyName: startup.company_name,
                email: startup.user.email,
                matchScore: score,
                industry: startup.industry,
                fundingStage: startup.funding_stage,
                location: startup.location,
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
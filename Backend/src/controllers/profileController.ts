// controllers/profileController.ts
import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { StartupProfile } from '../models/Profile/StartupProfile';
import { InvestorProfile } from '../models/mongoDB/InvestorProfile';

// Get user type (for initial form display)
export const getUserType = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: {
                user_id: req.user.userId,
            },
            select: {
                user_id: true,
                email: true,
                role: true,
            },
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json({
            userId: user.user_id,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.error('Get user type error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create or update startup profile
export const createUpdateStartupProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { companyName, industry, fundingStage, employeeCount, location, pitch } = req.body;

        // Validate required fields
        if (!companyName || !industry || !fundingStage) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        // Store in PostgreSQL via Prisma
        const startup = await prisma.startup.upsert({
            where: {
                user_id: req.user.userId,
            },
            update: {
                company_name: companyName,
                industry,
                funding_stage: fundingStage,
                employee_count: employeeCount,
                location,
                pitch,
            },
            create: {
                user_id: req.user.userId,
                company_name: companyName,
                industry,
                funding_stage: fundingStage,
                employee_count: employeeCount,
                location,
                pitch,
            },
        });

        // Store in MongoDB for more flexible querying and analysis
        await StartupProfile.findOneAndUpdate(
            { userId: req.user.userId },
            {
                companyName,
                industry,
                fundingStage,
                employeeCount,
                location,
                pitch,
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        res.status(200).json({
            message: 'Startup profile saved successfully',
            profile: startup
        });
    } catch (error) {
        console.error('Create/update startup profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create or update investor profile
export const createUpdateInvestorProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const {
            industriesOfInterest,
            preferredStages,
            ticketSize,
            investmentCriteria,
            pastInvestments
        } = req.body;

        // Validate required fields
        if (!industriesOfInterest?.length || !preferredStages?.length) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        // Store in PostgreSQL via Prisma
        const investor = await prisma.investor.upsert({
            where: {
                user_id: req.user.userId,
            },
            update: {
                industries_of_interest: industriesOfInterest,
                preferred_stages: preferredStages,
                ticket_size: ticketSize,
                investment_criteria: investmentCriteria || [],
                past_investments: pastInvestments,
            },
            create: {
                user_id: req.user.userId,
                industries_of_interest: industriesOfInterest,
                preferred_stages: preferredStages,
                ticket_size: ticketSize,
                investment_criteria: investmentCriteria || [],
                past_investments: pastInvestments,
            },
        });

        // Store in MongoDB for more flexible querying and analysis
        await InvestorProfile.findOneAndUpdate(
            { userId: req.user.userId },
            {
                industriesOfInterest,
                preferredStages,
                ticketSize,
                investmentCriteria: investmentCriteria || [],
                pastInvestments,
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        res.status(200).json({
            message: 'Investor profile saved successfully',
            profile: investor
        });
    } catch (error) {
        console.error('Create/update investor profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get startup profile
export const getStartupProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const profile = await prisma.startup.findUnique({
            where: {
                user_id: req.user.userId,
            },
        });

        if (!profile) {
            res.status(404).json({ message: 'Profile not found' });
            return;
        }

        res.json({ profile });
    } catch (error) {
        console.error('Get startup profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get investor profile
export const getInvestorProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const profile = await prisma.investor.findUnique({
            where: {
                user_id: req.user.userId,
            },
        });

        if (!profile) {
            res.status(404).json({ message: 'Profile not found' });
            return;
        }

        res.json({ profile });
    } catch (error) {
        console.error('Get investor profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
import { Request, Response } from 'express';
import { prisma } from '../config/db';
import StartupProfileModel from '../models/Profile/StartupProfile';
import InvestorProfileModel from '../models/InvestorModels/InvestorProfile';
import ExtendedProfileModel from '../models/Profile/ExtendedProfile';

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

        // Update user role in PostgreSQL if needed
        await prisma.user.update({
            where: { user_id: req.user.userId },
            data: {
                role: 'startup',
                updated_at: new Date()
            }
        });

        // Store profile in MongoDB
        const profile = await StartupProfileModel.findOneAndUpdate(
            { userId: req.user.userId },
            {
                userId: req.user.userId,
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
            profile
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
            companyName,
            industriesOfInterest,
            preferredStages,
            ticketSize,
            investmentCriteria,
            pastInvestments
        } = req.body;

        // Validate required fields
        if (!companyName || !industriesOfInterest?.length || !preferredStages?.length) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        // Update user role in PostgreSQL if needed
        await prisma.user.update({
            where: { user_id: req.user.userId },
            data: {
                role: 'investor',
                updated_at: new Date()
            }
        });

        // Store profile in MongoDB
        const profile = await InvestorProfileModel.findOneAndUpdate(
            { userId: req.user.userId },
            {
                userId: req.user.userId,
                companyName,
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
            profile
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

        const profile = await StartupProfileModel.findOne({ userId: req.user.userId });

        if (!profile) {
            res.status(404).json({ message: 'Profile not found' });
            return;
        }

        // Get extended profile data if it exists
        const extendedProfile = await ExtendedProfileModel.findOne({ userId: req.user.userId });

        res.json({
            profile,
            extendedProfile: extendedProfile || null
        });
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

        const profile = await InvestorProfileModel.findOne({ userId: req.user.userId });

        if (!profile) {
            res.status(404).json({ message: 'Profile not found' });
            return;
        }

        // Get extended profile data if it exists
        const extendedProfile = await ExtendedProfileModel.findOne({ userId: req.user.userId });

        res.json({
            profile,
            extendedProfile: extendedProfile || null
        });
    } catch (error) {
        console.error('Get investor profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create or update extended profile
export const updateExtendedProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const {
            avatarUrl,
            socialLinks,
            teamMembers,
            investmentHistory
        } = req.body;

        // Store extended profile in MongoDB
        const extendedProfile = await ExtendedProfileModel.findOneAndUpdate(
            { userId: req.user.userId },
            {
                userId: req.user.userId,
                avatarUrl: avatarUrl || '',
                socialLinks: socialLinks || [],
                teamMembers: teamMembers || [],
                investmentHistory: investmentHistory || [],
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        res.status(200).json({
            message: 'Extended profile saved successfully',
            extendedProfile
        });
    } catch (error) {
        console.error('Update extended profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
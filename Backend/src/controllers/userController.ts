import { Request, Response } from 'express';
import { prisma } from '../config/db';
import FormSubmission from '../models/mongoDB/FormSubmission';

// Get user profile
const getUserProfile = async (req: Request, res: Response): Promise<void> => {
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
                created_at: true,
            },
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json({ user });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get startup dashboard data
const getStartupDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Get startup data from Prisma
        const startup = await prisma.user.findUnique({
            where: {
                user_id: req.user.userId,
            },
        });

        if (!startup || startup.role !== 'startup') {
            res.status(404).json({ message: 'Startup not found or invalid role' });
            return;
        }

        // Get form submissions from MongoDB
        const formSubmissions = await FormSubmission.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            user: startup,
            recentSubmissions: formSubmissions
        });
    } catch (error) {
        console.error('Get startup dashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get investor dashboard data
const getInvestorDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Get investor data from Prisma
        const investor = await prisma.user.findUnique({
            where: {
                user_id: req.user.userId,
            },
        });

        if (!investor || investor.role !== 'investor') {
            res.status(404).json({ message: 'Investor not found or invalid role' });
            return;
        }

        res.json({
            user: investor
        });
    } catch (error) {
        console.error('Get investor dashboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export { getUserProfile, getStartupDashboard, getInvestorDashboard };
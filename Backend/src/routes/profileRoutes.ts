// routes/profileRoutes.ts
import express from 'express';
import {
    getUserType,
    createUpdateStartupProfile,
    createUpdateInvestorProfile,
    getStartupProfile,
    getInvestorProfile
} from '../controllers/profileController';
import { authenticateJWT, authorizeRole } from '../middleware/auth';
import { StartupProfile } from '../models/Profile/StartupProfile';
import { InvestorProfile } from '../models/mongoDB/InvestorProfile';
import { prisma } from '../config/db';

const router = express.Router();

// Get user type for form display
router.get('/user-type', authenticateJWT, getUserType);

// Startup profile routes
router.post(
    '/startup',
    authenticateJWT,
    authorizeRole(['startup']),
    createUpdateStartupProfile
);

router.get(
    '/startup',
    authenticateJWT,
    authorizeRole(['startup']),
    getStartupProfile
);

// Investor profile routes
router.post(
    '/investor',
    authenticateJWT,
    authorizeRole(['investor']),
    createUpdateInvestorProfile
);

router.get(
    '/investor',
    authenticateJWT,
    authorizeRole(['investor']),
    getInvestorProfile
);

router.get('/check-profile', authenticateJWT, async (req, res): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const userId = req.user.userId;
        let profileComplete = false;

        // Get user details including role
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

        if (user?.role === 'startup') {
            // Check if startup profile exists and is complete
            const startupProfile = await StartupProfile.findOne({ userId });
            profileComplete = !!startupProfile &&
                !!startupProfile.companyName &&
                !!startupProfile.industry &&
                !!startupProfile.fundingStage;
        } else if (user?.role === 'investor') {
            // Check if investor profile exists and is complete
            const investorProfile = await InvestorProfile.findOne({ userId });
            profileComplete = !!investorProfile &&
                investorProfile.industriesOfInterest.length > 0 &&
                investorProfile.preferredStages.length > 0;
        }

        res.json({ profileComplete });
        return;
    } catch (error) {
        console.error('Error checking profile:', error);
        res.status(500).json({ message: 'Server error checking profile' });
        return;
    }
});

export default router;
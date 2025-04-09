// routes/profileRoutes.ts
import express from 'express';
import {
    getUserType,
    createUpdateStartupProfile,
    createUpdateInvestorProfile,
    getStartupProfile,
    getInvestorProfile,
    updateExtendedProfile,
    generateShareableLink,
    shareProfileViaEmail,
    getSharedProfile,
    uploadDocument,
    getUserDocuments,
    deleteDocument,
    downloadDocument,
    updateDocumentMetadata
} from '../controllers/profileController';
import { authenticateJWT, authorizeRole } from '../middleware/auth';
import StartupProfileModel, { StartupProfile } from '../models/Profile/StartupProfile';
import InvestorProfileModel, { InvestorProfile } from '../models/InvestorModels/InvestorProfile';
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

// Extended profile route - works for both startup and investor
router.post(
    '/extended',
    authenticateJWT,
    updateExtendedProfile
);

// Profile sharing routes
router.post(
    '/share/generate-link',
    authenticateJWT,
    generateShareableLink
);

router.post(
    '/share/email',
    authenticateJWT,
    shareProfileViaEmail
);

router.get(
    '/shared/:shareToken',
    getSharedProfile
);

// Document routes
router.post(
    '/documents/upload',
    authenticateJWT,
    uploadDocument
);

router.get(
    '/documents',
    authenticateJWT,
    getUserDocuments
);

router.delete(
    '/documents/:documentId',
    authenticateJWT,
    deleteDocument
);

router.get(
    '/documents/:documentId/download',
    downloadDocument
);

router.put(
    '/documents/:documentId',
    authenticateJWT,
    updateDocumentMetadata
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
            const startupProfile = await StartupProfileModel.findOne({ userId });
            profileComplete = !!startupProfile &&
                !!startupProfile.companyName &&
                !!startupProfile.industry &&
                !!startupProfile.fundingStage;
        } else if (user?.role === 'investor') {
            // Check if investor profile exists and is complete
            const investorProfile = await InvestorProfileModel.findOne({ userId });
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
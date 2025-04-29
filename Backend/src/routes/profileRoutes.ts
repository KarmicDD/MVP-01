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
    updateDocumentMetadata,
    getDocumentById
} from '../controllers/profileController';
import { authenticateJWT, authorizeRole } from '../middleware/auth';
import StartupProfileModel, { StartupProfile } from '../models/Profile/StartupProfile';
import InvestorProfileModel, { InvestorProfile } from '../models/InvestorModels/InvestorProfile';
import { prisma } from '../config/db';

const router = express.Router();

/**
 * @swagger
 * /profile/user-type:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Get user type
 *     description: Get the user type (role) for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User type retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userType:
 *                   type: string
 *                   enum: [startup, investor]
 *                   description: User's role in the system
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.get('/user-type', authenticateJWT, getUserType);

/**
 * @swagger
 * /profile/startup:
 *   post:
 *     tags:
 *       - Profile
 *     summary: Create or update startup profile
 *     description: Create or update a startup profile for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *                 description: Name of the startup
 *               industry:
 *                 type: string
 *                 description: Industry the startup operates in
 *               fundingStage:
 *                 type: string
 *                 enum: [pre-seed, seed, series-a, series-b, series-c, growth]
 *                 description: Current funding stage of the startup
 *               employeeCount:
 *                 type: string
 *                 enum: [1-10, 11-50, 51-200, 201-500, 501+]
 *                 description: Number of employees
 *               location:
 *                 type: string
 *                 description: Location of the startup
 *               pitch:
 *                 type: string
 *                 description: Brief pitch of the startup
 *             required:
 *               - companyName
 *               - industry
 *               - fundingStage
 *     responses:
 *       '200':
 *         description: Profile created or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Startup profile saved successfully
 *                 profile:
 *                   $ref: '#/components/schemas/StartupProfile'
 *       '400':
 *         description: Invalid input
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden - Not a startup user
 *       '500':
 *         description: Server error
 */
router.post(
    '/startup',
    authenticateJWT,
    authorizeRole(['startup']),
    createUpdateStartupProfile
);

/**
 * @swagger
 * /profile/startup:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Get startup profile
 *     description: Retrieve the startup profile for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   $ref: '#/components/schemas/StartupProfile'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden - Not a startup user
 *       '404':
 *         description: Profile not found
 *       '500':
 *         description: Server error
 */
router.get(
    '/startup',
    authenticateJWT,
    authorizeRole(['startup']),
    getStartupProfile
);

/**
 * @swagger
 * /profile/investor:
 *   post:
 *     tags:
 *       - Profile
 *     summary: Create or update investor profile
 *     description: Create or update an investor profile for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *                 description: Name of the investment firm
 *               industriesOfInterest:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Industries the investor is interested in
 *               preferredStages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [pre-seed, seed, series-a, series-b, series-c, growth]
 *                 description: Funding stages the investor is interested in
 *               ticketSize:
 *                 type: string
 *                 enum: [0-10L, 10L-50L, 50L-1Cr, 1Cr-10Cr, 10Cr+]
 *                 description: Investment ticket size range in Indian currency
 *               investmentCriteria:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Investment criteria and preferences
 *               pastInvestments:
 *                 type: string
 *                 description: Description of past investments
 *             required:
 *               - companyName
 *               - industriesOfInterest
 *               - preferredStages
 *     responses:
 *       '200':
 *         description: Profile created or updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Investor profile saved successfully
 *                 profile:
 *                   $ref: '#/components/schemas/InvestorProfile'
 *       '400':
 *         description: Invalid input
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden - Not an investor user
 *       '500':
 *         description: Server error
 */
router.post(
    '/investor',
    authenticateJWT,
    authorizeRole(['investor']),
    createUpdateInvestorProfile
);

/**
 * @swagger
 * /profile/investor:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Get investor profile
 *     description: Retrieve the investor profile for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   $ref: '#/components/schemas/InvestorProfile'
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden - Not an investor user
 *       '404':
 *         description: Profile not found
 *       '500':
 *         description: Server error
 */
router.get(
    '/investor',
    authenticateJWT,
    authorizeRole(['investor']),
    getInvestorProfile
);



/**
 * @swagger
 * /profile/extended:
 *   post:
 *     tags:
 *       - Profile
 *     summary: Update extended profile
 *     description: Update extended profile information for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL to the user's avatar image
 *               socialLinks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     platform:
 *                       type: string
 *                       description: Social media platform name
 *                     url:
 *                       type: string
 *                       format: uri
 *                       description: URL to the social media profile
 *                 description: Social media links
 *               teamMembers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Team member's name
 *                     role:
 *                       type: string
 *                       description: Team member's role
 *                     bio:
 *                       type: string
 *                       description: Team member's biography
 *                 description: Team members information
 *               investmentHistory:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     companyName:
 *                       type: string
 *                       description: Name of the company invested in
 *                     amount:
 *                       type: string
 *                       description: Investment amount
 *                     date:
 *                       type: string
 *                       description: Investment date
 *                     stage:
 *                       type: string
 *                       description: Funding stage at time of investment
 *                     outcome:
 *                       type: string
 *                       description: Investment outcome
 *                 description: Investment history for investors
 *     responses:
 *       '200':
 *         description: Extended profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Extended profile updated successfully
 *                 profile:
 *                   $ref: '#/components/schemas/ExtendedProfile'
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: Server error
 */
router.post(
    '/extended',
    authenticateJWT,
    updateExtendedProfile
);

/**
 * @swagger
 * /profile/share/generate-link:
 *   post:
 *     tags:
 *       - Profile
 *     summary: Generate shareable profile link
 *     description: Generate a shareable link for the user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Shareable link generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Shareable link generated successfully
 *                 shareableUrl:
 *                   type: string
 *                   format: uri
 *                   example: https://mvp-01.onrender.com/api/profile/shared/abc123
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Profile not found
 *       '500':
 *         description: Server error
 */
router.post(
    '/share/generate-link',
    authenticateJWT,
    generateShareableLink
);

/**
 * @swagger
 * /profile/share/email:
 *   post:
 *     tags:
 *       - Profile
 *     summary: Share profile via email
 *     description: Share the user's profile via email with specified recipients
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emails:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *                 description: List of recipient email addresses
 *               message:
 *                 type: string
 *                 description: Optional personal message to include
 *             required:
 *               - emails
 *     responses:
 *       '200':
 *         description: Profile shared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile shared successfully
 *                 shareableUrl:
 *                   type: string
 *                   format: uri
 *                 recipientCount:
 *                   type: integer
 *       '400':
 *         description: Invalid input
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Profile not found
 *       '500':
 *         description: Server error
 */
router.post(
    '/share/email',
    authenticateJWT,
    shareProfileViaEmail
);

/**
 * @swagger
 * /profile/shared/{shareToken}:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Get shared profile
 *     description: Retrieve a profile using a shareable token
 *     parameters:
 *       - name: shareToken
 *         in: path
 *         description: Shareable token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Shared profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/StartupProfile'
 *                     - $ref: '#/components/schemas/InvestorProfile'
 *                 userType:
 *                   type: string
 *                   enum: [startup, investor]
 *                 extendedProfile:
 *                   $ref: '#/components/schemas/ExtendedProfile'
 *       '404':
 *         description: Shared profile not found or expired
 *       '500':
 *         description: Server error
 */
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
    '/documents/:documentId',
    authenticateJWT,
    getDocumentById
);

router.get(
    '/documents/:documentId/download',
    authenticateJWT,
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
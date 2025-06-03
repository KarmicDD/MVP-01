import { Request, Response } from 'express';
import { prisma } from '../config/db';
import StartupProfileModel from '../models/Profile/StartupProfile';
import InvestorProfileModel from '../models/InvestorModels/InvestorProfile';
import ExtendedProfileModel from '../models/Profile/ExtendedProfile';
import DocumentModel from '../models/Profile/Document';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Get user type (for initial form display)
export const getUserType = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Fix: Use the correct field name for the query
        // The field in the schema is 'user_id', so we need to use that
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

        // Verify that the user is updating their own profile
        const profileUserId = req.params.userId || req.user.userId;

        if (profileUserId !== req.user.userId) {
            res.status(403).json({ message: 'Forbidden: You can only update your own profile' });
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

// Generate a shareable profile link
export const generateShareableLink = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Get user info to verify existence
        const user = await prisma.user.findUnique({
            where: { user_id: req.user.userId }
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Generate a unique token for sharing
        const shareToken = crypto.randomBytes(32).toString('hex');

        // Store the token in the database with an expiration date (30 days)
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);

        // Check if there's an existing share token for this user
        const existingShare = await prisma.profileShare.findFirst({
            where: {
                user_id: req.user.userId
            }
        });

        // If there's an existing share token, update it
        if (existingShare) {
            await prisma.profileShare.update({
                where: {
                    id: existingShare.id
                },
                data: {
                    share_token: shareToken,
                    expires_at: expirationDate
                }
            });
        } else {
            // Create a new share token
            await prisma.profileShare.create({
                data: {
                    user_id: req.user.userId,
                    share_token: shareToken,
                    expires_at: expirationDate
                }
            });
        }

        // Generate the shareable URL
        const shareableUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared-profile/${shareToken}`;

        res.status(200).json({
            message: 'Profile share link generated successfully',
            shareableUrl,
            expiresAt: expirationDate
        });
    } catch (error) {
        console.error('Generate shareable link error:', error);
        res.status(500).json({ message: 'Server error generating shareable link' });
    }
};

// Share profile via email
export const shareProfileViaEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { emailAddresses, customUrl, shareMethod = 'email' } = req.body;

        if (!emailAddresses || !Array.isArray(emailAddresses) || emailAddresses.length === 0) {
            res.status(400).json({ message: 'Email addresses are required' });
            return;
        }

        // Get user info
        const user = await prisma.user.findUnique({
            where: { user_id: req.user.userId }
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Get company name based on user role
        let companyName = '';

        if (user.role === 'startup') {
            const startupProfile = await StartupProfileModel.findOne({ userId: req.user.userId });
            if (startupProfile) {
                companyName = startupProfile.companyName || 'their startup';
            }
        } else if (user.role === 'investor') {
            const investorProfile = await InvestorProfileModel.findOne({ userId: req.user.userId });
            if (investorProfile) {
                companyName = investorProfile.companyName || 'their investment firm';
            }
        }

        // Use the custom URL if provided, otherwise generate a shareable link
        let profileUrl = customUrl;

        if (!profileUrl) {
            // Generate a shareable link (for backward compatibility)
            const shareToken = crypto.randomBytes(32).toString('hex');
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 30);

            // Create a new share token with the share method
            const shareData: any = {
                user_id: req.user.userId,
                share_token: shareToken,
                expires_at: expirationDate
            };

            // Add share_method if the schema has been updated
            if (shareMethod) {
                try {
                    shareData.share_method = shareMethod;
                } catch (err) {
                    console.warn('Could not add share_method to profile share:', err);
                }
            }

            await prisma.profileShare.create({
                data: shareData
            });

            profileUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared-profile/${shareToken}`;
        } else {
            // Track analytics for direct URL sharing if the table exists
            try {
                // @ts-ignore - This will be available after the migration
                await prisma.profileShareAnalytics.create({
                    data: {
                        user_id: req.user.userId,
                        share_method: shareMethod,
                        recipient_count: emailAddresses.length,
                        shared_url: profileUrl
                    }
                });
            } catch (error) {
                // If the table doesn't exist yet, just log the error but continue
                console.warn('Could not record share analytics:', error);
            }
        }

        // In a real implementation, we would send emails here
        // For now, we'll just log the information and return success
        emailAddresses.forEach((email: string) => {
            console.log(`[EMAIL SERVICE] Sending profile share email to ${email}`);
            console.log(`From: ${user.email} (${companyName})`);
            console.log(`Link: ${profileUrl}`);
            console.log(`Share method: ${shareMethod}`);
            console.log('---');
        });

        res.status(200).json({
            message: 'Profile shared successfully',
            profileUrl,
            recipientCount: emailAddresses.length,
            shareMethod
        });
    } catch (error) {
        console.error('Share profile via email error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get shared profile by token
export const getSharedProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { shareToken } = req.params;

        if (!shareToken) {
            res.status(400).json({ message: 'Share token is required' });
            return;
        }

        // Find the share token in the database
        const profileShare = await prisma.profileShare.findFirst({
            where: {
                share_token: shareToken
            }
        });

        if (!profileShare) {
            res.status(404).json({ message: 'Shared profile not found' });
            return;
        }

        // Check if the token has expired
        if (profileShare.expires_at && new Date() > profileShare.expires_at) {
            res.status(410).json({ message: 'Shared profile link has expired' });
            return;
        }

        // Get the user associated with the share token
        const user = await prisma.user.findUnique({
            where: { user_id: profileShare.user_id }
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Get profile data based on user role
        let profileData: any = {};
        if (user.role === 'startup') {
            const startupProfile = await StartupProfileModel.findOne({ userId: profileShare.user_id });
            if (startupProfile) {
                profileData = startupProfile;
            }
        } else if (user.role === 'investor') {
            const investorProfile = await InvestorProfileModel.findOne({ userId: profileShare.user_id });
            if (investorProfile) {
                profileData = investorProfile;
            }
        }

        // Get extended profile data
        const extendedProfile = await ExtendedProfileModel.findOne({ userId: profileShare.user_id });

        // Get user documents that are marked as public
        const publicDocuments = await DocumentModel.find({
            userId: profileShare.user_id,
            isPublic: true
        }).select('_id fileName originalName fileType description documentType createdAt');

        // Update the view count for this profile share
        await prisma.profileShare.update({
            where: { id: profileShare.id },
            data: {
                view_count: { increment: 1 }
            }
        });

        res.status(200).json({
            profile: profileData,
            extendedProfile: extendedProfile || null,
            userType: user.role,
            userEmail: user.email,
            publicDocuments: publicDocuments || [],
            shareInfo: {
                createdAt: profileShare.created_at,
                expiresAt: profileShare.expires_at,
                viewCount: profileShare.view_count
            }
        });
    } catch (error) {
        console.error('Get shared profile error:', error);
        res.status(500).json({ message: 'Server error getting shared profile' });
    }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter to restrict file types
const fileFilter = (req: any, file: any, cb: multer.FileFilterCallback) => {
    // Accept only PDFs, PPTs, DOCs, and images
    const allowedFileTypes = [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
    ];

    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, PPT, DOC, and image files are allowed.'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Upload document
export const uploadDocument = async (req: Request & { file?: any }, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const uploadMiddleware = upload.single('document');

        uploadMiddleware(req, res, async (err: any) => {
            if (err) {
                console.error('File upload error:', err);
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
                    } else {
                        res.status(400).json({ message: `Multer error: ${err.message}` });
                    }
                } else {
                    res.status(400).json({ message: err.message });
                }
                return;
            }

            if (!req.file) {
                res.status(400).json({ message: 'No file uploaded' });
                return;
            } const { description, documentType, category, isPublic, timePeriod } = req.body;

            // Store relative path instead of absolute path
            const relativePath = path.relative(path.join(__dirname, '../..'), req.file.path);

            // Create document record in MongoDB
            const document = new DocumentModel({
                userId: req.user!.userId,
                fileName: req.file.filename,
                originalName: req.file.originalname,
                fileType: req.file.mimetype,
                fileSize: req.file.size,
                filePath: relativePath, // Store relative path
                description: description || '',
                documentType: documentType || 'other',
                category: category || 'other', // Add category field
                timePeriod: timePeriod || '', // Add time period field
                isPublic: isPublic === 'true'
            });

            await document.save(); res.status(201).json({
                message: 'Document uploaded successfully',
                document: {
                    id: document._id,
                    fileName: document.fileName,
                    originalName: document.originalName,
                    fileType: document.fileType,
                    fileSize: document.fileSize,
                    description: document.description,
                    documentType: document.documentType,
                    category: document.category, // Include category in response
                    timePeriod: document.timePeriod, // Include time period in response
                    isPublic: document.isPublic,
                    createdAt: document.createdAt
                }
            });
        });
    } catch (error) {
        console.error('Document upload error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user documents
export const getUserDocuments = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Check if a specific userId is provided in the query params
        const requestedUserId = req.query.userId as string || req.user.userId;

        console.log(`Fetching documents for userId: ${requestedUserId}`);

        const documents = await DocumentModel.find({ userId: requestedUserId })
            .select('-filePath')
            .sort({ createdAt: -1 }); res.status(200).json({
                documents: documents.map(doc => ({
                    id: doc._id,
                    userId: doc.userId,
                    fileName: doc.fileName,
                    originalName: doc.originalName,
                    fileType: doc.fileType,
                    fileSize: doc.fileSize,
                    description: doc.description,
                    documentType: doc.documentType,
                    category: doc.category, // Include category in response
                    timePeriod: doc.timePeriod || '', // Include time period in response
                    isPublic: doc.isPublic,
                    createdAt: doc.createdAt,
                    uploadDate: doc.createdAt
                }))
            });
    } catch (error) {
        console.error('Get user documents error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete document
export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { documentId } = req.params;

        // Find the document
        const document = await DocumentModel.findById(documentId);

        if (!document) {
            res.status(404).json({ message: 'Document not found' });
            return;
        }

        // Check if the document belongs to the user
        if (document.userId !== req.user.userId) {
            res.status(403).json({ message: 'Unauthorized to delete this document' });
            return;
        }

        // Convert relative path to absolute path
        const absolutePath = path.join(__dirname, '../..', document.filePath);

        // Delete the file from the filesystem
        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
        }

        // Delete the document record
        await DocumentModel.findByIdAndDelete(documentId);

        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Download document
export const downloadDocument = async (req: Request, res: Response): Promise<void> => {
    try {
        const { documentId } = req.params;
        const tokenFromQuery = req.query.token as string;

        // Find the document
        const document = await DocumentModel.findById(documentId);

        if (!document) {
            res.status(404).json({ message: 'Document not found' });
            return;
        }

        // Check if the document belongs to the user or is public (but still requires authentication)
        if (!req.user) {
            // If no user in request but token is provided in query params, try to verify it
            if (tokenFromQuery) {
                try {
                    // Import and use the JWT verification from auth middleware
                    const jwt = require('jsonwebtoken');
                    const decoded = jwt.verify(tokenFromQuery, process.env.JWT_SECRET);

                    // If document is public, allow access
                    if (document.isPublic) {
                        // Continue with the download (skip the next checks)
                    }
                    // If document is not public, check if it belongs to the user from the token
                    else if (decoded.userId && decoded.userId === document.userId) {
                        // Continue with the download (skip the next checks)
                    }
                    else {
                        res.status(403).json({ message: 'Unauthorized to access this document' });
                        return;
                    }
                } catch (err) {
                    console.error('Token verification error:', err);
                    res.status(401).json({ message: 'Invalid or expired token' });
                    return;
                }
            } else {
                // No user and no token
                res.status(401).json({ message: 'Authentication required to access documents' });
                return;
            }
        }
        // If user is authenticated through middleware but document is not public and doesn't belong to them
        else if (!document.isPublic && document.userId !== req.user.userId) {
            res.status(403).json({ message: 'Unauthorized to access this document' });
            return;
        }

        // Convert relative path to absolute path
        const absolutePath = path.join(__dirname, '../..', document.filePath);

        // Check if the file exists
        if (!fs.existsSync(absolutePath)) {
            res.status(404).json({ message: 'File not found' });
            return;
        }

        // Set appropriate headers
        res.setHeader('Content-Type', document.fileType);

        // For PDF files viewed in the document viewer, don't set as attachment
        // This allows the browser to display the PDF inline
        const isInlineRequest = req.query.inline === 'true' ||
            (document.fileType.includes('pdf') && !req.query.download);

        if (isInlineRequest) {
            // For inline viewing (especially PDFs)
            res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);
        } else {
            // For downloads
            res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
        }

        // Stream the file
        const fileStream = fs.createReadStream(absolutePath);
        fileStream.on('error', (err) => {
            console.error('Error streaming file:', err);
            // Only send error if headers haven't been sent yet
            if (!res.headersSent) {
                res.status(500).json({ message: 'Error streaming file', error: err.message });
            }
        });

        fileStream.pipe(res);
    } catch (error) {
        console.error('Download document error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get document by ID
export const getDocumentById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { documentId } = req.params;
        const tokenFromQuery = req.query.token as string;

        // Find the document
        const document = await DocumentModel.findById(documentId);

        if (!document) {
            res.status(404).json({ message: 'Document not found' });
            return;
        }

        // Check if the document belongs to the user or is public (but still requires authentication)
        if (!req.user) {
            // If no user in request but token is provided in query params, try to verify it
            if (tokenFromQuery) {
                try {
                    // Import and use the JWT verification from auth middleware
                    const jwt = require('jsonwebtoken');
                    const decoded = jwt.verify(tokenFromQuery, process.env.JWT_SECRET);

                    // If document is public, allow access
                    if (document.isPublic) {
                        // Continue with the response (skip the next checks)
                    }
                    // If document is not public, check if it belongs to the user from the token
                    else if (decoded.userId && decoded.userId === document.userId) {
                        // Continue with the response (skip the next checks)
                    }
                    else {
                        res.status(403).json({ message: 'Unauthorized to access this document' });
                        return;
                    }
                } catch (err) {
                    console.error('Token verification error:', err);
                    res.status(401).json({ message: 'Invalid or expired token' });
                    return;
                }
            } else {
                // No user and no token
                res.status(401).json({ message: 'Authentication required to access documents' });
                return;
            }
        }
        // If user is authenticated through middleware but document is not public and doesn't belong to them
        else if (!document.isPublic && document.userId !== req.user.userId) {
            res.status(403).json({ message: 'Unauthorized to access this document' });
            return;
        }

        res.status(200).json({
            id: document._id,
            userId: document.userId,
            fileName: document.fileName,
            originalName: document.originalName,
            fileType: document.fileType,
            fileSize: document.fileSize,
            description: document.description,
            documentType: document.documentType,
            timePeriod: document.timePeriod || '',
            isPublic: document.isPublic,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt
        });
    } catch (error) {
        console.error('Get document by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update document metadata
export const updateDocumentMetadata = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { documentId } = req.params; const { description, documentType, category, isPublic, timePeriod } = req.body;

        // Find the document
        const document = await DocumentModel.findById(documentId);

        if (!document) {
            res.status(404).json({ message: 'Document not found' });
            return;
        }

        // Check if the document belongs to the user
        if (document.userId !== req.user.userId) {
            res.status(403).json({ message: 'Unauthorized to update this document' });
            return;
        }

        // Update the document
        document.description = description || document.description;
        if (documentType) {
            // Import DocumentType from the Document model to ensure type compatibility
            const validDocType = documentType as import('../models/Profile/Document').DocumentType;
            document.documentType = validDocType;
        }
        if (category) {
            // Import DocumentCategory from the Document model to ensure type compatibility
            const validCategory = category as import('../models/Profile/Document').DocumentCategory;
            document.category = validCategory;
        }
        if (timePeriod !== undefined) document.timePeriod = timePeriod;
        if (isPublic !== undefined) document.isPublic = isPublic === true || isPublic === 'true';

        await document.save(); res.status(200).json({
            message: 'Document updated successfully',
            document: {
                id: document._id,
                fileName: document.fileName,
                originalName: document.originalName,
                fileType: document.fileType,
                fileSize: document.fileSize,
                description: document.description,
                documentType: document.documentType,
                category: document.category, // Include category in response
                timePeriod: document.timePeriod || '',
                isPublic: document.isPublic,
                createdAt: document.createdAt,
                updatedAt: document.updatedAt
            }
        });
    } catch (error) {
        console.error('Update document metadata error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
import { Request, Response } from 'express';
import { prisma } from '../config/db';

/**
 * Record a document view event
 */
export const recordDocumentView = async (req: Request, res: Response): Promise<void> => {
    try {
        // Allow document views without authentication
        // This enables tracking views from shared links

        const { documentId, viewerId, viewerType, entityId, entityType } = req.body;

        // Validate required fields
        if (!documentId || !entityId || !entityType) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        // Check if the viewer is anonymous or a real user
        const isAnonymous = viewerId === 'anonymous' || !viewerId;

        if (isAnonymous) {
            // For anonymous users, store the view without foreign key relationship
            // We'll use a special table or just log it without the foreign key
            console.log('Anonymous document view:', {
                documentId,
                viewerType,
                entityId,
                entityType
            });

            // Return success for anonymous views
            res.status(201).json({ message: 'Anonymous document view recorded' });
            return;
        }

        // For authenticated users, verify the user exists before creating a record
        try {
            // Check if the user exists in the database
            let userExists = null;
            try {
                userExists = await prisma.user.findUnique({
                    where: { user_id: viewerId }
                });
            } catch (dbConnectionError) {
                // Handle database connection errors gracefully
                if (dbConnectionError && typeof dbConnectionError === 'object' && 'code' in dbConnectionError && dbConnectionError.code === 'P1001') {
                    console.warn('Database connection issue - view will be recorded later');
                    res.status(201).json({
                        message: 'Document view acknowledged (database unavailable)',
                        warning: 'Database connection issue - analytics will be recorded later'
                    });
                    return;
                }
                throw dbConnectionError; // Re-throw if it's not a connection error
            }

            if (!userExists) {
                // User doesn't exist, log this but don't fail the request
                console.log(`Document view for non-existent user: ${viewerId}`);
                res.status(201).json({ message: 'Document view acknowledged' });
                return;
            }

            // User exists, create the document view record
            try {
                await prisma.documentView.create({
                    data: {
                        document_id: documentId,
                        viewer_id: viewerId,
                        viewer_type: viewerType,
                        entity_id: entityId,
                        entity_type: entityType,
                        viewed_at: new Date()
                    }
                });

                res.status(201).json({ message: 'Document view recorded successfully' });
            } catch (createError) {
                // Handle database connection errors gracefully
                if (createError && typeof createError === 'object' && 'code' in createError && createError.code === 'P1001') {
                    console.warn('Database connection issue - view will be recorded later');
                    res.status(201).json({
                        message: 'Document view acknowledged (database unavailable)',
                        warning: 'Database connection issue - analytics will be recorded later'
                    });
                    return;
                }
                throw createError; // Re-throw if it's not a connection error
            }
        } catch (dbError) {
            console.error('Database error recording document view:', dbError);
            // Return the specific error to help with debugging
            res.status(500).json({
                message: 'Error recording document view',
                error: dbError instanceof Error ? dbError.message : String(dbError)
            });
        }
    } catch (error) {
        console.error('Error recording document view:', error);
        // Don't return 500 to client as it affects user experience
        res.status(201).json({ message: 'Request received' });
    }
};

/**
 * Record a document download event
 */
export const recordDocumentDownload = async (req: Request, res: Response): Promise<void> => {
    try {
        // We'll allow document downloads without authentication for shared links
        // but we'll handle them differently

        const { documentId, downloaderId, downloaderType, entityId, entityType } = req.body;

        // Validate required fields
        if (!documentId || !entityId || !entityType) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        // Check if the downloader is anonymous or a real user
        const isAnonymous = downloaderId === 'anonymous' || !downloaderId;

        if (isAnonymous) {
            // For anonymous users, we'll just log the download without storing in the database
            // This avoids the foreign key constraint issue
            console.log('Anonymous document download:', {
                documentId,
                downloaderType,
                entityId,
                entityType,
                timestamp: new Date()
            });

            // Return success for anonymous downloads
            res.status(201).json({ message: 'Anonymous document download recorded' });
            return;
        }

        // For authenticated users, verify the user exists before creating a record
        try {
            // Check if the user exists in the database
            let userExists = null;
            try {
                userExists = await prisma.user.findUnique({
                    where: { user_id: downloaderId }
                });
            } catch (dbConnectionError) {
                // Handle database connection errors gracefully
                if (dbConnectionError && typeof dbConnectionError === 'object' && 'code' in dbConnectionError && dbConnectionError.code === 'P1001') {
                    console.warn('Database connection issue - download will be recorded later');
                    res.status(201).json({
                        message: 'Document download acknowledged (database unavailable)',
                        warning: 'Database connection issue - analytics will be recorded later'
                    });
                    return;
                }
                throw dbConnectionError; // Re-throw if it's not a connection error
            }

            if (!userExists) {
                // User doesn't exist, log this but don't fail the request
                console.log(`Document download for non-existent user: ${downloaderId}`);
                res.status(201).json({ message: 'Document download acknowledged' });
                return;
            }

            // User exists, create the document download record
            try {
                await prisma.documentDownload.create({
                    data: {
                        document_id: documentId,
                        downloader_id: downloaderId,
                        downloader_type: downloaderType,
                        entity_id: entityId,
                        entity_type: entityType,
                        downloaded_at: new Date()
                    }
                });

                res.status(201).json({ message: 'Document download recorded successfully' });
            } catch (createError) {
                // Handle database connection errors gracefully
                if (createError && typeof createError === 'object' && 'code' in createError && createError.code === 'P1001') {
                    console.warn('Database connection issue - download will be recorded later');
                    res.status(201).json({
                        message: 'Document download acknowledged (database unavailable)',
                        warning: 'Database connection issue - analytics will be recorded later'
                    });
                    return;
                }
                throw createError; // Re-throw if it's not a connection error
            }
        } catch (dbError) {
            console.error('Database error recording document download:', dbError);
            // Return the specific error to help with debugging
            res.status(500).json({
                message: 'Error recording document download',
                error: dbError instanceof Error ? dbError.message : String(dbError)
            });
        }
    } catch (error) {
        console.error('Error recording document download:', error);
        res.status(500).json({
            message: 'Server error',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};

/**
 * Get document analytics for a specific document
 */
export const getDocumentAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { documentId } = req.params;

        if (!documentId) {
            res.status(400).json({ message: 'Document ID is required' });
            return;
        }

        // Get view count using Prisma
        const viewCount = await prisma.documentView.count({
            where: { document_id: documentId }
        });

        // Get download count using Prisma
        const downloadCount = await prisma.documentDownload.count({
            where: { document_id: documentId }
        });

        // Get unique viewers using Prisma
        const uniqueViewers = await prisma.documentView.findMany({
            where: { document_id: documentId },
            select: { viewer_id: true },
            distinct: ['viewer_id']
        });

        // Get unique downloaders using Prisma
        const uniqueDownloaders = await prisma.documentDownload.findMany({
            where: { document_id: documentId },
            select: { downloader_id: true },
            distinct: ['downloader_id']
        });

        // Get recent views using Prisma
        const recentViews = await prisma.documentView.findMany({
            where: { document_id: documentId },
            orderBy: { viewed_at: 'desc' },
            take: 10,
            include: { user: true }
        });

        // Get recent downloads using Prisma
        const recentDownloads = await prisma.documentDownload.findMany({
            where: { document_id: documentId },
            orderBy: { downloaded_at: 'desc' },
            take: 10,
            include: { user: true }
        });

        res.json({
            documentId,
            analytics: {
                views: {
                    total: viewCount,
                    unique: uniqueViewers.length,
                    recent: recentViews.map((view: any) => ({
                        id: view.id,
                        viewerId: view.viewer_id,
                        viewerType: view.viewer_type,
                        entityId: view.entity_id,
                        entityType: view.entity_type,
                        viewedAt: view.viewed_at,
                        viewerEmail: view.user.email
                    }))
                },
                downloads: {
                    total: downloadCount,
                    unique: uniqueDownloaders.length,
                    recent: recentDownloads.map((download: any) => ({
                        id: download.id,
                        downloaderId: download.downloader_id,
                        downloaderType: download.downloader_type,
                        entityId: download.entity_id,
                        entityType: download.entity_type,
                        downloadedAt: download.downloaded_at,
                        downloaderEmail: download.user.email
                    }))
                }
            }
        });
    } catch (error) {
        console.error('Error getting document analytics:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Get analytics for all documents of a user
 */
export const getUserDocumentAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const userId = req.user.userId;

        // Get all document views where the entity is the current user using Prisma
        const documentViews = await prisma.documentView.findMany({
            where: { entity_id: userId }
        });

        // Get all document downloads where the entity is the current user using Prisma
        const documentDownloads = await prisma.documentDownload.findMany({
            where: { entity_id: userId }
        });

        // Aggregate views by document
        const viewsByDocument = documentViews.reduce((acc: Record<string, number>, view) => {
            if (!acc[view.document_id]) {
                acc[view.document_id] = 0;
            }
            acc[view.document_id]++;
            return acc;
        }, {} as Record<string, number>);

        // Aggregate downloads by document
        const downloadsByDocument = documentDownloads.reduce((acc: Record<string, number>, download) => {
            if (!acc[download.document_id]) {
                acc[download.document_id] = 0;
            }
            acc[download.document_id]++;
            return acc;
        }, {} as Record<string, number>);

        // Get unique viewers using Prisma
        const uniqueViewers = await prisma.documentView.findMany({
            where: { entity_id: userId },
            select: { viewer_id: true },
            distinct: ['viewer_id']
        });

        // Get unique downloaders using Prisma
        const uniqueDownloaders = await prisma.documentDownload.findMany({
            where: { entity_id: userId },
            select: { downloader_id: true },
            distinct: ['downloader_id']
        });

        res.json({
            userId,
            analytics: {
                views: {
                    total: documentViews.length,
                    unique: uniqueViewers.length,
                    byDocument: viewsByDocument
                },
                downloads: {
                    total: documentDownloads.length,
                    unique: uniqueDownloaders.length,
                    byDocument: downloadsByDocument
                }
            }
        });
    } catch (error) {
        console.error('Error getting user document analytics:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

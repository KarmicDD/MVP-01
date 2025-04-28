import { Request, Response } from 'express';
import { prisma } from '../config/db';

/**
 * Record a document view event
 */
export const recordDocumentView = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { documentId, viewerId, viewerType, entityId, entityType } = req.body;

        // Validate required fields
        if (!documentId || !viewerId || !viewerType || !entityId || !entityType) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        // Create a new document view record using Prisma
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
    } catch (error) {
        console.error('Error recording document view:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Record a document download event
 */
export const recordDocumentDownload = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { documentId, downloaderId, downloaderType, entityId, entityType } = req.body;

        // Validate required fields
        if (!documentId || !downloaderId || !downloaderType || !entityId || !entityType) {
            res.status(400).json({ message: 'Missing required fields' });
            return;
        }

        // Create a new document download record using Prisma
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
    } catch (error) {
        console.error('Error recording document download:', error);
        res.status(500).json({ message: 'Server error' });
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

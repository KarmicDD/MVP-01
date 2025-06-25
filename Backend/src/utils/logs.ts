import { NextFunction, Request, Response } from "express";
import { emptyDirectoryContents } from './fileUtils';
import logger from './logger';
import * as path from 'path';

interface RequestStats {
    count: number;
    totalTime: number;
    avgTime?: number;
    routes: Record<string, {
        count: number;
        totalTime: number;
        avgTime: number;
        lastAccessed: string;
        statusCodes: Record<number, number>;
    }>;
    startTime: string;
    errors: {
        count: number;
        recent: Array<{
            timestamp: string;
            route: string;
            error: string;
            statusCode: number;
        }>;
    };
}

// Store stats in a singleton object to track across application lifetime
const stats: RequestStats = {
    count: 0,
    totalTime: 0,
    routes: {},
    startTime: new Date().toISOString(),
    errors: {
        count: 0,
        recent: []
    }
};

// Generate unique request ID
const generateRequestId = (): string => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get user info from request
const getUserInfo = (req: Request): { userId?: string; userAgent?: string } => {
    return {
        userId: (req as any).user?.userId || (req as any).user?.id,
        userAgent: req.get('User-Agent')
    };
};

// Enhanced request counting middleware - SINGLE, CLEAN LOGGING
const countRequest = (req: Request, res: Response, next: NextFunction): void => {
    stats.count++;
    const requestId = generateRequestId();
    const route = req.route?.path || req.path;

    // Store request metadata
    (req as any).requestId = requestId;
    (req as any).requestStartTime = Date.now();

    // Initialize stats for this route if it doesn't exist
    if (!stats.routes[route]) {
        stats.routes[route] = {
            count: 0,
            totalTime: 0,
            avgTime: 0,
            lastAccessed: new Date().toISOString(),
            statusCodes: {}
        };
    }

    // Increment route-specific counter
    stats.routes[route].count++;
    stats.routes[route].lastAccessed = new Date().toISOString();

    // Periodic cleanup (reduced frequency)
    if (stats.count % 10 === 0) {
        logger.info(`🧹 Cleanup #${stats.count}`, { requests: stats.count }, 'CLEANUP');

        const logsDir = path.join(__dirname, '..', '..', 'logs');
        const ocrOutputDir = path.join(__dirname, '..', '..', 'ocr_outputs');

        Promise.all([
            emptyDirectoryContents(logsDir),
            emptyDirectoryContents(ocrOutputDir)
        ]).catch(err => {
            logger.error('Cleanup failed', { error: err.message, requestId });
        });
    }

    next();
};

// Enhanced time tracking middleware - SINGLE, CLEAN LOGGING
const trackTime = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();
    const requestId = (req as any).requestId;
    const route = req.route?.path || req.path;
    const { userId } = getUserInfo(req);

    // Store original end function to intercept it
    const originalEnd = res.end;

    // Override end method to calculate time before actually ending  
    res.end = function (chunk?: any, encoding?: any, callback?: any): any {
        const end = Date.now();
        const duration = end - start;
        const statusCode = res.statusCode;

        // Update statistics
        stats.totalTime += duration;
        if (stats.routes[route]) {
            stats.routes[route].totalTime += duration;
            stats.routes[route].avgTime = stats.routes[route].totalTime / stats.routes[route].count;

            // Track status codes
            if (!stats.routes[route].statusCodes[statusCode]) {
                stats.routes[route].statusCodes[statusCode] = 0;
            }
            stats.routes[route].statusCodes[statusCode]++;
        }

        // Track errors
        if (statusCode >= 400) {
            stats.errors.count++;
            stats.errors.recent.unshift({
                timestamp: new Date().toISOString(),
                route,
                error: res.statusMessage || 'Unknown error',
                statusCode
            });

            // Keep only last 5 errors
            if (stats.errors.recent.length > 5) {
                stats.errors.recent = stats.errors.recent.slice(0, 5);
            }
        }

        // SINGLE HTTP LOG - Clean and informative
        logger.httpRequest(
            req.method,
            route,
            statusCode,
            duration,
            userId,
            req.get('User-Agent'),
            requestId
        );

        // Call the original end method
        return originalEnd.call(this, chunk, encoding, callback);
    };

    next();
};

// Enhanced statistics utility
const getRequestStats = (): RequestStats & {
    uptime: string;
    requestsPerMinute: number;
    errorRate: number;
    topRoutes: Array<{ route: string; count: number; avgTime: number }>;
} => {
    const now = new Date();
    const startDate = new Date(stats.startTime);
    const uptimeMs = now.getTime() - startDate.getTime();
    const uptimeMinutes = uptimeMs / (1000 * 60);

    // Calculate top routes by request count
    const topRoutes = Object.entries(stats.routes)
        .map(([route, data]) => ({
            route,
            count: data.count,
            avgTime: Math.round(data.avgTime)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return {
        ...stats,
        avgTime: stats.count > 0 ? Math.round(stats.totalTime / stats.count) : 0,
        uptime: formatUptime(uptimeMs),
        requestsPerMinute: Math.round(stats.count / Math.max(uptimeMinutes, 1)),
        errorRate: stats.count > 0 ? Math.round((stats.errors.count / stats.count) * 100) : 0,
        topRoutes
    };
};

// Format uptime in human readable format
const formatUptime = (uptimeMs: number): string => {
    const seconds = Math.floor(uptimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
};

// Enhanced middleware that provides statistics endpoint
const statsMiddleware = (req: Request, res: Response): void => {
    const enhancedStats = getRequestStats();

    logger.info('📈 Stats requested', {
        requestor: getUserInfo(req).userId || 'anonymous',
        totalRequests: enhancedStats.count
    }, 'STATS_REQUEST');

    res.json({
        overview: {
            totalRequests: enhancedStats.count,
            totalProcessingTime: `${enhancedStats.totalTime}ms`,
            averageProcessingTime: `${enhancedStats.avgTime}ms`,
            uptime: enhancedStats.uptime,
            requestsPerMinute: enhancedStats.requestsPerMinute,
            errorRate: `${enhancedStats.errorRate}%`,
            startTime: enhancedStats.startTime
        },
        topRoutes: enhancedStats.topRoutes,
        routeDetails: Object.entries(enhancedStats.routes).reduce((acc, [route, data]) => {
            acc[route] = {
                ...data,
                avgTime: `${Math.round(data.avgTime)}ms`,
                totalTime: `${data.totalTime}ms`
            };
            return acc;
        }, {} as any),
        errors: {
            totalErrors: enhancedStats.errors.count,
            recentErrors: enhancedStats.errors.recent
        }
    });
};

// Reset stats function (useful for testing)
const resetStats = (): void => {
    stats.count = 0;
    stats.totalTime = 0;
    stats.routes = {};
    stats.startTime = new Date().toISOString();
    stats.errors = { count: 0, recent: [] };

    logger.info('📊 Request statistics reset', {}, 'STATS_RESET');
};

export { countRequest, trackTime, getRequestStats, statsMiddleware, resetStats };

// Extend Express Request interface to add our custom properties
declare global {
    namespace Express {
        interface Request {
            requestStartTime?: number;
            requestId?: string;
        }
    }
}
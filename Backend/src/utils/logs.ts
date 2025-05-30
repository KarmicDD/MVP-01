import { NextFunction, Request, Response } from "express";
import { emptyDirectoryContents } from './fileUtils';
import * as path from 'path';

interface RequestStats {
    count: number;
    totalTime: number;
    avgTime?: number;
    routes: Record<string, {
        count: number;
        totalTime: number;
        avgTime: number;
    }>;
}

// Store stats in a singleton object to track across application lifetime
const stats: RequestStats = {
    count: 0,
    totalTime: 0,
    routes: {}
};

// Middleware to count requests with route-specific tracking
const countRequest = (req: Request, res: Response, next: NextFunction): void => {
    stats.count++;

    // Get route path or URL path if route not available yet
    const route = req.route?.path || req.path;

    // Initialize stats for this route if it doesn't exist
    if (!stats.routes[route]) {
        stats.routes[route] = {
            count: 0,
            totalTime: 0,
            avgTime: 0
        };
    }

    // Increment route-specific counter
    stats.routes[route].count++;

    // Add timestamp to request object for later use
    req.requestStartTime = Date.now();

    console.log(`Request #${stats.count} [${req.method}] ${route}`);
    console.log("-----Request starts-----");

    // Clear directories every 2 requests
    if (stats.count % 2 === 0) {
        console.log(`Request count is ${stats.count}, clearing directories...`);
        const logsDir = path.join(__dirname, '..', '..', 'logs');
        const ocrOutputDir = path.join(__dirname, '..', '..', 'ocr_outputs');
        emptyDirectoryContents(logsDir).catch(err => console.error("Error clearing logs directory:", err));
        emptyDirectoryContents(ocrOutputDir).catch(err => console.error("Error clearing ocr_outputs directory:", err));
    }

    next();
};

// Middleware to track request processing time
const trackTime = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();

    // Store original end function to intercept it
    const originalEnd = res.end;

    // Override end method to calculate time before actually ending
    res.end = function (chunk?: any, encoding?: any, callback?: any): any {
        const end = Date.now();
        const duration = end - start;
        const route = req.route?.path || req.path;

        // Update statistics
        stats.totalTime += duration;
        if (stats.routes[route]) {
            stats.routes[route].totalTime += duration;
            stats.routes[route].avgTime = stats.routes[route].totalTime / stats.routes[route].count;
        }

        console.log(`Time taken: ${duration}ms`);
        console.log(`Status: ${res.statusCode}`);
        console.log('----####Request Ends####----');

        // Call the original end method
        return originalEnd.call(this, chunk, encoding, callback);
    };

    next();
};

// Utility function to get current statistics
const getRequestStats = (): RequestStats => {
    return {
        ...stats,
        avgTime: stats.count > 0 ? stats.totalTime / stats.count : 0
    };
};

// Middleware that provides statistics endpoint
const statsMiddleware = (req: Request, res: Response): void => {
    res.json({
        total: {
            requestCount: stats.count,
            totalProcessingTime: stats.totalTime,
            averageProcessingTime: stats.count > 0 ? stats.totalTime / stats.count : 0
        },
        routeSpecific: stats.routes
    });
};

// Reset stats function (useful for testing)
const resetStats = (): void => {
    stats.count = 0;
    stats.totalTime = 0;
    stats.routes = {};
};

export { countRequest, trackTime, getRequestStats, statsMiddleware, resetStats };

// Extend Express Request interface to add our custom property
declare global {
    namespace Express {
        interface Request {
            requestStartTime?: number;
        }
    }
}
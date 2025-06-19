import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore: RateLimitStore = {};

// Function to reset rate limit store (for testing)
export const resetRateLimitStore = () => {
    Object.keys(rateLimitStore).forEach(key => delete rateLimitStore[key]);
};

export interface RateLimitOptions {
    windowMs: number; // Time window in milliseconds
    max: number; // Maximum number of requests per window
    message?: string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
}

export const createRateLimit = (options: RateLimitOptions) => {
    const {
        windowMs = 15 * 60 * 1000, // 15 minutes default
        max = 100, // 100 requests per window default
        message = 'Too many requests, please try again later.',
    } = options;

    return (req: Request, res: Response, next: NextFunction) => {
        // Generate key based on IP and user ID (if authenticated)
        const userId = req.user?.userId;
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const key = userId ? `user:${userId}` : `ip:${ip}`;

        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean up old entries
        if (rateLimitStore[key] && rateLimitStore[key].resetTime < windowStart) {
            delete rateLimitStore[key];
        }

        // Initialize or get current count
        if (!rateLimitStore[key]) {
            rateLimitStore[key] = {
                count: 0,
                resetTime: now + windowMs
            };
        }

        // Increment count
        rateLimitStore[key].count++;

        // Set rate limit headers
        res.set({
            'X-RateLimit-Limit': max.toString(),
            'X-RateLimit-Remaining': Math.max(0, max - rateLimitStore[key].count).toString(),
            'X-RateLimit-Reset': Math.ceil(rateLimitStore[key].resetTime / 1000).toString()
        });

        // Check if limit exceeded
        if (rateLimitStore[key].count > max) {
            res.status(429).json({
                error: 'Too Many Requests',
                message,
                retryAfter: Math.ceil((rateLimitStore[key].resetTime - now) / 1000)
            });
            return;
        }

        next();
    };
};

// Daily rate limit for API usage (100 requests per day per user)
export const dailyRateLimit = createRateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 100,
    message: 'Daily API limit exceeded. Please try again tomorrow.'
});

// General rate limit for API endpoints
export const generalRateLimit = createRateLimit({
    windowMs: process.env.NODE_ENV === 'test' ? 1000 : 15 * 60 * 1000, // 1 second in test, 15 minutes in production
    max: process.env.NODE_ENV === 'test' ? 5 : 100, // 5 requests in test, 100 in production
    message: 'Too many requests from this IP, please try again later.'
});

// Authentication rate limit (stricter) - adjusted for testing
export const authRateLimit = createRateLimit({
    windowMs: process.env.NODE_ENV === 'test' ? 1000 : 15 * 60 * 1000, // 1 second in test, 15 minutes in production
    max: process.env.NODE_ENV === 'test' ? 3 : 10, // 3 requests in test, 10 in production
    message: 'Too many authentication attempts, please try again later.'
});

// File upload rate limit
export const uploadRateLimit = createRateLimit({
    windowMs: process.env.NODE_ENV === 'test' ? 1000 : 60 * 60 * 1000, // 1 second in test, 1 hour in production
    max: process.env.NODE_ENV === 'test' ? 2 : 20, // 2 requests in test, 20 in production
    message: 'Too many file uploads, please try again later.'
});

// Search rate limit
export const searchRateLimit = createRateLimit({
    windowMs: process.env.NODE_ENV === 'test' ? 1000 : 60 * 1000, // 1 second in test, 1 minute in production
    max: process.env.NODE_ENV === 'test' ? 2 : 30, // 2 requests in test, 30 in production
    message: 'Too many search requests, please slow down.'
});

export default {
    createRateLimit,
    dailyRateLimit,
    generalRateLimit,
    authRateLimit,
    uploadRateLimit,
    searchRateLimit
};

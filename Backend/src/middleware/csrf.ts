import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import crypto from 'crypto';
import { logSecurityEvent } from './security';

// Extend session data interface
declare module 'express-session' {
    interface SessionData {
        csrfToken?: string;
    }
}

/**
 * Generate CSRF token
 */
export const generateCSRFToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * CSRF Protection Middleware
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
    // Skip CSRF for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    // Skip CSRF only for OAuth endpoints and GET requests
    // LOGIN and REGISTER should be protected by CSRF tokens
    const skipPaths = [
        '/api/auth/google',
        '/api/auth/linkedin',
        '/api/auth/google/callback',
        '/api/auth/linkedin/callback',
        '/api/csrf-token'  // Allow getting CSRF token without validation
    ];

    // Check if the request path matches any skip paths
    const shouldSkip = skipPaths.some(path => {
        return req.path === path || req.path.startsWith(path);
    });

    if (shouldSkip) {
        return next();
    }

    // Ensure session exists
    if (!req.session) {
        res.status(500).json({ message: 'Session not configured' });
        return;
    }

    // Generate CSRF token if not exists
    if (!req.session.csrfToken) {
        req.session.csrfToken = generateCSRFToken();
    }

    // Get token from header or body
    const token = req.get('X-CSRF-Token') || req.body._csrf;

    // Validate CSRF token
    if (!token || token !== req.session.csrfToken) {
        // Enhanced security logging with recovery tracking
        logSecurityEvent('CSRF_TOKEN_INVALID_SESSION_CLEARED', req, {
            providedToken: token ? 'provided' : 'missing',
            sessionToken: req.session.csrfToken ? 'exists' : 'missing',
            path: req.path,
            method: req.method,
            userAgent: req.get('User-Agent'),
            referer: req.get('Referer'),
            sessionCorrupted: true,
            recoveryAction: 'session_destroyed',
            timestamp: new Date().toISOString()
        });

        // Clear the corrupted session completely for fresh start
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
            }
        });

        // User-friendly response with recovery instructions
        res.status(403).json({
            message: 'Your session has expired for security reasons. Please log in again.',
            code: 'CSRF_INVALID',
            action: 'REDIRECT_TO_LOGIN',
            reason: 'session_expired',
            userFriendlyMessage: 'For your security, your session has been reset. You will be redirected to login.',
            timestamp: new Date().toISOString()
        });
        return;
    }

    // Log successful CSRF validation for monitoring
    logSecurityEvent('CSRF_TOKEN_VALID', req, {
        path: req.path,
        method: req.method
    });

    next();
};

/**
 * Endpoint to get CSRF token
 */
export const getCSRFToken = (req: Request, res: Response): void => {
    // Ensure session exists
    if (!req.session) {
        res.status(500).json({ message: 'Session not configured' });
        return;
    }

    // Generate token if not exists
    if (!req.session.csrfToken) {
        req.session.csrfToken = generateCSRFToken();
    }

    res.json({ csrfToken: req.session.csrfToken });
};

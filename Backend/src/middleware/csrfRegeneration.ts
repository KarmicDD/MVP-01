import { Request, Response, NextFunction } from 'express';
import { generateCSRFToken } from './csrf';

/**
 * Middleware to regenerate CSRF token after successful authentication
 * This should be used after login/register success but before sending response
 */
export const regenerateCSRFToken = (req: Request, res: Response, next: NextFunction): void => {
    if (req.session) {
        // Generate new CSRF token
        req.session.csrfToken = generateCSRFToken();

        // Add new CSRF token to response headers for client to use
        res.setHeader('X-New-CSRF-Token', req.session.csrfToken);
    }

    next();
};

/**
 * Helper function to regenerate CSRF token programmatically
 */
export const regenerateCSRFTokenForSession = (req: Request): string | null => {
    if (req.session) {
        const newToken = generateCSRFToken();
        req.session.csrfToken = newToken;
        return newToken;
    }
    return null;
};

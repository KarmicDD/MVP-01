import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    // Only log errors in development or if not in test environment
    if (process.env.NODE_ENV !== 'test') {
        console.error('Error caught by errorHandler:', err.message);
    }    // Handle malformed JSON - more comprehensive detection
    if (err instanceof SyntaxError && (
        err.message.includes('JSON') ||
        err.message.includes('Unexpected token') ||
        err.message.includes('Invalid character') ||
        (err as any).status === 400
    )) {
        res.status(400).json({
            message: 'Invalid JSON format',
            error: 'Malformed JSON in request body'
        });
        return;
    }    // Handle payload too large
    if (err.type === 'entity.too.large' || err.code === 'LIMIT_FILE_SIZE' || err.name === 'PayloadTooLargeError') {
        res.status(413).json({
            message: 'Request entity too large',
            error: 'Payload exceeds maximum allowed size'
        });
        return;
    }

    // Handle JWT errors with sanitized messages
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
    }

    if (err.name === 'TokenExpiredError') {
        res.status(401).json({ message: 'Invalid or expired token' });
        return;
    }

    // Handle OAuth errors
    if (err.name === 'TokenError') {
        res.status(302).redirect(`${process.env.FRONTEND_URL}/auth?error=oauth_failed`);
        return;
    }

    // Handle Multer errors  
    if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ message: 'File too large. Maximum size is 10MB.' });
        return;
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        res.status(400).json({ message: 'Invalid file type. Only PDF, PPT, DOC, and image files are allowed.' });
        return;
    }

    // Handle Prisma errors
    if (err.code === 'P2002') {
        res.status(409).json({ message: 'Unique constraint violation' });
        return;
    }

    if (err.code === 'P2025') {
        res.status(404).json({ message: 'Record not found' });
        return;
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
        res.status(400).json({
            message: 'Validation failed',
            errors: err.errors || err.message
        });
        return;
    }

    // Handle mongoose timeout errors
    if (err.name === 'MongooseError' && err.message.includes('timed out')) {
        res.status(503).json({
            message: 'Database temporarily unavailable',
            error: 'Service temporarily unavailable'
        });
        return;
    }    // Rate limiting errors
    if (err.status === 429) {
        res.status(429).json({
            message: 'Too many requests',
            error: err.message || 'Rate limit exceeded'
        });
        return;
    }

    // Input validation errors
    if (err.name === 'ValidationError' || err.status === 422) {
        res.status(400).json({
            message: 'Validation failed',
            errors: err.errors || err.message
        });
        return;
    }

    // Content-Type validation errors
    if (err.message && err.message.includes('content-type')) {
        res.status(400).json({
            message: 'Invalid content type',
            error: 'Unsupported content type for this endpoint'
        });
        return;
    }

    // Default error - sanitize sensitive information and don't expose internal details in production
    const sanitizedMessage = sanitizeErrorMessage(err.message || 'Internal server error');

    res.status(err.status || 500).json({
        message: sanitizedMessage,
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
    return;
};

// Function to sanitize error messages to prevent data leakage
function sanitizeErrorMessage(message: string): string {
    if (!message) return 'Internal server error';

    // Remove sensitive information from error messages
    const sensitivePatterns = [
        /password/gi,
        /hash/gi,
        /secret/gi,
        /key/gi,
        /Bearer\s+[^\s]+/gi,  // Remove Bearer tokens
        /\/[a-zA-Z].*\/.*\.[a-zA-Z]+/g,  // Remove file paths
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g  // Remove email addresses
    ];

    let sanitized = message;
    sensitivePatterns.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '[REDACTED]');
    });

    // If the message mentions token but isn't about authentication, sanitize it
    if (sanitized.toLowerCase().includes('token') && !sanitized.toLowerCase().includes('invalid or expired token')) {
        sanitized = 'Authentication required';
    }

    return sanitized;
}

export default errorHandler;

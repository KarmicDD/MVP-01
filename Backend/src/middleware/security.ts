import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
// @ts-ignore
import { body, validationResult } from 'express-validator';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Create DOMPurify instance for server-side sanitization
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

/**
 * Log security events
 */
export const logSecurityEvent = (event: string, req: Request, details?: any): void => {
    const securityLog = {
        timestamp: new Date().toISOString(),
        event,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
        userId: (req as any).user?.userId || 'anonymous',
        details
    };

    console.warn('SECURITY EVENT:', JSON.stringify(securityLog));

    // In production, send to security monitoring system
    // Example: sendToSecurityMonitoring(securityLog);
};

/**
 * Input Sanitization Middleware
 * Sanitizes all incoming request data to prevent XSS and injection attacks
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Validate body size
        if (req.body && !validateBodySize(req.body, 2 * 1024 * 1024)) { // 2MB limit
            res.status(413).json({ message: 'Request body too large' });
            return;
        }

        // Sanitize req.body
        if (req.body && typeof req.body === 'object') {
            const bodyString = JSON.stringify(req.body);

            // Check for suspicious patterns before processing
            if (hasSuspiciousPatterns(bodyString)) {
                logSecurityEvent('SUSPICIOUS_INPUT_DETECTED', req, { body: 'redacted' });
                res.status(400).json({ message: 'Invalid input detected' });
                return;
            }

            req.body = sanitizeObject(req.body);
        }

        // Sanitize req.query
        if (req.query && typeof req.query === 'object') {
            req.query = sanitizeObject(req.query);
        }

        // Sanitize req.params
        if (req.params && typeof req.params === 'object') {
            req.params = sanitizeObject(req.params);
        }

        next();
    } catch (error) {
        console.error('Error in sanitizeInput middleware:', error);
        res.status(500).json({ message: 'Internal server error during input sanitization' });
    }
};

/**
 * Validate request body size
 */
function validateBodySize(body: any, maxSize: number): boolean {
    try {
        const bodySize = Buffer.byteLength(JSON.stringify(body), 'utf8');
        return bodySize <= maxSize;
    } catch {
        return false;
    }
}

/**
 * Check for suspicious patterns in input
 */
function hasSuspiciousPatterns(input: string): boolean {
    const suspiciousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /data:text\/html/gi,
        /on\w+\s*=/gi,
        /eval\s*\(/gi,
        /expression\s*\(/gi,
        /url\s*\(/gi,
        /import\s*\(/gi,
        /@import/gi,
        /\{\{.*\}\}/gi, // Template injection
        /\$\{.*\}/gi, // Template literals
        /<iframe/gi,
        /<object/gi,
        /<embed/gi,
        /<applet/gi
    ];

    return suspiciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj === 'string') {
        return sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    if (typeof obj === 'object') {
        const sanitizedObj: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const sanitizedKey = sanitizeString(key);
                sanitizedObj[sanitizedKey] = sanitizeObject(obj[key]);
            }
        }
        return sanitizedObj;
    }

    return obj;
}

/**
 * Sanitize individual strings
 */
function sanitizeString(str: string): string {
    if (typeof str !== 'string') {
        return str;
    }

    // Remove potential XSS vectors
    let sanitized = str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: urls
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .replace(/data:text\/html/gi, '') // Remove data urls
        .replace(/vbscript:/gi, '') // Remove vbscript
        .replace(/livescript:/gi, '') // Remove livescript
        .replace(/mocha:/gi, '') // Remove mocha
        .replace(/charset=/gi, '') // Remove charset
        .replace(/window\./gi, '') // Remove window object access
        .replace(/document\./gi, '') // Remove document object access
        .replace(/eval\(/gi, '') // Remove eval
        .replace(/expression\(/gi, ''); // Remove CSS expressions

    // Use DOMPurify for additional sanitization
    sanitized = purify.sanitize(sanitized, {
        ALLOWED_TAGS: [], // No HTML tags allowed in regular strings
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true
    });

    return sanitized.trim();
}

/**
 * HTML Content Sanitization for trusted HTML content
 */
export const sanitizeHTML = (html: string, allowedTags?: string[]): string => {
    if (typeof html !== 'string') {
        return '';
    }

    const defaultAllowedTags = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const tags = allowedTags || defaultAllowedTags;

    return purify.sanitize(html, {
        ALLOWED_TAGS: tags,
        ALLOWED_ATTR: ['href', 'title', 'alt'],
        KEEP_CONTENT: true,
        ALLOW_DATA_ATTR: false
    });
};

/**
 * MongoDB NoSQL Injection Protection
 */
export const mongoSanitizeMiddleware = mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        logSecurityEvent('NOSQL_INJECTION_ATTEMPT', req, { key });
    }
});
export const createRateLimiter = (
    windowMs: number = 15 * 60 * 1000, // 15 minutes
    max: number = 100,
    message: string = 'Too many requests from this IP, please try again later'
) => {
    return rateLimit({
        windowMs,
        max,
        message: {
            error: message,
            retryAfter: Math.ceil(windowMs / 1000)
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req: Request, res: Response) => {
            res.status(429).json({
                error: message,
                retryAfter: Math.ceil(windowMs / 1000)
            });
        }
    });
};

// Remove duplicate rate limiters - use the new ones below

export const emailRateLimit = createRateLimiter(
    60 * 60 * 1000, // 1 hour
    5, // 5 emails per hour
    'Email rate limit exceeded, please try again later'
);

/**
 * Enhanced Rate Limiting
 */
export const createRateLimit = (windowMs: number, max: number, message?: string) => {
    return rateLimit({
        windowMs,
        max,
        message: message || 'Too many requests from this IP, please try again later',
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            logSecurityEvent('RATE_LIMIT_EXCEEDED', req, { windowMs, max });
            res.status(429).json({
                message: 'Too many requests, please try again later',
                retryAfter: Math.round(windowMs / 1000)
            });
        }
    });
};

// Specific rate limiters for different endpoints
export const authRateLimit = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    5, // 5 attempts
    'Too many authentication attempts, please try again after 15 minutes'
);

export const generalRateLimit = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100 // 100 requests
);

export const uploadRateLimit = createRateLimit(
    60 * 60 * 1000, // 1 hour
    10, // 10 uploads
    'Too many file uploads, please try again after 1 hour'
);

/**
 * CSRF token endpoint rate limiting
 */
export const csrfTokenRateLimit = createRateLimit(
    60 * 1000, // 1 minute
    30, // 30 requests per minute
    'Too many CSRF token requests, please try again later'
);

/**
 * Request Validation Middleware
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logSecurityEvent('VALIDATION_FAILED', req, { errors: errors.array() });
        res.status(400).json({
            message: 'Validation failed',
            errors: errors.array().map((error: any) => ({
                field: error.type === 'field' ? error.path : 'unknown',
                message: error.msg,
                value: error.type === 'field' ? error.value : undefined
            }))
        });
        return;
    }
    next();
};

/**
 * File Upload Security Validation
 */
export const validateFileUpload = (allowedTypes: string[], maxSize: number = 10 * 1024 * 1024) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            if (!req.files && !req.file) {
                return next();
            }

            const files: any[] = req.files ? (Array.isArray(req.files) ? req.files : [req.files]) : [req.file];

            for (const file of files) {
                if (!file) continue;

                // Check file size
                if (typeof file.size === 'number' && file.size > maxSize) {
                    logSecurityEvent('FILE_SIZE_EXCEEDED', req, { size: file.size, maxSize });
                    res.status(400).json({
                        message: `File too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB`
                    });
                    return;
                }

                // Check file type
                const fileExtension = typeof file.originalname === 'string' ? file.originalname.split('.').pop()?.toLowerCase() : undefined;
                const mimeType = typeof file.mimetype === 'string' ? file.mimetype.toLowerCase() : undefined;

                if (!fileExtension || !allowedTypes.includes(fileExtension)) {
                    logSecurityEvent('INVALID_FILE_TYPE', req, { extension: fileExtension, allowed: allowedTypes });
                    res.status(400).json({
                        message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
                    });
                    return;
                }

                // Additional MIME type validation
                const allowedMimeTypes: Record<string, string[]> = {
                    pdf: ['application/pdf'],
                    doc: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                    xls: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
                    ppt: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
                    jpg: ['image/jpeg'],
                    jpeg: ['image/jpeg'],
                    png: ['image/png'],
                    gif: ['image/gif']
                };

                const expectedMimeTypes = allowedMimeTypes[fileExtension];
                if (expectedMimeTypes && mimeType && !expectedMimeTypes.includes(mimeType)) {
                    logSecurityEvent('MIME_TYPE_MISMATCH', req, { extension: fileExtension, mimeType });
                    res.status(400).json({
                        message: 'File extension and MIME type mismatch. Potential security risk detected.'
                    });
                    return;
                }

                // Check for suspicious content in filename
                const suspiciousPatterns = [
                    /\.exe$/i, /\.bat$/i, /\.cmd$/i, /\.com$/i, /\.pif$/i, /\.scr$/i,
                    /\.vbs$/i, /\.js$/i, /\.jar$/i, /\.php$/i, /\.asp$/i, /\.jsp$/i
                ];

                const filename = typeof file.originalname === 'string' ? file.originalname : '';
                const hasSuspiciousPattern = suspiciousPatterns.some(pattern =>
                    pattern.test(filename)
                );

                if (hasSuspiciousPattern) {
                    logSecurityEvent('SUSPICIOUS_FILE_DETECTED', req, { filename });
                    res.status(400).json({
                        message: 'Suspicious file detected. Upload rejected for security reasons.'
                    });
                    return;
                }
            }

            next();
        } catch (error) {
            console.error('Error in file validation:', error);
            res.status(500).json({ message: 'Error validating file upload' });
        }
    };
};

/**
 * Security Headers Middleware
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
    // Enhanced Content Security Policy - Remove unsafe-inline in production
    const isProduction = process.env.NODE_ENV === 'production';

    const cspDirectives = [
        "default-src 'self'",
        isProduction
            ? "script-src 'self' https://fonts.googleapis.com https://apis.google.com"
            : "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://apis.google.com",
        isProduction
            ? "style-src 'self' https://fonts.googleapis.com"
            : "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://api.karmicdd.com https://mvp-01.onrender.com https://karmicdd.netlify.app",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
        "media-src 'self'",
        "worker-src 'self'",
        "manifest-src 'self'"
    ];

    res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

    // Other security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=()');

    // HSTS for HTTPS
    if (req.secure || req.get('X-Forwarded-Proto') === 'https') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    next();
};

/**
 * Input Validation Schemas
 */
export const validationSchemas = {
    // User registration validation
    userRegistration: [
        body('email')
            .isEmail()
            .normalizeEmail()
            .isLength({ max: 254 })
            .withMessage('Valid email is required (max 254 characters)'),
        body('password')
            .isLength({ min: 8, max: 128 })
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
            .withMessage('Password must be 8-128 characters with uppercase, lowercase, number, and special character'),
        body('role')
            .isIn(['startup', 'investor'])
            .withMessage('Role must be either startup or investor'),
        body('fullName')
            .trim()
            .isLength({ min: 2, max: 100 })
            .matches(/^[a-zA-Z\s\-'\.]+$/)
            .withMessage('Full name must be 2-100 characters, letters only')
    ],

    // User login validation
    userLogin: [
        body('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Valid email is required'),
        body('password')
            .exists()
            .isLength({ min: 1 })
            .withMessage('Password is required')
    ],

    // Profile validation
    profileUpdate: [
        body('companyName')
            .optional()
            .trim()
            .isLength({ min: 1, max: 200 })
            .matches(/^[a-zA-Z0-9\s\-&.,()]+$/)
            .withMessage('Company name must be 1-200 characters, alphanumeric only'),
        body('industry')
            .optional()
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('Industry must be specified'),
        body('location')
            .optional()
            .trim()
            .isLength({ max: 200 })
            .matches(/^[a-zA-Z\s\-,\.]+$/)
            .withMessage('Location contains invalid characters'),
        body('pitch')
            .optional()
            .trim()
            .isLength({ max: 5000 })
            .withMessage('Pitch must not exceed 5000 characters'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 2000 })
            .withMessage('Description must not exceed 2000 characters')
    ],

    // Document metadata validation
    documentMetadata: [
        body('description')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Description must not exceed 500 characters'),
        body('documentType')
            .optional()
            .isIn(['financial', 'legal', 'technical', 'other'])
            .withMessage('Invalid document type'),
        body('category')
            .optional()
            .isIn(['financial', 'legal', 'other'])
            .withMessage('Invalid document category'),
        body('isPublic')
            .optional()
            .isBoolean()
            .withMessage('isPublic must be a boolean'),
        body('timePeriod')
            .optional()
            .trim()
            .matches(/^\d{4}(-\d{4})?$/)
            .withMessage('Time period must be in format YYYY or YYYY-YYYY')
    ]
};

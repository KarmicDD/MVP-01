import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import validator from 'validator';
import mongoSanitize from 'express-mongo-sanitize';

// Create a JSDOM window for DOMPurify (Node.js environment)
const window = new JSDOM('').window;
const purify = DOMPurify(window);

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html - HTML content to sanitize
 * @returns Sanitized HTML content
 */
export const sanitizeHTML = (html: string): string => {
    if (!html || typeof html !== 'string') return '';
    // Configure DOMPurify with strict settings
    return purify.sanitize(html, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a', 'span'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false,
        SANITIZE_DOM: true,
        KEEP_CONTENT: true
    });
};

/**
 * Sanitize plain text to prevent script injection
 * @param text - Text to sanitize
 * @returns Sanitized text
 */
export const sanitizeText = (text: string): string => {
    if (!text || typeof text !== 'string') return '';

    return validator.escape(text);
};

/**
 * Sanitize user input for database operations
 * @param input - Input to sanitize
 * @returns Sanitized input
 */
export const sanitizeInput = (input: any): any => {
    if (typeof input === 'string') {
        // Remove potential NoSQL injection attempts and escape the string
        const escaped = validator.escape(input.trim());
        const sanitized = mongoSanitize.sanitize({ value: escaped });
        return (sanitized as any).value;
    }

    if (Array.isArray(input)) {
        return input.map(sanitizeInput);
    }

    if (input && typeof input === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(input)) {
            sanitized[validator.escape(key)] = sanitizeInput(value);
        }
        return sanitized;
    }

    return input;
};

/**
 * Validate and sanitize email addresses
 * @param email - Email to validate and sanitize
 * @returns Sanitized email or null if invalid
 */
export const sanitizeEmail = (email: string): string | null => {
    if (!email || typeof email !== 'string') return null;

    const normalizedEmail = validator.normalizeEmail(email.trim());
    if (!normalizedEmail || !validator.isEmail(normalizedEmail)) return null;

    return normalizedEmail;
};

/**
 * Validate and sanitize URL
 * @param url - URL to validate and sanitize
 * @returns Sanitized URL or null if invalid
 */
export const sanitizeURL = (url: string): string | null => {
    if (!url || typeof url !== 'string') return null;

    const trimmedUrl = url.trim();
    if (!validator.isURL(trimmedUrl, {
        protocols: ['http', 'https'],
        require_protocol: true
    })) return null;

    return validator.escape(trimmedUrl);
};

/**
 * Sanitize file names to prevent path traversal attacks
 * @param filename - Filename to sanitize
 * @returns Sanitized filename
 */
export const sanitizeFilename = (filename: string): string => {
    if (!filename || typeof filename !== 'string') return 'untitled';

    // Remove path separators and dangerous characters
    return filename
        .replace(/[/\\?%*:|"<>]/g, '')
        .replace(/\.\./g, '')
        .trim()
        .substring(0, 255) || 'untitled';
};

/**
 * Validate request body size
 * @param body - Request body
 * @param maxSize - Maximum allowed size in bytes
 * @returns True if within limits
 */
export const validateBodySize = (body: any, maxSize: number = 1024 * 1024): boolean => {
    const bodyString = JSON.stringify(body);
    return Buffer.byteLength(bodyString, 'utf8') <= maxSize;
};

/**
 * Check for suspicious patterns in input
 * @param input - Input to check
 * @returns True if suspicious patterns found
 */
export const hasSuspiciousPatterns = (input: string): boolean => {
    if (!input || typeof input !== 'string') return false;

    const suspiciousPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /onload/gi,
        /onerror/gi,
        /onclick/gi,
        /eval\(/gi,
        /expression\(/gi,
        /url\(/gi,
        /import\(/gi
    ];

    return suspiciousPatterns.some(pattern => pattern.test(input));
};

/**
 * Sanitize object recursively
 * @param obj - Object to sanitize
 * @param depth - Maximum recursion depth
 * @returns Sanitized object
 */
export const sanitizeObject = (obj: any, depth: number = 10): any => {
    if (depth <= 0) return {};

    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
        return sanitizeText(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item, depth - 1));
    }

    if (typeof obj === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
            const sanitizedKey = sanitizeText(key);
            sanitized[sanitizedKey] = sanitizeObject(value, depth - 1);
        }
        return sanitized;
    }

    return obj;
};

/**
 * Rate limiting helper
 * @param identifier - Unique identifier for rate limiting
 * @param maxRequests - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns True if request is allowed
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } => {
    const now = Date.now();
    const key = `${identifier}:${Math.floor(now / windowMs)}`;

    const current = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };

    if (now > current.resetTime) {
        current.count = 0;
        current.resetTime = now + windowMs;
    }

    current.count++;
    rateLimitStore.set(key, current);

    // Cleanup old entries
    for (const [storeKey, value] of rateLimitStore.entries()) {
        if (now > value.resetTime) {
            rateLimitStore.delete(storeKey);
        }
    }

    return {
        allowed: current.count <= maxRequests,
        remaining: Math.max(0, maxRequests - current.count),
        resetTime: current.resetTime
    };
};

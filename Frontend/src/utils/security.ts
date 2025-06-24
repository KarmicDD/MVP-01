import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param html - HTML content to sanitize
 * @returns Sanitized HTML content
 */
export const sanitizeHTML = (html: string): string => {
    if (!html || typeof html !== 'string') return ''; return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a', 'span', 'div'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false,
        SANITIZE_DOM: true,
        KEEP_CONTENT: true
    });
};

/**
 * Sanitize text content to prevent script injection
 * @param text - Text to sanitize
 * @returns Sanitized text
 */
export const sanitizeText = (text: string): string => {
    if (!text || typeof text !== 'string') return '';

    return text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Validate URL to prevent javascript: and data: URIs
 * @param url - URL to validate
 * @returns Sanitized URL or null if invalid
 */
export const validateURL = (url: string): string | null => {
    if (!url || typeof url !== 'string') return null;

    const trimmedUrl = url.trim();

    // Block dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'];
    const lowerUrl = trimmedUrl.toLowerCase();

    if (dangerousProtocols.some(protocol => lowerUrl.startsWith(protocol))) {
        return null;
    }

    // Only allow http, https, and mailto
    if (!/^(https?:\/\/|mailto:)/i.test(trimmedUrl)) {
        return null;
    }

    return trimmedUrl;
};

/**
 * Sanitize user input for display
 * @param input - User input to sanitize
 * @returns Sanitized input
 */
export const sanitizeUserInput = (input: string): string => {
    if (!input || typeof input !== 'string') return '';

    return input
        .trim()
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/vbscript:/gi, '') // Remove vbscript: protocol
        .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Create safe innerHTML replacement
 * @param element - DOM element
 * @param content - Content to set
 */
export const setSafeHTML = (element: HTMLElement, content: string): void => {
    if (!element || !content) return;

    const sanitizedContent = sanitizeHTML(content);
    element.innerHTML = sanitizedContent;
};

/**
 * Create safe text content replacement
 * @param element - DOM element
 * @param content - Text content to set
 */
export const setSafeText = (element: HTMLElement, content: string): void => {
    if (!element || content === undefined || content === null) return;

    element.textContent = String(content);
};

/**
 * Validate and sanitize form data
 * @param formData - Form data object
 * @returns Sanitized form data
 */
export const sanitizeFormData = (formData: Record<string, any>): Record<string, any> => {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(formData)) {
        const sanitizedKey = sanitizeText(key);

        if (typeof value === 'string') {
            sanitized[sanitizedKey] = sanitizeUserInput(value);
        } else if (Array.isArray(value)) {
            sanitized[sanitizedKey] = value.map(item =>
                typeof item === 'string' ? sanitizeUserInput(item) : item
            );
        } else {
            sanitized[sanitizedKey] = value;
        }
    }

    return sanitized;
};

/**
 * Escape HTML entities in strings
 * @param str - String to escape
 * @returns Escaped string
 */
export const escapeHTML = (str: string): string => {
    if (!str || typeof str !== 'string') return '';

    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

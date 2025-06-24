/**
 * Frontend Input Validation Utilities
 * Provides comprehensive validation for form inputs
 */

import { sanitizeText } from './security';

// Validation error interface
export interface ValidationError {
    field: string;
    message: string;
}

// Validation result interface
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

/**
 * Validate user login data
 */
export const validateLogin = (data: {
    email: string;
    password: string;
}): ValidationResult => {
    const errors: ValidationError[] = [];

    // Email validation
    if (!data.email) {
        errors.push({ field: 'email', message: 'Email is required' });
    } else if (!isValidEmail(data.email)) {
        errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }

    // Password validation (basic - just check it exists)
    if (!data.password) {
        errors.push({ field: 'password', message: 'Password is required' });
    } else if (data.password.length < 1) {
        errors.push({ field: 'password', message: 'Password cannot be empty' });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Validate user registration data
 */
export const validateRegistration = (data: {
    fullName: string;
    email: string;
    password: string;
    role: string;
}): ValidationResult => {
    const errors: ValidationError[] = [];

    // Full name validation
    if (!data.fullName || data.fullName.trim().length < 2) {
        errors.push({ field: 'fullName', message: 'Full name must be at least 2 characters long' });
    } else if (data.fullName.length > 100) {
        errors.push({ field: 'fullName', message: 'Full name must not exceed 100 characters' });
    } else if (!/^[a-zA-Z\s\-'\.]+$/.test(data.fullName)) {
        errors.push({ field: 'fullName', message: 'Full name can only contain letters, spaces, hyphens, apostrophes, and periods' });
    }

    // Email validation
    if (!data.email) {
        errors.push({ field: 'email', message: 'Email is required' });
    } else if (!isValidEmail(data.email)) {
        errors.push({ field: 'email', message: 'Please enter a valid email address' });
    } else if (data.email.length > 254) {
        errors.push({ field: 'email', message: 'Email address is too long' });
    }

    // Password validation
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
        if (!passwordValidation.isValidLength) {
            errors.push({ field: 'password', message: 'Password must be 8-128 characters long' });
        }
        if (!passwordValidation.hasUpperCase) {
            errors.push({ field: 'password', message: 'Password must contain at least one uppercase letter' });
        }
        if (!passwordValidation.hasLowerCase) {
            errors.push({ field: 'password', message: 'Password must contain at least one lowercase letter' });
        }
        if (!passwordValidation.hasNumbers) {
            errors.push({ field: 'password', message: 'Password must contain at least one number' });
        }
        if (!passwordValidation.hasSpecialChar) {
            errors.push({ field: 'password', message: 'Password must contain at least one special character' });
        }
    }

    // Role validation
    if (!data.role || !['startup', 'investor'].includes(data.role)) {
        errors.push({ field: 'role', message: 'Please select a valid role' });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Validate profile data
 */
export const validateProfile = (data: any, userType: 'startup' | 'investor'): ValidationResult => {
    const errors: ValidationError[] = [];

    // Common validations
    if (!data.companyName || data.companyName.trim().length === 0) {
        errors.push({ field: 'companyName', message: 'Company name is required' });
    } else if (data.companyName.length > 200) {
        errors.push({ field: 'companyName', message: 'Company name must not exceed 200 characters' });
    } else if (!/^[a-zA-Z0-9\s\-&.,()]+$/.test(data.companyName)) {
        errors.push({ field: 'companyName', message: 'Company name contains invalid characters' });
    }

    // Location validation
    if (data.location && data.location.length > 200) {
        errors.push({ field: 'location', message: 'Location must not exceed 200 characters' });
    } else if (data.location && !/^[a-zA-Z\s\-,\.]+$/.test(data.location)) {
        errors.push({ field: 'location', message: 'Location contains invalid characters' });
    }

    // Pitch/Description validation
    if (data.pitch && data.pitch.length > 5000) {
        errors.push({ field: 'pitch', message: 'Pitch must not exceed 5000 characters' });
    }

    if (data.description && data.description.length > 2000) {
        errors.push({ field: 'description', message: 'Description must not exceed 2000 characters' });
    }

    // Startup-specific validations
    if (userType === 'startup') {
        if (!data.industry) {
            errors.push({ field: 'industry', message: 'Industry is required for startups' });
        }
        if (!data.fundingStage) {
            errors.push({ field: 'fundingStage', message: 'Funding stage is required for startups' });
        }
    }

    // Investor-specific validations
    if (userType === 'investor') {
        if (!data.industriesOfInterest || data.industriesOfInterest.length === 0) {
            errors.push({ field: 'industriesOfInterest', message: 'At least one industry of interest is required' });
        }
        if (!data.preferredStages || data.preferredStages.length === 0) {
            errors.push({ field: 'preferredStages', message: 'At least one preferred funding stage is required' });
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Validate document metadata
 */
export const validateDocumentMetadata = (data: {
    description?: string;
    documentType?: string;
    category?: string;
    timePeriod?: string;
}): ValidationResult => {
    const errors: ValidationError[] = [];

    // Description validation
    if (data.description && data.description.length > 500) {
        errors.push({ field: 'description', message: 'Description must not exceed 500 characters' });
    }

    // Document type validation
    const validDocumentTypes = ['financial', 'legal', 'technical', 'other'];
    if (data.documentType && !validDocumentTypes.includes(data.documentType)) {
        errors.push({ field: 'documentType', message: 'Invalid document type' });
    }

    // Category validation
    const validCategories = ['financial', 'legal', 'other'];
    if (data.category && !validCategories.includes(data.category)) {
        errors.push({ field: 'category', message: 'Invalid document category' });
    }

    // Time period validation (YYYY or YYYY-YYYY format)
    if (data.timePeriod && !/^\d{4}(-\d{4})?$/.test(data.timePeriod)) {
        errors.push({ field: 'timePeriod', message: 'Time period must be in format YYYY or YYYY-YYYY' });
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string) => {
    const minLength = 8;
    const maxLength = 128;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isValidLength = password.length >= minLength && password.length <= maxLength;

    const score = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar, isValidLength].filter(Boolean).length;

    return {
        isValid: score >= 4,
        score,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar,
        isValidLength,
        strength: score <= 2 ? 'weak' : score === 3 ? 'medium' : score === 4 ? 'strong' : 'very-strong'
    };
};

/**
 * Sanitize and validate input before API submission
 */
export const sanitizeAndValidateInput = (input: any): any => {
    if (typeof input === 'string') {
        const sanitized = sanitizeText(input).trim();
        // Check for suspicious content
        if (hasSuspiciousContent(sanitized)) {
            throw new Error('Invalid input detected');
        }
        return sanitized;
    }

    if (Array.isArray(input)) {
        return input.map(item => sanitizeAndValidateInput(item));
    }

    if (input && typeof input === 'object') {
        const sanitized: any = {};
        for (const key in input) {
            if (input.hasOwnProperty(key)) {
                const sanitizedKey = sanitizeText(key);
                sanitized[sanitizedKey] = sanitizeAndValidateInput(input[key]);
            }
        }
        return sanitized;
    }

    return input;
};

/**
 * Check if content contains suspicious patterns
 */
export const hasSuspiciousContent = (content: string): boolean => {
    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /vbscript:/i,
        /on\w+\s*=/i,
        /data:text\/html/i,
        /eval\s*\(/i,
        /expression\s*\(/i,
        /<iframe/i,
        /<object/i,
        /<embed/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(content));
};

/**
 * Real-time validation for form fields
 */
export const createFieldValidator = (field: string, rules: any) => {
    return (value: any) => {
        const errors: string[] = [];

        // Required validation
        if (rules.required && (!value || (typeof value === 'string' && value.trim().length === 0))) {
            errors.push(`${field} is required`);
            return errors;
        }

        // Skip other validations if field is empty and not required
        if (!value || (typeof value === 'string' && value.trim().length === 0)) {
            return errors;
        }

        // Length validation
        if (rules.minLength && value.length < rules.minLength) {
            errors.push(`${field} must be at least ${rules.minLength} characters long`);
        }

        if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(`${field} must not exceed ${rules.maxLength} characters`);
        }

        // Pattern validation
        if (rules.pattern && !rules.pattern.test(value)) {
            errors.push(rules.patternMessage || `${field} format is invalid`);
        }

        // Email validation
        if (rules.isEmail && !isValidEmail(value)) {
            errors.push('Please enter a valid email address');
        }

        // Custom validation
        if (rules.custom && typeof rules.custom === 'function') {
            const customResult = rules.custom(value);
            if (customResult !== true) {
                errors.push(customResult || `${field} is invalid`);
            }
        }

        return errors;
    };
};

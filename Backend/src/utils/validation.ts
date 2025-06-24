import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { sanitizeInput, sanitizeEmail } from './security';

/**
 * Validation schemas for different endpoints
 */

// Auth validation schemas
export const authSchemas = {
    register: Joi.object({
        email: Joi.string()
            .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'edu', 'gov', 'co', 'io'] } })
            .required()
            .max(100)
            .trim()
            .lowercase(),
        password: Joi.string()
            .min(8)
            .max(128)
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])'))
            .required()
            .messages({
                'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
            }),
        role: Joi.string()
            .valid('startup', 'investor')
            .required(),
        fullName: Joi.string()
            .min(2)
            .max(50)
            .pattern(/^[a-zA-Z\s]+$/)
            .trim()
            .required()
            .messages({
                'string.pattern.base': 'Full name can only contain letters and spaces'
            })
    }),

    login: Joi.object({
        email: Joi.string()
            .email()
            .required()
            .max(100)
            .trim()
            .lowercase(),
        password: Joi.string()
            .min(1)
            .max(128)
            .required()
    }),

    updateRole: Joi.object({
        userId: Joi.string()
            .guid({ version: 'uuidv4' })
            .required(),
        role: Joi.string()
            .valid('startup', 'investor')
            .required()
    })
};

// Profile validation schemas
export const profileSchemas = {
    startup: Joi.object({
        companyName: Joi.string()
            .min(2)
            .max(100)
            .trim()
            .required(),
        industry: Joi.string()
            .max(50)
            .trim()
            .required(),
        fundingStage: Joi.string()
            .valid('pre-seed', 'seed', 'series-a', 'series-b', 'series-c', 'growth', 'ipo')
            .required(),
        employeeCount: Joi.string()
            .valid('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')
            .required(),
        location: Joi.string()
            .max(100)
            .trim()
            .required(),
        pitch: Joi.string()
            .max(1000)
            .trim()
            .required(),
        website: Joi.string()
            .uri({ scheme: ['http', 'https'] })
            .max(200)
            .optional(),
        foundedYear: Joi.number()
            .integer()
            .min(1900)
            .max(new Date().getFullYear())
            .optional()
    }),

    investor: Joi.object({
        companyName: Joi.string()
            .min(2)
            .max(100)
            .trim()
            .required(),
        industriesOfInterest: Joi.array()
            .items(Joi.string().max(50))
            .min(1)
            .max(10)
            .required(),
        preferredStages: Joi.array()
            .items(Joi.string().valid('pre-seed', 'seed', 'series-a', 'series-b', 'series-c', 'growth', 'ipo'))
            .min(1)
            .max(7)
            .required(),
        ticketSize: Joi.string()
            .valid('under-100k', '100k-500k', '500k-1m', '1m-5m', '5m-10m', '10m+')
            .required(),
        investmentCriteria: Joi.array()
            .items(Joi.string().max(100))
            .min(1)
            .max(10)
            .required(),
        pastInvestments: Joi.string()
            .max(2000)
            .trim()
            .allow('')
            .optional()
    }),

    extendedProfile: Joi.object({
        bio: Joi.string()
            .max(500)
            .trim()
            .allow('')
            .optional(),
        socialLinks: Joi.array()
            .items(Joi.object({
                platform: Joi.string()
                    .valid('linkedin', 'twitter', 'facebook', 'website', 'github', 'instagram')
                    .required(),
                url: Joi.string()
                    .uri({ scheme: ['http', 'https'] })
                    .max(200)
                    .required()
            }))
            .max(5)
            .optional(),
        teamMembers: Joi.array()
            .items(Joi.object({
                name: Joi.string()
                    .min(2)
                    .max(50)
                    .pattern(/^[a-zA-Z\s]+$/)
                    .trim()
                    .required(),
                position: Joi.string()
                    .max(50)
                    .trim()
                    .required(),
                linkedin: Joi.string()
                    .uri({ scheme: ['http', 'https'] })
                    .max(200)
                    .optional()
            }))
            .max(10)
            .optional(),
        investmentHistory: Joi.array()
            .items(Joi.object({
                companyName: Joi.string()
                    .min(2)
                    .max(100)
                    .trim()
                    .required(),
                amount: Joi.string()
                    .max(50)
                    .optional(),
                stage: Joi.string()
                    .max(50)
                    .optional(),
                year: Joi.number()
                    .integer()
                    .min(2000)
                    .max(new Date().getFullYear())
                    .optional()
            }))
            .max(20)
            .optional()
    })
};

// Document validation schemas
export const documentSchemas = {
    upload: Joi.object({
        description: Joi.string()
            .max(500)
            .trim()
            .allow('')
            .optional(),
        documentType: Joi.string()
            .valid('financial', 'legal', 'technical', 'business', 'other')
            .required(),
        category: Joi.string()
            .valid('financial', 'legal', 'other')
            .required(),
        isPublic: Joi.boolean()
            .default(false),
        timePeriod: Joi.string()
            .max(50)
            .trim()
            .allow('')
            .optional()
    }),

    share: Joi.object({
        emailAddresses: Joi.array()
            .items(Joi.string().email())
            .min(1)
            .max(10)
            .required(),
        customUrl: Joi.string()
            .uri({ scheme: ['http', 'https'] })
            .max(200)
            .optional(),
        shareMethod: Joi.string()
            .valid('email', 'link')
            .default('email')
    })
};

// Questionnaire validation schemas
export const questionnaireSchemas = {
    responses: Joi.object({
        responses: Joi.object()
            .pattern(
                Joi.string(),
                Joi.alternatives().try(
                    Joi.string().max(1000),
                    Joi.number(),
                    Joi.boolean(),
                    Joi.array().items(Joi.string().max(100)).max(10)
                )
            )
            .required()
    })
};

// Financial analysis validation schemas
export const financialSchemas = {
    generate: Joi.object({
        documentIds: Joi.array()
            .items(Joi.string().guid({ version: 'uuidv4' }))
            .min(1)
            .max(20)
            .required(),
        companyName: Joi.string()
            .min(2)
            .max(100)
            .trim()
            .required(),
        reportType: Joi.string()
            .valid('basic', 'detailed', 'comprehensive')
            .default('basic'),
        additionalDataSources: Joi.array()
            .items(Joi.string().max(200))
            .max(5)
            .optional()
    }),

    share: Joi.object({
        emails: Joi.array()
            .items(Joi.string().email())
            .min(1)
            .max(10)
            .required()
    })
};

// Task validation schemas
export const taskSchemas = {
    create: Joi.object({
        title: Joi.string()
            .min(3)
            .max(200)
            .trim()
            .required(),
        description: Joi.string()
            .max(1000)
            .trim()
            .allow('')
            .optional(),
        dueDate: Joi.date()
            .iso()
            .min('now')
            .optional(),
        priority: Joi.string()
            .valid('low', 'medium', 'high', 'urgent')
            .default('medium'),
        category: Joi.string()
            .valid('financial', 'legal', 'technical', 'business', 'other')
            .default('other')
    }),

    update: Joi.object({
        title: Joi.string()
            .min(3)
            .max(200)
            .trim()
            .optional(),
        description: Joi.string()
            .max(1000)
            .trim()
            .allow('')
            .optional(),
        dueDate: Joi.date()
            .iso()
            .optional(),
        priority: Joi.string()
            .valid('low', 'medium', 'high', 'urgent')
            .optional(),
        completed: Joi.boolean()
            .optional(),
        category: Joi.string()
            .valid('financial', 'legal', 'technical', 'business', 'other')
            .optional()
    })
};

/**
 * Validation middleware factory
 * @param schema - Joi schema to validate against
 * @param property - Request property to validate (body, query, params)
 * @returns Express middleware function
 */
export const validateRequest = (
    schema: Joi.ObjectSchema,
    property: 'body' | 'query' | 'params' = 'body'
) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            // Sanitize input before validation
            const dataToValidate = sanitizeInput(req[property]);

            const { error, value } = schema.validate(dataToValidate, {
                abortEarly: false,
                stripUnknown: true,
                convert: true
            });

            if (error) {
                const errors = error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                    value: detail.context?.value
                }));

                res.status(400).json({
                    message: 'Validation failed',
                    errors: errors
                });
                return;
            }

            // Replace the request property with the validated and sanitized data
            req[property] = value;
            next();
        } catch (err) {
            console.error('Validation middleware error:', err);
            res.status(500).json({
                message: 'Internal validation error'
            });
        }
    };
};

/**
 * File validation helper
 * @param file - Uploaded file object
 * @returns Validation result
 */
export const validateFile = (file: any): { valid: boolean; error?: string } => {
    if (!file) {
        return { valid: false, error: 'No file provided' };
    }

    // File size validation (15MB max)
    const maxSize = 15 * 1024 * 1024;
    if (file.size > maxSize) {
        return { valid: false, error: 'File size exceeds 15MB limit' };
    }

    // File type validation
    const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
        return { valid: false, error: 'Invalid file type. Only PDF, Word, PowerPoint, Excel, images, and text files are allowed' };
    }

    // Filename validation
    if (file.originalname && file.originalname.length > 255) {
        return { valid: false, error: 'Filename too long (max 255 characters)' };
    }

    return { valid: true };
};

/**
 * Custom validation for specific business rules
 */
export const customValidations = {
    /**
     * Validate company name uniqueness
     * @param companyName - Company name to validate
     * @param userId - Current user ID (to exclude from check)
     * @returns Promise<boolean>
     */
    isCompanyNameUnique: async (companyName: string, userId: string): Promise<boolean> => {
        // This would typically check against the database
        // Implementation depends on your database layer
        return true; // Placeholder
    },

    /**
     * Validate email domain whitelist
     * @param email - Email to validate
     * @returns boolean
     */
    isEmailDomainAllowed: (email: string): boolean => {
        // Add any domain restrictions here
        const blockedDomains = ['tempmail.com', '10minutemail.com'];
        const domain = email.split('@')[1]?.toLowerCase();
        return !blockedDomains.includes(domain);
    },

    /**
     * Validate investment amount format
     * @param amount - Investment amount string
     * @returns boolean
     */
    isValidInvestmentAmount: (amount: string): boolean => {
        const pattern = /^[\d,]+[km]?$/i;
        return pattern.test(amount.trim());
    }
};

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import errorHandler from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';

// Enhanced Security middleware imports
import {
    sanitizeInput,
    mongoSanitizeMiddleware,
    generalRateLimit,
    securityHeaders,
    logSecurityEvent,
    csrfTokenRateLimit
} from './middleware/security';

// CSRF protection middleware
import { csrfProtection, getCSRFToken } from './middleware/csrf';

// Session configuration
import { createSessionConfig } from './config/session';

// Routes import
import routes from './routes';

import { countRequest, statsMiddleware, trackTime } from './utils/logs';
import { specs } from './config/swagger';
import logger from './utils/logger';

/**
 * Create and configure Express application
 * @returns Configured Express application
 */
export const createApp = (): Application => {
    const app: Application = express();

    // Enhanced Security Headers (must be first)
    app.use(securityHeaders);

    // Enhanced Helmet configuration
    app.use(helmet({
        contentSecurityPolicy: false, // We handle this in securityHeaders
        crossOriginEmbedderPolicy: false,
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        }
    }));

    // Global rate limiting
    app.use(generalRateLimit);

    // Input sanitization (critical for XSS prevention)
    app.use(sanitizeInput);

    // NoSQL injection prevention
    app.use(mongoSanitizeMiddleware);

    // Body parsing with security limits
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '2mb' }));
    app.use(cookieParser());

    // Session configuration for CSRF protection
    app.use(session(createSessionConfig()));

    // CORS Configuration
    const corsOptions = {
        origin: function (origin: string | undefined, callback: Function) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            const allowedOrigins = [
                'https://karmicdd.netlify.app',
                'http://localhost:5173',
                'http://localhost:3000',
                'http://127.0.0.1:5173'
            ];

            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                console.warn(`CORS blocked origin: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
        maxAge: 86400 // 24 hours
    };
    app.use(cors(corsOptions));

    // Handle CORS Preflight Requests
    app.options('*', cors(corsOptions)); // Ensure preflight requests also use these options

    // CSRF Protection (after session and before routes)
    logger.info('Applying CSRF protection middleware', {}, 'SECURITY');
    app.use(csrfProtection);

    // CSRF token endpoint
    logger.info('Setting up CSRF token endpoint', { endpoint: '/api/csrf-token' }, 'SECURITY');
    app.get('/api/csrf-token', csrfTokenRateLimit, getCSRFToken);

    // Custom middlewares
    app.use(countRequest);
    app.use(trackTime);

    // Swagger API Documentation
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

    // Define Routes
    logger.info('Registering API routes', { basePath: '/api' }, 'ROUTE_SETUP');
    app.use('/api', routes);

    // Add a test endpoint to verify the server is working
    app.get('/api/test', (req: Request, res: Response) => {
        logger.info('Test endpoint accessed', {
            method: req.method,
            path: req.path,
            ip: req.ip,
            userAgent: req.get('User-Agent')?.substring(0, 50)
        }, 'TEST_ENDPOINT');
        res.json({
            message: 'API is working',
            timestamp: new Date().toISOString(),
            path: req.path,
            method: req.method
        });
    });

    // Statistics endpoint
    app.get('/api/stats', statsMiddleware);

    app.get('/', (req: Request, res: Response) => {
        res.json({
            message: 'Welcome to KarmicDD API',
            documentation: '/api-docs'
        });
    });

    // Error handler middleware
    app.use(errorHandler);

    return app;
};

export default createApp;

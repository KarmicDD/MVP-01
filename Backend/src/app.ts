import express, { Application, Request, Response } from 'express';
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
    logSecurityEvent
} from './middleware/security';

// CSRF protection middleware
import { csrfProtection, getCSRFToken } from './middleware/csrf';

// Routes import
import routes from './routes';

import { countRequest, statsMiddleware, trackTime } from './utils/logs';
import { specs } from './config/swagger';

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

    // Session management
    app.use(session({
        secret: process.env.SESSION_SECRET || 'default_secret',
        resave: false,
        saveUninitialized: true,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Set to true in production
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    }));

    // Session configuration for CSRF protection
    app.use(session({
        secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
            httpOnly: true, // Prevent XSS attacks
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'strict' // CSRF protection
        },
        name: 'karmicDD.sid' // Don't use default session name
    }));

    // CORS Configuration
    const corsOptions = {
        origin: ['https://karmicdd.netlify.app', 'http://localhost:5173'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
        maxAge: 86400 // 24 hours
    };
    app.use(cors(corsOptions));

    // Handle CORS Preflight Requests
    app.options('*', cors(corsOptions)); // Ensure preflight requests also use these options

    // CSRF Protection (after session and before routes)
    app.use(csrfProtection);

    // CSRF token endpoint
    app.get('/api/csrf-token', getCSRFToken);

    // Custom middlewares
    app.use(countRequest);
    app.use(trackTime);

    // Swagger API Documentation
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

    // Define Routes
    app.use('/api', routes);

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

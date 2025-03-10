import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/errorHandler';
import dotenv from 'dotenv';

// Routes import
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import profileRoutes from './routes/profileRoutes';
import matchingRoutes from './routes/matchingRoutes';
import compatiblityRoutes from './routes/compatibilityControllerRoutes';
import questionnaireRoutes from './routes/questionnaireRoute';
import beliefSystemRoutes from './routes/BelifSystemRoutes';
import emailRoutes from './routes/emailRoutes';
import searchRoutes from './routes/searchRoutes';

import { connectMongoDBwithRetry, testPostgressConnection } from './config/db';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const startServer = async () => {
    try {
        // Initialize database connections with retry logic
        await Promise.all([
            testPostgressConnection(),
            connectMongoDBwithRetry()
        ]);

        // Initialize app after successful DB connections
        const app: Application = express();
        const PORT = process.env.PORT || 5000;

        // Middleware setup
        app.use(helmet());
        app.use(express.json());
        app.use(cookieParser());

        // CORS Configuration
        app.use(cors({
            origin: ['https://karmicdd.netlify.app', 'http://localhost:5173'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }));

        // Handle CORS Preflight Requests
        app.options('*', cors());

        // Debugging CORS headers (Optional, remove in production)
        app.use((req: Request, res: Response, next: NextFunction) => {
            const allowedOrigins = ['https://karmicdd.netlify.app', 'http://localhost:5173'];
            const origin = req.headers.origin as string;
            if (allowedOrigins.includes(origin)) {
                res.header('Access-Control-Allow-Origin', origin);
            }
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            next();
        });

        // Define Routes  
        app.use('/api/auth', authRoutes);
        app.use('/api/users', userRoutes);
        app.use('/api/profile', profileRoutes);
        app.use('/api/matching', matchingRoutes);
        app.use('/api/score', compatiblityRoutes);
        app.use('/api/questionnaire', questionnaireRoutes);
        app.use('/api/analysis', beliefSystemRoutes);
        app.use('/api/email', emailRoutes);
        app.use('/api/search', searchRoutes);

        // Error handler middleware
        app.use(errorHandler);

        // Start server
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });

    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

// Start the server
startServer();

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

        // Middleware (existing setup preserved)
        app.use(helmet());
        app.use(cors({
            origin: [process.env.FRONTEND_URL || '', 'http://localhost:5173'],
            credentials: true
        }));
        app.use(express.json());
        app.use(cookieParser());

        // Existing routes  
        app.use('/api/auth', authRoutes);
        app.use('/api/users', userRoutes);
        app.use('/api/profile', profileRoutes);
        app.use('/api/matching', matchingRoutes);
        app.use('/api/score', compatiblityRoutes);
        app.use('/api/questionnaire', questionnaireRoutes);
        app.use('/api/analysis', beliefSystemRoutes);
        // Existing error handler
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

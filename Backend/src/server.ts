import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/errorHandler';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

// Routes import
import routes from './routes';

import { connectMongoDBwithRetry, testPostgressConnection } from './config/db';
import RecommendationService from './services/RecommendationService';
import { resolve } from 'path';
import { countRequest, statsMiddleware, trackTime } from './utils/logs';
import { specs } from './config/swagger';
import { emptyDirectoryContents } from './utils/fileUtils';
import * as path from 'path';

dotenv.config({ path: resolve(__dirname, '../.env') });

const startServer = async () => {
    try {
        // Clean up directories on startup
        const logsDir = path.join(__dirname, '..', 'logs');
        const ocrOutputDir = path.join(__dirname, '..', 'ocr_outputs');
        await emptyDirectoryContents(logsDir);
        await emptyDirectoryContents(ocrOutputDir);

        // Initialize database connections with retry logic
        await Promise.all([
            testPostgressConnection(),
            connectMongoDBwithRetry()
        ]);

        // Test MongoDB connection for recommendations
        try {
            const mongoTestResult = await RecommendationService.testMongoDBConnection();
            if (mongoTestResult) {
                console.log('MongoDB recommendation test successful');
            } else {
                console.warn('MongoDB recommendation test failed, recommendations may not be saved properly');
            }
        } catch (error) {
            console.error('Error testing MongoDB recommendation connection:', error);
        }

        // Initialize app after successful DB connections
        const app: Application = express();
        const PORT = process.env.PORT || 5000;

        // Middleware setup
        app.use(helmet());
        app.use(express.json());
        app.use(cookieParser());

        // CORS Configuration
        const corsOptions = {
            origin: ['https://karmicdd.netlify.app', 'http://localhost:5173'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        };
        app.use(cors(corsOptions));

        // Handle CORS Preflight Requests
        app.options('*', cors(corsOptions)); // Ensure preflight requests also use these options

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

        // Start server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`API available at: http://localhost:${PORT}`);
        });

    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

// Start the server
startServer();

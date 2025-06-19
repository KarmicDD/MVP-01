import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';

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

    return app;
};

export default createApp;

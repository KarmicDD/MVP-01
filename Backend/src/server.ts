import dotenv from 'dotenv';
import { resolve } from 'path';
import * as path from 'path';

import { connectMongoDBwithRetry, testPostgressConnection } from './config/db';
import RecommendationService from './services/RecommendationService';
import { emptyDirectoryContents } from './utils/fileUtils';
import { createApp } from './app';
import logger from './utils/logger';

dotenv.config({ path: resolve(__dirname, '../.env') });

const startServer = async () => {
    try {
        logger.system('[SYSTEM] KarmicDD Server startup initiated', {
            nodeVersion: process.version,
            environment: process.env.NODE_ENV || 'development',
            port: process.env.PORT || 5000
        });

        // Clean up directories on startup
        const logsDir = path.join(__dirname, '..', 'logs');
        const ocrOutputDir = path.join(__dirname, '..', 'ocr_outputs');

        logger.info('[SYSTEM] Performing directory cleanup on startup', {
            logsDir,
            ocrOutputDir
        });

        await emptyDirectoryContents(logsDir);
        await emptyDirectoryContents(ocrOutputDir);

        // Initialize database connections with retry logic
        logger.info('[DATABASE] Beginning database connection initialization...');

        await Promise.all([
            testPostgressConnection(),
            connectMongoDBwithRetry()
        ]);

        logger.success('[DATABASE] All database connections established successfully');

        // Test MongoDB connection for recommendations
        try {
            logger.info('[DATABASE] Verifying MongoDB recommendation service connectivity...');
            const mongoTestResult = await RecommendationService.testMongoDBConnection();
            if (mongoTestResult) {
                logger.success('[DATABASE] MongoDB recommendation service test passed');
            } else {
                logger.warn('[DATABASE] MongoDB recommendation service test failed', {
                    impact: 'Recommendations may not be saved properly'
                });
            }
        } catch (error: any) {
            logger.error('[DATABASE] Error occurred while testing MongoDB recommendation service', {
                error: error.message,
                stack: error.stack
            });
        }

        // Initialize app after successful DB connections
        logger.info('[SYSTEM] Initializing Express application instance...');
        const app = createApp();
        const PORT = process.env.PORT || 5000;

        // Start server
        const server = app.listen(PORT, () => {
            logger.system('[SYSTEM] KarmicDD Server started successfully', {
                port: PORT,
                environment: process.env.NODE_ENV || 'development',
                apiUrl: `http://localhost:${PORT}`,
                docsUrl: `http://localhost:${PORT}/api-docs`,
                timestamp: new Date().toISOString()
            });
        });

        // Export for testing
        module.exports = { app, server };
        return { app, server };

    } catch (err: any) {
        logger.error('[SYSTEM] Failed to start server', {
            error: err.message,
            stack: err.stack
        });
        process.exit(1);
    }
};

// Start the server only if this file is run directly
if (require.main === module) {
    startServer();
}

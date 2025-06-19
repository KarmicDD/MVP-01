import dotenv from 'dotenv';
import { resolve } from 'path';
import * as path from 'path';

import { connectMongoDBwithRetry, testPostgressConnection } from './config/db';
import RecommendationService from './services/RecommendationService';
import { emptyDirectoryContents } from './utils/fileUtils';
import { createApp } from './app';

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
        }        // Initialize app after successful DB connections
        const app = createApp();
        const PORT = process.env.PORT || 5000;

        // Start server
        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`API available at: http://localhost:${PORT}`);
        });

        // Export for testing
        module.exports = { app, server };
        return { app, server };

    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

// Start the server only if this file is run directly
if (require.main === module) {
    startServer();
}

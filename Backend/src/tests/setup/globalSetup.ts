import dotenv from 'dotenv';
import path from 'path';

// Global setup that runs once before all tests
export default async function globalSetup() {
    // Force load test environment variables
    const testEnvPath = path.join(__dirname, '../../../.env.test');
    dotenv.config({ path: testEnvPath, override: true });

    // Ensure NODE_ENV is set to test
    process.env.NODE_ENV = 'test';

    console.log('Test environment configured');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL contains neondb:', process.env.DATABASE_URL?.includes('neondb'));
    console.log('MONGODB_URI contains test:', process.env.MONGODB_URI?.includes('test'));
}

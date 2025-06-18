import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';

let prisma: PrismaClient | null = null;
let mongoConnectionString: string = '';

/**
 * Setup test databases - PostgreSQL and MongoDB
 */
export async function setupTestDatabases() {
    // Setup Prisma test database
    prisma = new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL
            }
        }
    });

    // Connect to test database
    await prisma.$connect();

    // Setup MongoDB test connection
    mongoConnectionString = process.env.MONGODB_URL || 'mongodb://localhost:27018/karmicdd_test';

    // Connect to MongoDB test instance
    await mongoose.connect(mongoConnectionString);

    return { prisma };
}

/**
 * Clean all test data from databases
 */
export async function cleanTestDatabases() {
    if (prisma) {
        // Clean PostgreSQL tables in correct order due to foreign key constraints
        await prisma.profileShareAnalytics.deleteMany();
        await prisma.profileShare.deleteMany();
        await prisma.documentDownload.deleteMany();
        await prisma.documentView.deleteMany();
        await prisma.user.deleteMany();
    }
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
        // Clean MongoDB collections
        const collections = await mongoose.connection.db.collections();
        for (const collection of collections) {
            await collection.deleteMany({});
        }
    }
}

/**
 * Teardown test databases
 */
export async function teardownTestDatabases() {
    if (prisma) {
        await prisma.$disconnect();
    }

    if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
    }
}

/**
 * Reset databases to clean state
 */
export async function resetTestDatabases() {
    await cleanTestDatabases();
    await seedTestData();
}

/**
 * Seed test data for consistent testing
 */
export async function seedTestData() {
    if (!prisma) return;

    // Create test users
    const testUser1 = await prisma.user.create({
        data: {
            user_id: 'test-user-1',
            email: 'test1@example.com',
            password_hash: 'hashed_password_1',
            role: 'startup',
            created_at: new Date(),
            updated_at: new Date()
        }
    });

    const testUser2 = await prisma.user.create({
        data: {
            user_id: 'test-user-2',
            email: 'test2@example.com',
            password_hash: 'hashed_password_2',
            role: 'investor',
            created_at: new Date(),
            updated_at: new Date()
        }
    });

    // Create test profile shares
    await prisma.profileShare.create({
        data: {
            user_id: testUser1.user_id,
            share_token: 'test-share-token-1',
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            view_count: 0,
            share_method: 'email'
        }
    });

    return { testUser1, testUser2 };
}

export { prisma };
export default {
    setupTestDatabases,
    cleanTestDatabases,
    teardownTestDatabases,
    resetTestDatabases,
    seedTestData,
    get prisma() { return prisma; }
};

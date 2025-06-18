/**
 * Test Database Seeder Script
 * This script seeds the test databases with consistent test data
 */

import { PrismaClient } from '@prisma/client';
import { TestDatabaseSeeder } from '../utils/testDatabaseSeeder';
import dotenv from 'dotenv';
import path from 'path';

// Force load test environment variables
const testEnvPath = path.join(__dirname, '../../../.env.test');
dotenv.config({ path: testEnvPath, override: true });

// Ensure we're in test environment
process.env.NODE_ENV = 'test';

async function seedTestData() {
    console.log('🌱 Starting test database seeding...');

    const prisma = new PrismaClient();
    let seeder: TestDatabaseSeeder;

    try {
        // Initialize seeder
        seeder = new TestDatabaseSeeder(prisma);

        console.log('📊 Connecting to MongoDB...');
        await seeder.connectMongoDB();

        console.log('🧹 Cleaning existing test data...');
        await seeder.cleanup();

        console.log('👥 Seeding test users...');
        await seeder.seedTestUsers();

        console.log('🏢 Seeding startup profiles...');
        await seeder.seedTestStartupProfiles();

        console.log('💼 Seeding investor profiles...');
        await seeder.seedTestInvestorProfiles();

        console.log('📄 Seeding profile shares...');
        await seeder.seedTestProfileShares();

        console.log('💡 Seeding recommendations...');
        await seeder.seedTestRecommendations();

        console.log('✅ Test database seeding completed successfully!');
        console.log('📈 Test data summary:');
        console.log('   - Users: 6 (3 startups, 3 investors)');
        console.log('   - Startup Profiles: 3');
        console.log('   - Investor Profiles: 3');
        console.log('   - Profile Shares: 2');
        console.log('   - Recommendations: Available');

    } catch (error) {
        console.error('❌ Error seeding test data:', error);
        process.exit(1);
    } finally {
        if (seeder!) {
            await seeder.cleanup();
        }
        await prisma.$disconnect();
        console.log('🔌 Database connections closed');
    }
}

// Run seeding if this script is executed directly
if (require.main === module) {
    seedTestData()
        .then(() => {
            console.log('🎉 Seeding process finished');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Seeding process failed:', error);
            process.exit(1);
        });
}

export default seedTestData;

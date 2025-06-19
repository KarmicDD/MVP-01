import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { MongoClient, Db } from 'mongodb';

export class TestDatabaseSeeder {
    private prisma: PrismaClient;
    private mongodb: Db | null = null;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async connectMongoDB() {
        if (!this.mongodb) {
            const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27018/karmicdd_test');
            await client.connect();
            this.mongodb = client.db();
        }
        return this.mongodb;
    }

    async cleanup() {
        console.log('Cleaning up test database...');
        try {
            // Delete from tables with foreign keys first
            await this.prisma.profileShare.deleteMany({});
            await this.prisma.user.deleteMany({});

            const mongodb = await this.connectMongoDB();
            if (mongodb) {
                await mongodb.collection('startupprofiles').deleteMany({});
                await mongodb.collection('investorprofiles').deleteMany({});
                await mongodb.collection('recommendations').deleteMany({});
            }
            console.log('Test database cleaned up successfully.');
        } catch (error) {
            console.error('Error cleaning up test database:', error);
        }
    }

    async seedTestUsers() {
        const hashedPassword = await bcrypt.hash('testpassword123', 10);

        const users = [
            {
                user_id: 'test-startup-1',
                email: 'startup1@test.com',
                password_hash: hashedPassword,
                role: 'startup',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                user_id: 'test-startup-2',
                email: 'startup2@test.com',
                password_hash: hashedPassword,
                role: 'startup',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                user_id: 'test-investor-1',
                email: 'investor1@test.com',
                password_hash: hashedPassword,
                role: 'investor',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                user_id: 'test-investor-2',
                email: 'investor2@test.com',
                password_hash: hashedPassword,
                role: 'investor',
                created_at: new Date(),
                updated_at: new Date()
            }
        ]; for (const user of users) {
            await this.prisma.user.upsert({
                where: { email: user.email },
                update: user,
                create: user
            });
        }

        return users;
    }
    async seedTestStartupProfiles() {
        const mongodb = await this.connectMongoDB();

        const profiles = [
            {
                userId: 'test-startup-1',
                companyName: 'Test Startup One',
                industry: 'Technology',
                fundingStage: 'seed',
                employeeCount: '1-10',
                location: 'San Francisco, CA',
                pitch: 'A test startup for unit testing revolutionary technology solutions',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 'test-startup-2',
                companyName: 'Test Startup Two',
                industry: 'Healthcare',
                fundingStage: 'series-a',
                employeeCount: '11-50',
                location: 'New York, NY',
                pitch: 'Another test startup focused on healthcare innovation',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await mongodb.collection('startupprofiles').deleteMany({ userId: { $in: ['test-startup-1', 'test-startup-2'] } });
        await mongodb.collection('startupprofiles').insertMany(profiles);

        return profiles;
    }
    async seedTestInvestorProfiles() {
        const mongodb = await this.connectMongoDB();

        const profiles = [
            {
                userId: 'test-investor-1',
                companyName: 'Test VC Firm',
                industriesOfInterest: ['Technology', 'SaaS'],
                preferredStages: ['seed', 'series-a'],
                ticketSize: '₹50L - ₹2Cr',
                investmentCriteria: ['Strong team', 'Market potential'],
                pastInvestments: 'Previously invested in 10+ startups',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 'test-investor-2',
                companyName: 'Test Angel Group',
                industriesOfInterest: ['Healthcare', 'Biotech'],
                preferredStages: ['pre-seed', 'seed'],
                ticketSize: '₹10L - ₹50L',
                investmentCriteria: ['Innovation', 'Scalability'],
                pastInvestments: 'Angel investor with 15+ investments',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await mongodb.collection('investorprofiles').deleteMany({ userId: { $in: ['test-investor-1', 'test-investor-2'] } });
        await mongodb.collection('investorprofiles').insertMany(profiles);

        return profiles;
    }

    async seedTestRecommendations() {
        const mongodb = await this.connectMongoDB();

        const recommendations = [
            {
                userId: 'test-startup-1',
                recommendedUserId: 'test-investor-1',
                score: 85,
                reasons: ['Industry match', 'Investment range fit'],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 'test-startup-1',
                recommendedUserId: 'test-investor-2',
                score: 72,
                reasons: ['Location proximity'],
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                userId: 'test-investor-1',
                recommendedUserId: 'test-startup-1',
                score: 88,
                reasons: ['Strong team', 'Market opportunity'],
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await mongodb.collection('recommendations').deleteMany({}); // Clear existing
        await mongodb.collection('recommendations').insertMany(recommendations);

        return recommendations;
    }

    async seedTestProfileShares() {
        const users = await this.seedTestUsers();

        const shares = [
            {
                user_id: 'test-startup-1',
                share_token: 'test-share-token-1',
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                view_count: 0,
                share_method: 'email',
                created_at: new Date()
            },
            {
                user_id: 'test-investor-1',
                share_token: 'test-share-token-2',
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                view_count: 3,
                share_method: 'link',
                created_at: new Date()
            }
        ];

        for (const share of shares) {
            const userExists = users.some(u => u.user_id === share.user_id);
            if (userExists) {
                await this.prisma.profileShare.upsert({
                    where: { share_token: share.share_token },
                    update: share,
                    create: share
                });
            } else {
                console.warn(`User with user_id: ${share.user_id} not found. Skipping profile share seeding.`);
            }
        }

        return shares;
    }

    async seedAll() {
        console.log('Seeding test database...');

        // Clean up any existing test data first
        await this.cleanup();

        const users = await this.seedTestUsers();
        console.log(`Seeded ${users.length} test users`);

        const startupProfiles = await this.seedTestStartupProfiles();
        console.log(`Seeded ${startupProfiles.length} startup profiles`);

        const investorProfiles = await this.seedTestInvestorProfiles();
        console.log(`Seeded ${investorProfiles.length} investor profiles`);

        const recommendations = await this.seedTestRecommendations();
        console.log(`Seeded ${recommendations.length} recommendations`);

        const profileShares = await this.seedTestProfileShares();
        console.log(`Seeded ${profileShares.length} profile shares`);

        console.log('Test database seeding completed');

        return {
            users,
            startupProfiles,
            investorProfiles,
            recommendations,
            profileShares
        };
    }
}

export default TestDatabaseSeeder;

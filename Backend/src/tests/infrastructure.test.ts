/**
 * Phase 1 Infrastructure Test
 * This test verifies that the testing infrastructure is properly set up
 */

import { PrismaClient } from '@prisma/client';
expect(process.env.JWT_SECRET).toBeDefined();
; import { TestDataFactory, TestAssertions, MockServices } from './utils/testHelpers';
import TestDatabaseSeeder from './utils/testDatabaseSeeder';

const prisma = new PrismaClient();

describe('Phase 1 Testing Infrastructure', () => {
    let seeder: TestDatabaseSeeder;

    beforeAll(async () => {
        seeder = new TestDatabaseSeeder(prisma);
    });

    afterAll(async () => {
        await seeder.cleanup();
        await prisma.$disconnect();
    });

    beforeEach(() => {
        MockServices.resetAllMocks();
    });

    describe('Test Utilities', () => {
        it('should create test users with TestDataFactory', async () => {
            const user = await TestDataFactory.createTestUser(prisma);

            expect(user).toBeDefined();
            expect(user).toBeValidUser();
            expect(user.email).toBeValidEmail();
            expect(user.role).toBeValidUserRole();
            expect(user).toHaveValidTimestamps();
        });

        it('should generate valid JWT tokens', () => {
            const token = TestDataFactory.generateMockJWT('test-user-id', 'test@example.com', 'startup');

            expect(token).toBeDefined();
            expect(token).toBeValidJWT();
        });

        it('should create mock requests', () => {
            const user = {
                user_id: 'test-user-id',
                email: 'test@example.com',
                role: 'startup',
                created_at: new Date(),
                updated_at: new Date()
            };

            const request = TestDataFactory.createMockAuthenticatedRequest(user);

            expect(request).toBeDefined();
            expect(request.user).toBe(user);
            expect(request.headers?.authorization).toBeDefined();
        });
    });

    describe('Custom Jest Matchers', () => {
        it('should validate user objects', () => {
            const validUser = {
                user_id: 'test-user-id',
                email: 'test@example.com',
                role: 'startup',
                created_at: new Date(),
                updated_at: new Date()
            };

            expect(validUser).toBeValidUser();
        });

        it('should validate JWT tokens', () => {
            const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

            expect(validJWT).toBeValidJWT();
        });

        it('should validate email addresses', () => {
            expect('test@example.com').toBeValidEmail();
            expect('user.name+tag@domain.co.uk').toBeValidEmail();
        });

        it('should validate user roles', () => {
            expect('startup').toBeValidUserRole();
            expect('investor').toBeValidUserRole();
            expect('admin').toBeValidUserRole();
        });
    });

    describe('Mock Services', () => {
        it('should provide mocked email service', () => {
            expect(MockServices.mockEmailService.sendEmail).toBeDefined();
            expect(jest.isMockFunction(MockServices.mockEmailService.sendEmail)).toBe(true);
        });

        it('should provide mocked Gemini API', () => {
            expect(MockServices.mockGeminiAPI.generateContent).toBeDefined();
            expect(jest.isMockFunction(MockServices.mockGeminiAPI.generateContent)).toBe(true);
        });

        it('should provide mocked OAuth providers', () => {
            expect(MockServices.mockOAuthProviders.google.authenticate).toBeDefined();
            expect(MockServices.mockOAuthProviders.linkedin.authenticate).toBeDefined();
        });

        it('should reset all mocks', () => {
            // Call a mock function
            MockServices.mockEmailService.sendEmail('test');
            expect(MockServices.mockEmailService.sendEmail).toHaveBeenCalledWith('test');

            // Reset mocks
            MockServices.resetAllMocks();

            // Verify the mock was reset
            expect(MockServices.mockEmailService.sendEmail).not.toHaveBeenCalled();
        });
    });

    describe('Database Seeder', () => {
        it('should create test database seeder instance', () => {
            expect(seeder).toBeDefined();
            expect(seeder).toBeInstanceOf(TestDatabaseSeeder);
        });

        it('should seed test users', async () => {
            const users = await seeder.seedTestUsers();

            expect(users).toBeDefined();
            expect(Array.isArray(users)).toBe(true);
            expect(users.length).toBeGreaterThan(0);

            users.forEach(user => {
                expect(user).toHaveProperty('user_id');
                expect(user).toHaveProperty('email');
                expect(user).toHaveProperty('role');
            });
        });

        it('should seed test profile shares', async () => {
            // First seed users
            await seeder.seedTestUsers();

            // Then seed profile shares
            const shares = await seeder.seedTestProfileShares();

            expect(shares).toBeDefined();
            expect(Array.isArray(shares)).toBe(true);
            expect(shares.length).toBeGreaterThan(0);

            shares.forEach(share => {
                expect(share).toHaveProperty('user_id');
                expect(share).toHaveProperty('share_token');
                expect(share).toHaveProperty('expires_at');
            });
        });
    }); describe('Environment Configuration', () => {
        it('should have test environment variables', () => {
            expect(process.env.NODE_ENV).toBe('test');
            expect(process.env.DATABASE_URL).toContain('neondb');
            // MONGODB_URI may be production or test URI, so just verify it exists
            expect(process.env.MONGODB_URI).toBeDefined();
            expect(process.env.JWT_SECRET).toBeDefined();
        });

        it('should have mock API keys', () => {
            expect(process.env.GOOGLE_CLIENT_ID).toBeDefined();
            expect(process.env.LINKEDIN_CLIENT_ID).toBeDefined();
            expect(process.env.GEMINI_API_KEY).toBeDefined();
        });
    });

    describe('Test Data Management', () => {
        it('should create and cleanup test data', async () => {
            // Create test data
            const user = await TestDataFactory.createTestUser(prisma);
            const profileShare = await TestDataFactory.createTestProfileShare(prisma, user.user_id);

            // Verify data exists
            const foundUser = await prisma.user.findUnique({
                where: { user_id: user.user_id }
            });
            expect(foundUser).toBeDefined();

            const foundShare = await prisma.profileShare.findUnique({
                where: { share_token: profileShare.share_token }
            });
            expect(foundShare).toBeDefined();

            // Cleanup should work without errors
            await seeder.cleanup();
        });
    });
});

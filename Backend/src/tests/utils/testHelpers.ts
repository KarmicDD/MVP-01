import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

/**
 * Test data factory functions
 */
export class TestDataFactory {
    static async createTestUser(prisma: PrismaClient, overrides: any = {}) {
        const defaultUser = {
            user_id: `test-user-${Date.now()}`,
            email: `test${Date.now()}@example.com`,
            password_hash: await bcrypt.hash('testpassword123', 10),
            role: 'startup',
            created_at: new Date(),
            updated_at: new Date()
        };

        return await prisma.user.create({
            data: { ...defaultUser, ...overrides }
        });
    }

    static async createTestInvestor(prisma: PrismaClient, overrides: any = {}) {
        return await this.createTestUser(prisma, { role: 'investor', ...overrides });
    }

    static async createTestStartup(prisma: PrismaClient, overrides: any = {}) {
        return await this.createTestUser(prisma, { role: 'startup', ...overrides });
    }

    static async createTestProfileShare(prisma: PrismaClient, userId: string, overrides: any = {}) {
        const defaultShare = {
            user_id: userId,
            share_token: `share-token-${Date.now()}`,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            view_count: 0,
            share_method: 'email'
        };

        return await prisma.profileShare.create({
            data: { ...defaultShare, ...overrides }
        });
    }
    static generateMockJWT(userId: string, email: string, role: string = 'startup') {
        return jwt.sign(
            { userId, email, role },
            process.env.JWT_SECRET || 'test_secret',
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } as jwt.SignOptions
        );
    }

    static createMockRequest(overrides: any = {}): Partial<Request> {
        return {
            body: {},
            params: {},
            query: {},
            headers: {},
            cookies: {},
            ...overrides
        };
    }

    static createMockAuthenticatedRequest(user: any, overrides: any = {}): Partial<Request> {
        return {
            ...this.createMockRequest(overrides),
            user,
            headers: {
                authorization: `Bearer ${this.generateMockJWT(user.user_id, user.email, user.role)}`,
                ...overrides.headers
            }
        };
    }
}

/**
 * Test assertion helpers
 */
export class TestAssertions {
    static expectValidUser(user: any) {
        expect(user).toBeDefined();
        expect(user.user_id).toBeDefined();
        expect(user.email).toBeDefined();
        expect(user.role).toBeDefined();
        expect(user.created_at).toBeDefined();
        expect(user.updated_at).toBeDefined();
    }

    static expectValidJWT(token: string) {
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.split('.')).toHaveLength(3);
    }

    static expectValidAPIResponse(response: any, statusCode: number = 200) {
        expect(response.status).toBe(statusCode);
        expect(response.body).toBeDefined();
    }

    static expectErrorResponse(response: any, statusCode: number, message?: string) {
        expect(response.status).toBe(statusCode);
        expect(response.body.error).toBeDefined();
        if (message) {
            expect(response.body.error).toContain(message);
        }
    }
}

/**
 * Mock service responses
 */
export class MockServices {
    static mockEmailService = {
        sendEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'mock-message-id' }),
        sendVerificationEmail: jest.fn().mockResolvedValue({ success: true }),
        sendPasswordResetEmail: jest.fn().mockResolvedValue({ success: true })
    };

    static mockGeminiAPI = {
        generateContent: jest.fn().mockResolvedValue({
            response: {
                text: () => 'Mock AI analysis response with detailed insights.'
            }
        })
    };

    static mockOAuthProviders = {
        google: {
            authenticate: jest.fn().mockResolvedValue({
                id: 'google-user-id',
                email: 'user@example.com',
                name: 'Test User'
            })
        },
        linkedin: {
            authenticate: jest.fn().mockResolvedValue({
                id: 'linkedin-user-id',
                email: 'user@example.com',
                name: 'Test User'
            })
        }
    };

    static resetAllMocks() {
        Object.values(this.mockEmailService).forEach(mock => {
            if (jest.isMockFunction(mock)) mock.mockClear();
        });

        Object.values(this.mockGeminiAPI).forEach(mock => {
            if (jest.isMockFunction(mock)) mock.mockClear();
        });

        Object.values(this.mockOAuthProviders.google).forEach(mock => {
            if (jest.isMockFunction(mock)) mock.mockClear();
        });

        Object.values(this.mockOAuthProviders.linkedin).forEach(mock => {
            if (jest.isMockFunction(mock)) mock.mockClear();
        });
    }
}

/**
 * File operation helpers for testing
 */
export class TestFileHelpers {
    static createMockFile(filename: string = 'test.pdf', mimetype: string = 'application/pdf', size: number = 1024) {
        return {
            fieldname: 'document',
            originalname: filename,
            encoding: '7bit',
            mimetype,
            size,
            destination: './uploads',
            filename: `test-${Date.now()}-${filename}`,
            path: `./uploads/test-${Date.now()}-${filename}`,
            buffer: Buffer.from('mock file content')
        };
    }

    static createMockMultipleFiles(count: number = 3) {
        return Array.from({ length: count }, (_, index) =>
            this.createMockFile(`test-${index}.pdf`)
        );
    }
}

/**
 * Wait utilities for async testing
 */
export class TestWaitHelpers {
    static async waitForCondition(
        condition: () => boolean | Promise<boolean>,
        timeout: number = 5000,
        interval: number = 100
    ): Promise<void> {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            if (await condition()) {
                return;
            }
            await this.sleep(interval);
        }
        throw new Error(`Condition not met within ${timeout}ms`);
    }

    static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default {
    TestDataFactory,
    TestAssertions,
    MockServices,
    TestFileHelpers,
    TestWaitHelpers
};

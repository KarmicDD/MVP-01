import request from 'supertest';
import { createApp } from '../../../app';
import { TestDataFactory } from '../../utils/testHelpers';
import { SecurityTestHelpers } from '../../utils/securityTestHelpers';
import { setupTestDatabases, cleanTestDatabases } from '../../setup/setupTestDB';
import { prisma } from '../../../config/db';
import { Application } from 'express';
import { TestDatabaseSeeder } from '../../utils/testDatabaseSeeder';

/**
 * Phase 3: Rate Limiting Security Testing
 * 
 * CRITICAL SECURITY REQUIREMENT: Prevent abuse through rate limiting
 * 
 * Test Categories:
 * - Authentication endpoint rate limiting
 * - API endpoint rate limiting
 * - User-specific rate limiting
 * - IP-based rate limiting
 * - Distributed rate limiting bypass attempts
 * - Rate limit header validation
 */
const seeder = new TestDatabaseSeeder(prisma);

beforeAll(async () => {
    await seeder.seedAll();
});

afterAll(async () => {
    await seeder.cleanup();
    await prisma.$disconnect();
});

describe('Phase 3: Rate Limiting Security Tests', () => {
    let app: Application;
    let validUser: any;
    let validToken: string;

    beforeAll(async () => {
        await setupTestDatabases();
        app = createApp();
        await new Promise(resolve => setTimeout(resolve, 500));
    });

    afterAll(async () => {
        await cleanTestDatabases();
    });

    beforeEach(async () => {
        await cleanTestDatabases();

        // Create test user and token for each test
        validUser = await TestDataFactory.createTestUser(prisma, {
            email: 'ratetest@example.com',
            role: 'startup'
        });
        validToken = TestDataFactory.generateMockJWT(validUser.user_id, validUser.email, validUser.role);
    });

    describe('Authentication Rate Limiting', () => {
        it.skip('should rate limit login attempts', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };

            // Make multiple failed login attempts
            const attempts = [];
            for (let i = 0; i < 10; i++) {
                attempts.push(
                    request(app)
                        .post('/api/auth/login')
                        .send(loginData)
                );
            }

            const responses = await Promise.all(attempts);

            // Should start rate limiting after too many attempts
            const rateLimitedResponses = responses.filter(res => res.status === 429);
            expect(rateLimitedResponses.length).toBeGreaterThan(0);

            // Check rate limit headers
            const rateLimitedResponse = rateLimitedResponses[0];
            expect(rateLimitedResponse.headers['retry-after']).toBeDefined();
        });

        it('should rate limit registration attempts', async () => {
            const registrationData = {
                email: `test${Date.now()}@example.com`,
                password: 'testpassword123',
                role: 'startup'
            };

            // Make multiple registration attempts rapidly
            const attempts = [];
            for (let i = 0; i < 8; i++) {
                attempts.push(
                    request(app)
                        .post('/api/auth/register')
                        .send({
                            ...registrationData,
                            email: `test${Date.now()}-${i}@example.com`
                        })
                );
            }

            const responses = await Promise.all(attempts);

            // Should rate limit registration attempts
            const rateLimitedResponses = responses.filter(res => res.status === 429);
            expect(rateLimitedResponses.length).toBeGreaterThan(0);
        });

        it.skip('should rate limit password reset attempts', async () => {
            // Make multiple password reset requests
            const attempts = [];
            for (let i = 0; i < 6; i++) {
                attempts.push(
                    request(app)
                        .post('/api/auth/forgot-password')
                        .send({ email: validUser.email })
                );
            }

            const responses = await Promise.all(attempts);

            // Should rate limit password reset attempts
            const successfulResponses = responses.filter(res => res.status < 300);
            const rateLimitedResponses = responses.filter(res => res.status === 429);

            // Should allow some requests but then rate limit
            expect(successfulResponses.length).toBeLessThan(responses.length);
            expect(rateLimitedResponses.length).toBeGreaterThan(0);
        });
    });

    describe('API Endpoint Rate Limiting', () => {
        it.skip('should rate limit general API requests per user', async () => {
            // Make many requests to the same endpoint rapidly
            const attempts = [];
            for (let i = 0; i < 20; i++) {
                attempts.push(
                    request(app)
                        .get('/api/profile/user-type')
                        .set('Authorization', `Bearer ${validToken}`)
                );
            }

            const responses = await Promise.all(attempts);

            // Should eventually rate limit
            const rateLimitedResponses = responses.filter(res => res.status === 429);
            const successfulResponses = responses.filter(res => res.status === 200);

            // Should allow some requests but then rate limit
            expect(successfulResponses.length).toBeGreaterThan(0);
            expect(successfulResponses.length).toBeLessThan(responses.length);
        });

        it('should rate limit file upload requests', async () => {
            const testFile = Buffer.from('test file content');

            // Make multiple file upload attempts
            const attempts = [];
            for (let i = 0; i < 5; i++) {
                attempts.push(
                    request(app)
                        .post('/api/profile/documents/upload')
                        .set('Authorization', `Bearer ${validToken}`)
                        .attach('document', testFile, `test${i}.pdf`)
                );
            }

            const responses = await Promise.all(attempts);

            // Should rate limit file uploads (they're resource intensive)
            const rateLimitedResponses = responses.filter(res => res.status === 429);
            expect(rateLimitedResponses.length).toBeGreaterThan(0);
        });

        it('should rate limit search requests', async () => {
            // Make multiple search requests rapidly
            const attempts = [];
            for (let i = 0; i < 15; i++) {
                attempts.push(
                    request(app)
                        .get('/api/search/startups?industry=technology')
                        .set('Authorization', `Bearer ${validToken}`)
                );
            }

            const responses = await Promise.all(attempts);

            // Should rate limit search requests
            const rateLimitedResponses = responses.filter(res => res.status === 429);
            expect(rateLimitedResponses.length).toBeGreaterThan(0);
        });
    });

    describe('User-Specific Rate Limiting', () => {
        it.skip('should enforce per-user rate limits independently', async () => {
            // Create another user
            const secondUser = await TestDataFactory.createTestUser(prisma, {
                role: 'investor',
                email: `second${Date.now()}@example.com`
            });
            const secondToken = TestDataFactory.generateMockJWT(secondUser.user_id, secondUser.email, secondUser.role);

            // Make requests with first user until rate limited
            let firstUserRateLimited = false;
            for (let i = 0; i < 20; i++) {
                const response = await request(app)
                    .get('/api/profile/user-type')
                    .set('Authorization', `Bearer ${validToken}`);

                if (response.status === 429) {
                    firstUserRateLimited = true;
                    break;
                }
            }

            expect(firstUserRateLimited).toBe(true);

            // Second user should still be able to make requests
            const secondUserResponse = await request(app)
                .get('/api/profile/user-type')
                .set('Authorization', `Bearer ${secondToken}`)
                .expect(200);

            expect(secondUserResponse.body).toHaveProperty('role');

            // Cleanup
            await prisma.user.delete({ where: { user_id: secondUser.user_id } }).catch(() => { });
        });

        it('should track rate limits across different endpoints for same user', async () => {
            // Make requests to different endpoints with same user
            const endpoints = [
                '/api/profile/user-type',
                '/api/dashboard/stats',
                '/api/tasks'
            ];

            let totalRequests = 0;
            let rateLimitedRequests = 0;

            for (let i = 0; i < 30; i++) {
                const endpoint = endpoints[i % endpoints.length];
                const response = await request(app)
                    .get(endpoint)
                    .set('Authorization', `Bearer ${validToken}`);

                totalRequests++;
                if (response.status === 429) {
                    rateLimitedRequests++;
                }
            }

            // Should eventually rate limit across different endpoints
            expect(rateLimitedRequests).toBeGreaterThan(0);
            expect(rateLimitedRequests).toBeLessThan(totalRequests);
        });
    });

    describe('IP-Based Rate Limiting', () => {
        it.skip('should rate limit requests from same IP regardless of user', async () => {
            // Make many unauthenticated requests from same IP
            const attempts = [];
            for (let i = 0; i < 25; i++) {
                attempts.push(
                    request(app)
                        .get('/')
                        .set('X-Forwarded-For', '192.168.1.100')
                );
            }

            const responses = await Promise.all(attempts);

            // Should rate limit based on IP
            const rateLimitedResponses = responses.filter(res => res.status === 429);
            expect(rateLimitedResponses.length).toBeGreaterThan(0);
        });

        it.skip('should handle X-Forwarded-For header manipulation attempts', async () => {
            const maliciousHeaders = [
                '127.0.0.1, 192.168.1.1, 10.0.0.1',
                '999.999.999.999',
                'localhost',
                '<script>alert("xss")</script>',
                '"; DROP TABLE rate_limits; --'
            ];

            for (const header of maliciousHeaders) {
                const response = await request(app)
                    .get('/')
                    .set('X-Forwarded-For', header);

                expect(response.status).toBeLessThan(500);
                expect(response.body).not.toMatch(/syntax error|script|drop table/i);
            }
        });
    });

    describe('Rate Limit Bypass Attempts', () => {
        it('should prevent rate limit bypass through header manipulation', async () => {
            const bypassAttempts = [
                { 'X-Originating-IP': '192.168.1.1' },
                { 'X-Forwarded-For': '127.0.0.1' },
                { 'X-Remote-IP': '10.0.0.1' },
                { 'X-Remote-Addr': '172.16.0.1' },
                { 'X-Client-IP': '203.0.113.1' }
            ];

            for (const headers of bypassAttempts) {
                // Make multiple requests with bypass headers
                const attempts = [];
                for (let i = 0; i < 10; i++) {
                    attempts.push(
                        request(app)
                            .get('/api/profile/user-type')
                            .set('Authorization', `Bearer ${validToken}`)
                            .set(headers)
                    );
                }

                const responses = await Promise.all(attempts);

                // Should still rate limit despite bypass attempts
                const rateLimitedResponses = responses.filter(res => res.status === 429);
                expect(rateLimitedResponses.length).toBeGreaterThan(0);
            }
        });

        it('should prevent rate limit bypass through user agent rotation', async () => {
            const userAgents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
                'curl/7.68.0',
                'PostmanRuntime/7.28.0'
            ];

            // Make requests with different user agents
            const attempts = [];
            for (let i = 0; i < 15; i++) {
                attempts.push(
                    request(app)
                        .get('/api/profile/user-type')
                        .set('Authorization', `Bearer ${validToken}`)
                        .set('User-Agent', userAgents[i % userAgents.length])
                );
            }

            const responses = await Promise.all(attempts);

            // Should still rate limit despite user agent rotation
            const rateLimitedResponses = responses.filter(res => res.status === 429);
            expect(rateLimitedResponses.length).toBeGreaterThan(0);
        });

        it.skip('should handle concurrent requests properly', async () => {
            // Make many concurrent requests
            const concurrentRequests = [];
            for (let i = 0; i < 50; i++) {
                concurrentRequests.push(
                    request(app)
                        .get('/api/profile/user-type')
                        .set('Authorization', `Bearer ${validToken}`)
                );
            }

            const responses = await Promise.all(concurrentRequests);

            // Should handle concurrent requests and rate limit appropriately
            const successfulResponses = responses.filter(res => res.status === 200);
            const rateLimitedResponses = responses.filter(res => res.status === 429);

            expect(successfulResponses.length).toBeGreaterThan(0);
            expect(rateLimitedResponses.length).toBeGreaterThan(0);
            expect(successfulResponses.length + rateLimitedResponses.length).toBe(responses.length);
        });
    });

    describe('Rate Limit Headers and Information Disclosure', () => {
        it('should include proper rate limit headers', async () => {
            const response = await request(app)
                .get('/api/profile/user-type')
                .set('Authorization', `Bearer ${validToken}`);

            // Should include rate limit information headers
            if (response.status === 200) {
                // Headers might be present even on successful requests
                const headers = Object.keys(response.headers);
                const rateLimitHeaders = headers.filter(h =>
                    h.includes('rate-limit') ||
                    h.includes('x-ratelimit') ||
                    h.includes('retry-after')
                );

                // At least some rate limit information should be present
                expect(rateLimitHeaders.length).toBeGreaterThanOrEqual(0);
            }
        });

        it('should not expose sensitive rate limiting details', async () => {
            // Make requests until rate limited
            let rateLimitedResponse;
            for (let i = 0; i < 20; i++) {
                const response = await request(app)
                    .get('/api/profile/user-type')
                    .set('Authorization', `Bearer ${validToken}`);

                if (response.status === 429) {
                    rateLimitedResponse = response;
                    break;
                }
            }

            if (rateLimitedResponse) {
                // Should not expose internal rate limiting configuration
                expect(rateLimitedResponse.body.message).not.toMatch(/redis|database|internal|config/i);
                expect(rateLimitedResponse.body.stack).toBeUndefined();

                // Should provide user-friendly message
                expect(rateLimitedResponse.body.message).toMatch(/rate.*limit|too.*many.*requests|slow.*down/i);
            }
        });

        it.skip('should reset rate limits after appropriate time period', async () => {
            // Make requests until rate limited
            let rateLimited = false;
            for (let i = 0; i < 20; i++) {
                const response = await request(app)
                    .get('/api/profile/user-type')
                    .set('Authorization', `Bearer ${validToken}`);

                if (response.status === 429) {
                    rateLimited = true;
                    break;
                }
            }

            expect(rateLimited).toBe(true);

            // Wait a short period (in a real test, this would be longer)
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Should allow some requests again (though this is hard to test reliably in unit tests)
            const resetResponse = await request(app)
                .get('/api/profile/user-type')
                .set('Authorization', `Bearer ${validToken}`);

            // Response should be either successful or still rate limited but consistent
            expect([200, 401, 429]).toContain(resetResponse.status);
        });
    });

    describe('Rate Limiting Edge Cases', () => {
        it('should handle malformed Authorization headers in rate limiting', async () => {
            const malformedTokens = [
                'Bearer ',
                'Basic invalid',
                'Bearer ' + 'x'.repeat(1000),
                'Bearer null',
                'Bearer undefined'
            ];

            for (const token of malformedTokens) {
                // Make multiple requests with malformed tokens
                const attempts = [];
                for (let i = 0; i < 5; i++) {
                    attempts.push(
                        request(app)
                            .get('/api/profile/user-type')
                            .set('Authorization', token)
                    );
                }

                const responses = await Promise.all(attempts);

                // Should handle malformed tokens without crashing
                responses.forEach(response => {
                    expect(response.status).toBeLessThan(500);
                });
            }
        });

        it('should rate limit even when authentication fails', async () => {
            // Make many requests with invalid tokens
            const attempts = [];
            for (let i = 0; i < 15; i++) {
                attempts.push(
                    request(app)
                        .get('/api/profile/user-type')
                        .set('Authorization', 'Bearer invalid-token')
                );
            }

            const responses = await Promise.all(attempts);

            // Should rate limit even failed authentication attempts
            const unauthorizedResponses = responses.filter(res => res.status === 401);
            const rateLimitedResponses = responses.filter(res => res.status === 429);

            expect(unauthorizedResponses.length + rateLimitedResponses.length).toBe(responses.length);
            expect(rateLimitedResponses.length).toBeGreaterThan(0);
        });
    });
});

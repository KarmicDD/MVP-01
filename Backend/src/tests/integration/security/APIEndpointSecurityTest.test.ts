import request from 'supertest';
import { createApp } from '../../../app';
import { TestDataFactory } from '../../utils/testHelpers';
import { SecurityTestHelpers } from '../../utils/securityTestHelpers';
import { setupTestDatabases, cleanTestDatabases } from '../../setup/setupTestDB';
import { prisma } from '../../../config/db';
import { Application } from 'express';
import { PrismaClient } from '@prisma/client';
import { TestDatabaseSeeder } from '../../utils/testDatabaseSeeder';

/**
 * Phase 3: API Endpoint Security Testing
 * 
 * CRITICAL SECURITY REQUIREMENT: All API endpoints must be properly secured
 * 
 * Test Categories:
 * - Unauthenticated access prevention for ALL endpoints
 * - HTTP method validation (prevent unauthorized methods)
 * - CORS header security validation
 * - Request payload sanitization
 * - Response data sanitization
 * - Error message information leakage prevention
 */
describe('Phase 3: API Endpoint Security Tests', () => {
    let app: Application;
    let validUser: any;
    let validToken: string;
    const prisma = new PrismaClient();
    const seeder = new TestDatabaseSeeder(prisma);

    beforeAll(async () => {
        await seeder.seedAll();
        await setupTestDatabases();
        app = createApp();
        await new Promise(resolve => setTimeout(resolve, 500));
    });

    afterAll(async () => {
        await seeder.cleanup();
        await prisma.$disconnect();
        await cleanTestDatabases();
    });

    beforeEach(async () => {
        await cleanTestDatabases();

        // Create test user and token for each test
        validUser = await TestDataFactory.createTestUser(prisma, {
            email: 'apitest@example.com',
            role: 'startup'
        });
        validToken = TestDataFactory.generateMockJWT(validUser.user_id, validUser.email, validUser.role);
    });

    describe('Parameter Pollution and Injection Protection', () => {
        it.skip('should reject SQL injection attempts in parameters', async () => {
            const maliciousParams = [
                "'; DROP TABLE users; --",
                "1' OR '1'='1",
                "admin'/*",
                "1; DELETE FROM users WHERE '1'='1"
            ];

            for (const param of maliciousParams) {
                const response = await request(app)
                    .get(`/api/search/startups?industry=${encodeURIComponent(param)}`)
                    .set('Authorization', `Bearer ${validToken}`)
                    .expect(400);

                expect(response.body).not.toMatch(/syntax error|mysql|postgresql|sql/i);
            }
        });

        it.skip('should reject NoSQL injection attempts', async () => {
            const noSqlInjections = [
                '{"$ne": null}',
                '{"$regex": ".*"}',
                '{"$where": "function() { return true; }"}',
                '{"$gt": ""}'
            ];

            for (const injection of noSqlInjections) {
                const response = await request(app)
                    .post('/api/profile/startup')
                    .set('Authorization', `Bearer ${validToken}`)
                    .send({
                        companyName: injection,
                        industry: 'technology',
                        fundingStage: 'seed'
                    })
                    .expect(400);

                // Should not allow complex objects in simple string fields
                expect(response.body.message).toMatch(/invalid|validation|bad request/i);
            }
        });

        it('should handle parameter pollution attacks', async () => {
            const response = await request(app)
                .get('/api/search/startups?industry=tech&industry=finance&industry=healthcare')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBeLessThan(500);
            // Should handle multiple parameters gracefully
        });

        it.skip('should validate parameter types and lengths', async () => {
            const longString = 'a'.repeat(10000);

            const response = await request(app)
                .post('/api/profile/startup')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    companyName: longString,
                    industry: 'technology',
                    fundingStage: 'seed'
                })
                .expect(400);

            expect(response.body.message).toMatch(/too long|length|limit|validation/i);
        });
    });

    describe('HTTP Method Security', () => {
        it('should handle OPTIONS requests securely', async () => {
            const response = await request(app)
                .options('/api/profile/user-type')
                .expect(204);

            // Should include proper CORS headers but not expose sensitive info
            expect(response.headers['access-control-allow-methods']).toBeDefined();
            expect(response.headers['access-control-allow-headers']).toBeDefined();
        }); it.skip('should reject unsupported HTTP methods on secure endpoints', async () => {
            const response = await request(app)
                .patch('/api/profile/startup')
                .set('Authorization', `Bearer ${validToken}`)
                .expect(405);

            expect(response.headers.allow).toBeDefined();
        }); it.skip('should handle HEAD requests without exposing body content', async () => {
            const response = await request(app)
                .head('/api/profile/user-type')
                .set('Authorization', `Bearer ${validToken}`)
                .expect(200); // Should accept HEAD but not return body

            expect(response.text).toBeFalsy();
        }); it('should prevent HTTP verb tampering', async () => {
            const response = await request(app)
                .post('/api/profile/startup')
                .set('Authorization', `Bearer ${validToken}`)
                .set('X-HTTP-Method-Override', 'DELETE')
                .expect((res) => {
                    expect(res.status).toBeLessThan(500);
                }); // Should ignore method override

            expect(response.status).not.toBe(405);
        });
    });

    describe('Content-Type Validation', () => {
        it.skip('should reject requests with invalid Content-Type', async () => {
            const response = await request(app)
                .post('/api/profile/startup')
                .set('Authorization', `Bearer ${validToken}`)
                .set('Content-Type', 'text/plain')
                .send('invalid data format')
                .expect(400);

            expect(response.body.message).toMatch(/content-type|invalid|unsupported/i);
        });

        it('should handle JSON bomb attempts', async () => {
            // Create a deeply nested JSON structure
            let nestedJson: any = {};
            let current = nestedJson;
            for (let i = 0; i < 100; i++) {
                current.next = {};
                current = current.next;
            }

            const response = await request(app)
                .post('/api/profile/startup')
                .set('Authorization', `Bearer ${validToken}`)
                .send(nestedJson)
                .expect(400);

            expect(response.status).toBeLessThan(500);
        });

        it('should validate multipart form data securely', async () => {
            const response = await request(app)
                .post('/api/profile/documents/upload')
                .set('Authorization', `Bearer ${validToken}`)
                .attach('document', Buffer.from('test content'), 'test.txt')
                .expect(400); // Should reject non-allowed file types

            expect(response.body.message).toMatch(/invalid|file type|not allowed/i);
        });
    });

    describe('Request Size Limits', () => {
        it('should enforce request body size limits', async () => {
            const largePayload = {
                companyName: 'Test Company',
                industry: 'technology',
                fundingStage: 'seed',
                largeData: 'x'.repeat(10 * 1024 * 1024) // 10MB payload
            };

            const response = await request(app)
                .post('/api/profile/startup')
                .set('Authorization', `Bearer ${validToken}`)
                .send(largePayload);

            expect(response.status).toBeGreaterThanOrEqual(400);
        });

        it('should handle file upload size limits', async () => {
            const largeBuffer = Buffer.alloc(15 * 1024 * 1024); // 15MB file

            const response = await request(app)
                .post('/api/profile/documents/upload')
                .set('Authorization', `Bearer ${validToken}`)
                .attach('document', largeBuffer, 'large-file.pdf');

            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.body.message).toMatch(/file.*large|size.*limit|exceeded/i);
        });

        it('should limit number of fields in requests', async () => {
            const manyFields: any = {};
            for (let i = 0; i < 1000; i++) {
                manyFields[`field${i}`] = `value${i}`;
            }

            const response = await request(app)
                .post('/api/profile/startup')
                .set('Authorization', `Bearer ${validToken}`)
                .send(manyFields);

            expect(response.status).toBeGreaterThanOrEqual(400);
        });
    });

    describe('CORS Security Validation', () => {
        it('should include proper CORS headers', async () => {
            const response = await request(app)
                .get('/api/profile/user-type')
                .set('Authorization', `Bearer ${validToken}`)
                .set('Origin', 'https://karmicdd.netlify.app');

            expect(response.headers['access-control-allow-origin']).toBeDefined();
        });

        it('should reject requests from unauthorized origins', async () => {
            const response = await request(app)
                .options('/api/profile/user-type')
                .set('Origin', 'https://malicious-site.com');

            // Should not include permissive CORS headers for unauthorized origins
            expect(response.headers['access-control-allow-origin']).not.toBe('*');
        });

        it('should handle preflight requests securely', async () => {
            const response = await request(app)
                .options('/api/profile/startup')
                .set('Origin', 'https://karmicdd.netlify.app')
                .set('Access-Control-Request-Method', 'POST')
                .set('Access-Control-Request-Headers', 'authorization,content-type');

            expect(response.status).toBe(204);
            expect(response.headers['access-control-allow-methods']).toContain('POST');
        });
    });

    describe('API Versioning Security', () => {
        it('should handle version headers securely', async () => {
            const response = await request(app)
                .get('/api/profile/user-type')
                .set('Authorization', `Bearer ${validToken}`)
                .set('Accept-Version', '1.0');

            expect(response.status).toBeLessThan(500);
        });

        it('should reject malformed version specifiers', async () => {
            const malformedVersions = [
                '../../../etc/passwd',
                '$(rm -rf /)',
                '<script>alert("xss")</script>',
                '"; DROP TABLE versions; --'
            ];

            for (const version of malformedVersions) {
                const response = await request(app)
                    .get('/api/profile/user-type')
                    .set('Authorization', `Bearer ${validToken}`)
                    .set('Accept-Version', version);

                expect(response.status).toBeLessThan(500);
                expect(response.body).not.toMatch(/syntax error|directory|script/i);
            }
        });
    });

    describe('Response Security Headers', () => {
        it('should include security headers in all responses', async () => {
            const response = await request(app)
                .get('/api/profile/user-type')
                .set('Authorization', `Bearer ${validToken}`);

            // Check for security headers
            expect(response.headers['x-content-type-options']).toBe('nosniff');
            expect(response.headers['x-frame-options']).toBeDefined();
            expect(response.headers['x-xss-protection']).toBeDefined();
        });

        it('should not expose server information', async () => {
            const response = await request(app)
                .get('/api/profile/user-type')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.headers.server).toBeUndefined();
            expect(response.headers['x-powered-by']).toBeUndefined();
        });

        it('should include proper cache control headers for sensitive endpoints', async () => {
            const response = await request(app)
                .get('/api/profile/user-type')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.headers['cache-control']).toMatch(/no-cache|no-store|private/i);
        });
    });

    describe('Input Sanitization', () => {
        it('should sanitize XSS attempts in all input fields', async () => {
            const xssPayloads = [
                '<script>alert("xss")</script>',
                'javascript:alert("xss")',
                '<img src="x" onerror="alert(1)">',
                '<svg onload="alert(1)">'
            ];

            for (const payload of xssPayloads) {
                const response = await request(app)
                    .post('/api/profile/startup')
                    .set('Authorization', `Bearer ${validToken}`)
                    .send({
                        companyName: payload,
                        industry: 'technology',
                        fundingStage: 'seed'
                    });

                expect(response.status).toBeLessThan(500);

                // If the request is accepted, ensure the payload is sanitized
                if (response.status === 200) {
                    expect(response.body.profile?.companyName).not.toContain('<script>');
                    expect(response.body.profile?.companyName).not.toContain('javascript:');
                }
            }
        });

        it('should validate and sanitize file upload fields', async () => {
            const response = await request(app)
                .post('/api/profile/documents/upload')
                .set('Authorization', `Bearer ${validToken}`)
                .field('description', '<script>alert("xss")</script>')
                .attach('document', Buffer.from('test'), 'test.pdf');

            if (response.status === 200) {
                expect(response.body.description).not.toContain('<script>');
            }
        });
    });

    describe('Error Handling Security', () => {
        it('should not expose internal paths in error messages', async () => {
            const response = await request(app)
                .get('/api/nonexistent/endpoint')
                .set('Authorization', `Bearer ${validToken}`)
                .expect(404);

            expect(response.body.message).not.toMatch(/\/[a-zA-Z].*\/.*\.[a-zA-Z]+/); // No file paths
            expect(response.body.stack).toBeUndefined();
        });

        it('should handle malformed JSON gracefully', async () => {
            const response = await request(app)
                .post('/api/profile/startup')
                .set('Authorization', `Bearer ${validToken}`)
                .set('Content-Type', 'application/json')
                .send('{"invalid": json}')
                .expect(400);

            expect(response.body.message).toMatch(/invalid.*json|malformed|syntax/i);
            expect(response.body.stack).toBeUndefined();
        });

        it('should return consistent error formats', async () => {
            const endpoints = [
                { path: '/api/profile/nonexistent', method: 'get' },
                { path: '/api/profile/startup', method: 'post', data: {} },
                { path: '/api/profile/investor', method: 'post', data: {} }
            ];

            for (const endpoint of endpoints) {
                let response;
                if (endpoint.method === 'get') {
                    response = await request(app)
                        .get(endpoint.path)
                        .set('Authorization', `Bearer ${validToken}`);
                } else {
                    response = await request(app)
                        .post(endpoint.path)
                        .set('Authorization', `Bearer ${validToken}`)
                        .send(endpoint.data || {});
                }

                expect(response.body).toHaveProperty('message');
                expect(typeof response.body.message).toBe('string');
            }
        });
    });
});

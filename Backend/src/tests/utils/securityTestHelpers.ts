/**
 * Security Test Helpers for Phase 3 Integration Testing
 * Provides utilities for security validation and attack simulation
 */

import request from 'supertest';
import { Application } from 'express';

export class SecurityTestHelpers {
    /**
     * Attempt unauthorized access to an endpoint
     */
    static async attemptUnauthorizedAccess(app: Application, endpoint: string, method: string = 'GET'): Promise<any> {
        const requestMethod = method.toLowerCase() as keyof typeof request;
        return await (request(app) as any)[requestMethod](endpoint);
    }

    /**
     * Test role escalation attempts
     */
    static async attemptRoleEscalation(app: Application, userToken: string, targetEndpoint: string, method: string = 'GET'): Promise<any> {
        const requestMethod = method.toLowerCase() as keyof typeof request;
        return await (request(app) as any)[requestMethod](targetEndpoint)
            .set('Authorization', `Bearer ${userToken}`);
    }

    /**
     * Validate input sanitization against malicious payloads
     */
    static async validateInputSanitization(app: Application, endpoint: string, maliciousPayload: any, method: string = 'POST'): Promise<any> {
        const requestMethod = method.toLowerCase() as keyof typeof request;
        return await (request(app) as any)[requestMethod](endpoint)
            .send(maliciousPayload);
    }

    /**
     * Test rate limiting enforcement
     */
    static async testRateLimit(app: Application, endpoint: string, userToken: string, requestCount: number = 10): Promise<any[]> {
        const requests = Array(requestCount).fill(null).map(() =>
            request(app)
                .get(endpoint)
                .set('Authorization', `Bearer ${userToken}`)
        );

        return await Promise.all(requests);
    }

    /**
     * Generate malicious payloads for testing
     */
    static getMaliciousPayloads(): any[] {
        return [
            // XSS Payloads
            { email: "<script>alert('xss')</script>@test.com", password: "password123" },
            { companyName: "<img src=x onerror=alert('xss')>", industry: "tech" },
            { description: "javascript:alert('xss')" },

            // SQL Injection Payloads
            { email: "admin'; DROP TABLE users; --", password: "password" },
            { companyName: "'; DELETE FROM profiles; --", industry: "tech" },
            { userId: "1' OR '1'='1", role: "admin" },

            // NoSQL Injection Payloads
            { email: { $gt: "" }, password: { $gt: "" } },
            { companyName: { $where: "function(){return true}" } },

            // Path Traversal
            { fileName: "../../../etc/passwd" },
            { documentPath: "..\\..\\windows\\system32\\config\\sam" },

            // Command Injection
            { email: "test@test.com; cat /etc/passwd", password: "pwd" },
            { description: "test && rm -rf /" },

            // Buffer Overflow Attempts
            { email: "a".repeat(10000) + "@test.com" },
            { description: "x".repeat(100000) },

            // Null Byte Injection
            { fileName: "test.pdf\0.exe" },
            { email: "test\0@evil.com" },

            // LDAP Injection
            { email: "admin)(&(password=*))", password: "any" },

            // XML/XXE Injection
            { data: "<?xml version='1.0'?><!DOCTYPE foo [<!ENTITY xxe SYSTEM 'file:///etc/passwd'>]><foo>&xxe;</foo>" }
        ];
    }

    /**
     * Test CORS security
     */
    static async testCORSSecurity(app: Application, endpoint: string, origin: string = 'https://evil.com'): Promise<any> {
        return await request(app)
            .options(endpoint)
            .set('Origin', origin)
            .set('Access-Control-Request-Method', 'GET')
            .set('Access-Control-Request-Headers', 'Authorization');
    }

    /**
     * Test file upload security
     */
    static async testFileUploadSecurity(app: Application, endpoint: string, token: string): Promise<any[]> {
        const maliciousFiles = [
            // Executable files
            { filename: 'malware.exe', mimetype: 'application/octet-stream', content: 'MZ\x90\x00' },
            // Script files
            { filename: 'script.js', mimetype: 'application/javascript', content: 'alert("xss")' },
            // PHP files
            { filename: 'shell.php', mimetype: 'application/x-php', content: '<?php system($_GET["cmd"]); ?>' },
            // Oversized files
            { filename: 'large.pdf', mimetype: 'application/pdf', content: 'x'.repeat(50 * 1024 * 1024) }, // 50MB
            // Files with null bytes
            { filename: 'test.pdf\0.exe', mimetype: 'application/pdf', content: '%PDF-1.4' },
            // Files with path traversal
            { filename: '../../../evil.pdf', mimetype: 'application/pdf', content: '%PDF-1.4' }
        ];

        const results = [];
        for (const file of maliciousFiles) {
            try {
                const response = await request(app)
                    .post(endpoint)
                    .set('Authorization', `Bearer ${token}`)
                    .attach('documents', Buffer.from(file.content), {
                        filename: file.filename,
                        contentType: file.mimetype
                    });
                results.push({ file: file.filename, response });
            } catch (error) {
                results.push({ file: file.filename, error });
            }
        }

        return results;
    }

    /**
     * Test HTTP method security
     */
    static async testHTTPMethodSecurity(app: Application, endpoint: string): Promise<any> {
        const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS', 'TRACE'];
        const results: any = {};

        for (const method of methods) {
            try {
                const requestMethod = method.toLowerCase() as keyof typeof request;
                const response = await (request(app) as any)[requestMethod](endpoint);
                results[method] = response.status;
            } catch (error) {
                results[method] = 'ERROR';
            }
        }

        return results;
    }

    /**
     * Test authentication header variations
     */
    static getAuthHeaderVariations(token: string): string[] {
        return [
            `Bearer ${token}`,
            `bearer ${token}`,
            `BEARER ${token}`,
            `Token ${token}`,
            `JWT ${token}`,
            `Auth ${token}`,
            token, // No prefix
            `Bearer${token}`, // No space
            `Bearer  ${token}`, // Double space
            `Bearer\t${token}`, // Tab character
            `Bearer\n${token}`, // Newline character
            `Bearer ${token} `, // Trailing space
            ` Bearer ${token}`, // Leading space
        ];
    }

    /**
     * Test session fixation
     */
    static async testSessionFixation(app: Application, loginEndpoint: string, credentials: any): Promise<any> {
        // Attempt to fix session ID before login
        const fixedSessionId = 'fixed-session-id';

        return await request(app)
            .post(loginEndpoint)
            .set('Cookie', `sessionId=${fixedSessionId}`)
            .send(credentials);
    }

    /**
     * Test CSRF protection
     */
    static async testCSRFProtection(app: Application, endpoint: string, token: string, method: string = 'POST'): Promise<any> {
        const requestMethod = method.toLowerCase() as keyof typeof request;

        return await (request(app) as any)[requestMethod](endpoint)
            .set('Authorization', `Bearer ${token}`)
            .set('Origin', 'https://evil.com')
            .set('Referer', 'https://evil.com/csrf-attack');
    }

    /**
     * Generate stress test requests for DoS testing
     */
    static async stressTestEndpoint(app: Application, endpoint: string, token: string, concurrentRequests: number = 100): Promise<any[]> {
        const requests = Array(concurrentRequests).fill(null).map(() =>
            request(app)
                .get(endpoint)
                .set('Authorization', `Bearer ${token}`)
        );

        return await Promise.allSettled(requests);
    }

    /**
     * Test parameter pollution
     */
    static async testParameterPollution(app: Application, endpoint: string): Promise<any> {
        return await request(app)
            .get(endpoint)
            .query({
                param: ['value1', 'value2'],
                id: ['1', '2', '3'],
                role: ['user', 'admin'],
                limit: ['10', '999999']
            });
    }

    /**
     * Test response time for timing attacks
     */
    static async measureResponseTime(app: Application, endpoint: string, payload: any, iterations: number = 10): Promise<number[]> {
        const times: number[] = [];

        for (let i = 0; i < iterations; i++) {
            const start = process.hrtime.bigint();

            await request(app)
                .post(endpoint)
                .send(payload);

            const end = process.hrtime.bigint();
            times.push(Number(end - start) / 1000000); // Convert to milliseconds
        }

        return times;
    }

    /**
     * Test information disclosure in error messages
     */
    static async testInformationDisclosure(app: Application, endpoints: string[]): Promise<any[]> {
        const sensitivePatterns = [
            /database/i,
            /sql/i,
            /mongodb/i,
            /redis/i,
            /connection/i,
            /internal/i,
            /stack trace/i,
            /error.*line.*\d+/i,
            /file.*not.*found/i,
            /permission.*denied/i,
            /access.*denied/i,
            /unauthorized/i,
            /token.*expired/i,
            /invalid.*credentials/i
        ];

        const results = [];

        for (const endpoint of endpoints) {
            const response = await request(app).get(endpoint);
            const disclosure = {
                endpoint,
                status: response.status,
                exposedInfo: false,
                details: [] as string[]
            };

            const responseText = JSON.stringify(response.body) + JSON.stringify(response.headers);

            for (const pattern of sensitivePatterns) {
                if (pattern.test(responseText)) {
                    disclosure.exposedInfo = true;
                    disclosure.details.push(pattern.source);
                }
            }

            results.push(disclosure);
        }

        return results;
    }
}

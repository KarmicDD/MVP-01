declare global {
    namespace jest {
        interface Matchers<R> {
            toBeValidUser(): R;
            toBeValidJWT(): R;
            toBeValidEmail(): R;
            toBeValidUserRole(): R;
            toHaveValidTimestamps(): R;
            toBeSuccessfulAPIResponse(): R;
            toBeErrorAPIResponse(statusCode: number, message?: string): R;
            toBeValidMatchingScore(): R;
            toBeValidRecommendation(): R;
        }
    }
}

// Note: expect.extend will be called in setupTests.ts

expect.extend({
    toBeValidUser(received: any) {
        if (!received) {
            return {
                message: () => 'Expected value to be a valid user object',
                pass: false,
            };
        }

        const requiredFields = ['user_id', 'email', 'role', 'created_at', 'updated_at'];
        const missingFields = requiredFields.filter(field => !received[field]);

        if (missingFields.length > 0) {
            return {
                message: () => `User object is missing required fields: ${missingFields.join(', ')}`,
                pass: false,
            };
        }

        return {
            message: () => 'Expected value not to be a valid user object',
            pass: true,
        };
    },

    toBeValidJWT(received: any) {
        if (typeof received !== 'string') {
            return {
                message: () => 'Expected value to be a string JWT token',
                pass: false,
            };
        }

        const jwtParts = received.split('.');
        if (jwtParts.length !== 3) {
            return {
                message: () => 'Expected JWT to have 3 parts separated by dots',
                pass: false,
            };
        }

        return {
            message: () => 'Expected value not to be a valid JWT',
            pass: true,
        };
    },

    toBeValidEmail(received: any) {
        if (typeof received !== 'string') {
            return {
                message: () => 'Expected value to be a string email',
                pass: false,
            };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(received)) {
            return {
                message: () => `Expected "${received}" to be a valid email format`,
                pass: false,
            };
        }

        return {
            message: () => 'Expected value not to be a valid email',
            pass: true,
        };
    },

    toBeValidUserRole(received: any) {
        const validRoles = ['startup', 'investor', 'admin'];
        if (!validRoles.includes(received)) {
            return {
                message: () => `Expected "${received}" to be one of: ${validRoles.join(', ')}`,
                pass: false,
            };
        }

        return {
            message: () => 'Expected value not to be a valid user role',
            pass: true,
        };
    },

    toHaveValidTimestamps(received: any) {
        if (!received.created_at || !received.updated_at) {
            return {
                message: () => 'Expected object to have created_at and updated_at timestamps',
                pass: false,
            };
        }

        const createdAt = new Date(received.created_at);
        const updatedAt = new Date(received.updated_at);

        if (isNaN(createdAt.getTime()) || isNaN(updatedAt.getTime())) {
            return {
                message: () => 'Expected timestamps to be valid dates',
                pass: false,
            };
        }

        if (updatedAt < createdAt) {
            return {
                message: () => 'Expected updated_at to be greater than or equal to created_at',
                pass: false,
            };
        }

        return {
            message: () => 'Expected object not to have valid timestamps',
            pass: true,
        };
    },

    toBeSuccessfulAPIResponse(received: any) {
        if (!received.status || received.status < 200 || received.status >= 300) {
            return {
                message: () => `Expected response to have successful status code (200-299), got ${received.status}`,
                pass: false,
            };
        }

        if (!received.body) {
            return {
                message: () => 'Expected response to have a body',
                pass: false,
            };
        }

        return {
            message: () => 'Expected response not to be successful',
            pass: true,
        };
    }, toBeErrorAPIResponse(received: any, expectedStatusCode: number, expectedMessage?: string) {
        if (received.status !== expectedStatusCode) {
            return {
                message: () => `Expected response status to be ${expectedStatusCode}, got ${received.status}`,
                pass: false,
            };
        }

        if (!received.body || !received.body.error) {
            return {
                message: () => 'Expected response to have error in body',
                pass: false,
            };
        }

        if (expectedMessage && !received.body.error.includes(expectedMessage)) {
            return {
                message: () => `Expected error message to contain "${expectedMessage}", got "${received.body.error}"`,
                pass: false,
            };
        }

        return {
            message: () => 'Expected response not to be an error response',
            pass: true,
        };
    },

    toBeValidMatchingScore(received: any) {
        if (typeof received !== 'number') {
            return {
                message: () => `Expected matching score to be a number, got ${typeof received}`,
                pass: false,
            };
        }

        if (received < 0 || received > 100) {
            return {
                message: () => `Expected matching score to be between 0 and 100, got ${received}`,
                pass: false,
            };
        }

        return {
            message: () => 'Expected value not to be a valid matching score',
            pass: true,
        };
    },

    toBeValidRecommendation(received: any) {
        if (!received || typeof received !== 'object') {
            return {
                message: () => 'Expected value to be a recommendation object',
                pass: false,
            };
        }

        const requiredFields = ['userId', 'recommendedUserId', 'score', 'type'];
        const missingFields = requiredFields.filter(field => !received.hasOwnProperty(field));

        if (missingFields.length > 0) {
            return {
                message: () => `Recommendation object is missing required fields: ${missingFields.join(', ')}`,
                pass: false,
            };
        }

        // Validate score
        if (typeof received.score !== 'number' || received.score < 0 || received.score > 100) {
            return {
                message: () => `Expected score to be a number between 0 and 100, got ${received.score}`,
                pass: false,
            };
        }

        // Validate type
        const validTypes = ['investor', 'startup'];
        if (!validTypes.includes(received.type)) {
            return {
                message: () => `Expected type to be one of: ${validTypes.join(', ')}, got ${received.type}`,
                pass: false,
            };
        }

        return {
            message: () => 'Expected value not to be a valid recommendation',
            pass: true,
        };
    },
});

export { };

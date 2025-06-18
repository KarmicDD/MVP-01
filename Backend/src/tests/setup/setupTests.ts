import dotenv from 'dotenv';
import path from 'path';
import './jest.d.ts';
import '../utils/customMatchers';

// Force load test environment variables early
const testEnvPath = path.join(__dirname, '../../.env.test');
dotenv.config({ path: testEnvPath, override: true });

// Ensure we're in test environment
process.env.NODE_ENV = 'test';

// Increase timeout for all tests
jest.setTimeout(30000);

// Mock external services globally
jest.mock('../../services/emailService', () => ({
    sendEmail: jest.fn().mockResolvedValue({ success: true }),
    sendVerificationEmail: jest.fn().mockResolvedValue({ success: true }),
    sendPasswordResetEmail: jest.fn().mockResolvedValue({ success: true })
}));

jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
            generateContent: jest.fn().mockResolvedValue({
                response: {
                    text: jest.fn().mockReturnValue('Mock AI response')
                }
            })
        })
    }))
}));

// Global test configuration
global.console = {
    ...console,
    // Suppress logs during testing unless explicitly needed
    log: process.env.VERBOSE_TESTS ? console.log : jest.fn(),
    warn: console.warn,
    error: console.error,
    info: process.env.VERBOSE_TESTS ? console.info : jest.fn(),
    debug: process.env.VERBOSE_TESTS ? console.debug : jest.fn()
};

// Set up global test utilities
beforeAll(async () => {
    // Any global setup can go here
});

afterAll(async () => {
    // Global cleanup
});

beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
});

afterEach(() => {
    // Clean up after each test
});

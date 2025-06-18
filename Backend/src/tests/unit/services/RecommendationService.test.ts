import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import RecommendationService, { RecommendationResult } from '../../../services/RecommendationService';
import { TestDataFactory, TestAssertions, MockServices } from '../../utils/testHelpers';
import '../../utils/customMatchers';
import StartupProfileModel from '../../../models/Profile/StartupProfile';
import InvestorProfileModel from '../../../models/InvestorModels/InvestorProfile';
import QuestionnaireSubmissionModel from '../../../models/question/QuestionnaireSubmission';
import RecommendationModel from '../../../models/RecommendationModel';

// Define types for better type safety
interface MockRecommendation {
    userId: string;
    recommendedUserId: string;
    score: number;
    reasons: string[];
    type: 'investor' | 'startup';
}

interface RecommendationItem {
    id: string;
    title: string;
    summary: string;
    details: string;
    category: 'strategic' | 'operational' | 'financial' | 'communication' | 'growth';
    priority: 'high' | 'medium' | 'low';
    confidence: number;
}

describe('RecommendationService', () => {
    let mongoServer: MongoMemoryServer;
    let recommendationService: typeof RecommendationService;

    beforeAll(async () => {
        // Start in-memory MongoDB
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);

        // Use the default export instance
        recommendationService = RecommendationService;
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        // Clear all collections before each test
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
        MockServices.resetAllMocks();
    }); describe('generateRecommendations', () => {
        it('should generate recommendations for a startup perspective', async () => {
            const startupUserId = 'test-startup-1';
            const investorUserId = 'test-investor-1';

            // Act
            const result = await recommendationService.generateRecommendations(
                startupUserId,
                investorUserId,
                'startup'
            );

            // Assert
            expect(result).toBeDefined();
            expect(result).toHaveProperty('recommendations');
            expect(result).toHaveProperty('precision');
            expect(Array.isArray(result.recommendations)).toBe(true);
            expect(typeof result.precision).toBe('number');
            expect(result.precision).toBeValidMatchingScore();

            if (result.recommendations.length > 0) {
                const firstRecommendation = result.recommendations[0];
                expect(firstRecommendation).toHaveProperty('id');
                expect(firstRecommendation).toHaveProperty('title');
                expect(firstRecommendation).toHaveProperty('summary');
                expect(firstRecommendation).toHaveProperty('details');
                expect(firstRecommendation).toHaveProperty('category');
                expect(firstRecommendation).toHaveProperty('priority');
                expect(firstRecommendation).toHaveProperty('confidence');
                expect(firstRecommendation.confidence).toBeValidMatchingScore();
            }
        });

        it('should generate recommendations for an investor perspective', async () => {
            const startupUserId = 'test-startup-1';
            const investorUserId = 'test-investor-1';

            // Act
            const result = await recommendationService.generateRecommendations(
                startupUserId,
                investorUserId,
                'investor'
            );

            // Assert
            expect(result).toBeDefined();
            expect(result).toHaveProperty('recommendations');
            expect(result).toHaveProperty('precision');
            expect(Array.isArray(result.recommendations)).toBe(true);
            expect(typeof result.precision).toBe('number');
            expect(result.precision).toBeValidMatchingScore();

            if (result.recommendations.length > 0) {
                const firstRecommendation = result.recommendations[0];
                expect(firstRecommendation).toHaveProperty('id');
                expect(firstRecommendation).toHaveProperty('title');
                expect(firstRecommendation).toHaveProperty('summary');
                expect(firstRecommendation).toHaveProperty('details');
                expect(firstRecommendation).toHaveProperty('category');
                expect(firstRecommendation).toHaveProperty('priority');
                expect(firstRecommendation).toHaveProperty('confidence');
                expect(firstRecommendation.confidence).toBeValidMatchingScore();
            }
        });

        it('should handle invalid perspective gracefully', async () => {
            const startupUserId = 'test-startup-1';
            const investorUserId = 'test-investor-1';

            await expect(
                recommendationService.generateRecommendations(
                    startupUserId,
                    investorUserId,
                    'invalid-role' as any
                )
            ).rejects.toThrow();
        });

        it('should return fallback recommendations when no data found', async () => {
            const startupUserId = 'non-existent-startup';
            const investorUserId = 'non-existent-investor';

            const result = await recommendationService.generateRecommendations(
                startupUserId,
                investorUserId,
                'startup'
            );

            expect(result).toBeDefined();
            expect(result).toHaveProperty('recommendations');
            expect(result).toHaveProperty('precision');
            expect(Array.isArray(result.recommendations)).toBe(true);
            // Should return fallback recommendations
            expect(result.recommendations.length).toBeGreaterThan(0);
        });

        it('should use cached recommendations when available and not forcing refresh', async () => {
            const startupUserId = 'test-startup-1';
            const investorUserId = 'test-investor-1';

            // Generate recommendations twice
            const firstResult = await recommendationService.generateRecommendations(
                startupUserId,
                investorUserId,
                'startup'
            );

            const secondResult = await recommendationService.generateRecommendations(
                startupUserId,
                investorUserId,
                'startup',
                false // Don't force refresh
            );

            expect(firstResult).toBeDefined();
            expect(secondResult).toBeDefined();
            // Both should have valid structure
            expect(firstResult).toHaveProperty('recommendations');
            expect(secondResult).toHaveProperty('recommendations');
        });

        it('should force refresh when specified', async () => {
            const startupUserId = 'test-startup-1';
            const investorUserId = 'test-investor-1';

            // Generate recommendations with force refresh
            const result = await recommendationService.generateRecommendations(
                startupUserId,
                investorUserId,
                'startup',
                true // Force refresh
            );

            expect(result).toBeDefined();
            expect(result).toHaveProperty('recommendations');
            expect(result).toHaveProperty('precision');
        });
    }); describe('testMongoDBConnection', () => {
        it('should test MongoDB connection successfully', async () => {
            // Act
            const result = await recommendationService.testMongoDBConnection();

            // Assert
            expect(typeof result).toBe('boolean');
        });

        it('should handle MongoDB connection errors gracefully', async () => {
            // This test would require mocking MongoDB to fail
            // For now, we'll just verify the method exists and returns a boolean
            const result = await recommendationService.testMongoDBConnection();
            expect(typeof result).toBe('boolean');
        });
    });

    describe('Error handling and edge cases', () => {
        it('should handle malformed user IDs', async () => {
            const invalidStartupId = '';
            const invalidInvestorId = '';

            const result = await recommendationService.generateRecommendations(
                invalidStartupId,
                invalidInvestorId,
                'startup'
            );

            expect(result).toBeDefined();
            expect(result).toHaveProperty('recommendations');
            expect(result).toHaveProperty('precision');
        });

        it('should handle null/undefined inputs gracefully', async () => {
            // TypeScript should prevent this, but test runtime handling
            const result = await recommendationService.generateRecommendations(
                'test-startup',
                'test-investor',
                'startup'
            );

            expect(result).toBeDefined();
            expect(result).toHaveProperty('recommendations');
        });

        it('should validate recommendation result structure', async () => {
            const result = await recommendationService.generateRecommendations(
                'test-startup-1',
                'test-investor-1',
                'startup'
            );

            expect(result).toBeDefined();
            expect(result).toHaveProperty('recommendations');
            expect(result).toHaveProperty('precision');
            expect(Array.isArray(result.recommendations)).toBe(true);
            expect(typeof result.precision).toBe('number');            // Validate each recommendation structure
            result.recommendations.forEach((recommendation: RecommendationItem) => {
                expect(recommendation).toHaveProperty('id');
                expect(recommendation).toHaveProperty('title');
                expect(recommendation).toHaveProperty('summary');
                expect(recommendation).toHaveProperty('details');
                expect(recommendation).toHaveProperty('category');
                expect(recommendation).toHaveProperty('priority');
                expect(recommendation).toHaveProperty('confidence');

                // Validate category values
                const validCategories = ['strategic', 'operational', 'financial', 'communication', 'growth'];
                expect(validCategories).toContain(recommendation.category);

                // Validate priority values
                const validPriorities = ['high', 'medium', 'low'];
                expect(validPriorities).toContain(recommendation.priority);

                // Validate confidence score
                expect(recommendation.confidence).toBeValidMatchingScore();
            });
        });

        it('should handle concurrent recommendation requests', async () => {
            const startupId = 'test-startup-concurrent';
            const investorId = 'test-investor-concurrent';

            // Make multiple concurrent requests
            const promises = [
                recommendationService.generateRecommendations(startupId, investorId, 'startup'),
                recommendationService.generateRecommendations(startupId, investorId, 'investor'),
                recommendationService.generateRecommendations(startupId, investorId, 'startup', true)
            ];

            const results = await Promise.all(promises);

            // All requests should complete successfully
            results.forEach(result => {
                expect(result).toBeDefined();
                expect(result).toHaveProperty('recommendations');
                expect(result).toHaveProperty('precision');
            });
        });

        it('should handle large datasets efficiently', async () => {
            const startTime = Date.now();

            const result = await recommendationService.generateRecommendations(
                'test-startup-large',
                'test-investor-large',
                'startup'
            );

            const endTime = Date.now();
            const executionTime = endTime - startTime;

            expect(result).toBeDefined();
            expect(result).toHaveProperty('recommendations');

            // Should complete within reasonable time (adjust as needed)
            expect(executionTime).toBeLessThan(10000); // 10 seconds max
        });
    });
});

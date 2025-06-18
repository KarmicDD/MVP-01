import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import StartupProfileModel from '../models/Profile/StartupProfile';
import InvestorProfileModel from '../models/InvestorModels/InvestorProfile';
import QuestionnaireSubmissionModel from '../models/question/QuestionnaireSubmission';
import RecommendationModel from '../models/RecommendationModel';
import { cleanJsonResponse, safeJsonParse } from '../utils/jsonHelper';

// Load environment variables
dotenv.config();

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || '';
if (!apiKey) {
    console.warn('Warning: GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
        maxOutputTokens: 8192, // Maximum allowed value
    }
});

/**
 * Interface for recommendation result
 */
export interface RecommendationResult {
    recommendations: Array<{
        id: string;
        title: string;
        summary: string;
        details: string;
        category: 'strategic' | 'operational' | 'financial' | 'communication' | 'growth';
        priority: 'high' | 'medium' | 'low';
        confidence: number;
    }>;
    precision: number;
}

class RecommendationService {
    /**
     * Test MongoDB connection and recommendation saving
     * This method can be called during startup to verify MongoDB connectivity
     */
    async testMongoDBConnection(): Promise<boolean> {
        try {
            console.log('Testing MongoDB connection for recommendations...');

            // Create a test recommendation document
            const testRecommendation = await RecommendationModel.create({
                startupId: 'test-startup-id',
                investorId: 'test-investor-id',
                perspective: 'startup',
                recommendations: [
                    {
                        id: 'test-id',
                        title: 'Test Recommendation',
                        summary: 'This is a test recommendation',
                        details: 'This recommendation was created to test MongoDB connectivity.',
                        category: 'strategic',
                        priority: 'medium',
                        confidence: 90
                    }
                ],
                precision: 95,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 60 * 1000) // Expire after 1 minute
            });

            console.log(`Test recommendation created successfully with ID: ${testRecommendation._id}`);

            // Clean up the test document
            await RecommendationModel.findByIdAndDelete(testRecommendation._id);
            console.log('Test recommendation deleted successfully');

            return true;
        } catch (error) {
            console.error('MongoDB connection test failed:', error);
            return false;
        }
    }
    /**
     * Generate personalized recommendations for a startup-investor match
     * @param startupId Startup user ID
     * @param investorId Investor user ID
     * @param perspective Perspective to generate recommendations from ('startup' or 'investor')
     * @param forceRefresh Whether to force a refresh of recommendations even if cached
     * @returns Personalized recommendations
     */    async generateRecommendations(
        startupId: string,
        investorId: string,
        perspective: 'startup' | 'investor',
        forceRefresh: boolean = false
    ): Promise<RecommendationResult> {
        try {
            // Validate perspective parameter
            if (!perspective || (perspective !== 'startup' && perspective !== 'investor')) {
                throw new Error(`Invalid perspective: ${perspective}. Must be 'startup' or 'investor'`);
            }

            // Check for cached recommendations if not forcing refresh
            if (!forceRefresh) {
                console.log(`Checking for cached recommendations for startup ${startupId} and investor ${investorId} with perspective ${perspective}`);

                // First try to find recommendations without date restriction
                const cachedRecommendations = await RecommendationModel.findOne({
                    startupId: startupId,
                    investorId: investorId,
                    perspective: perspective
                }).sort({ createdAt: -1 }); // Get the most recent one

                if (cachedRecommendations) {
                    console.log(`Using cached recommendations for startup ${startupId} and investor ${investorId}`);
                    return {
                        recommendations: cachedRecommendations.recommendations,
                        precision: cachedRecommendations.precision
                    };
                }
            }

            // Fetch profiles
            const startup = await StartupProfileModel.findOne({ userId: startupId });
            const investor = await InvestorProfileModel.findOne({ userId: investorId });

            if (!startup || !investor) {
                throw new Error('Startup or investor profile not found');
            }

            // Fetch questionnaire submissions if available
            const startupQuestionnaire = await QuestionnaireSubmissionModel.findOne({
                userId: startupId,
                userRole: 'startup',
                status: 'submitted'
            });

            const investorQuestionnaire = await QuestionnaireSubmissionModel.findOne({
                userId: investorId,
                userRole: 'investor',
                status: 'submitted'
            });

            // Extract questionnaire responses if available
            const startupResponses = startupQuestionnaire
                ? Object.fromEntries(startupQuestionnaire.responses)
                : {};

            const investorResponses = investorQuestionnaire
                ? Object.fromEntries(investorQuestionnaire.responses)
                : {};

            // Generate recommendations using Gemini
            const recommendations = await this.generateRecommendationsWithGemini(
                startup,
                investor,
                perspective,
                startupResponses,
                investorResponses
            );

            // Cache the recommendations
            try {
                console.log(`Attempting to save recommendations to MongoDB for startup ${startupId} and investor ${investorId}`);

                // Validate data before saving
                if (!recommendations.recommendations || !Array.isArray(recommendations.recommendations)) {
                    console.error('Invalid recommendations format, cannot save to MongoDB');
                    return recommendations;
                }

                // Log the data being saved
                console.log(`Saving ${recommendations.recommendations.length} recommendations with precision ${recommendations.precision}`);

                const newRecommendation = await RecommendationModel.create({
                    startupId: startupId,
                    investorId: investorId,
                    perspective: perspective,
                    recommendations: recommendations.recommendations,
                    precision: recommendations.precision,
                    createdAt: new Date(),
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expire after 30 days
                });

                console.log(`Successfully saved recommendations to MongoDB with ID: ${newRecommendation._id}`);
            } catch (dbError) {
                console.error('Error saving recommendations to MongoDB:', dbError);
                // Continue execution even if caching fails
            }

            return recommendations;
        } catch (error) {
            console.error('Error generating recommendations:', error);

            // If this is a validation error, rethrow it instead of providing fallbacks
            if (error instanceof Error && error.message.includes('Invalid perspective:')) {
                throw error;
            }

            // If there's an error, check for any existing recommendations regardless of age
            try {
                console.log(`Attempting to find any cached recommendations after error for startup ${startupId} and investor ${investorId}`);

                // Try with exact match first
                const oldRecommendations = await RecommendationModel.findOne({
                    startupId: startupId,
                    investorId: investorId,
                    perspective: perspective
                }).sort({ createdAt: -1 }); // Get the most recent one

                if (oldRecommendations) {
                    console.log(`Found cached recommendations with exact match: ${JSON.stringify({
                        id: oldRecommendations._id,
                        createdAt: oldRecommendations.createdAt,
                        recommendationCount: oldRecommendations.recommendations.length
                    })}`);

                    return {
                        recommendations: oldRecommendations.recommendations,
                        precision: oldRecommendations.precision
                    };
                }

                // If no exact match, try with reversed perspective as fallback
                const reversedPerspective = perspective === 'startup' ? 'investor' : 'startup';
                console.log(`Trying with reversed perspective: ${reversedPerspective}`);

                const reversedRecommendations = await RecommendationModel.findOne({
                    startupId: startupId,
                    investorId: investorId,
                    perspective: reversedPerspective
                }).sort({ createdAt: -1 });

                if (reversedRecommendations) {
                    console.log(`Found cached recommendations with reversed perspective`);
                    return {
                        recommendations: reversedRecommendations.recommendations,
                        precision: reversedRecommendations.precision
                    };
                }

                console.log(`No cached recommendations found for startup ${startupId} and investor ${investorId}`);
            } catch (cacheError) {
                console.error('Error retrieving cached recommendations:', cacheError);
            }

            // Return fallback recommendations if generation fails and no cache is available
            console.log(`Using fallback recommendations for ${perspective}`);
            return this.getFallbackRecommendations(perspective);
        }
    }

    /**
     * Generate recommendations using Gemini AI
     */
    private async generateRecommendationsWithGemini(
        startup: any,
        investor: any,
        perspective: 'startup' | 'investor',
        startupResponses: Record<string, any>,
        investorResponses: Record<string, any>
    ): Promise<RecommendationResult> {
        try {
            // Create prompt based on perspective
            const prompt = this.createRecommendationPrompt(
                startup,
                investor,
                perspective,
                startupResponses,
                investorResponses
            );

            // Call Gemini API
            const result = await model.generateContent(prompt);
            const response = result.response;
            const textResponse = response.text();

            // Clean and parse the response
            const cleanedResponse = cleanJsonResponse(textResponse);

            // Use our safe JSON parser that can handle common issues
            const parsedResponse = safeJsonParse(cleanedResponse);

            if (parsedResponse === null) {
                console.error('Failed to parse Gemini response even with error correction');
                console.error('Raw response:', textResponse);
                throw new Error('Failed to parse Gemini response');
            }

            // Ensure the response has the expected structure
            if (!parsedResponse.recommendations || !Array.isArray(parsedResponse.recommendations)) {
                throw new Error('Invalid response format from Gemini');
            }

            return {
                recommendations: parsedResponse.recommendations,
                precision: parsedResponse.precision || 94
            };
        } catch (error) {
            console.error('Error generating recommendations with Gemini:', error);
            throw error;
        }
    }

    /**
     * Create a prompt for generating recommendations
     */
    private createRecommendationPrompt(
        startup: any,
        investor: any,
        perspective: 'startup' | 'investor',
        startupResponses: Record<string, any>,
        investorResponses: Record<string, any>
    ): string {
        // Determine the target audience based on perspective
        const targetAudience = perspective === 'startup' ? 'startup' : 'investor';

        // Safely extract values with fallbacks
        const startupName = startup?.companyName || 'Unknown Startup';
        const startupIndustry = startup?.industry || 'Unknown Industry';
        const startupStage = startup?.fundingStage || 'Unknown Stage';
        const startupLocation = startup?.location || 'Not specified';
        const employeeCount = startup?.employeeCount || 'Not specified';
        const pitch = startup?.pitch || 'Not specified';

        // Safely handle investor data
        const investorName = investor?.companyName || 'Unknown Investor';

        // Set target and counterparty names based on perspective
        const targetName = perspective === 'startup' ? startupName : investorName;
        const counterpartyName = perspective === 'startup' ? investorName : startupName;

        // Safely handle arrays
        const industriesOfInterest = Array.isArray(investor?.industriesOfInterest)
            ? investor.industriesOfInterest.join(', ')
            : 'Unknown Industries';

        const preferredStages = Array.isArray(investor?.preferredStages)
            ? investor.preferredStages.join(', ')
            : 'Unknown Stages';

        const investmentCriteria = Array.isArray(investor?.investmentCriteria)
            ? investor.investmentCriteria.join(', ')
            : 'Not specified';

        const ticketSize = investor?.ticketSize || 'Not specified';

        // Safely stringify responses
        const safeStartupResponses = JSON.stringify(startupResponses || {});
        const safeInvestorResponses = JSON.stringify(investorResponses || {});

        return `
        You are an expert advisor for ${targetAudience}s in the startup ecosystem. Generate personalized, actionable recommendations for ${targetName} regarding their potential match with ${counterpartyName}.

        STARTUP INFORMATION:
        - Company: ${startupName}
        - Industry: ${startupIndustry}
        - Funding Stage: ${startupStage}
        - Location: ${startupLocation}
        - Employee Count: ${employeeCount}
        - Pitch: ${pitch}
        - Questionnaire Responses: ${safeStartupResponses}

        INVESTOR INFORMATION:
        - Company: ${investorName}
        - Industries of Interest: ${industriesOfInterest}
        - Preferred Stages: ${preferredStages}
        - Ticket Size: ${ticketSize}
        - Investment Criteria: ${investmentCriteria}
        - Questionnaire Responses: ${safeInvestorResponses}

        TASK:
        Generate 4-6 personalized, actionable recommendations for the ${targetAudience} (${targetName}) regarding their potential match with ${counterpartyName}.

        Each recommendation should include:
        1. A clear, specific title
        2. A brief summary (1 sentence)
        3. Detailed explanation with specific actions (2-3 sentences)
        4. Category (one of: strategic, operational, financial, communication, growth)
        5. Priority level (high, medium, or low)
        6. Confidence score (0-100)

        The recommendations should be tailored to the ${targetAudience}'s perspective and should help them:
        - Maximize the potential of this specific match
        - Address potential challenges or misalignments
        - Leverage their strengths in the relationship
        - Mitigate risks specific to this partnership

        Format your response as a JSON object with the following structure:
        {
          "recommendations": [
            {
              "id": "unique_id",
              "title": "Recommendation Title",
              "summary": "Brief one-sentence summary",
              "details": "Detailed explanation with specific actions",
              "category": "category_name",
              "priority": "priority_level",
              "confidence": confidence_score
            },
            ...
          ],
          "precision": precision_score
        }

        Ensure recommendations are specific to this match, not generic advice.
        `;
    }

    /**
     * Get fallback recommendations if Gemini generation fails
     */
    private getFallbackRecommendations(perspective: 'startup' | 'investor'): RecommendationResult {
        if (perspective === 'startup') {
            return {
                recommendations: [
                    {
                        id: "alignment",
                        title: "Align Growth Metrics with Investor Expectations",
                        summary: "Ensure your growth metrics match what this investor typically looks for",
                        details: "Review the investor's past investments to identify common growth patterns they value. Prepare to discuss how your current metrics align with these expectations and your plan to maintain growth.",
                        category: "strategic",
                        priority: "high",
                        confidence: 92
                    },
                    {
                        id: "communication",
                        title: "Establish Clear Communication Channels",
                        summary: "Set up structured communication protocols from the beginning",
                        details: "Based on this investor's portfolio management style, propose a communication framework that includes regular updates, milestone reporting, and crisis management protocols.",
                        category: "communication",
                        priority: "medium",
                        confidence: 88
                    },
                    {
                        id: "expertise",
                        title: "Leverage Investor's Industry Expertise",
                        summary: "Identify specific areas where this investor's expertise can accelerate your growth",
                        details: "Map out 3-5 specific challenges where this investor's experience in your industry could provide valuable insights or connections. Prepare targeted questions for your next meeting.",
                        category: "operational",
                        priority: "medium",
                        confidence: 85
                    }
                ],
                precision: 88
            };
        } else {
            return {
                recommendations: [
                    {
                        id: "diligence",
                        title: "Conduct Targeted Technical Due Diligence",
                        summary: "Focus due diligence on the startup's core technical capabilities",
                        details: "Based on this startup's industry and stage, prioritize technical validation of their core product claims. Consider bringing in a domain expert to evaluate their technology stack and development roadmap.",
                        category: "operational",
                        priority: "high",
                        confidence: 94
                    },
                    {
                        id: "milestones",
                        title: "Establish Clear Growth Milestones",
                        summary: "Define specific growth metrics and milestones aligned with funding",
                        details: "Work with the founding team to establish 3-5 critical business metrics that will define success over the next 12-18 months. Tie these metrics to specific funding tranches to manage risk.",
                        category: "financial",
                        priority: "high",
                        confidence: 90
                    },
                    {
                        id: "network",
                        title: "Activate Relevant Network Connections",
                        summary: "Identify specific network connections that could accelerate this startup",
                        details: "Based on this startup's industry and growth stage, prepare a shortlist of 5-7 key connections from your network that could provide strategic value through partnerships, customer introductions, or advisory roles.",
                        category: "strategic",
                        priority: "medium",
                        confidence: 87
                    }
                ],
                precision: 90
            };
        }
    }
}

export default new RecommendationService();

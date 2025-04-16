import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import StartupProfileModel from '../models/Profile/StartupProfile';
import InvestorProfileModel from '../models/InvestorModels/InvestorProfile';
import QuestionnaireSubmissionModel from '../models/question/QuestionnaireSubmission';
import { cleanJsonResponse } from '../utils/jsonHelper';

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
});

/**
 * Weights for different profile attributes in matching algorithm
 */
const ATTRIBUTE_WEIGHTS = {
    // Core matching criteria
    industry: 25,
    fundingStage: 25,

    // Additional profile attributes
    location: 10,
    teamSize: 5,
    investmentCriteria: 15,

    // Questionnaire-based attributes
    valueAlignment: 20
};

/**
 * Interface for match score result
 */
interface MatchScoreResult {
    score: number;
    breakdown: {
        industryMatch: number;
        stageMatch: number;
        locationMatch: number;
        teamSizeMatch: number;
        investmentCriteriaMatch: number;
        valueAlignmentMatch: number;
    };
    insights: string[];
}

class MLMatchingService {
    /**
     * Calculate a weighted match score between a startup and an investor
     * @param startupId Startup user ID
     * @param investorId Investor user ID
     * @returns Match score with breakdown
     */
    async calculateMatchScore(startupId: string, investorId: string): Promise<MatchScoreResult> {
        try {
            // Fetch core profiles first - these are essential
            const startup = await StartupProfileModel.findOne({ userId: startupId });
            const investor = await InvestorProfileModel.findOne({ userId: investorId });

            if (!startup || !investor) {
                throw new Error('Startup or investor profile not found');
            }

            // Calculate base match score - these are always available
            const industryMatch = this.calculateIndustryMatch(
                startup.industry || '',
                Array.isArray(investor.industriesOfInterest) ? investor.industriesOfInterest : []
            );

            const stageMatch = this.calculateStageMatch(
                startup.fundingStage || '',
                Array.isArray(investor.preferredStages) ? investor.preferredStages : []
            );

            // Calculate additional match factors with null/undefined checks
            const locationMatch = this.calculateLocationMatch(
                startup.location || '',
                (investor as any).location || ''
            );

            const teamSizeMatch = this.calculateTeamSizeMatch(
                startup.employeeCount,
                investor.ticketSize
            );

            const investmentCriteriaMatch = this.calculateInvestmentCriteriaMatch(startup, investor);

            // Only fetch questionnaire data if needed for value alignment
            let valueAlignmentMatch = 50; // Default neutral score

            // Only make these database calls if we need them for the calculation
            if (ATTRIBUTE_WEIGHTS.valueAlignment > 0) {
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

                // Calculate value alignment from questionnaires if available
                valueAlignmentMatch = await this.calculateValueAlignmentMatch(
                    startupQuestionnaire,
                    investorQuestionnaire,
                    startup,
                    investor
                );
            }

            // Calculate weighted score
            const weightedScore = (
                (industryMatch * ATTRIBUTE_WEIGHTS.industry) +
                (stageMatch * ATTRIBUTE_WEIGHTS.fundingStage) +
                (locationMatch * ATTRIBUTE_WEIGHTS.location) +
                (teamSizeMatch * ATTRIBUTE_WEIGHTS.teamSize) +
                (investmentCriteriaMatch * ATTRIBUTE_WEIGHTS.investmentCriteria) +
                (valueAlignmentMatch * ATTRIBUTE_WEIGHTS.valueAlignment)
            ) / 100;

            // Generate insights using Gemini
            const insights = await this.generateMatchInsights(
                startup,
                investor,
                {
                    industryMatch,
                    stageMatch,
                    locationMatch,
                    teamSizeMatch,
                    investmentCriteriaMatch,
                    valueAlignmentMatch
                }
            );

            return {
                score: Math.round(weightedScore),
                breakdown: {
                    industryMatch,
                    stageMatch,
                    locationMatch,
                    teamSizeMatch,
                    investmentCriteriaMatch,
                    valueAlignmentMatch
                },
                insights
            };
        } catch (error) {
            console.error('Error calculating match score:', error);
            throw error;
        }
    }

    /**
     * Calculate industry match score (0-100)
     */
    private calculateIndustryMatch(startupIndustry: string, investorIndustries: string[]): number {
        if (investorIndustries.includes(startupIndustry)) {
            return 100;
        }

        // Check for partial matches (e.g., "Software" in "Software & Technology")
        for (const industry of investorIndustries) {
            if (
                startupIndustry.toLowerCase().includes(industry.toLowerCase()) ||
                industry.toLowerCase().includes(startupIndustry.toLowerCase())
            ) {
                return 70;
            }
        }

        return 0;
    }

    /**
     * Calculate funding stage match score (0-100)
     */
    private calculateStageMatch(startupStage: string, investorStages: string[]): number {
        if (investorStages.includes(startupStage)) {
            return 100;
        }

        // Check for adjacent stages
        const stageOrder = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Growth'];
        const startupStageIndex = stageOrder.findIndex(stage =>
            stage.toLowerCase() === startupStage.toLowerCase()
        );

        if (startupStageIndex === -1) return 0;

        for (const stage of investorStages) {
            const investorStageIndex = stageOrder.findIndex(s =>
                s.toLowerCase() === stage.toLowerCase()
            );

            if (investorStageIndex === -1) continue;

            // If stages are adjacent, give partial score
            if (Math.abs(startupStageIndex - investorStageIndex) === 1) {
                return 50;
            }
        }

        return 0;
    }

    /**
     * Calculate location match score (0-100)
     */
    private calculateLocationMatch(startupLocation?: string, investorLocation?: string): number {
        if (!startupLocation || !investorLocation) return 50; // Neutral if data missing

        if (startupLocation.toLowerCase() === investorLocation.toLowerCase()) {
            return 100;
        }

        // Check if locations are in the same region/country
        const startupRegion = this.extractRegion(startupLocation);
        const investorRegion = this.extractRegion(investorLocation);

        if (startupRegion && investorRegion && startupRegion === investorRegion) {
            return 70;
        }

        return 30; // Different locations
    }

    /**
     * Extract region/country from location string
     */
    private extractRegion(location: string): string | null {
        // Simple extraction - could be enhanced with a location database
        const parts = location.split(',').map(part => part.trim());
        return parts.length > 1 ? parts[parts.length - 1] : parts[0];
    }

    /**
     * Calculate team size to ticket size match score (0-100)
     */
    private calculateTeamSizeMatch(employeeCount?: string, ticketSize?: string): number {
        if (!employeeCount || !ticketSize) return 50; // Neutral if data missing

        // Map employee count ranges to appropriate ticket sizes
        const sizeToTicketMap: Record<string, string[]> = {
            '1-5': ['$10K - $50K', '$50K - $250K'],
            '6-10': ['$50K - $250K', '$250K - $1M'],
            '11-25': ['$250K - $1M', '$1M - $5M'],
            '26-50': ['$1M - $5M', '$5M - $20M'],
            '51-100': ['$5M - $20M', '$20M+'],
            '101-250': ['$5M - $20M', '$20M+'],
            '251+': ['$20M+']
        };

        const appropriateTickets = sizeToTicketMap[employeeCount] || [];

        if (appropriateTickets.includes(ticketSize)) {
            return 100;
        }

        // Check if ticket size is adjacent to appropriate range
        const ticketOrder = ['$10K - $50K', '$50K - $250K', '$250K - $1M', '$1M - $5M', '$5M - $20M', '$20M+'];
        const ticketIndex = ticketOrder.indexOf(ticketSize);

        for (const appropriate of appropriateTickets) {
            const appropriateIndex = ticketOrder.indexOf(appropriate);
            if (Math.abs(ticketIndex - appropriateIndex) === 1) {
                return 50;
            }
        }

        return 30; // Mismatch but not completely incompatible
    }

    /**
     * Calculate investment criteria match score (0-100)
     */
    private calculateInvestmentCriteriaMatch(startup: any, investor: any): number {
        // Safely check if investment criteria exists and is an array
        const investmentCriteria = Array.isArray(investor.investmentCriteria) ? investor.investmentCriteria : [];

        if (investmentCriteria.length === 0) {
            return 50; // Neutral if no criteria specified
        }

        let matchCount = 0;
        const totalCriteria = investmentCriteria.length;

        // Check each investment criterion against startup profile
        for (const criterion of investmentCriteria) {
            // Skip if criterion is not a string
            if (typeof criterion !== 'string') continue;

            const criterionLower = criterion.toLowerCase();

            // Check if criterion is met in startup profile with null/undefined checks
            if (
                (criterionLower.includes('revenue') && startup.revenue) ||
                (criterionLower.includes('team') && startup.employeeCount) ||
                (criterionLower.includes('market') && startup.industry) ||
                (criterionLower.includes('traction') && startup.pitch && typeof startup.pitch === 'string' && startup.pitch.toLowerCase().includes('traction')) ||
                (criterionLower.includes('product') && startup.pitch && typeof startup.pitch === 'string' && startup.pitch.toLowerCase().includes('product'))
            ) {
                matchCount++;
            }
        }

        // Avoid division by zero
        return totalCriteria > 0 ? Math.round((matchCount / totalCriteria) * 100) : 50;
    }

    /**
     * Calculate value alignment match score from questionnaires (0-100)
     */
    private async calculateValueAlignmentMatch(
        startupQuestionnaire: any,
        investorQuestionnaire: any,
        startup: any,
        investor: any
    ): Promise<number> {
        if (!startupQuestionnaire || !investorQuestionnaire) {
            return 50; // Neutral if questionnaires not available
        }

        // Extract responses
        const startupResponses = Object.fromEntries(startupQuestionnaire.responses);
        const investorResponses = Object.fromEntries(investorQuestionnaire.responses);

        // Calculate alignment based on questionnaire categories
        let alignmentScore = 0;
        let categoryCount = 0;

        if (startupQuestionnaire.analysisResults && investorQuestionnaire.analysisResults) {
            const startupCategories = startupQuestionnaire.analysisResults.categories;
            const investorCategories = investorQuestionnaire.analysisResults.categories;

            // Compare category scores
            for (const [category, startupScore] of Object.entries(startupCategories)) {
                if (investorCategories[category]) {
                    const investorScore = investorCategories[category];
                    const categoryAlignment = 100 - Math.abs(Number(startupScore) - Number(investorScore));
                    alignmentScore += categoryAlignment;
                    categoryCount++;
                }
            }

            if (categoryCount > 0) {
                return Math.round(alignmentScore / categoryCount);
            }
        }

        // If no category analysis available, use Gemini to analyze alignment
        return await this.analyzeValueAlignmentWithGemini(
            startupResponses,
            investorResponses,
            startup,
            investor
        );
    }

    /**
     * Use Gemini to analyze value alignment between startup and investor
     */
    private async analyzeValueAlignmentWithGemini(
        startupResponses: Record<string, any>,
        investorResponses: Record<string, any>,
        startup: any,
        investor: any
    ): Promise<number> {
        try {
            // Safely extract values with fallbacks
            const companyName = startup?.companyName || 'Unknown Startup';
            const industry = startup?.industry || 'Unknown Industry';
            const fundingStage = startup?.fundingStage || 'Unknown Stage';

            // Safely handle arrays
            const industriesOfInterest = Array.isArray(investor?.industriesOfInterest)
                ? investor.industriesOfInterest.join(', ')
                : 'Unknown Industries';

            const preferredStages = Array.isArray(investor?.preferredStages)
                ? investor.preferredStages.join(', ')
                : 'Unknown Stages';

            // Safely stringify responses
            const safeStartupResponses = JSON.stringify(startupResponses || {});
            const safeInvestorResponses = JSON.stringify(investorResponses || {});

            const prompt = `
            You are an expert in startup-investor matching. Analyze the value alignment between this startup and investor based on their questionnaire responses.

            Startup: ${companyName}
            Industry: ${industry}
            Stage: ${fundingStage}
            Startup Questionnaire Responses: ${safeStartupResponses}

            Investor: ${investor?.companyName || 'Unknown Investor'}
            Industries of Interest: ${industriesOfInterest}
            Preferred Stages: ${preferredStages}
            Investor Questionnaire Responses: ${safeInvestorResponses}

            Analyze the value alignment between this startup and investor. Focus on:
            1. Leadership style compatibility
            2. Communication preferences
            3. Risk tolerance alignment
            4. Long-term vision compatibility
            5. Decision-making approach

            Return a single number between 0-100 representing the overall value alignment score.
            Format your response as a JSON object with a single key "alignmentScore" and a numeric value.
            `;

            const result = await model.generateContent(prompt);
            const response = result.response;
            const textResponse = response.text();

            // Clean and parse the response
            const cleanedResponse = cleanJsonResponse(textResponse);
            const parsedResponse = JSON.parse(cleanedResponse);

            return parsedResponse.alignmentScore;
        } catch (error) {
            console.error('Error analyzing value alignment with Gemini:', error);
            return 50; // Default to neutral if analysis fails
        }
    }

    /**
     * Generate match insights using Gemini
     */
    private async generateMatchInsights(
        startup: any,
        investor: any,
        matchBreakdown: Record<string, number>
    ): Promise<string[]> {
        try {
            // Safely extract values with fallbacks
            const startupName = startup?.companyName || 'Unknown Startup';
            const industry = startup?.industry || 'Unknown Industry';
            const fundingStage = startup?.fundingStage || 'Unknown Stage';
            const startupLocation = startup?.location || 'Not specified';
            const employeeCount = startup?.employeeCount || 'Not specified';
            const pitch = startup?.pitch || 'Not specified';

            // Safely handle investor data
            const investorName = investor?.companyName || 'Unknown Investor';

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

            const investorLocation = (investor as any)?.location || 'Not specified';
            const ticketSize = (investor as any)?.ticketSize || 'Not specified';

            const prompt = `
            You are an expert in startup-investor matching. Generate 3-5 specific, actionable insights about the match between this startup and investor.

            Startup: ${startupName}
            Industry: ${industry}
            Stage: ${fundingStage}
            Location: ${startupLocation}
            Employee Count: ${employeeCount}
            Pitch: ${pitch}

            Investor: ${investorName}
            Industries of Interest: ${industriesOfInterest}
            Preferred Stages: ${preferredStages}
            Ticket Size: ${ticketSize}
            Investment Criteria: ${investmentCriteria}
            Location: ${investorLocation}

            Match Breakdown:
            - Industry Match: ${matchBreakdown.industryMatch || 0}%
            - Funding Stage Match: ${matchBreakdown.stageMatch || 0}%
            - Location Match: ${matchBreakdown.locationMatch || 0}%
            - Team Size to Ticket Size Match: ${matchBreakdown.teamSizeMatch || 0}%
            - Investment Criteria Match: ${matchBreakdown.investmentCriteriaMatch || 0}%
            - Value Alignment Match: ${matchBreakdown.valueAlignmentMatch || 0}%

            Generate 3-5 specific, actionable insights about this match. Focus on strengths, potential challenges, and specific recommendations for both parties.
            Format your response as a JSON array of strings, with each string being a single insight.
            `;

            const result = await model.generateContent(prompt);
            const response = result.response;
            const textResponse = response.text();

            // Clean and parse the response
            const cleanedResponse = cleanJsonResponse(textResponse);
            const parsedResponse = JSON.parse(cleanedResponse);

            return Array.isArray(parsedResponse) ? parsedResponse : [];
        } catch (error) {
            console.error('Error generating match insights with Gemini:', error);
            return [
                'Industry alignment suggests potential for successful partnership.',
                'Consider discussing expectations around funding and growth milestones.',
                'Explore alignment on long-term vision and exit strategy.'
            ]; // Default insights if generation fails
        }
    }

    /**
     * Find top matches for a startup
     * @param startupId Startup user ID
     * @param limit Maximum number of matches to return
     * @returns Array of scored matches
     */
    async findMatchesForStartup(startupId: string, limit: number = 10): Promise<any[]> {
        try {
            // Get startup details
            const startup = await StartupProfileModel.findOne({ userId: startupId });

            if (!startup) {
                throw new Error('Startup profile not found');
            }

            // Find potential matching investors based on basic criteria
            const potentialInvestors = await InvestorProfileModel.find({
                $or: [
                    { industriesOfInterest: startup.industry },
                    { preferredStages: startup.fundingStage }
                ]
            });

            // Calculate match scores for each investor
            const scoredMatches = await Promise.all(
                potentialInvestors.map(async (investor) => {
                    try {
                        const matchResult = await this.calculateMatchScore(startupId, investor.userId);

                        return {
                            investorId: investor.userId,
                            companyName: investor.companyName,
                            matchScore: matchResult.score,
                            breakdown: matchResult.breakdown,
                            insights: matchResult.insights,
                            industriesOfInterest: investor.industriesOfInterest,
                            preferredStages: investor.preferredStages,
                            ticketSize: investor.ticketSize
                        };
                    } catch (error) {
                        console.error(`Error calculating match score for investor ${investor.userId}:`, error);
                        return null;
                    }
                })
            );

            // Filter out null results and sort by match score
            const validMatches = scoredMatches
                .filter(match => match !== null)
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, limit);

            return validMatches;
        } catch (error) {
            console.error('Error finding matches for startup:', error);
            throw error;
        }
    }

    /**
     * Find top matches for an investor
     * @param investorId Investor user ID
     * @param limit Maximum number of matches to return
     * @returns Array of scored matches
     */
    async findMatchesForInvestor(investorId: string, limit: number = 10): Promise<any[]> {
        try {
            // Get investor details
            const investor = await InvestorProfileModel.findOne({ userId: investorId });

            if (!investor) {
                throw new Error('Investor profile not found');
            }

            // Find potential matching startups based on basic criteria
            const potentialStartups = await StartupProfileModel.find({
                $or: [
                    { industry: { $in: investor.industriesOfInterest } },
                    { fundingStage: { $in: investor.preferredStages } }
                ]
            });

            // Calculate match scores for each startup
            const scoredMatches = await Promise.all(
                potentialStartups.map(async (startup) => {
                    try {
                        const matchResult = await this.calculateMatchScore(startup.userId, investorId);

                        return {
                            startupId: startup.userId,
                            companyName: startup.companyName,
                            matchScore: matchResult.score,
                            breakdown: matchResult.breakdown,
                            insights: matchResult.insights,
                            industry: startup.industry,
                            fundingStage: startup.fundingStage,
                            location: startup.location
                        };
                    } catch (error) {
                        console.error(`Error calculating match score for startup ${startup.userId}:`, error);
                        return null;
                    }
                })
            );

            // Filter out null results and sort by match score
            const validMatches = scoredMatches
                .filter(match => match !== null)
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, limit);

            return validMatches;
        } catch (error) {
            console.error('Error finding matches for investor:', error);
            throw error;
        }
    }
}

export default new MLMatchingService();

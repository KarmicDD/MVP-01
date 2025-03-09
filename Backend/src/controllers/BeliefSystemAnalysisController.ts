import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import StartupProfileModel from '../models/Profile/StartupProfile';
import InvestorProfileModel from '../models/InvestorModels/InvestorProfile';
import ApiUsageModel from '../models/ApiUsageModel/ApiUsage';
import BeliefSystemAnalysisModel from '../models/BeliefSystemAnalysisModel';
import QuestionnaireSubmissionModel from '../models/question/QuestionnaireSubmission';

// Load environment variables
dotenv.config();

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || '';
if (!apiKey) {
    console.warn('Warning: GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-thinking-exp-01-21",
});

// Maximum API requests per day
const MAX_DAILY_REQUESTS = 5;

interface BeliefSystemAnalysis {
    overallMatch: number;
    compatibility: {
        visionAlignment: number;
        coreValues: number;
        businessGoals: number;
    };
    risks: {
        marketFitRisk: {
            level: string;
            description: string;
        };
        operationalRisk: {
            level: string;
            description: string;
        };
    };
    riskMitigationRecommendations: string[];
    improvementAreas: {
        strategicFocus: string;
        communication: string;
        growthMetrics: string;
    };
}

/**
 * Helper function to extract JSON from potentially markdown-wrapped response
 */
function cleanJsonResponse(text: string): string {
    const jsonRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const match = text.match(jsonRegex);

    if (match && match[1]) {
        return match[1].trim();
    }

    return text.trim();
}

/**
 * Helper function to check and update API usage limits
 */
async function checkRateLimit(userId: string): Promise<boolean> {
    // Find or create usage record for this user
    let usageRecord = await ApiUsageModel.findOne({ userId });

    if (!usageRecord) {
        usageRecord = await ApiUsageModel.create({
            userId,
            compatibilityRequestCount: 0,
            lastReset: new Date()
        });
    }

    // Check if we need to reset the counter (new day)
    const now = new Date();
    const lastReset = new Date(usageRecord.lastReset);
    if (now.getDate() !== lastReset.getDate() ||
        now.getMonth() !== lastReset.getMonth() ||
        now.getFullYear() !== lastReset.getFullYear()) {
        // Reset counter for new day
        usageRecord.compatibilityRequestCount = 0;
        usageRecord.lastReset = now;
    }

    // Check if user has reached limit
    if (usageRecord.compatibilityRequestCount >= MAX_DAILY_REQUESTS) {
        return false; // Limit reached
    }

    // Update counter and save
    usageRecord.compatibilityRequestCount += 1;
    await usageRecord.save();

    return true; // Under limit
}

/**
 * Analyzes belief system alignment between a startup and an investor
 */
export const analyzeBeliefSystemAlignment = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Check rate limit
        const underLimit = await checkRateLimit(req.user.userId);
        if (!underLimit) {
            res.status(429).json({
                message: 'Daily request limit reached',
                limit: MAX_DAILY_REQUESTS,
                nextReset: 'Tomorrow'
            });
            return;
        }

        const { startupId, investorId } = req.params;

        if (!startupId || !investorId) {
            res.status(400).json({ message: 'Startup ID and Investor ID are required' });
            return;
        }

        // Determine the user perspective based on their role
        let perspective: 'startup' | 'investor';

        // Check if the user is the startup or the investor
        if (req.user.userId === startupId) {
            perspective = 'startup';
        } else if (req.user.userId === investorId) {
            perspective = 'investor';
        } else {
            // Default perspective if not directly involved
            perspective = 'investor';
        }

        // Check if we have a recent analysis in MongoDB cache with matching perspective
        const existingAnalysis = await BeliefSystemAnalysisModel.findOne({
            startupId: startupId,
            investorId: investorId,
            perspective: perspective,
            // Only use cached results if less than 7 days old
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        if (existingAnalysis) {
            // Return cached analysis
            res.json({
                overallMatch: existingAnalysis.overallMatch,
                compatibility: existingAnalysis.compatibility,
                risks: existingAnalysis.risks,
                riskMitigationRecommendations: existingAnalysis.riskMitigationRecommendations,
                improvementAreas: existingAnalysis.improvementAreas,
                perspective: existingAnalysis.perspective,
                generatedDate: existingAnalysis.createdAt
            });
            return;
        }

        // Fetch startup data from MongoDB
        const startup = await StartupProfileModel.findOne({ userId: startupId });
        if (!startup) {
            res.status(404).json({ message: 'Startup not found' });
            return;
        }

        // Fetch investor data from MongoDB
        const investor = await InvestorProfileModel.findOne({ userId: investorId });
        if (!investor) {
            res.status(404).json({ message: 'Investor not found' });
            return;
        }

        // Fetch questionnaire data if available
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

        const startupResponses = startupQuestionnaire ? Object.fromEntries(startupQuestionnaire.responses) : {};
        const investorResponses = investorQuestionnaire ? Object.fromEntries(investorQuestionnaire.responses) : {};


        // Call Gemini API using the helper function with perspective
        const analysisData = await getBeliefSystemAnalysis(
            startup,
            investor,
            perspective,
            startupResponses,
            investorResponses
        );

        // Store analysis in MongoDB for caching
        await BeliefSystemAnalysisModel.create({
            startupId: startupId,
            investorId: investorId,
            perspective: perspective,
            overallMatch: analysisData.overallMatch,
            compatibility: analysisData.compatibility,
            risks: analysisData.risks,
            riskMitigationRecommendations: analysisData.riskMitigationRecommendations,
            improvementAreas: analysisData.improvementAreas,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expire after 30 days
        });

        // Return analysis data with current date as generation date
        res.json({
            overallMatch: analysisData.overallMatch,
            compatibility: analysisData.compatibility,
            risks: analysisData.risks,
            riskMitigationRecommendations: analysisData.riskMitigationRecommendations,
            improvementAreas: analysisData.improvementAreas,
            perspective: perspective,
            generatedDate: new Date()
        });

    } catch (error) {
        console.error('Belief system analysis error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Helper function to get belief system analysis between a startup and investor
 */
async function getBeliefSystemAnalysis(
    startup: any,
    investor: any,
    perspective: 'startup' | 'investor',
    startupQuestionnaire: any = {},
    investorQuestionnaire: any = {}
): Promise<BeliefSystemAnalysis> {
    const prompt = `
    You are a specialized investment advisor analyzing the belief system alignment between a startup and an investor.
    
    TASK: Analyze the belief system alignment between the following startup and investor from the perspective of the ${perspective}.
    
    RESPONSE FORMAT: Return ONLY valid JSON with this exact structure:
    {
      "overallMatch": (number between 0-100),
      "compatibility": {
        "visionAlignment": (number between 0-100),
        "coreValues": (number between 0-100),
        "businessGoals": (number between 0-100)
      },
      "risks": {
        "marketFitRisk": {
          "level": "High" or "Medium" or "Low",
          "description": "Brief description of risk"
        },
        "operationalRisk": {
          "level": "High" or "Medium" or "Low",
          "description": "Brief description of risk"
        }
      },
      "riskMitigationRecommendations": [
        "Recommendation 1",
        "Recommendation 2",
        "Recommendation 3"
      ],
      "improvementAreas": {
        "strategicFocus": "Description",
        "communication": "Description",
        "growthMetrics": "Description"
      }
    }
    
    ANALYSIS GUIDELINES:
    - Focus on underlying belief systems, values, and strategic approaches
    - Consider both explicit stated values and implicit values from descriptions
    - Evaluate risks based on potential misalignments in approach, expectations, or market understanding
    - Provide actionable recommendations that address the specific risks identified
    - Consider strategic, operational, and cultural compatibility
    
    DATA:
    
    Startup:
    - Company: ${startup.companyName}
    - Industry: ${startup.industry}
    - Funding Stage: ${startup.fundingStage}
    - Employees: ${startup.employeeCount || 'N/A'}
    - Location: ${startup.location || 'N/A'}
    - Pitch: ${startup.pitch || 'N/A'}
    - Questionnaire Responses: ${JSON.stringify(startupQuestionnaire)}
    
    Investor:
    - Company: ${investor.companyName}
    - Industries: ${investor.industriesOfInterest.join(', ')}
    - Preferred Stages: ${investor.preferredStages.join(', ')}
    - Ticket Size: ${investor.ticketSize || 'N/A'}
    - Investment Criteria: ${investor.investmentCriteria?.join(', ') || 'N/A'}
    - Past Investments: ${investor.pastInvestments || 'N/A'}
    - Questionnaire Responses: ${JSON.stringify(investorQuestionnaire)}

    BE VERY STRICT AND HARSH AND CRITICAL IN YOUR ANALYSIS. DO THE DUE DILIGENCE. BE THE EXPERT.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // Clean and parse the response
    const cleanedResponse = cleanJsonResponse(textResponse);
    try {
        return JSON.parse(cleanedResponse);
    } catch (error) {
        console.error('Error parsing AI response:', error);
        console.error('Raw response:', textResponse);
        console.error('Cleaned response:', cleanedResponse);

        // Return default structure in case of parsing error
        return {
            overallMatch: 50,
            compatibility: {
                visionAlignment: 50,
                coreValues: 50,
                businessGoals: 50
            },
            risks: {
                marketFitRisk: {
                    level: "Medium",
                    description: "Unable to determine specific risks"
                },
                operationalRisk: {
                    level: "Medium",
                    description: "Unable to determine specific risks"
                }
            },
            riskMitigationRecommendations: [
                "Conduct detailed alignment discussion",
                "Define clear operational KPIs",
                "Establish regular alignment meetings"
            ],
            improvementAreas: {
                strategicFocus: "Align long-term vision with investor expectations",
                communication: "Establish regular update cadence",
                growthMetrics: "Define mutually agreed success metrics"
            }
        };
    }
}
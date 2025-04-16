import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import StartupProfileModel from '../models/Profile/StartupProfile';
import InvestorProfileModel from '../models/InvestorModels/InvestorProfile';
import ApiUsageModel from '../models/ApiUsageModel/ApiUsage';
import BeliefSystemAnalysisModel from '../models/BeliefSystemAnalysisModel';
import { cleanJsonResponse } from '../utils/jsonHelper';
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
    generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
    }
});

// Maximum API requests per day
const MAX_DAILY_REQUESTS = 10;
// Analysis expiration in days
const ANALYSIS_EXPIRATION_DAYS = 5;

/**
 * Enhanced interface for the belief system analysis with more detailed fields
 */
interface BeliefSystemAnalysis {
    executiveSummary: {
        headline: string;
        keyFindings: string;
        recommendedActions: string;
        successProbability: number;
        keyNumbers: Array<{ label: string; value: string | number; color: string }>;
    };
    overallMatch: number;
    compatibility: {
        visionAlignment: number;
        coreValues: number;
        businessGoals: number;
        growthExpectations: number;
        innovation: number;
        riskApproach: number;
        communication: number;
        leadershipStyle: number;
        [key: string]: number;
    };
    scoringBreakdown: Array<{ label: string; score: number; description: string }>;
    strengths: Array<{ area: string; score: number; description: string }>;
    weaknesses: Array<{ area: string; score: number; description: string }>;
    risks: {
        marketFitRisk: {
            level: string;
            description: string;
            impactAreas: string[];
            factors: Array<{ factor: string; score: number }>;
        };
        operationalRisk: {
            level: string;
            description: string;
            impactAreas: string[];
            factors: Array<{ factor: string; score: number }>;
        };
        riskHeatmap: Array<{ risk: string; severity: string; probability: number; impact: number }>;
    };
    riskFactors: {
        marketFit: Array<{ factor: string; score: number }>;
        operational: Array<{ factor: string; score: number }>;
    };
    riskMitigationRecommendations: Array<{
        text: string;
        priority: 'High' | 'Medium' | 'Low';
        timeline: 'Immediate' | 'Short-term' | 'Medium-term' | 'Long-term';
    }>;
    improvementAreas: {
        strategicFocus: string;
        communication: string;
        growthMetrics: string;
        actions: {
            strategicFocus: string[];
            communication: string[];
            growthMetrics: string[];
        };
    };
}

interface RateLimitResult {
    underLimit: boolean;
    usageCount: number;
    maxRequests: number;
}

/**
 * Helper function to check and update API usage limits
 * @param userId User ID to check rate limits for
 */
async function checkRateLimit(userId: string): Promise<RateLimitResult> {
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
        await usageRecord.save();
    }

    // Check if user has reached limit
    if (usageRecord.compatibilityRequestCount >= MAX_DAILY_REQUESTS) {
        return {
            underLimit: false,
            usageCount: usageRecord.compatibilityRequestCount,
            maxRequests: MAX_DAILY_REQUESTS
        }; // Limit reached
    }

    // Update counter and save
    usageRecord.compatibilityRequestCount += 1;
    await usageRecord.save();

    return {
        underLimit: true,
        usageCount: usageRecord.compatibilityRequestCount,
        maxRequests: MAX_DAILY_REQUESTS
    }; // Under limit
}

/**
 * Adapts legacy analysis data to the new enhanced format if needed
 * @param analysis Analysis data that might be in old format
 */
function adaptLegacyAnalysisData(analysis: any): BeliefSystemAnalysis {
    // Handle legacy risk recommendation format (simple string array)
    const recommendations = Array.isArray(analysis.riskMitigationRecommendations)
        ? analysis.riskMitigationRecommendations.map((rec: string | any, index: number) => {
            // If it's already in the new format, return as is
            if (typeof rec === 'object' && rec.text && rec.priority && rec.timeline) {
                return rec;
            }

            // Otherwise convert string format to new format with priority based on index
            return {
                text: rec,
                priority: index === 0 ? 'High' : index === 1 ? 'Medium' : 'Low',
                timeline: index === 0 ? 'Immediate' : index === 1 ? 'Short-term' : 'Medium-term'
            };
        })
        : [];

    // Handle legacy risk format (without impactAreas)
    const marketFitRisk = {
        level: analysis.risks.marketFitRisk.level,
        description: analysis.risks.marketFitRisk.description,
        impactAreas: analysis.risks.marketFitRisk.impactAreas || [
            'Product-market alignment',
            'Customer acquisition strategy',
            'Competitive positioning'
        ],
        factors: analysis.risks.marketFitRisk.factors || [
            { factor: 'Market Timing', score: 65 },
            { factor: 'Customer Demand', score: 70 },
            { factor: 'Competitive Landscape', score: 60 },
            { factor: 'Product Maturity', score: 55 }
        ]
    };

    const operationalRisk = {
        level: analysis.risks.operationalRisk.level,
        description: analysis.risks.operationalRisk.description,
        impactAreas: analysis.risks.operationalRisk.impactAreas || [
            'Execution capabilities',
            'Resource allocation efficiency',
            'Process management'
        ],
        factors: analysis.risks.operationalRisk.factors || [
            { factor: 'Resource Allocation', score: 55 },
            { factor: 'Process Maturity', score: 60 },
            { factor: 'Team Expertise', score: 65 },
            { factor: 'Communication Efficiency', score: 50 }
        ]
    };

    // Handle legacy improvement areas (without actions)
    const improvementAreas = {
        strategicFocus: analysis.improvementAreas.strategicFocus,
        communication: analysis.improvementAreas.communication,
        growthMetrics: analysis.improvementAreas.growthMetrics,
        actions: analysis.improvementAreas.actions || {
            strategicFocus: [
                'Align on strategic vision and priorities',
                'Define shared success metrics'
            ],
            communication: [
                'Establish regular communication cadence',
                'Define expectations and reporting structure'
            ],
            growthMetrics: [
                'Develop shared KPI dashboard',
                'Set milestone-based growth targets'
            ]
        }
    };

    // Create default values for missing fields
    const executiveSummary = analysis.executiveSummary || {
        headline: 'Analysis Results',
        keyFindings: 'Key findings not available in legacy format.',
        recommendedActions: 'Recommended actions not available in legacy format.',
        successProbability: 50,
        keyNumbers: [
            { label: 'Overall Match', value: analysis.overallMatch || 50, color: 'bg-indigo-100 text-indigo-800' },
            { label: 'Vision Alignment', value: analysis.compatibility?.visionAlignment || 50, color: 'bg-blue-100 text-blue-800' },
            { label: 'Core Values', value: analysis.compatibility?.coreValues || 50, color: 'bg-green-100 text-green-800' },
            { label: 'Innovation', value: analysis.compatibility?.innovation || 65, color: 'bg-purple-100 text-purple-800' },
            { label: 'Communication', value: analysis.compatibility?.communication || 55, color: 'bg-yellow-100 text-yellow-800' }
        ]
    };

    const scoringBreakdown = analysis.scoringBreakdown || [
        { label: 'Vision Alignment', score: analysis.compatibility?.visionAlignment || 50, description: 'Alignment of long-term vision and goals' },
        { label: 'Core Values', score: analysis.compatibility?.coreValues || 50, description: 'Alignment of fundamental principles and values' },
        { label: 'Business Goals', score: analysis.compatibility?.businessGoals || 50, description: 'Alignment of business objectives and targets' }
    ];

    const strengths = analysis.strengths || [
        { area: 'Vision', score: analysis.compatibility?.visionAlignment || 50, description: 'Shared long-term vision' },
        { area: 'Values', score: analysis.compatibility?.coreValues || 50, description: 'Compatible core values' },
        { area: 'Goals', score: analysis.compatibility?.businessGoals || 50, description: 'Aligned business goals' }
    ];

    const weaknesses = analysis.weaknesses || [
        { area: 'Communication', score: 50, description: 'Communication structures need improvement' },
        { area: 'Expectations', score: 50, description: 'Expectations need to be better aligned' },
        { area: 'Metrics', score: 50, description: 'Success metrics need to be defined' }
    ];

    // Ensure compatibility has all required fields
    const enhancedCompatibility = {
        visionAlignment: analysis.compatibility?.visionAlignment || 50,
        coreValues: analysis.compatibility?.coreValues || 50,
        businessGoals: analysis.compatibility?.businessGoals || 50,
        growthExpectations: analysis.compatibility?.growthExpectations || 60,
        innovation: analysis.compatibility?.innovation || 65,
        riskApproach: analysis.compatibility?.riskApproach || 55,
        communication: analysis.compatibility?.communication || 60,
        leadershipStyle: analysis.compatibility?.leadershipStyle || 70
    };

    // Create risk factors
    const riskFactors = {
        marketFit: analysis.riskFactors?.marketFit || [
            { factor: 'Market Timing', score: 65 },
            { factor: 'Customer Demand', score: 70 },
            { factor: 'Competitive Landscape', score: 60 },
            { factor: 'Product Maturity', score: 55 }
        ],
        operational: analysis.riskFactors?.operational || [
            { factor: 'Resource Allocation', score: 55 },
            { factor: 'Process Maturity', score: 60 },
            { factor: 'Team Expertise', score: 65 },
            { factor: 'Communication Efficiency', score: 50 }
        ]
    };

    return {
        executiveSummary,
        overallMatch: analysis.overallMatch,
        compatibility: enhancedCompatibility,
        scoringBreakdown,
        strengths,
        weaknesses,
        risks: {
            marketFitRisk,
            operationalRisk,
            riskHeatmap: analysis.risks?.riskHeatmap || [
                { risk: 'Market Fit', severity: marketFitRisk.level, probability: 50, impact: 70 },
                { risk: 'Operational', severity: operationalRisk.level, probability: 50, impact: 60 },
                { risk: 'Communication', severity: 'Medium', probability: 50, impact: 50 }
            ]
        },
        riskFactors,
        riskMitigationRecommendations: recommendations,
        improvementAreas
    };
}

/**
 * Ensures all required executiveSummary fields are present with sensible defaults
 * @param ai Analysis data to ensure defaults for
 */
function ensureExecutiveSummaryDefaults(ai: any): any {
    if (!ai.executiveSummary) ai.executiveSummary = {};
    if (!ai.executiveSummary.headline) ai.executiveSummary.headline = 'No headline provided.';
    if (!ai.executiveSummary.keyFindings) ai.executiveSummary.keyFindings = 'No key findings provided.';
    if (!ai.executiveSummary.recommendedActions) ai.executiveSummary.recommendedActions = 'No recommended actions provided.';
    if (typeof ai.executiveSummary.successProbability !== 'number') ai.executiveSummary.successProbability = 50;
    if (!Array.isArray(ai.executiveSummary.keyNumbers)) ai.executiveSummary.keyNumbers = [];
    return ai;
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
        const rateLimitResult = await checkRateLimit(req.user.userId);

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

        if (!rateLimitResult.underLimit) {
            // If limit reached, check for any existing analysis regardless of age
            const oldAnalysis = await BeliefSystemAnalysisModel.findOne({
                startupId: startupId,
                investorId: investorId,
                perspective: perspective
            }).sort({ createdAt: -1 }); // Get the most recent one

            if (oldAnalysis) {
                // Adapt to new format if needed
                const adaptedAnalysis = adaptLegacyAnalysisData(oldAnalysis);

                // Return old analysis with a flag indicating it's old data
                res.json({
                    ...adaptedAnalysis,
                    perspective: oldAnalysis.perspective,
                    generatedDate: oldAnalysis.createdAt,
                    isOldData: true,
                    message: 'Daily request limit reached. Showing previously generated data.'
                });
                return;
            }

            // If no old data exists, return the rate limit error
            res.status(429).json({
                message: 'Daily request limit reached',
                limit: MAX_DAILY_REQUESTS,
                nextReset: 'Tomorrow',
                usageCount: rateLimitResult.usageCount
            });
            return;
        }

        // Check if we have a recent analysis in MongoDB cache with matching perspective
        const existingAnalysis = await BeliefSystemAnalysisModel.findOne({
            startupId: startupId,
            investorId: investorId,
            perspective: perspective,
            // Only use cached results if less than the expiration period
            createdAt: { $gte: new Date(Date.now() - ANALYSIS_EXPIRATION_DAYS * 24 * 60 * 60 * 1000) }
        });

        if (existingAnalysis) {
            // Adapt to new format if needed
            const adaptedAnalysis = adaptLegacyAnalysisData(existingAnalysis);

            // Return cached analysis
            res.json({
                ...adaptedAnalysis,
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
        let analysisData = await getBeliefSystemAnalysis(
            startup,
            investor,
            perspective,
            startupResponses,
            investorResponses
        );

        // Ensure all required executiveSummary fields are present
        analysisData = ensureExecutiveSummaryDefaults(analysisData);

        // Store analysis in MongoDB for caching
        await BeliefSystemAnalysisModel.create({
            startupId: startupId,
            investorId: investorId,
            perspective: perspective,
            executiveSummary: analysisData.executiveSummary,
            scoringBreakdown: analysisData.scoringBreakdown,
            strengths: analysisData.strengths,
            weaknesses: analysisData.weaknesses,
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
            ...analysisData,
            perspective: perspective,
            generatedDate: new Date()
        });

    } catch (error) {
        console.error('Belief system analysis error:', error);
        res.status(500).json({
            message: 'Server error processing belief system analysis',
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        });
    }
};

/**
 * Helper function to get belief system analysis between a startup and investor
 * @param startup Startup profile data
 * @param investor Investor profile data
 * @param perspective Analysis perspective ('startup' or 'investor')
 * @param startupQuestionnaire Optional startup questionnaire responses
 * @param investorQuestionnaire Optional investor questionnaire responses
 */
async function getBeliefSystemAnalysis(
    startup: any,
    investor: any,
    perspective: 'startup' | 'investor',
    startupQuestionnaire: any = {},
    investorQuestionnaire: any = {}
): Promise<BeliefSystemAnalysis> {
    // Determine target for user-centric reporting
    const subjectType = perspective === 'startup' ? 'Investor' : 'Startup';
    const userType = perspective === 'startup' ? 'Startup' : 'Investor';
    const userName = perspective === 'startup' ? startup.companyName : investor.companyName;
    const targetName = perspective === 'startup' ? investor.companyName : startup.companyName;

    const prompt = `
You are KarmicDD, a world-class due diligence analyst. Write a comprehensive, professional, and visually structured Belief System Due Diligence report for the ${userType} (${userName}) about the ${subjectType} (${targetName}).

**INSTRUCTIONS:**
- This report is for the requesting party (${userType}: ${userName}) to understand the other party (${subjectType}: ${targetName}) in depth for high-stakes investment/partnership decisions.
- Be ruthlessly honest, critical, and detailed. Use clear, concise, and professional language. Avoid generic statements.
- **Every field in the JSON below is required. Do not leave any field empty, null, or with placeholder text.**
- Provide all data in JSON, suitable for a dashboard with graphs, charts, and heatmaps.
- **IMPORTANT: Provide diverse and complementary data sets for different visualizations. The radar chart will show all 8 compatibility dimensions, while the bar chart will focus on business and growth metrics.**

**RESPONSE FORMAT:**
Return ONLY valid JSON with this exact structure (no markdown, no explanations, no missing fields):
{
  "executiveSummary": {
    "headline": string, // Required. A sharp, professional headline summarizing the most important finding.
    "keyFindings": string, // Required. A detailed, multi-sentence summary of the most critical findings.
    "recommendedActions": string, // Required. A concise, actionable set of recommendations for the requesting party. Format as a numbered list (1. Action one, 2. Action two, etc.)
    "successProbability": number, // Required. 0-100. Your best estimate of the probability of a successful partnership.
    "keyNumbers": [
      { "label": string, "value": string|number, "color": string } // Required. At least 5 key numbers with color for dashboard display. Use diverse metrics.
    ]
  },
  "overallMatch": number, // 0-100. Required.
  "compatibility": {
    "visionAlignment": number, // Required. For radar chart.
    "coreValues": number, // Required. For radar chart.
    "businessGoals": number, // Required. For both radar and bar charts.
    "growthExpectations": number, // Required. For both radar and bar charts.
    "innovation": number, // Required. For both radar and bar charts.
    "riskApproach": number, // Required. For both radar and bar charts.
    "communication": number, // Required. For radar chart.
    "leadershipStyle": number // Required. For radar chart.
  },
  "scoringBreakdown": [
    { "label": string, "score": number, "description": string } // Required. At least 4 items with detailed descriptions.
  ],
  "strengths": [
    { "area": string, "score": number, "description": string } // Required. At least 3 items with specific, actionable insights.
  ],
  "weaknesses": [
    { "area": string, "score": number, "description": string } // Required. At least 3 items with specific, actionable insights.
  ],
  "risks": {
    "marketFitRisk": {
      "level": "High"|"Medium"|"Low", // Required.
      "description": string, // Required.
      "impactAreas": [string], // Required. At least 3.
      "factors": [{ "factor": string, "score": number }] // Required. At least 3 factors with scores.
    },
    "operationalRisk": {
      "level": "High"|"Medium"|"Low", // Required.
      "description": string, // Required.
      "impactAreas": [string], // Required. At least 3.
      "factors": [{ "factor": string, "score": number }] // Required. At least 3 factors with scores.
    },
    "riskHeatmap": [
      { "risk": string, "severity": string, "probability": number, "impact": number } // Required. At least 3 items.
    ]
  },
  "riskFactors": {
    "marketFit": [{ "factor": string, "score": number }], // Required. Exactly 4 factors with scores for radar chart visualization.
    "operational": [{ "factor": string, "score": number }] // Required. Exactly 4 factors with scores for radar chart visualization.
  },
  "riskMitigationRecommendations": [
    { "text": string, "priority": "High"|"Medium"|"Low", "timeline": "Immediate"|"Short-term"|"Medium-term"|"Long-term" } // Required. At least 3 items.
  ],
  "improvementAreas": {
    "strategicFocus": string, // Required. Detailed, specific improvement area.
    "communication": string, // Required. Detailed, specific improvement area.
    "growthMetrics": string, // Required. Detailed, specific improvement area.
    "actions": {
      "strategicFocus": [string], // Required. At least 3 specific, actionable items.
      "communication": [string], // Required. At least 3 specific, actionable items.
      "growthMetrics": [string] // Required. At least 3 specific, actionable items.
    }
  }
}

**REQUIREMENTS:**
- The executive summary must be sharp, actionable, and highlight the most important findings for the ${userType}.
- All scores must be justified and suitable for radar/bar/pie charts.
- Provide diverse data for different visualizations - radar chart will show all 8 compatibility dimensions, while bar chart will focus on business and growth metrics.
- The riskHeatmap must include at least 3-5 key risks with severity, probability (0-100), and impact (0-100).
- Strengths and weaknesses must be specific, not generic, with actionable insights.
- Recommendations must be actionable, prioritized, and tailored to the ${userType}'s needs.
- Format the recommended actions as a numbered list (1. Action one, 2. Action two, etc.).
- Write as if you are the due diligence advisor for the ${userType}, evaluating the ${subjectType}.
- Use all available data below for your analysis.
- **Do not leave any field empty, null, or with placeholder text. Every field must be filled with detailed, professional content.**

**DATA:**
- Startup: ${JSON.stringify(startup)}
- Investor: ${JSON.stringify(investor)}
- Startup Questionnaire: ${JSON.stringify(startupQuestionnaire)}
- Investor Questionnaire: ${JSON.stringify(investorQuestionnaire)}

**REMEMBER:**
- This is a professional due diligence report for a real business decision.
- Be critical, detailed, and provide all data for a modern dashboard.
- **If you cannot fill a field, use your best judgment to provide a professional, plausible value. Never leave a field blank.**
`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const textResponse = response.text();

        // Clean and parse the response
        const cleanedResponse = cleanJsonResponse(textResponse);

        try {
            const parsedResponse = JSON.parse(cleanedResponse);

            // Ensure the response has the expected structure
            return adaptLegacyAnalysisData(parsedResponse);
        } catch (error) {
            console.error('Error parsing AI response:', error);
            console.error('Raw response:', textResponse);
            console.error('Cleaned response:', cleanedResponse);

            // Return default structure in case of parsing error
            return {
                executiveSummary: {
                    headline: 'Analysis Results',
                    keyFindings: 'Unable to generate detailed findings due to technical limitations.',
                    recommendedActions: 'Consider reviewing profiles manually and scheduling a direct discussion.',
                    successProbability: 50,
                    keyNumbers: [
                        { label: 'Overall Match', value: 50, color: 'bg-indigo-100 text-indigo-800' },
                        { label: 'Vision Alignment', value: 50, color: 'bg-blue-100 text-blue-800' },
                        { label: 'Core Values', value: 50, color: 'bg-green-100 text-green-800' },
                        { label: 'Innovation', value: 65, color: 'bg-purple-100 text-purple-800' },
                        { label: 'Communication', value: 55, color: 'bg-yellow-100 text-yellow-800' }
                    ]
                },
                overallMatch: 50,
                compatibility: {
                    visionAlignment: 50,
                    coreValues: 50,
                    businessGoals: 50,
                    growthExpectations: 60,
                    innovation: 65,
                    riskApproach: 55,
                    communication: 60,
                    leadershipStyle: 70
                },
                scoringBreakdown: [
                    { label: 'Vision Alignment', score: 50, description: 'Alignment of long-term vision and goals' },
                    { label: 'Core Values', score: 50, description: 'Alignment of fundamental principles and values' },
                    { label: 'Business Goals', score: 50, description: 'Alignment of business objectives and targets' }
                ],
                strengths: [
                    { area: 'Vision', score: 50, description: 'Shared long-term vision' },
                    { area: 'Values', score: 50, description: 'Compatible core values' },
                    { area: 'Goals', score: 50, description: 'Aligned business goals' }
                ],
                weaknesses: [
                    { area: 'Communication', score: 50, description: 'Communication structures need improvement' },
                    { area: 'Expectations', score: 50, description: 'Expectations need to be better aligned' },
                    { area: 'Metrics', score: 50, description: 'Success metrics need to be defined' }
                ],
                risks: {
                    marketFitRisk: {
                        level: "Medium",
                        description: "Unable to determine specific risks due to technical limitations",
                        impactAreas: [
                            'Product-market alignment',
                            'Customer acquisition strategy',
                            'Competitive positioning'
                        ],
                        factors: [
                            { factor: 'Market Timing', score: 65 },
                            { factor: 'Customer Demand', score: 70 },
                            { factor: 'Competitive Landscape', score: 60 },
                            { factor: 'Product Maturity', score: 55 }
                        ]
                    },
                    operationalRisk: {
                        level: "Medium",
                        description: "Unable to determine specific risks due to technical limitations",
                        impactAreas: [
                            'Execution capabilities',
                            'Resource allocation efficiency',
                            'Process management'
                        ],
                        factors: [
                            { factor: 'Resource Allocation', score: 55 },
                            { factor: 'Process Maturity', score: 60 },
                            { factor: 'Team Expertise', score: 65 },
                            { factor: 'Communication Efficiency', score: 50 }
                        ]
                    },
                    riskHeatmap: [
                        { risk: 'Market Fit', severity: 'Medium', probability: 50, impact: 70 },
                        { risk: 'Operational', severity: 'Medium', probability: 50, impact: 60 },
                        { risk: 'Communication', severity: 'Medium', probability: 50, impact: 50 }
                    ]
                },
                riskFactors: {
                    marketFit: [
                        { factor: 'Market Timing', score: 65 },
                        { factor: 'Customer Demand', score: 70 },
                        { factor: 'Competitive Landscape', score: 60 },
                        { factor: 'Product Maturity', score: 55 }
                    ],
                    operational: [
                        { factor: 'Resource Allocation', score: 55 },
                        { factor: 'Process Maturity', score: 60 },
                        { factor: 'Team Expertise', score: 65 },
                        { factor: 'Communication Efficiency', score: 50 }
                    ]
                },
                riskMitigationRecommendations: [
                    {
                        text: "Conduct detailed alignment discussion on business model and market expectations",
                        priority: "High",
                        timeline: "Immediate"
                    },
                    {
                        text: "Define clear operational KPIs and success metrics aligned with both parties",
                        priority: "Medium",
                        timeline: "Short-term"
                    },
                    {
                        text: "Establish regular alignment meetings to review strategic progress",
                        priority: "Low",
                        timeline: "Medium-term"
                    }
                ],
                improvementAreas: {
                    strategicFocus: "Align long-term vision with investor expectations",
                    communication: "Establish regular update cadence and reporting structure",
                    growthMetrics: "Define mutually agreed success metrics and milestones",
                    actions: {
                        strategicFocus: [
                            'Align on strategic vision and priorities',
                            'Define shared success metrics'
                        ],
                        communication: [
                            'Establish regular communication cadence',
                            'Define expectations and reporting structure'
                        ],
                        growthMetrics: [
                            'Develop shared KPI dashboard',
                            'Set milestone-based growth targets'
                        ]
                    }
                }
            };
        }
    } catch (error) {
        console.error('Error calling AI service:', error);
        throw new Error(`Failed to generate belief system analysis: ${error}`);
    }
}

/**
 * Gets an existing analysis by ID
 */
export const getAnalysisById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { analysisId } = req.params;

        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const analysis = await BeliefSystemAnalysisModel.findById(analysisId);

        if (!analysis) {
            res.status(404).json({ message: 'Analysis not found' });
            return;
        }

        // Check if user has permission - must be either the startup or investor
        if (req.user.userId !== analysis.startupId && req.user.userId !== analysis.investorId) {
            res.status(403).json({ message: 'You do not have permission to access this analysis' });
            return;
        }

        // Adapt to new format if needed
        const adaptedAnalysis = adaptLegacyAnalysisData(analysis);

        res.json({
            ...adaptedAnalysis,
            perspective: analysis.perspective,
            generatedDate: analysis.createdAt
        });

    } catch (error) {
        console.error('Error fetching analysis:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Gets a summary of all analyses for the authenticated user
 */
export const getUserAnalyses = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Get user's role
        const userId = req.user.userId;

        // Find analyses where user is either startup or investor
        const analyses = await BeliefSystemAnalysisModel.find({
            $or: [
                { startupId: userId },
                { investorId: userId }
            ]
        }).sort({ createdAt: -1 });

        // Return simplified list for UI
        const analysisList = analyses.map(analysis => ({
            id: analysis._id,
            startupId: analysis.startupId,
            investorId: analysis.investorId,
            overallMatch: analysis.overallMatch,
            perspective: analysis.perspective,
            generatedDate: analysis.createdAt,
            isRecent: new Date(analysis.createdAt).getTime() >
                Date.now() - (ANALYSIS_EXPIRATION_DAYS * 24 * 60 * 60 * 1000)
        }));

        res.json(analysisList);

    } catch (error) {
        console.error('Error fetching user analyses:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
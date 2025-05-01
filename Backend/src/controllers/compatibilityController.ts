import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { cleanJsonResponse } from '../utils/jsonHelper';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import MatchAnalysisModel from '../models/MatchAnalysisSchema';
import StartupProfileModel from '../models/Profile/StartupProfile';
import ApiUsageModel from '../models/ApiUsageModel/ApiUsage';
import InvestorProfileModel from '../models/InvestorModels/InvestorProfile';

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

// Maximum API requests per day
const MAX_DAILY_REQUESTS = 100;

interface CompatibilityScore {
    overallScore: number;
    breakdown: {
        missionAlignment: number;
        investmentPhilosophy: number;
        sectorFocus: number;
        fundingStageAlignment: number;
        valueAddMatch: number;
    };
    insights: string[];
}

// Using the cleanJsonResponse utility function from utils/jsonHelper.ts

interface RateLimitResult {
    underLimit: boolean;
    usageCount: number;
    maxRequests: number;
}

/**
 * Helper function to check and update API usage limits
 */
async function checkRateLimit(userId: string): Promise<RateLimitResult> {
    // Find or create usage record for this user
    let usageRecord = await ApiUsageModel.findOne({ userId });

    if (!usageRecord) {
        usageRecord = await ApiUsageModel.create({
            userId,
            compatibilityRequestCount: 0,
            beliefSystemRequestCount: 0,
            financialAnalysisRequestCount: 0,
            recommendationRequestCount: 0,
            date: new Date(),
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
 * Analyzes compatibility between a startup and an investor using Gemini API
 */
export const getStartupInvestorCompatibility = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Check rate limit
        const rateLimitResult = await checkRateLimit(req.user.userId);

        if (!rateLimitResult.underLimit) {
            // If limit reached, check for any existing analysis regardless of age
            const { startupId, investorId } = req.params;

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

            // Look for any existing analysis, regardless of age
            const oldAnalysis = await MatchAnalysisModel.findOne({
                startupId: startupId,
                investorId: investorId,
                perspective: perspective
            }).sort({ createdAt: -1 }); // Get the most recent one

            if (oldAnalysis) {
                // Return old analysis with a flag indicating it's old data
                res.json({
                    breakdown: oldAnalysis.breakdown,
                    overallScore: oldAnalysis.overallScore,
                    insights: oldAnalysis.insights,
                    perspective: oldAnalysis.perspective,
                    isOldData: true,
                    createdAt: oldAnalysis.createdAt,
                    message: 'Daily request limit reached. Showing previously generated data.'
                });
                return;
            }

            // If no old data exists, return the rate limit error
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
        const existingAnalysis = await MatchAnalysisModel.findOne({
            startupId: startupId,
            investorId: investorId,
            perspective: perspective,
            // Only use cached results if less than 7 days old
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        if (existingAnalysis) {
            // Return cached analysis
            res.json({
                breakdown: existingAnalysis.breakdown,
                overallScore: existingAnalysis.overallScore,
                insights: existingAnalysis.insights,
                perspective: existingAnalysis.perspective
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

        // Call Gemini API using the helper function with perspective
        const compatibilityData = await getCompatibilityAnalysis(startup, investor, perspective);

        // Store analysis in MongoDB for caching with exact startupId, investorId and perspective
        await MatchAnalysisModel.create({
            startupId: startupId,
            investorId: investorId,
            perspective: perspective,
            overallScore: compatibilityData.overallScore,
            breakdown: compatibilityData.breakdown,
            insights: compatibilityData.insights,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expire after 30 days
        });

        // Return compatibility data
        res.json({
            breakdown: compatibilityData.breakdown,
            overallScore: compatibilityData.overallScore,
            insights: compatibilityData.insights,
            perspective: perspective
        });

    } catch (error) {
        console.error('Compatibility analysis error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Batch analyze compatibility for multiple potential matches
 */
export const batchAnalyzeCompatibility = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Check rate limit - batch analysis counts as one request
        const rateLimitResult = await checkRateLimit(req.user.userId);

        if (!rateLimitResult.underLimit) {
            const { role } = req.query;
            const perspective = role as 'startup' | 'investor';

            // If limit reached, check for any existing batch analyses
            let oldMatches = [];

            if (perspective === 'startup') {
                // Find any existing analyses for this startup, regardless of age
                const existingAnalyses = await MatchAnalysisModel.find({
                    startupId: req.user.userId,
                    perspective: perspective
                }).sort({ createdAt: -1 });

                if (existingAnalyses.length > 0) {
                    // Group by investorId and take the most recent for each
                    const investorMap = new Map();
                    existingAnalyses.forEach(analysis => {
                        if (!investorMap.has(analysis.investorId)) {
                            investorMap.set(analysis.investorId, analysis);
                        }
                    });

                    // Get investor names
                    const investorIds = Array.from(investorMap.keys());
                    const investors = await InvestorProfileModel.find({
                        userId: { $in: investorIds }
                    });

                    const investorNameMap = investors.reduce((acc, investor) => {
                        acc[investor.userId] = investor.companyName;
                        return acc;
                    }, {} as Record<string, string>);

                    // Create matches array
                    for (const [investorId, analysis] of investorMap.entries()) {
                        oldMatches.push({
                            investorId: investorId,
                            companyName: investorNameMap[investorId] || 'Unknown',
                            compatibility: {
                                overallScore: analysis.overallScore,
                                breakdown: analysis.breakdown,
                                insights: analysis.insights
                            }
                        });
                    }
                }
            } else {
                // Find any existing analyses for this investor, regardless of age
                const existingAnalyses = await MatchAnalysisModel.find({
                    investorId: req.user.userId,
                    perspective: perspective
                }).sort({ createdAt: -1 });

                if (existingAnalyses.length > 0) {
                    // Group by startupId and take the most recent for each
                    const startupMap = new Map();
                    existingAnalyses.forEach(analysis => {
                        if (!startupMap.has(analysis.startupId)) {
                            startupMap.set(analysis.startupId, analysis);
                        }
                    });

                    // Get startup names
                    const startupIds = Array.from(startupMap.keys());
                    const startups = await StartupProfileModel.find({
                        userId: { $in: startupIds }
                    });

                    const startupNameMap = startups.reduce((acc, startup) => {
                        acc[startup.userId] = startup.companyName;
                        return acc;
                    }, {} as Record<string, string>);

                    // Create matches array
                    for (const [startupId, analysis] of startupMap.entries()) {
                        oldMatches.push({
                            startupId: startupId,
                            companyName: startupNameMap[startupId] || 'Unknown',
                            compatibility: {
                                overallScore: analysis.overallScore,
                                breakdown: analysis.breakdown,
                                insights: analysis.insights
                            }
                        });
                    }
                }
            }

            if (oldMatches.length > 0) {
                // Sort matches by overall score
                oldMatches.sort((a, b) => b.compatibility.overallScore - a.compatibility.overallScore);

                // Return old matches with a flag indicating it's old data
                res.json({
                    matches: oldMatches,
                    perspective: perspective,
                    isOldData: true,
                    message: 'Daily request limit reached. Showing previously generated data.'
                });
                return;
            }

            // If no old data exists, return the rate limit error
            res.status(429).json({
                message: 'Daily request limit reached',
                limit: MAX_DAILY_REQUESTS,
                nextReset: 'Tomorrow'
            });
            return;
        }

        const { role } = req.query;

        if (role !== 'startup' && role !== 'investor') {
            res.status(400).json({ message: 'Valid role (startup or investor) is required' });
            return;
        }

        // Set perspective based on user's role
        const perspective = role as 'startup' | 'investor';
        let matches = [];

        if (perspective === 'startup') {
            // Get startup details from MongoDB
            const startup = await StartupProfileModel.findOne({ userId: req.user.userId });

            if (!startup) {
                res.status(404).json({ message: 'Startup profile not found' });
                return;
            }

            // Find top 5 matching investors based on basic criteria
            const matchingInvestors = await InvestorProfileModel.find({
                industriesOfInterest: startup.industry,
                preferredStages: startup.fundingStage
            }).limit(5);

            // Check for existing analyses first to reduce API calls, including perspective
            const existingAnalyses = await MatchAnalysisModel.find({
                startupId: req.user.userId,
                investorId: { $in: matchingInvestors.map(inv => inv.userId) },
                perspective: perspective, // Only get analyses with matching perspective
                // Only use cached results if less than 7 days old
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            });

            // Create a lookup for existing analyses
            const analysisLookup = existingAnalyses.reduce((acc, analysis) => {
                acc[analysis.investorId] = analysis;
                return acc;
            }, {} as Record<string, any>);

            // Process each match
            for (const investor of matchingInvestors) {
                try {
                    // Use cached analysis if available
                    if (analysisLookup[investor.userId]) {
                        const cachedAnalysis = analysisLookup[investor.userId];
                        matches.push({
                            investorId: investor.userId,
                            companyName: investor.companyName,
                            compatibility: {
                                overallScore: cachedAnalysis.overallScore,
                                breakdown: cachedAnalysis.breakdown,
                                insights: cachedAnalysis.insights
                            }
                        });
                    } else {
                        // Generate new analysis with startup perspective
                        const analysis = await getCompatibilityAnalysis(startup, investor, perspective);

                        // Store for future use with exact IDs and perspective
                        await MatchAnalysisModel.create({
                            startupId: req.user.userId,
                            investorId: investor.userId,
                            perspective: perspective,
                            overallScore: analysis.overallScore,
                            breakdown: analysis.breakdown,
                            insights: analysis.insights,
                            createdAt: new Date(),
                            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        });

                        matches.push({
                            investorId: investor.userId,
                            companyName: investor.companyName,
                            compatibility: analysis
                        });
                    }
                } catch (error) {
                    console.error(`Error analyzing match with investor ${investor.userId}:`, error);
                    // Continue with next investor instead of failing the entire batch
                }
            }

        } else {
            // Get investor details from MongoDB
            const investor = await InvestorProfileModel.findOne({ userId: req.user.userId });

            if (!investor) {
                res.status(404).json({ message: 'Investor profile not found' });
                return;
            }

            // Find top 5 matching startups
            const matchingStartups = await StartupProfileModel.find({
                industry: { $in: investor.industriesOfInterest },
                fundingStage: { $in: investor.preferredStages }
            }).limit(5);

            // Check for existing analyses first, including perspective
            const existingAnalyses = await MatchAnalysisModel.find({
                startupId: { $in: matchingStartups.map(s => s.userId) },
                investorId: req.user.userId,
                perspective: perspective, // Only get analyses with matching perspective
                // Only use cached results if less than 7 days old
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            });

            // Create a lookup for existing analyses
            const analysisLookup = existingAnalyses.reduce((acc, analysis) => {
                acc[analysis.startupId] = analysis;
                return acc;
            }, {} as Record<string, any>);

            // Process each match
            for (const startup of matchingStartups) {
                try {
                    // Use cached analysis if available for this exact startup-investor pair with matching perspective
                    if (analysisLookup[startup.userId]) {
                        const cachedAnalysis = analysisLookup[startup.userId];
                        matches.push({
                            startupId: startup.userId,
                            companyName: startup.companyName,
                            compatibility: {
                                overallScore: cachedAnalysis.overallScore,
                                breakdown: cachedAnalysis.breakdown,
                                insights: cachedAnalysis.insights
                            }
                        });
                    } else {
                        // Generate new analysis with investor perspective
                        const analysis = await getCompatibilityAnalysis(startup, investor, perspective);

                        // Store for future use with exact IDs and perspective
                        await MatchAnalysisModel.create({
                            startupId: startup.userId,
                            investorId: req.user.userId,
                            perspective: perspective,
                            overallScore: analysis.overallScore,
                            breakdown: analysis.breakdown,
                            insights: analysis.insights,
                            createdAt: new Date(),
                            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        });

                        matches.push({
                            startupId: startup.userId,
                            companyName: startup.companyName,
                            compatibility: analysis
                        });
                    }
                } catch (error) {
                    console.error(`Error analyzing match with startup ${startup.userId}:`, error);
                    // Continue with next startup
                }
            }
        }

        // Only return matches that were successfully analyzed
        const validMatches = matches.filter(match => match.compatibility);

        // Sort matches by overall score
        validMatches.sort((a, b) => b.compatibility.overallScore - a.compatibility.overallScore);

        res.json({ matches: validMatches, perspective: perspective });

    } catch (error) {
        console.error('Batch compatibility analysis error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Helper function to get compatibility analysis between a startup and investor
 * @param startup The startup data
 * @param investor The investor data
 * @param perspective The perspective from which to analyze ('startup' or 'investor')
 */
async function getCompatibilityAnalysis(
    startup: any,
    investor: any,
    perspective: 'startup' | 'investor'
): Promise<CompatibilityScore> {
    const prompt = `
    You are a specialized investment advisor analyzing the compatibility between a startup and an investor.

    TASK: Analyze the compatibility between the following startup and investor from the perspective of the ${perspective}.

    RESPONSE FORMAT: Return ONLY valid JSON with this exact structure:
    {
      "overallScore": (number between 0-100),
      "breakdown": {
        "missionAlignment": (number between 0-100),
        "investmentPhilosophy": (number between 0-100),
        "sectorFocus": (number between 0-100),
        "fundingStageAlignment": (number between 0-100),
        "valueAddMatch": (number between 0-100)
      },
      "insights": [(array of 3 string insights)]
    }

    INSIGHT GUIDELINES:
    - Write from the ${perspective}'s perspective (use "you" when referring to the ${perspective})
    - Each insight must be specific, detailed, and actionable
    - Include concrete reasons WHY this match would benefit or challenge ${perspective === 'startup' ? 'your company' : 'your investment portfolio'}
    - Focus on unique aspects of this specific startup-investor pairing
    - Consider strategic value beyond industry matching (expertise transfer, network benefits, etc.)
    - Include at least one potential growth opportunity this pairing enables for ${perspective === 'startup' ? 'your company' : 'your portfolio'}
    - Each insight should be 1-3 sentences, detailed enough to be useful but concise

    SCORING GUIDELINES:
    - missionAlignment: How well the startup's mission aligns with investor's philosophy
    - investmentPhilosophy: Compatibility between investor's approach and startup's needs
    - sectorFocus: How well the startup's industry matches investor's focus areas
    - fundingStageAlignment: Match between startup's current stage and investor's preferred stages
    - valueAddMatch: How well the investor's non-financial support meets startup's needs

    DATA:

    Startup:
    - Company: ${startup.companyName}
    - Industry: ${startup.industry}
    - Funding Stage: ${startup.fundingStage}
    - Employees: ${startup.employeeCount || 'N/A'}
    - Location: ${startup.location || 'N/A'}
    - Pitch: ${startup.pitch || 'N/A'}

    Investor:
    - Company: ${investor.companyName}
    - Industries: ${investor.industriesOfInterest.join(', ')}
    - Preferred Stages: ${investor.preferredStages.join(', ')}
    - Ticket Size: ${investor.ticketSize || 'N/A'}
    - Investment Criteria: ${investor.investmentCriteria?.join(', ') || 'N/A'}
    - Past Investments: ${investor.pastInvestments || 'N/A'}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // Clean and parse the response
    const cleanedResponse = cleanJsonResponse(textResponse);
    return JSON.parse(cleanedResponse);
}
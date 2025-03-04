import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import MatchAnalysisModel from '../models/MatchAnalysisSchema';
import StartupProfileModel from '../models/Profile/StartupProfile';
import InvestorProfileModel from '../models/mongoDB/InvestorProfile';

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
 * Analyzes compatibility between a startup and an investor using Gemini API
 */
export const getStartupInvestorCompatibility = async (req: Request, res: Response): Promise<void> => {
    try {
        const { startupId, investorId } = req.params;

        if (!startupId || !investorId) {
            res.status(400).json({ message: 'Startup ID and Investor ID are required' });
            return;
        }

        // Check if we have a recent analysis in MongoDB cache
        const existingAnalysis = await MatchAnalysisModel.findOne({
            startupId,
            investorId,
            // Only use cached results if less than 7 days old
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        if (existingAnalysis) {
            // Return cached analysis
            res.json({
                breakdown: existingAnalysis.breakdown,
                overallScore: existingAnalysis.overallScore,
                insights: existingAnalysis.insights
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

        // Prepare prompt for Gemini API
        const prompt = `
          Analyze the compatibility between this startup and investor. Be very strict in your analysis.
          Return your analysis ONLY as valid JSON format with the following structure:
          {
            "overallScore": (number between 0-100),
            "breakdown": {
              "missionAlignment": (number between 0-100),
              "investmentPhilosophy": (number between 0-100),
              "sectorFocus": (number between 0-100),
              "fundingStageAlignment": (number between 0-100),
              "valueAddMatch": (number between 0-100)
            },
            "insights": [(array of 3 string insights about why they match)]
          }
          Important: Return only the JSON structure and nothing else. No explanations or markdown code blocks.

          Startup data:
          - Company Name: ${startup.companyName}
          - Industry: ${startup.industry}
          - Funding Stage: ${startup.fundingStage}
          - Employee Count: ${startup.employeeCount || 'N/A'}
          - Location: ${startup.location || 'N/A'}
          - Pitch: ${startup.pitch || 'N/A'}

          Investor data:
          - Company Name: ${investor.companyName}
          - Industries of Interest: ${investor.industriesOfInterest.join(', ')}
          - Preferred Stages: ${investor.preferredStages.join(', ')}
          - Ticket Size: ${investor.ticketSize || 'N/A'}
          - Investment Criteria: ${investor.investmentCriteria?.join(', ') || 'N/A'}
          - Past Investments: ${investor.pastInvestments || 'N/A'}
        `;

        // Call Gemini API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();

        // Clean and parse JSON response from Gemini
        try {
            const cleanedResponse = cleanJsonResponse(textResponse);
            const compatibilityData: CompatibilityScore = JSON.parse(cleanedResponse);

            // Store analysis in MongoDB for caching
            await MatchAnalysisModel.create({
                startupId,
                investorId,
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
                insights: compatibilityData.insights
            });

        } catch (parseError) {
            console.error('Error parsing Gemini API response:', parseError);
            console.error('Raw response:', textResponse);
            res.status(500).json({ message: 'Error processing AI response' });
        }

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

        const { role } = req.query;

        if (role !== 'startup' && role !== 'investor') {
            res.status(400).json({ message: 'Valid role (startup or investor) is required' });
            return;
        }

        let matches = [];

        if (role === 'startup') {
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

            // Check for existing analyses first to reduce API calls
            const existingAnalyses = await MatchAnalysisModel.find({
                startupId: req.user.userId,
                investorId: { $in: matchingInvestors.map(inv => inv.userId) },
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
                        // Generate new analysis
                        const analysis = await getCompatibilityAnalysis(startup, investor);

                        // Store for future use
                        await MatchAnalysisModel.create({
                            startupId: req.user.userId,
                            investorId: investor.userId,
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

            // Check for existing analyses first
            const existingAnalyses = await MatchAnalysisModel.find({
                startupId: { $in: matchingStartups.map(s => s.userId) },
                investorId: req.user.userId,
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
                    // Use cached analysis if available
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
                        // Generate new analysis
                        const analysis = await getCompatibilityAnalysis(startup, investor);

                        // Store for future use
                        await MatchAnalysisModel.create({
                            startupId: startup.userId,
                            investorId: req.user.userId,
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

        res.json({ matches: validMatches });

    } catch (error) {
        console.error('Batch compatibility analysis error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Helper function to get compatibility analysis between a startup and investor
 */
async function getCompatibilityAnalysis(startup: any, investor: any): Promise<CompatibilityScore> {
    const prompt = `
    Analyze the compatibility between this startup and investor.
    Return your analysis ONLY as valid JSON format with the following structure:
    {
      "overallScore": (number between 0-100),
      "breakdown": {
        "missionAlignment": (number between 0-100),
        "investmentPhilosophy": (number between 0-100),
        "sectorFocus": (number between 0-100),
        "fundingStageAlignment": (number between 0-100),
        "valueAddMatch": (number between 0-100)
      },
      "insights": [(array of 3 string insights about why they match)]
    }
    Important: Return only the JSON structure and nothing else. No explanations or markdown code blocks.

    Startup data:
    - Company Name: ${startup.companyName}
    - Industry: ${startup.industry}
    - Funding Stage: ${startup.fundingStage}
    - Employee Count: ${startup.employeeCount || 'N/A'}
    - Location: ${startup.location || 'N/A'}
    - Pitch: ${startup.pitch || 'N/A'}

    Investor data:
    - Company Name: ${investor.companyName}
    - Industries of Interest: ${investor.industriesOfInterest.join(', ')}
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
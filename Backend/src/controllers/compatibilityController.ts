import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || '';
if (!apiKey) {
    console.warn('Warning: GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);
// Use gemini-pro as it's a stable version available to most users
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
    // Check if response is wrapped in markdown code blocks
    const jsonRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const match = text.match(jsonRegex);

    if (match && match[1]) {
        return match[1].trim();
    }

    // If no markdown wrapper, return the original text
    return text.trim();
}

/**
 * Analyzes compatibility between a startup and an investor using Gemini API
 * Modified to return data compatible with frontend expectations
 */
export const getStartupInvestorCompatibility = async (req: Request, res: Response): Promise<void> => {
    try {
        const { startupId, investorId } = req.params;

        if (!startupId || !investorId) {
            res.status(400).json({ message: 'Startup ID and Investor ID are required' });
            return;
        }

        // Fetch startup data
        const startup = await prisma.startup.findUnique({
            where: { user_id: startupId },
            include: {
                user: {
                    select: {
                        email: true
                    }
                }
            }
        });

        // Fetch investor data
        const investor = await prisma.investor.findUnique({
            where: { user_id: investorId },
            include: {
                user: {
                    select: {
                        email: true
                    }
                }
            }
        });

        if (!startup || !investor) {
            res.status(404).json({ message: 'Startup or investor not found' });
            return;
        }

        // Prepare data for Gemini API
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
      - Company Name: ${startup.company_name}
      - Industry: ${startup.industry}
      - Funding Stage: ${startup.funding_stage}
      - Employee Count: ${startup.employee_count || 'N/A'}
      - Location: ${startup.location || 'N/A'}
      - Pitch: ${startup.pitch || 'N/A'}

      Investor data:
      - Company Name: ${investor.company_name}
      - Industries of Interest: ${investor.industries_of_interest.join(', ')}
      - Preferred Stages: ${investor.preferred_stages.join(', ')}
      - Ticket Size: ${investor.ticket_size || 'N/A'}
      - Investment Criteria: ${investor.investment_criteria.join(', ')}
      - Past Investments: ${investor.past_investments || 'N/A'}
    `;

        // Call Gemini API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();

        // Clean and parse JSON response from Gemini
        try {
            const cleanedResponse = cleanJsonResponse(textResponse);
            const compatibilityData: CompatibilityScore = JSON.parse(cleanedResponse);

            // Return just the compatibility data directly to match frontend expected format
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
            // Get startup details
            const startup = await prisma.startup.findUnique({
                where: { user_id: req.user.userId },
            });

            if (!startup) {
                res.status(404).json({ message: 'Startup profile not found' });
                return;
            }

            // Find top 5 matching investors based on basic criteria
            const matchingInvestors = await prisma.investor.findMany({
                where: {
                    industries_of_interest: { has: startup.industry },
                    preferred_stages: { has: startup.funding_stage }
                },
                take: 5,
                include: { user: { select: { email: true } } }
            });

            // Process each match with Gemini (limited to avoid rate limits)
            for (const investor of matchingInvestors) {
                try {
                    const analysis = await getCompatibilityAnalysis(startup, investor);
                    matches.push({
                        investorId: investor.user_id,
                        companyName: investor.company_name,
                        compatibility: analysis
                    });
                } catch (error) {
                    console.error(`Error analyzing match with investor ${investor.user_id}:`, error);
                    // Continue with next investor instead of failing the entire batch
                }
            }

        } else {
            // Get investor details
            const investor = await prisma.investor.findUnique({
                where: { user_id: req.user.userId },
            });

            if (!investor) {
                res.status(404).json({ message: 'Investor profile not found' });
                return;
            }

            // Find top 5 matching startups
            const matchingStartups = await prisma.startup.findMany({
                where: {
                    industry: { in: investor.industries_of_interest },
                    funding_stage: { in: investor.preferred_stages }
                },
                take: 5,
                include: { user: { select: { email: true } } }
            });

            // Process each match with Gemini
            for (const startup of matchingStartups) {
                try {
                    const analysis = await getCompatibilityAnalysis(startup, investor);
                    matches.push({
                        startupId: startup.user_id,
                        companyName: startup.company_name,
                        compatibility: analysis
                    });
                } catch (error) {
                    console.error(`Error analyzing match with startup ${startup.user_id}:`, error);
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
    - Company Name: ${startup.company_name}
    - Industry: ${startup.industry}
    - Funding Stage: ${startup.funding_stage}
    - Employee Count: ${startup.employee_count || 'N/A'}
    - Location: ${startup.location || 'N/A'}
    - Pitch: ${startup.pitch || 'N/A'}

    Investor data:
    - Company Name: ${investor.company_name}
    - Industries of Interest: ${investor.industries_of_interest.join(', ')}
    - Preferred Stages: ${investor.preferred_stages.join(', ')}
    - Ticket Size: ${investor.ticket_size || 'N/A'}
    - Investment Criteria: ${investor.investment_criteria.join(', ')}
    - Past Investments: ${investor.past_investments || 'N/A'}
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // Clean and parse the response
    const cleanedResponse = cleanJsonResponse(textResponse);
    return JSON.parse(cleanedResponse);
}
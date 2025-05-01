import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { cleanJsonResponse, safeJsonParse } from '../utils/jsonHelper';
import AIInsightCacheModel from '../models/AIInsightCache';

// Load environment variables
dotenv.config();

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY || '';
if (!apiKey) {
    console.warn('Warning: GEMINI_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash", // Using gemini-2.0-flash as specified
    generationConfig: {
        maxOutputTokens: 8192, // Maximum allowed value
    }
});

/**
 * Interface for dashboard insight
 */
export interface DashboardInsight {
    id: string;
    title: string;
    content: string;
    type: 'positive' | 'negative' | 'neutral' | 'action';
    icon: string;
    priority?: number;
}

/**
 * Service for generating AI-powered insights for the dashboard
 */
export class AIInsightsService {
    /**
     * Generate personalized insights based on user data
     * @param userData User profile and activity data
     * @param role User role (startup or investor)
     * @param userId User ID for caching
     * @returns Array of insights
     */
    public async generateInsights(
        userData: any,
        role: string,
        userId?: string
    ): Promise<DashboardInsight[]> {
        try {
            // If userId is provided, check for cached insights
            if (userId) {
                const cachedInsights = await AIInsightCacheModel.findOne({
                    userId,
                    role,
                    expiresAt: { $gt: new Date() }
                });

                if (cachedInsights) {
                    console.log(`Using cached insights for user ${userId}`);
                    return cachedInsights.insights;
                }
            }

            // Extract relevant data for insights generation
            const {
                stats,
                recentMatches,
                activities,
                analytics,
                profileData
            } = userData;

            // Create prompt for Gemini
            const prompt = this.createInsightsPrompt(userData, role);

            // Call Gemini API
            const result = await model.generateContent(prompt);
            const response = result.response;
            const textResponse = response.text();

            // Clean and parse the response
            const cleanedResponse = cleanJsonResponse(textResponse);
            const parsedResponse = safeJsonParse(cleanedResponse);

            let insights: DashboardInsight[];
            if (parsedResponse && Array.isArray(parsedResponse.insights)) {
                insights = parsedResponse.insights;
            } else {
                // Fallback insights if parsing fails
                insights = this.generateFallbackInsights(userData, role);
            }

            // Cache the insights if userId is provided
            if (userId) {
                // Remove any existing cache for this user
                await AIInsightCacheModel.deleteMany({ userId, role });

                // Create new cache entry
                await AIInsightCacheModel.create({
                    userId,
                    role,
                    insights,
                    createdAt: new Date(),
                    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days TTL
                });
                console.log(`Cached insights for user ${userId} with 7-day TTL`);
            }

            return insights;
        } catch (error) {
            console.error('Error generating AI insights:', error);
            return this.generateFallbackInsights(userData, role);
        }
    }

    /**
     * Create a prompt for generating insights
     */
    private createInsightsPrompt(userData: any, role: string): string {
        const {
            stats,
            recentMatches,
            activities,
            analytics,
            profileData
        } = userData;

        // Format match data
        const matchesInfo = recentMatches && recentMatches.length > 0
            ? recentMatches.map((match: any) => ({
                name: match.name,
                compatibilityScore: match.compatibilityScore,
                industry: match.industry,
                isNew: match.isNew
            }))
            : [];

        // Format activity data
        const activityInfo = activities && activities.length > 0
            ? activities.map((activity: any) => ({
                type: activity.type,
                entity: activity.entity,
                time: activity.formattedTime
            }))
            : [];

        // Format analytics data
        const analyticsInfo = analytics?.engagementTrends || {};

        // Create the prompt
        return `
        You are an AI assistant that generates personalized insights for a ${role} user on a startup-investor matching platform.

        USER DATA:
        Role: ${role}
        Profile Completion: ${stats?.profileCompletionPercentage || 0}%
        Document Count: ${stats?.documentCount || 0}
        Profile Views: ${stats?.profileViews || 0}
        Document Views: ${stats?.documentViews || 0}
        Document Downloads: ${stats?.documentDownloads || 0}
        Match Rate: ${stats?.matchRate || 0}%
        Average Compatibility Score: ${stats?.compatibilityScore || 0}
        Total Engagements: ${stats?.totalEngagements || 0}
        Engagement Rate: ${stats?.engagementRate || 0}

        Recent Matches: ${JSON.stringify(matchesInfo)}
        Recent Activities: ${JSON.stringify(activityInfo)}
        Analytics Trends: ${JSON.stringify(analyticsInfo)}

        TASK:
        Generate 3-5 personalized, actionable insights for this user based on their data.
        Each insight should be specific, data-driven, and provide clear value to the user.

        For each insight, include:
        1. A short, attention-grabbing title
        2. Detailed content with specific observations and recommendations
        3. A type classification (positive, negative, neutral, or action)
        4. An appropriate icon name (use common icon names like: trending-up, trending-down, alert-circle, check-circle, users, file-text, search, etc.)
        5. A priority score (1-10, with 10 being highest priority)

        Format your response as a JSON object with this structure:
        {
          "insights": [
            {
              "id": "insight_1",
              "title": "Insight Title",
              "content": "Detailed insight content with specific observations and recommendations.",
              "type": "positive|negative|neutral|action",
              "icon": "icon-name",
              "priority": 8
            },
            ...
          ]
        }

        IMPORTANT GUIDELINES:
        - Focus on actionable insights that help the user improve their performance
        - Personalize insights based on the user's role (startup or investor)
        - Use data to support your insights
        - Be specific and avoid generic advice
        - Prioritize insights that will have the biggest impact
        - If profile completion is low, prioritize that insight
        - If match quality is low, suggest ways to improve it
        - If engagement is high but matches are low, highlight that disconnect
        `;
    }

    /**
     * Generate fallback insights if AI generation fails
     */
    private generateFallbackInsights(userData: any, role: string): DashboardInsight[] {
        const {
            stats,
            recentMatches
        } = userData;

        const insights: DashboardInsight[] = [];

        // Profile completion insight
        if (stats?.profileCompletionPercentage < 80) {
            insights.push({
                id: 'insight_profile',
                title: 'Complete Your Profile',
                content: `Your profile is only ${stats?.profileCompletionPercentage || 0}% complete. Completing your profile will significantly improve your match quality and visibility.`,
                type: 'action',
                icon: 'user-check',
                priority: 10
            });
        }

        // Match quality insight
        if (recentMatches && recentMatches.length > 0) {
            const avgScore = stats?.compatibilityScore || 0;
            if (avgScore > 75) {
                insights.push({
                    id: 'insight_matches',
                    title: 'Strong Match Quality',
                    content: 'Your matches show high compatibility scores. Consider reaching out to your top matches to explore potential partnerships.',
                    type: 'positive',
                    icon: 'trending-up',
                    priority: 8
                });
            } else {
                insights.push({
                    id: 'insight_matches',
                    title: 'Improve Match Quality',
                    content: 'Your match compatibility scores could be improved. Consider updating your preferences and providing more detailed information about your requirements.',
                    type: 'action',
                    icon: 'edit',
                    priority: 7
                });
            }
        }

        // Document engagement insight
        if (stats?.documentCount > 0) {
            if (stats?.documentDownloads > 5) {
                insights.push({
                    id: 'insight_documents',
                    title: 'Document Engagement',
                    content: 'Your documents are getting good traction with downloads. Consider adding more detailed documents to maintain engagement.',
                    type: 'positive',
                    icon: 'file-text',
                    priority: 6
                });
            } else {
                insights.push({
                    id: 'insight_documents',
                    title: 'Increase Document Visibility',
                    content: 'Your documents have low download rates. Consider updating document titles and descriptions to make them more appealing.',
                    type: 'action',
                    icon: 'file-plus',
                    priority: 5
                });
            }
        } else {
            insights.push({
                id: 'insight_documents',
                title: 'Add Documents',
                content: 'You haven\'t uploaded any documents yet. Adding relevant documents will enhance your profile and increase engagement.',
                type: 'action',
                icon: 'upload',
                priority: 9
            });
        }

        // Role-specific insight
        if (role === 'startup') {
            insights.push({
                id: 'insight_role',
                title: 'Investor Engagement',
                content: 'Regularly update your profile with recent achievements and metrics to maintain investor interest.',
                type: 'neutral',
                icon: 'users',
                priority: 4
            });
        } else {
            insights.push({
                id: 'insight_role',
                title: 'Startup Discovery',
                content: 'Refine your investment criteria to find better startup matches that align with your investment strategy.',
                type: 'neutral',
                icon: 'search',
                priority: 4
            });
        }

        return insights;
    }
}

export default new AIInsightsService();

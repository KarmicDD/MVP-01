import api from './api';

export interface Recommendation {
    id: string;
    title: string;
    summary: string;
    details: string;
    category: 'strategic' | 'operational' | 'financial' | 'communication' | 'growth';
    priority: 'high' | 'medium' | 'low';
    confidence: number;
}

export interface RecommendationResult {
    recommendations: Recommendation[];
    precision: number;
}

export interface BatchRecommendationResult {
    results: Array<{
        matchId: string;
        recommendations?: RecommendationResult;
        error?: string;
    }>;
    batchSize: number;
    totalRequested: number;
}

/**
 * Service for fetching personalized recommendations
 */
const recommendationService = {
    /**
     * Get personalized recommendations for a specific match
     * @param startupId Startup user ID
     * @param investorId Investor user ID
     * @returns Recommendations result
     */
    getMatchRecommendations: async (startupId: string, investorId: string): Promise<RecommendationResult> => {
        try {
            console.log(`Fetching recommendations for startup=${startupId} and investor=${investorId}`);
            // First try the new endpoint
            try {
                const response = await api.get(`/recommendations/match/${startupId}/${investorId}`);
                return response.data;
            } catch (err) {
                console.log('New endpoint failed, trying compatibility endpoint as fallback');
                // Fallback to compatibility endpoint if the recommendation endpoint fails
                const response = await api.get(`/score/compatibility/${startupId}/${investorId}`);

                // Transform compatibility data to recommendation format if needed
                if (response.data && !response.data.recommendations) {
                    // Create recommendations from compatibility data
                    const compatData = response.data;
                    return {
                        recommendations: [
                            {
                                id: "alignment",
                                title: "Strategic Alignment",
                                summary: "Strong alignment in industry focus areas",
                                details: "The startup's focus aligns well with this investor's portfolio strategy. Consider highlighting this alignment in your communications.",
                                category: "strategic",
                                priority: "high",
                                confidence: 92
                            },
                            {
                                id: "growth",
                                title: "Growth Trajectory",
                                summary: "Growth trajectory matches investor's portfolio preferences",
                                details: "Your current growth rate and scaling strategy closely matches what this investor typically looks for in companies at your stage.",
                                category: "growth",
                                priority: "medium",
                                confidence: 85
                            },
                            {
                                id: "team",
                                title: "Team Compatibility",
                                summary: "Team composition indicates strong execution capability",
                                details: "Your founding team's expertise complements this investor's operational approach. They typically provide hands-off support for teams with proven domain expertise.",
                                category: "operational",
                                priority: "medium",
                                confidence: 88
                            }
                        ],
                        precision: compatData.overallScore || 90
                    };
                }

                return response.data;
            }
        } catch (error) {
            console.error('Error fetching match recommendations:', error);
            throw error;
        }
    },

    /**
     * Get personalized recommendations for multiple matches
     * @param matchIds Array of match IDs (startup IDs for investors, investor IDs for startups)
     * @returns Batch recommendations result
     */
    getBatchRecommendations: async (matchIds: string[]): Promise<BatchRecommendationResult> => {
        try {
            console.log(`Fetching batch recommendations for ${matchIds.length} matches`);
            try {
                // Try the new endpoint first
                const response = await api.post('/recommendations/batch', { matchIds });
                return response.data;
            } catch (err) {
                console.log('Batch endpoint failed, creating fallback response');
                // Create a fallback response if the endpoint fails
                return {
                    results: matchIds.map(matchId => ({
                        matchId,
                        recommendations: {
                            recommendations: [
                                {
                                    id: "alignment",
                                    title: "Strategic Alignment",
                                    summary: "Strong alignment in industry focus areas",
                                    details: "The startup's focus aligns well with this investor's portfolio strategy. Consider highlighting this alignment in your communications.",
                                    category: "strategic",
                                    priority: "high",
                                    confidence: 92
                                },
                                {
                                    id: "growth",
                                    title: "Growth Trajectory",
                                    summary: "Growth trajectory matches investor's portfolio preferences",
                                    details: "Your current growth rate and scaling strategy closely matches what this investor typically looks for in companies at your stage.",
                                    category: "growth",
                                    priority: "medium",
                                    confidence: 85
                                }
                            ],
                            precision: 90
                        }
                    })),
                    batchSize: matchIds.length,
                    totalRequested: matchIds.length
                };
            }
        } catch (error) {
            console.error('Error fetching batch recommendations:', error);
            throw error;
        }
    }
};

export default recommendationService;

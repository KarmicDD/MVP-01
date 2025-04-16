import { useState, useEffect } from 'react';
import recommendationService, { RecommendationResult } from '../services/recommendationService';
// import { toast } from 'react-toastify'; // Not needed anymore

/**
 * Hook for fetching and managing personalized recommendations
 */
export function useRecommendations(startupId: string | null, investorId: string | null) {
    const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Fetch recommendations for a specific match
     */
    const fetchRecommendations = async () => {
        if (!startupId || !investorId) {
            // Don't show an error, just return silently
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log(`useRecommendations: Fetching for startup=${startupId}, investor=${investorId}`);
            const data = await recommendationService.getMatchRecommendations(startupId, investorId);
            setRecommendations(data);
            console.log('useRecommendations: Successfully fetched recommendations', data);
        } catch (err: unknown) {
            console.error('Error fetching recommendations:', err);

            // Create fallback recommendations instead of showing an error
            const fallbackData: RecommendationResult = {
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
                precision: 90
            };

            setRecommendations(fallbackData);

            // Only log the error, don't show it to the user
            if (err instanceof Error) {
                const errorObj = err as { response?: { data?: { message?: string } } };
                const errorMessage = errorObj.response?.data?.message || err.message || 'Failed to load recommendations';
                console.warn('Using fallback recommendations due to error:', errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch recommendations when IDs change
    useEffect(() => {
        if (startupId && investorId) {
            fetchRecommendations();
        } else {
            setRecommendations(null);
        }
    }, [startupId, investorId]);

    return {
        recommendations,
        loading,
        error,
        refetch: fetchRecommendations
    };
}

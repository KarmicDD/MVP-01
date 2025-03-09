import { startupQuestions, investorQuestions } from '../constants/questionsData';
import logger from '../utils/logger';

// Define category weights for analysis
const CATEGORY_WEIGHTS = {
    'Product Strategy': 1.0,
    'Company Culture': 0.9,
    'Governance & Transparency': 0.7,
    'Financial Strategy': 1.0,
    'Growth & Scaling': 0.8,
    'Leadership Style': 1.0,
    'Communication Style': 0.8,
    'Innovation & Technology': 0.9,
    'Values & Mission': 1.0,
    'Operations': 0.7
};

/**
 * Analyze questionnaire responses to generate a user profile
 * that can be used for matching
 */
export const analyzeResponses = async (
    responses: Record<string, any>,
    userRole: 'startup' | 'investor'
): Promise<any> => {
    try {
        const questions = userRole === 'startup' ? startupQuestions : investorQuestions;

        // Categorize responses by question category
        const categorizedResponses: Record<string, any[]> = {};

        // Process all responses
        for (const questionId in responses) {
            const question = questions.find(q => q.id === questionId);
            if (!question) continue;

            if (!categorizedResponses[question.category]) {
                categorizedResponses[question.category] = [];
            }

            categorizedResponses[question.category].push({
                question,
                response: responses[questionId]
            });
        }

        // Calculate category scores (0-100)
        const categoryScores: Record<string, number> = {};
        for (const category in categorizedResponses) {
            const categoryQuestions = categorizedResponses[category];
            let totalScore = 0;

            // For each question in the category, calculate a score
            for (const item of categoryQuestions) {
                const score = calculateQuestionScore(item.question, item.response);
                totalScore += score;
            }

            // Average score for the category
            categoryScores[category] = Math.round(totalScore / categoryQuestions.length);
        }

        // Generate profile keywords based on high scores
        const profileKeywords = generateProfileKeywords(categoryScores, responses, userRole);

        // Generate match preferences
        const matchPreferences = generateMatchPreferences(responses, userRole);

        return {
            categories: categoryScores,
            overallProfile: profileKeywords,
            matchPreferences
        };
    } catch (error) {
        logger.error('Error analyzing questionnaire responses:', error);
        throw error;
    }
};

/**
 * Calculate a score (0-100) for a single question response
 */
function calculateQuestionScore(question: any, response: any): number {
    switch (question.type) {
        case 'radio':
            // Find the index of the selected option
            const index = question.options.findIndex((opt: any) => opt.value === response);
            // Scale to 0-100
            return index >= 0 ? Math.round((index / (question.options.length - 1)) * 100) : 50;

        case 'slider':
            // Sliders are already on a scale, just convert to percentage
            return Math.round(((response - 1) / 4) * 100);

        case 'multi-select':
            // More selections = higher engagement/clarity
            if (Array.isArray(response)) {
                return Math.min(Math.round((response.length / question.options.length) * 100), 100);
            }
            return 0;

        case 'text':
            // Length and quality of response indicates engagement
            if (typeof response === 'string') {
                // Basic heuristic: longer text (up to a point) = better response
                const wordCount = response.trim().split(/\s+/).length;
                return Math.min(Math.round(wordCount * 5), 100); // 20 words = 100%
            }
            return 0;

        default:
            return 50; // Default middle score
    }
}

/**
 * Generate profile keywords based on category scores and specific responses
 */
function generateProfileKeywords(
    categoryScores: Record<string, number>,
    responses: Record<string, any>,
    userRole: 'startup' | 'investor'
): string[] {
    const keywords: string[] = [];

    // Add keywords for high-scoring categories
    for (const category in categoryScores) {
        if (categoryScores[category] >= 75) {
            keywords.push(`Strong ${category}`);
        }
    }

    // Add role-specific keywords based on specific question responses
    if (userRole === 'startup') {
        // Example: Check specific product strategy questions
        if (responses['startup_q1'] === 'very_flexible') {
            keywords.push('Agile');
        }

        // More startup-specific keywords based on responses
        // These would be based on your actual questions
    } else {
        // Investor-specific keywords
        if (responses['investor_q1'] >= 4) {
            keywords.push('Hands-on Investor');
        }

        // More investor-specific keywords
        // These would be based on your actual questions
    }

    return keywords;
}

/**
 * Generate match preferences based on responses
 */
function generateMatchPreferences(
    responses: Record<string, any>,
    userRole: 'startup' | 'investor'
): Record<string, any> {
    // Extract matching preferences from responses
    const preferences: Record<string, any> = {};

    if (userRole === 'startup') {
        // Example preference mappings for startups
        // These would be based on your actual questions
        // For example:
        if (responses['startup_q10']) {
            preferences.investorInvolvement = responses['startup_q10'];
        }
    } else {
        // Example preference mappings for investors
        // These would be based on your actual questions
        if (responses['investor_q5']) {
            preferences.startupStage = responses['investor_q5'];
        }
    }

    return preferences;
}
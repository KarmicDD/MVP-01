/**
 * Helper function to extract JSON from potentially markdown-wrapped response
 * This is useful when dealing with AI responses that might include markdown code blocks
 */
export function cleanJsonResponse(text: string): string {
    const jsonRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const match = text.match(jsonRegex);

    if (match && match[1]) {
        return match[1].trim();
    }

    return text.trim();
}

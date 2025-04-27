/**
 * Helper function to extract JSON from potentially markdown-wrapped response
 * This is useful when dealing with AI responses that might include markdown code blocks
 */
export function cleanJsonResponse(text: string): string {
    // First try to extract JSON from markdown code blocks
    const jsonRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const match = text.match(jsonRegex);

    if (match && match[1]) {
        return match[1].trim();
    }

    return text.trim();
}

/**
 * Helper function to safely parse JSON with error handling and automatic fixes for common issues
 * @param jsonString The JSON string to parse
 * @returns Parsed JSON object or null if parsing fails
 */
export function safeJsonParse(jsonString: string): any {
    try {
        // First try to parse the JSON as is
        return JSON.parse(jsonString);
    } catch (error) {
        console.log('Initial JSON parsing failed, attempting to fix common issues...');

        try {
            // Try to fix trailing commas in arrays and objects
            const fixedTrailingCommas = jsonString.replace(/,(\s*[\]}])/g, '$1');

            // Try to fix missing commas between array elements or object properties
            const fixedMissingCommas = fixedTrailingCommas.replace(/}(\s*){/g, '},{').replace(/](\s*)\[/g, '],[');

            // Try to fix unquoted property names
            const fixedPropertyNames = fixedMissingCommas.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');

            // Try to parse the fixed JSON
            return JSON.parse(fixedPropertyNames);
        } catch (secondError) {
            console.error('Failed to parse JSON even after attempting fixes:', secondError);
            console.error('Original JSON string:', jsonString);
            return null;
        }
    }
}

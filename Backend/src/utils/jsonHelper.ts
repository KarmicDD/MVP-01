/**
 * Helper function to extract JSON from potentially markdown-wrapped response
 * This is useful when dealing with AI responses that might include markdown code blocks
 */
export function cleanJsonResponse(text: string): string {
    // Handle null or undefined input
    if (!text) {
        console.warn('cleanJsonResponse received empty input');
        return '';
    }

    // First check if the text starts with a markdown code block indicator
    if (text.trim().startsWith('```json')) {
        // Remove the opening ```json and closing ``` tags
        let cleaned = text.replace(/^```json\s*/m, '');
        cleaned = cleaned.replace(/\s*```$/m, '');
        return cleaned.trim();
    }

    // If not starting with ```json, try to extract JSON from markdown code blocks with json tag
    const jsonCodeBlockRegex = /```(?:json)\s*([\s\S]*?)\s*```/;
    const jsonMatch = text.match(jsonCodeBlockRegex);

    if (jsonMatch && jsonMatch[1]) {
        return jsonMatch[1].trim();
    }

    // If no json code block found, try any code block
    const codeBlockRegex = /```\s*([\s\S]*?)\s*```/;
    const codeMatch = text.match(codeBlockRegex);

    if (codeMatch && codeMatch[1]) {
        return codeMatch[1].trim();
    }

    // Remove any non-JSON text before the first { and after the last }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return text.substring(firstBrace, lastBrace + 1).trim();
    }

    // If no code blocks found and no JSON object markers, return the original text
    return text.trim();
}

/**
 * Helper function to safely parse JSON with error handling and automatic fixes for common issues
 * @param jsonString The JSON string to parse
 * @returns Parsed JSON object or null if parsing fails
 */
export function safeJsonParse(jsonString: string): any {
    // Handle empty input
    if (!jsonString || jsonString.trim() === '') {
        console.warn('safeJsonParse received empty input');
        return null;
    }

    try {
        // First try to parse the JSON as is
        return JSON.parse(jsonString);
    } catch (error) {
        console.log('Initial JSON parsing failed, attempting to fix common issues...');
        console.log('Parse error:', (error as Error).message);

        try {
            // More aggressive removal of markdown artifacts
            let fixedString = jsonString;

            // Remove markdown code block markers at the beginning and end
            fixedString = fixedString.replace(/^```(?:json)?\s*/m, '');
            fixedString = fixedString.replace(/\s*```$/m, '');

            // Remove any other markdown code block markers that might be in the string
            fixedString = fixedString.replace(/```(?:json)?\s*/g, '');
            fixedString = fixedString.replace(/\s*```/g, '');

            // Try to fix trailing commas in arrays and objects
            fixedString = fixedString.replace(/,(\s*[\]}])/g, '$1');

            // Try to fix missing commas between array elements or object properties
            fixedString = fixedString.replace(/}(\s*){/g, '},{').replace(/](\s*)\[/g, '],[');

            // Try to fix unquoted property names
            fixedString = fixedString.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');

            // Fix single quotes used instead of double quotes for property names
            fixedString = fixedString.replace(/'([^']*)'(\s*:)/g, '"$1"$2');

            // Fix single quotes used for string values
            fixedString = fixedString.replace(/:\s*'([^']*)'/g, ': "$1"');

            // Try to parse the fixed JSON
            return JSON.parse(fixedString);
        } catch (secondError) {
            console.log('First round of fixes failed, attempting more aggressive fixes...');
            console.log('Second parse error:', (secondError as Error).message);

            try {
                // Try to handle truncated JSON by adding missing closing brackets
                let fixedString = jsonString;

                // Remove markdown code block markers more aggressively
                fixedString = fixedString.replace(/```(?:json)?/g, '');

                // Remove any other non-JSON characters that might be at the beginning
                fixedString = fixedString.replace(/^[^{\[]+/, '');

                // Remove any non-JSON characters that might be at the end
                fixedString = fixedString.replace(/[^}\]]+$/, '');

                // Fix escaped quotes that might be causing issues
                fixedString = fixedString.replace(/\\"/g, '"');
                fixedString = fixedString.replace(/\\\\/g, '\\');

                // Fix newlines in string literals
                fixedString = fixedString.replace(/([":,\[{])\s*"([^"]*)[\n\r]+([^"]*)"(\s*[":,\]}])/g, '$1"$2 $3"$4');

                // Count opening and closing braces/brackets
                const openBraces = (fixedString.match(/\{/g) || []).length;
                const closeBraces = (fixedString.match(/\}/g) || []).length;
                const openBrackets = (fixedString.match(/\[/g) || []).length;
                const closeBrackets = (fixedString.match(/\]/g) || []).length;

                // Add missing closing braces/brackets
                for (let i = 0; i < openBraces - closeBraces; i++) {
                    fixedString += '}';
                }

                for (let i = 0; i < openBrackets - closeBrackets; i++) {
                    fixedString += ']';
                }

                // Try to parse again
                return JSON.parse(fixedString);
            } catch (thirdError) {
                console.error('Failed to parse JSON even after attempting aggressive fixes:', (thirdError as Error).message);

                // Try one last approach - extract just the outer JSON object
                try {
                    const firstBrace = jsonString.indexOf('{');
                    const lastBrace = jsonString.lastIndexOf('}');

                    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                        const extractedJson = jsonString.substring(firstBrace, lastBrace + 1);
                        console.log('Attempting to parse extracted JSON object...');
                        return JSON.parse(extractedJson);
                    }
                } catch (finalError) {
                    console.error('All JSON parsing attempts failed');
                }

                // Log a sample of the problematic JSON to help with debugging
                if (jsonString.length > 1000) {
                    console.error('First 500 chars of JSON string:', jsonString.substring(0, 500));
                    console.error('Last 500 chars of JSON string:', jsonString.substring(jsonString.length - 500));
                } else {
                    console.error('Original JSON string:', jsonString);
                }

                return null;
            }
        }
    }
}

/**
 * Attempts to recover and parse a truncated JSON response
 * @param jsonString The potentially truncated JSON string
 * @returns Parsed JSON object or null if recovery fails
 */
export function recoverTruncatedJson(jsonString: string): any {
    // Handle empty input
    if (!jsonString || jsonString.trim() === '') {
        console.warn('recoverTruncatedJson received empty input');
        return null;
    }

    try {
        // First try normal parsing
        return JSON.parse(jsonString);
    } catch (error) {
        console.log('JSON appears to be truncated, attempting recovery...');
        console.log('Initial recovery error:', (error as Error).message);

        try {
            // First, clean up any markdown formatting
            let cleanedString = jsonString;

            // Remove markdown code block markers
            cleanedString = cleanedString.replace(/^```(?:json)?\s*/m, '');
            cleanedString = cleanedString.replace(/\s*```$/m, '');
            cleanedString = cleanedString.replace(/```(?:json)?\s*/g, '');
            cleanedString = cleanedString.replace(/\s*```/g, '');

            // Try parsing the cleaned string
            try {
                return JSON.parse(cleanedString);
            } catch (cleanError) {
                // Continue with recovery attempts
                console.log('Cleaned string parsing failed:', (cleanError as Error).message);
            }

            // Find the last complete object or array (using multiline approach instead of 's' flag)
            const lastCompleteObjectRegex = new RegExp('(.*\\}),?\\s*"[^"]*$', 'gm');
            const lastCompleteArrayRegex = new RegExp('(.*\\]),?\\s*"[^"]*$', 'gm');

            let match = cleanedString.match(lastCompleteObjectRegex) || cleanedString.match(lastCompleteArrayRegex);

            if (match && match[1]) {
                // If we found a complete object/array, try to close the outer structure
                let recovered = match[1];

                // If the JSON starts with {, close it with }
                if (cleanedString.trim().startsWith('{') && !recovered.endsWith('}')) {
                    recovered += '}';
                }

                // If the JSON starts with [, close it with ]
                if (cleanedString.trim().startsWith('[') && !recovered.endsWith(']')) {
                    recovered += ']';
                }

                try {
                    return JSON.parse(recovered);
                } catch (matchError) {
                    console.log('Match-based recovery failed:', (matchError as Error).message);
                    // Continue with other recovery methods
                }
            }

            // Try to find and extract the main JSON object
            const firstBrace = cleanedString.indexOf('{');
            const lastBrace = cleanedString.lastIndexOf('}');

            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                try {
                    const extractedJson = cleanedString.substring(firstBrace, lastBrace + 1);
                    console.log('Attempting to parse extracted JSON object...');
                    return JSON.parse(extractedJson);
                } catch (extractError) {
                    console.log('Extraction-based recovery failed:', (extractError as Error).message);
                    // Continue with other recovery methods
                }
            }

            // If we couldn't find a complete object/array, try more aggressive recovery
            // Remove any non-JSON characters at the beginning and end
            cleanedString = cleanedString.replace(/^[^{\[]+/, '');
            cleanedString = cleanedString.replace(/[^}\]]+$/, '');

            // Fix common JSON syntax issues
            cleanedString = cleanedString.replace(/,(\s*[\]}])/g, '$1'); // Remove trailing commas
            cleanedString = cleanedString.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3'); // Quote unquoted property names
            cleanedString = cleanedString.replace(/'([^']*)'(\s*:)/g, '"$1"$2'); // Fix single quotes in property names
            cleanedString = cleanedString.replace(/:\s*'([^']*)'/g, ': "$1"'); // Fix single quotes in values

            // Fix newlines in string literals
            cleanedString = cleanedString.replace(/([":,\[{])\s*"([^"]*)[\n\r]+([^"]*)"(\s*[":,\]}])/g, '$1"$2 $3"$4');

            // Count opening and closing braces/brackets
            const openBraces = (cleanedString.match(/\{/g) || []).length;
            const closeBraces = (cleanedString.match(/\}/g) || []).length;
            const openBrackets = (cleanedString.match(/\[/g) || []).length;
            const closeBrackets = (cleanedString.match(/\]/g) || []).length;

            console.log('Brace counts:', { openBraces, closeBraces, openBrackets, closeBrackets });

            // Add missing closing braces/brackets
            let recovered = cleanedString;
            for (let i = 0; i < openBraces - closeBraces; i++) {
                recovered += '}';
            }

            for (let i = 0; i < openBrackets - closeBrackets; i++) {
                recovered += ']';
            }

            try {
                return JSON.parse(recovered);
            } catch (finalRecoveryError) {
                console.log('Final recovery attempt failed:', (finalRecoveryError as Error).message);

                // Try one last desperate approach - create a minimal valid object with reportCalculated field
                if (recovered.includes('"reportCalculated"')) {
                    try {
                        console.log('Attempting to create minimal valid object with reportCalculated field');
                        return { reportCalculated: false };
                    } catch (e) {
                        // This shouldn't fail but just in case
                    }
                }

                return null;
            }
        } catch (recoveryError) {
            console.error('Failed to recover truncated JSON:', (recoveryError as Error).message);

            // Create a minimal valid object as a last resort
            console.log('Creating minimal valid object as fallback');
            return { reportCalculated: false };
        }
    }
}

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

// Create models with different configurations
const createModel = (modelName: string, config: any = {}) => {
  return genAI.getGenerativeModel({
    model: modelName,
    ...config
  });
};

// Default models
const defaultModel = createModel("gemini-2.5-flash-preview-04-17");
const financialModel = createModel("gemini-2.5-flash-preview-04-17");
const beliefSystemModel = createModel("gemini-2.5-flash-preview-04-17", {
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  }
});

/**
 * Execute a Gemini API call with retry logic
 * @param apiCallFn Function that makes the actual API call
 * @param maxRetries Maximum number of retry attempts
 * @param initialDelay Initial delay in milliseconds before the first retry
 * @returns Promise with the API call result
 */
export async function executeWithRetry<T>(
  apiCallFn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Attempt the API call
      return await apiCallFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if we've reached the maximum number of retries
      if (attempt === maxRetries) {
        console.error(`All ${maxRetries} retry attempts failed for Gemini API call:`, lastError);
        throw lastError;
      }
      
      // Network-related errors should be retried
      const isNetworkError = 
        lastError.message.includes('fetch failed') || 
        lastError.message.includes('network') ||
        lastError.message.includes('connection') ||
        lastError.message.includes('timeout');
      
      if (!isNetworkError) {
        console.error('Non-network error occurred, not retrying:', lastError);
        throw lastError;
      }
      
      // Calculate delay with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`Gemini API call failed (attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${delay}ms...`);
      
      // Wait before the next retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never be reached due to the throw in the loop, but TypeScript needs it
  throw lastError || new Error('Unknown error occurred during API call retries');
}

/**
 * Generate content with retry logic
 * @param model The Gemini model to use
 * @param prompt The prompt to send to the model
 * @returns The generated content
 */
export async function generateContentWithRetry(model: any, prompt: any): Promise<any> {
  return executeWithRetry(async () => {
    return await model.generateContent(prompt);
  });
}

export { defaultModel, financialModel, beliefSystemModel };

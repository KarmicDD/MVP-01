/**
 * This file contains prompt templates for Gemini API calls
 */

export const financialDueDiligencePrompt = `
TASK: Perform a comprehensive financial due diligence and audit analysis based on the provided financial documents.

RESPONSE FORMAT INSTRUCTIONS:
1. Return ONLY valid, complete JSON with NO markdown formatting
2. Do NOT wrap your response in \`\`\`json or any other code block markers
3. Ensure all JSON is properly formatted with no trailing commas
4. Use the following exact structure:
{
  "reportCalculated": true,
  "reportType": "Financial Due Diligence and Audit Report",
  "executiveSummary": {
    "headline": "Brief headline summarizing the financial health",
    "summary": "Detailed summary of financial analysis and audit findings",
    "keyFindings": ["Key finding 1", "Key finding 2", "Key finding 3", "Key finding 4", "Key finding 5"],
    "recommendedActions": ["Action 1", "Action 2", "Action 3", "Action 4", "Action 5"],
    "keyMetrics": [
      {
        "name": "Key metric name",
        "value": "Metric value",
        "status": "good",
        "description": "Brief description of the metric",
        "trend": "Any trend description",
        "percentChange": "Percentage change from previous period",
        "chartData": {
          "type": "line",
          "labels": ["Period 1", "Period 2", "Period 3"],
          "datasets": [
            {
              "label": "Dataset label",
              "data": [100, 200, 300],
              "backgroundColor": ["#4CAF50", "#FFC107", "#F44336"]
            }
          ]
        }
      }
    ],
    "auditOpinion": {
      "type": "unqualified",
      "statement": "Professional audit opinion statement",
      "qualifications": ["Qualification 1", "Qualification 2"]
    }
  }
}
`;

export const FIN_DD_PROMPT = (companyName: string, startupContext: string, investorContext: string, missingDocumentsContext: string, documentContent: string, structure: string): string => {
  return `
                You are a specialized financial analyst and investment advisor with expertise in Indian company standards and regulations.
                YOU HAVE TO MAKE A VERY DETAILED, THOROUGH, AND PROFESSIONAL REPORT FOR ${companyName} BASED ON THE DOCUMENTS PROVIDED.
                WRITE A LOT, TELL EVERYTHING AND IT MUST BE LIKE AN ADVISORY REPORT FOR INVESTORS. WITH ACTUAL INSIGHTS AND RECOMMENDATIONS.
                THIS REPORT MUST BE SUITABLE FOR INVESTORS, REGULATORS, AND STAKEHOLDERS.

                *** CRITICAL DATA FORMATTING REQUIREMENTS ***
                1. ALL NUMERIC VALUES MUST BE PLAIN NUMBERS WITHOUT SYMBOLS
                2. DO NOT USE % SYMBOLS IN PERCENTAGE VALUES (e.g., use 24.1 not "24.1%")
                3. DO NOT USE CURRENCY SYMBOLS (e.g., use 500000 not "$500,000")
                4. DO NOT USE COMMAS IN LARGE NUMBERS (e.g., use 1000000 not "1,000,000")
                5. FOR CHART DATASETS, COMPLETELY OMIT MISSING DATA POINTS (don't use "N/A" or null)
                BUT MAIN FOCUS IS ON CREATING A DETAILED, EXHAUSTIVE, REPORT WHICH CLEARLY SEPARATES FINANCIAL DUE DILIGENCE FROM AUDIT FINDINGS.
                AND TELLS EVERYTHING ABOUT THE COMPANY, ITS FINANCIAL HEALTH, AND ITS INVESTMENT POTENTIAL.
                You are tasked with analyzing the financial documents of ${companyName} to provide a comprehensive report for investors.
                CRITICAL INSTRUCTION FOR CHARTS AND TRENDS:
                - ALL CHARTS MUST INCLUDE MULTIPLE DATA POINTS (AT LEAST 2-3 YEARS OR PERIODS).
                - NEVER CREATE CHARTS WITH ONLY ONE DATA POINT.
                - IF DOCUMENTS FROM MULTIPLE YEARS ARE AVAILABLE (CHECK TIME PERIOD METADATA), USE ALL AVAILABLE YEARS.
                - IF ONLY SINGLE-YEAR DOCUMENTS ARE AVAILABLE, BREAK DOWN DATA INTO QUARTERS OR MONTHS.
                - USE VIBRANT, COLOR-CODED METRICS AND GRAPHS. PROVIDE MAXIMUM, ACCURATE DATA FOR CHARTS.
                - ENSURE ALL TREND CHARTS SHOW ACTUAL TRENDS OVER MULTIPLE TIME PERIODS. MAKE THE REPORT VISUALLY ENGAGING.

                ANY SCORING MUST KEEP IN MIND At the end, startup founders are trying to create something no existent before.
                Success lies on the unique perspective together with fast learning and execution capability of entprepreneurs.
                Thus incorporating those points as data input (you can not create such input data to begin with) and assessing
                forward looking business potential is very hard even by AI, I think. You can still estimate the valuation range
                using multiples of other startups in the same thesis. Traxcn etc does this to the certain extent.

                *** CRITICAL INSTRUCTION: FORWARD-LOOKING INVESTMENT ANALYSIS ***
                THIS REPORT IS PRIMARILY FOR INVESTORS DECIDING WHETHER TO INVEST IN OR BUY ${companyName}.
                WRITE FROM AN INVESTOR'S PERSPECTIVE WITH STRONG EMPHASIS ON FUTURE POTENTIAL.
                CURRENT PROFITABILITY IS ONLY ONE FACTOR - MANY SUCCESSFUL INVESTMENTS (LIKE AMAZON, TESLA, UBER)
                WERE INITIALLY UNPROFITABLE BUT BECAME EXTREMELY VALUABLE DUE TO THEIR FUTURE POTENTIAL.

                EVALUATE BOTH CURRENT FINANCIAL HEALTH AND FUTURE GROWTH POTENTIAL:
                1. MARKET POTENTIAL ANALYSIS:
                   - Evaluate total addressable market (TAM) and growth trajectory with SPECIFIC MARKET SIZE FIGURES
                   - Assess market timing and adoption curves with SPECIFIC TIMELINE PREDICTIONS
                   - Compare to historical patterns of similar disruptive technologies with NAMED EXAMPLES
                   - Identify SPECIFIC MARKET SEGMENTS with highest potential and CONCRETE ENTRY STRATEGIES
                   - Provide ACTIONABLE GO-TO-MARKET RECOMMENDATIONS with implementation steps

                2. INNOVATION ASSESSMENT:
                   - Evaluate uniqueness of technology/approach with SPECIFIC DIFFERENTIATORS
                   - Assess IP portfolio and defensibility with CONCRETE PROTECTION STRATEGIES
                   - Compare to historical innovation trajectories in similar fields with NAMED EXAMPLES
                   - Identify SPECIFIC INNOVATION GAPS and provide ACTIONABLE R&D ROADMAP
                   - Recommend PRACTICAL STEPS to enhance competitive advantage with IMPLEMENTATION TIMELINE

                3. TEAM CAPABILITY EVALUATION:
                   - Assess founder experience and track record with SPECIFIC ACHIEVEMENTS
                   - Evaluate team composition and expertise alignment with IDENTIFIED SKILL GAPS
                   - Compare to successful startup team patterns with NAMED EXAMPLES
                   - Recommend SPECIFIC HIRING PRIORITIES with roles and responsibilities
                   - Suggest PRACTICAL ORGANIZATIONAL STRUCTURE improvements with implementation steps

                4. GROWTH TRAJECTORY PROJECTION:
                   - Project multiple growth scenarios (conservative, moderate, aggressive) with DETAILED ASSUMPTIONS
                   - Assess unit economics at scale with SPECIFIC CAC/LTV PROJECTIONS
                   - Compare to historical growth patterns of similar companies with NAMED EXAMPLES
                   - Provide ACTIONABLE SCALING STRATEGIES with implementation steps and resource requirements
                   - Identify SPECIFIC GROWTH LEVERS and PRACTICAL OPTIMIZATION TACTICS

                PROVIDE A CLEAR INVESTMENT RECOMMENDATION WITH JUSTIFICATION AND A SUCCESS PROBABILITY PERCENTAGE.
                ANALYZE INVESTMENT POTENTIAL ACROSS KEY DIMENSIONS (RETURN POTENTIAL, RISK PROFILE, MARKET POSITION, SCALABILITY,
                FINANCIAL STABILITY, EXIT OPPORTUNITY, COMPETITIVE ADVANTAGE, MANAGEMENT QUALITY).

                *** IMPORTANT: PROFESSIONAL STANDARDS REQUIRED ***
                THIS REPORT SEPARATES FINANCIAL DUE DILIGENCE FROM FORMAL FINANCIAL AUDITING.
                YOUR ANALYSIS MUST MEET PROFESSIONAL STANDARDS SUITABLE TO REPLACE LAWYERS AND CHARTERED ACCOUNTANTS.
                WRITE HIGH-IMPACT, ACTIONABLE, AND SPECIFIC FINDINGS FOR ${companyName}. AVOID GENERIC OR VAGUE LANGUAGE.
                ADOPT A FORMAL, PROFESSIONAL TONE. BE DETAILED AND THOROUGH.

                PROVIDE MAXIMUM DATA FOR CHARTS, INCLUDING VALUES WITHIN CHARTS.

                KEEP THE TOTAL RESPONSE LENGTH UNDER 60,000 TOKENS. DO NOT EXCEED THIS LIMIT. MAINTAIN THE SPECIFIED FORMAT.

                1.  FINANCIAL DUE DILIGENCE (INVESTOR PERSPECTIVE):
                    Focus on investment worthiness, growth potential, financial health, business viability.
                    - Analyze financial performance, market position, growth trajectory.
                    - Evaluate investment potential and risks.
                    - Assess business model sustainability, competitive advantages.
                    - Provide clear investment recommendation with success probability.
                    - Analyze investment potential across key investor-focused dimensions.
                    - Calculate total company score across multiple dimensions.
                    - Offer insights for investment decisions.
                    - IMPORTANT: Assess future potential even if current financials show losses.
                    - Compare to historical patterns of successful companies that were initially unprofitable.

                2.  FORMAL FINANCIAL AUDITING:
                    Focus on compliance, accuracy, fraud detection, adherence to accounting standards.
                    - Verify compliance with accounting standards and regulatory requirements.
                    - Identify potential fraud risks or accounting irregularities.
                    - Assess internal controls and financial reporting processes.
                    - Provide insights for regulatory compliance and financial accuracy.

                Be detailed, thorough, and present information in a visually appealing format with color-coded metrics and graphical data.
                USE AS MANY GRAPHS, CHARTS, AND VISUALIZATIONS AS POSSIBLE.

                TASK: Analyze the provided financial documents for ${companyName}. Deliver a comprehensive, professional report CLEARLY SEPARATING financial due diligence from audit findings. Include data visualizations and charts wherever possible.

                IMPORTANT REPORT STYLE GUIDELINES:
                1. Formal, professional tone for an investment recommendation report.
                2. Specific and precise about ${companyName}'s financial situation; avoid generic statements.
                3. Frame findings as clear, actionable insights for ${companyName} (e.g., "${companyName} shows deficiencies in cash flow management" not "There are cash flow issues").
                4. Use plain, understandable language while maintaining professional standards.
                5. For each deficiency/issue:
                   - State the specific problem at ${companyName}.
                   - Detail potential impact on ${companyName}'s financial health/investment potential.
                   - Provide concrete, tailored recommendations for ${companyName}.
                6. Highlight ${companyName}'s specific financial strengths and weaknesses.
                7. Ensure all metrics, ratios, and findings are relevant to ${companyName}'s industry/business model.
                8. Present as an investment advisor to a client considering investing in ${companyName}.
                9. Clear investment recommendation with justification.
                10. Success probability percentage based on analysis.
                11. Calculate and display a total company score (multiple dimensions).
                12. CRITICAL: Evaluate long-term investment potential even if current financials show losses.

                ${startupContext}
                ${investorContext}
                ${missingDocumentsContext}

                IMPORTANT DOCUMENT ORGANIZATION & METADATA ANALYSIS:
                - Each document has metadata: Filename, Type, Description, Time Period, File Format, Size, Created.
                - CRITICAL: CAREFULLY ANALYZE TIME PERIOD METADATA for documents from different years/periods.
                - EXTREMELY IMPORTANT: USE TIME PERIOD METADATA FOR MULTI-YEAR TREND DATA in all financial metrics and charts.
                - For documents over different time periods (e.g., 2021, 2022, 2023), ALWAYS perform trend analysis across ALL available periods.
                - When multiple documents of the same type exist for different time periods, USE ALL OF THEM for trend data.
                - EXTRACT SPECIFIC FINANCIAL FIGURES FROM EACH TIME PERIOD for multi-year trend charts.
                - If documents have quarterly/monthly breakdowns, USE THESE FOR DETAILED TREND CHARTS.
                - Use Description metadata for context.
                - Clearly indicate time periods in analysis (e.g., "Based on Q1 2023 balance sheet...").
                - Acknowledge limitations for documents with quality issues.
                - For financial projections, state time period and assess reasonableness.
                - ENSURE ALL TREND CHARTS INCLUDE DATA FROM ALL AVAILABLE TIME PERIODS.

                FOLLOW THE RESPONSE FORMAT STRICTLY:
                - DO NOT DEVIATE.
                - ALWAYS RETURN VALID JSON WITH THE CORRECT FORMAT.
                - NO EXPLANATIONS OR MARKDOWN FORMATTING.
                - FOLLOW THE STRUCTURE AS IS. DO NOT ADD/REMOVE/CHANGE FIELDS, NAMES, OR TYPES.

                *** CRITICAL JSON FORMATTING INSTRUCTIONS ***
                - PERFORM ALL CALCULATIONS BEFORE RETURNING JSON. DO NOT INCLUDE EXPRESSIONS OR FORMULAS IN THE JSON.
                - INCORRECT: "data": [4710232 / 12, 10676425 / 12] or "data": [(9082204 / (10676425 / 12))]
                - CORRECT: "data": [392519.33, 889702.08] or "data": [10.2]
                - ALL NUMERIC VALUES MUST BE ACTUAL NUMBERS, NOT CALCULATIONS OR EXPRESSIONS.
                - NEVER INCLUDE SYMBOLS LIKE % OR $ IN NUMERIC VALUES - USE ONLY PLAIN NUMBERS.
                - INCORRECT: "value": "24.1%" or "value": "$500,000"
                - CORRECT: "value": 24.1 or "value": 500000
                - ENSURE ALL ARRAYS CONTAIN PROPERLY CALCULATED VALUES, NOT FORMULAS.
                - DO NOT USE MATHEMATICAL OPERATIONS INSIDE THE JSON STRUCTURE.
                - COMPUTE ALL VALUES BEFORE PLACING THEM IN THE JSON.
                - IMPORTANT: FOR CHART DATASETS, WHEN THERE IS NO DATA AVAILABLE, COMPLETELY OMIT THOSE DATA POINTS.
                - INCORRECT: "data": [30, 100, 40, "N/A", "N/A"] or "data": [30, 100, 40, null, null]
                - CORRECT: "data": [30, 100, 40] (only include actual data points)
                REMEMBER: ALL NUMERIC VALUES MUST BE PLAIN NUMBERS WITHOUT ANY SYMBOLS (%, $, commas, etc.)
                STRICTLY FOLLOW THE JSON FORMAT
                ${structure}

               **IMPORTANT: THIS REPORT MUST MEET INDUSTRY STANDARDS FOR FINANCIAL DUE DILIGENCE AND AUDITING, SUITABLE FOR INVESTORS, REGULATORS, AND STAKEHOLDERS.**
               **AIM TO REPLACE PROFESSIONAL INVESTMENT ADVISORY REPORTS.**
               **PROVIDE RESULTS FROM AN INVESTMENT ADVISOR'S PERSPECTIVE FOR AN INVESTOR IN ${companyName}.**
               **FOCUS ON A CLEAR INVEST/BUY DECISION FOR ${companyName}.**
               **INCLUDE CLEAR INVESTMENT RECOMMENDATION, SUCCESS PROBABILITY, COMPANY SCORES, AND INVESTMENT POTENTIAL METRICS.**
               **USE VIBRANT COLORS AND RICH VISUALIZATIONS.**
               **WRITE IN A FORMAL, ACTIONABLE, INSIGHTFUL TONE. AVOID GENERIC LANGUAGE.**
               **STRICTLY ADHERE TO THE STRUCTURE. DO NOT ADD/REMOVE/CHANGE FIELDS, NAMES, OR TYPES.**
                DOCUMENT CONTENT:
                ${documentContent}
                `;
};

export const structure = `{
                  "reportCalculated": true or false, // IMPORTANT: Set to true if you were able to extract meaningful financial data, false otherwise
                  "reportType": "Financial Due Diligence and Audit Report", // Always include this exact title
                  "reportPerspective": "Investor", // Always set to "Investor" to indicate this report is from investor perspective
                  "totalCompanyScore": {
                    "score": numeric value between 0 and 100, // Overall company score (MUST be a calculated number, not a formula)
                    "rating": "Excellent" or "Good" or "Fair" or "Poor" or "Critical", // Rating based on score
                    "description": "Brief description of the overall company score"
                  },
                  "investmentDecision": {
                    "recommendation": "Invest" or "Consider with Conditions" or "Do Not Invest", // Clear investment recommendation
                    "successProbability": numeric value between 0 and 100, // Probability of successful investment as percentage
                    "justification": "Detailed justification for the investment recommendation",
                    "keyConsiderations": ["Consideration 1", "Consideration 2", "Consideration 3"],
                    "suggestedTerms": ["Term 1", "Term 2", "Term 3"], // Suggested investment terms if applicable
                    "chartData": {
                      "type": "doughnut", // Doughnut chart for success probability
                      "labels": ["Success Probability", "Risk Factor"],
                      "datasets": [
                        {
                          "data": [successProbabilityValue, 100 - successProbabilityValue], // Success probability and remaining risk (CALCULATE THESE VALUES FIRST, DO NOT INCLUDE FORMULAS)
                          "backgroundColor": ["#4CAF50", "#F5F5F5"] // Green for success probability, light gray for remaining risk
                        }
                      ]
                    }
                  },
                  "compatibilityAnalysis": {
                    "overallMatch": "Strong Match" or "Moderate Match" or "Weak Match",
                    "overallScore": numeric value between 0 and 100, // Overall compatibility score
                    "dimensions": [
                      {
                        "name": "Return Potential", // e.g., Return Potential, Risk Profile, Market Position, etc.
                        "score": numeric value between 0 and 100,
                        "description": "Description of the investment potential in this dimension",
                        "status": "excellent" or "good" or "moderate" or "poor"
                      }
                    ],
                    "keyInvestmentStrengths": ["Strength 1", "Strength 2", "Strength 3"],
                    "keyInvestmentChallenges": ["Challenge 1", "Challenge 2", "Challenge 3"],
                    "investmentRecommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
                    "radarChartData": {
                      "type": "radar", // Radar chart for investment compatibility dimensions
                      "labels": ["Return Potential", "Risk Profile", "Market Position", "Scalability", "Financial Stability", "Exit Opportunity", "Competitive Advantage", "Management Quality"],
                      "datasets": [
                        {
                          "label": "Investment Potential Score",
                          "data": [score1, score2, score3, score4, score5, score6, score7, score8], // Scores for each dimension
                          "backgroundColor": "rgba(75, 192, 192, 0.2)",
                          "borderColor": "rgba(75, 192, 192, 1)"
                        }
                      ]
                    }
                  },
                  "executiveSummary": {
                    "headline": "Brief headline summarizing the financial health",
                    "summary": "Detailed summary of financial analysis and audit findings",
                    "keyFindings": ["Key finding 1", "Key finding 2", "Key finding 3", "Key finding 4", "Key finding 5"],
                    "recommendedActions": ["Action 1", "Action 2", "Action 3", "Action 4", "Action 5"],
                    "keyMetrics": [
                      {
                        "name": "Key metric name",
                        "value": "Metric value",
                        "status": "good" or "warning" or "critical",
                        "description": "Brief description of the metric",
                        "trend": "Any trend description (e.g., increasing, decreasing, stable, improving, deteriorating, N/A)",
                        "percentChange": "Percentage change from previous period (e.g., +15%)",
                        "chartData": {
                          "type": "line" or "bar" or "pie", // Type of chart that would best represent this data
                          "labels": ["Period 1", "Period 2", "Period 3"], // Time periods or categories
                          "datasets": [
                            {
                              "label": "Dataset label",
                              "data": [value1, value2, value3], // Numeric values for each period (MUST be calculated numbers, not formulas or expressions)
                              "backgroundColor": ["#4CAF50", "#FFC107", "#F44336"] // Suggested colors (green, yellow, red)
                            }
                          ]
                        }
                      }
                    ],
                    "dueDiligenceSummary": {
                      "investmentWorthiness": "high" or "medium" or "low",
                      "statement": "Summary statement about investment worthiness",
                      "keyStrengths": ["Strength 1", "Strength 2"],
                      "keyRisks": ["Risk 1", "Risk 2"]
                    },
                    "auditOpinion": {
                      "type": "unqualified" or "qualified" or "adverse" or "disclaimer", // Professional audit opinion type
                      "statement": "Professional audit opinion statement",
                      "qualifications": ["Qualification 1", "Qualification 2"] // Only if qualified, adverse, or disclaimer
                    }
                  },
                  "scoringBreakdown": {
                    "overview": "Overview of the scoring breakdown across key dimensions",
                    "categories": [
                      {
                        "name": "Strategic Alignment", // e.g., Strategic Alignment, Operational Maturity, Financial Health, etc.
                        "score": numeric value between 0 and 100,
                        "description": "Description of this scoring category",
                        "status": "excellent" or "good" or "moderate" or "poor",
                        "keyPoints": ["Key point 1", "Key point 2"]
                      },
                      {
                        "name": "Operational Maturity & Compliance",
                        "score": numeric value between 0 and 100,
                        "description": "Description of this scoring category",
                        "status": "excellent" or "good" or "moderate" or "poor",
                        "keyPoints": ["Key point 1", "Key point 2"]
                      },
                      {
                        "name": "Financial Health & Burn Rate",
                        "score": numeric value between 0 and 100,
                        "description": "Description of this scoring category",
                        "status": "excellent" or "good" or "moderate" or "poor",
                        "keyPoints": ["Key point 1", "Key point 2"]
                      },
                      {
                        "name": "Team & Innovation",
                        "score": numeric value between 0 and 100,
                        "description": "Description of this scoring category",
                        "status": "excellent" or "good" or "moderate" or "poor",
                        "keyPoints": ["Key point 1", "Key point 2"]
                      }
                    ],
                    "barChartData": {
                      "type": "horizontalBar", // Horizontal bar chart for scoring categories
                      "labels": ["Strategic Alignment", "Operational Maturity", "Financial Health", "Team & Innovation"],
                      "datasets": [
                        {
                          "label": "Category Scores",
                          "data": [score1, score2, score3, score4], // Scores for each category
                          "backgroundColor": ["#4285F4", "#EA4335", "#FBBC05", "#34A853"] // Google-inspired colors
                        }
                      ]
                    }
                  },
                  "financialAnalysis": {
                    "overview": "Comprehensive overview of the financial analysis",
                    "metrics": [
                      {
                        "name": "Metric name",
                        "value": "Metric value",
                        "status": "good" or "warning" or "critical",
                        "description": "Brief description of the metric",
                        "trend": "Any trend description (e.g., increasing, decreasing, stable, improving, deteriorating, N/A)",
                        "percentChange": "Percentage change from previous period (e.g., +15%)",
                        "industryComparison": "above_average" or "average" or "below_average" or "N/A",
                        "industryValue": "Industry average value",
                        "chartData": {
                          "type": "line" or "bar" or "pie", // Type of chart that would best represent this data
                          "labels": ["Period 1", "Period 2", "Period 3"], // Time periods or categories
                          "datasets": [
                            {
                              "label": "Dataset label",
                              "data": [value1, value2, value3], // Numeric values for each period
                              "backgroundColor": ["#4CAF50", "#FFC107", "#F44336"] // Suggested colors (green, yellow, red)
                            }
                          ]
                        }
                      }
                    ],
                    "trends": [
                      {
                        "name": "Trend name",
                        "description": "Description of the trend",
                        "trend": "Any trend description (e.g., increasing, decreasing, stable, improving, deteriorating)",
                        "impact": "positive" or "negative" or "neutral",
                        "data": [
                          {"period": "Period 1 (e.g., Q1 2023)", "value": numeric value or "N/A"},
                          {"period": "Period 2 (e.g., Q2 2023)", "value": numeric value or "N/A"},
                          {"period": "Period 3 (e.g., Q3 2023)", "value": numeric value or "N/A"}
                        ],
                        "chartData": {
                          "type": "line" or "bar" or "pie", // Type of chart that would best represent this data
                          "labels": ["Period 1", "Period 2", "Period 3"], // Time periods or categories
                          "datasets": [
                            {
                              "label": "Dataset label",
                              "data": [value1, value2, value3], // Numeric values for each period
                              "backgroundColor": ["#4CAF50", "#FFC107", "#F44336"], // Suggested colors
                              "borderColor": "#2196F3", // Suggested color for line charts
                              "backgroundColor": "rgba(33, 150, 243, 0.2)" // Suggested background color with transparency
                            }
                          ]
                        }
                      }
                    ],
                    "growthProjections": [
                      {
                        "metric": "Metric name (e.g., Revenue, Profit)",
                        "currentValue": numeric value or "N/A",
                        "projectedValue": numeric value or "N/A",
                        "timeframe": "Timeframe (e.g., 1 year, 3 years)",
                        "cagr": "Compound Annual Growth Rate (e.g., 12.5%)",
                        "confidence": "high" or "medium" or "low",
                        "chartData": {
                          "type": "bar" or "line", // Type of chart that would best represent this projection
                          "labels": ["Current", "Year 1", "Year 2", "Year 3"], // Projection periods
                          "datasets": [
                            {
                              "label": "Projected Growth",
                              "data": [currentValue, year1Value, year2Value, year3Value], // Only include available numeric values - omit any missing data points
                              "backgroundColor": ["#9C27B0", "#9C27B0", "#9C27B0", "#9C27B0"] // Suggested color for projections
                            }
                          ]
                        }
                      }
                    ],
                    "financialHealthScore": {
                      "score": numeric value between 0 and 100,
                      "rating": "Excellent" or "Good" or "Fair" or "Poor" or "Critical",
                      "description": "Description of the financial health score",
                      "components": [
                        {
                          "category": "Category name (e.g., Liquidity, Profitability)",
                          "score": numeric value between 0 and 100,
                          "weight": numeric value between 0 and 1 (sum of all weights should be 1)
                        }
                      ],
                      "chartData": {
                        "type": "radar", // Radar chart for financial health components
                        "labels": ["Liquidity", "Profitability", "Solvency", "Efficiency", "Growth"],
                        "datasets": [
                          {
                            "label": "Company Score",
                            "data": [score1, score2, score3, score4, score5], // Scores for each component
                            "backgroundColor": "rgba(33, 150, 243, 0.2)",
                            "borderColor": "#2196F3"
                          },
                          {
                            "label": "Industry Average",
                            "data": [avg1, avg2, avg3, avg4, avg5], // Industry average scores
                            "backgroundColor": "rgba(156, 39, 176, 0.2)",
                            "borderColor": "#9C27B0"
                          }
                        ]
                      }
                    }
                  },
                  "recommendations": [
                    "Recommendation 1",
                    "Recommendation 2",
                    "Recommendation 3",
                    "Recommendation 4",
                    "Recommendation 5"
                  ],
                  "riskFactors": [
                    {
                      "category": "Risk category",
                      "level": "high" or "medium" or "low",
                      "description": "Description of risk",
                      "impact": "Potential impact",
                      "mitigationStrategy": "Suggested mitigation strategy",
                      "timeHorizon": "short_term" or "medium_term" or "long_term"
                    }
                  ],
                  "complianceItems": [
                    {
                      "requirement": "Compliance requirement",
                      "status": "compliant" or "partial" or "non-compliant", // IMPORTANT: Only these three values are allowed - do NOT use "unknown" or any other value
                      "details": "Details about compliance status",
                      "severity": "high" or "medium" or "low",
                      "recommendation": "Recommendation to address compliance issue",
                      "deadline": "Suggested deadline for compliance (if applicable)",
                      "regulatoryBody": "Relevant regulatory body (e.g., SEBI, MCA)"
                    }
                  ],
                  "financialStatements": {
                    "balanceSheet": {
                      "assets": {...},
                      "liabilities": {...},
                      "equity": {...},
                      "yearOverYearChange": {
                        "assets": "Percentage change",
                        "liabilities": "Percentage change",
                        "equity": "Percentage change"
                      }
                    },
                    "incomeStatement": {
                      "revenue": numeric value or "N/A",
                      "costOfGoodsSold": numeric value or "N/A",
                      "grossProfit": numeric value or "N/A",
                      "operatingExpenses": numeric value or "N/A",
                      "operatingIncome": numeric value or "N/A",
                      "netIncome": numeric value or "N/A",
                      "yearOverYearChange": {
                        "revenue": "Percentage change",
                        "grossProfit": "Percentage change",
                        "netIncome": "Percentage change"
                      }
                    },
                    "cashFlow": {
                      "operatingActivities": numeric value or "N/A",
                      "investingActivities": numeric value or "N/A",
                      "financingActivities": numeric value or "N/A",
                      "netCashFlow": numeric value or "N/A",
                      "yearOverYearChange": {
                        "operatingActivities": "Percentage change",
                        "netCashFlow": "Percentage change"
                      }
                    }
                  },
                  "ratioAnalysis": {
                    "overview": "Overview of the ratio analysis with key insights",
                    "liquidityRatios": [
                      {
                        "name": "Ratio name",
                        "value": numeric value or "N/A",
                        "formula": "Formula used to calculate the ratio",
                        "industry_average": numeric value or "N/A",
                        "description": "Description of ratio",
                        "interpretation": "Professional interpretation of the ratio value",
                        "status": "good" or "warning" or "critical",
                        "trend": "Any trend description (e.g., improving, stable, deteriorating, increasing, decreasing)",
                        "historicalData": [
                          {"period": "Period 1", "value": numeric value or "N/A"},
                          {"period": "Period 2", "value": numeric value or "N/A"}
                        ],
                        "chartData": {
                          "type": "line", // Type of chart that would best represent this ratio
                          "labels": ["Period 1", "Period 2", "Period 3"], // Time periods
                          "datasets": [
                            {
                              "label": "Company Ratio",
                              "data": [value1, value2, value3], // Only include available numeric values - omit any missing data points
                              "borderColor": "#2196F3",
                              "backgroundColor": "rgba(33, 150, 243, 0.2)"
                            },
                            {
                              "label": "Industry Average",
                              "data": [avg1, avg2, avg3], // Only include available numeric values - omit any missing data points
                              "borderColor": "#9C27B0",
                              "backgroundColor": "rgba(156, 39, 176, 0.2)",
                              "borderDash": [5, 5] // Dashed line for industry average
                            }
                          ]
                        }
                      }
                    ],
                    "profitabilityRatios": [
                      {
                        "name": "Ratio name",
                        "value": numeric value or "N/A",
                        "formula": "Formula used to calculate the ratio",
                        "industry_average": numeric value or "N/A",
                        "description": "Description of ratio",
                        "interpretation": "Professional interpretation of the ratio value",
                        "status": "good" or "warning" or "critical",
                        "trend": "Any trend description (e.g., improving, stable, deteriorating, increasing, decreasing)",
                        "historicalData": [
                          {"period": "Period 1", "value": numeric value or "N/A"},
                          {"period": "Period 2", "value": numeric value or "N/A"}
                        ],
                        "chartData": {
                          "type": "line", // Type of chart that would best represent this ratio
                          "labels": ["Period 1", "Period 2", "Period 3"], // Time periods
                          "datasets": [
                            {
                              "label": "Company Ratio",
                              "data": [value1, value2, value3], // Numeric values for each period
                              "borderColor": "#4CAF50",
                              "backgroundColor": "rgba(76, 175, 80, 0.2)"
                            },
                            {
                              "label": "Industry Average",
                              "data": [avg1, avg2, avg3], // Industry average values
                              "borderColor": "#9C27B0",
                              "backgroundColor": "rgba(156, 39, 176, 0.2)",
                              "borderDash": [5, 5] // Dashed line for industry average
                            }
                          ]
                        }
                      }
                    ],
                    "solvencyRatios": [
                      {
                        "name": "Ratio name",
                        "value": numeric value or "N/A",
                        "formula": "Formula used to calculate the ratio",
                        "industry_average": numeric value or "N/A",
                        "description": "Description of ratio",
                        "interpretation": "Professional interpretation of the ratio value",
                        "status": "good" or "warning" or "critical",
                        "trend": "Any trend description (e.g., improving, stable, deteriorating, increasing, decreasing)",
                        "historicalData": [
                          {"period": "Period 1", "value": numeric value or "N/A"},
                          {"period": "Period 2", "value": numeric value or "N/A"}
                        ],
                        "chartData": {
                          "type": "line", // Type of chart that would best represent this ratio
                          "labels": ["Period 1", "Period 2", "Period 3"], // Time periods
                          "datasets": [
                            {
                              "label": "Company Ratio",
                              "data": [value1, value2, value3], // Numeric values for each period
                              "borderColor": "#FF9800",
                              "backgroundColor": "rgba(255, 152, 0, 0.2)"
                            },
                            {
                              "label": "Industry Average",
                              "data": [avg1, avg2, avg3], // Industry average values
                              "borderColor": "#9C27B0",
                              "backgroundColor": "rgba(156, 39, 176, 0.2)",
                              "borderDash": [5, 5] // Dashed line for industry average
                            }
                          ]
                        }
                      }
                    ],
                    "efficiencyRatios": [
                      {
                        "name": "Ratio name",
                        "value": numeric value or "N/A",
                        "formula": "Formula used to calculate the ratio",
                        "industry_average": numeric value or "N/A",
                        "description": "Description of ratio",
                        "interpretation": "Professional interpretation of the ratio value",
                        "status": "good" or "warning" or "critical",
                        "trend": "Any trend description (e.g., improving, stable, deteriorating, increasing, decreasing)",
                        "historicalData": [
                          {"period": "Period 1", "value": numeric value or "N/A"},
                          {"period": "Period 2", "value": numeric value or "N/A"}
                        ],
                        "chartData": {
                          "type": "line", // Type of chart that would best represent this ratio
                          "labels": ["Period 1", "Period 2", "Period 3"], // Time periods
                          "datasets": [
                            {
                              "label": "Company Ratio",
                              "data": [value1, value2, value3], // Numeric values for each period
                              "borderColor": "#9C27B0",
                              "backgroundColor": "rgba(156, 39, 176, 0.2)"
                            },
                            {
                              "label": "Industry Average",
                              "data": [avg1, avg2, avg3], // Industry average values
                              "borderColor": "#607D8B",
                              "backgroundColor": "rgba(96, 125, 139, 0.2)",
                              "borderDash": [5, 5] // Dashed line for industry average
                            }
                          ]
                        }
                      }
                    ],
                    "ratioComparisonChart": {
                      "type": "radar", // Radar chart for comparing all ratio categories
                      "labels": ["Liquidity", "Profitability", "Solvency", "Efficiency"],
                      "datasets": [
                        {
                          "label": "Company Performance",
                          "data": [liquidityScore, profitabilityScore, solvencyScore, efficiencyScore], // Normalized scores (0-100)
                          "backgroundColor": "rgba(33, 150, 243, 0.2)",
                          "borderColor": "#2196F3"
                        },
                        {
                          "label": "Industry Average",
                          "data": [industryLiquidityScore, industryProfitabilityScore, industrySolvencyScore, industryEfficiencyScore], // Industry average scores
                          "backgroundColor": "rgba(156, 39, 176, 0.2)",
                          "borderColor": "#9C27B0"
                        }
                      ]
                    }
                  },
                  "taxCompliance": {
                    "gst": {
                      "status": "compliant" or "partial" or "non-compliant", // IMPORTANT: Only these three values are allowed - do NOT use "unknown" or any other value
                      "details": "Details about GST compliance",
                      "filingHistory": [
                        {"period": "Period", "status": "filed" or "pending" or "overdue", "dueDate": "Due date"}
                      ],
                      "recommendations": ["Recommendation 1", "Recommendation 2"]
                    },
                    "incomeTax": {
                      "status": "compliant" or "partial" or "non-compliant", // IMPORTANT: Only these three values are allowed - do NOT use "unknown" or any other value
                      "details": "Details about income tax compliance",
                      "filingHistory": [
                        {"period": "Period", "status": "filed" or "pending" or "overdue", "dueDate": "Due date"}
                      ],
                      "recommendations": ["Recommendation 1", "Recommendation 2"]
                    },
                    "tds": {
                      "status": "compliant" or "partial" or "non-compliant", // IMPORTANT: Only these three values are allowed - do NOT use "unknown" or any other value
                      "details": "Details about TDS compliance",
                      "filingHistory": [
                        {"period": "Period", "status": "filed" or "pending" or "overdue", "dueDate": "Due date"}
                      ],
                      "recommendations": ["Recommendation 1", "Recommendation 2"]
                    }
                  },
                  "auditFindings": {
                    "auditScope": "Description of the scope of the audit",
                    "auditMethodology": "Description of the audit methodology used",
                    "auditStandards": ["Relevant Indian Accounting Standard 1", "Relevant Indian Accounting Standard 2"],
                    "findings": [
                      {
                        "area": "Area of finding",
                        "severity": "high" or "medium" or "low",
                        "description": "Description of finding",
                        "recommendation": "Recommendation to address finding",
                        "impact": "Financial or operational impact",
                        "timelineToResolve": "Suggested timeline to resolve",
                        "regulatoryImplications": "Potential regulatory implications",
                        "financialImpact": numeric value or "Not quantifiable",
                        "status": "new" or "recurring" or "resolved"
                      }
                    ],
                    "overallAssessment": "Overall assessment of audit findings",
                    "complianceScore": "Score out of 100",
                    "keyStrengths": ["Strength 1", "Strength 2"],
                    "keyWeaknesses": ["Weakness 1", "Weakness 2"],
                    "materialWeaknesses": [
                      {
                        "area": "Area with material weakness",
                        "description": "Description of the material weakness",
                        "impact": "Impact on financial reporting",
                        "remediation": "Recommended remediation steps"
                      }
                    ],
                    "internalControlAssessment": {
                      "overview": "Overview of internal control assessment",
                      "controlEnvironment": "Assessment of control environment",
                      "riskAssessment": "Assessment of risk assessment processes",
                      "controlActivities": "Assessment of control activities",
                      "informationAndCommunication": "Assessment of information and communication systems",
                      "monitoring": "Assessment of monitoring activities",
                      "significantDeficiencies": [
                        {
                          "area": "Area with significant deficiency",
                          "description": "Description of the deficiency",
                          "impact": "Impact on financial reporting",
                          "recommendation": "Recommendation to address the deficiency"
                        }
                      ]
                    },
                    "findingsByCategory": {
                      "type": "pie", // Pie chart for findings by category
                      "labels": ["Financial Reporting", "Regulatory Compliance", "Operational", "IT Controls", "Governance"],
                      "datasets": [
                        {
                          "data": [count1, count2, count3, count4, count5], // Count of findings in each category
                          "backgroundColor": ["#F44336", "#FF9800", "#FFEB3B", "#4CAF50", "#2196F3"]
                        }
                      ]
                    },
                    "findingsBySeverity": {
                      "type": "bar", // Bar chart for findings by severity
                      "labels": ["High", "Medium", "Low"],
                      "datasets": [
                        {
                          "label": "Number of Findings",
                          "data": [highCount, mediumCount, lowCount], // Count of findings by severity
                          "backgroundColor": ["#F44336", "#FF9800", "#4CAF50"]
                        }
                      ]
                    }
                  },
                  "documentAnalysis": {
                    "availableDocuments": [
                      {
                        "documentType": "Document type name",
                        "quality": "good" or "moderate" or "poor",
                        "completeness": "complete" or "partial" or "incomplete",
                        "keyInsights": ["Detailed financial insight 1 about specific numbers/metrics in this document", "Detailed financial insight 2 about specific numbers/metrics in this document"],
                        "dataReliability": "high" or "medium" or "low" or "N/A",
                        "financialHighlights": ["Key financial figure 1: value with context", "Key financial figure 2: value with context"],
                        "redFlags": ["Specific financial concern 1 with details", "Specific financial concern 2 with details"],
                        "recommendations": ["Specific recommendation for improving financial data quality"]
                      }
                    ],
                    "missingDocuments": {
                      "list": ["Document type 1", "Document type 2"],
                      "impact": "Detailed description of how missing documents impact specific financial analysis areas",
                      "recommendations": ["Specific recommendation for obtaining missing financial documents"],
                      "priorityLevel": "high" or "medium" or "low"
                    }
                  },
                  "documentContentAnalysis": {
                    "overview": "Comprehensive overview of the financial content analysis findings across all documents",
                    "dueDiligenceFindings": {
                      "summary": "Detailed summary of financial due diligence findings with specific metrics and figures from document content",
                      "keyInsights": ["Specific financial insight with exact figures and time periods", "Detailed analysis of financial performance with exact metrics"],
                      "investmentImplications": ["Specific investment implication with financial reasoning and data points", "Detailed ROI/valuation analysis with supporting figures"],
                      "growthIndicators": ["Specific growth metric with exact figures and comparison to industry standards", "Detailed trend analysis with percentage changes over time"],
                      "riskFactors": ["Specific financial risk with quantified potential impact", "Detailed analysis of financial vulnerability with supporting data"]
                    },
                    "auditFindings": {
                      "summary": "Detailed summary of audit findings with specific accounting issues identified in the documents",
                      "complianceIssues": ["Specific compliance issue with exact regulatory requirement and financial impact", "Detailed analysis of compliance gap with recommended remediation"],
                      "accountingConcerns": ["Specific accounting concern with exact figures and GAAP/Ind AS reference", "Detailed analysis of accounting treatment with financial impact"],
                      "internalControlWeaknesses": ["Specific internal control weakness with financial process affected and risk quantification", "Detailed control gap analysis with recommended improvements"],
                      "fraudRiskIndicators": ["Specific fraud risk indicator with exact suspicious patterns/transactions", "Detailed analysis of potential fraud risk with financial impact"]
                    },
                    "documentSpecificAnalysis": [
                      {
                        "documentType": "Document type name",
                        "contentSummary": "Detailed summary of the document's financial content with time period and key figures",
                        "dueDiligenceInsights": ["Specific financial insight from this document with exact figures and implications", "Detailed analysis of financial performance metrics from this document"],
                        "auditInsights": ["Specific audit insight from this document with accounting standards reference", "Detailed analysis of financial reporting quality from this document"],
                        "keyFinancialData": ["Specific financial figure: exact value with context and trend", "Key ratio: exact value with industry comparison and interpretation"],
                        "inconsistencies": ["Specific inconsistency between figures with exact values and locations", "Detailed analysis of data discrepancy with potential causes"],
                        "recommendations": ["Specific recommendation based on document content with expected financial impact", "Detailed improvement suggestion with implementation steps"]
                      }
                    ]
                  },
                  "forwardLookingAnalysis": {
                    "marketPotential": {
                      "tamSize": numeric value or "N/A", // Total addressable market size
                      "growthRate": numeric value or "N/A", // Market growth rate
                      "adoptionStage": "Early Adoption" or "Growth Phase" or "Maturity" or "Decline",
                      "targetSegments": ["Specific market segment 1", "Specific market segment 2"], // Specific market segments with highest potential
                      "entryStrategy": "Detailed market entry strategy with specific steps and timeline",
                      "competitiveLandscape": "Detailed analysis of competitive landscape with named competitors and their positions",
                      "historicalComparisons": ["Named example 1 of similar market development", "Named example 2 of similar market development"],
                      "goToMarketRecommendations": [
                        {
                          "recommendation": "Specific actionable recommendation",
                          "implementationSteps": ["Step 1", "Step 2", "Step 3"],
                          "timeline": "Expected timeline for implementation (e.g., Q1 2024 - Q2 2024)",
                          "resourceRequirements": "Specific resources needed (e.g., budget, personnel)",
                          "expectedOutcome": "Expected outcome with specific metrics"
                        }
                      ],
                      "metrics": [
                        {
                          "name": "Metric name",
                          "value": numeric value or "N/A",
                          "description": "Description of the metric",
                          "trend": "increasing" or "decreasing" or "stable",
                          "status": "positive" or "neutral" or "negative"
                        }
                      ]
                    },
                    "innovationAssessment": {
                      "uniquenessScore": numeric value between 0 and 100,
                      "ipStrength": "Strong" or "Moderate" or "Weak",
                      "competitiveAdvantage": "Detailed description of competitive advantage",
                      "keyDifferentiators": ["Specific differentiator 1", "Specific differentiator 2"],
                      "protectionStrategies": ["Specific IP protection strategy 1", "Specific IP protection strategy 2"],
                      "innovationGaps": ["Specific innovation gap 1", "Specific innovation gap 2"],
                      "rdRoadmap": [
                        {
                          "priority": "High" or "Medium" or "Low",
                          "initiative": "Specific R&D initiative",
                          "timeline": "Expected timeline (e.g., Q3 2024 - Q1 2025)",
                          "resourceRequirements": "Specific resources needed",
                          "expectedOutcome": "Expected outcome with specific metrics"
                        }
                      ],
                      "historicalComparisons": ["Named example 1 of similar innovation trajectory", "Named example 2 of similar innovation trajectory"],
                      "metrics": [
                        {
                          "name": "Metric name",
                          "value": numeric value or "N/A",
                          "description": "Description of the metric",
                          "trend": "increasing" or "decreasing" or "stable",
                          "status": "positive" or "neutral" or "negative"
                        }
                      ]
                    },
                    "teamCapability": {
                      "executionScore": numeric value between 0 and 100,
                      "experienceLevel": "High" or "Medium" or "Low",
                      "trackRecord": "Detailed description of team track record",
                      "founderAchievements": ["Specific founder achievement 1", "Specific founder achievement 2"],
                      "identifiedSkillGaps": ["Specific skill gap 1", "Specific skill gap 2"],
                      "hiringPriorities": [
                        {
                          "role": "Specific role to hire",
                          "responsibilities": ["Key responsibility 1", "Key responsibility 2"],
                          "impact": "Expected impact on business",
                          "timeline": "When to hire (e.g., Immediate, Q2 2024)"
                        }
                      ],
                      "organizationalImprovements": [
                        {
                          "area": "Area for improvement",
                          "recommendation": "Specific recommendation",
                          "implementationSteps": ["Step 1", "Step 2", "Step 3"],
                          "expectedOutcome": "Expected outcome with specific metrics"
                        }
                      ],
                      "historicalComparisons": ["Named example 1 of successful team pattern", "Named example 2 of successful team pattern"],
                      "metrics": [
                        {
                          "name": "Metric name",
                          "value": numeric value or "N/A",
                          "description": "Description of the metric",
                          "trend": "increasing" or "decreasing" or "stable",
                          "status": "positive" or "neutral" or "negative"
                        }
                      ]
                    },
                    "growthTrajectory": {
                      "scenarios": {
                        "conservative": numeric value, // Conservative growth rate percentage
                        "moderate": numeric value, // Moderate growth rate percentage
                        "aggressive": numeric value // Aggressive growth rate percentage
                      },
                      "assumptions": [
                        {
                          "scenario": "conservative" or "moderate" or "aggressive",
                          "assumptions": ["Detailed assumption 1", "Detailed assumption 2"]
                        }
                      ],
                      "unitEconomics": {
                        "currentCac": numeric value or "N/A", // Current customer acquisition cost
                        "projectedCac": numeric value or "N/A", // Projected customer acquisition cost
                        "currentLtv": numeric value or "N/A", // Current lifetime value
                        "projectedLtv": numeric value or "N/A" // Projected lifetime value
                      },
                      "scalingStrategies": [
                        {
                          "strategy": "Specific scaling strategy",
                          "implementationSteps": ["Step 1", "Step 2", "Step 3"],
                          "resourceRequirements": "Specific resources needed",
                          "timeline": "Expected timeline",
                          "expectedOutcome": "Expected outcome with specific metrics"
                        }
                      ],
                      "growthLevers": ["Specific growth lever 1", "Specific growth lever 2"],
                      "optimizationTactics": ["Specific optimization tactic 1", "Specific optimization tactic 2"],
                      "historicalComparisons": ["Named example 1 of similar growth pattern", "Named example 2 of similar growth pattern"],
                      "metrics": [
                        {
                          "name": "Metric name",
                          "value": numeric value or "N/A",
                          "description": "Description of the metric",
                          "trend": "increasing" or "decreasing" or "stable",
                          "status": "positive" or "neutral" or "negative"
                        }
                      ]
                    },
                    "dimensions": [
                      {
                        "name": "Dimension name",
                        "score": numeric value between 0 and 100,
                        "description": "Description of this dimension",
                        "status": "excellent" or "good" or "moderate" or "poor"
                      }
                    ],
                    "chartData": {
                      "type": "radar",
                      "labels": ["Market Potential", "Innovation", "Team Capability", "Growth Trajectory"],
                      "datasets": [
                        {
                          "label": "Forward-Looking Score",
                          "data": [score1, score2, score3, score4],
                          "backgroundColor": "rgba(75, 192, 192, 0.2)",
                          "borderColor": "rgba(75, 192, 192, 1)"
                        }
                      ]
                    }
                  },
                  "industryBenchmarking": {
                    "overview": "Overview of industry benchmarking",
                    "industryContext": "Description of the industry context and trends",
                    "peerComparison": "Analysis of how the company compares to direct peers",
                    "metrics": [
                      {
                        "name": "Metric name",
                        "companyValue": numeric value or "N/A",
                        "industryAverage": numeric value or "N/A",
                        "percentile": "Percentile within industry (e.g., 75th)",
                        "status": "above_average" or "average" or "below_average" or "N/A",
                        "interpretation": "Professional interpretation of the company's position",
                        "chartData": {
                          "type": "bar", // Bar chart for company vs industry comparison
                          "labels": ["Company", "Industry Average", "Top Quartile", "Bottom Quartile"],
                          "datasets": [
                            {
                              "label": "Metric Values",
                              "data": [companyValue, industryAvg, topQuartile, bottomQuartile], // Values for comparison
                              "backgroundColor": ["#2196F3", "#9C27B0", "#4CAF50", "#F44336"]
                            }
                          ]
                        }
                      }
                    ],
                    "competitivePosition": "Description of competitive position",
                    "marketShareAnalysis": "Analysis of the company's market share and positioning",
                    "strengths": ["Strength 1", "Strength 2"],
                    "challenges": ["Challenge 1", "Challenge 2"],
                    "opportunities": ["Opportunity 1", "Opportunity 2"],
                    "threats": ["Threat 1", "Threat 2"],
                    "industryOutlook": "Outlook for the industry over the next 1-3 years",
                    "benchmarkingCharts": {
                      "financialPerformance": {
                        "type": "radar", // Radar chart for financial performance benchmarking
                        "labels": ["Revenue Growth", "Profit Margin", "ROI", "Cash Flow", "Debt Ratio"],
                        "datasets": [
                          {
                            "label": "Company",
                            "data": [companyScore1, companyScore2, companyScore3, companyScore4, companyScore5], // Only include available numeric values - omit any missing data points
                            "backgroundColor": "rgba(33, 150, 243, 0.2)",
                            "borderColor": "#2196F3"
                          },
                          {
                            "label": "Industry Average",
                            "data": [industryScore1, industryScore2, industryScore3, industryScore4, industryScore5], // Only include available numeric values - omit any missing data points
                            "backgroundColor": "rgba(156, 39, 176, 0.2)",
                            "borderColor": "#9C27B0"
                          },
                          {
                            "label": "Top Performers",
                            "data": [topScore1, topScore2, topScore3, topScore4, topScore5], // Only include available numeric values - omit any missing data points
                            "backgroundColor": "rgba(76, 175, 80, 0.2)",
                            "borderColor": "#4CAF50"
                          }
                        ]
                      },
                      "operationalEfficiency": {
                        "type": "radar", // Radar chart for operational efficiency benchmarking
                        "labels": ["Asset Turnover", "Inventory Turnover", "Receivables Turnover", "Employee Productivity", "Operating Cycle"],
                        "datasets": [
                          {
                            "label": "Company",
                            "data": [companyScore1, companyScore2, companyScore3, companyScore4, companyScore5], // Normalized scores (0-100)
                            "backgroundColor": "rgba(33, 150, 243, 0.2)",
                            "borderColor": "#2196F3"
                          },
                          {
                            "label": "Industry Average",
                            "data": [industryScore1, industryScore2, industryScore3, industryScore4, industryScore5], // Industry average scores
                            "backgroundColor": "rgba(156, 39, 176, 0.2)",
                            "borderColor": "#9C27B0"
                          }
                        ]
                      }
                    }
                  },

                  "shareholdersTable": {
                    "overview": "Overview of the company's shareholding structure",
                    "shareholders": [
                      {
                        "name": "Shareholder name",
                        "equityPercentage": "Percentage value as plain number (e.g., 25 not 25%)",
                        "shareCount": "Number of shares",
                        "faceValue": "Face value per share",
                        "investmentAmount": "Total investment amount",
                        "shareClass": "Share class (e.g., Equity, Preference)"
                      }
                    ],
                    "totalShares": "Total number of shares",
                    "totalEquity": "Total equity percentage (should be 100%)",
                    "analysis": "Detailed analysis of the shareholding structure",
                    "recommendations": ["Recommendation 1", "Recommendation 2"]
                  },
                  "directorsTable": {
                    "overview": "Overview of the company's board of directors",
                    "directors": [
                      {
                        "name": "Director name",
                        "position": "Position/designation",
                        "appointmentDate": "Date of appointment",
                        "din": "Director Identification Number",
                        "shareholding": "Shareholding percentage or count",
                        "expertise": "Area of expertise/background"
                      }
                    ],
                    "analysis": "Detailed analysis of the board composition",
                    "recommendations": ["Recommendation 1", "Recommendation 2"]
                  },
                  "keyBusinessAgreements": {
                    "overview": "Overview of key business agreements",
                    "agreements": [
                      {
                        "type": "Type of agreement",
                        "parties": "Parties involved",
                        "date": "Effective date",
                        "duration": "Duration of agreement",
                        "value": "Financial value",
                        "keyTerms": "Key terms and conditions"
                      }
                    ],
                    "analysis": "Detailed analysis of the business agreements",
                    "recommendations": ["Recommendation 1", "Recommendation 2"]
                  },
                  "leavePolicy": {
                    "overview": "Overview of the company's leave policy",
                    "policies": [
                      {
                        "type": "Type of leave",
                        "daysAllowed": "Number of days allowed",
                        "eligibility": "Eligibility criteria",
                        "carryForward": true or false,
                        "encashment": true or false
                      }
                    ],
                    "analysis": "Detailed analysis of the leave policy",
                    "recommendations": ["Recommendation 1", "Recommendation 2"]
                  },
                  "provisionsAndPrepayments": {
                    "overview": "Overview of provisions and prepayments",
                    "items": [
                      {
                        "name": "Item name",
                        "type": "Type (Provision or Prepayment)",
                        "amount": "Amount value",
                        "period": "Period covered",
                        "status": "adequate" or "inadequate" or "uncertain",
                        "notes": "Additional notes"
                      }
                    ],
                    "analysis": "Detailed analysis of provisions and prepayments",
                    "recommendations": ["Recommendation 1", "Recommendation 2"]
                  },
                  "deferredTaxAssets": {
                    "overview": "Overview of deferred tax assets",
                    "items": [
                      {
                        "name": "Asset name",
                        "amount": "Amount value",
                        "origin": "Origin/source",
                        "expectedUtilization": "Expected utilization timeline",
                        "riskLevel": "low" or "medium" or "high"
                      }
                    ],
                    "analysis": "Detailed analysis of deferred tax position",
                    "recommendations": ["Recommendation 1", "Recommendation 2"]
                  }
                }`
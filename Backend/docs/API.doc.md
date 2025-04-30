# KarmicDD API Documentation

## Table of Contents
1. Introduction
2. Authentication
3. Error Handling
4. Questionnaire API
5. Analysis API
6. Financial Due Diligence API
7. Search API
8. Email API

## Introduction

This documentation describes the REST API endpoints for the KarmicDD platform. The API enables interaction with profiles, questionnaires, matching algorithms, and search functionality to connect startups with potential investors.

**Base URL**: `http://localhost:5000/api`

## Authentication

All endpoints require authentication via JWT token unless explicitly stated otherwise.

**Header Format**:
```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

The API uses conventional HTTP response codes to indicate success or failure:

| Code | Description |
|------|-------------|
| 200  | Success |
| 400  | Bad Request - Invalid parameters or request format |
| 401  | Unauthorized - Missing or invalid authentication |
| 403  | Forbidden - Not permitted to access this resource |
| 404  | Not Found - Resource doesn't exist |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Server Error - Something went wrong on our end |

All error responses follow this format:
```json
{
  "message": "Brief error description",
  "error": "Detailed error information",
  "code": "ERROR_CODE"
}
```

## Questionnaire API

Endpoints for managing user questionnaires that capture preferences and characteristics for the matching algorithm.

### Get Questionnaire Status

Check if a user has completed their questionnaire.

**Endpoint**: `GET /questionnaire/status`

**Authentication**: Required

**Response**:

```json
{
  "isComplete": true,
  "status": "submitted",
  "completedAt": "2025-04-10T15:30:45Z",
  "progressPercentage": 100
}
```

or if not completed:

```json
{
  "isComplete": false,
  "status": "draft",
  "lastUpdated": "2025-04-09T10:15:20Z",
  "progressPercentage": 60
}
```

or if no questionnaire exists:

```json
{
  "isComplete": false,
  "status": null,
  "progressPercentage": 0
}
```

### Get Questionnaire Responses

Retrieve a user's questionnaire responses.

**Endpoint**: `GET /questionnaire/:role`

**Parameters**:
- `role`: Either "startup" or "investor"

**Authentication**: Required

**Response**:

```json
{
  "status": "submitted",
  "responses": {
    "startup_q1": "very_flexible",
    "startup_q2": ["industry_connections", "strategic_partnerships"]
  },
  "analysisResults": {
    "categories": {
      "Product Strategy": 85,
      "Growth & Scaling": 70
    },
    "overallProfile": ["Strong Product Strategy", "Agile"],
    "matchPreferences": {
      "investorInvolvement": "collaborative"
    }
  },
  "completedAt": "2025-04-02T09:45:32Z",
  "version": "2.1"
}
```

### Save Draft Responses

Save draft responses for a questionnaire without submitting.

**Endpoint**: `POST /questionnaire/:role/save`

**Parameters**:
- `role`: Either "startup" or "investor"

**Request Body**:

```json
{
  "responses": {
    "startup_q1": "very_flexible",
    "startup_q2": ["industry_connections", "strategic_partnerships"]
  },
  "metadata": {
    "currentSection": "product_strategy",
    "completedSections": ["company_info", "product_strategy"]
  }
}
```

**Response**:

```json
{
  "message": "Questionnaire draft saved successfully",
  "status": "draft",
  "progressPercentage": 65,
  "lastUpdated": "2025-04-11T14:22:18Z",
  "remainingSections": ["growth", "finance"]
}
```

### Submit Questionnaire

Submit final responses for a questionnaire.

**Endpoint**: `POST /questionnaire/:role/submit`

**Parameters**:
- `role`: Either "startup" or "investor"

**Request Body**:

```json
{
  "responses": {
    "startup_q1": "very_flexible",
    "startup_q2": ["industry_connections", "strategic_partnerships"]
  },
  "sessionId": "session-123456"
}
```

**Response**:

```json
{
  "message": "Questionnaire submitted successfully",
  "status": "submitted",
  "completedAt": "2025-04-11T14:30:45Z",
  "analysisResults": {
    "categories": {
      "Product Strategy": 85,
      "Growth & Scaling": 70
    },
    "overallProfile": ["Strong Product Strategy", "Agile"],
    "matchPreferences": {
      "investorInvolvement": "collaborative"
    }
  },
  "matchingSummary": {
    "potentialMatches": 15,
    "topCategoryScore": "Product Strategy"
  }
}
```

## Analysis API

Endpoints for analyzing compatibility between startups and investors.

### Check Analysis Status

Check if a user has completed the necessary questionnaires for analysis.

**Endpoint**: `GET /analysis/check-status`

**Authentication**: Required

**Response**:

```json
{
  "isCompleted": true,
  "questionnaires": {
    "startup": {
      "status": "submitted",
      "completedAt": "2025-04-05T12:30:45Z"
    },
    "profile": {
      "status": "completed",
      "completedAt": "2025-04-01T10:15:20Z"
    }
  },
  "eligibleForMatching": true
}
```

### Belief System Analysis

Analyzes the belief system alignment between a startup and an investor.

**Endpoint**: `GET /analysis/belief-system/:startupId/:investorId`

**Parameters**:
- `startupId`: ID of the startup user
- `investorId`: ID of the investor user

**Query Parameters**:
- `perspective`: Optional, either "startup" or "investor" (default: based on requesting user's role)
- `detail`: Optional, "basic", "standard", or "comprehensive" (default: "standard")

**Authentication**: Required (must be either the startup, investor, or admin)

**Rate Limit**: 10 requests per user per day

**Cache Policy**: Results cached for 7 days unless profiles are updated

**Response**:

```json
{
  "overallMatch": 75,
  "compatibility": {
    "visionAlignment": 80,
    "coreValues": 70,
    "businessGoals": 75,
    "operationalStyle": 68,
    "riskTolerance": 82
  },
  "strengths": [
    {
      "area": "Long-term Vision",
      "score": 85,
      "description": "Both parties share ambitious goals for market transformation"
    },
    {
      "area": "Innovation Focus",
      "score": 78,
      "description": "Strong alignment on prioritizing R&D and creative solutions"
    }
  ],
  "risks": {
    "marketFitRisk": {
      "level": "Low",
      "score": 15,
      "description": "Strong alignment between investor expertise and startup market"
    },
    "operationalRisk": {
      "level": "Medium",
      "score": 45,
      "description": "Potential misalignment in growth pace expectations"
    },
    "strategicRisk": {
      "level": "Low",
      "score": 20,
      "description": "Good alignment on long-term strategic direction"
    }
  },
  "riskMitigationRecommendations": [
    {
      "priority": "High",
      "action": "Schedule quarterly alignment sessions to review expectations",
      "impact": "Ensures ongoing communication about growth pace"
    },
    {
      "priority": "Medium",
      "action": "Develop detailed operational metrics dashboard",
      "impact": "Creates transparency around performance and expectations"
    },
    {
      "priority": "Medium",
      "action": "Create contingency plans for market fluctuations",
      "impact": "Prepares both parties for potential pivot scenarios"
    }
  ],
  "improvementAreas": {
    "strategicFocus": {
      "description": "Refine long-term expansion strategy",
      "action": "Conduct joint workshop to align on 3-year vision"
    },
    "communication": {
      "description": "Implement more structured reporting",
      "action": "Establish biweekly progress updates with standardized format"
    },
    "growthMetrics": {
      "description": "Define clearer benchmarks",
      "action": "Create shared dashboard with key performance indicators"
    }
  },
  "perspective": "investor",
  "generatedAt": "2025-04-11T12:34:56.789Z",
  "analysisVersion": "2.3.1"
}
```

## Financial Due Diligence API

Endpoints for financial analysis and audit reports compliant with Indian company standards.

### Upload Financial Documents

Upload financial documents for analysis.

**Endpoint**: `POST /financial/upload`

**Authentication**: Required

**Content-Type**: `multipart/form-data`

**Request Body**:

| Field | Type | Description |
|-------|------|-------------|
| documents | File[] | Array of files to upload (PDF, Excel, CSV, JSON) |
| description | string | Optional description of the documents |

**Response**:

```json
{
  "message": "Financial documents uploaded successfully",
  "documents": [
    {
      "id": "doc123456",
      "fileName": "documents-1678901234567.pdf",
      "originalName": "financial_statement_2025.pdf",
      "fileType": "application/pdf",
      "fileSize": 2457600
    },
    {
      "id": "doc123457",
      "fileName": "documents-1678901234568.xlsx",
      "originalName": "cash_flow_projections.xlsx",
      "fileType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "fileSize": 1548800
    }
  ]
}
```

### Generate Financial Report

Generate a financial analysis or audit report based on uploaded documents.

**Endpoint**: `POST /financial/generate`

**Authentication**: Required

**Request Body**:

```json
{
  "documentIds": ["doc123456", "doc123457"],
  "companyName": "Tech Innovators Pvt Ltd",
  "reportType": "analysis"
}
```

**Response**:

```json
{
  "message": "Financial report generated successfully",
  "reportId": "report789012",
  "report": {
    "summary": "Tech Innovators Pvt Ltd shows strong growth potential with healthy gross margins and good unit economics. The company has a solid runway of 18 months based on current burn rate, but should focus on optimizing customer acquisition costs and reducing churn.",
    "metrics": [
      {
        "name": "Burn Rate",
        "value": "₹45,00,000/month",
        "status": "warning",
        "description": "Monthly cash outflow is higher than industry average.",
        "trend": "up"
      },
      {
        "name": "Runway",
        "value": "18 months",
        "status": "good",
        "description": "Company has sufficient runway based on current burn rate.",
        "trend": "stable"
      },
      {
        "name": "Gross Margin",
        "value": "68%",
        "status": "good",
        "description": "Healthy gross margin above industry average of 62%.",
        "trend": "up",
        "comparisonValue": "62%",
        "comparisonLabel": "Industry Average"
      }
    ],
    "recommendations": [
      "Focus on reducing customer acquisition costs by optimizing marketing channels",
      "Implement stricter cash flow management practices to extend runway",
      "Consider raising additional capital in the next 6-9 months"
    ],
    "riskFactors": [
      {
        "category": "Cash Flow",
        "description": "Current burn rate may lead to cash flow issues if growth slows.",
        "severity": "medium",
        "impact": "Could reduce runway by 30% if not addressed.",
        "mitigation": "Implement stricter expense controls and prioritize revenue-generating activities."
      },
      {
        "category": "Customer Concentration",
        "description": "Heavy dependence on top 3 customers who account for 45% of revenue.",
        "severity": "high",
        "impact": "Loss of any major customer would significantly impact revenue and growth.",
        "mitigation": "Diversify customer base and implement key account retention strategies."
      }
    ]
  }
}
```

### Get Financial Reports

Retrieve a list of all financial reports for the authenticated user.

**Endpoint**: `GET /financial/reports`

**Authentication**: Required

**Response**:

```json
{
  "reports": [
    {
      "_id": "report789012",
      "companyName": "Tech Innovators Pvt Ltd",
      "reportType": "analysis",
      "reportDate": "2025-04-15T10:30:45Z",
      "generatedBy": "KarmicDD AI",
      "status": "final",
      "createdAt": "2025-04-15T10:30:45Z"
    },
    {
      "_id": "report789013",
      "companyName": "Tech Innovators Pvt Ltd",
      "reportType": "audit",
      "reportDate": "2025-04-10T14:22:30Z",
      "generatedBy": "KarmicDD AI",
      "status": "final",
      "createdAt": "2025-04-10T14:22:30Z"
    }
  ]
}
```

### Get Financial Report

Retrieve a specific financial report by ID.

**Endpoint**: `GET /financial/reports/:reportId`

**Parameters**:
- `reportId`: ID of the report to retrieve

**Authentication**: Required

**Response**:

```json
{
  "report": {
    "_id": "report789012",
    "userId": "user123456",
    "companyName": "Tech Innovators Pvt Ltd",
    "reportType": "analysis",
    "reportDate": "2025-04-15T10:30:45Z",
    "generatedBy": "KarmicDD AI",
    "summary": "Tech Innovators Pvt Ltd shows strong growth potential with healthy gross margins and good unit economics. The company has a solid runway of 18 months based on current burn rate, but should focus on optimizing customer acquisition costs and reducing churn.",
    "metrics": [
      {
        "name": "Burn Rate",
        "value": "₹45,00,000/month",
        "status": "warning",
        "description": "Monthly cash outflow is higher than industry average.",
        "trend": "up"
      },
      {
        "name": "Runway",
        "value": "18 months",
        "status": "good",
        "description": "Company has sufficient runway based on current burn rate.",
        "trend": "stable"
      }
    ],
    "recommendations": [
      "Focus on reducing customer acquisition costs by optimizing marketing channels",
      "Implement stricter cash flow management practices to extend runway"
    ],
    "riskFactors": [
      {
        "category": "Cash Flow",
        "description": "Current burn rate may lead to cash flow issues if growth slows.",
        "severity": "medium",
        "impact": "Could reduce runway by 30% if not addressed.",
        "mitigation": "Implement stricter expense controls and prioritize revenue-generating activities."
      }
    ],
    "documentSources": ["doc123456", "doc123457"],
    "status": "final",
    "createdAt": "2025-04-15T10:30:45Z",
    "updatedAt": "2025-04-15T10:30:45Z"
  }
}
```

### Generate PDF Report

Generate and download a PDF version of a financial report.

**Endpoint**: `GET /financial/reports/:reportId/pdf`

**Parameters**:
- `reportId`: ID of the report to generate PDF for

**Authentication**: Required

**Response**: PDF file download

## Search API

Endpoints for searching and filtering startup and investor profiles.

### Search Startups

Search for startups using multiple filter criteria.

**Endpoint**: `GET /search/startups`

**Authentication**: Required

**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| industry | string or string[] | Filter by industry or industries |
| fundingStage | string or string[] | Filter by funding stage(s) |
| employeeCount | string | Filter by employee count range |
| location | string | Filter by location (partial match) |
| revenue | string | Filter by annual revenue range |
| foundedDate | string | Filter by founding date range (YYYY-MM-DD:YYYY-MM-DD) |
| hasQuestionnaire | boolean | Filter by whether they have completed questionnaires |
| matchScore | number | Filter by minimum match score with current user (1-100) |
| keywords | string | Search across all text fields |
| page | number | Page number for pagination (default: 1) |
| limit | number | Results per page (default: 10, max: 50) |
| sortBy | string | Field to sort by (default: 'createdAt') |
| sortOrder | string | Sort order ('asc' or 'desc', default: 'desc') |
| fields | string | Comma-separated list of fields to return |

**Response**:

```json
{
  "startups": [
    {
      "id": "507f1f77bcf86cd799439011",
      "companyName": "Tech Innovators",
      "industry": "Software & Technology",
      "fundingStage": "Seed",
      "employeeCount": "6-10",
      "location": "Bangalore, India",
      "pitch": "We are building the next generation of...",
      "matchScore": 87,
      "matchCategories": {
        "Vision": 90,
        "Market": 85,
        "Team": 88
      },
      "createdAt": "2025-01-15T00:00:00.000Z",
      "lastActive": "2025-04-10T14:25:16.000Z",
      "hasCompletedQuestionnaire": true
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "pages": 3,
    "limit": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "applied": {
      "industry": ["Software & Technology"],
      "fundingStage": ["Seed"]
    },
    "available": {
      "industry": ["Software & Technology", "Healthcare", "Fintech"],
      "fundingStage": ["Pre-seed", "Seed", "Series A"]
    }
  }
}
```

### Search Investors

Search for investors using multiple filter criteria.

**Endpoint**: `GET /search/investors`

**Authentication**: Required

**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| industry | string or string[] | Filter by industries of interest |
| fundingStage | string or string[] | Filter by preferred funding stages |
| ticketSize | string or string[] | Filter by ticket size |
| investmentCriterion | string or string[] | Filter by investment criteria |
| location | string | Filter by investor location |
| investmentRegion | string or string[] | Filter by regions where they invest |
| portfolioSize | string | Filter by number of portfolio companies |
| hasQuestionnaire | boolean | Filter by whether they have completed questionnaires |
| matchScore | number | Filter by minimum match score with current user (1-100) |
| keywords | string | Search across all text fields |
| page | number | Page number for pagination (default: 1) |
| limit | number | Results per page (default: 10, max: 50) |
| sortBy | string | Field to sort by (default: 'createdAt') |
| sortOrder | string | Sort order ('asc' or 'desc', default: 'desc') |
| fields | string | Comma-separated list of fields to return |

**Response**:

```json
{
  "investors": [
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Health Capital Partners",
      "firmType": "Venture Capital",
      "industriesOfInterest": ["Healthcare & Biotech", "Clean Technology"],
      "preferredStages": ["Series A", "Series B+"],
      "ticketSize": "₹1Cr - ₹5Cr",
      "investmentCriteria": ["Strong Team", "Market Size", "Innovation"],
      "location": "Mumbai, India",
      "investmentRegions": ["India", "Southeast Asia"],
      "matchScore": 82,
      "matchCategories": {
        "Industry": 95,
        "Stage": 85,
        "Vision": 70
      },
      "recentInvestments": 3,
      "createdAt": "2025-02-20T00:00:00.000Z",
      "lastActive": "2025-04-09T11:42:30.000Z",
      "hasCompletedQuestionnaire": true
    }
  ],
  "pagination": {
    "total": 28,
    "page": 1,
    "pages": 2,
    "limit": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "applied": {
      "industry": ["Healthcare & Biotech"],
      "fundingStage": ["Series A"]
    },
    "available": {
      "industry": ["Healthcare & Biotech", "Clean Technology", "Fintech"],
      "fundingStage": ["Seed", "Series A", "Series B+"]
    }
  }
}
```

### Get Filter Options

Retrieve all available options for filter dropdowns.

**Endpoint**: `GET /search/options`

**Authentication**: Required

**Response**:

```json
{
  "industries": [
    "Software & Technology",
    "Healthcare & Biotech",
    "Financial Services",
    "E-commerce & Retail",
    "Clean Technology",
    "Education",
    "Manufacturing",
    "Media & Entertainment"
  ],
  "fundingStages": [
    "Pre-seed",
    "Seed",
    "Series A",
    "Series B",
    "Series C",
    "Series D+",
    "Growth",
    "Late Stage"
  ],
  "employeeOptions": [
    "1-5",
    "6-10",
    "11-25",
    "26-50",
    "51-100",
    "101-250",
    "251+"
  ],
  "ticketSizes": [
    "₹10L - ₹50L",
    "₹50L - ₹2.5Cr",
    "₹2.5Cr - ₹10Cr",
    "₹10Cr - ₹50Cr",
    "₹50Cr - ₹200Cr",
    "₹200Cr+"
  ],
  "investmentCriteria": [
    "Strong Team",
    "Market Size",
    "Traction",
    "Innovation",
    "Scalability",
    "Unit Economics",
    "Competitive Advantage",
    "Global Potential"
  ],
  "investmentRegions": [
    "India",
    "Southeast Asia",
    "East Asia",
    "Middle East",
    "Europe",
    "North America",
    "Africa",
    "Latin America"
  ],
  "revenueRanges": [
    "Pre-revenue",
    "₹1L - ₹10L",
    "₹10L - ₹50L",
    "₹50L - ₹1Cr",
    "₹1Cr - ₹5Cr",
    "₹5Cr - ₹20Cr",
    "₹20Cr+"
  ]
}
```

## Email API

Endpoints for sending and managing emails within the platform.

### Send Welcome Email

Send a welcome email to a newly registered user.

**Endpoint**: `POST /email/welcome`

**Authentication**: Required (admin role only)

**Request Body**:

```json
{
  "recipientEmail": "user@example.com",
  "recipientName": "John Doe",
  "userType": "startup",
  "customMessage": "Welcome to KarmicDD! We're excited to have you on board.",
  "includeTutorial": true
}
```

**Response**:

```json
{
  "success": true,
  "messageId": "email-123456",
  "sentAt": "2025-04-11T14:35:26Z",
  "deliveryStatus": "queued",
  "trackingInfo": {
    "trackingId": "track-789012",
    "trackingUrl": "https://mvp-01.onrender.com/api/email/track/track-789012"
  }
}
```

**Error Response**:

```json
{
  "success": false,
  "message": "Failed to send email",
  "error": "Invalid email address format",
  "code": "EMAIL_INVALID_ADDRESS"
}
# KarmicDD API Documentation

## Authentication

### Register
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Description**: Register a new user
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "role": "startup" // or "investor"
  }
  ```
- **Response**: 
  ```json
  {
    "message": "User registered successfully",
    "token": "jwt_token_here",
    "user": {
      "userId": "user_id",
      "email": "user@example.com",
      "role": "startup"
    }
  }
  ```

### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Description**: Login an existing user
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: 
  ```json
  {
    "message": "Login successful",
    "token": "jwt_token_here",
    "user": {
      "userId": "user_id",
      "email": "user@example.com",
      "role": "startup"
    }
  }
  ```

## Profile Management

### Get User Type
- **URL**: `/api/profile/user-type`
- **Method**: `GET`
- **Description**: Get the user's type (startup or investor)
- **Authentication**: Required
- **Response**: 
  ```json
  {
    "userId": "user_id",
    "email": "user@example.com",
    "role": "startup"
  }
  ```

### Get Startup Profile
- **URL**: `/api/profile/startup`
- **Method**: `GET`
- **Description**: Get the startup profile for the authenticated user
- **Authentication**: Required
- **Response**: 
  ```json
  {
    "profile": {
      "userId": "user_id",
      "companyName": "My Startup",
      "industry": "Technology",
      "fundingStage": "Seed",
      "employeeCount": "1-10",
      "location": "Bangalore, India",
      "pitch": "We are building the next big thing"
    },
    "extendedProfile": {
      "avatarUrl": "https://example.com/avatar.jpg",
      "socialLinks": [
        { "platform": "LinkedIn", "url": "https://linkedin.com/company/mystartup" }
      ],
      "teamMembers": [
        { "name": "John Doe", "role": "CEO" }
      ]
    }
  }
  ```

### Update Startup Profile
- **URL**: `/api/profile/startup`
- **Method**: `POST`
- **Description**: Create or update the startup profile
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "companyName": "My Startup",
    "industry": "Technology",
    "fundingStage": "Seed",
    "employeeCount": "1-10",
    "location": "Bangalore, India",
    "pitch": "We are building the next big thing"
  }
  ```
- **Response**: 
  ```json
  {
    "message": "Startup profile saved successfully",
    "profile": {
      "userId": "user_id",
      "companyName": "My Startup",
      "industry": "Technology",
      "fundingStage": "Seed",
      "employeeCount": "1-10",
      "location": "Bangalore, India",
      "pitch": "We are building the next big thing"
    }
  }
  ```

### Get Investor Profile
- **URL**: `/api/profile/investor`
- **Method**: `GET`
- **Description**: Get the investor profile for the authenticated user
- **Authentication**: Required
- **Response**: 
  ```json
  {
    "profile": {
      "userId": "user_id",
      "companyName": "My VC Firm",
      "industriesOfInterest": ["Technology", "Healthcare"],
      "preferredStages": ["Seed", "Series A"],
      "ticketSize": "₹50L - ₹2Cr",
      "investmentCriteria": ["Strong team", "Market potential"],
      "pastInvestments": "Invested in 10+ startups"
    },
    "extendedProfile": {
      "avatarUrl": "https://example.com/avatar.jpg",
      "socialLinks": [
        { "platform": "LinkedIn", "url": "https://linkedin.com/company/myvcfirm" }
      ],
      "investmentHistory": [
        { "companyName": "Startup X", "year": "2022", "amount": "₹1Cr" }
      ]
    }
  }
  ```

### Update Investor Profile
- **URL**: `/api/profile/investor`
- **Method**: `POST`
- **Description**: Create or update the investor profile
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "companyName": "My VC Firm",
    "industriesOfInterest": ["Technology", "Healthcare"],
    "preferredStages": ["Seed", "Series A"],
    "ticketSize": "₹50L - ₹2Cr",
    "investmentCriteria": ["Strong team", "Market potential"],
    "pastInvestments": "Invested in 10+ startups"
  }
  ```
- **Response**: 
  ```json
  {
    "message": "Investor profile saved successfully",
    "profile": {
      "userId": "user_id",
      "companyName": "My VC Firm",
      "industriesOfInterest": ["Technology", "Healthcare"],
      "preferredStages": ["Seed", "Series A"],
      "ticketSize": "₹50L - ₹2Cr",
      "investmentCriteria": ["Strong team", "Market potential"],
      "pastInvestments": "Invested in 10+ startups"
    }
  }
  ```

### Update Extended Profile
- **URL**: `/api/profile/extended`
- **Method**: `POST`
- **Description**: Update extended profile data (social links, team members, investment history)
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "avatarUrl": "https://example.com/avatar.jpg",
    "socialLinks": [
      { "platform": "LinkedIn", "url": "https://linkedin.com/company/mycompany" }
    ],
    "teamMembers": [
      { "name": "John Doe", "role": "CEO" }
    ],
    "investmentHistory": [
      { "companyName": "Startup X", "year": "2022", "amount": "₹1Cr" }
    ]
  }
  ```
- **Response**: 
  ```json
  {
    "message": "Extended profile updated successfully",
    "extendedProfile": {
      "avatarUrl": "https://example.com/avatar.jpg",
      "socialLinks": [
        { "platform": "LinkedIn", "url": "https://linkedin.com/company/mycompany" }
      ],
      "teamMembers": [
        { "name": "John Doe", "role": "CEO" }
      ],
      "investmentHistory": [
        { "companyName": "Startup X", "year": "2022", "amount": "₹1Cr" }
      ]
    }
  }
  ```

### Generate Shareable Profile Link
- **URL**: `/api/profile/share/generate-link`
- **Method**: `POST`
- **Description**: Generate a shareable link for the user's profile
- **Authentication**: Required
- **Response**: 
  ```json
  {
    "message": "Profile share link generated successfully",
    "shareableUrl": "https://karmic-dd.com/shared-profile/abc123def456",
    "expiresAt": "2025-12-31T23:59:59.999Z"
  }
  ```

### Share Profile via Email
- **URL**: `/api/profile/share/email`
- **Method**: `POST`
- **Description**: Share the user's profile via email
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "emailAddresses": ["recipient@example.com", "another@example.com"]
  }
  ```
- **Response**: 
  ```json
  {
    "message": "Profile shared successfully",
    "shareableUrl": "https://karmic-dd.com/shared-profile/abc123def456",
    "recipientCount": 2
  }
  ```

### Get Shared Profile
- **URL**: `/api/profile/shared/:shareToken`
- **Method**: `GET`
- **Description**: Get a shared profile using a share token
- **Response**: 
  ```json
  {
    "profile": {
      "userId": "user_id",
      "companyName": "My Startup",
      "industry": "Technology",
      "fundingStage": "Seed",
      "employeeCount": "1-10",
      "location": "Bangalore, India",
      "pitch": "We are building the next big thing"
    },
    "extendedProfile": {
      "avatarUrl": "https://example.com/avatar.jpg",
      "socialLinks": [
        { "platform": "LinkedIn", "url": "https://linkedin.com/company/mystartup" }
      ],
      "teamMembers": [
        { "name": "John Doe", "role": "CEO" }
      ]
    },
    "userType": "startup",
    "userEmail": "user@example.com",
    "publicDocuments": [
      {
        "_id": "doc_id",
        "fileName": "pitch_deck.pdf",
        "originalName": "My Startup Pitch Deck.pdf",
        "fileType": "application/pdf",
        "description": "Our latest pitch deck",
        "documentType": "pitch_deck",
        "createdAt": "2025-01-01T12:00:00.000Z"
      }
    ],
    "shareInfo": {
      "createdAt": "2025-01-01T12:00:00.000Z",
      "expiresAt": "2025-12-31T23:59:59.999Z",
      "viewCount": 5
    }
  }
  ```

## Document Management

### Upload Document
- **URL**: `/api/profile/documents/upload`
- **Method**: `POST`
- **Description**: Upload a document to the user's profile
- **Authentication**: Required
- **Request Body**: Form data with `document` file and optional metadata
- **Response**: 
  ```json
  {
    "message": "Document uploaded successfully",
    "document": {
      "id": "doc_id",
      "fileName": "pitch_deck.pdf",
      "originalName": "My Startup Pitch Deck.pdf",
      "fileType": "application/pdf",
      "fileSize": 1024000
    }
  }
  ```

### Get User Documents
- **URL**: `/api/profile/documents`
- **Method**: `GET`
- **Description**: Get all documents for the authenticated user
- **Authentication**: Required
- **Response**: 
  ```json
  {
    "documents": [
      {
        "_id": "doc_id",
        "fileName": "pitch_deck.pdf",
        "originalName": "My Startup Pitch Deck.pdf",
        "fileType": "application/pdf",
        "fileSize": 1024000,
        "description": "Our latest pitch deck",
        "documentType": "pitch_deck",
        "isPublic": true,
        "createdAt": "2025-01-01T12:00:00.000Z"
      }
    ]
  }
  ```

### Delete Document
- **URL**: `/api/profile/documents/:documentId`
- **Method**: `DELETE`
- **Description**: Delete a document
- **Authentication**: Required
- **Response**: 
  ```json
  {
    "message": "Document deleted successfully"
  }
  ```

### Download Document
- **URL**: `/api/profile/documents/:documentId/download`
- **Method**: `GET`
- **Description**: Download a document
- **Response**: The document file

### Update Document Metadata
- **URL**: `/api/profile/documents/:documentId`
- **Method**: `PUT`
- **Description**: Update document metadata
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "description": "Updated description",
    "isPublic": true
  }
  ```
- **Response**: 
  ```json
  {
    "message": "Document metadata updated successfully",
    "document": {
      "_id": "doc_id",
      "fileName": "pitch_deck.pdf",
      "originalName": "My Startup Pitch Deck.pdf",
      "fileType": "application/pdf",
      "fileSize": 1024000,
      "description": "Updated description",
      "documentType": "pitch_deck",
      "isPublic": true,
      "createdAt": "2025-01-01T12:00:00.000Z",
      "updatedAt": "2025-04-12T12:00:00.000Z"
    }
  }
  ```

## Financial Due Diligence

### Upload Financial Documents
- **URL**: `/api/financial/upload`
- **Method**: `POST`
- **Description**: Upload financial documents for analysis
- **Authentication**: Required
- **Request Body**: Form data with `documents` files and optional metadata
- **Response**: 
  ```json
  {
    "message": "Financial documents uploaded successfully",
    "documents": [
      {
        "id": "doc_id",
        "fileName": "financial_statement.pdf",
        "originalName": "Financial Statement 2025.pdf",
        "fileType": "application/pdf",
        "fileSize": 1024000
      }
    ]
  }
  ```

### Generate Financial Analysis
- **URL**: `/api/financial/generate`
- **Method**: `POST`
- **Description**: Generate a financial analysis report
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "documentIds": ["doc_id1", "doc_id2"],
    "companyName": "My Startup",
    "reportType": "analysis" // or "audit"
  }
  ```
- **Response**: 
  ```json
  {
    "message": "Financial report generated successfully",
    "reportId": "report_id",
    "report": {
      "summary": "Financial analysis summary...",
      "metrics": [
        {
          "name": "Burn Rate",
          "value": "₹10L/month",
          "status": "warning",
          "description": "Monthly cash outflow is higher than industry average.",
          "trend": "up"
        }
      ],
      "recommendations": [
        "Optimize pricing strategy to improve revenue per customer."
      ],
      "riskFactors": [
        {
          "category": "Cash Flow",
          "description": "Current burn rate may lead to cash flow issues if growth slows.",
          "severity": "medium",
          "impact": "Could reduce runway by 30% if not addressed."
        }
      ],
      "ratioAnalysis": {
        "liquidityRatios": [
          {
            "name": "Current Ratio",
            "value": 1.8,
            "industry_average": 2.0,
            "description": "Ability to pay short-term obligations.",
            "status": "warning"
          }
        ],
        "profitabilityRatios": [
          {
            "name": "Gross Margin",
            "value": 0.68,
            "industry_average": 0.62,
            "description": "Percentage of revenue retained after direct costs.",
            "status": "good"
          }
        ]
      },
      "taxCompliance": {
        "gst": {
          "status": "partial",
          "details": "GST returns have been filed on time, but supporting documentation is incomplete."
        },
        "incomeTax": {
          "status": "compliant",
          "details": "Income tax filings are up to date and complete."
        },
        "tds": {
          "status": "non-compliant",
          "details": "TDS deductions have been made, but there are delays in filing TDS returns."
        }
      }
    }
  }
  ```

### Get Financial Reports
- **URL**: `/api/financial/reports`
- **Method**: `GET`
- **Description**: Get all financial reports for the authenticated user
- **Authentication**: Required
- **Response**: 
  ```json
  {
    "reports": [
      {
        "_id": "report_id",
        "userId": "user_id",
        "companyName": "My Startup",
        "reportType": "analysis",
        "reportDate": "2025-04-01T12:00:00.000Z",
        "generatedBy": "KarmicDD AI",
        "summary": "Financial analysis summary...",
        "status": "final",
        "createdAt": "2025-04-01T12:00:00.000Z"
      }
    ]
  }
  ```

### Get Financial Report
- **URL**: `/api/financial/reports/:reportId`
- **Method**: `GET`
- **Description**: Get a specific financial report
- **Authentication**: Required
- **Response**: 
  ```json
  {
    "report": {
      "_id": "report_id",
      "userId": "user_id",
      "companyName": "My Startup",
      "reportType": "analysis",
      "reportDate": "2025-04-01T12:00:00.000Z",
      "generatedBy": "KarmicDD AI",
      "summary": "Financial analysis summary...",
      "metrics": [
        {
          "name": "Burn Rate",
          "value": "₹10L/month",
          "status": "warning",
          "description": "Monthly cash outflow is higher than industry average.",
          "trend": "up"
        }
      ],
      "recommendations": [
        "Optimize pricing strategy to improve revenue per customer."
      ],
      "riskFactors": [
        {
          "category": "Cash Flow",
          "description": "Current burn rate may lead to cash flow issues if growth slows.",
          "severity": "medium",
          "impact": "Could reduce runway by 30% if not addressed."
        }
      ],
      "documentSources": ["doc_id1", "doc_id2"],
      "status": "final",
      "createdAt": "2025-04-01T12:00:00.000Z"
    }
  }
  ```

### Generate PDF Report
- **URL**: `/api/financial/reports/:reportId/pdf`
- **Method**: `GET`
- **Description**: Generate a PDF version of a financial report
- **Authentication**: Required
- **Response**: PDF file

### Financial Due Diligence Match Analysis
- **URL**: `/api/financial/match/:startupId/:investorId/generate`
- **Method**: `POST`
- **Description**: Generate financial due diligence analysis between a startup and investor
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "reportType": "analysis", // or "audit"
    "perspective": "startup" // or "investor"
  }
  ```
- **Response**: 
  ```json
  {
    "summary": "Financial due diligence analysis summary...",
    "metrics": [
      {
        "name": "Burn Rate",
        "value": "₹10L/month",
        "status": "warning",
        "description": "Monthly cash outflow is higher than industry average."
      }
    ],
    "recommendations": ["Implement stricter expense controls."],
    "riskFactors": [
      {
        "category": "Cash Flow",
        "level": "medium",
        "description": "Current burn rate may lead to cash flow issues.",
        "impact": "Could reduce runway by 30%."
      }
    ],
    "startupInfo": {
      "companyName": "Tech Startup",
      "industry": "SaaS",
      "stage": "Seed",
      "location": "Bangalore"
    },
    "investorInfo": {
      "name": "VC Firm",
      "sectors": ["SaaS", "Fintech"],
      "investmentStage": "Seed"
    },
    "perspective": "startup",
    "generatedDate": "2025-04-14T12:00:00.000Z"
  }
  ```

### Get Financial Due Diligence Match Report
- **URL**: `/api/financial/match/:startupId/:investorId`
- **Method**: `GET`
- **Description**: Get financial due diligence report between a startup and investor
- **Authentication**: Required
- **Query Parameters**:
  - `reportType`: Optional, "analysis" or "audit" (default: "analysis")
  - `perspective`: Optional, "startup" or "investor" (default: based on requesting user's role)
- **Response**: Same as Financial Due Diligence Match Analysis response

### Share Financial Due Diligence Report
- **URL**: `/api/financial/match/:startupId/:investorId/share`
- **Method**: `POST`
- **Description**: Share financial due diligence report via email
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "emails": ["recipient1@example.com", "recipient2@example.com"]
  }
  ```
- **Response**: 
  ```json
  {
    "message": "Financial due diligence report shared successfully",
    "recipients": ["recipient1@example.com", "recipient2@example.com"]
  }
  ```

### Export Financial Due Diligence Report as PDF
- **URL**: `/api/financial/match/:startupId/:investorId/pdf`
- **Method**: `GET`
- **Description**: Export financial due diligence report as PDF
- **Authentication**: Required
- **Response**: PDF file or error message
  ```json
  {
    "message": "Financial due diligence report PDF generated successfully",
    "reportId": "report_id"
  }
  ```

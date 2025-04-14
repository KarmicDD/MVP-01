# KarmicDD Backend API Documentation

## Table of Contents
1. Architecture Overview
2. Authentication
3. User Onboarding Flow
4. API Endpoints
5. Data Models
6. Error Handling
7. Example Requests

## Architecture Overview

The backend uses a hybrid database approach:
- **PostgreSQL**: User authentication and core relationship data
- **MongoDB**: Rich profile data and analytics

This architecture optimizes for both data consistency and flexibility while maintaining the same API contracts.

## Authentication

### Registration
- **Endpoint**: `POST /api/auth/register`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123"
  }
  ```
- **Response**:
  ```json
  {
    "user": {
      "userId": "fc85a964-7183-4fb5-9546-253d23d3",
      "email": "user@example.com",
      "role": "pending"
    },
    "token": "jwt_token_here"
  }
  ```

### Login
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123"
  }
  ```
- **Response**: Same as registration

### OAuth Login (Google/LinkedIn)
- **Google**: `GET /api/auth/google`
- **LinkedIn**: `GET /api/auth/linkedin`
- **Callback**: After successful OAuth, the API returns:
  ```json
  {
    "user": {
      "userId": "fc85a964-7183-4fb5-9546-253d23d3",
      "email": "user@example.com",
      "role": "pending",
      "isNewUser": true  // Present only for new users
    },
    "token": "jwt_token_here"
  }
  ```
  - Check for `isNewUser` or `role === "pending"` to redirect users to onboarding

## User Onboarding Flow

1. **Role Selection**:
   - After registration/first login, check for `role === "pending"` 
   - Redirect to role selection page
   - User selects either "startup" or "investor"

2. **Profile Creation**:
   - Based on role, collect required profile information
   - Submit profile data to appropriate endpoint

3. **Redirecting to Dashboard**:
   - After profile creation, redirect to role-specific dashboard

## API Endpoints

### User Type
- **Endpoint**: `GET /api/profile/user-type`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "userId": "fc85a964-7183-4fb5-9546-253d23d3",
    "email": "user@example.com",
    "role": "startup"
  }
  ```

### Startup Profile

#### Create/Update Profile
- **Endpoint**: `POST /api/profile/startup`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "companyName": "Tech Innovators",
    "industry": "SaaS",
    "fundingStage": "Seed",
    "employeeCount": "1-10",
    "location": "Bangalore, India",
    "pitch": "We're building the future of..."
  }
  ```
- **Response**:
  ```json
  {
    "message": "Startup profile saved successfully",
    "profile": {
      "userId": "fc85a964-7183-4fb5-9546-253d23d3",
      "companyName": "Tech Innovators",
      "industry": "SaaS",
      "fundingStage": "Seed",
      "employeeCount": "1-10",
      "location": "Bangalore, India",
      "pitch": "We're building the future of..."
    }
  }
  ```

#### Get Profile
- **Endpoint**: `GET /api/profile/startup`
- **Auth Required**: Yes
- **Response**: Returns profile object

### Investor Profile

#### Create/Update Profile
- **Endpoint**: `POST /api/profile/investor`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "companyName": "Venture Capital Inc.",
    "industriesOfInterest": ["SaaS", "AI", "Fintech"],
    "preferredStages": ["Seed", "Series A"],
    "ticketSize": "₹50L - ₹2Cr",
    "investmentCriteria": ["Strong Team", "Product-Market Fit"],
    "pastInvestments": "Previously invested in..."
  }
  ```
- **Response**:
  ```json
  {
    "message": "Investor profile saved successfully",
    "profile": {
      "userId": "fc85a964-7183-4fb5-9546-253d23d3",
      "companyName": "Venture Capital Inc.",
      "industriesOfInterest": ["SaaS", "AI", "Fintech"],
      "preferredStages": ["Seed", "Series A"],
      "ticketSize": "₹50L - ₹2Cr",
      "investmentCriteria": ["Strong Team", "Product-Market Fit"],
      "pastInvestments": "Previously invested in..."
    }
  }
  ```

#### Get Profile
- **Endpoint**: `GET /api/profile/investor`
- **Auth Required**: Yes
- **Response**: Returns profile object

### Extended Profile
- **Endpoint**: `POST /api/profile/extended`
- **Auth Required**: Yes
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
      { "companyName": "Startup X", "year": "2024", "amount": "₹1Cr" }
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
        { "companyName": "Startup X", "year": "2024", "amount": "₹1Cr" }
      ]
    }
  }
  ```

### Compatibility Analysis

#### Get Single Match Compatibility
- **Endpoint**: `GET /api/analysis/belief-system/:startupId/:investorId`
- **Auth Required**: Yes
- **Response**:
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
      }
    }
  }
  ```

#### Batch Analyze Compatibility
- **Endpoint**: `GET /api/matching/compatibility?role=startup` or `GET /api/matching/compatibility?role=investor`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "matches": [
      {
        "investorId": "abc123",  // or startupId if role=investor
        "companyName": "Venture Capital Inc.",
        "compatibility": {
          "overallMatch": 85,
          "compatibility": {
            "visionAlignment": 90,
            "coreValues": 80,
            "businessGoals": 85,
            "operationalStyle": 75,
            "riskTolerance": 90
          },
          "strengths": [
            {
              "area": "Long-term Vision",
              "score": 92,
              "description": "Perfect alignment in growth vision and market focus"
            }
          ],
          "risks": {
            "marketFitRisk": {
              "level": "Low",
              "score": 10,
              "description": "Excellent alignment between investor expertise and startup market"
            }
          }
        }
      },
      // More matches...
    ]
  }
  ```

### Dashboard Data

#### Startup Dashboard
- **Endpoint**: `GET /api/dashboard/startup`
- **Auth Required**: Yes (startup role)
- **Response**: Dashboard data including user info and recommended matches

#### Investor Dashboard
- **Endpoint**: `GET /api/dashboard/investor`
- **Auth Required**: Yes (investor role)
- **Response**: Dashboard data including user info and recommended matches

### Matching

#### Find Investor Matches for Startup
- **Endpoint**: `GET /api/matching/startup`
- **Auth Required**: Yes (startup role)
- **Response**:
  ```json
  {
    "matches": [
      {
        "investorId": "def456",
        "companyName": "Venture Capital Inc.",
        "matchScore": 85,
        "industriesOfInterest": ["SaaS", "AI"],
        "preferredStages": ["Seed", "Series A"],
        "ticketSize": "₹50L - ₹2Cr",
        "location": "Mumbai, India" 
      },
      // More matches...
    ]
  }
  ```

#### Find Startup Matches for Investor
- **Endpoint**: `GET /api/matching/investor`
- **Auth Required**: Yes (investor role)
- **Response**:
  ```json
  {
    "matches": [
      {
        "startupId": "abc123",
        "companyName": "Tech Innovators",
        "matchScore": 85,
        "industry": "SaaS",
        "fundingStage": "Seed",
        "location": "Bangalore, India"
      },
      // More matches...
    ]
  }
  ```

### Financial Due Diligence

#### Upload Financial Documents
- **Endpoint**: `POST /api/financial/upload`
- **Auth Required**: Yes
- **Request Body**: Form data with documents files
- **Response**:
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
      }
    ]
  }
  ```

#### Generate Financial Report
- **Endpoint**: `POST /api/financial/generate`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "documentIds": ["doc123456", "doc123457"],
    "companyName": "Tech Innovators Pvt Ltd",
    "reportType": "analysis"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Financial report generated successfully",
    "reportId": "report789012",
    "report": {
      "summary": "Tech Innovators Pvt Ltd shows strong growth potential with healthy gross margins...",
      "metrics": [
        {
          "name": "Burn Rate",
          "value": "₹45,00,000/month",
          "status": "warning",
          "description": "Monthly cash outflow is higher than industry average.",
          "trend": "up"
        }
      ],
      "recommendations": [
        "Focus on reducing customer acquisition costs by optimizing marketing channels"
      ]
    }
  }
  ```

## Data Models

### User
- `userId`: String (UUID)
- `email`: String
- `passwordHash`: String (optional)
- `oauthProvider`: String (optional)
- `oauthId`: String (optional)
- `role`: String ('startup', 'investor', or 'pending')
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Startup Profile
- `userId`: String (references userId)
- `companyName`: String
- `industry`: String
- `fundingStage`: String
- `employeeCount`: String (optional)
- `location`: String (optional)
- `pitch`: String (optional)
- `additionalInfo`: Object (flexible field for future extensions)

### Investor Profile
- `userId`: String (references userId)
- `companyName`: String
- `industriesOfInterest`: String[]
- `preferredStages`: String[]
- `ticketSize`: String (optional)
- `investmentCriteria`: String[] (optional)
- `pastInvestments`: String (optional)
- `additionalInfo`: Object (flexible field for future extensions)

### Extended Profile
- `userId`: String (references userId)
- `avatarUrl`: String (optional)
- `socialLinks`: Array of Objects (optional)
- `teamMembers`: Array of Objects (optional)
- `investmentHistory`: Array of Objects (optional)

### Financial Report
- `reportId`: String (UUID)
- `userId`: String (references userId)
- `companyName`: String
- `reportType`: String ('analysis' or 'audit')
- `reportDate`: DateTime
- `generatedBy`: String
- `summary`: String
- `metrics`: Array of Objects
- `recommendations`: Array of Strings
- `riskFactors`: Array of Objects
- `documentSources`: Array of Strings
- `status`: String ('draft', 'final')
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "message": "Error description here",
  "error": "Detailed error information",
  "code": "ERROR_CODE"
}
```

Common HTTP status codes:
- `400`: Bad Request - Missing or invalid parameters
- `401`: Unauthorized - Authentication required
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource doesn't exist
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Server Error - Backend issue

## Example Requests

### Authentication and Profile Creation

```javascript
// 1. Register a new user
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'user@example.com', 
    password: 'securePassword123' 
  })
});
const { user, token } = await registerResponse.json();

// Store token in localStorage
localStorage.setItem('token', token);

// 2. Check if user needs to select role
if (user.role === 'pending') {
  // Show role selection UI
  // After user selects "startup":
  
  // 3. Create startup profile
  const createProfileResponse = await fetch('/api/profile/startup', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      companyName: 'Tech Innovators',
      industry: 'SaaS',
      fundingStage: 'Seed',
      employeeCount: '1-10',
      location: 'Bangalore, India',
      pitch: 'We're building the future of...'
    })
  });
  
  // 4. Redirect to dashboard
  window.location.href = '/dashboard';
}
```

### Getting Compatibility Analysis

```javascript
// Get compatibility between a startup and investor
const getCompatibility = async (startupId, investorId) => {
  const response = await fetch(`/api/analysis/belief-system/${startupId}/${investorId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return await response.json();
};

// Batch analyze compatibility for current user (investor)
const getBatchCompatibility = async () => {
  const response = await fetch('/api/matching/compatibility?role=investor', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  const { matches } = await response.json();
  return matches;
};
```

### Financial Due Diligence

```javascript
// Generate financial report
const generateFinancialReport = async (documentIds, companyName) => {
  const response = await fetch('/api/financial/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      documentIds,
      companyName,
      reportType: 'analysis'
    })
  });
  
  return await response.json();
};
```

### Adding Authentication Headers

Always include the authentication token with requests:

```javascript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
};

// Use these headers with all authorized requests
const response = await fetch('/api/profile/user-type', { headers });
```

This documentation provides a comprehensive guide for frontend developers to integrate with the backend architecture.
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
      "user_id": "fc85a964-7183-4fb5-9546-253d23d3",
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
      "user_id": "fc85a964-7183-4fb5-9546-253d23d3",
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
- **Endpoint**: `GET /api/profile/user`
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
    "location": "San Francisco",
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
      "location": "San Francisco",
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
    "ticketSize": "$500K-2M",
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
      "ticketSize": "$500K-2M",
      "investmentCriteria": ["Strong Team", "Product-Market Fit"],
      "pastInvestments": "Previously invested in..."
    }
  }
  ```

#### Get Profile
- **Endpoint**: `GET /api/profile/investor`
- **Auth Required**: Yes
- **Response**: Returns profile object

### Compatibility Analysis

#### Get Single Match Compatibility
- **Endpoint**: `GET /api/compatibility/:startupId/:investorId`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "overallScore": 75,
    "breakdown": {
      "missionAlignment": 80,
      "investmentPhilosophy": 70,
      "sectorFocus": 90,
      "fundingStageAlignment": 75,
      "valueAddMatch": 60
    },
    "insights": [
      "Strong alignment in industry focus",
      "Good match in funding stage requirements",
      "Complementary long-term vision"
    ]
  }
  ```

#### Batch Analyze Compatibility
- **Endpoint**: `GET /api/compatibility/batch?role=startup` or `GET /api/compatibility/batch?role=investor`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "matches": [
      {
        "investorId": "abc123",  // or startupId if role=investor
        "companyName": "Venture Capital Inc.",
        "compatibility": {
          "overallScore": 85,
          "breakdown": {
            "missionAlignment": 90,
            "investmentPhilosophy": 80,
            "sectorFocus": 95,
            "fundingStageAlignment": 85,
            "valueAddMatch": 75
          },
          "insights": [
            "Perfect match in industry focus",
            "Strong alignment on funding expectations",
            "Complementary vision for growth"
          ]
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
        "email": "investor@example.com",
        "matchScore": 85,
        "industriesOfInterest": ["SaaS", "AI"],
        "preferredStages": ["Seed", "Series A"],
        "ticketSize": "$500K-2M"
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
        "email": "startup@example.com",
        "matchScore": 85,
        "industry": "SaaS",
        "fundingStage": "Seed",
        "location": "San Francisco"
      },
      // More matches...
    ]
  }
  ```

## Data Models

### User
- `user_id`: String (UUID)
- `email`: String
- `password_hash`: String (optional)
- `oauth_provider`: String (optional)
- `oauth_id`: String (optional)
- `role`: String ('startup', 'investor', or 'pending')
- `created_at`: DateTime
- `updated_at`: DateTime

### Startup Profile
- `userId`: String (references user_id)
- `companyName`: String
- `industry`: String
- `fundingStage`: String
- `employeeCount`: String (optional)
- `location`: String (optional)
- `pitch`: String (optional)
- `additionalInfo`: Object (flexible field for future extensions)

### Investor Profile
- `userId`: String (references user_id)
- `companyName`: String
- `industriesOfInterest`: String[]
- `preferredStages`: String[]
- `ticketSize`: String (optional)
- `investmentCriteria`: String[] (optional)
- `pastInvestments`: String (optional)
- `additionalInfo`: Object (flexible field for future extensions)

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "message": "Error description here"
}
```

Common HTTP status codes:
- `400`: Bad Request - Missing or invalid parameters
- `401`: Unauthorized - Authentication required
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource doesn't exist
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
      location: 'San Francisco',
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
  const response = await fetch(`/api/compatibility/${startupId}/${investorId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return await response.json();
};

// Batch analyze compatibility for current user (investor)
const getBatchCompatibility = async () => {
  const response = await fetch('/api/compatibility/batch?role=investor', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  const { matches } = await response.json();
  return matches;
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
const response = await fetch('/api/profile/user', { headers });
```

This documentation provides a comprehensive guide for your frontend developer to integrate with the updated backend architecture while maintaining all existing functionality.
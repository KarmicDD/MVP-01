# KarmicDD System Architecture

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Backend Architecture](#backend-architecture)
   - [Technology Stack](#backend-technology-stack)
   - [Server Configuration](#server-configuration)
   - [Database Architecture](#database-architecture)
   - [Authentication System](#authentication-system)
   - [API Structure](#api-structure)
   - [Services and Controllers](#services-and-controllers)
   - [Error Handling](#error-handling)
4. [Frontend Architecture](#frontend-architecture)
   - [Technology Stack](#frontend-technology-stack)
   - [Component Structure](#component-structure)
   - [State Management](#state-management)
   - [Routing System](#routing-system)
   - [Service Layer](#service-layer)
5. [Integration Architecture](#integration-architecture)
   - [API Communication Flow](#api-communication-flow)
   - [Authentication Flow](#authentication-flow)
   - [Data Flow for Key Features](#data-flow-for-key-features)
   - [Error Handling and Security](#error-handling-and-security)
6. [Architecture Diagrams](#architecture-diagrams)
   - [Backend Data and Process Flow](#backend-data-and-process-flow)
   - [Frontend Flow](#frontend-flow)
   - [Integration and Microservices Flow](#integration-and-microservices-flow)

## Executive Summary

KarmicDD is a comprehensive AI-powered due diligence platform designed to transform how startups and investors connect and evaluate opportunities in the Indian ecosystem. The platform addresses critical challenges in the venture capital space by providing data-driven insights, standardized analysis, and AI-enhanced matching capabilities.

### Purpose and Vision

The platform serves dual purposes for its two primary user types:

**For Startups:**
- Streamlines the fundraising process through standardized profile creation
- Provides AI-powered compatibility analysis with potential investors
- Offers insights into investor preferences and decision-making criteria
- Generates comprehensive belief system analysis to better understand investor alignment

**For Investors:**
- Enables efficient deal flow management and startup discovery
- Provides standardized due diligence reports with AI-enhanced insights
- Reduces risk through systematic identification of red flags
- Offers deeper pattern recognition across potential investments

### Architectural Approach

The system employs a modern, scalable architecture with clear separation of concerns:

1. **Modular Design**: The system follows a domain-driven design organized around business capabilities, deployed as a monolithic application with clear boundaries between functional areas.

2. **Hybrid Database Strategy**: Utilizes PostgreSQL for structured relational data (user authentication, core relationships) and MongoDB for flexible document storage (profiles, analysis reports, questionnaires).

3. **AI Integration**: Integrates Google's Generative AI (Gemini) for intelligent analysis:
   - Startup-investor compatibility scoring with Gemini 2.0 Flash
   - Belief system analysis with Gemini 2.0 Flash Thinking
   - Financial document processing and due diligence
   - Personalized recommendations with caching

4. **Responsive Frontend**: React and TypeScript single-page application with role-specific interfaces for startups and investors.

5. **Secure API Layer**: RESTful API with JWT authentication, rate limiting, and comprehensive validation.

6. **Caching Strategy**: Implements intelligent caching for AI-generated content with expiration dates to optimize performance and reduce API costs.

This architecture enables KarmicDD to deliver a sophisticated platform that balances performance, security, and flexibility. The following sections provide a detailed examination of each architectural component.

## System Overview

KarmicDD implements a client-server architecture designed for maintainability and extensibility. This section provides an overview of the system's major components and their interactions.

### High-Level Architecture

The system follows a layered architecture with clear separation between presentation, business logic, and data persistence:

1. **Frontend Application Layer**
   - React-based single-page application (SPA) built with TypeScript
   - Role-specific views for startups and investors
   - Protected routes based on authentication and user role
   - Component-based architecture with reusable UI elements

2. **Backend API Layer**
   - RESTful API server built with Node.js and Express
   - Controller-service pattern for business logic organization
   - Middleware for security, logging, and error handling
   - Rate limiting for AI-intensive endpoints

3. **Data Persistence Layer**
   - **PostgreSQL**: Relational database for:
     - User authentication and account management
     - Profile sharing and access control
   - **MongoDB**: Document database for:
     - Profile data (startup and investor profiles)
     - Questionnaire responses and analysis results
     - AI-generated reports and recommendations
     - API usage tracking and rate limiting

4. **External Integration Layer**
   - **Google Generative AI (Gemini)**: Powers AI capabilities:
     - Compatibility scoring and matching
     - Belief system analysis
     - Financial document processing
     - Personalized recommendations
   - **Authentication Providers**:
     - OAuth 2.0 with Google and LinkedIn
     - JWT-based authentication
   - **Email Service (Resend API)**

### System Topology

The system is deployed as a monolithic application with clear domain boundaries:

```
KarmicDD System
├── Frontend Application (React SPA)
│   ├── Public Routes (Landing, Auth, Shared Profiles)
│   └── Protected Routes (Dashboard, Profile, Analysis)
├── Backend API Server (Node.js/Express)
│   ├── Authentication Service Domain
│   ├── Profile Management Service Domain
│   ├── Matching Service Domain
│   ├── Analysis Service Domain
│   ├── Financial Due Diligence Service Domain
│   ├── Search Service Domain
│   └── Recommendation Service Domain
├── Database Layer
│   ├── PostgreSQL (User data, relationships)
│   └── MongoDB (Profiles, documents, analysis)
└── External Services
    ├── Google Generative AI
    ├── OAuth Providers
    └── Email Service
```

### Key Architectural Patterns

The system implements several architectural patterns to ensure maintainability:

1. **MVC Pattern (Modified)**: The backend follows a Model-View-Controller pattern, with:
   - Models: Database schemas and data access objects
   - Controllers: Request handlers that coordinate business logic
   - Services: Business logic encapsulation

2. **Repository Pattern**: Data access is abstracted through services that encapsulate database operations.

3. **Caching Strategy**: Intelligent caching of AI-generated content with expiration dates to reduce API costs and improve performance.

This architecture provides a solid foundation for the current implementation while allowing for future enhancements.

## Backend Architecture

### Backend Technology Stack

The backend of KarmicDD is built with modern technologies that balance performance, developer productivity, and maintainability.

#### Core Platform

- **Runtime Environment**: Node.js v16+
- **Programming Language**: TypeScript 5.0+
- **Web Framework**: Express.js 4.21+

#### Database Technologies

- **Primary Database**: PostgreSQL 13+
  - Used for user authentication and security-critical data
- **Database ORM**: Prisma
  - Type-safe database client for PostgreSQL

- **Secondary Database**: MongoDB
  - Used for profile data, questionnaires, and analysis results
- **MongoDB ODM**: Mongoose
  - Schema definition and validation for MongoDB documents

#### Authentication & Security

- **Authentication**:
  - JSON Web Tokens (JWT) for stateless authentication
  - Passport.js for OAuth 2.0 integration with Google and LinkedIn
  - bcrypt for secure password hashing

- **API Security**:
  - Helmet.js for secure HTTP headers
  - CORS configuration with whitelisted origins
  - Rate limiting for AI-intensive endpoints
  - Input validation with Express Validator

#### AI & Document Processing

- **AI Integration**: Google Generative AI SDK
  - Gemini 2.0 Flash for general AI capabilities
  - Gemini 2.0 Flash Thinking for belief system analysis
  - Structured prompt engineering with fallback strategies

- **Document Processing**:
  - PDF.js Extract for PDF text extraction
  - Mammoth.js for DOCX parsing
  - XLSX for Excel spreadsheet processing
  - PDF-lib for PDF generation

#### API & Integration

- **API Documentation**: Swagger/OpenAPI 3.0
  - Interactive documentation at /api-docs endpoint

- **HTTP Client**: Axios
  - Used for external API integration

- **Email Service**: Resend API
  - Transactional email delivery

#### Development & Utilities

- **Environment Management**: dotenv
- **Logging & Monitoring**: Custom middleware for request tracking and API usage
- **Utilities**: UUID, Crypto, and custom JSON helpers

### Server Configuration

The KarmicDD backend server is configured to ensure security, performance, and reliability.

#### Server Initialization

The server initialization process ensures all dependencies are established before accepting requests:

```typescript
// Simplified server initialization flow
const startServer = async () => {
    try {
        // Initialize database connections with retry logic
        await Promise.all([
            testPostgressConnection(),
            connectMongoDBwithRetry()
        ]);

        // Test MongoDB connection for recommendations
        await RecommendationService.testMongoDBConnection();

        // Initialize Express application
        const app = express();
        const PORT = process.env.PORT || 5000;

        // Configure middleware
        configureMiddleware(app);

        // Mount routes
        app.use('/api', routes);
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

        // Start listening
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};
```

#### Middleware Stack

The Express application uses the following middleware:

1. **Security Middleware**:
   - **Helmet**: Configures secure HTTP headers
   - **CORS**: Configured with allowed origins for frontend access

2. **Request Processing**:
   - **express.json()**: Parses JSON request bodies
   - **cookie-parser**: Parses cookies for JWT token extraction

3. **Custom Middleware**:
   - **countRequest**: Tracks API usage for rate limiting
   - **trackTime**: Measures response times
   - **authenticateJWT**: Verifies JWT tokens for protected routes
   - **authorizeRole**: Ensures role-based access control

4. **Error Handling**:
   - Global error handler for consistent error responses

#### Environment Configuration

The server uses environment variables for configuration:

- Database connection strings
- JWT secrets
- OAuth credentials
- API keys for external services
- Environment-specific settings (development/production)

#### API Documentation

Comprehensive API documentation is available through Swagger/OpenAPI:

- Interactive documentation at `/api-docs` endpoint
- Complete endpoint documentation with request/response examples
- Authentication flow documentation
- Schema definitions for all data models

### Database Architecture

KarmicDD employs a hybrid database approach that leverages both relational and document databases to balance data integrity with flexibility.

#### Database Selection Rationale

1. **PostgreSQL** for structured, relationship-heavy data:
   - User accounts and authentication
   - Profile sharing and access control
   - Data requiring strict schemas and referential integrity

2. **MongoDB** for semi-structured, document-oriented data:
   - Profile information (startup and investor profiles)
   - Questionnaire responses
   - AI-generated analyses and recommendations
   - Data requiring flexible schemas and frequent updates

#### PostgreSQL Schema Design

```prisma
// Simplified Prisma schema
model User {
  id             Int            @id @default(autoincrement())
  user_id        String         @unique @default(uuid())
  email          String         @unique
  password_hash  String?
  oauth_provider String?
  oauth_id       String?
  role           String         // 'startup' or 'investor'
  created_at     DateTime       @default(now())
  updated_at     DateTime       @updatedAt
  profileShares  ProfileShare[]

  @@map("users")
}

model ProfileShare {
  id          Int      @id @default(autoincrement())
  user        User     @relation(fields: [user_id], references: [user_id], onDelete: Cascade)
  user_id     String
  share_token String   @unique
  expires_at  DateTime
  created_at  DateTime @default(now())
  view_count  Int      @default(0)

  @@map("profile_shares")
}
```

#### MongoDB Collections

1. **Profile Collections**:
   - `StartupProfile`: Basic startup information (industry, funding stage, etc.)
   - `InvestorProfile`: Basic investor information (industries of interest, preferred stages, etc.)
   - `ExtendedProfile`: Additional profile data (team members, social links, etc.)

2. **Analysis Collections**:
   - `QuestionnaireSubmission`: User responses to questionnaires
   - `BeliefSystemAnalysis`: Comprehensive belief system analysis with expiration dates
   - `FinancialDueDiligenceReport`: Financial analysis with metrics and recommendations
   - `Recommendation`: Cached AI-generated recommendations
   - `MatchAnalysis`: Compatibility scores between startups and investors

3. **Utility Collections**:
   - `ApiUsage`: Tracks API usage for rate limiting
   - `Document`: Metadata for uploaded documents

#### Cross-Database Integration

The integration between databases is managed through consistent identifiers:

- PostgreSQL `user_id` (UUID) is used as the `userId` in MongoDB documents
- Authentication flow: Verify user in PostgreSQL, then retrieve profile from MongoDB
- Profile sharing: Generate share tokens in PostgreSQL, retrieve profile data from MongoDB

### Authentication System

The KarmicDD platform implements a multi-faceted authentication system that balances security and user experience.

#### Authentication Methods

1. **Email/Password Authentication**:
   - Traditional registration and login flow
   - Password hashing using bcrypt
   - Rate limiting on login attempts

2. **OAuth 2.0 Integration**:
   - **Google OAuth**: One-click login with Google accounts
   - **LinkedIn OAuth**: Professional network integration

#### Authentication Flow

```typescript
// Simplified authentication controller logic
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ message: 'No account found with this email address. Please register first.' });
            return;
        }

        // Verify password if user exists and has password (not OAuth-only)
        if (!user.password_hash) {
            res.status(401).json({
                message: 'This account uses social login. Please sign in with Google or LinkedIn.'
            });
            return;
        }

        // Compare password hash
        const passwordValid = await bcrypt.compare(password, user.password_hash);
        if (!passwordValid) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Generate JWT token
        const token = generateToken({
            userId: user.user_id,
            email: user.email,
            role: user.role
        });

        // Return user info and token
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                userId: user.user_id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login' });
    }
};
```

#### JWT Implementation

JSON Web Tokens (JWT) are used for stateless authentication:

- **Token Payload**: Contains userId, email, role, and expiration
- **Token Lifetime**: 7 days
- **Signing Algorithm**: HMAC-SHA256 (HS256)

#### Authentication Middleware

1. **JWT Authentication Middleware**:
   - Extracts token from Authorization header
   - Verifies token signature and expiration
   - Attaches user data to request object

2. **Role-Based Authorization Middleware**:
   - Ensures users can only access appropriate resources
   - Restricts routes based on user role (startup or investor)

#### Frontend Token Management

- JWT tokens stored in browser's localStorage
- Axios interceptors add token to all API requests
- Automatic redirection to login on authentication errors

#### Security Measures

- Bcrypt password hashing
- HTTPS enforcement in production
- Rate limiting on authentication endpoints
- Minimal OAuth scope requests
- Input validation on all authentication endpoints

### API Structure

The KarmicDD API follows a RESTful design pattern organized by functional domains.

#### API Design Principles

1. **RESTful Resource Modeling**:
   - Resources as nouns with appropriate HTTP methods
   - Consistent URL patterns and status codes

2. **Response Formatting**:
   - Standardized JSON structure for all responses
   - Consistent error handling

3. **Security**:
   - JWT authentication for protected endpoints
   - Role-based access control
   - Rate limiting for AI-intensive operations

#### API Domains

The API is organized into the following domains:

1. **Authentication API** (`/api/auth`):
   - User registration and login
   - OAuth integration with Google and LinkedIn
   - Role selection for OAuth users

2. **User API** (`/api/users`):
   - Profile management
   - Dashboard data retrieval

3. **Profile API** (`/api/profile`):
   - Startup and investor profile management
   - Profile sharing
   - Document management

4. **Questionnaire API** (`/api/questionnaire`):
   - Questionnaire submission and retrieval
   - Response analysis

5. **Matching API** (`/api/matching`):
   - Find matches based on user role
   - Filter and sort matches

6. **Compatibility API** (`/api/score`):
   - Get and generate compatibility scores
   - Detailed compatibility analysis

7. **Belief System Analysis API** (`/api/analysis`):
   - AI-powered belief system analysis
   - PDF export functionality

8. **Financial Due Diligence API** (`/api/financial`):
   - Financial document processing
   - Due diligence report generation

9. **Search API** (`/api/search`):
   - Search for startups and investors
   - Filter options

10. **Email API** (`/api/email`):
    - Profile sharing via email
    - Contact messaging

11. **Recommendation API** (`/api/recommendations`):
    - AI-generated recommendations
    - Recommendation caching

#### Standard Response Format

```json
// Success Response
{
  "message": "Operation successful",
  "data": { /* Response data */ }
}

// Error Response
{
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": { /* Additional error details */ }
  }
}
```

#### API Documentation

The API is documented using Swagger/OpenAPI 3.0:

- Interactive documentation at `/api-docs`
- Complete endpoint specifications
- Request/response schemas
- Authentication flow examples

### Services and Controllers

The KarmicDD backend implements a controller-service pattern to achieve separation of concerns and maintainable code organization.

#### Architectural Pattern

1. **Responsibility Separation**:
   - **Controllers**: Handle HTTP requests/responses and input validation
   - **Services**: Implement business logic and data access

2. **Error Handling**:
   - Controllers handle HTTP-specific errors
   - Services throw domain-specific errors
   - Global error handler provides consistent responses

#### Controller Implementation

```typescript
// Simplified controller example
import { Request, Response } from 'express';
import SomeService from '../services/SomeService';

export const performAction = async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. Extract and validate input
        const { param1, param2 } = req.body;

        // 2. Call service method
        const result = await SomeService.doSomething(param1, param2);

        // 3. Format and send response
        res.status(200).json({
            message: 'Operation successful',
            data: result
        });
    } catch (error) {
        // 4. Handle errors
        if (error instanceof ValidationError) {
            res.status(400).json({ message: error.message });
            return;
        }

        // Let global error handler catch other errors
        throw error;
    }
};
```

#### Key Controllers

1. **Authentication Controllers** (`authController.ts`):
   - User registration and login
   - OAuth flow handling
   - Role selection for OAuth users

2. **User Controllers** (`userController.ts`):
   - Profile retrieval
   - Dashboard data aggregation

3. **Profile Controllers** (`profileController.ts`):
   - Startup and investor profile management
   - Document upload and management
   - Profile sharing functionality

4. **Questionnaire Controllers** (`questionnaireController.ts`):
   - Questionnaire submission and retrieval
   - Response analysis

5. **Matching Controllers**:
   - `matchingController.ts`: Find potential matches
   - `compatibilityController.ts`: Calculate compatibility scores

6. **Analysis Controllers**:
   - `BeliefSystemAnalysisController.ts`: Generate belief system analysis
   - `financialDueDiligenceController.ts`: Process financial documents

7. **Recommendation Controllers** (`recommendationController.ts`):
   - Generate and retrieve AI-powered recommendations
   - Implement recommendation caching

#### Key Services

Services encapsulate business logic and data access:

```typescript
// Simplified service example
import SomeModel from '../models/SomeModel';

class SomeService {
    // Static methods for simplicity (could be instance methods with DI)
    static async doSomething(param1: string, param2: number): Promise<r> {
        // 1. Validate business rules
        this.validateBusinessRules(param1, param2);

        // 2. Interact with data models
        const data = await SomeModel.findSomething(param1);

        // 3. Apply business logic
        const processedData = this.processData(data, param2);

        // 4. Return result
        return processedData;
    }

    private static validateBusinessRules(param1: string, param2: number): void {
        // Validation logic
    }

    private static processData(data: any, param2: number): Result {
        // Processing logic
    }
}

export default SomeService;
```

The system includes the following core services:

1. **Document Processing Services**:
   - Extract text and metadata from various document formats
   - Process financial documents with AI-enhanced analysis

2. **Matching Services**:
   - Identify compatible startup-investor pairs
   - Calculate compatibility scores using Gemini AI

3. **Recommendation Services**:
   - Generate personalized recommendations
   - Implement caching with expiration dates

4. **Email Services**:
   - Send profile sharing notifications
   - Deliver reports and analysis results

5. **Analysis Services**:
   - Belief system analysis using Gemini AI
   - Financial due diligence report generation
   - PDF export functionality

This controller-service architecture provides a clean separation of concerns, making the codebase maintainable and extensible.

### Error Handling

The KarmicDD backend implements a multi-layered error handling system that ensures consistent error responses and proper logging.

#### Error Handling Architecture

1. **Domain-Specific Error Classes**:
   - Custom error classes for different error types (Authentication, Authorization, Validation, etc.)
   - Structured error information with codes and details

2. **Service-Level Error Handling**:
   - Business logic validation
   - Domain-specific error throwing with context

3. **Controller-Level Error Handling**:
   - Try-catch blocks for request handling
   - Response formatting for known error types

4. **Global Error Middleware**:
   - Last-resort error catching
   - Standardized error response formatting

#### Error Response Format

```json
{
  "message": "Human-readable error message",
  "error": {
    "code": "ERROR_CODE",
    "details": {
      "field": "problematic_field",
      "reason": "specific_reason"
    }
  }
}
```

This error handling system ensures that the platform can gracefully handle failures, provide clear feedback to users, and give developers the information they need to quickly diagnose and fix issues.

## Frontend Architecture

The KarmicDD frontend architecture is designed to provide a responsive, intuitive user interface that adapts to different user roles and workflows. This section details the frontend technology stack, component organization, state management approach, and other key architectural aspects.

### Frontend Technology Stack

The frontend is built with a modern technology stack that prioritizes developer productivity and user experience:

#### Core Framework and Language

- **React 18+**: Component-based JavaScript library for building user interfaces
- **TypeScript 5.0+**: Strongly typed superset of JavaScript

#### Build and Development Tools

- **Vite**: Fast build tool and development server
- **ESLint**: JavaScript and TypeScript linter
- **Prettier**: Code formatter

#### Routing and Navigation

- **React Router v6**: Declarative routing with protected routes

#### State Management

- **React Context API**: Built-in state management for global state
- **React Hooks**: Functional component state and lifecycle management

#### UI Components and Styling

- **Custom Component Library**: Role-specific UI components
- **CSS Modules**: Scoped CSS for components
- **Framer Motion**: Animation library for React

#### Form Handling and API Communication

- **React Hook Form**: Form state management and validation
- **Axios**: Promise-based HTTP client with interceptors

#### Additional Libraries

- **React Toastify**: Toast notification system
- **React Loading Skeleton**: Loading state UI
- **Jest & React Testing Library**: Testing framework

This technology stack enables the KarmicDD frontend to deliver a responsive, feature-rich user experience while maintaining code quality and developer productivity.

### Component Structure

The KarmicDD frontend follows a component-based architecture that emphasizes reusability and separation of concerns. Components are organized by feature and responsibility.

#### Component Organization

The component structure follows these key principles:

1. **Feature-Based Organization**: Components are grouped by feature or domain
2. **Atomic Design Methodology**: Components follow a hierarchy from atoms to pages
3. **Role-Specific Components**: Different components for startup and investor user roles

#### Directory Structure

```
src/
├── components/
│   ├── Auth/                 # Authentication components
│   ├── Dashboard/            # Dashboard components
│   ├── Forms/                # Form components
│   ├── Profile/              # Profile components
│   └── Tutorial/             # Tutorial components
└── pages/                    # Page components
```

#### Component Hierarchy

Components are organized following atomic design principles:

1. **Atoms**: Fundamental building blocks (Button, Input, Typography)
2. **Molecules**: Combinations of atoms (FormField, SearchBar, Notification)
3. **Organisms**: Complex UI sections (Header, ProfileCard, MatchCard)
4. **Templates**: Page layouts (DashboardLayout, ProfileLayout)
5. **Pages**: Complete page components (Dashboard, Auth, Landing)

This component structure enables the KarmicDD frontend to provide an intuitive user experience while maintaining code organization and reusability.

### State Management

The KarmicDD frontend uses a hybrid state management approach combining React Context API for global state and React Hooks for component-level state.

#### State Categories

1. **UI State**: Managed with local component state (useState, useReducer)
   - Form inputs, toggle states, animations

2. **Session State**: Managed with Context API and localStorage
   - Authentication, user preferences, tutorial progress

3. **Application State**: Managed with Context API
   - Profile data, match data, analysis results

4. **Server State**: Managed with custom hooks
   - API responses, loading states, error handling

The frontend uses several key context providers:

1. **AuthContext**: Manages authentication state and user information
2. **TutorialContext**: Handles onboarding tutorials and guided tours
3. **ActiveSectionContext**: Tracks active sections for navigation

Custom hooks are used to encapsulate reusable logic and provide clean APIs for components.

### Routing and Navigation

The application uses React Router v6 for client-side routing with the following features:

1. **Protected Routes**: Routes that require authentication
2. **Role-Based Access**: Different routes for startup and investor users
3. **Nested Routes**: Complex layouts with nested content
4. **Programmatic Navigation**: Navigation through code

The application implements route protection to ensure users can only access appropriate content based on their authentication status and role. This includes redirecting unauthenticated users to the login page and ensuring users complete required steps like profile creation and questionnaires before accessing the main application features.

### API Integration

The frontend communicates with the backend API using Axios, with the following features:

1. **Request Interceptors**: Add authentication tokens to requests
2. **Response Interceptors**: Handle common error patterns
3. **Centralized API Client**: Consistent configuration across the application
4. **Error Handling**: Standardized error processing and user feedback

### Service Layer

The frontend implements a service layer that abstracts API communication and business logic from UI components. This architectural pattern enhances maintainability and testability by providing a clean separation between data access and presentation logic.

The service layer is organized into several categories:

1. **API Services**: Handle direct communication with the backend API
2. **Domain Services**: Implement business logic and domain-specific operations
3. **Utility Services**: Provide cross-cutting functionality used throughout the application

Services encapsulate error handling, data transformation, and business logic, providing a clean interface for components to interact with backend services.

Key principles of the service layer include:

1. **Abstraction**: Hides the details of API communication from components
2. **Type Safety**: Provides TypeScript interfaces for request and response data
3. **Error Handling**: Implements consistent error handling across all services
4. **Caching**: Optimizes performance through strategic caching of responses

The service layer uses a centralized API client based on Axios that:

1. Adds authentication tokens to all requests
2. Handles common error scenarios (authentication errors, server errors, network errors)
3. Provides consistent error messaging through toast notifications
4. Manages authentication state by clearing tokens on 401 responses

The application includes several domain-specific service modules:

1. **Authentication Service**: Handles user login, registration, and session management
2. **User Service**: Manages user profile data and dashboard information
3. **Profile Service**: Handles startup and investor profile operations
4. **Matching Service**: Manages compatibility scoring and match recommendations
5. **Document Service**: Handles document uploads, processing, and management
6. **Report Service**: Generates and manages due diligence reports

### UI/UX Architecture

The KarmicDD frontend implements a user-centered design approach that prioritizes usability, accessibility, and a consistent user experience across the application. The UI/UX architecture is built on the following principles:

1. **Role-Based Interfaces**: Different interfaces for startup and investor users
2. **Responsive Design**: Adapts to different screen sizes and devices
3. **Consistent Design Language**: Unified visual elements and interaction patterns
4. **Accessibility**: WCAG compliance for inclusive user experience
5. **Progressive Disclosure**: Information presented in a logical, step-by-step manner

#### Design System

The application uses a consistent design system with the following components:

1. **Color Palette**: Primary, secondary, and accent colors with light/dark variants
2. **Typography**: Hierarchical type system with consistent fonts and sizes
3. **Component Library**: Reusable UI components with consistent styling
4. **Layout System**: Grid-based layouts for consistent spacing and alignment
5. **Iconography**: Unified icon set for consistent visual language

#### User Flows

The application implements carefully designed user flows for key tasks:

1. **Onboarding**: Guided setup for new users based on their role
2. **Profile Creation**: Step-by-step process for creating comprehensive profiles
3. **Match Discovery**: Intuitive interface for finding and evaluating potential matches
4. **Due Diligence**: Structured workflow for conducting due diligence

## Integration Architecture

### Matching and Compatibility

The matching and compatibility system is a core feature of the KarmicDD platform, connecting startups and investors based on sophisticated AI-powered analysis. This section details the data flow and processing involved in this critical functionality.

#### Matching and Compatibility Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │     │                 │
│  React Frontend │     │  Express Server │     │  MongoDB Cache  │     │   Gemini AI    │
│                 │     │                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │                       │
         │                       │                       │                       │
         │  1. Request Match     │                       │                       │
         │  or Compatibility     │                       │                       │
         │─────────────────────▶│                       │                       │
         │                       │                       │                       │
         │                       │  2. Check Cache       │                       │
         │                       │─────────────────────▶│                       │
         │                       │                       │                       │
         │                       │  3. Return Cached     │                       │
         │                       │  Data (if available)  │                       │
         │                       │◀─────────────────────│                       │
         │                       │                       │                       │
         │                       │                       │                       │
         │                       │  4. If No Cache,      │                       │
         │                       │  Fetch Profiles       │                       │
         │                       │─────────────────────▶│                       │
         │                       │                       │                       │
         │                       │  5. Return Profile    │                       │
         │                       │  Data                 │                       │
         │                       │◀─────────────────────│                       │
         │                       │                       │                       │
         │                       │  6. Process Profiles  │                       │
         │                       │  & Generate Prompt    │                       │
         │                       │─────────────────────────────────────────────▶│
         │                       │                       │                       │
         │                       │                       │                       │
         │                       │  7. Return AI         │                       │
         │                       │  Analysis             │                       │
         │                       │◀─────────────────────────────────────────────│
         │                       │                       │                       │
         │                       │  8. Process AI        │                       │
         │                       │  Response             │                       │
         │                       │                       │                       │
         │                       │  9. Store in Cache    │                       │
         │                       │─────────────────────▶│                       │
         │                       │                       │                       │
         │  10. Return           │                       │                       │
         │  Formatted Results    │                       │                       │
         │◀─────────────────────│                       │                       │
         │                       │                       │                       │
         │  11. Display Results  │                       │                       │
         │  to User              │                       │                       │
         │                       │                       │                       │
┌────────┴────────┐     ┌────────┴────────┐     ┌────────┴────────┐     ┌────────┴────────┐
│                 │     │                 │     │                 │     │                 │
│  React Frontend │     │  Express Server │     │  MongoDB Cache  │     │   Gemini AI    │
│                 │     │                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

#### Process Description

1. **Request Initiation**: The frontend requests match recommendations or compatibility analysis between a startup and investor.

2. **Cache Check**: The backend first checks if a valid cached result exists in MongoDB.

3. **Cache Response**: If valid cached data exists (not expired), it's immediately returned to the frontend.

4. **Profile Retrieval**: If no cache exists, the system retrieves the relevant startup and investor profiles from MongoDB.

5. **Data Preparation**: The backend processes the profile data and prepares it for AI analysis.

6. **AI Processing**: The prepared data is sent to Google's Gemini AI with carefully structured prompts.

7. **AI Response**: Gemini AI returns the analysis results (compatibility scores, recommendations, etc.).

8. **Response Processing**: The backend processes the AI response, extracting key metrics and insights.

9. **Cache Storage**: The processed results are stored in MongoDB with an expiration date for future requests.

10. **Response Delivery**: The formatted results are sent back to the frontend.

11. **User Presentation**: The frontend displays the results in an intuitive, actionable format.

#### Key Components

1. **Compatibility Controller**: Manages the API endpoints for compatibility requests and coordinates the process flow.

2. **Recommendation Model**: MongoDB schema for storing cached recommendations with appropriate expiration dates.

3. **Gemini AI Integration**: Structured prompt engineering for consistent, high-quality AI responses.

4. **Caching Strategy**: Intelligent caching with expiration dates to balance freshness with API usage efficiency.

This architecture ensures efficient, responsive matching and compatibility analysis while optimizing AI API usage through strategic caching.

## Conclusion

The KarmicDD architecture provides a solid foundation for a scalable, maintainable, and user-friendly platform. By implementing clean separation of concerns, robust error handling, and a consistent design system, the application delivers a seamless experience for both startup and investor users while maintaining code quality and developer productivity.

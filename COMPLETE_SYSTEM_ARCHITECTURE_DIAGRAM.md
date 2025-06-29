# KarmicDD Complete System Architecture Diagram

## Executive Summary

This document presents a comprehensive, ultra-detailed, low-level architecture diagram for the entire KarmicDD system, covering both frontend and backend components. The diagram shows all components, services, functions, their interconnections, call hierarchies, data flows, and highlights which functions are called and their usage patterns.

## System Overview

KarmicDD is a full-stack application connecting startups and investors through intelligent matching, comprehensive due diligence analysis, and data-driven recommendations. The system features a React/TypeScript frontend communicating with a Node.js/Express backend, utilizing PostgreSQL for relational data, MongoDB for analytics, and Gemini AI for advanced document processing and analysis.

## Complete System Architecture Diagram

```mermaid
graph TB
    %% ===========================================
    %% FRONTEND LAYER
    %% ===========================================
    
    subgraph "Frontend Layer - React/TypeScript/Vite"
        subgraph "Entry Points"
            MainApp[App.tsx - Main Application Entry]
            IndexHTML[index.html - HTML Entry Point]
            ViteConfig[vite.config.ts - Build Configuration]
        end
        
        subgraph "Routing & Navigation"
            Router[React Router - Route Management]
            ProtectedRoutes[Protected Route Guards]
            PublicRoutes[Public Routes]
        end
        
        subgraph "Authentication Flow"
            AuthPage[Auth.tsx - Authentication Page]
            SignUp[SignUp.tsx - Registration Form]
            Login[Login.tsx - Login Form]
            OAuthCallback[OAuthCallback.tsx - OAuth Handler]
            ForgotPassword[ForgotPassword.tsx - Password Reset]
        end
        
        subgraph "Core Pages"
            Dashboard[Dashboard.tsx - Main Dashboard]
            Profile[Profile.tsx - User Profile]
            Matching[Matching.tsx - Partner Matching]
            Analytics[Analytics.tsx - Data Analytics]
            Documents[Documents.tsx - Document Management]
            Settings[Settings.tsx - User Settings]
        end
        
        subgraph "Component Architecture"
            subgraph "Layout Components"
                Header[Header.tsx - Navigation Header]
                Sidebar[Sidebar.tsx - Side Navigation]
                Footer[Footer.tsx - Page Footer]
                Layout[Layout.tsx - Page Layout Wrapper]
            end
            
            subgraph "Form Components"
                FormWrapper[form.tsx - Universal Form Wrapper]
                StartupForm[StartupForm.tsx - Startup Registration]
                InvestorForm[InvestorForm.tsx - Investor Registration]
                ProfileForm[ProfileForm.tsx - Profile Management]
                DocumentUpload[DocumentUpload.tsx - File Upload]
            end
            
            subgraph "Data Display Components"
                DataTable[DataTable.tsx - Tabular Data]
                ChartComponents[Chart Components - Data Visualization]
                CardComponents[Card Components - Info Display]
                ListComponents[List Components - Item Lists]
            end
            
            subgraph "Interactive Components"
                Modal[Modal.tsx - Popup Dialogs]
                Notification[Notification.tsx - Alert System]
                Loading[Loading.tsx - Loading States]
                ErrorBoundary[ErrorBoundary.tsx - Error Handling]
            end
        end
        
        subgraph "State Management"
            subgraph "Context Providers"
                AuthContext[AuthContext - Authentication State]
                UserContext[UserContext - User Data State]
                AppContext[AppContext - Application State]
                ThemeContext[ThemeContext - UI Theme State]
            end
            
            subgraph "Custom Hooks"
                UseAuth[useAuth - Authentication Logic]
                UseAPI[useAPI - API Integration]
                UseForm[useForm - Form Management]
                UseLocalStorage[useLocalStorage - Local Storage]
                ActiveSectionHooks[active-section-hooks.ts - Section Management]
            end
        end
        
        subgraph "Service Layer"
            subgraph "API Services"
                APIClient[api.ts - Main API Client]
                AuthService[Auth API Services]
                ProfileService[Profile API Services]
                MatchingService[Matching API Services]
                AnalyticsService[Analytics API Services]
                DocumentService[Document API Services]
                FinancialDDService[Financial DD API Services]
                LegalDDService[Legal DD API Services]
            end
            
            subgraph "Utility Services"
                ValidationUtils[validation.ts - Input Validation]
                CSRFManager[csrfManager.ts - CSRF Protection]
                ErrorHandler[Error Handling Utils]
                DateUtils[Date/Time Utilities]
                FormatUtils[Data Formatting Utils]
            end
        end
    end
    
    %% ===========================================
    %% COMMUNICATION LAYER
    %% ===========================================
    
    subgraph "Communication Layer"
        subgraph "HTTP/API Communication"
            AxiosClient[Axios HTTP Client]
            RequestInterceptors[Request Interceptors]
            ResponseInterceptors[Response Interceptors]
            ErrorInterceptors[Error Handling Interceptors]
        end
        
        subgraph "Security Layer"
            CSRFTokens[CSRF Token Management]
            JWTTokens[JWT Authentication Tokens]
            AuthHeaders[Authorization Headers]
            CORSHandling[CORS Configuration]
        end
    end
    
    %% ===========================================
    %% BACKEND LAYER
    %% ===========================================
    
    subgraph "Backend Layer - Node.js/Express/TypeScript"
        subgraph "Server Entry Points"
            ServerTS[server.ts - Server Initialization]
            AppTS[app.ts - Express App Configuration]
            MiddlewareChain[Middleware Processing Chain]
        end
        
        subgraph "Security Middleware"
            SecurityHeaders[Security Headers Middleware]
            RateLimiting[Rate Limiting Middleware]
            InputSanitization[Input Sanitization Middleware]
            CSRFProtection[CSRF Protection Middleware]
            MongoSanitize[NoSQL Injection Prevention]
            FileValidation[File Upload Validation]
        end
        
        subgraph "Authentication & Authorization"
            AuthMiddleware[authenticateJWT - JWT Verification]
            RoleMiddleware[authorizeRole - Role-Based Access]
            PassportConfig[Passport OAuth Configuration]
            JWTConfig[JWT Token Management]
            SessionConfig[Session Management]
        end
        
        subgraph "Route Handlers"
            subgraph "Authentication Routes"
                AuthRoutes[authRoutes.ts - Auth Endpoints]
                RegisterRoute[POST /api/auth/register]
                LoginRoute[POST /api/auth/login]
                OAuthGoogleRoute[GET /api/auth/google]
                OAuthLinkedInRoute[GET /api/auth/linkedin]
                UpdateRoleRoute[POST /api/auth/update-role]
            end
            
            subgraph "User Management Routes"
                UserRoutes[userRoutes.ts - User Endpoints]
                ProfileRoutes[profileRoutes.ts - Profile Endpoints]
                StartupDashboard[GET /api/users/startup/dashboard]
                InvestorDashboard[GET /api/users/investor/dashboard]
                ProfileUpdate[PUT /api/profiles/:id]
                ProfileGet[GET /api/profiles/:id]
            end
            
            subgraph "Matching & Compatibility Routes"
                MatchingRoutes[matchingRoutes.ts - Matching Logic]
                CompatibilityRoutes[compatibilityControllerRoutes.ts]
                BeliefSystemRoutes[BelifSystemRoutes.ts]
                QuestionnaireRoutes[questionnaireRoute.ts]
                BatchCompatibility[GET /api/compatibility/batch]
                AnalyzeCompatibility[POST /api/matching/analyze]
            end
            
            subgraph "Analytics & Dashboard Routes"
                AnalyticsRoutes[analyticsRoutes.ts - Analytics Data]
                DashboardRoutes[dashboardRoutes.ts - Dashboard Data]
                GetAnalytics[GET /api/analytics/:userId]
                GenerateReport[POST /api/analytics/reports]
            end
            
            subgraph "Due Diligence Routes"
                FinancialDDRoutes[financialDueDiligenceRoutes.ts]
                NewFinancialDDRoutes[newFinancialDueDiligenceRoutes.ts]
                LegalDDRoutes[newLegalDueDiligenceRoutes.ts]
                GenerateFinancial[POST /api/financial/generate]
                GenerateLegal[POST /api/legal/generate]
                GetReports[GET /api/financial/reports]
            end
            
            subgraph "Document & File Routes"
                DocumentRoutes[Document Upload/Processing Routes]
                FileUpload[POST /api/documents/upload]
                FileDownload[GET /api/documents/:id]
                FileDelete[DELETE /api/documents/:id]
            end
            
            subgraph "Communication Routes"
                EmailRoutes[emailRoutes.ts - Email Services]
                TaskRoutes[taskRoutes.ts - Task Management]
                SearchRoutes[searchRoutes.ts - Search Functionality]
                SendEmail[POST /api/email/send]
                SearchUsers[GET /api/search]
            end
        end
        
        subgraph "Controller Layer"
            subgraph "Authentication Controllers"
                AuthController[authController.ts]
                RegisterController[register() - User Registration]
                LoginController[login() - User Authentication]
                OAuthController[OAuth Handler Functions]
                UpdateRoleController[updateOAuthUserRole()]
            end
            
            subgraph "User Management Controllers"
                UserController[userController.ts]
                ProfileController[profileController.ts]
                GetUserProfile[getUserProfile()]
                UpdateUserProfile[updateUserProfile()]
                GetStartupDashboard[getStartupDashboard()]
                GetInvestorDashboard[getInvestorDashboard()]
            end
            
            subgraph "Analysis Controllers"
                MatchingController[matchingController.ts]
                CompatibilityController[compatibilityController.ts]
                BeliefSystemController[BeliefSystemAnalysisController.ts]
                RecommendationController[recommendationController.ts]
                AnalyzeCompatibility[analyzeCompatibility()]
                GenerateRecommendations[generateRecommendations()]
                AnalyzeBeliefSystem[analyzeBeliefSystem()]
            end
            
            subgraph "Due Diligence Controllers"
                FinancialDDController[FinancialDueDiligenceMatchController.ts]
                EntityFinancialController[EntityFinancialDueDiligenceController.ts]
                AnalyzeFinancialDD[analyzeFinancialDueDiligence()]
                GenerateFinancialReport[generateFinancialReport()]
            end
            
            subgraph "Analytics Controllers"
                DashboardController[dashboardController.ts]
                AnalyticsController[analyticsController.ts]
                GetDashboardData[getDashboardData()]
                GenerateAnalytics[generateAnalytics()]
            end
        end
        
        subgraph "Service Layer"
            subgraph "Document Processing Services"
                DocumentProcessingService[DocumentProcessingService.ts - Legacy]
                EnhancedDocumentService[EnhancedDocumentProcessingService.ts]
                MemoryBasedOCRService[MemoryBasedOcrPdfService.ts]
                NewFinancialDDService[NewFinancialDueDiligenceService.ts]
                NewLegalDDService[NewLegalDueDiligenceService.ts]
            end
            
            subgraph "AI & Analysis Services"
                GeminiAIService[Gemini AI Integration]
                FinancialAnalysisService[Financial Analysis Logic]
                LegalAnalysisService[Legal Analysis Logic]
                CompatibilityAnalysisService[Compatibility Analysis]
                RecommendationService[Recommendation Generation]
            end
            
            subgraph "Business Logic Services"
                UserService[User Management Logic]
                ProfileService[Profile Management Logic]
                MatchingService[Matching Algorithm Logic]
                AnalyticsService[Analytics Processing Logic]
                NotificationService[Notification System]
            end
        end
        
        subgraph "Data Access Layer"
            subgraph "Database Configuration"
                DBConfig[db.ts - Database Connection]
                PrismaClient[Prisma ORM Client]
                MongoConnection[MongoDB Connection]
                SessionStore[Session Storage Configuration]
            end
            
            subgraph "PostgreSQL Models (Prisma)"
                UserModel[User Model - Authentication]
                ProfileModel[Profile Model - User Data]
                DocumentModel[Document Model - File Metadata]
                SessionModel[Session Model - User Sessions]
            end
            
            subgraph "MongoDB Models (Mongoose)"
                FinancialReportModel[FinancialDueDiligenceReport.ts]
                LegalReportModel[LegalDueDiligenceReport.ts]
                CompatibilityModel[CompatibilityModel.ts]
                RecommendationModel[RecommendationModel.ts]
                AnalyticsModel[Analytics Data Models]
                APIUsageModel[API Usage Tracking Model]
            end
        end
        
        subgraph "Utility & Configuration"
            subgraph "Security Utilities"
                PasswordUtils[passwordUtils.ts - Password Hashing]
                ValidationUtils[validation.ts - Input Validation]
                SecurityUtils[security.ts - Security Functions]
                CSRFUtils[CSRF Token Management]
            end
            
            subgraph "System Utilities"
                LoggerUtils[logger.ts - Logging System]
                EmailUtils[Email Service Utils]
                FileUtils[File Processing Utils]
                DateUtils[Date/Time Utils]
                ErrorHandling[Error Handler Middleware]
            end
            
            subgraph "Configuration"
                JWTConfig[jwt.ts - JWT Configuration]
                PassportConfig[passport.ts - OAuth Config]
                SwaggerConfig[swagger.ts - API Documentation]
                SessionConfig[session.ts - Session Management]
            end
        end
    end
    
    %% ===========================================
    %% EXTERNAL SERVICES & DATABASES
    %% ===========================================
    
    subgraph "External Services & Storage"
        subgraph "AI Services"
            GeminiAPI[Google Gemini AI API]
            DocumentExtraction[Document Text Extraction]
            FinancialAnalysis[Financial Analysis AI]
            LegalAnalysis[Legal Analysis AI]
        end
        
        subgraph "OAuth Providers"
            GoogleOAuth[Google OAuth 2.0]
            LinkedInOAuth[LinkedIn OAuth 2.0]
        end
        
        subgraph "Storage Systems"
            FileSystem[Local File System - uploads/]
            SessionFiles[Session File Store - sessions/]
            LogFiles[Application Logs - logs/]
            OCROutputs[OCR Processing Results - ocr_outputs/]
        end
        
        subgraph "Databases"
            PostgreSQL[(PostgreSQL Database)]
            MongoDB[(MongoDB Database)]
        end
    end
    
    %% ===========================================
    %% CONNECTIONS AND DATA FLOWS
    %% ===========================================
    
    %% Frontend to Communication Layer
    MainApp --> Router
    Router --> AuthPage
    Router --> Dashboard
    Router --> Profile
    Router --> Matching
    Router --> Analytics
    Router --> Documents
    
    APIClient --> AxiosClient
    AuthService --> APIClient
    ProfileService --> APIClient
    MatchingService --> APIClient
    AnalyticsService --> APIClient
    DocumentService --> APIClient
    
    %% Communication Layer to Backend
    AxiosClient --> ServerTS
    CSRFTokens --> CSRFProtection
    JWTTokens --> AuthMiddleware
    
    %% Backend Internal Flow
    ServerTS --> AppTS
    AppTS --> MiddlewareChain
    MiddlewareChain --> SecurityHeaders
    MiddlewareChain --> RateLimiting
    MiddlewareChain --> InputSanitization
    MiddlewareChain --> CSRFProtection
    MiddlewareChain --> AuthMiddleware
    
    %% Route Processing
    AuthMiddleware --> AuthRoutes
    AuthMiddleware --> UserRoutes
    AuthMiddleware --> MatchingRoutes
    AuthMiddleware --> AnalyticsRoutes
    AuthMiddleware --> FinancialDDRoutes
    
    %% Controller Invocation
    AuthRoutes --> AuthController
    UserRoutes --> UserController
    ProfileRoutes --> ProfileController
    MatchingRoutes --> MatchingController
    CompatibilityRoutes --> CompatibilityController
    FinancialDDRoutes --> FinancialDDController
    
    %% Service Layer Integration
    AuthController --> UserService
    ProfileController --> ProfileService
    MatchingController --> MatchingService
    CompatibilityController --> CompatibilityAnalysisService
    FinancialDDController --> NewFinancialDDService
    
    %% Document Processing Flow
    NewFinancialDDService --> MemoryBasedOCRService
    NewLegalDDService --> MemoryBasedOCRService
    MemoryBasedOCRService --> GeminiAPI
    EnhancedDocumentService --> GeminiAPI
    
    %% Database Access
    UserService --> DBConfig
    ProfileService --> DBConfig
    DBConfig --> PrismaClient
    DBConfig --> MongoConnection
    PrismaClient --> PostgreSQL
    MongoConnection --> MongoDB
    
    %% External Service Integration
    AuthController --> GoogleOAuth
    AuthController --> LinkedInOAuth
    MemoryBasedOCRService --> GeminiAPI
    FinancialAnalysisService --> GeminiAPI
    LegalAnalysisService --> GeminiAPI
    
    %% File and Storage
    DocumentService --> FileSystem
    SessionConfig --> SessionFiles
    LoggerUtils --> LogFiles
    MemoryBasedOCRService --> OCROutputs
    
    %% Styling and Status Indicators
    classDef frontend fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef database fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef external fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef service fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef security fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    
    class MainApp,AuthPage,Dashboard,Profile,Matching,Analytics,Documents,APIClient,AuthService,ProfileService,MatchingService,AnalyticsService,DocumentService frontend
    class ServerTS,AppTS,AuthController,UserController,ProfileController,MatchingController,CompatibilityController,FinancialDDController,DashboardController backend
    class PostgreSQL,MongoDB,DBConfig,PrismaClient,MongoConnection database
    class GeminiAPI,GoogleOAuth,LinkedInOAuth,FileSystem external
    class NewFinancialDDService,NewLegalDDService,MemoryBasedOCRService,EnhancedDocumentService,FinancialAnalysisService,LegalAnalysisService service
    class SecurityHeaders,RateLimiting,InputSanitization,CSRFProtection,AuthMiddleware,RoleMiddleware security
```

## Function Call Hierarchies and Usage Analysis

### 1. Authentication Flow

**Heavily Used Functions:**
- `authenticateJWT()` - Called on every protected route (99% of API endpoints)
- `register()` - User registration controller
- `login()` - User authentication controller
- `generateToken()` - JWT token creation
- `verifyToken()` - JWT token validation

**Moderately Used Functions:**
- `handleOAuthCallback()` - OAuth processing
- `updateOAuthUserRole()` - Role assignment for OAuth users
- `regenerateCSRFTokenForSession()` - CSRF token refresh

**Rarely Used Functions:**
- Password reset functionality (present but minimal usage)
- Admin authentication functions (not implemented)

### 2. Document Processing Pipeline

**Core Processing Functions (Heavily Used):**
- `MemoryBasedOcrPdfService.processForDueDiligence()` - Main OCR processing
- `EnhancedDocumentProcessingService.extractPdfTextWithGemini()` - Legacy PDF processing
- `NewFinancialDueDiligenceService.processDocumentsInBatches()` - Financial document processing
- `NewLegalDueDiligenceService.processDocumentsInBatches()` - Legal document processing

**AI Integration Functions (Heavily Used):**
- Gemini AI API calls for document analysis
- Financial analysis prompt processing
- Legal analysis prompt processing
- OCR text extraction from PDFs

**Legacy Functions (Deprecated/Unused):**
- `DocumentProcessingService.extractPdfText()` - Old PDF processing
- File system-based document storage methods
- Synchronous processing functions

### 3. Matching and Compatibility System

**Core Matching Functions:**
- `analyzeCompatibility()` - Startup-investor compatibility analysis
- `generateRecommendations()` - AI-powered recommendations
- `analyzeBeliefSystem()` - Belief system compatibility
- `getBatchCompatibility()` - Bulk compatibility processing

**Rate Limited Functions:**
- All AI analysis functions have daily limits (100 requests/day per user)
- `checkRateLimit()` functions across all analysis controllers

### 4. Data Management and Storage

**PostgreSQL Operations (User Data):**
- User CRUD operations via Prisma
- Profile management functions
- Document metadata storage
- Session management

**MongoDB Operations (Analytics Data):**
- Financial due diligence reports
- Legal due diligence reports
- Compatibility analysis results
- Recommendation data
- API usage tracking

### 5. Security and Middleware Chain

**Always Executed Functions:**
- `securityHeaders()` - Applied to all requests
- `sanitizeInput()` - Input sanitization on all requests
- `generalRateLimit()` - Global rate limiting
- `mongoSanitizeMiddleware()` - NoSQL injection prevention

**Conditionally Executed:**
- `csrfProtection()` - CSRF validation (non-GET requests)
- `authorizeRole()` - Role-based access control
- `validateFileUpload()` - File upload validation

## API Endpoint Mapping and Usage Patterns

### High-Traffic Endpoints
1. **POST /api/auth/login** - User authentication
2. **GET /api/users/startup/dashboard** - Startup dashboard data
3. **GET /api/users/investor/dashboard** - Investor dashboard data
4. **GET /api/profiles/:id** - Profile data retrieval
5. **GET /api/csrf-token** - CSRF token requests

### AI-Powered Endpoints (Rate Limited)
1. **POST /api/financial/generate** - Financial due diligence analysis
2. **POST /api/legal/generate** - Legal due diligence analysis
3. **POST /api/matching/analyze** - Compatibility analysis
4. **POST /api/recommendations/generate** - Recommendation generation
5. **GET /api/compatibility/batch** - Batch compatibility analysis

### Document Processing Endpoints
1. **POST /api/documents/upload** - File upload handling
2. **GET /api/financial/reports** - Financial report retrieval
3. **GET /api/legal/reports** - Legal report retrieval
4. **DELETE /api/documents/:id** - Document deletion

## Data Flow Patterns

### 1. User Authentication Flow
```
Frontend Auth Form → POST /api/auth/login → authController.login() → 
User validation → JWT generation → Response with token → 
Frontend token storage → Subsequent API requests with Bearer token
```

### 2. Document Processing Flow
```
Frontend Upload → POST /api/documents/upload → File validation → 
MemoryBasedOcrPdfService → Gemini AI API → Text extraction → 
Financial/Legal analysis → MongoDB storage → Response to frontend
```

### 3. Matching Flow
```
Matching request → GET /api/compatibility/batch → Rate limit check → 
Retrieve user profiles → AI compatibility analysis → 
MongoDB caching → Response with compatibility scores
```

## Component Interconnections

### Frontend Component Hierarchy
- **App.tsx** (Root) → **Router** → **Protected Routes** → **Page Components**
- **Page Components** → **Layout Components** + **Feature Components**
- **Feature Components** → **Form Components** + **Display Components**
- **All Components** → **Service Layer** → **API Client**

### Backend Service Dependencies
- **Controllers** → **Services** → **Data Access Layer**
- **Services** → **AI Services** (Gemini API)
- **Services** → **Utility Functions** → **Database Models**
- **Middleware Chain** → **Security Services** → **Validation Services**

### Database Relationships
- **PostgreSQL**: User authentication, profiles, document metadata
- **MongoDB**: Analytics data, AI analysis results, cached reports
- **File System**: Uploaded documents, session storage, logs

## Performance and Scalability Considerations

### Bottlenecks Identified
1. **Gemini AI API rate limits** - 100 requests/day per user
2. **Memory-based PDF processing** - Large files consume significant memory
3. **Synchronous AI processing** - Blocks request threads during analysis
4. **MongoDB queries** - Complex aggregation queries for analytics

### Optimization Strategies
1. **Caching Layer**: MongoDB caching for AI analysis results
2. **Rate Limiting**: User-based limits with graceful degradation
3. **Memory Management**: Automatic cleanup after processing
4. **Background Processing**: Asynchronous job queues for heavy operations

## Security Architecture

### Multi-Layer Security Approach
1. **Input Layer**: Sanitization, validation, rate limiting
2. **Authentication Layer**: JWT tokens, OAuth integration, CSRF protection
3. **Authorization Layer**: Role-based access control
4. **Data Layer**: SQL injection prevention, NoSQL sanitization
5. **Transport Layer**: HTTPS, secure headers, CORS configuration

### Security Function Usage
- **Always Active**: Input sanitization, rate limiting, security headers
- **Per Request**: Authentication verification, CSRF validation
- **Per Route**: Role-based authorization, resource access control

## Error Handling and Monitoring

### Error Handling Hierarchy
```
Component Error Boundaries → API Error Interceptors → 
Backend Error Middleware → Database Error Handling → 
Logging System → User-Friendly Error Messages
```

### Monitoring and Logging
- **API Usage Tracking**: Rate limit monitoring, endpoint usage stats
- **Error Logging**: Comprehensive error tracking and alerting
- **Performance Monitoring**: Response times, memory usage, AI API quotas
- **Security Monitoring**: Failed authentication attempts, suspicious activity

## Conclusion

This architecture diagram represents a comprehensive view of the KarmicDD system, showing the complete flow from user interactions through the frontend React application, via secure API communications, to the backend Node.js services, and finally to the AI processing and database storage layers. The system demonstrates a well-structured separation of concerns with robust security, comprehensive error handling, and scalable AI-powered analysis capabilities.

The architecture supports the core business functions of startup-investor matching, comprehensive due diligence analysis, and intelligent recommendations while maintaining security, performance, and user experience standards.

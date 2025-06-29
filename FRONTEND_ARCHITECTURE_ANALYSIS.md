# Frontend File Structure and Component Relationship Analysis

## Frontend Directory Structure Overview

```
Frontend/
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Main app component with routing
│   ├── App.css                     # Global styles
│   ├── index.css                   # Base styles
│   ├── vite-env.d.ts              # Vite type definitions
│   │
│   ├── assets/                     # Static assets
│   ├── components/                 # Reusable components
│   │   ├── Analytics/              # Analytics-related components
│   │   ├── Auth/                   # Authentication components
│   │   ├── Charts/                 # Chart components
│   │   ├── ComingSoon/             # Coming soon page
│   │   ├── common/                 # Common utilities
│   │   ├── Dashboard/              # Dashboard components
│   │   ├── DocumentViewer/         # Document viewing components
│   │   ├── Forms/                  # Form components
│   │   ├── Landing/                # Landing page components
│   │   ├── Profile/                # Profile components
│   │   ├── SEO/                    # SEO components
│   │   ├── Tutorial/               # Tutorial system
│   │   └── ui/                     # UI primitives
│   │
│   ├── config/                     # Configuration files
│   ├── constants/                  # Application constants
│   ├── context/                    # React contexts
│   ├── data/                       # Static data
│   ├── design-system/              # Design system components
│   ├── features/                   # Feature-specific components
│   ├── hooks/                      # Custom React hooks
│   ├── pages/                      # Page components
│   ├── services/                   # API services
│   ├── theme/                      # Theme configuration
│   ├── types/                      # TypeScript type definitions
│   └── utils/                      # Utility functions
│
├── public/                         # Public assets
├── docs/                          # Documentation
├── qr_codes/                      # QR code generation
└── [config files]                # Various config files
```

## Component Hierarchy and Relationships

### 1. Core Application Flow

```mermaid
graph TD
    A[main.tsx] --> B[App.tsx]
    
    B --> C[TutorialProvider]
    C --> D[ActiveSectionContextProvider]
    D --> E[Router]
    
    E --> F[Routes Configuration]
    F --> G[Landing Route /]
    F --> H[Auth Routes /auth]
    F --> I[Forms Route /forms]
    F --> J[Dashboard Route /dashboard]
    F --> K[Profile Routes /profile]
    F --> L[Document Route /document/:id]
    F --> M[View Profile /:identifier]
    
    G --> N[Landing.tsx]
    H --> O[AuthPage → Auth/]
    I --> P[VentureMatch Form]
    J --> Q[Dashboard.tsx]
    K --> R[ProfilePage.tsx]
    L --> S[DocumentViewerPage.tsx]
    M --> T[ViewProfilePage.tsx]
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style Q fill:#e8f5e8
    style P fill:#fff3e0
```

### 2. Authentication Component Hierarchy

```mermaid
graph TD
    A[pages/Auth.tsx] --> B[components/Auth/]
    
    B --> C[SignIn.tsx]
    B --> D[SignUp.tsx]
    B --> E[OAuthCallback.tsx]
    B --> F[RoleSelector.tsx]
    B --> G[AuthErrorDisplay.tsx]
    B --> H[Logo.tsx]
    
    C --> I[authService.login]
    D --> J[authService.register]
    E --> K[authService.updateRole]
    
    I --> L[services/api.ts]
    J --> L
    K --> L
    
    L --> M[API Interceptors]
    M --> N[CSRF Token Management]
    M --> O[Auth Token Management]
    
    style A fill:#fff3e0
    style B fill:#e1f5fe
    style L fill:#e8f5e8
```

### 3. Dashboard Component Architecture

```mermaid
graph TD
    A[pages/Dashboard.tsx] --> B[components/Dashboard/]
    
    B --> C[DashboardLayout.tsx]
    B --> D[AppHeader.tsx]
    
    C --> E[Overview/OverviewSection.tsx]
    C --> F[Matches/MatchesSection.tsx]
    C --> G[Analytics/AnalyticsSection.tsx]
    C --> H[Documents/DocumentsSection.tsx]
    
    F --> I[MatchesList.tsx]
    F --> J[SearchFilters.tsx]
    F --> K[CompatibilitySection.tsx]
    
    G --> L[AnalyticsTabs.tsx]
    G --> M[SelfAnalysisSection.tsx]
    
    H --> N[DocumentList.tsx]
    H --> O[useEntityDocuments hook]
    
    I --> P[Match Item Components]
    P --> Q[recommendationService]
    P --> R[compatibilityService]
    
    style A fill:#e3f2fd
    style C fill:#f1f8e9
    style F fill:#fce4ec
    style G fill:#fff8e1
    style H fill:#f3e5f5
```

### 4. Forms Component Structure

```mermaid
graph TD
    A[components/Forms/form.tsx] --> B[Form State Management]
    
    B --> C[User Type Selection]
    B --> D[Step Navigation]
    B --> E[Form Validation]
    
    C --> F[UserTypeSelection.tsx]
    D --> G[FormProgress.tsx]
    D --> H[FormNavigationFooter.tsx]
    D --> I[AnimatingTransition.tsx]
    
    A --> J[Form Components]
    J --> K[MultiSelectTile.tsx]
    J --> L[SelectInput.tsx]
    
    A --> M[Form Submission]
    M --> N{User Type?}
    N -->|startup| O[profileService.updateStartupProfile]
    N -->|investor| P[profileService.updateInvestorProfile]
    
    O --> Q[API: POST /profile/startup]
    P --> R[API: POST /profile/investor]
    
    style A fill:#fff3e0
    style B fill:#e8f5e8
    style J fill:#e1f5fe
    style M fill:#f3e5f5
```

### 5. Services Layer Architecture

```mermaid
graph TD
    A[services/] --> B[api.ts - Main API Client]
    A --> C[searchServices.ts]
    A --> D[recommendationService.ts]
    A --> E[legalDueDiligenceService.ts]
    
    B --> F[Axios Instance Configuration]
    B --> G[Request/Response Interceptors]
    B --> H[CSRF Token Management]
    B --> I[Error Handling]
    
    B --> J[Service Collections]
    J --> K[authService]
    J --> L[userService]
    J --> M[profileService]
    J --> N[beliefSystemService]
    J --> O[financialDueDiligenceService]
    J --> P[dashboardService]
    J --> Q[taskService]
    J --> R[messagesService]
    
    K --> S[Authentication Endpoints]
    L --> T[User Profile Endpoints]
    M --> U[Profile Management]
    M --> V[Document Management]
    N --> W[Belief System Analysis]
    O --> X[Financial Analysis]
    P --> Y[Dashboard Data]
    Q --> Z[Task Management]
    R --> AA[Messaging System]
    
    style A fill:#e8f5e8
    style B fill:#fff3e0
    style J fill:#e1f5fe
```

### 6. Hooks Architecture

```mermaid
graph TD
    A[hooks/] --> B[Custom Hooks Collection]
    
    B --> C[useDocumentViewer.ts]
    B --> D[useEntityDocuments.ts]
    B --> E[useFinancialDueDiligence.ts]
    B --> F[useBeliefSystemReport.ts]
    B --> G[useRecommendations.ts]
    B --> H[useTutorial.ts]
    B --> I[useSEO.ts]
    B --> J[useSectionInView.ts]
    
    C --> K[Document Fetching Logic]
    C --> L[Download Handling]
    C --> M[Analytics Tracking]
    
    D --> N[Entity Document Management]
    D --> O[Document Filtering]
    
    E --> P[Financial Report Generation]
    F --> Q[Belief System Analysis]
    G --> R[AI Recommendations]
    
    H --> S[Tutorial State Management]
    H --> T[Tutorial Progress Tracking]
    
    I --> U[SEO Metadata Management]
    J --> V[Viewport Intersection Logic]
    
    style A fill:#f1f8e9
    style B fill:#fff8e1
    style C fill:#e1f5fe
    style H fill:#fce4ec
```

### 7. Document Processing Flow

```mermaid
graph TD
    A[Document Upload Trigger] --> B[DocumentsSection.tsx]
    B --> C[File Selection UI]
    C --> D[profileService.uploadDocument]
    
    D --> E[FormData Creation]
    E --> F[Metadata Attachment]
    F --> G[API: POST /profile/documents/upload]
    
    G --> H[Backend Multer Processing]
    H --> I[File Storage System]
    I --> J[OCR Service Invocation]
    
    J --> K{File Type Detection}
    K -->|PDF| L[PDF OCR Processing]
    K -->|Image| M[Image OCR Processing]
    K -->|Other| N[Metadata Only Storage]
    
    L --> O[Text Extraction]
    M --> O
    N --> P[Skip OCR]
    
    O --> Q[OCR Results Storage]
    P --> R[Direct Metadata Storage]
    
    Q --> S[Database Document Record]
    R --> S
    
    S --> T[Response to Frontend]
    T --> U[Document List Refresh]
    U --> V[useEntityDocuments Hook Update]
    
    style A fill:#fff3e0
    style D fill:#e8f5e8
    style J fill:#ffecb3
    style L fill:#e1f5fe
    style M fill:#e1f5fe
```

### 8. Document Viewer Component Flow

```mermaid
graph TD
    A[DocumentViewerPage.tsx] --> B[useParams Hook]
    B --> C[Extract documentId]
    C --> D[useDocumentViewer Hook]
    
    D --> E[Document Fetch Logic]
    E --> F[API: GET /profile/documents/{id}]
    F --> G[Document Data Processing]
    
    A --> H[Document Display Logic]
    H --> I{File Type Switch}
    I -->|PDF| J[PDF Viewer Component]
    I -->|Image| K[Image Display Component]
    I -->|Other| L[Download Link Component]
    
    A --> M[User Actions]
    M --> N[Download Button]
    M --> O[Copy Link Button]
    M --> P[Document Navigation Dropdown]
    
    N --> Q[handleDownload Function]
    Q --> R[profileService.downloadDocument]
    R --> S[API: GET /profile/documents/{id}/download]
    
    O --> T[Copy to Clipboard]
    P --> U[Navigate to Other Documents]
    
    G --> V[Analytics Recording]
    V --> W[API: POST /analytics/document-view]
    Q --> X[API: POST /analytics/document-download]
    
    style A fill:#e3f2fd
    style D fill:#f1f8e9
    style H fill:#fff8e1
    style M fill:#fce4ec
    style V fill:#f3e5f5
```

### 9. Search and Matching System

```mermaid
graph TD
    A[Search Interface] --> B[SearchFilters Component]
    B --> C[Filter State Management]
    C --> D[industry, stage, location, keywords]
    
    A --> E[Search Execution]
    E --> F{User Role Determination}
    F -->|startup| G[searchInvestors Function]
    F -->|investor| H[searchStartups Function]
    
    G --> I[API: GET /search/investors]
    H --> J[API: GET /search/startups]
    
    I --> K[Investor Results Processing]
    J --> L[Startup Results Processing]
    
    K --> M[MatchesList Component]
    L --> M
    
    M --> N[Individual Match Items]
    N --> O[Match Selection]
    O --> P[Compatibility Analysis Trigger]
    
    P --> Q[fetchCompatibilityData]
    Q --> R[API: GET /score/compatibility/{startup}/{investor}]
    R --> S[CompatibilitySection Display]
    
    N --> T[Recommendation Trigger]
    T --> U[recommendationService.getMatchRecommendations]
    U --> V[API: GET /recommendations/match/{startup}/{investor}]
    
    style A fill:#e8f5e8
    style B fill:#fff3e0
    style E fill:#e1f5fe
    style M fill:#fce4ec
    style S fill:#f1f8e9
```

### 10. Context Providers and State Management

```mermaid
graph TD
    A[Application Context Layer] --> B[TutorialProvider]
    A --> C[ActiveSectionContextProvider]
    
    B --> D[Tutorial State Management]
    D --> E[activeTutorial]
    D --> F[currentStep]
    D --> G[completedTutorials]
    D --> H[disabledTutorials]
    
    B --> I[Tutorial Actions]
    I --> J[showTutorial]
    I --> K[hideTutorial]
    I --> L[nextStep/previousStep]
    I --> M[markCompleted]
    I --> N[resetTutorials]
    
    C --> O[Active Section Tracking]
    O --> P[Current Section State]
    O --> Q[Section Navigation]
    
    D --> R[localStorage Persistence]
    R --> S[completedTutorials Key]
    R --> T[disabledTutorials Key]
    
    style A fill:#e3f2fd
    style B fill:#fff8e1
    style C fill:#f1f8e9
    style D fill:#fce4ec
    style R fill:#f3e5f5
```

## Key Integration Points

### 1. API Integration Layer
- **api.ts** serves as the central API client
- All services extend from this base client
- Consistent error handling and interceptors
- CSRF token management
- Authentication token management

### 2. State Management Strategy
- **localStorage** for persistent data (auth, preferences)
- **React useState** for component-level state
- **Context API** for cross-component state (tutorials, active sections)
- **Custom hooks** for reusable stateful logic

### 3. Authentication Flow Integration
- Protected routes with authentication checks
- Profile completion verification
- Role-based navigation
- OAuth integration with callback handling

### 4. Document Management System
- Upload → OCR Processing → Storage → Analytics
- Multi-format support (PDF, images, documents)
- Real-time document viewing
- Download tracking and analytics

### 5. Search and Recommendation Engine
- Real-time search with filtering
- Compatibility scoring
- AI-powered recommendations
- Bookmark and matching system

This comprehensive frontend architecture provides a scalable, maintainable foundation for the venture matching platform with advanced document processing capabilities.

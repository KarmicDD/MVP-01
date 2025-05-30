```mermaid
flowchart TB
    %% Main Components
    Client([Client])
    ExpressApp[Express Application]
    Routes[API Routes]
    Controllers[Controllers]
    Services[Services]
    Middleware[Middleware]
    PostgreSQL[(PostgreSQL)]
    MongoDB[(MongoDB)]
    GeminiAI[Gemini AI]
    
    %% Middleware Components
    AuthMiddleware[Authentication Middleware]
    ErrorHandler[Error Handler]
    RateLimiter[Rate Limiter]
    RequestLogger[Request Logger]
    CORS[CORS]
    Helmet[Helmet]
    
    %% Route Components
    AuthRoutes[Auth Routes]
    UserRoutes[User Routes]
    ProfileRoutes[Profile Routes]
    MatchingRoutes[Matching Routes]
    CompatibilityRoutes[Compatibility Routes]
    QuestionnaireRoutes[Questionnaire Routes]
    BeliefSystemRoutes[Belief System Routes]
    EmailRoutes[Email Routes]
    SearchRoutes[Search Routes]
    FinancialRoutes[Financial Due Diligence Routes]
    RecommendationRoutes[Recommendation Routes]
    
    %% Controller Components
    AuthController[Auth Controller]
    UserController[User Controller]
    ProfileController[Profile Controller]
    MatchingController[Matching Controller]
    CompatibilityController[Compatibility Controller]
    QuestionnaireController[Questionnaire Controller]
    BeliefSystemController[Belief System Controller]
    EmailController[Email Controller]
    SearchController[Search Controller]
    FinancialController[Financial Due Diligence Controller]
    RecommendationController[Recommendation Controller]
    
    %% Service Components
    AuthService[Auth Service]
    UserService[User Service]
    ProfileService[Profile Service]
    MatchingService[ML Matching Service]
    CompatibilityService[Compatibility Service]
    QuestionnaireService[Questionnaire Service]
    BeliefSystemService[Belief System Service]
    EmailService[Email Service]
    SearchService[Search Service]
    DocumentProcessingService[Document Processing Service]
    EnhancedDocumentService[Enhanced Document Service]
    RecommendationService[Recommendation Service]
    
    %% Database Models
    UserModel[User Model]
    ProfileShareModel[Profile Share Model]
    StartupProfileModel[Startup Profile Model]
    InvestorProfileModel[Investor Profile Model]
    ExtendedProfileModel[Extended Profile Model]
    QuestionnaireModel[Questionnaire Submission Model]
    MatchAnalysisModel[Match Analysis Model]
    BeliefSystemModel[Belief System Analysis Model]
    DocumentModel[Document Model]
    ApiUsageModel[API Usage Model]
    FinancialReportModel[Financial Due Diligence Report Model]
    RecommendationModel[Recommendation Model]
    
    %% Main Flow
    Client -->|HTTP Request| ExpressApp
    ExpressApp -->|Process Request| Middleware
    Middleware -->|Route Request| Routes
    Routes -->|Handle Request| Controllers
    Controllers -->|Business Logic| Services
    Services -->|Data Access| PostgreSQL
    Services -->|Data Access| MongoDB
    Services -->|AI Processing| GeminiAI
    
    %% Middleware Flow
    Middleware -->|Security Headers| Helmet
    Middleware -->|Cross-Origin| CORS
    Middleware -->|Parse Cookies| Middleware
    Middleware -->|Parse JSON| Middleware
    Middleware -->|Authenticate| AuthMiddleware
    Middleware -->|Log Request| RequestLogger
    Middleware -->|Rate Limit| RateLimiter
    
    %% Error Handling
    Controllers -->|Errors| ErrorHandler
    Services -->|Errors| ErrorHandler
    ErrorHandler -->|Error Response| Client
    
    %% Routes Breakdown
    Routes -->|/api/auth/*| AuthRoutes
    Routes -->|/api/users/*| UserRoutes
    Routes -->|/api/profile/*| ProfileRoutes
    Routes -->|/api/matching/*| MatchingRoutes
    Routes -->|/api/score/*| CompatibilityRoutes
    Routes -->|/api/questionnaire/*| QuestionnaireRoutes
    Routes -->|/api/analysis/*| BeliefSystemRoutes
    Routes -->|/api/email/*| EmailRoutes
    Routes -->|/api/search/*| SearchRoutes
    Routes -->|/api/financial/*| FinancialRoutes
    Routes -->|/api/recommendations/*| RecommendationRoutes
    
    %% Controllers to Services
    AuthRoutes -->|Route to| AuthController
    UserRoutes -->|Route to| UserController
    ProfileRoutes -->|Route to| ProfileController
    MatchingRoutes -->|Route to| MatchingController
    CompatibilityRoutes -->|Route to| CompatibilityController
    QuestionnaireRoutes -->|Route to| QuestionnaireController
    BeliefSystemRoutes -->|Route to| BeliefSystemController
    EmailRoutes -->|Route to| EmailController
    SearchRoutes -->|Route to| SearchController
    FinancialRoutes -->|Route to| FinancialController
    RecommendationRoutes -->|Route to| RecommendationController
    
    %% Controllers to Services
    AuthController -->|Uses| AuthService
    UserController -->|Uses| UserService
    ProfileController -->|Uses| ProfileService
    ProfileController -->|Uses| DocumentProcessingService
    MatchingController -->|Uses| MatchingService
    CompatibilityController -->|Uses| CompatibilityService
    QuestionnaireController -->|Uses| QuestionnaireService
    BeliefSystemController -->|Uses| BeliefSystemService
    EmailController -->|Uses| EmailService
    SearchController -->|Uses| SearchService
    FinancialController -->|Uses| EnhancedDocumentService
    RecommendationController -->|Uses| RecommendationService
    
    %% Services to Models
    AuthService -->|Manages| UserModel
    ProfileService -->|Manages| StartupProfileModel
    ProfileService -->|Manages| InvestorProfileModel
    ProfileService -->|Manages| ExtendedProfileModel
    ProfileService -->|Manages| ProfileShareModel
    ProfileService -->|Manages| DocumentModel
    MatchingService -->|Uses| StartupProfileModel
    MatchingService -->|Uses| InvestorProfileModel
    MatchingService -->|Uses| QuestionnaireModel
    CompatibilityService -->|Uses| MatchAnalysisModel
    CompatibilityService -->|Uses| ApiUsageModel
    QuestionnaireService -->|Manages| QuestionnaireModel
    BeliefSystemService -->|Uses| BeliefSystemModel
    BeliefSystemService -->|Uses| ApiUsageModel
    SearchService -->|Queries| StartupProfileModel
    SearchService -->|Queries| InvestorProfileModel
    EnhancedDocumentService -->|Manages| DocumentModel
    EnhancedDocumentService -->|Creates| FinancialReportModel
    EnhancedDocumentService -->|Uses| ApiUsageModel
    RecommendationService -->|Manages| RecommendationModel
    RecommendationService -->|Uses| ApiUsageModel
    
    %% Authentication Flow
    subgraph AuthenticationFlow [Authentication Flow]
        Register[Register User]
        Login[Login User]
        OAuthLogin[OAuth Login]
        VerifyToken[Verify JWT Token]
        GenerateToken[Generate JWT Token]
        HashPassword[Hash Password]
        ComparePassword[Compare Password]
        StoreUser[Store User in PostgreSQL]
    end
    
    AuthController -->|New User| Register
    Register -->|Hash| HashPassword
    HashPassword -->|Store| StoreUser
    StoreUser -->|Generate| GenerateToken
    GenerateToken -->|Return Token| Client
    
    AuthController -->|Existing User| Login
    Login -->|Find User| UserModel
    Login -->|Verify| ComparePassword
    ComparePassword -->|Generate| GenerateToken
    
    AuthController -->|OAuth| OAuthLogin
    OAuthLogin -->|Find/Create User| UserModel
    OAuthLogin -->|Generate| GenerateToken
    
    AuthMiddleware -->|Extract Token| VerifyToken
    VerifyToken -->|Valid| Routes
    VerifyToken -->|Invalid| ErrorHandler
    
    %% Profile Management Flow
    subgraph ProfileFlow [Profile Management Flow]
        CreateProfile[Create Profile]
        UpdateProfile[Update Profile]
        GetProfile[Get Profile]
        ShareProfile[Share Profile]
        UploadDocument[Upload Document]
        ProcessDocument[Process Document]
        StoreDocument[Store Document]
    end
    
    ProfileController -->|Create/Update| CreateProfile
    CreateProfile -->|Store| StartupProfileModel
    CreateProfile -->|Store| InvestorProfileModel
    
    ProfileController -->|Get| GetProfile
    GetProfile -->|Retrieve| StartupProfileModel
    GetProfile -->|Retrieve| InvestorProfileModel
    
    ProfileController -->|Share| ShareProfile
    ShareProfile -->|Generate Token| ProfileShareModel
    
    ProfileController -->|Upload| UploadDocument
    UploadDocument -->|Process| ProcessDocument
    ProcessDocument -->|Extract Data| DocumentProcessingService
    ProcessDocument -->|Store| StoreDocument
    StoreDocument -->|Save Metadata| DocumentModel
    
    %% Matching Flow
    subgraph MatchingFlow [Matching Flow]
        FindMatches[Find Matches]
        FilterCandidates[Filter Candidates]
        RankMatches[Rank Matches]
        GenerateInsights[Generate Insights]
    end
    
    MatchingController -->|Find Matches| FindMatches
    FindMatches -->|Query| StartupProfileModel
    FindMatches -->|Query| InvestorProfileModel
    FindMatches -->|Filter| FilterCandidates
    FilterCandidates -->|Rank| RankMatches
    RankMatches -->|Generate| GenerateInsights
    GenerateInsights -->|Return| Client
    
    %% Compatibility Analysis Flow
    subgraph CompatibilityFlow [Compatibility Analysis Flow]
        CheckCache[Check Cache]
        GetProfiles[Get Profiles]
        AnalyzeCompatibility[Analyze Compatibility]
        GeneratePrompt[Generate Prompt]
        CallGemini[Call Gemini AI]
        ParseResponse[Parse Response]
        StoreResults[Store Results]
        TrackUsage[Track API Usage]
    end
    
    CompatibilityController -->|Analyze| CheckCache
    CheckCache -->|Cache Miss| GetProfiles
    CheckCache -->|Cache Hit| Client
    GetProfiles -->|Retrieve| StartupProfileModel
    GetProfiles -->|Retrieve| InvestorProfileModel
    GetProfiles -->|Analyze| AnalyzeCompatibility
    AnalyzeCompatibility -->|Generate| GeneratePrompt
    GeneratePrompt -->|Call| CallGemini
    CallGemini -->|Parse| ParseResponse
    ParseResponse -->|Store| StoreResults
    StoreResults -->|Save| MatchAnalysisModel
    StoreResults -->|Track| TrackUsage
    TrackUsage -->|Update| ApiUsageModel
    StoreResults -->|Return| Client
    
    %% Belief System Analysis Flow
    subgraph BeliefSystemFlow [Belief System Analysis Flow]
        CheckBeliefCache[Check Cache]
        GetBeliefProfiles[Get Profiles]
        AnalyzeBeliefs[Analyze Beliefs]
        GenerateBeliefPrompt[Generate Prompt]
        CallBeliefGemini[Call Gemini AI]
        ParseBeliefResponse[Parse Response]
        StoreBeliefResults[Store Results]
        TrackBeliefUsage[Track API Usage]
    end
    
    BeliefSystemController -->|Analyze| CheckBeliefCache
    CheckBeliefCache -->|Cache Miss| GetBeliefProfiles
    CheckBeliefCache -->|Cache Hit| Client
    GetBeliefProfiles -->|Retrieve| StartupProfileModel
    GetBeliefProfiles -->|Retrieve| InvestorProfileModel
    GetBeliefProfiles -->|Retrieve| QuestionnaireModel
    GetBeliefProfiles -->|Analyze| AnalyzeBeliefs
    AnalyzeBeliefs -->|Generate| GenerateBeliefPrompt
    GenerateBeliefPrompt -->|Call| CallBeliefGemini
    CallBeliefGemini -->|Parse| ParseBeliefResponse
    ParseBeliefResponse -->|Store| StoreBeliefResults
    StoreBeliefResults -->|Save| BeliefSystemModel
    StoreBeliefResults -->|Track| TrackBeliefUsage
    TrackBeliefUsage -->|Update| ApiUsageModel
    StoreBeliefResults -->|Return| Client
    
    %% Financial Due Diligence Flow
    subgraph FinancialFlow [Financial Due Diligence Flow]
        CheckFinancialCache[Check Cache]
        GetDocuments[Get Documents]
        ProcessDocuments[Process Documents]
        ExtractFinancialData[Extract Financial Data]
        AnalyzeFinancials[Analyze Financials]
        GenerateFinancialPrompt[Generate Prompt]
        CallFinancialGemini[Call Gemini AI]
        ParseFinancialResponse[Parse Response]
        StoreFinancialResults[Store Results]
        TrackFinancialUsage[Track API Usage]
    end
    
    FinancialController -->|Analyze| CheckFinancialCache
    CheckFinancialCache -->|Cache Miss| GetDocuments
    CheckFinancialCache -->|Cache Hit| Client
    GetDocuments -->|Retrieve| DocumentModel
    GetDocuments -->|Process| ProcessDocuments
    ProcessDocuments -->|Extract| ExtractFinancialData
    ExtractFinancialData -->|Analyze| AnalyzeFinancials
    AnalyzeFinancials -->|Generate| GenerateFinancialPrompt
    GenerateFinancialPrompt -->|Call| CallFinancialGemini
    CallFinancialGemini -->|Parse| ParseFinancialResponse
    ParseFinancialResponse -->|Store| StoreFinancialResults
    StoreFinancialResults -->|Save| FinancialReportModel
    StoreFinancialResults -->|Track| TrackFinancialUsage
    TrackFinancialUsage -->|Update| ApiUsageModel
    StoreFinancialResults -->|Return| Client
    
    %% Recommendation Flow
    subgraph RecommendationFlow [Recommendation Flow]
        CheckRecommendationCache[Check Cache]
        GetRecommendationProfiles[Get Profiles]
        AnalyzeForRecommendations[Analyze for Recommendations]
        GenerateRecommendationPrompt[Generate Prompt]
        CallRecommendationGemini[Call Gemini AI]
        ParseRecommendationResponse[Parse Response]
        StoreRecommendationResults[Store Results]
        TrackRecommendationUsage[Track API Usage]
    end
    
    RecommendationController -->|Get Recommendations| CheckRecommendationCache
    CheckRecommendationCache -->|Cache Miss| GetRecommendationProfiles
    CheckRecommendationCache -->|Cache Hit| Client
    GetRecommendationProfiles -->|Retrieve| StartupProfileModel
    GetRecommendationProfiles -->|Retrieve| InvestorProfileModel
    GetRecommendationProfiles -->|Analyze| AnalyzeForRecommendations
    AnalyzeForRecommendations -->|Generate| GenerateRecommendationPrompt
    GenerateRecommendationPrompt -->|Call| CallRecommendationGemini
    CallRecommendationGemini -->|Parse| ParseRecommendationResponse
    ParseRecommendationResponse -->|Store| StoreRecommendationResults
    StoreRecommendationResults -->|Save| RecommendationModel
    StoreRecommendationResults -->|Track| TrackRecommendationUsage
    TrackRecommendationUsage -->|Update| ApiUsageModel
    StoreRecommendationResults -->|Return| Client
    
    %% Search Flow
    subgraph SearchFlow [Search Flow]
        ParseSearchQuery[Parse Search Query]
        BuildMongoQuery[Build MongoDB Query]
        ExecuteSearch[Execute Search]
        FormatResults[Format Results]
    end
    
    SearchController -->|Search| ParseSearchQuery
    ParseSearchQuery -->|Build Query| BuildMongoQuery
    BuildMongoQuery -->|Execute| ExecuteSearch
    ExecuteSearch -->|Query| StartupProfileModel
    ExecuteSearch -->|Query| InvestorProfileModel
    ExecuteSearch -->|Format| FormatResults
    FormatResults -->|Return| Client
    
    %% Questionnaire Flow
    subgraph QuestionnaireFlow [Questionnaire Flow]
        SaveDraft[Save Draft]
        SubmitQuestionnaire[Submit Questionnaire]
        GetResponses[Get Responses]
        AnalyzeResponses[Analyze Responses]
    end
    
    QuestionnaireController -->|Save Draft| SaveDraft
    SaveDraft -->|Store| QuestionnaireModel
    
    QuestionnaireController -->|Submit| SubmitQuestionnaire
    SubmitQuestionnaire -->|Store| QuestionnaireModel
    SubmitQuestionnaire -->|Analyze| AnalyzeResponses
    AnalyzeResponses -->|Update| QuestionnaireModel
    
    QuestionnaireController -->|Get| GetResponses
    GetResponses -->|Retrieve| QuestionnaireModel
    GetResponses -->|Return| Client
    
    %% Rate Limiting Flow
    subgraph RateLimitingFlow [Rate Limiting Flow]
        CheckUsage[Check API Usage]
        IncrementCounter[Increment Counter]
        EnforceLimit[Enforce Limit]
        ResetCounter[Reset Counter Daily]
    end
    
    RateLimiter -->|Check| CheckUsage
    CheckUsage -->|Query| ApiUsageModel
    CheckUsage -->|Under Limit| IncrementCounter
    CheckUsage -->|Over Limit| EnforceLimit
    IncrementCounter -->|Update| ApiUsageModel
    EnforceLimit -->|Block Request| ErrorHandler
    ApiUsageModel -->|Daily| ResetCounter
    
    %% Styling
    classDef component fill:#f9f9f9,stroke:#333,stroke-width:1px;
    classDef database fill:#f5f5f5,stroke:#333,stroke-width:1px;
    classDef service fill:#e1f5fe,stroke:#0288d1,stroke-width:1px;
    classDef middleware fill:#e8f5e9,stroke:#388e3c,stroke-width:1px;
    classDef route fill:#fff8e1,stroke:#ffa000,stroke-width:1px;
    classDef controller fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px;
    classDef model fill:#fce4ec,stroke:#c2185b,stroke-width:1px;
    classDef ai fill:#e0f7fa,stroke:#00acc1,stroke-width:1px;
    
    class ExpressApp,Client component;
    class PostgreSQL,MongoDB database;
    class Services,AuthService,UserService,ProfileService,MatchingService,CompatibilityService,QuestionnaireService,BeliefSystemService,EmailService,SearchService,DocumentProcessingService,EnhancedDocumentService,RecommendationService service;
    class Middleware,AuthMiddleware,ErrorHandler,RateLimiter,RequestLogger,CORS,Helmet middleware;
    class Routes,AuthRoutes,UserRoutes,ProfileRoutes,MatchingRoutes,CompatibilityRoutes,QuestionnaireRoutes,BeliefSystemRoutes,EmailRoutes,SearchRoutes,FinancialRoutes,RecommendationRoutes route;
    class Controllers,AuthController,UserController,ProfileController,MatchingController,CompatibilityController,QuestionnaireController,BeliefSystemController,EmailController,SearchController,FinancialController,RecommendationController controller;
    class UserModel,ProfileShareModel,StartupProfileModel,InvestorProfileModel,ExtendedProfileModel,QuestionnaireModel,MatchAnalysisModel,BeliefSystemModel,DocumentModel,ApiUsageModel,FinancialReportModel,RecommendationModel model;
    class GeminiAI ai;
    
    %% Subgraph Styling
    style AuthenticationFlow fill:#f9f9f9,stroke:#333,stroke-width:1px;
    style ProfileFlow fill:#f9f9f9,stroke:#333,stroke-width:1px;
    style MatchingFlow fill:#f9f9f9,stroke:#333,stroke-width:1px;
    style CompatibilityFlow fill:#f9f9f9,stroke:#333,stroke-width:1px;
    style BeliefSystemFlow fill:#f9f9f9,stroke:#333,stroke-width:1px;
    style FinancialFlow fill:#f9f9f9,stroke:#333,stroke-width:1px;
    style RecommendationFlow fill:#f9f9f9,stroke:#333,stroke-width:1px;
    style SearchFlow fill:#f9f9f9,stroke:#333,stroke-width:1px;
    style QuestionnaireFlow fill:#f9f9f9,stroke:#333,stroke-width:1px;
    style RateLimitingFlow fill:#f9f9f9,stroke:#333,stroke-width:1px;
```

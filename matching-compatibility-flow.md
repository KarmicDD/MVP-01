```mermaid
flowchart TB
    %% Main Components
    User([User])
    FrontendComponents[Frontend Components]
    MatchingService[Frontend Matching Service]
    CompatibilityService[Frontend Compatibility Service]
    AxiosClient[Axios HTTP Client]
    BackendController[Backend Controller]
    MLMatchingService[ML Matching Service]
    GeminiAI[Gemini AI]
    MongoDB[(MongoDB Database)]
    
    %% Frontend Components
    MatchesPage[Matches Page]
    MatchCard[Match Card]
    AnalysisPage[Analysis Page]
    CompatibilityReport[Compatibility Report]
    RecommendationsPanel[Recommendations Panel]
    
    %% Frontend State Components
    LoadingState[Loading State]
    MatchesState[Matches State]
    CompatibilityState[Compatibility State]
    ErrorState[Error State]
    
    %% Backend Components
    MatchingController[Matching Controller]
    CompatibilityController[Compatibility Controller]
    RecommendationController[Recommendation Controller]
    
    %% Database Models
    StartupProfileModel[Startup Profile Model]
    InvestorProfileModel[Investor Profile Model]
    MatchCacheModel[Match Cache Model]
    CompatibilityAnalysisModel[Compatibility Analysis Model]
    RecommendationModel[Recommendation Model]
    
    %% Match Finding Flow
    subgraph MatchFindingFlow [Match Finding Flow]
        RequestMatches[Request Matches]
        FetchMatchesAPI[Fetch Matches API Call]
        ExtractUserID[Extract User ID]
        GetUserProfile[Get User Profile]
        CheckCachedMatches[Check Cached Matches]
        FindPotentialMatches[Find Potential Matches]
        ApplyFilterCriteria[Apply Filter Criteria]
        PrepareMatchingData[Prepare Matching Data]
        GenerateAIPrompt[Generate AI Prompt]
        ScoreMatches[Score Matches]
        ParseAIResponse[Parse AI Response]
        SortMatches[Sort Matches by Score]
        CacheMatchResults[Cache Match Results]
        ReturnMatches[Return Matches]
        DisplayMatches[Display Matches]
    end
    
    %% Compatibility Analysis Flow
    subgraph CompatibilityFlow [Compatibility Analysis Flow]
        SelectMatch[Select Match for Analysis]
        RequestCompatibility[Request Compatibility Analysis]
        FetchCompatibilityAPI[Fetch Compatibility API Call]
        CheckCachedAnalysis[Check Cached Analysis]
        GetProfiles[Get Startup & Investor Profiles]
        GetQuestionnaires[Get Questionnaire Responses]
        PrepareAnalysisData[Prepare Analysis Data]
        GenerateAnalysisPrompt[Generate Analysis Prompt]
        PerformAnalysis[Perform Compatibility Analysis]
        ParseAnalysisResponse[Parse Analysis Response]
        CacheAnalysisResults[Cache Analysis Results]
        ReturnAnalysis[Return Analysis]
        DisplayAnalysis[Display Analysis]
    end
    
    %% Recommendation Flow
    subgraph RecommendationFlow [Recommendation Generation Flow]
        RequestRecommendations[Request Recommendations]
        FetchRecommendationsAPI[Fetch Recommendations API Call]
        CheckCachedRecommendations[Check Cached Recommendations]
        GetCompatibilityData[Get Compatibility Data]
        PrepareRecommendationData[Prepare Recommendation Data]
        GenerateRecommendationPrompt[Generate Recommendation Prompt]
        GenerateRecommendations[Generate Recommendations]
        ParseRecommendationResponse[Parse Recommendation Response]
        CacheRecommendations[Cache Recommendations]
        ReturnRecommendations[Return Recommendations]
        DisplayRecommendations[Display Recommendations]
    end
    
    %% Main Flow
    User -->|Views Matches Dashboard| FrontendComponents
    FrontendComponents -->|Renders| MatchesPage
    
    %% Match Finding Flow Connections
    MatchesPage -->|Initiates| RequestMatches
    RequestMatches -->|Sets| LoadingState
    RequestMatches -->|Calls Service Method| MatchingService
    MatchingService -->|Makes API Call| FetchMatchesAPI
    FetchMatchesAPI -->|GET /matching/{role}| AxiosClient
    AxiosClient -->|Sends Request| BackendController
    BackendController -->|Routes to| MatchingController
    
    %% Backend Match Finding Process
    MatchingController -->|Extracts from JWT| ExtractUserID
    ExtractUserID -->|Gets User Profile| GetUserProfile
    GetUserProfile -->|Queries| StartupProfileModel
    StartupProfileModel -->|Returns Profile| GetUserProfile
    GetUserProfile -->|Checks Cache| CheckCachedMatches
    CheckCachedMatches -->|Queries| MatchCacheModel
    
    %% Cache Hit Path
    MatchCacheModel -->|Cache Hit| ReturnMatches
    
    %% Cache Miss Path
    MatchCacheModel -->|Cache Miss| FindPotentialMatches
    FindPotentialMatches -->|Applies Criteria| ApplyFilterCriteria
    ApplyFilterCriteria -->|Queries| InvestorProfileModel
    InvestorProfileModel -->|Returns Matches| ApplyFilterCriteria
    
    %% AI Scoring Path
    ApplyFilterCriteria -->|Prepares Data| PrepareMatchingData
    PrepareMatchingData -->|Creates Prompt| GenerateAIPrompt
    GenerateAIPrompt -->|Sends to| MLMatchingService
    MLMatchingService -->|Calls| GeminiAI
    GeminiAI -->|Returns Scores| ParseAIResponse
    ParseAIResponse -->|Processes Response| SortMatches
    SortMatches -->|Ranks Matches| CacheMatchResults
    CacheMatchResults -->|Stores in| MatchCacheModel
    CacheMatchResults -->|Formats Response| ReturnMatches
    
    %% Frontend Response Handling
    ReturnMatches -->|Returns to| AxiosClient
    AxiosClient -->|Returns to| MatchingService
    MatchingService -->|Processes Data| MatchesState
    MatchesState -->|Updates| MatchesPage
    MatchesPage -->|Clears| LoadingState
    MatchesPage -->|Renders| MatchCard
    MatchCard -->|Displays to| User
    
    %% Compatibility Analysis Flow Connections
    MatchCard -->|User Selects| SelectMatch
    SelectMatch -->|Navigates to| AnalysisPage
    AnalysisPage -->|Initiates| RequestCompatibility
    RequestCompatibility -->|Sets| LoadingState
    RequestCompatibility -->|Calls Service Method| CompatibilityService
    CompatibilityService -->|Makes API Call| FetchCompatibilityAPI
    FetchCompatibilityAPI -->|GET /score/compatibility/{startupId}/{investorId}| AxiosClient
    AxiosClient -->|Sends Request| BackendController
    BackendController -->|Routes to| CompatibilityController
    
    %% Backend Compatibility Analysis Process
    CompatibilityController -->|Checks Cache| CheckCachedAnalysis
    CheckCachedAnalysis -->|Queries| CompatibilityAnalysisModel
    
    %% Cache Hit Path
    CompatibilityAnalysisModel -->|Cache Hit| ReturnAnalysis
    
    %% Cache Miss Path
    CompatibilityAnalysisModel -->|Cache Miss| GetProfiles
    GetProfiles -->|Get Startup Profile| StartupProfileModel
    GetProfiles -->|Get Investor Profile| InvestorProfileModel
    StartupProfileModel -->|Returns Profile| GetProfiles
    InvestorProfileModel -->|Returns Profile| GetProfiles
    GetProfiles -->|Get Questionnaires| GetQuestionnaires
    GetQuestionnaires -->|Queries Questionnaires| MongoDB
    MongoDB -->|Returns Questionnaires| GetQuestionnaires
    GetQuestionnaires -->|Prepares Data| PrepareAnalysisData
    PrepareAnalysisData -->|Creates Prompt| GenerateAnalysisPrompt
    GenerateAnalysisPrompt -->|Sends to| GeminiAI
    GeminiAI -->|Performs Analysis| PerformAnalysis
    PerformAnalysis -->|Returns Analysis| ParseAnalysisResponse
    ParseAnalysisResponse -->|Processes Response| CacheAnalysisResults
    CacheAnalysisResults -->|Stores in| CompatibilityAnalysisModel
    CacheAnalysisResults -->|Formats Response| ReturnAnalysis
    
    %% Frontend Compatibility Response Handling
    ReturnAnalysis -->|Returns to| AxiosClient
    AxiosClient -->|Returns to| CompatibilityService
    CompatibilityService -->|Processes Data| CompatibilityState
    CompatibilityState -->|Updates| AnalysisPage
    AnalysisPage -->|Clears| LoadingState
    AnalysisPage -->|Renders| CompatibilityReport
    CompatibilityReport -->|Displays to| User
    
    %% Recommendation Flow Connections
    CompatibilityReport -->|Initiates| RequestRecommendations
    RequestRecommendations -->|Calls Service Method| CompatibilityService
    CompatibilityService -->|Makes API Call| FetchRecommendationsAPI
    FetchRecommendationsAPI -->|GET /recommendations/{startupId}/{investorId}| AxiosClient
    AxiosClient -->|Sends Request| BackendController
    BackendController -->|Routes to| RecommendationController
    
    %% Backend Recommendation Process
    RecommendationController -->|Checks Cache| CheckCachedRecommendations
    CheckCachedRecommendations -->|Queries| RecommendationModel
    
    %% Cache Hit Path
    RecommendationModel -->|Cache Hit| ReturnRecommendations
    
    %% Cache Miss Path
    RecommendationModel -->|Cache Miss| GetCompatibilityData
    GetCompatibilityData -->|Queries| CompatibilityAnalysisModel
    CompatibilityAnalysisModel -->|Returns Analysis| GetCompatibilityData
    GetCompatibilityData -->|Prepares Data| PrepareRecommendationData
    PrepareRecommendationData -->|Creates Prompt| GenerateRecommendationPrompt
    GenerateRecommendationPrompt -->|Sends to| GeminiAI
    GeminiAI -->|Generates Recommendations| GenerateRecommendations
    GenerateRecommendations -->|Returns Recommendations| ParseRecommendationResponse
    ParseRecommendationResponse -->|Processes Response| CacheRecommendations
    CacheRecommendations -->|Stores in| RecommendationModel
    CacheRecommendations -->|Formats Response| ReturnRecommendations
    
    %% Frontend Recommendation Response Handling
    ReturnRecommendations -->|Returns to| AxiosClient
    AxiosClient -->|Returns to| CompatibilityService
    CompatibilityService -->|Processes Data| CompatibilityState
    CompatibilityState -->|Updates| AnalysisPage
    AnalysisPage -->|Renders| RecommendationsPanel
    RecommendationsPanel -->|Displays to| User
    
    %% Error Handling
    subgraph ErrorHandlingFlow [Error Handling Flow]
        BackendError[Backend Error]
        GlobalErrorHandler[Global Error Handler]
        ErrorResponse[Error Response]
        AxiosErrorInterceptor[Axios Error Interceptor]
        ServiceErrorHandler[Service Error Handler]
        ComponentErrorHandler[Component Error Handler]
        DisplayErrorMessage[Display Error Message]
    end
    
    MatchingController -->|Error Occurs| BackendError
    CompatibilityController -->|Error Occurs| BackendError
    RecommendationController -->|Error Occurs| BackendError
    BackendError -->|Caught by| GlobalErrorHandler
    GlobalErrorHandler -->|Formats| ErrorResponse
    ErrorResponse -->|Sent to| AxiosErrorInterceptor
    AxiosErrorInterceptor -->|Processes| ServiceErrorHandler
    ServiceErrorHandler -->|Passes to| ComponentErrorHandler
    ComponentErrorHandler -->|Updates| ErrorState
    ErrorState -->|Triggers| DisplayErrorMessage
    DisplayErrorMessage -->|Shows to| User
    
    %% Detailed AI Prompt Generation
    subgraph AIPromptGeneration [AI Prompt Generation Details]
        MatchPrompt[Match Scoring Prompt]
        CompatibilityPrompt[Compatibility Analysis Prompt]
        RecommendationPrompt[Recommendation Generation Prompt]
        PromptTemplates[Prompt Templates]
        DataInjection[Data Injection]
        StructuredOutputFormat[Structured Output Format]
    end
    
    GenerateAIPrompt -->|Creates| MatchPrompt
    GenerateAnalysisPrompt -->|Creates| CompatibilityPrompt
    GenerateRecommendationPrompt -->|Creates| RecommendationPrompt
    PromptTemplates -->|Provides Template for| MatchPrompt
    PromptTemplates -->|Provides Template for| CompatibilityPrompt
    PromptTemplates -->|Provides Template for| RecommendationPrompt
    DataInjection -->|Injects Data into| MatchPrompt
    DataInjection -->|Injects Data into| CompatibilityPrompt
    DataInjection -->|Injects Data into| RecommendationPrompt
    StructuredOutputFormat -->|Defines Output for| MatchPrompt
    StructuredOutputFormat -->|Defines Output for| CompatibilityPrompt
    StructuredOutputFormat -->|Defines Output for| RecommendationPrompt
    
    %% Styling
    classDef component fill:#f9f9f9,stroke:#333,stroke-width:1px;
    classDef database fill:#f5f5f5,stroke:#333,stroke-width:1px;
    classDef service fill:#e1f5fe,stroke:#0288d1,stroke-width:1px;
    classDef ai fill:#e8f5e9,stroke:#388e3c,stroke-width:1px;
    classDef state fill:#fff8e1,stroke:#ffa000,stroke-width:1px;
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:1px;
    classDef flow fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px;
    
    class FrontendComponents,MatchesPage,MatchCard,AnalysisPage,CompatibilityReport,RecommendationsPanel component;
    class MongoDB,StartupProfileModel,InvestorProfileModel,MatchCacheModel,CompatibilityAnalysisModel,RecommendationModel database;
    class MatchingService,CompatibilityService,AxiosClient,BackendController,MatchingController,CompatibilityController,RecommendationController service;
    class MLMatchingService,GeminiAI,MatchPrompt,CompatibilityPrompt,RecommendationPrompt,PromptTemplates,DataInjection,StructuredOutputFormat ai;
    class LoadingState,MatchesState,CompatibilityState,ErrorState state;
    class BackendError,GlobalErrorHandler,ErrorResponse,AxiosErrorInterceptor,ServiceErrorHandler,ComponentErrorHandler,DisplayErrorMessage error;
    
    %% Subgraph Styling
    style MatchFindingFlow fill:#f9f9f9,stroke:#333,stroke-width:1px;
    style CompatibilityFlow fill:#f9f9f9,stroke:#333,stroke-width:1px;
    style RecommendationFlow fill:#f9f9f9,stroke:#333,stroke-width:1px;
    style ErrorHandlingFlow fill:#ffebee,stroke:#c62828,stroke-width:1px;
    style AIPromptGeneration fill:#e8f5e9,stroke:#388e3c,stroke-width:1px;
```

```mermaid
flowchart TB
    %% Main Components
    User([User])
    FrontendComponents[Frontend Components]
    ProfileForm[Profile Form]
    ProfileService[Frontend Profile Service]
    AxiosClient[Axios HTTP Client]
    BackendController[Backend Controller]
    BackendService[Backend Service]
    PostgreSQL[(PostgreSQL Database)]
    MongoDB[(MongoDB Database)]
    
    %% Form Components
    FormFields[Form Fields]
    FormValidation[Form Validation]
    FormSubmission[Form Submission]
    
    %% Frontend State Components
    LoadingState[Loading State]
    ProfileState[Profile State]
    ErrorState[Error State]
    ToastNotification[Toast Notification]
    
    %% Backend Validation Components
    TokenExtraction[Token Extraction]
    UserExtraction[User Extraction]
    InputValidation[Input Validation]
    
    %% Database Operations
    CheckExistingProfile[Check Existing Profile]
    CreateProfile[Create New Profile]
    UpdateProfile[Update Existing Profile]
    UpdateCompletionStatus[Update Completion Status]
    
    %% Profile Types
    StartupProfile[Startup Profile]
    InvestorProfile[Investor Profile]
    
    %% Profile Retrieval Components
    ProfileRetrieval[Profile Retrieval]
    ProfileDisplay[Profile Display]
    CompletionPercentage[Completion Percentage]
    
    %% Main Flow
    User -->|Navigates to Profile Form| FrontendComponents
    FrontendComponents -->|Renders Form| ProfileForm
    
    %% Form Completion Flow
    ProfileForm -->|Contains| FormFields
    FormFields -->|User Input| FormValidation
    FormValidation -->|Validates Required Fields| FormValidation
    FormValidation -->|Validates Field Formats| FormValidation
    FormValidation -->|Shows Validation Errors| FormFields
    FormValidation -->|Valid Form| FormSubmission
    
    %% Form Submission Flow
    FormSubmission -->|Sets| LoadingState
    FormSubmission -->|Calls Service Method| ProfileService
    
    %% Service Layer Flow
    ProfileService -->|Prepares Request| ProfileService
    ProfileService -->|Determines Endpoint| ProfileService
    
    %% Startup vs Investor Path
    ProfileService -->|Startup Profile| StartupProfilePath[POST /profile/startup]
    ProfileService -->|Investor Profile| InvestorProfilePath[POST /profile/investor]
    
    %% Axios Request Flow
    StartupProfilePath -->|API Request| AxiosClient
    InvestorProfilePath -->|API Request| AxiosClient
    AxiosClient -->|Adds Auth Token| AxiosClient
    AxiosClient -->|Sends HTTP Request| BackendController
    
    %% Backend Controller Flow
    BackendController -->|Receives Request| TokenExtraction
    TokenExtraction -->|Extracts JWT Token| UserExtraction
    UserExtraction -->|Gets User ID| InputValidation
    InputValidation -->|Validates Required Fields| InputValidation
    
    %% Backend Validation Branches
    InputValidation -->|Invalid Input| ValidationError[Return 400 Bad Request]
    ValidationError -->|Error Response| AxiosClient
    
    %% Database Check Flow
    InputValidation -->|Valid Input| CheckExistingProfile
    CheckExistingProfile -->|Query by User ID| MongoDB
    
    %% Profile Creation/Update Flow
    MongoDB -->|Profile Exists| UpdateProfile
    MongoDB -->|No Profile| CreateProfile
    
    %% Update Profile Flow
    UpdateProfile -->|Update Document| MongoDB
    UpdateProfile -->|Set Updated Timestamp| MongoDB
    
    %% Create Profile Flow
    CreateProfile -->|Insert Document| MongoDB
    CreateProfile -->|Set Created Timestamp| MongoDB
    CreateProfile -->|Set Updated Timestamp| MongoDB
    
    %% Profile Completion Status Update
    UpdateProfile -->|Profile Updated| UpdateCompletionStatus
    CreateProfile -->|Profile Created| UpdateCompletionStatus
    UpdateCompletionStatus -->|Update User Record| PostgreSQL
    PostgreSQL -->|Status Updated| BackendController
    
    %% Response Flow
    MongoDB -->|Profile Saved| BackendController
    BackendController -->|Formats Response| BackendController
    BackendController -->|Returns Profile Data| AxiosClient
    AxiosClient -->|Response Data| ProfileService
    
    %% Frontend Response Handling
    ProfileService -->|Process Response| ProfileService
    ProfileService -->|Returns Profile Data| FormSubmission
    FormSubmission -->|Updates| ProfileState
    FormSubmission -->|Clears| LoadingState
    FormSubmission -->|Shows| ToastNotification
    FormSubmission -->|Redirects to Dashboard| FrontendComponents
    
    %% Profile Retrieval Flow
    subgraph ProfileRetrievalFlow [Profile Retrieval Flow]
        GetProfileRequest[Get Profile Request]
        ProfileRetrievalService[Profile Retrieval Service]
        GetProfileEndpoint[GET /profile/{type}/{id}]
        ProfileRetrievalController[Profile Retrieval Controller]
        FindProfileQuery[Find Profile Query]
        TransformProfileData[Transform Profile Data]
        ReturnProfileData[Return Profile Data]
    end
    
    FrontendComponents -->|Dashboard Load| GetProfileRequest
    GetProfileRequest -->|Call Service Method| ProfileRetrievalService
    ProfileRetrievalService -->|API Request| GetProfileEndpoint
    GetProfileEndpoint -->|Backend Request| ProfileRetrievalController
    ProfileRetrievalController -->|Query Database| FindProfileQuery
    FindProfileQuery -->|Find by User ID| MongoDB
    MongoDB -->|Profile Document| TransformProfileData
    TransformProfileData -->|Format Data| ReturnProfileData
    ReturnProfileData -->|Profile Data| ProfileRetrievalService
    ProfileRetrievalService -->|Processed Data| ProfileDisplay
    ProfileDisplay -->|Renders Profile| FrontendComponents
    ProfileDisplay -->|Calculates| CompletionPercentage
    
    %% Error Handling Flow
    subgraph ErrorHandlingFlow [Error Handling Flow]
        ServiceError[Service Error]
        AxiosErrorInterceptor[Axios Error Interceptor]
        HandleApiError[Handle API Error]
        DisplayError[Display Error]
    end
    
    BackendController -->|Error Occurs| ServiceError
    ServiceError -->|Error Response| AxiosErrorInterceptor
    AxiosErrorInterceptor -->|Processes Error| HandleApiError
    HandleApiError -->|Formats Error Message| DisplayError
    DisplayError -->|Updates| ErrorState
    DisplayError -->|Shows| ToastNotification
    
    %% Profile Data Usage
    subgraph ProfileDataUsage [Profile Data Usage]
        MatchingAlgorithm[Matching Algorithm]
        CompatibilityScoring[Compatibility Scoring]
        DueDiligenceReports[Due Diligence Reports]
    end
    
    MongoDB -->|Profile Data Used In| MatchingAlgorithm
    MongoDB -->|Profile Data Used In| CompatibilityScoring
    MongoDB -->|Profile Data Used In| DueDiligenceReports
    
    %% Styling
    classDef component fill:#f9f9f9,stroke:#333,stroke-width:1px;
    classDef database fill:#f5f5f5,stroke:#333,stroke-width:1px;
    classDef form fill:#e1f5fe,stroke:#0288d1,stroke-width:1px;
    classDef validation fill:#e8f5e9,stroke:#388e3c,stroke-width:1px;
    classDef state fill:#fff8e1,stroke:#ffa000,stroke-width:1px;
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:1px;
    classDef profile fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px;
    
    class FrontendComponents,ProfileService,AxiosClient,BackendController,BackendService component;
    class PostgreSQL,MongoDB database;
    class ProfileForm,FormFields,FormSubmission form;
    class FormValidation,InputValidation,TokenExtraction,UserExtraction validation;
    class LoadingState,ProfileState,ErrorState,ToastNotification state;
    class ValidationError,ServiceError,AxiosErrorInterceptor,HandleApiError,DisplayError error;
    class StartupProfile,InvestorProfile,ProfileDisplay,CompletionPercentage profile;
    
    %% Subgraph Styling
    style ProfileRetrievalFlow fill:#f9f9f9,stroke:#333,stroke-width:1px;
    style ErrorHandlingFlow fill:#ffebee,stroke:#c62828,stroke-width:1px;
    style ProfileDataUsage fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px;
```

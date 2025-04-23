```mermaid
flowchart TB
    %% Main Components
    User([User])
    UserInterface[User Interface]
    FrontendClient[Frontend Client]
    BackendServer[Backend Server]
    PostgreSQL[(PostgreSQL Database)]
    MongoDB[(MongoDB Database)]
    OAuthProvider[OAuth Provider\nGoogle/LinkedIn]
    
    %% Registration Flow Components
    subgraph RegistrationFlow [Email/Password Registration Flow]
        RegForm[Registration Form]
        RegFormValidation[Form Validation]
        RegApiCall[API Call]
        RegBackendValidation[Backend Validation]
        RegCheckExisting[Check Existing User]
        RegPasswordHash[Password Hashing]
        RegCreateUser[Create User Record]
        RegGenerateToken[Generate JWT Token]
        RegSendResponse[Send Response]
        RegStoreToken[Store Token]
        RegRedirect[Redirect to Profile Form]
    end
    
    %% Login Flow Components
    subgraph LoginFlow [Email/Password Login Flow]
        LoginForm[Login Form]
        LoginFormValidation[Form Validation]
        LoginApiCall[API Call]
        LoginFindUser[Find User]
        LoginVerifyPassword[Verify Password]
        LoginCheckProfile[Check Profile Completion]
        LoginGenerateToken[Generate JWT Token]
        LoginSendResponse[Send Response]
        LoginStoreToken[Store Token]
        LoginRedirect[Redirect to Dashboard/Profile]
    end
    
    %% OAuth Flow Components
    subgraph OAuthFlow [OAuth Authentication Flow]
        OAuthButton[OAuth Button]
        OAuthRedirect[Redirect to Backend]
        OAuthInitiation[OAuth Initiation]
        OAuthProviderAuth[Provider Authentication]
        OAuthCallback[OAuth Callback]
        OAuthExchangeCode[Exchange Code for Token]
        OAuthGetProfile[Get User Profile]
        OAuthFindUser[Find/Create User]
        OAuthCheckRole[Check User Role]
        OAuthRoleSelection[Role Selection]
        OAuthGenerateToken[Generate JWT Token]
        OAuthRedirectWithToken[Redirect with Token]
        OAuthStoreToken[Store Token]
        OAuthFinalRedirect[Redirect to Dashboard/Profile]
    end
    
    %% Token Validation Components
    subgraph TokenValidation [Token Validation Flow]
        ApiRequest[API Request]
        ExtractToken[Extract Token]
        VerifyToken[Verify Token Signature]
        CheckExpiration[Check Token Expiration]
        DecodeToken[Decode Token Payload]
        AttachUser[Attach User to Request]
        RouteHandler[Route Handler]
        AuthError[Authentication Error]
    end
    
    %% Registration Flow Connections
    User --> UserInterface
    UserInterface --> RegForm
    RegForm --> RegFormValidation
    RegFormValidation -->|Valid Form| RegApiCall
    RegApiCall -->|POST /api/auth/register| BackendServer
    BackendServer --> RegBackendValidation
    RegBackendValidation -->|Valid Input| RegCheckExisting
    RegCheckExisting -->|Check Email| PostgreSQL
    PostgreSQL -->|No Existing User| RegPasswordHash
    RegPasswordHash -->|bcrypt hash| RegCreateUser
    RegCreateUser -->|Insert Record| PostgreSQL
    PostgreSQL -->|User Created| RegGenerateToken
    RegGenerateToken -->|JWT with User Data| RegSendResponse
    RegSendResponse -->|201 Created| FrontendClient
    FrontendClient --> RegStoreToken
    RegStoreToken -->|localStorage| RegRedirect
    RegRedirect -->|/forms| UserInterface
    
    %% Login Flow Connections
    UserInterface --> LoginForm
    LoginForm --> LoginFormValidation
    LoginFormValidation -->|Valid Form| LoginApiCall
    LoginApiCall -->|POST /api/auth/login| BackendServer
    BackendServer --> LoginFindUser
    LoginFindUser -->|Query by Email| PostgreSQL
    PostgreSQL -->|User Found| LoginVerifyPassword
    LoginVerifyPassword -->|bcrypt compare| LoginVerifyPassword
    LoginVerifyPassword -->|Password Valid| LoginCheckProfile
    LoginCheckProfile -->|Check Profile Status| MongoDB
    MongoDB -->|Profile Status| LoginGenerateToken
    LoginGenerateToken -->|JWT with User Data| LoginSendResponse
    LoginSendResponse -->|200 OK| FrontendClient
    FrontendClient --> LoginStoreToken
    LoginStoreToken -->|localStorage| LoginRedirect
    LoginRedirect -->|/dashboard or /forms| UserInterface
    
    %% OAuth Flow Connections
    UserInterface --> OAuthButton
    OAuthButton -->|Click| OAuthRedirect
    OAuthRedirect -->|/auth/oauth/{provider}| BackendServer
    BackendServer --> OAuthInitiation
    OAuthInitiation -->|Redirect to Provider| OAuthProviderAuth
    OAuthProviderAuth -->|User Authenticates| OAuthProvider
    OAuthProvider -->|Redirect with Code| OAuthCallback
    OAuthCallback -->|/auth/oauth/{provider}/callback| BackendServer
    BackendServer --> OAuthExchangeCode
    OAuthExchangeCode -->|POST Token Request| OAuthProvider
    OAuthProvider -->|Access Token| OAuthGetProfile
    OAuthGetProfile -->|GET User Info| OAuthProvider
    OAuthProvider -->|User Profile| OAuthFindUser
    OAuthFindUser -->|Query by Email/OAuth ID| PostgreSQL
    
    %% OAuth User Creation/Update
    OAuthFindUser -->|User Not Found| PostgreSQL
    PostgreSQL -->|Create User| OAuthCheckRole
    OAuthCheckRole -->|No Role| OAuthRoleSelection
    OAuthRoleSelection -->|Redirect to Role Selection| UserInterface
    UserInterface -->|Select Role| BackendServer
    BackendServer -->|Update User Role| PostgreSQL
    
    %% OAuth Token Generation and Redirect
    OAuthCheckRole -->|Has Role| OAuthGenerateToken
    OAuthGenerateToken -->|JWT with User Data| OAuthRedirectWithToken
    OAuthRedirectWithToken -->|Redirect with Token| FrontendClient
    FrontendClient --> OAuthStoreToken
    OAuthStoreToken -->|localStorage| OAuthFinalRedirect
    OAuthFinalRedirect -->|/dashboard or /forms| UserInterface
    
    %% Token Validation Flow
    FrontendClient -->|Include Token in Header| ApiRequest
    ApiRequest -->|Authorization: Bearer {token}| BackendServer
    BackendServer --> ExtractToken
    ExtractToken -->|Token Extracted| VerifyToken
    VerifyToken -->|Verify Signature| VerifyToken
    VerifyToken -->|Valid Signature| CheckExpiration
    CheckExpiration -->|Not Expired| DecodeToken
    DecodeToken -->|Extract User Data| AttachUser
    AttachUser -->|req.user = {...}| RouteHandler
    
    %% Token Validation Error Paths
    ExtractToken -->|No Token| AuthError
    VerifyToken -->|Invalid Signature| AuthError
    CheckExpiration -->|Token Expired| AuthError
    AuthError -->|401 Unauthorized| FrontendClient
    FrontendClient -->|Clear Token & Redirect| UserInterface
    
    %% Detailed Registration Validation
    RegBackendValidation -->|Invalid Input| RegSendResponse
    RegCheckExisting -->|User Exists| RegSendResponse
    
    %% Detailed Login Validation
    LoginFindUser -->|User Not Found| LoginSendResponse
    LoginVerifyPassword -->|Invalid Password| LoginSendResponse
    
    %% OAuth Error Handling
    OAuthCallback -->|Error| OAuthRedirectWithToken
    OAuthExchangeCode -->|Error| OAuthRedirectWithToken
    OAuthGetProfile -->|Error| OAuthRedirectWithToken
    
    %% Styling
    classDef component fill:#f9f9f9,stroke:#333,stroke-width:1px;
    classDef database fill:#f5f5f5,stroke:#333,stroke-width:1px;
    classDef form fill:#e1f5fe,stroke:#0288d1,stroke-width:1px;
    classDef validation fill:#e8f5e9,stroke:#388e3c,stroke-width:1px;
    classDef token fill:#fff8e1,stroke:#ffa000,stroke-width:1px;
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:1px;
    classDef oauth fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px;
    
    class UserInterface,FrontendClient,BackendServer component;
    class PostgreSQL,MongoDB database;
    class RegForm,LoginForm,OAuthButton form;
    class RegFormValidation,RegBackendValidation,LoginFormValidation,ExtractToken,VerifyToken,CheckExpiration validation;
    class RegGenerateToken,LoginGenerateToken,OAuthGenerateToken,DecodeToken token;
    class AuthError error;
    class OAuthProvider,OAuthProviderAuth,OAuthCallback,OAuthInitiation oauth;
    
    %% Subgraph Styling
    style RegistrationFlow fill:#f9f9f9,stroke:#333,stroke-width:1px;
    style LoginFlow fill:#f9f9f9,stroke:#333,stroke-width:1px;
    style OAuthFlow fill:#f9f9f9,stroke:#333,stroke-width:1px;
    style TokenValidation fill:#f9f9f9,stroke:#333,stroke-width:1px;
```

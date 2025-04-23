```mermaid
flowchart TB
    %% Main Components
    User([User])
    ReactComponent[React Component]
    FrontendService[Frontend Service Layer]
    AxiosClient[Axios HTTP Client]
    ExpressServer[Express Server]
    MiddlewareChain[Middleware Chain]
    Controller[Controller]
    BackendService[Backend Service Layer]
    Database[(Database Layer)]
    ExternalService[External Services\nGemini AI]
    GlobalErrorHandler[Global Error Handler]
    
    %% Frontend State Components
    ComponentState[Component State]
    LoadingState[Loading State]
    ErrorState[Error State]
    
    %% Request Flow
    User -->|Interacts with UI| ReactComponent
    ReactComponent -->|1. Initiates Request| ComponentState
    ComponentState -->|2. Sets Loading State| LoadingState
    ReactComponent -->|3. Calls Service Method| FrontendService
    FrontendService -->|4. Validates Input| FrontendService
    FrontendService -->|5. Transforms Data| FrontendService
    FrontendService -->|6. Calls API| AxiosClient
    
    %% Axios Interceptor
    AxiosRequestInterceptor[Axios Request Interceptor]
    AxiosClient -->|7. Intercepts Request| AxiosRequestInterceptor
    AxiosRequestInterceptor -->|8. Adds Auth Token| AxiosRequestInterceptor
    AxiosRequestInterceptor -->|9. Adds Headers| AxiosRequestInterceptor
    AxiosRequestInterceptor -->|10. Logs Request| AxiosRequestInterceptor
    AxiosRequestInterceptor -->|11. Sends HTTP Request| ExpressServer
    
    %% Backend Middleware Chain
    ExpressServer -->|12. Receives Request| MiddlewareChain
    
    %% Detailed Middleware Chain
    CorsMiddleware[CORS Middleware]
    BodyParserMiddleware[Body Parser Middleware]
    CookieParserMiddleware[Cookie Parser Middleware]
    RequestLoggerMiddleware[Request Logger Middleware]
    RateLimiterMiddleware[Rate Limiter Middleware]
    AuthMiddleware[Authentication Middleware]
    
    MiddlewareChain -->|13. CORS Validation| CorsMiddleware
    CorsMiddleware -->|14. Validates Origin| CorsMiddleware
    CorsMiddleware -->|15. Passes Request| BodyParserMiddleware
    BodyParserMiddleware -->|16. Parses JSON Body| BodyParserMiddleware
    BodyParserMiddleware -->|17. Passes Request| CookieParserMiddleware
    CookieParserMiddleware -->|18. Parses Cookies| CookieParserMiddleware
    CookieParserMiddleware -->|19. Passes Request| RequestLoggerMiddleware
    RequestLoggerMiddleware -->|20. Logs Request| RequestLoggerMiddleware
    RequestLoggerMiddleware -->|21. Passes Request| RateLimiterMiddleware
    RateLimiterMiddleware -->|22. Checks Rate Limit| RateLimiterMiddleware
    RateLimiterMiddleware -->|23. Passes Request| AuthMiddleware
    
    %% Authentication Middleware Detail
    AuthMiddleware -->|24. Extracts Token| AuthMiddleware
    AuthMiddleware -->|25. Verifies Token| AuthMiddleware
    AuthMiddleware -->|26. Decodes Token| AuthMiddleware
    AuthMiddleware -->|27. Attaches User to Request| AuthMiddleware
    
    %% Middleware to Controller
    AuthMiddleware -->|28. Passes to Route Handler| Controller
    
    %% Controller Processing
    Controller -->|29. Extracts Parameters| Controller
    Controller -->|30. Validates Parameters| Controller
    Controller -->|31. Calls Service Method| BackendService
    
    %% Backend Service Processing
    BackendService -->|32. Implements Business Logic| BackendService
    BackendService -->|33. Queries Database| Database
    Database -->|34. Returns Data| BackendService
    BackendService -->|35. May Call External Service| ExternalService
    ExternalService -->|36. Returns Results| BackendService
    BackendService -->|37. Transforms Data| BackendService
    BackendService -->|38. Returns to Controller| Controller
    
    %% Response Preparation
    Controller -->|39. Formats Response| Controller
    Controller -->|40. Sets Status Code| Controller
    Controller -->|41. Returns Response| ExpressServer
    
    %% Response Flow
    AxiosResponseInterceptor[Axios Response Interceptor]
    ExpressServer -->|42. Sends HTTP Response| AxiosResponseInterceptor
    AxiosResponseInterceptor -->|43. Intercepts Response| AxiosResponseInterceptor
    AxiosResponseInterceptor -->|44. Logs Response| AxiosResponseInterceptor
    AxiosResponseInterceptor -->|45. Processes Response| AxiosResponseInterceptor
    AxiosResponseInterceptor -->|46. Returns to Service| FrontendService
    FrontendService -->|47. Extracts Data| FrontendService
    FrontendService -->|48. Transforms Data| FrontendService
    FrontendService -->|49. Returns to Component| ReactComponent
    ReactComponent -->|50. Updates State| ComponentState
    ComponentState -->|51. Clears Loading State| LoadingState
    ReactComponent -->|52. Re-renders UI| User
    
    %% Error Flow
    subgraph ErrorFlow [Error Handling Flow]
        %% Backend Error Generation
        Database -->|E1. Query Error| BackendServiceError[Backend Service Error]
        BackendService -->|E2. Validation Error| BackendServiceError
        ExternalService -->|E3. External Service Error| BackendServiceError
        
        %% Error Propagation
        BackendServiceError -->|E4. Throws Error| Controller
        Controller -->|E5. Passes to Global Handler| GlobalErrorHandler
        
        %% Global Error Handler
        GlobalErrorHandler -->|E6. Categorizes Error| GlobalErrorHandler
        GlobalErrorHandler -->|E7. Sets Status Code| GlobalErrorHandler
        GlobalErrorHandler -->|E8. Formats Error Response| GlobalErrorHandler
        GlobalErrorHandler -->|E9. Sends Error Response| ExpressServer
        
        %% Frontend Error Handling
        ExpressServer -->|E10. Error Response| AxiosErrorInterceptor[Axios Error Interceptor]
        AxiosErrorInterceptor -->|E11. Handles Auth Errors| AxiosErrorInterceptor
        AxiosErrorInterceptor -->|E12. Logs Error| AxiosErrorInterceptor
        AxiosErrorInterceptor -->|E13. Rejects Promise| FrontendService
        FrontendService -->|E14. Catches Error| FrontendService
        FrontendService -->|E15. Processes Error| FrontendService
        FrontendService -->|E16. Passes to Component| ReactComponent
        ReactComponent -->|E17. Updates Error State| ErrorState
        ReactComponent -->|E18. Displays Error| User
    end
    
    %% Data Exchange Formats
    subgraph DataFormats [Data Exchange Formats]
        RequestFormat[Request Format\nGET: URL/Query Params\nPOST/PUT: JSON Body]
        SuccessFormat[Success Response Format\n{\n  message: string,\n  data: any,\n  meta?: object\n}]
        ErrorFormat[Error Response Format\n{\n  message: string,\n  error: {\n    code: string,\n    details: object\n  }\n}]
        CollectionFormat[Collection Response Format\n{\n  data: any[],\n  meta: {\n    total: number,\n    page: number,\n    pageSize: number\n  },\n  links: {\n    self: string,\n    next?: string,\n    prev?: string\n  }\n}]
    end
    
    %% Styling
    classDef component fill:#f9f9f9,stroke:#333,stroke-width:1px;
    classDef database fill:#f5f5f5,stroke:#333,stroke-width:1px;
    classDef middleware fill:#e1f5fe,stroke:#0288d1,stroke-width:1px;
    classDef service fill:#e8f5e9,stroke:#388e3c,stroke-width:1px;
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:1px;
    classDef state fill:#fff8e1,stroke:#ffa000,stroke-width:1px;
    classDef format fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px;
    
    class ReactComponent,AxiosClient,ExpressServer component;
    class Database database;
    class CorsMiddleware,BodyParserMiddleware,CookieParserMiddleware,RequestLoggerMiddleware,RateLimiterMiddleware,AuthMiddleware,MiddlewareChain middleware;
    class FrontendService,BackendService,ExternalService service;
    class GlobalErrorHandler,BackendServiceError,AxiosErrorInterceptor,ErrorState error;
    class ComponentState,LoadingState state;
    class RequestFormat,SuccessFormat,ErrorFormat,CollectionFormat format;
```

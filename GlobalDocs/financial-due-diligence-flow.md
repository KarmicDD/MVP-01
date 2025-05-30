```mermaid
flowchart TB
    %% Main Components
    User([User])
    FrontendComponents[Frontend Components]
    DocumentService[Document Service]
    FinancialService[Financial Service]
    AxiosClient[Axios HTTP Client]
    BackendController[Backend Controller]
    DocumentProcessingService[Document Processing Service]
    EnhancedDocumentService[Enhanced Document Service]
    FileSystem[File System]
    MongoDB[(MongoDB Database)]
    GeminiAI[Gemini AI]
    
    %% Frontend Components
    DocumentUpload[Document Upload Component]
    FileSelector[File Selector]
    ProgressTracker[Upload Progress Tracker]
    DocumentList[Document List]
    FinancialAnalysisRequest[Financial Analysis Request]
    FinancialReport[Financial Report]
    
    %% Frontend State Components
    FilesState[Selected Files State]
    UploadingState[Uploading State]
    ProgressState[Progress State]
    DocumentsState[Uploaded Documents State]
    LoadingState[Loading State]
    AnalysisState[Analysis State]
    ErrorState[Error State]
    
    %% Backend Components
    UploadController[Upload Controller]
    DocumentController[Document Controller]
    FinancialController[Financial Controller]
    
    %% Database Models
    DocumentModel[Document Model]
    FinancialAnalysisModel[Financial Analysis Model]
    StartupProfileModel[Startup Profile Model]
    InvestorProfileModel[Investor Profile Model]
    
    %% Document Processing Components
    FileValidation[File Validation]
    FileStorage[File Storage]
    PDFProcessor[PDF Processor]
    ExcelProcessor[Excel Processor]
    DataExtractor[Financial Data Extractor]
    
    %% Financial Analysis Components
    AnalysisGenerator[Analysis Generator]
    DataMerger[Data Merger]
    MetricsCalculator[Financial Metrics Calculator]
    ReportGenerator[Report Generator]
    
    %% Document Upload Flow
    subgraph DocumentUploadFlow [Document Upload and Processing Flow]
        SelectFiles[Select Files]
        ValidateFilesClient[Validate Files (Client)]
        PrepareFormData[Prepare Form Data]
        InitiateUpload[Initiate Upload]
        TrackProgress[Track Upload Progress]
        ReceiveFile[Receive File]
        ValidateFilesServer[Validate Files (Server)]
        ProcessFile[Process File]
        ExtractData[Extract Financial Data]
        StoreDocument[Store Document Metadata]
        ReturnUploadStatus[Return Upload Status]
        UpdateDocumentList[Update Document List]
    end
    
    %% Financial Analysis Flow
    subgraph FinancialAnalysisFlow [Financial Analysis Generation Flow]
        RequestAnalysis[Request Financial Analysis]
        CheckAnalysisCache[Check Analysis Cache]
        GetDocuments[Get Financial Documents]
        PrepareFinancialData[Prepare Financial Data]
        GenerateAnalysisPrompt[Generate Analysis Prompt]
        PerformAnalysis[Perform Financial Analysis]
        ParseAnalysisResponse[Parse Analysis Response]
        StoreAnalysisResults[Store Analysis Results]
        ReturnAnalysis[Return Analysis]
        DisplayReport[Display Financial Report]
    end
    
    %% Report Visualization Flow
    subgraph ReportVisualizationFlow [Report Visualization Flow]
        RenderExecutiveSummary[Render Executive Summary]
        RenderFinancialPerformance[Render Financial Performance]
        RenderBalanceSheet[Render Balance Sheet]
        RenderCashFlow[Render Cash Flow]
        RenderFinancialRatios[Render Financial Ratios]
        RenderRiskAssessment[Render Risk Assessment]
        RenderRecommendations[Render Recommendations]
        GenerateCharts[Generate Charts]
        ExportPDF[Export PDF]
        ShareReport[Share Report]
    end
    
    %% Main Flow
    User -->|Accesses Document Upload| FrontendComponents
    FrontendComponents -->|Renders| DocumentUpload
    
    %% Document Upload Flow Connections
    DocumentUpload -->|User Selects Files| FileSelector
    FileSelector -->|Files Selected| SelectFiles
    SelectFiles -->|Updates| FilesState
    FilesState -->|Validates| ValidateFilesClient
    ValidateFilesClient -->|Valid Files| PrepareFormData
    PrepareFormData -->|Submit Upload| InitiateUpload
    InitiateUpload -->|Sets| UploadingState
    InitiateUpload -->|Calls Service Method| DocumentService
    DocumentService -->|Creates FormData| DocumentService
    DocumentService -->|Makes API Call| AxiosClient
    AxiosClient -->|POST /profile/upload-document| BackendController
    AxiosClient -->|Reports Progress| TrackProgress
    TrackProgress -->|Updates| ProgressState
    ProgressState -->|Updates UI| ProgressTracker
    
    %% Backend Document Processing
    BackendController -->|Routes to| UploadController
    UploadController -->|Receives File| ReceiveFile
    ReceiveFile -->|Validates| ValidateFilesServer
    ValidateFilesServer -->|Checks File Type| ValidateFilesServer
    ValidateFilesServer -->|Checks User ID| ValidateFilesServer
    ValidateFilesServer -->|Valid File| ProcessFile
    ProcessFile -->|Generates Unique Filename| ProcessFile
    ProcessFile -->|Saves to Disk| FileSystem
    ProcessFile -->|Determines Document Type| ProcessFile
    
    %% Document Content Processing
    ProcessFile -->|PDF Document| PDFProcessor
    ProcessFile -->|Excel Document| ExcelProcessor
    PDFProcessor -->|Calls| DocumentProcessingService
    ExcelProcessor -->|Calls| DocumentProcessingService
    DocumentProcessingService -->|Reads File| FileSystem
    DocumentProcessingService -->|Extracts Text/Data| ExtractData
    ExtractData -->|Parses Financial Information| DataExtractor
    
    %% Document Storage
    DataExtractor -->|Extracted Data| StoreDocument
    StoreDocument -->|Creates Document Record| DocumentModel
    DocumentModel -->|Document Saved| ReturnUploadStatus
    ReturnUploadStatus -->|Returns Metadata| AxiosClient
    AxiosClient -->|Returns to| DocumentService
    DocumentService -->|Updates| DocumentsState
    DocumentsState -->|Clears| UploadingState
    DocumentsState -->|Updates UI| DocumentList
    DocumentList -->|Displays to| User
    
    %% Financial Analysis Flow Connections
    User -->|Requests Financial Analysis| FrontendComponents
    FrontendComponents -->|Renders| FinancialAnalysisRequest
    FinancialAnalysisRequest -->|Initiates Analysis| RequestAnalysis
    RequestAnalysis -->|Sets| LoadingState
    RequestAnalysis -->|Calls Service Method| FinancialService
    FinancialService -->|Makes API Call| AxiosClient
    AxiosClient -->|POST /financial/match/generate| BackendController
    BackendController -->|Routes to| FinancialController
    
    %% Backend Financial Analysis Process
    FinancialController -->|Checks Cache| CheckAnalysisCache
    CheckAnalysisCache -->|Queries| FinancialAnalysisModel
    
    %% Cache Hit Path
    FinancialAnalysisModel -->|Cache Hit| ReturnAnalysis
    
    %% Cache Miss Path
    FinancialAnalysisModel -->|Cache Miss| GetDocuments
    GetDocuments -->|Queries| DocumentModel
    DocumentModel -->|Returns Documents| GetDocuments
    GetDocuments -->|Prepares Data| PrepareFinancialData
    PrepareFinancialData -->|Calls| EnhancedDocumentService
    EnhancedDocumentService -->|Processes Documents| DataMerger
    DataMerger -->|Merges Financial Data| MetricsCalculator
    MetricsCalculator -->|Calculates Ratios| PrepareFinancialData
    PrepareFinancialData -->|Creates Prompt| GenerateAnalysisPrompt
    GenerateAnalysisPrompt -->|Sends to| GeminiAI
    GeminiAI -->|Performs Analysis| PerformAnalysis
    PerformAnalysis -->|Returns Analysis| ParseAnalysisResponse
    ParseAnalysisResponse -->|Structures Data| StoreAnalysisResults
    StoreAnalysisResults -->|Stores in| FinancialAnalysisModel
    StoreAnalysisResults -->|Formats Response| ReturnAnalysis
    
    %% Frontend Analysis Response Handling
    ReturnAnalysis -->|Returns to| AxiosClient
    AxiosClient -->|Returns to| FinancialService
    FinancialService -->|Processes Data| AnalysisState
    AnalysisState -->|Updates| FinancialAnalysisRequest
    FinancialAnalysisRequest -->|Clears| LoadingState
    FinancialAnalysisRequest -->|Navigates to| FinancialReport
    
    %% Report Visualization
    FinancialReport -->|Renders Report Sections| ReportVisualizationFlow
    RenderExecutiveSummary -->|Displays Summary| FinancialReport
    RenderFinancialPerformance -->|Displays Performance| FinancialReport
    RenderBalanceSheet -->|Displays Balance Sheet| FinancialReport
    RenderCashFlow -->|Displays Cash Flow| FinancialReport
    RenderFinancialRatios -->|Displays Ratios| FinancialReport
    RenderRiskAssessment -->|Displays Risks| FinancialReport
    RenderRecommendations -->|Displays Recommendations| FinancialReport
    
    %% Chart Generation
    AnalysisState -->|Provides Data for| GenerateCharts
    GenerateCharts -->|Creates Visualizations| FinancialReport
    
    %% Report Actions
    FinancialReport -->|Export Option| ExportPDF
    FinancialReport -->|Share Option| ShareReport
    ExportPDF -->|Generates PDF| User
    ShareReport -->|Creates Shareable Link| User
    
    %% Error Handling Flow
    subgraph ErrorHandlingFlow [Error Handling Flow]
        UploadError[Upload Error]
        ProcessingError[Processing Error]
        AnalysisError[Analysis Error]
        ErrorHandler[Error Handler]
        DisplayError[Display Error]
    end
    
    ValidateFilesServer -->|Invalid File| UploadError
    ProcessFile -->|Processing Fails| ProcessingError
    PerformAnalysis -->|Analysis Fails| AnalysisError
    UploadError -->|Handled by| ErrorHandler
    ProcessingError -->|Handled by| ErrorHandler
    AnalysisError -->|Handled by| ErrorHandler
    ErrorHandler -->|Updates| ErrorState
    ErrorState -->|Triggers| DisplayError
    DisplayError -->|Shows to| User
    
    %% Document Type Handling
    subgraph DocumentTypeHandling [Document Type Handling]
        PDFExtraction[PDF Data Extraction]
        ExcelExtraction[Excel Data Extraction]
        TextExtraction[Text Extraction]
        RegexPatterns[Regex Patterns]
        SpreadsheetParsing[Spreadsheet Parsing]
        FinancialStatementRecognition[Financial Statement Recognition]
    end
    
    PDFProcessor -->|Uses| PDFExtraction
    ExcelProcessor -->|Uses| ExcelExtraction
    PDFExtraction -->|Performs| TextExtraction
    TextExtraction -->|Uses| RegexPatterns
    ExcelExtraction -->|Performs| SpreadsheetParsing
    RegexPatterns -->|Identifies| FinancialStatementRecognition
    SpreadsheetParsing -->|Identifies| FinancialStatementRecognition
    
    %% Styling
    classDef component fill:#f9f9f9,stroke:#333,stroke-width:1px;
    classDef database fill:#f5f5f5,stroke:#333,stroke-width:1px;
    classDef service fill:#e1f5fe,stroke:#0288d1,stroke-width:1px;
    classDef processing fill:#e8f5e9,stroke:#388e3c,stroke-width:1px;
    classDef state fill:#fff8e1,stroke:#ffa000,stroke-width:1px;
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:1px;
    classDef ai fill:#f3e5f5,stroke:#7b1fa2,stroke-width:1px;
    
    class FrontendComponents,DocumentUpload,FileSelector,ProgressTracker,DocumentList,FinancialAnalysisRequest,FinancialReport component;
    class MongoDB,DocumentModel,FinancialAnalysisModel,StartupProfileModel,InvestorProfileModel database;
    class DocumentService,FinancialService,AxiosClient,BackendController,UploadController,DocumentController,FinancialController service;
    class DocumentProcessingService,EnhancedDocumentService,FileValidation,FileStorage,PDFProcessor,ExcelProcessor,DataExtractor processing;
    class FilesState,UploadingState,ProgressState,DocumentsState,LoadingState,AnalysisState,ErrorState state;
    class UploadError,ProcessingError,AnalysisError,ErrorHandler,DisplayError error;
    class GeminiAI,AnalysisGenerator,GenerateAnalysisPrompt,PerformAnalysis ai;
    
    %% Subgraph Styling
    style DocumentUploadFlow fill:#f9f9f9,stroke:#333,stroke-width:1px;
    style FinancialAnalysisFlow fill:#f9f9f9,stroke:#333,stroke-width:1px;
    style ReportVisualizationFlow fill:#f9f9f9,stroke:#333,stroke-width:1px;
    style ErrorHandlingFlow fill:#ffebee,stroke:#c62828,stroke-width:1px;
    style DocumentTypeHandling fill:#e8f5e9,stroke:#388e3c,stroke-width:1px;
```

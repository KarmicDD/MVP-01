# KarmicDD Backend Services Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Document Processing Services](#document-processing-services)
3. [Authentication Services](#authentication-services)
4. [Email Services](#email-services)
5. [Matching Services](#matching-services)
6. [Financial Due Diligence Services](#financial-due-diligence-services)
7. [Belief System Analysis Services](#belief-system-analysis-services)
8. [Search Services](#search-services)

## Introduction

This documentation provides detailed information about the backend services used in the KarmicDD platform. These services handle various aspects of the application, from document processing to AI-powered analysis for Indian startups and investors.

## Document Processing Services

### DocumentProcessingService

The `DocumentProcessingService` is responsible for processing different types of documents and extracting their content.

**Location**: `src/services/DocumentProcessingService.ts`

**Methods**:

#### extractPdfText
Extracts text content from a PDF file.

```typescript
async extractPdfText(filePath: string): Promise<string>
```

**Parameters**:
- `filePath`: Path to the PDF file

**Returns**: Extracted text content

#### extractExcelData
Extracts data from an Excel file.

```typescript
async extractExcelData(filePath: string): Promise<string>
```

**Parameters**:
- `filePath`: Path to the Excel file

**Returns**: Extracted data as a formatted string

#### extractCsvData
Extracts data from a CSV file.

```typescript
async extractCsvData(filePath: string): Promise<string>
```

**Parameters**:
- `filePath`: Path to the CSV file

**Returns**: Extracted data as a formatted string

#### processDocument
Processes a document based on its file type.

```typescript
async processDocument(filePath: string): Promise<string>
```

**Parameters**:
- `filePath`: Path to the document

**Returns**: Extracted content

#### processMultipleDocuments
Processes multiple documents and combines their content.

```typescript
async processMultipleDocuments(filePaths: string[]): Promise<string>
```

**Parameters**:
- `filePaths`: Array of file paths

**Returns**: Combined extracted content

### EnhancedDocumentProcessingService

The `EnhancedDocumentProcessingService` extends the `DocumentProcessingService` with AI-powered analysis capabilities.

**Location**: `src/services/EnhancedDocumentProcessingService.ts`

**Methods**:

#### extractFinancialData
Extracts financial data from document content using Gemini AI.

```typescript
async extractFinancialData(content: string, companyName: string, reportType: string): Promise<FinancialData>
```

**Parameters**:
- `content`: Document content
- `companyName`: Name of the company
- `reportType`: Type of report to generate ("analysis" or "audit")

**Returns**: Structured financial data

#### analyzeFinancialHealth
Analyzes the financial health of a company based on extracted data.

```typescript
async analyzeFinancialHealth(financialData: FinancialData): Promise<FinancialHealthAnalysis>
```

**Parameters**:
- `financialData`: Structured financial data

**Returns**: Financial health analysis

## Authentication Services

### AuthService

The `AuthService` handles user authentication and token management.

**Location**: `src/services/AuthService.ts`

**Methods**:

#### generateToken
Generates a JWT token for a user.

```typescript
generateToken(user: User): string
```

**Parameters**:
- `user`: User object

**Returns**: JWT token

#### verifyToken
Verifies a JWT token.

```typescript
verifyToken(token: string): TokenPayload | null
```

**Parameters**:
- `token`: JWT token

**Returns**: Token payload if valid, null otherwise

#### hashPassword
Hashes a password.

```typescript
async hashPassword(password: string): Promise<string>
```

**Parameters**:
- `password`: Plain text password

**Returns**: Hashed password

#### comparePassword
Compares a plain text password with a hashed password.

```typescript
async comparePassword(password: string, hashedPassword: string): Promise<boolean>
```

**Parameters**:
- `password`: Plain text password
- `hashedPassword`: Hashed password

**Returns**: Boolean indicating if the passwords match

## Email Services

### EmailService

The `EmailService` handles sending emails to users.

**Location**: `src/services/EmailService.ts`

**Methods**:

#### sendEmail
Sends an email to a user.

```typescript
async sendEmail(to: string, subject: string, body: string): Promise<boolean>
```

**Parameters**:
- `to`: Recipient email address
- `subject`: Email subject
- `body`: Email body

**Returns**: Boolean indicating if the email was sent successfully

#### sendBatchEmail
Sends emails to multiple users.

```typescript
async sendBatchEmail(recipients: string[], subject: string, body: string): Promise<number>
```

**Parameters**:
- `recipients`: Array of recipient email addresses
- `subject`: Email subject
- `body`: Email body

**Returns**: Number of emails sent successfully

#### sendTemplatedEmail
Sends an email using a template.

```typescript
async sendTemplatedEmail(to: string, templateName: string, data: any): Promise<boolean>
```

**Parameters**:
- `to`: Recipient email address
- `templateName`: Name of the email template
- `data`: Data to populate the template

**Returns**: Boolean indicating if the email was sent successfully

#### sendProfileShareEmail
Sends an email with a profile share link.

```typescript
async sendProfileShareEmail(to: string[], shareableUrl: string, senderName: string): Promise<number>
```

**Parameters**:
- `to`: Array of recipient email addresses
- `shareableUrl`: Shareable profile URL
- `senderName`: Name of the sender

**Returns**: Number of emails sent successfully

#### sendWelcomeEmail
Sends a welcome email to a newly registered user.

```typescript
async sendWelcomeEmail(to: string, name: string, userType: string, customMessage?: string, includeTutorial?: boolean): Promise<boolean>
```

**Parameters**:
- `to`: Recipient email address
- `name`: Recipient name
- `userType`: Type of user ("startup" or "investor")
- `customMessage`: Optional custom message
- `includeTutorial`: Whether to include tutorial information

**Returns**: Boolean indicating if the email was sent successfully

## Matching Services

### MatchingService

The `MatchingService` handles matching startups with investors based on compatibility.

**Location**: `src/services/MatchingService.ts`

**Methods**:

#### findMatchesForStartup
Finds potential investor matches for a startup.

```typescript
async findMatchesForStartup(startupId: string, limit: number, page: number): Promise<MatchResult>
```

**Parameters**:
- `startupId`: ID of the startup
- `limit`: Maximum number of matches to return
- `page`: Page number for pagination

**Returns**: Match result with investor matches and pagination info

#### findMatchesForInvestor
Finds potential startup matches for an investor.

```typescript
async findMatchesForInvestor(investorId: string, limit: number, page: number): Promise<MatchResult>
```

**Parameters**:
- `investorId`: ID of the investor
- `limit`: Maximum number of matches to return
- `page`: Page number for pagination

**Returns**: Match result with startup matches and pagination info

#### calculateCompatibilityScore
Calculates the compatibility score between a startup and an investor.

```typescript
async calculateCompatibilityScore(startupId: string, investorId: string): Promise<CompatibilityScore>
```

**Parameters**:
- `startupId`: ID of the startup
- `investorId`: ID of the investor

**Returns**: Compatibility score with detailed breakdown

## Financial Due Diligence Services

### FinancialDueDiligenceService

The `FinancialDueDiligenceService` handles financial due diligence analysis using Indian accounting standards.

**Location**: `src/services/FinancialDueDiligenceService.ts`

**Methods**:

#### generateFinancialReport
Generates a financial report based on uploaded documents.

```typescript
async generateFinancialReport(userId: string, documentIds: string[], companyName: string, reportType: string): Promise<FinancialReport>
```

**Parameters**:
- `userId`: ID of the user
- `documentIds`: Array of document IDs
- `companyName`: Name of the company
- `reportType`: Type of report to generate ("analysis" or "audit")

**Returns**: Generated financial report

#### getFinancialReports
Gets all financial reports for a user.

```typescript
async getFinancialReports(userId: string): Promise<FinancialReport[]>
```

**Parameters**:
- `userId`: ID of the user

**Returns**: Array of financial reports

#### getFinancialReport
Gets a specific financial report.

```typescript
async getFinancialReport(reportId: string): Promise<FinancialReport | null>
```

**Parameters**:
- `reportId`: ID of the report

**Returns**: Financial report if found, null otherwise

#### generatePdfReport
Generates a PDF version of a financial report.

```typescript
async generatePdfReport(reportId: string): Promise<Buffer>
```

**Parameters**:
- `reportId`: ID of the report

**Returns**: PDF buffer

#### validateIndianComplianceRequirements
Validates if the company meets Indian regulatory compliance requirements.

```typescript
async validateIndianComplianceRequirements(financialData: FinancialData): Promise<ComplianceValidationResult>
```

**Parameters**:
- `financialData`: Structured financial data

**Returns**: Compliance validation result

### FinancialDueDiligenceMatchController

The `FinancialDueDiligenceMatchController` provides API endpoints for financial due diligence between startups and investors.

**Location**: `src/controllers/FinancialDueDiligenceMatchController.ts`

**Methods**:

#### analyzeFinancialDueDiligence
Analyzes financial due diligence between a startup and an investor.

```typescript
async analyzeFinancialDueDiligence(req: Request, res: Response): Promise<void>
```

**Parameters**:
- `req`: HTTP request object with startupId and investorId parameters
- `res`: HTTP response object

**Returns**: JSON response with financial due diligence analysis

#### getFinancialDueDiligenceReport
Gets a financial due diligence report between a startup and an investor.

```typescript
async getFinancialDueDiligenceReport(req: Request, res: Response): Promise<void>
```

**Parameters**:
- `req`: HTTP request object with startupId and investorId parameters
- `res`: HTTP response object

**Returns**: JSON response with financial due diligence report

#### shareFinancialDueDiligenceReport
Shares a financial due diligence report via email.

```typescript
async shareFinancialDueDiligenceReport(req: Request, res: Response): Promise<void>
```

**Parameters**:
- `req`: HTTP request object with startupId, investorId parameters and emails in the body
- `res`: HTTP response object

**Returns**: JSON response confirming the report was shared

#### exportFinancialDueDiligenceReportPdf
Exports a financial due diligence report as PDF.

```typescript
async exportFinancialDueDiligenceReportPdf(req: Request, res: Response): Promise<void>
```

**Parameters**:
- `req`: HTTP request object with startupId and investorId parameters
- `res`: HTTP response object

**Returns**: PDF file or JSON error response

## Belief System Analysis Services

### BeliefSystemAnalysisService

The `BeliefSystemAnalysisService` handles belief system alignment analysis between startups and investors.

**Location**: `src/services/BeliefSystemAnalysisService.ts`

**Methods**:

#### analyzeBeliefSystemAlignment
Analyzes belief system alignment between a startup and an investor.

```typescript
async analyzeBeliefSystemAlignment(startupId: string, investorId: string, perspective?: string, detail?: string): Promise<BeliefSystemAlignment>
```

**Parameters**:
- `startupId`: ID of the startup
- `investorId`: ID of the investor
- `perspective`: Optional perspective ("startup" or "investor")
- `detail`: Optional detail level ("basic", "standard", or "comprehensive")

**Returns**: Belief system alignment analysis

#### getBeliefSystemProfile
Gets the belief system profile for a user.

```typescript
async getBeliefSystemProfile(userId: string): Promise<BeliefSystemProfile>
```

**Parameters**:
- `userId`: ID of the user

**Returns**: Belief system profile

#### generateRiskMitigationRecommendations
Generates risk mitigation recommendations based on belief system alignment analysis.

```typescript
async generateRiskMitigationRecommendations(alignment: BeliefSystemAlignment): Promise<RiskMitigationRecommendation[]>
```

**Parameters**:
- `alignment`: Belief system alignment analysis

**Returns**: Array of risk mitigation recommendations

## Search Services

### SearchService

The `SearchService` handles searching and filtering data.

**Location**: `src/services/SearchService.ts`

**Methods**:

#### searchStartups
Searches for startups using multiple filter criteria.

```typescript
async searchStartups(options: SearchOptions): Promise<SearchResults>
```

**Parameters**:
- `options`: Search options including industry, fundingStage, employeeCount, location, revenue, foundedDate, hasQuestionnaire, matchScore, keywords, page, limit, sortBy, sortOrder, and fields

**Returns**: Search results with pagination and filter info

#### searchInvestors
Searches for investors using multiple filter criteria.

```typescript
async searchInvestors(options: SearchOptions): Promise<SearchResults>
```

**Parameters**:
- `options`: Search options including industry, fundingStage, ticketSize, investmentCriterion, location, investmentRegion, portfolioSize, hasQuestionnaire, matchScore, keywords, page, limit, sortBy, sortOrder, and fields

**Returns**: Search results with pagination and filter info

#### getFilterOptions
Retrieves all available options for filter dropdowns.

```typescript
async getFilterOptions(): Promise<FilterOptions>
```

**Returns**: Filter options including industries, fundingStages, employeeOptions, ticketSizes, investmentCriteria, investmentRegions, and revenueRanges

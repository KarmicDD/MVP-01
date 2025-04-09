# KarmicDD Frontend Hooks Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Authentication Hooks](#authentication-hooks)
3. [Profile Hooks](#profile-hooks)
4. [Dashboard Hooks](#dashboard-hooks)
5. [Tutorial Hooks](#tutorial-hooks)
6. [Financial Due Diligence Hooks](#financial-due-diligence-hooks)
7. [Belief System Analysis Hooks](#belief-system-analysis-hooks)
8. [Form Hooks](#form-hooks)
9. [Utility Hooks](#utility-hooks)

## Introduction

This documentation provides detailed information about the custom React hooks used in the KarmicDD frontend. These hooks encapsulate reusable logic and state management for various features of the application.

## Authentication Hooks

### useAuth

The `useAuth` hook provides authentication-related functionality.

**Location**: `src/hooks/useAuth.ts`

**Usage**:
```tsx
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout, register } = useAuth();
  
  // Use authentication functions
  const handleLogin = async () => {
    try {
      await login(email, password);
      // Handle successful login
    } catch (error) {
      // Handle login error
    }
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user.name}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

**Returns**:
- `user`: Current user object
- `isAuthenticated`: Boolean indicating if the user is authenticated
- `login(email, password)`: Function to log in a user
- `logout()`: Function to log out a user
- `register(email, password, role)`: Function to register a new user

## Profile Hooks

### useProfile

The `useProfile` hook provides profile-related functionality.

**Location**: `src/hooks/useProfile.ts`

**Usage**:
```tsx
import { useProfile } from '../hooks/useProfile';

function ProfileComponent() {
  const { profile, loading, error, updateProfile } = useProfile();
  
  // Use profile functions
  const handleUpdateProfile = async (profileData) => {
    try {
      await updateProfile(profileData);
      // Handle successful update
    } catch (error) {
      // Handle update error
    }
  };
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <h1>{profile.name}</h1>
      <button onClick={() => handleUpdateProfile({ name: 'New Name' })}>
        Update Name
      </button>
    </div>
  );
}
```

**Returns**:
- `profile`: Current user's profile
- `loading`: Boolean indicating if profile data is loading
- `error`: Error object if an error occurred
- `updateProfile(profileData)`: Function to update the profile
- `shareProfile()`: Function to generate a shareable profile link

### useDocuments

The `useDocuments` hook provides document management functionality.

**Location**: `src/hooks/useDocuments.ts`

**Usage**:
```tsx
import { useDocuments } from '../hooks/useDocuments';

function DocumentsComponent() {
  const { documents, loading, error, uploadDocument, deleteDocument } = useDocuments();
  
  // Use document functions
  const handleUpload = async (file) => {
    try {
      await uploadDocument(file);
      // Handle successful upload
    } catch (error) {
      // Handle upload error
    }
  };
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <h1>Documents</h1>
      <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
      <ul>
        {documents.map(doc => (
          <li key={doc.id}>
            {doc.originalName}
            <button onClick={() => deleteDocument(doc.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Returns**:
- `documents`: Array of user documents
- `loading`: Boolean indicating if documents are loading
- `error`: Error object if an error occurred
- `uploadDocument(file, metadata)`: Function to upload a document
- `deleteDocument(documentId)`: Function to delete a document

## Dashboard Hooks

### useMatches

The `useMatches` hook provides match-related functionality.

**Location**: `src/hooks/useMatches.ts`

**Usage**:
```tsx
import { useMatches } from '../hooks/useMatches';

function MatchesComponent() {
  const { matches, loading, error, fetchMatches } = useMatches();
  
  // Use matches functions
  const handleRefresh = async () => {
    try {
      await fetchMatches();
      // Handle successful refresh
    } catch (error) {
      // Handle refresh error
    }
  };
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <h1>Matches</h1>
      <button onClick={handleRefresh}>Refresh</button>
      <ul>
        {matches.map(match => (
          <li key={match.id}>
            {match.name} - Compatibility: {match.compatibilityScore}%
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Returns**:
- `matches`: Array of matches
- `loading`: Boolean indicating if matches are loading
- `error`: Error object if an error occurred
- `fetchMatches(filters)`: Function to fetch matches with optional filters
- `selectedMatch`: Currently selected match
- `selectMatch(matchId)`: Function to select a match

### useCompatibility

The `useCompatibility` hook provides compatibility analysis functionality.

**Location**: `src/hooks/useCompatibility.ts`

**Usage**:
```tsx
import { useCompatibility } from '../hooks/useCompatibility';

function CompatibilityComponent({ startupId, investorId }) {
  const { compatibility, loading, error } = useCompatibility(startupId, investorId);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <h1>Compatibility Score: {compatibility.overallScore}%</h1>
      <h2>Categories</h2>
      <ul>
        {compatibility.categories.map(category => (
          <li key={category.name}>
            {category.name}: {category.score}% - {category.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Parameters**:
- `startupId`: ID of the startup
- `investorId`: ID of the investor

**Returns**:
- `compatibility`: Compatibility analysis data
- `loading`: Boolean indicating if data is loading
- `error`: Error object if an error occurred

## Tutorial Hooks

### useTutorial

The `useTutorial` hook provides tutorial management functionality.

**Location**: `src/hooks/useTutorial.ts`

**Usage**:
```tsx
import useTutorial from '../hooks/useTutorial';

function TutorialComponent() {
  const tutorial = useTutorial('dashboard-tutorial');
  
  return (
    <div>
      <button onClick={tutorial.openTutorial}>Show Tutorial</button>
      
      {tutorial.isOpen && (
        <div className="tutorial-overlay">
          <h2>Tutorial</h2>
          <p>This is a tutorial for the dashboard.</p>
          <button onClick={tutorial.closeTutorial}>Close</button>
          <button onClick={tutorial.completeTutorial}>Complete</button>
        </div>
      )}
    </div>
  );
}
```

**Parameters**:
- `tutorialId`: Unique identifier for the tutorial

**Returns**:
- `isOpen`: Boolean indicating if the tutorial is open
- `openTutorial()`: Function to open the tutorial
- `closeTutorial()`: Function to close the tutorial
- `completeTutorial()`: Function to mark the tutorial as completed
- `resetTutorial()`: Function to reset the tutorial state

## Financial Due Diligence Hooks

### useFinancialDueDiligence

The `useFinancialDueDiligence` hook provides financial due diligence functionality.

**Location**: `src/hooks/useFinancialDueDiligence.ts`

**Usage**:
```tsx
import useFinancialDueDiligence from '../hooks/useFinancialDueDiligence';

function FinancialDueDiligenceComponent({ startupId, investorId }) {
  const {
    financialData,
    loading,
    error,
    fetchFinancialData,
    shareReport,
    exportReportPdf
  } = useFinancialDueDiligence(startupId, investorId);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <h1>Financial Due Diligence</h1>
      <button onClick={() => fetchFinancialData()}>Refresh</button>
      <button onClick={() => shareReport(['example@example.com'])}>Share</button>
      <button onClick={() => exportReportPdf()}>Export PDF</button>
      
      <h2>Summary</h2>
      <p>{financialData.summary}</p>
      
      <h2>Metrics</h2>
      <ul>
        {financialData.metrics.map(metric => (
          <li key={metric.name}>
            {metric.name}: {metric.value} - {metric.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Parameters**:
- `startupId`: ID of the startup
- `investorId`: ID of the investor

**Returns**:
- `financialData`: Financial due diligence data
- `loading`: Boolean indicating if data is loading
- `error`: Error object if an error occurred
- `fetchFinancialData()`: Function to fetch financial data
- `shareReport(emails)`: Function to share the report via email
- `exportReportPdf()`: Function to export the report as PDF

### useFinancialReports

The `useFinancialReports` hook provides financial report management functionality.

**Location**: `src/hooks/useFinancialReports.ts`

**Usage**:
```tsx
import { useFinancialReports } from '../hooks/useFinancialReports';

function FinancialReportsComponent() {
  const { reports, loading, error, generateReport } = useFinancialReports();
  
  const handleGenerateReport = async () => {
    try {
      await generateReport({
        documentIds: ['doc1', 'doc2'],
        companyName: 'My Startup',
        reportType: 'analysis'
      });
      // Handle successful generation
    } catch (error) {
      // Handle generation error
    }
  };
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <h1>Financial Reports</h1>
      <button onClick={handleGenerateReport}>Generate New Report</button>
      <ul>
        {reports.map(report => (
          <li key={report._id}>
            {report.companyName} - {report.reportType} - {report.createdAt}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Returns**:
- `reports`: Array of financial reports
- `loading`: Boolean indicating if reports are loading
- `error`: Error object if an error occurred
- `generateReport(options)`: Function to generate a new report
- `getReport(reportId)`: Function to get a specific report
- `exportReportPdf(reportId)`: Function to export a report as PDF

## Belief System Analysis Hooks

### useBeliefSystemAnalysis

The `useBeliefSystemAnalysis` hook provides belief system analysis functionality.

**Location**: `src/hooks/useBeliefSystemAnalysis.ts`

**Usage**:
```tsx
import { useBeliefSystemAnalysis } from '../hooks/useBeliefSystemAnalysis';

function BeliefSystemAnalysisComponent({ startupId, investorId }) {
  const { analysis, loading, error } = useBeliefSystemAnalysis(startupId, investorId);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <h1>Belief System Alignment: {analysis.overallAlignment}%</h1>
      <h2>Categories</h2>
      <ul>
        {analysis.categories.map(category => (
          <li key={category.name}>
            {category.name}: {category.alignment}% - {category.description}
          </li>
        ))}
      </ul>
      <h2>Insights</h2>
      <ul>
        {analysis.insights.map((insight, index) => (
          <li key={index}>{insight}</li>
        ))}
      </ul>
    </div>
  );
}
```

**Parameters**:
- `startupId`: ID of the startup
- `investorId`: ID of the investor

**Returns**:
- `analysis`: Belief system analysis data
- `loading`: Boolean indicating if data is loading
- `error`: Error object if an error occurred

## Form Hooks

### useQuestionnaire

The `useQuestionnaire` hook provides questionnaire functionality.

**Location**: `src/hooks/useQuestionnaire.ts`

**Usage**:
```tsx
import { useQuestionnaire } from '../hooks/useQuestionnaire';

function QuestionnaireComponent() {
  const {
    responses,
    loading,
    error,
    status,
    saveDraft,
    submitQuestionnaire
  } = useQuestionnaire();
  
  const handleSaveDraft = async () => {
    try {
      await saveDraft(responses);
      // Handle successful save
    } catch (error) {
      // Handle save error
    }
  };
  
  const handleSubmit = async () => {
    try {
      await submitQuestionnaire(responses);
      // Handle successful submission
    } catch (error) {
      // Handle submission error
    }
  };
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <h1>Questionnaire</h1>
      <p>Status: {status}</p>
      {/* Questionnaire form */}
      <button onClick={handleSaveDraft}>Save Draft</button>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
```

**Returns**:
- `responses`: Current questionnaire responses
- `loading`: Boolean indicating if data is loading
- `error`: Error object if an error occurred
- `status`: Questionnaire status ("draft", "submitted", or null)
- `saveDraft(responses)`: Function to save draft responses
- `submitQuestionnaire(responses)`: Function to submit the questionnaire
- `getStatus()`: Function to get the current questionnaire status

## Utility Hooks

### useDebounce

The `useDebounce` hook provides debounced value updates.

**Location**: `src/hooks/useDebounce.ts`

**Usage**:
```tsx
import { useDebounce } from '../hooks/useDebounce';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  useEffect(() => {
    // This effect will only run after the debounce delay
    if (debouncedSearchTerm) {
      searchAPI(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);
  
  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
      />
    </div>
  );
}
```

**Parameters**:
- `value`: Value to debounce
- `delay`: Debounce delay in milliseconds

**Returns**:
- Debounced value

### useLocalStorage

The `useLocalStorage` hook provides localStorage integration.

**Location**: `src/hooks/useLocalStorage.ts`

**Usage**:
```tsx
import { useLocalStorage } from '../hooks/useLocalStorage';

function PreferencesComponent() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  
  return (
    <div>
      <h1>Preferences</h1>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
```

**Parameters**:
- `key`: localStorage key
- `initialValue`: Initial value if key doesn't exist

**Returns**:
- Current value
- Function to update the value

### useMediaQuery

The `useMediaQuery` hook provides media query matching.

**Location**: `src/hooks/useMediaQuery.ts`

**Usage**:
```tsx
import { useMediaQuery } from '../hooks/useMediaQuery';

function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <div>
      {isMobile ? (
        <MobileView />
      ) : (
        <DesktopView />
      )}
    </div>
  );
}
```

**Parameters**:
- `query`: Media query string

**Returns**:
- Boolean indicating if the media query matches

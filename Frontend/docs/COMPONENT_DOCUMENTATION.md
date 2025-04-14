# KarmicDD Frontend Component Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Page Components](#page-components)
5. [Form Components](#form-components)
6. [Dashboard Components](#dashboard-components)
7. [Authentication Components](#authentication-components)
8. [Tutorial Components](#tutorial-components)
9. [Loading Components](#loading-components)
10. [Hooks](#hooks)
11. [Services](#services)
12. [Utilities](#utilities)

## Introduction

This documentation provides a comprehensive guide to the frontend components of the KarmicDD platform. KarmicDD is an AI-powered due diligence platform designed for startups and investors, providing tools for profile management, matching, financial due diligence, and more.

## Project Structure

```
Frontend/
├── public/             # Static assets
├── src/
│   ├── assets/         # Images, icons, and other static resources
│   ├── components/     # Reusable UI components
│   │   ├── Auth/       # Authentication-related components
│   │   ├── ComingSoon/ # Coming soon page components
│   │   ├── Dashboard/  # Dashboard UI components
│   │   ├── Forms/      # Form components for data collection
│   │   ├── Landing/    # Landing page components
│   │   ├── Loading/    # Loading indicators and spinners
│   │   ├── Profile/    # Profile-related components
│   │   └── Tutorial/   # Tutorial and onboarding components
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── services/       # API and service integration
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Application entry point
```

## Core Components

### App.tsx
The main application component that sets up routing and context providers.

**Usage:**
```tsx
// main.tsx
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <App />
)
```

**Features:**
- Sets up React Router for navigation
- Provides authentication context
- Handles protected routes
- Includes toast notifications

### ActiveSectionContextProvider
Context provider for tracking the active section in the application.

**Usage:**
```tsx
// App.tsx
import ActiveSectionContextProvider from './context/active-section-context';

function App() {
  return (
    <ActiveSectionContextProvider>
      {/* App content */}
    </ActiveSectionContextProvider>
  );
}
```

## Page Components

### Landing.tsx
The landing page component that showcases the platform's features and benefits.

**Usage:**
```tsx
// App.tsx
import Landing from './pages/Landing';

<Route path="/" element={<Landing />} />
```

**Features:**
- Hero section with call-to-action
- Feature showcase
- How it works section
- Testimonials
- Footer with links

### Dashboard.tsx
The main dashboard component that provides access to matches, analytics, and settings.

**Usage:**
```tsx
// App.tsx
import Dashboard from './pages/Dashboard';

<Route path="/dashboard" element={<Dashboard />} />
```

**Features:**
- Tab navigation between matches, analytics, and settings
- Match cards with compatibility scores
- Analytics visualizations
- Financial due diligence reports
- Tutorial integration

### Auth.tsx
The authentication page component that handles login, registration, and password reset.

**Usage:**
```tsx
// App.tsx
import AuthPage from './pages/Auth';

<Route path="/auth" element={<AuthPage />} />
```

**Features:**
- Login form
- Registration form
- Password reset
- OAuth integration
- Role selection

### QuestionnairePage.tsx
The questionnaire page component that collects user preferences and characteristics.

**Usage:**
```tsx
// App.tsx
import QuestionnairePage from './pages/QuestionnairePage';

<Route path="/question" element={<QuestionnairePage />} />
```

**Features:**
- Multi-step questionnaire
- Progress tracking
- Save draft functionality
- Submission handling

### ProfilePage.tsx
The profile page component that displays and allows editing of user profiles.

**Usage:**
```tsx
// App.tsx
import ProfilePage from './pages/ProfilePage';

<Route path="/profile" element={<ProfilePage />} />
```

**Features:**
- Profile information display
- Edit mode
- Document upload
- Profile sharing

## Form Components

### VentureMatch.tsx (form.tsx)
The main form component for collecting user information.

**Usage:**
```tsx
// App.tsx
import VentureMatch from './components/Forms/form';

<Route path="/forms" element={<VentureMatch />} />
```

**Features:**
- Multi-step form
- Conditional fields based on user role
- Validation
- Progress tracking

### MultiSelectTile.tsx
A reusable component for selecting multiple options from a list.

**Usage:**
```tsx
import MultiSelectTile from './components/Forms/MultiSelectTile';

<MultiSelectTile
  options={industries}
  selectedOptions={selectedIndustries}
  onChange={handleIndustryChange}
  title="Select Industries"
/>
```

**Props:**
- `options`: Array of available options
- `selectedOptions`: Array of currently selected options
- `onChange`: Function to handle selection changes
- `title`: Title for the component

### SelectInput.tsx
A reusable component for selecting a single option from a list.

**Usage:**
```tsx
import SelectInput from './components/Forms/SelectInput';

<SelectInput
  options={fundingStages}
  selectedOption={selectedFundingStage}
  onChange={handleFundingStageChange}
  title="Select Funding Stage"
/>
```

**Props:**
- `options`: Array of available options
- `selectedOption`: Currently selected option
- `onChange`: Function to handle selection change
- `title`: Title for the component

## Dashboard Components

### MatchCards
Components for displaying match cards in the dashboard.

**Usage:**
```tsx
import renderMatchCards from '../components/Dashboard/MatchesPage/MatchCards/renderMarchCards';

{renderMatchCards(matches, handleMatchClick, selectedMatchId)}
```

**Features:**
- Displays match information
- Shows compatibility score
- Handles selection
- Animated transitions

### CompatibilityBreakdown
Component for displaying detailed compatibility analysis between a startup and an investor.

**Usage:**
```tsx
import CompatibilityBreakdown from '../components/Dashboard/MatchesPage/CompatibilityBreakdown';

<CompatibilityBreakdown
  startupId={startupId}
  investorId={investorId}
/>
```

**Props:**
- `startupId`: ID of the startup
- `investorId`: ID of the investor

### AIRecommendations
Component for displaying AI-generated recommendations based on compatibility analysis.

**Usage:**
```tsx
import AIRecommendations from '../components/Dashboard/MatchesPage/AIRecomendations';

<AIRecommendations
  startupId={startupId}
  investorId={investorId}
/>
```

**Props:**
- `startupId`: ID of the startup
- `investorId`: ID of the investor

### BeliefSystemAnalytics
Component for displaying belief system alignment analysis.

**Usage:**
```tsx
import BeliefSystemAnalytics from '../components/Dashboard/Analytics/BeliefSystemAnalytics';

<BeliefSystemAnalytics
  userProfile={userProfile}
  selectedMatchId={selectedMatchId}
/>
```

**Props:**
- `userProfile`: User profile object
- `selectedMatchId`: ID of the selected match

### Financial Due Diligence Components

#### FinancialDueDiligence

**Location**: `src/components/Dashboard/Analytics/FinancialDueDiligence.tsx`

**Description**: Main component that handles the financial due diligence interface between startups and investors. It provides options to choose between financial analysis and audit reports, displays available financial documents, and manages report generation.

**Props**:
- `userProfile`: Object containing the user's profile information
  - `userId`: User ID
  - `role`: User role ('startup' or 'investor')
- `selectedMatchId`: ID of the selected match (startup or investor)

**State**:
- `isGenerating`: Boolean indicating if a report is being generated
- `selectedReportType`: Either 'analysis' or 'audit'
- `financialReports`: Array of previously generated reports
- `showReportsList`: Boolean to control visibility of previous reports list
- `entityName`: Name of the entity whose documents are being analyzed

**Key Features**:
- Automatically determines startupId and investorId based on user role and selected match
- Checks for financial document availability before allowing report generation
- Provides UI for generating both financial analysis and audit reports
- Displays previously generated reports with download options
- Shows available financial documents that will be used for analysis
- Handles error states and loading states appropriately

#### FinancialDueDiligenceReportContent

**Location**: `src/components/Dashboard/Analytics/FinancialDueDiligenceReportContent.tsx`

**Description**: Component for displaying financial due diligence reports. Renders different sections based on the report type and available data.

**Props**:
- `report`: Financial due diligence report object
- `formatDate`: Function to format dates consistently
- `handleExportPDF`: Function to export the report as PDF
- `handleShareReport`: Function to share the report via email
- `isCompact`: Optional boolean to display a more compact version of the report

**Key Features**:
- Renders a comprehensive financial report with:
  - Executive summary section
  - Key financial metrics with status indicators (good/warning/critical)
  - Recommendations section
  - Risk factors section with severity indicators
  - Compliance items section for audit reports
  - Financial ratio analysis (liquidity, profitability, solvency, efficiency)
  - Tax compliance assessment (GST, Income Tax, TDS)
  - Company and investor information sections
  - Missing documents section with recommendations
- Uses color coding to indicate status (green for good, yellow for warning, red for critical)
- Provides export to PDF and report sharing functionality
- Uses framer-motion for animation effects

**Example Usage**:
```tsx
<FinancialDueDiligenceReportContent
  report={report}
  formatDate={(date) => new Date(date).toLocaleDateString()}
  handleExportPDF={handleExportPDF}
  handleShareReport={handleShareReport}
  isCompact={false}
/>
```

**Implementation Notes**:
- Uses React Icons (Fi* components) for visual indicators
- Implements responsive design with grid layouts
- Report sections are conditionally rendered based on available data
- Helper functions for status color determination

### Pagination
Component for handling pagination in lists.

**Usage:**
```tsx
import Pagination from '../components/Dashboard/MatchesPage/Pagination';

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={handlePageChange}
/>
```

**Props:**
- `currentPage`: Current page number
- `totalPages`: Total number of pages
- `onPageChange`: Function to handle page changes

## Authentication Components

### OAuthCallback
Component for handling OAuth callback and authentication.

**Usage:**
```tsx
// App.tsx
import OAuthCallback from './components/Auth/OAuthCallback';

<Route path="/auth/callback" element={<OAuthCallback />} />
```

**Features:**
- Processes OAuth callback parameters
- Handles authentication
- Redirects to appropriate page after authentication

## Tutorial Components

### TutorialCards
Component for displaying card-based tutorials.

**Usage:**
```tsx
import TutorialCards from '../components/Tutorial/TutorialCards';

<TutorialCards
  steps={tutorialSteps}
  isOpen={isTutorialOpen}
  onClose={handleCloseTutorial}
  onComplete={handleCompleteTutorial}
  tutorialId="dashboard-tutorial"
/>
```

**Props:**
- `steps`: Array of tutorial steps
- `isOpen`: Boolean indicating if the tutorial is open
- `onClose`: Function to handle tutorial close
- `onComplete`: Function to handle tutorial completion
- `tutorialId`: Unique identifier for the tutorial

### TutorialButton
Component for displaying a button to open tutorials.

**Usage:**
```tsx
import TutorialButton from '../components/Tutorial/TutorialButton';

<TutorialButton
  onClick={handleOpenTutorial}
  label="Help"
/>
```

**Props:**
- `onClick`: Function to handle button click
- `label`: Button label

## Loading Components

### LoadingSpinner
Component for displaying loading spinners.

**Usage:**
```tsx
import LoadingSpinner from '../components/Loading';

<LoadingSpinner
  message="Loading Profile"
  submessage="Please wait while we retrieve your profile information"
  size="medium"
/>
```

**Props:**
- `message`: Main loading message
- `submessage`: Secondary loading message
- `size`: Size of the spinner ("small", "medium", or "large")

## Hooks

### useTutorial
Custom hook for managing tutorial state.

**Usage:**
```tsx
import useTutorial from '../hooks/useTutorial';

const dashboardTutorial = useTutorial('dashboard-tutorial');

// Open tutorial
dashboardTutorial.openTutorial();

// Close tutorial
dashboardTutorial.closeTutorial();

// Complete tutorial
dashboardTutorial.completeTutorial();
```

**Returns:**
- `isOpen`: Boolean indicating if the tutorial is open
- `openTutorial`: Function to open the tutorial
- `closeTutorial`: Function to close the tutorial
- `completeTutorial`: Function to mark the tutorial as completed

### useFinancialDueDiligence
Custom hook for managing financial due diligence data.

**Usage:**
```tsx
import useFinancialDueDiligence from '../hooks/useFinancialDueDiligence';

const {
  financialData,
  loading,
  error,
  fetchFinancialData
} = useFinancialDueDiligence(startupId, investorId);
```

**Parameters:**
- `startupId`: ID of the startup
- `investorId`: ID of the investor

**Returns:**
- `financialData`: Financial due diligence data
- `loading`: Boolean indicating if data is loading
- `error`: Error object if an error occurred
- `fetchFinancialData`: Function to fetch financial data

## Services

### api.ts
Service for making API requests.

**Usage:**
```tsx
import api from '../services/api';

// Make a GET request
api.get('/profile/startup')
  .then(response => {
    // Handle response
  })
  .catch(error => {
    // Handle error
  });

// Make a POST request
api.post('/profile/startup', profileData)
  .then(response => {
    // Handle response
  })
  .catch(error => {
    // Handle error
  });
```

**Methods:**
- `get(url, config)`: Make a GET request
- `post(url, data, config)`: Make a POST request
- `put(url, data, config)`: Make a PUT request
- `delete(url, config)`: Make a DELETE request

### searchServices.ts
Service for searching and filtering data.

**Usage:**
```tsx
import {
  searchStartups,
  searchInvestors,
  getFilterOptions
} from '../services/searchServices';

// Search for startups
searchStartups({
  query: 'tech',
  industry: 'Technology',
  page: 1,
  limit: 10
})
  .then(results => {
    // Handle results
  })
  .catch(error => {
    // Handle error
  });
```

**Methods:**
- `searchStartups(options)`: Search for startups
- `searchInvestors(options)`: Search for investors
- `getFilterOptions()`: Get available filter options

## Utilities

### colours.ts
Utility for managing color schemes.

**Usage:**
```tsx
import { colours } from '../utils/colours';

<div style={{ color: colours.indigo600 }}>
  Colored text
</div>

<div style={{ backgroundImage: colours.primaryGradient }}>
  Gradient background
</div>
```

**Properties:**
- `primaryGradient`: Primary gradient for backgrounds
- `indigo600`: Indigo color for text and accents
- `gray600`: Gray color for text
- Various other color values

### scrollbar-hide.css
Utility for hiding scrollbars while maintaining scroll functionality.

**Usage:**
```tsx
<div className="scrollbar-hide">
  Content with hidden scrollbar
</div>
```

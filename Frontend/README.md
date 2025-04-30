# KarmicDD Frontend

## Overview

KarmicDD is a comprehensive AI-powered due diligence platform designed for startups and investors. The frontend application provides an intuitive interface for users to submit company information, upload documents, conduct due diligence analyses, and generate detailed assessment reports. This React-based application leverages the Gemini API for intelligent document processing and insightful analysis.

## Tech Stack

- **Framework**: React with TypeScript
- **Routing**: React Router v6
- **State Management**: React Context API and local state with hooks
- **Authentication**: JWT-based with OAuth integration
- **UI Framework**: Custom components with responsive design
- **API Communication**: Axios
- **Form Handling**: React Hook Form
- **Notifications**: React Toastify
- **Build Tool**: Vite

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
│   │   └── Loading/    # Loading indicators and spinners
│   ├── context/        # React context providers
│   │   └── active-section-context.tsx  # Active section tracking
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   │   ├── Auth.tsx    # Authentication page
│   │   ├── Dashboard.tsx # Main dashboard interface
│   │   ├── Landing.tsx # Landing page
│   │   └── QuestionnairePage.tsx # User questionnaire
│   ├── services/       # API and service integration
│   │   └── api.ts      # API client configuration
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Application entry point
├── package.json        # Project dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## Features

### Authentication & User Management
- **Multi-method Authentication**: Email/password and OAuth providers
- **Role-based Access Control**: Different experiences for startups and investors
- **Profile Completion Flow**: Guided onboarding process
- **Session Management**: Secure token handling with automatic renewal

### Due Diligence Workflow
- **Company Profile Creation**: Step-by-step form for company details
- **Document Management**: Upload, categorize, and manage due diligence documents
- **AI-powered Analysis**: Integration with Gemini API for document processing
- **Customizable Questionnaires**: Tailored information gathering
- **Progress Tracking**: Visual indicators of due diligence completion

### Dashboard & Analytics
- **Role-specific Dashboards**: Tailored views for startups and investors
- **Due Diligence Status**: Real-time updates on ongoing processes
- **Analytics Visualization**: Key metrics and insights display
- **Company Comparison**: Benchmarking against similar organizations

### Document Processing
- **Secure Document Upload**: Encrypted file storage
- **Multi-format Support**: PDF, DOCX, XLSX, images, and more
- **Intelligent Document Classification**: Automatic categorization using AI
- **Information Extraction**: Pull key data points from uploaded documents

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-organization/karmicDD.git
cd karmicDD/Frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Update the .env file with your configuration:
```
# For local development
VITE_API_BASE_URL=http://localhost:5000/api
# For production
# VITE_API_BASE_URL=https://mvp-01.onrender.com/api
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_OAUTH_GOOGLE_CLIENT_ID=your-google-client-id
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Available Routes

- `/`: Landing page with product information
- `/auth`: Authentication page (login/register)
- `/auth/callback`: OAuth callback handler
- `/auth/select-role`: Role selection after OAuth login
- `/forms`: Profile completion form for new users
- `/question`: Questionnaire for additional information
- `/dashboard`: Main application dashboard (protected)
- `/coming-soon`: Placeholder for features in development

## Protected Routes

The application implements a comprehensive protection system for routes that require authentication:

- **Authentication Check**: Verifies valid user session
- **Profile Completion**: Ensures users complete their profile before accessing the dashboard
- **Role Verification**: Restricts access based on user roles
- **Redirection Logic**: Smart redirection to appropriate pages based on auth state

## Role-Based Functionality

### Startup Users
- Document submission workflow
- Company profile management
- Due diligence status tracking
- Investor communication tools

### Investor Users
- Company discovery and filtering
- Due diligence initiation and tracking
- Analysis tools and report generation
- Portfolio management

## API Integration

The frontend communicates with the backend API using a centralized service:

```typescript
// Example API service usage
import api from './services/api';

// GET request
const fetchData = async () => {
  try {
    const response = await api.get('/endpoint');
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// POST request
const submitData = async (data) => {
  try {
    const response = await api.post('/endpoint', data);
    return response.data;
  } catch (error) {
    console.error('Error submitting data:', error);
  }
};
```

## Authentication Flow

1. **User Login/Registration**:
   - Via email/password or OAuth providers

2. **Token Management**:
   - JWT tokens stored in localStorage
   - Automatic token refresh
   - Secure API requests with Authorization headers

3. **Profile Verification**:
   - Check for completed profile on authentication
   - Redirect to profile creation if incomplete

4. **Role-based Redirection**:
   - Direct users to appropriate dashboard based on role

## Development Guidelines

### Code Style
- Follow ESLint and Prettier configurations
- Use TypeScript for type safety
- Implement component-based architecture
- Maintain separation of concerns

### Component Structure
- Functional components with hooks
- Proper prop typing with TypeScript interfaces
- Component documentation with JSDoc
- Unit tests for critical components

### State Management
- Use React Context for global state
- Local component state with useState/useReducer
- Avoid prop drilling through multiple components
- Consider performance implications for large state objects

### Styling Approach
- CSS modules for component-specific styles
- Global styles for typography and design system
- Responsive design considerations
- Theming support with CSS variables

## Build Process

```bash
# Development build with hot reload
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Run linter
npm run lint

# Run unit tests
npm run test
```

## Environment Configuration

Different environments use specific configuration files:
- `.env.development`: Development environment variables
- `.env.production`: Production environment variables
- `.env.test`: Testing environment variables

## Contribution Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[Specify your license information here]

## Acknowledgments

- React team for the amazing framework
- Google Gemini API for AI-powered document analysis
- All contributors to the project

---

For questions or support, please contact the development team at [your-email@example.com]

Similar code found with 1 license type
import { Tutorial } from '../context/TutorialContext';

// Dashboard tutorial
export const dashboardTutorial: Tutorial = {
  id: 'dashboard-tutorial',
  title: 'Dashboard Tutorial',
  description: 'Learn how to use the StartupMatch dashboard',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to StartupMatch',
      content: 'Welcome to your personalized dashboard! This quick tour will help you navigate the interface and discover all the features available to you.',
      image: '/images/tutorials/dashboard-overview.png'
    },
    {
      id: 'overview',
      title: 'Overview Tab',
      content: 'The Overview tab provides a summary of your profile, recent activity, and key metrics at a glance. This is your central hub for important notifications and updates.',
      image: '/images/tutorials/overview-tab.png'
    },
    {
      id: 'matches',
      title: 'Matches Tab',
      content: 'The Matches tab shows potential startup-investor connections based on your profile. Click on any match card to view detailed compatibility information and contact options.',
      image: '/images/tutorials/matches-tab.png'
    },
    {
      id: 'analytics',
      title: 'Analytics Tab',
      content: 'The Analytics tab offers in-depth analysis including belief system alignment, financial metrics, and compatibility scores. These insights help you make informed decisions.',
      image: '/images/tutorials/analytics-tab.png'
    },
    {
      id: 'documents',
      title: 'Documents Tab',
      content: 'The Documents tab allows you to view, download, and manage all documents shared between you and your matches. All documents are securely stored and easily accessible with a single click.',
      image: '/images/tutorials/documents-tab.png'
    },
    {
      id: 'profile',
      title: 'Your Profile',
      content: 'Keep your profile updated to improve match quality. Access your profile settings from the user menu in the top-right corner of the dashboard.',
      image: '/images/tutorials/profile-section.png'
    },
    {
      id: 'conclusion',
      title: 'You\'re All Set!',
      content: 'You\'re now ready to use StartupMatch to find your perfect startup-investor match. If you need help at any time, click the question mark icon in the top navigation bar or the Help & Support button in the sidebar.',
      image: '/images/tutorials/conclusion.png'
    }
  ]
};

// Financial Due Diligence tutorial
export const financialDueDiligenceTutorial: Tutorial = {
  id: 'financial-dd-tutorial',
  title: 'Financial Due Diligence Tutorial',
  description: 'Learn how to use the financial due diligence tools',
  steps: [
    {
      id: 'welcome',
      title: 'Financial Due Diligence',
      content: 'Our AI-powered financial due diligence tool provides comprehensive analysis of financial documents with insights tailored for both startups and investors.',
      image: '/images/tutorials/financial-dd-overview.png'
    },
    {
      id: 'document-upload',
      title: 'Document Upload',
      content: 'Upload financial documents through the Documents tab. We support PDF, Excel, Word, and CSV formats. All uploads are securely stored and processed.',
      image: '/images/tutorials/document-upload.png'
    },
    {
      id: 'analysis-process',
      title: 'Analysis Process',
      content: 'Once uploaded, our AI analyzes your documents and generates a detailed report. This typically takes 1-2 minutes depending on document size and complexity.',
      image: '/images/tutorials/analysis-process.png'
    },
    {
      id: 'metrics',
      title: 'Financial Metrics',
      content: 'Reports include key metrics like revenue growth, profit margins, burn rate, and runway. Each metric is color-coded to indicate performance relative to industry benchmarks.',
      image: '/images/tutorials/financial-metrics.png'
    },
    {
      id: 'insights',
      title: 'AI Insights',
      content: 'Each report includes AI-generated insights highlighting strengths, potential concerns, and recommendations based on the financial data.',
      image: '/images/tutorials/financial-insights.png'
    },
    {
      id: 'download-share',
      title: 'Download & Share',
      content: 'Reports can be downloaded as PDFs or shared directly with your matches. You control who has access to your financial information.',
      image: '/images/tutorials/download-share.png'
    }
  ]
};

// Belief System Analysis tutorial
export const beliefSystemTutorial: Tutorial = {
  id: 'belief-system-tutorial',
  title: 'Belief System Analysis Tutorial',
  description: 'Learn how to interpret belief system analysis results',
  steps: [
    {
      id: 'welcome',
      title: 'Belief System Analysis',
      content: 'Our unique Belief System Analysis tool evaluates the alignment between startup and investor values, mission, and working styles to predict long-term partnership success.',
      image: '/images/tutorials/belief-system-overview.png'
    },
    {
      id: 'questionnaire',
      title: 'Questionnaire',
      content: 'Complete the belief system questionnaire in your profile settings. The questionnaire covers topics like business ethics, growth philosophy, and decision-making styles.',
      image: '/images/tutorials/questionnaire.png'
    },
    {
      id: 'compatibility',
      title: 'Compatibility Dashboard',
      content: 'View your compatibility with matches in the Analytics tab. The dashboard shows overall alignment and breaks down compatibility across different dimensions.',
      image: '/images/tutorials/compatibility-dashboard.png'
    },
    {
      id: 'alignment',
      title: 'Alignment Score',
      content: 'The alignment score (0-100) indicates how well your values match with potential partners. Scores above 75 suggest excellent compatibility for long-term partnerships.',
      image: '/images/tutorials/alignment-score.png'
    },
    {
      id: 'insights',
      title: 'AI Insights',
      content: 'Review AI-generated insights about your compatibility, highlighting areas of strong alignment and potential friction points to discuss during negotiations.',
      image: '/images/tutorials/ai-insights.png'
    },
    {
      id: 'recommendations',
      title: 'Recommendations',
      content: 'Based on your belief system profile, the system provides personalized recommendations for improving communication and building stronger partnerships.',
      image: '/images/tutorials/recommendations.png'
    }
  ]
};

// New Financial Due Diligence tutorial
export const newFinancialDueDiligenceTutorial: Tutorial = {
  id: 'new-financial-dd-tutorial',
  title: 'Financial Due Diligence Tutorial',
  description: 'Learn how to use the enhanced financial due diligence tools',
  steps: [
    {
      id: 'welcome',
      title: 'Enhanced Financial Due Diligence',
      content: 'Our enhanced AI-powered financial due diligence tool provides comprehensive analysis of financial documents with detailed insights tailored for both startups and investors.',
      image: '/images/tutorials/financial-dd-overview.png'
    },
    {
      id: 'document-processing',
      title: 'Document Processing',
      content: 'Documents are processed in batches of 2 for optimal analysis. Our system extracts text from all document types including PDFs, Excel files, and presentations.',
      image: '/images/tutorials/document-upload.png'
    },
    {
      id: 'analysis-process',
      title: 'Analysis Process',
      content: 'Our advanced AI analyzes your documents following Indian auditing standards (SA 240, SA 500, SA 530, CARO 2020, Ind AS) to generate a detailed, professional report.',
      image: '/images/tutorials/analysis-process.png'
    },
    {
      id: 'investment-decision',
      title: 'Investment Decision',
      content: 'Each report includes a clear investment recommendation with success probability percentage and key considerations to help you make informed decisions.',
      image: '/images/tutorials/financial-metrics.png'
    },
    {
      id: 'risk-assessment',
      title: 'Risk Assessment',
      content: 'The report provides a detailed risk assessment with severity levels and mitigation strategies for each identified risk factor.',
      image: '/images/tutorials/financial-insights.png'
    },
    {
      id: 'download-share',
      title: 'Download & Share',
      content: 'Reports can be downloaded as PDFs or shared directly with your matches. You control who has access to your financial information.',
      image: '/images/tutorials/download-share.png'
    }
  ]
};

// Export all tutorials as a record for easy registration
export const allTutorials: Record<string, Tutorial> = {
  [dashboardTutorial.id]: dashboardTutorial,
  [financialDueDiligenceTutorial.id]: financialDueDiligenceTutorial,
  [beliefSystemTutorial.id]: beliefSystemTutorial,
  [newFinancialDueDiligenceTutorial.id]: newFinancialDueDiligenceTutorial
};

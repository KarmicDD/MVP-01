import { Tutorial } from '../context/TutorialContext';

// Dashboard tutorial
export const dashboardTutorial: Tutorial = {
  id: 'dashboard-tutorial',
  title: 'Dashboard Tutorial',
  description: 'Learn how to use the KarmicDD dashboard',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to KarmicDD',
      content: 'This quick tour will help you get familiar with the dashboard and its features. Let\'s get started!',
      image: '/images/tutorials/dashboard-overview.png',
      video: 'https://youtu.be/example1',  // Replace with actual YouTube video when available
      link: {
        url: 'https://karmicdd.com/help/dashboard',
        text: 'Dashboard documentation'
      }
    },
    {
      id: 'matches',
      title: 'Matches Tab',
      content: 'The Matches tab shows you potential startup-investor matches based on your profile. Click on any match card to see detailed compatibility information.',
      image: '/images/tutorials/matches-tab.png'
    },
    {
      id: 'analytics',
      title: 'Analytics Tab',
      content: 'The Analytics tab provides in-depth analysis of your profile and matches, including belief system alignment and financial due diligence.',
      image: '/images/tutorials/analytics-tab.png',
      link: {
        url: 'https://karmicdd.com/help/analytics',
        text: 'Learn more about analytics'
      }
    },
    {
      id: 'profile',
      title: 'Your Profile',
      content: 'Keep your profile updated to improve match quality. You can edit your profile information, upload documents, and manage your settings.',
      image: '/images/tutorials/profile-section.png'
    },
    {
      id: 'conclusion',
      title: 'You\'re All Set!',
      content: 'You\'re now ready to use KarmicDD to find your perfect startup-investor match. If you need help at any time, click the help button in the bottom right corner.',
      image: '/images/tutorials/conclusion.png',
      link: {
        url: 'https://karmicdd.com/help',
        text: 'Visit help center'
      }
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
      content: 'This tool provides comprehensive financial analysis and audit reports compliant with Indian company standards.',
      image: '/images/tutorials/financial-dd-overview.png',
      video: 'https://youtu.be/example2',  // Replace with actual YouTube video when available
    },
    {
      id: 'document-upload',
      title: 'Document Upload',
      content: 'Upload your financial documents here. We support various formats including PDF, Excel, and CSV files.',
      image: '/images/tutorials/document-upload.png',
      link: {
        url: 'https://karmicdd.com/help/supported-documents',
        text: 'View supported document types'
      }
    },
    {
      id: 'report-types',
      title: 'Report Types',
      content: 'Choose between Financial Analysis or Audit Report based on your needs. Financial Analysis focuses on growth metrics, while Audit Reports focus on compliance.',
      image: '/images/tutorials/report-types.png'
    },
    {
      id: 'metrics',
      title: 'Financial Metrics',
      content: 'Review key financial metrics with color-coded indicators showing the health of each metric.',
      image: '/images/tutorials/financial-metrics.png',
      link: {
        url: 'https://karmicdd.com/help/financial-metrics',
        text: 'Learn about financial metrics'
      }
    },
    {
      id: 'export',
      title: 'Export & Share',
      content: 'You can export reports as PDF or share them directly with your matches via email.',
      image: '/images/tutorials/export-share.png'
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
      content: 'This tool analyzes the alignment between startup and investor belief systems to predict long-term compatibility.',
      image: '/images/tutorials/belief-system-overview.png'
    },
    {
      id: 'questionnaire',
      title: 'Questionnaire',
      content: 'Complete the belief system questionnaire to generate your analysis. The more questions you answer, the more accurate the results.',
      image: '/images/tutorials/questionnaire.png'
    },
    {
      id: 'alignment',
      title: 'Alignment Score',
      content: 'The alignment score shows how well your values match with potential partners. Higher scores indicate better long-term compatibility.',
      image: '/images/tutorials/alignment-score.png'
    },
    {
      id: 'insights',
      title: 'AI Insights',
      content: 'Review AI-generated insights about your compatibility and potential areas of friction.',
      image: '/images/tutorials/ai-insights.png'
    }
  ]
};

// Export all tutorials as a record for easy registration
export const allTutorials: Record<string, Tutorial> = {
  [dashboardTutorial.id]: dashboardTutorial,
  [financialDueDiligenceTutorial.id]: financialDueDiligenceTutorial,
  [beliefSystemTutorial.id]: beliefSystemTutorial
};

// Dashboard tutorial steps
export const dashboardTutorialSteps = [
  {
    id: 'welcome',
    title: 'Welcome to KarmicDD',
    content: 'This quick tour will help you get familiar with the dashboard and its features. Let\'s get started!',
    position: 'center'
  },
  {
    id: 'navigation',
    title: 'Dashboard Navigation',
    content: 'Use these tabs to navigate between different sections of the dashboard. You can view matches, analytics, and more.',
    position: 'bottom',
    element: '.dashboard-tabs' // This will be a CSS class we'll add to the tabs
  },
  {
    id: 'matches',
    title: 'Your Matches',
    content: 'Here you\'ll find potential matches based on your profile. Click on any card to view compatibility details.',
    position: 'bottom',
    element: '.matches-container' // This will be a CSS class we'll add to the matches container
  },
  {
    id: 'search-filter',
    title: 'Search & Filter',
    content: 'Use these tools to search for specific matches or filter results based on criteria like industry, funding stage, or location.',
    position: 'bottom',
    element: '.search-filter-container' // This will be a CSS class we'll add
  },
  {
    id: 'compatibility',
    title: 'Compatibility Analysis',
    content: 'When you select a match, you\'ll see a detailed compatibility breakdown here, showing how well you align in different areas.',
    position: 'top',
    element: '.compatibility-section' // This will be a CSS class we'll add
  }
];

// Analytics tutorial steps
export const analyticsTutorialSteps = [
  {
    id: 'analytics-intro',
    title: 'Analytics & Insights',
    content: 'This section provides valuable insights about your profile and matches. Let\'s explore the different analytics tools.',
    position: 'center'
  },
  {
    id: 'analytics-tabs',
    title: 'Analytics Tools',
    content: 'Use these tabs to switch between different analytics features, including Belief System Analysis and Financial Due Diligence.',
    position: 'bottom',
    element: '.analytics-tabs' // This will be a CSS class we'll add
  },
  {
    id: 'belief-system',
    title: 'Belief System Analysis',
    content: 'This tool analyzes the alignment between your values and those of potential matches, helping you find partners with compatible business philosophies.',
    position: 'top',
    element: '.belief-system-container' // This will be a CSS class we'll add
  },
  {
    id: 'financial-dd',
    title: 'Financial Due Diligence',
    content: 'Upload financial documents here to get AI-powered analysis and insights. The system will generate detailed reports compliant with Indian company standards.',
    position: 'top',
    element: '.financial-dd-container' // This will be a CSS class we'll add
  },
  {
    id: 'reports',
    title: 'Reports & Downloads',
    content: 'All reports can be downloaded as PDFs for offline review or sharing with your team.',
    position: 'right',
    element: '.reports-download-section' // This will be a CSS class we'll add
  }
];

// Financial Due Diligence tutorial steps
export const financialDDTutorialSteps = [
  {
    id: 'dd-intro',
    title: 'Financial Due Diligence',
    content: 'This tool provides comprehensive financial analysis and audit reports compliant with Indian company standards.',
    position: 'center'
  },
  {
    id: 'document-upload',
    title: 'Document Upload',
    content: 'Upload your financial documents here. We support various formats including PDF, Excel, and CSV files.',
    position: 'bottom',
    element: '.document-upload-section' // This will be a CSS class we'll add
  },
  {
    id: 'analysis-types',
    title: 'Analysis Types',
    content: 'Choose between Financial Analysis and Audit Report. Each provides different insights tailored to your needs.',
    position: 'right',
    element: '.analysis-types-section' // This will be a CSS class we'll add
  },
  {
    id: 'report-generation',
    title: 'Report Generation',
    content: 'After uploading documents, click here to generate your report. Our AI will analyze the data and provide detailed insights.',
    position: 'bottom',
    element: '.generate-report-button' // This will be a CSS class we'll add
  },
  {
    id: 'report-sections',
    title: 'Report Sections',
    content: 'Your report includes key metrics, recommendations, risk factors, and compliance information specific to Indian company standards.',
    position: 'top',
    element: '.report-sections-container' // This will be a CSS class we'll add
  }
];

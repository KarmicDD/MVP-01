export interface UserProfile {
    userId: string;
    email: string;
    role: string;
    name?: string;
    companyName?: string;
}

// Dashboard data types
export interface DashboardStats {
    documentCount: number;
    profileViews: number;
    documentViews: number;
    documentDownloads: number;
    compatibilityScore: number;
    matchRate: number;
    totalEngagements: number;
    engagementRate: number;
    profileCompletionPercentage: number;
}

export interface RecentMatch {
    id: string;
    entityId: string;
    name: string;
    description: string;
    compatibilityScore: number;
    location: string;
    industry: string;
    isNew: boolean;
    logo?: string;
}

export interface Activity {
    id: string;
    type: 'profile_view' | 'document_download' | 'document_upload' | 'analysis_complete' | 'match' | 'message';
    title: string;
    entity: string;
    time: string;
    formattedTime: string;
    icon: string;
    color: string;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    dueDate: string;
    formattedDueDate: string;
    priority: 'high' | 'medium' | 'low';
    category: 'profile' | 'document' | 'financial' | 'match' | 'other';
    completed: boolean;
    aiVerified: boolean;
    verificationMessage?: string;
    lastVerifiedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface TimeSeriesDataPoint {
    date: string;
    count: number;
    avgScore?: number;
}

export interface EngagementTrends {
    documentViews: TimeSeriesDataPoint[];
    documentDownloads: TimeSeriesDataPoint[];
    matches: TimeSeriesDataPoint[];
}

export interface FinancialMetric {
    name: string;
    value: string | number;
    status: 'good' | 'warning' | 'critical';
    description: string;
    trend?: string;
    percentChange?: string;
}

export interface FinancialMetrics {
    keyMetrics: FinancialMetric[];
    trends: FinancialMetric[];
}

export interface Insight {
    id: string;
    title: string;
    content: string;
    type: 'positive' | 'negative' | 'neutral' | 'action';
    icon: string;
}

export interface AnalyticsChanges {
    matchRate?: {
        percentageChange: number;
    };
    documentViews?: {
        percentageChange: number;
    };
    compatibilityScore?: {
        percentageChange: number;
    };
    profileCompletion?: {
        percentageChange: number;
    };
}

export interface DashboardAnalytics {
    engagementTrends: EngagementTrends;
    financialMetrics: FinancialMetrics | null;
    changes?: AnalyticsChanges;
}

export interface DashboardData {
    stats: DashboardStats;
    recentMatches: RecentMatch[];
    activities: Activity[];
    tasks: Task[];
    analytics: DashboardAnalytics;
    insights: Insight[];
}

export interface Match {
    _id?: string;
    id?: string;
    userId?: string;
    companyName?: string;
    createdAt?: string;
    updatedAt?: string;
    employeeCount?: string;
    fundingStage?: string;
    industry?: string;
    location?: string;
    pitch?: string;
    email?: string;
    matchScore: number;
    matchCategories?: {
        Industry?: number;
        Stage?: number;
        Size?: number;
        [key: string]: number | undefined;
    };
    // Additional fields for investor profiles
    industriesOfInterest?: string[];
    preferredStages?: string[];
    ticketSize?: string;
    investmentCriteria?: string[];
    pastInvestments?: string;
    // Additional fields for startup profiles
    revenueRange?: string;
    fundingRaised?: string;
    teamSize?: string | number;
    websiteUrl?: string;
    __v?: number;
}

export interface RenderMatchCardsProps {
    loading: boolean;
    error: string | null;
    filteredMatches: Match[];
    bookmarkedMatches: Set<string>;
    userProfile: UserProfile | null;
    connectWithMatch: (matchId: string) => void;
    toggleBookmark: (matchId: string) => void;
    onCardClick: (matchId: string) => void;
}

// Pagination type used with search results
export interface PaginationType {
    total: number;
    page: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

// Startup Profile Interface based on API response
export interface StartupProfile {
    _id?: string;
    userId: string;
    companyName: string;
    industry: string;
    fundingStage: string;
    employeeCount: number | string;
    location: string;
    pitch: string;
    createdAt?: string;
    updatedAt?: string;
    revenueRange?: string;
    fundingRaised?: string;
    teamSize?: string | number;
    websiteUrl?: string;
    __v?: number;
    // Additional properties that might be used in the application
    [key: string]: string | number | string[] | unknown;
}

// Investor Profile Interface based on API response
export interface InvestorProfile {
    _id?: string;
    userId: string;
    companyName: string;
    industriesOfInterest: string[];
    preferredStages: string[];
    ticketSize: string;
    investmentCriteria: string[];
    pastInvestments: string;
    createdAt?: string;
    updatedAt?: string;
    location?: string;
    portfolioSize?: number | string;
    investmentRegions?: string[];
    __v?: number;
    // Additional properties that might be used in the application
    [key: string]: string | number | string[] | unknown;
}

// Search options interface
export interface SearchOptions {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    industry?: string;
    fundingStage?: string;
    location?: string;
    keywords?: string;
    employeeCount?: string;
    ticketSize?: string;
    [key: string]: string | number | undefined;
}

// Filter options interface
export interface FilterOptions {
    industries: string[];
    fundingStages: string[];
    employeeOptions: string[];
    ticketSizes: string[];
    investmentCriteria: string[];
    investmentRegions: string[];
    revenueRanges: string[];
}

// Search results interface
export interface SearchResults {
    startups?: Match[];
    investors?: Match[];
    pagination: PaginationType;
}
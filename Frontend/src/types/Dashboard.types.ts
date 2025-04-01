export interface UserProfile {
    userId: string;
    email: string;
    role: string;
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
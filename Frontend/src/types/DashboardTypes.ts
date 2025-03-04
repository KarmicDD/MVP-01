export interface UserProfile {
    userId: string;
    email: string;
    role: string;
}

export interface Match {
    investorId?: string;
    startupId?: string;
    email: string;
    matchScore: number;
    companyName?: string;
    industriesOfInterest?: string[];
    preferredStages?: string[];
    ticketSize?: string;
    industry?: string;
    fundingStage?: string;
    location?: string;
}

export interface RenderMatchCardsProps {
    loading: boolean;
    error: string | null;
    filteredMatches: Match[];
    bookmarkedMatches: Set<string>;
    userProfile: UserProfile | null;
    colours: { primaryBlue: string };
    connectWithMatch: (matchId: string) => void;
    toggleBookmark: (matchId: string) => void;
    onCardClick: (matchId: string) => void;
}

// Startup Profile Interface based on API response
export interface StartupProfile {
    user_id: string;
    company_name: string;
    industry: string;
    funding_stage: string;
    employee_count: number | string;
    location: string;
    pitch: string;
    // Additional properties that might be used in the application
    [key: string]: any;
}

// Investor Profile Interface based on API response
export interface InvestorProfile {
    user_id: string;
    company_name: string;
    industries_of_interest: string[];
    preferred_stages: string[];
    ticket_size: string;
    investment_criteria: string[];
    past_investments: string;
    // Additional properties that might be used in the application
    [key: string]: any;
}


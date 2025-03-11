import api from './api';

// Search options types
export interface SearchOptions {
    industry?: string | string[];
    fundingStage?: string | string[];
    employeeCount?: string;
    location?: string;
    revenue?: string;
    foundedDate?: string;
    hasQuestionnaire?: boolean;
    matchScore?: number;
    ticketSize?: string | string[];
    investmentCriterion?: string | string[];
    investmentRegion?: string | string[];
    portfolioSize?: string;
    keywords?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    fields?: string;
}

// Filter options type
export interface FilterOptions {
    industries: string[];
    fundingStages: string[];
    employeeOptions: string[];
    ticketSizes: string[];
    investmentCriteria: string[];
    investmentRegions: string[];
    revenueRanges: string[];
}

// Search results pagination type
export interface PaginationType {
    total: number;
    page: number;
    pages: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
}

// Search results type
export interface SearchResults {
    startups?: any[];
    investors?: any[];
    pagination: PaginationType;
    filters: {
        applied: Record<string, string[]>;
        available: Record<string, string[]>;
    };
}

// Get available filter options from API
export const getFilterOptions = async (): Promise<FilterOptions> => {
    try {
        const response = await api.get('/search/options');
        return response.data;
    } catch (error) {
        console.error('Error fetching filter options:', error);
        // Return empty defaults if API fails
        return {
            industries: [],
            fundingStages: [],
            employeeOptions: [],
            ticketSizes: [],
            investmentCriteria: [],
            investmentRegions: [],
            revenueRanges: []
        };
    }
};

// Search for startups
export const searchStartups = async (options: SearchOptions): Promise<SearchResults> => {
    try {
        const response = await api.get('/search/startups', { params: options });
        return response.data;
    } catch (error) {
        console.error('Error searching startups:', error);
        throw error;
    }
};

// Search for investors
export const searchInvestors = async (options: SearchOptions): Promise<SearchResults> => {
    try {
        const response = await api.get('/search/investors', { params: options });
        return response.data;
    } catch (error) {
        console.error('Error searching investors:', error);
        throw error;
    }
};
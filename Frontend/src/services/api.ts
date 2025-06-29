// src/services/api.ts
import axios, { AxiosError } from 'axios';

// Use environment variable or fallback to production URL
const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://mvp-01.onrender.com/api';

// Helper function to extract meaningful error messages from API responses
export const extractErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        // Check if we have a response from the server
        if (axiosError.response) {
            const { data, status } = axiosError.response;

            // Handle different response formats
            if (data) {
                // If data contains a message property
                if (typeof data === 'object' && 'message' in data) {
                    return data.message as string;
                }

                // If data contains errors array (validation errors)
                if (typeof data === 'object' && 'errors' in data && Array.isArray(data.errors) && data.errors.length > 0) {
                    return data.errors[0].msg || data.errors[0].message || 'Validation error';
                }

                // If data is a string
                if (typeof data === 'string') {
                    return data;
                }
            }

            // If we couldn't extract a message, provide status-based messages
            switch (status) {
                case 400:
                    return 'Invalid request. Please check your information and try again.';
                case 401:
                    return 'Authentication failed. Please check your credentials.';
                case 403:
                    return 'You don\'t have permission to access this resource.';
                case 404:
                    return 'The requested resource was not found.';
                case 409:
                    return 'This email is already registered. Please use a different email or sign in.';
                case 429:
                    return 'Too many requests. Please try again later.';
                case 500:
                    return 'Server error. Please try again later.';
                default:
                    return `Request failed with status code ${status}`;
            }
        }

        // Network errors
        if (axiosError.code === 'ECONNABORTED') {
            return 'Request timed out. Please check your internet connection and try again.';
        }

        if (axiosError.message && axiosError.message.includes('Network Error')) {
            return 'Network error. Please check your internet connection and try again.';
        }

        // Fallback for other axios errors
        return axiosError.message || 'An error occurred with your request';
    }

    // For non-axios errors
    if (error instanceof Error) {
        return error.message;
    }

    // Fallback for unknown errors
    return 'An unexpected error occurred';
};

// Define interfaces for auth services
interface UserRegistrationData {
    email: string;
    password: string;
    fullName: string;
    role: string;
}

interface UserCredentials {
    email: string;
    password: string;
}

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // Enable cookies for session management
});

// CSRF token management
let csrfToken: string | null = null;

// Function to get CSRF token
const getCSRFToken = async (): Promise<string> => {
    if (csrfToken) {
        return csrfToken;
    }

    try {
        const response = await axios.get(`${API_URL}/csrf-token`, {
            withCredentials: true
        });
        csrfToken = response.data.csrfToken;
        return csrfToken;
    } catch (error) {
        console.error('Failed to get CSRF token:', error);
        throw error;
    }
};

// Request interceptor for adding auth token and CSRF token
api.interceptors.request.use(
    async (config) => {
        // Add auth token
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add CSRF token for non-GET requests
        if (config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
            // Skip CSRF only for OAuth endpoints
            const skipPaths = [
                '/auth/google',
                '/auth/linkedin',
                '/auth/google/callback',
                '/auth/linkedin/callback'
            ];

            const shouldSkip = skipPaths.some(path =>
                config.url?.includes(path)
            );

            if (!shouldSkip) {
                try {
                    const token = await getCSRFToken();
                    config.headers['X-CSRF-Token'] = token;
                } catch (error) {
                    console.error('Failed to get CSRF token for request:', error);
                    // Don't fail the request if CSRF token fetch fails
                    // This allows for graceful degradation
                }
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for handling auth errors
api.interceptors.response.use(
    (response) => {
        // Check for new CSRF token in response headers
        const newCSRFToken = response.headers['x-new-csrf-token'];
        if (newCSRFToken) {
            csrfToken = newCSRFToken;
        }
        return response;
    },
    async (error) => {
        // Log the error for debugging
        console.error('API Error:', error);

        // Handle 401 errors (unauthorized)
        if (error.response && error.response.status === 401) {
            // Only clear auth data and redirect if not on the auth page
            // This prevents clearing during login/signup attempts
            if (!window.location.pathname.includes('/auth')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('userId');
                localStorage.removeItem('userRole');

                // Redirect to login page
                window.location.href = '/auth';
            }
        }

        // Handle 403 errors (forbidden) - Enhanced CSRF error handling
        if (error.response && error.response.status === 403) {
            const errorData = error.response.data;

            // Enhanced CSRF error handling with user-friendly recovery
            if (errorData && errorData.code === 'CSRF_INVALID') {
                csrfToken = null; // Clear cached CSRF token

                // Check if this is a session expired scenario requiring full reset
                if (errorData.action === 'REDIRECT_TO_LOGIN') {
                    // Clear all authentication state for fresh start
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('userRole');

                    // Don't redirect immediately if already on auth page
                    if (!window.location.pathname.includes('/auth')) {
                        // Show user-friendly notification
                        if (typeof window !== 'undefined' && (window as any).showSessionExpiredNotification) {
                            (window as any).showSessionExpiredNotification({
                                title: 'Session Expired',
                                message: errorData.userFriendlyMessage || 'Your session has expired for security reasons.',
                                reason: errorData.reason || 'session_expired'
                            });
                        }

                        // Smooth redirect with context
                        const currentPath = window.location.pathname;
                        const redirectUrl = `/auth?error=session_expired&reason=${errorData.reason}&redirect=${encodeURIComponent(currentPath)}`;

                        // Delay redirect to let user read the message
                        setTimeout(() => {
                            window.location.href = redirectUrl;
                        }, 2500);
                    }

                    return Promise.reject(new Error('Session expired - redirecting to login'));
                }

                // For other CSRF errors, try retry once (existing logic)
                if (!error.config._retry) {
                    error.config._retry = true;

                    try {
                        // Get new CSRF token
                        const newCSRFToken = await getCSRFToken();
                        error.config.headers['X-CSRF-Token'] = newCSRFToken;

                        // Retry the request
                        return api.request(error.config);
                    } catch (retryError) {
                        console.error('Failed to retry request with new CSRF token:', retryError);
                        return Promise.reject(error);
                    }
                }
            }
        }

        // Enhance error object with extracted message for easier handling
        if (error.response && error.response.data) {
            // If the server returned a message, use it
            if (typeof error.response.data === 'object' && error.response.data.message) {
                error.userMessage = error.response.data.message;
            }
            // If there are validation errors
            else if (typeof error.response.data === 'object' && error.response.data.errors && Array.isArray(error.response.data.errors)) {
                error.userMessage = error.response.data.errors[0].msg || 'Validation error';
            }
        }

        return Promise.reject(error);
    }
);

// Auth services
export const authService = {    // Register
    register: async (userData: UserRegistrationData) => {
        try {
            // console.log('authService.register called with data:', {
            //     ...userData,
            //     password: '[REDACTED]'
            // });

            const response = await api.post('/auth/register', userData);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                // Store userId and userRole separately for easier access
                if (response.data.user) {
                    localStorage.setItem('userId', response.data.user.userId);
                    localStorage.setItem('userRole', response.data.user.role);
                }
            }
            return response.data;
        } catch (error) {
            // Extract and throw a more user-friendly error message
            throw new Error(extractErrorMessage(error));
        }
    },

    // Login
    login: async (credentials: UserCredentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                // Store userId and userRole separately for easier access
                if (response.data.user) {
                    localStorage.setItem('userId', response.data.user.userId);
                    localStorage.setItem('userRole', response.data.user.role);
                }
            }
            return response.data;
        } catch (error) {
            // Extract and throw a more user-friendly error message
            throw new Error(extractErrorMessage(error));
        }
    },

    // Update OAuth user role
    updateRole: async (userId: string, role: string) => {
        const response = await api.post('/auth/update-role', { userId, role });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // Store userId and userRole separately for easier access
            if (response.data.user) {
                localStorage.setItem('userId', response.data.user.userId);
                localStorage.setItem('userRole', response.data.user.role);
            }
        }
        return response.data;
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('selectedEntityId');
        localStorage.removeItem('selectedEntityType');
    },

    // Get current user
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};

// User services
export const userService = {
    // Get user profile
    getProfile: async () => {
        try {
            const response = await api.get('/users/profile');
            if (response.data) {
                localStorage.setItem('user', JSON.stringify(response.data));
                return response.data;
            }
            return null;
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    },
    // Get startup dashboard
    getStartupDashboard: async () => {
        const response = await api.get('/users/startup/dashboard');
        return response.data;
    },

    // Get investor dashboard
    getInvestorDashboard: async () => {
        const response = await api.get('/users/investor/dashboard');
        return response.data;
    }
};

export const beliefSystemService = {
    getReport: async (startupId: string, investorId: string) => {
        try {
            const response = await api.get(`/analysis/belief-system/${startupId}/${investorId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching belief system report:", error);
            throw error;
        }
    },

    exportReportPDF: async (startupId: string, investorId: string) => {
        try {
            const response = await api.get(`/analysis/belief-system/${startupId}/${investorId}/export-pdf`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error("Error exporting belief system report:", error);
            throw error;
        }
    },

    shareReport: async (startupId: string, investorId: string, emailAddresses: string[]) => {
        try {
            const response = await api.post(`/analysis/belief-system/${startupId}/${investorId}/share`, {
                emailAddresses
            });
            return response.data;
        } catch (error) {
            console.error("Error sharing belief system report:", error);
            throw error;
        }
    }
};

export const financialDueDiligenceService = {
    getReport: async (startupId: string, investorId: string, perspective: 'startup' | 'investor' = 'startup') => {
        try {
            const response = await api.get(`/financial/match/${startupId}/${investorId}?perspective=${perspective}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching financial due diligence report:", error);
            throw error;
        }
    },

    getEntityReport: async (entityId: string, entityType: 'startup' | 'investor' = 'startup') => {
        try {
            const response = await api.get(`/financial/entity/${entityId}?entityType=${entityType}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching entity financial due diligence report:", error);
            throw error;
        }
    },

    getEntityDocuments: async (entityId: string, entityType: 'startup' | 'investor' = 'startup') => {
        try {
            const response = await api.get(`/financial/entity/${entityId}/documents?entityType=${entityType}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching entity financial documents:", error);
            throw error;
        }
    },

    exportReportPDF: async (startupId: string, investorId: string) => {
        try {
            const response = await api.get(`/financial/match/${startupId}/${investorId}/pdf`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error("Error exporting financial due diligence report:", error);
            throw error;
        }
    },

    exportEntityReportPDF: async (entityId: string, entityType: 'startup' | 'investor' = 'startup') => {
        try {
            const response = await api.get(`/financial/entity/${entityId}/pdf?entityType=${entityType}`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error("Error exporting entity financial due diligence report as PDF:", error);
            throw error;
        }
    },

    shareReport: async (startupId: string, investorId: string, emailAddresses: string[]) => {
        try {
            const response = await api.post(`/financial/match/${startupId}/${investorId}/share`, {
                emails: emailAddresses
            });
            return response.data;
        } catch (error) {
            console.error("Error sharing financial due diligence report:", error);
            throw error;
        }
    },

    shareEntityReport: async (entityId: string, entityType: 'startup' | 'investor', emailAddresses: string[]) => {
        try {
            const response = await api.post(`/financial/entity/${entityId}/share?entityType=${entityType}`, {
                emails: emailAddresses
            });
            return response.data;
        } catch (error) {
            console.error("Error sharing entity financial due diligence report:", error);
            throw error;
        }
    },

    generateEntityReport: async (entityId: string, entityType: 'startup' | 'investor' = 'startup') => {
        try {
            const response = await api.post(`/financial/entity/${entityId}/generate`, {
                entityType
            });
            return response.data;
        } catch (error) {
            console.error("Error generating entity financial due diligence report:", error);
            throw error;
        }
    }
};

export const profileService = {
    // Fix: Use correct endpoint "user-type" instead of "user"
    getUserProfile: async () => {
        try {
            const response = await api.get('/profile/user-type', { withCredentials: true });
            return response.data; // This returns userId, email, role directly
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    },

    // Other profile methods
    checkProfileCompleteness: async () => {
        try {
            const response = await api.get('/profile/check-profile', { withCredentials: true });
            return response.data; // Returns { profileComplete: true/false }
        } catch (error) {
            console.error('Error checking profile completeness:', error);
            throw error;
        }
    },

    // Profile sharing methods
    shareProfileViaEmail: async (emailAddresses: string[], shareMethod = 'email') => {
        try {
            // Get the current user's profile to create a direct URL
            const userProfile = await api.get('/profile/user-type');
            const profileResponse = userProfile.data.role === 'startup'
                ? await api.get('/profile/startup')
                : await api.get('/profile/investor');

            const companyName = profileResponse.data.profile?.companyName;

            // Format the company name for the URL (replace spaces with underscores)
            const formattedName = companyName
                ? companyName.replace(/\s+/g, '_').replace(/[^\w_]/g, '')
                : '';

            // Get the base URL from the window location
            const baseUrl = window.location.origin;
            const directProfileUrl = `${baseUrl}/${formattedName}`;

            // Send the email with the direct URL
            const response = await api.post('/profile/share/email', {
                emailAddresses,
                customUrl: directProfileUrl,
                shareMethod
            });

            return response.data; // Returns { message, recipientCount, shareMethod }
        } catch (error) {
            console.error('Error sharing profile via email:', error);
            throw error;
        }
    },    // Document management methods
    uploadDocument: async (file: File, metadata: { description?: string, documentType?: string, category?: string, timePeriod?: string, isPublic?: boolean }) => {
        try {
            const formData = new FormData();
            formData.append('document', file);

            if (metadata.description) {
                formData.append('description', metadata.description);
            }

            if (metadata.documentType) {
                formData.append('documentType', metadata.documentType);
            }

            if (metadata.category) {
                formData.append('category', metadata.category);
            }

            if (metadata.timePeriod) {
                formData.append('timePeriod', metadata.timePeriod);
            }

            if (metadata.isPublic !== undefined) {
                formData.append('isPublic', String(metadata.isPublic));
            }

            const response = await api.post('/profile/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error uploading document:', error);
            throw error;
        }
    },

    getUserDocuments: async () => {
        try {
            const response = await api.get('/profile/documents');
            return response.data.documents;
        } catch (error) {
            console.error('Error fetching user documents:', error);
            throw error;
        }
    },

    deleteDocument: async (documentId: string) => {
        try {
            const response = await api.delete(`/profile/documents/${documentId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    }, updateDocumentMetadata: async (documentId: string, metadata: { description?: string, documentType?: string, category?: string, timePeriod?: string, isPublic?: boolean }) => {
        try {
            const response = await api.put(`/profile/documents/${documentId}`, metadata);
            return response.data;
        } catch (error) {
            console.error('Error updating document metadata:', error);
            throw error;
        }
    },

    downloadDocument: async (documentId: string): Promise<Blob> => {
        try {
            const response = await api.get(`/profile/documents/${documentId}/download`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error downloading document:', error);
            throw error;
        }
    },

    getDocumentDownloadUrl: (documentId: string) => {
        // Get the JWT token
        const token = localStorage.getItem('token');

        // Make sure we're using the correct URL with the API prefix and include the token
        const url = `${api.defaults.baseURL}/profile/documents/${documentId}/download?token=${token}`;
        console.log('Generated document download URL with token:', url);
        return url;
    },

    // Get public documents for a specific user
    getPublicDocuments: async (userId: string) => {
        try {
            const response = await api.get(`/profile/documents/public/${userId}`);
            return response.data.documents || [];
        } catch (error) {
            console.error('Error fetching public documents:', error);
            return [];
        }
    },

    // Financial Due Diligence methods
    uploadFinancialDocuments: async (files: File[]) => {
        try {
            const formData = new FormData();

            files.forEach(file => {
                formData.append('documents', file);
            });

            const response = await api.post('/financial/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error uploading financial documents:', error);
            throw error;
        }
    },

    generateFinancialReport: async (documentIds: string[], companyName: string) => {
        try {
            const response = await api.post('/financial/generate', {
                documentIds,
                companyName
            });

            return response.data;
        } catch (error) {
            console.error('Error generating financial report:', error);
            throw error;
        }
    },

    getFinancialReports: async () => {
        try {
            const response = await api.get('/financial/reports');
            return response.data.reports;
        } catch (error) {
            console.error('Error fetching financial reports:', error);
            throw error;
        }
    },

    getFinancialReport: async (reportId: string) => {
        try {
            const response = await api.get(`/financial/reports/${reportId}`);
            return response.data.report;
        } catch (error) {
            console.error('Error fetching financial report:', error);
            throw error;
        }
    },

    getFinancialReportPdfUrl: (reportId: string) => {
        return `${api.defaults.baseURL}/financial/reports/${reportId}/pdf`;
    },

    getStartupProfile: async () => {
        try {
            const response = await api.get('/profile/startup', { withCredentials: true });
            return response.data; // Returns { profile: {...} }
        } catch (error) {
            console.error('Error fetching startup profile:', error);
            throw error;
        }
    },

    getInvestorProfile: async () => {
        try {
            const response = await api.get('/profile/investor', { withCredentials: true });
            return response.data; // Returns { profile: {...} }
        } catch (error) {
            console.error('Error fetching investor profile:', error);
            throw error;
        }
    },

    updateStartupProfile: async (profileData: any) => {
        try {
            const response = await api.post('/profile/startup', profileData, {
                withCredentials: true
            });
            return response.data; // Returns { message: '...', profile: {...} }
        } catch (error) {
            console.error('Error updating startup profile:', error);
            throw error;
        }
    },

    updateInvestorProfile: async (profileData: any) => {
        try {
            const response = await api.post('/profile/investor', profileData, {
                withCredentials: true
            });
            return response.data; // Returns { message: '...', profile: {...} }
        } catch (error) {
            console.error('Error updating investor profile:', error);
            throw error;
        }
    },

    // Extended profile methods
    updateExtendedProfile: async (extendedData: any) => {
        try {
            const response = await api.post('/profile/extended', extendedData, {
                withCredentials: true
            });
            return response.data; // Returns { message: '...', extendedProfile: {...} }
        } catch (error) {
            console.error('Error updating extended profile:', error);
            throw error;
        }
    },

    // Get user type (startup or investor)
    getUserType: async () => {
        try {
            const response = await api.get('/profile/user-type');
            // The API returns { userId, email, role } but we need { userType }
            return { userType: response.data.role }; // Convert to expected format
        } catch (error) {
            console.error('Error fetching user type:', error);
            throw error;
        }
    },

    // Get profile for a specific entity (startup or investor)
    // This is a simplified version that returns a default profile with the entity ID
    // since we don't have direct access to other users' profiles
    getProfile: async (entityId: string, entityType: 'startup' | 'investor') => {
        try {
            // Instead of making an API call that would fail, return a default profile
            // with the entity ID and type
            console.log(`Getting default profile for ${entityType} with ID ${entityId}`);

            // Return a minimal profile with the entity ID
            return {
                userId: entityId,
                companyName: entityType === 'startup' ? 'Selected Startup' : 'Selected Investor',
                // Add other default fields as needed
            };
        } catch (error) {
            console.error(`Error creating default ${entityType} profile:`, error);
            return null;
        }
    },

    // Get matches for a specific entity type (startup or investor)
    getMatches: async (entityType: 'startup' | 'investor') => {
        try {
            const response = await api.get(`/matching/${entityType}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching ${entityType} matches:`, error);
            return { matches: [] };
        }
    },

    // Get profile by username (company name)
    getProfileByUsername: async (username: string) => {
        try {
            console.log(`Searching for profile with username: "${username}"`);

            // Decode the username in case it's URL-encoded and replace underscores with spaces
            const decodedUsername = decodeURIComponent(username).replace(/_/g, ' ');
            console.log(`Decoded username: "${decodedUsername}"`);

            // Try multiple approaches to find the profile
            let matchingProfile = null;
            let userType: 'startup' | 'investor' = 'startup';

            // Approach 1: Try to search for startups with the company name
            try {
                console.log('Searching startups with company name...');
                const startupResponse = await api.get('/search/startups', {
                    params: {
                        keywords: decodedUsername,
                        limit: 10
                    }
                });

                console.log('Startup search response:', startupResponse.data);

                if (startupResponse.data && startupResponse.data.startups && startupResponse.data.startups.length > 0) {
                    // Find the best match by comparing company names
                    const possibleMatches = startupResponse.data.startups;

                    // First try exact match (case-insensitive)
                    matchingProfile = possibleMatches.find(
                        profile => profile.companyName &&
                            profile.companyName.toLowerCase() === decodedUsername.toLowerCase()
                    );

                    // If no exact match, try partial match
                    if (!matchingProfile) {
                        console.log('No exact match found in startups, trying partial match...');
                        matchingProfile = possibleMatches.find(
                            profile => profile.companyName &&
                                (profile.companyName.toLowerCase().includes(decodedUsername.toLowerCase()) ||
                                    decodedUsername.toLowerCase().includes(profile.companyName.toLowerCase()))
                        );
                    }

                    if (matchingProfile) {
                        userType = 'startup';
                    }
                }
            } catch (error) {
                console.error('Error searching startups:', error);
                // Continue to other approaches if this fails
            }

            // Approach 2: If no startup match, try to search for investors
            if (!matchingProfile) {
                try {
                    console.log('Searching investors with company name...');
                    const investorResponse = await api.get('/search/investors', {
                        params: {
                            keywords: decodedUsername,
                            limit: 10
                        }
                    });

                    console.log('Investor search response:', investorResponse.data);

                    if (investorResponse.data && investorResponse.data.investors && investorResponse.data.investors.length > 0) {
                        // Find the best match by comparing company names
                        const possibleMatches = investorResponse.data.investors;

                        // First try exact match (case-insensitive)
                        matchingProfile = possibleMatches.find(
                            profile => profile.companyName &&
                                profile.companyName.toLowerCase() === decodedUsername.toLowerCase()
                        );

                        // If no exact match, try partial match
                        if (!matchingProfile) {
                            console.log('No exact match found in investors, trying partial match...');
                            matchingProfile = possibleMatches.find(
                                profile => profile.companyName &&
                                    (profile.companyName.toLowerCase().includes(decodedUsername.toLowerCase()) ||
                                        decodedUsername.toLowerCase().includes(profile.companyName.toLowerCase()))
                            );
                        }

                        if (matchingProfile) {
                            userType = 'investor';
                        }
                    }
                } catch (error) {
                    console.error('Error searching investors:', error);
                }
            }

            // Approach 3: Try to check if the username is a userId
            if (!matchingProfile) {
                try {
                    console.log('Checking if username is a userId...');

                    // Try to get the profile directly using the username as a userId
                    // This is a fallback approach
                    const profileResponse = await api.get(`/profile/public/${username}`);

                    if (profileResponse.data && profileResponse.data.profile) {
                        matchingProfile = profileResponse.data.profile;
                        userType = profileResponse.data.userType || 'startup';
                    }
                } catch (error) {
                    console.error('Error fetching profile by userId:', error);
                }
            }

            // If we found a matching profile
            if (matchingProfile) {
                console.log('Found matching profile:', matchingProfile);
                console.log(`Determined user type: ${userType}`);

                // Get extended profile data
                let extendedProfile = {
                    socialLinks: [],
                    teamMembers: userType === 'startup' ? [] : undefined,
                    investmentHistory: userType === 'investor' ? [] : undefined
                };

                return {
                    profile: matchingProfile,
                    extendedProfile,
                    userType
                };
            }

            // If we get here, we couldn't find a matching profile
            console.error(`No matching profile found for username: ${username}`);
            throw new Error('Profile not found');
        } catch (error) {
            console.error('Error fetching profile by username:', error);
            throw error;
        }
    },

    // Get profile using a share token
    getSharedProfile: async (shareToken: string) => {
        try {
            const response = await api.get(`/profile/shared/${shareToken}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching shared profile:', error);
            throw error;
        }
    }
};

// Dashboard services
export const dashboardService = {
    // Get all dashboard data in a single request
    getAllDashboardData: async () => {
        try {
            const response = await api.get('/dashboard/all');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    },

    // Get dashboard statistics
    getDashboardStats: async () => {
        try {
            const response = await api.get('/dashboard/stats');
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    // Get recent matches
    getRecentMatches: async (limit = 5) => {
        try {
            const response = await api.get(`/dashboard/matches?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching recent matches:', error);
            throw error;
        }
    },

    // Get recent activity
    getRecentActivity: async (limit = 5) => {
        try {
            const response = await api.get(`/dashboard/activity?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching recent activity:', error);
            throw error;
        }
    },

    // Get upcoming tasks
    getUpcomingTasks: async () => {
        try {
            const response = await api.get('/dashboard/tasks');
            return response.data;
        } catch (error) {
            console.error('Error fetching upcoming tasks:', error);
            throw error;
        }
    },

    // Get AI insights
    getInsights: async () => {
        try {
            const response = await api.get('/dashboard/insights');
            return response.data;
        } catch (error) {
            console.error('Error fetching AI insights:', error);
            throw error;
        }
    }
};

// Task services
export const taskService = {
    // Get all tasks
    getAllTasks: async () => {
        try {
            const response = await api.get('/tasks');
            return response.data;
        } catch (error) {
            console.error('Error fetching tasks:', error);
            throw error;
        }
    },

    // Create a new task
    createTask: async (taskData: any) => {
        try {
            const response = await api.post('/tasks', taskData);
            return response.data;
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    },

    // Update a task
    updateTask: async (taskId: string, taskData: any) => {
        try {
            const response = await api.put(`/tasks/${taskId}`, taskData);
            return response.data;
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    },

    // Delete a task
    deleteTask: async (taskId: string) => {
        try {
            const response = await api.delete(`/tasks/${taskId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    },

    // Generate AI tasks
    generateAITasks: async () => {
        try {
            const response = await api.post('/tasks/generate');
            return response.data;
        } catch (error) {
            console.error('Error generating AI tasks:', error);
            throw error;
        }
    },

    // Verify task completion
    verifyTaskCompletion: async (taskId: string) => {
        try {
            const response = await api.post(`/tasks/${taskId}/verify`);
            return response.data;
        } catch (error) {
            console.error('Error verifying task completion:', error);
            throw error;
        }
    }
};

// Messages service
export const messagesService = {
    // Send a message
    send: async (recipientId: string, message: string, messageType?: string) => {
        try {
            const response = await api.post('/messages/send', {
                recipientId,
                message,
                messageType
            });
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }
};

// CSRF token utilities
export const csrfService = {
    // Refresh CSRF token manually
    refreshToken: async (): Promise<string> => {
        csrfToken = null; // Clear cached token
        return await getCSRFToken();
    },

    // Get current CSRF token (without refresh)
    getCurrentToken: (): string | null => {
        return csrfToken;
    }
};

export default api;
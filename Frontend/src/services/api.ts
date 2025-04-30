// src/services/api.ts
import axios from 'axios';

// Use environment variable or fallback to localhost for development
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Define interfaces for auth services
interface UserRegistrationData {
    email: string;
    password?: string;
    name?: string;
    role?: string;
    [key: string]: string | number | boolean | undefined | null | string[]; // Use more specific types instead of any
}

interface UserCredentials {
    email: string;
    password: string;
    [key: string]: string | number | boolean | undefined | null | string[]; // Use more specific types instead of any
}

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for handling auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 errors (unauthorized)
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to login page if not already there
            if (!window.location.pathname.includes('/auth')) {
                window.location.href = '/auth';
            }
        }
        return Promise.reject(error);
    }
);

// Auth services
export const authService = {
    // Register
    register: async (userData: UserRegistrationData) => {
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
    },

    // Login
    login: async (credentials: UserCredentials) => {
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
    },

    // Document management methods
    uploadDocument: async (file: File, metadata: { description?: string, documentType?: string, timePeriod?: string, isPublic?: boolean }) => {
        try {
            const formData = new FormData();
            formData.append('document', file);

            if (metadata.description) {
                formData.append('description', metadata.description);
            }

            if (metadata.documentType) {
                formData.append('documentType', metadata.documentType);
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
    },

    updateDocumentMetadata: async (documentId: string, metadata: { description?: string, documentType?: string, timePeriod?: string, isPublic?: boolean }) => {
        try {
            const response = await api.put(`/profile/documents/${documentId}`, metadata);
            return response.data;
        } catch (error) {
            console.error('Error updating document metadata:', error);
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

export default api;
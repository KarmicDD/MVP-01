// src/services/api.ts
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

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
        }
        return response.data;
    },

    // Login
    login: async (credentials: UserCredentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // Update OAuth user role
    updateRole: async (userId: string, role: string) => {
        const response = await api.post('/auth/update-role', { userId, role });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
    getReport: async (startupId: string, investorId: string) => {
        try {
            const response = await api.get(`/financial/match/${startupId}/${investorId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching financial due diligence report:", error);
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
    generateShareableLink: async () => {
        try {
            const response = await api.post('/profile/share/generate-link');
            return response.data; // Returns { shareableUrl, expiresAt }
        } catch (error) {
            console.error('Error generating shareable link:', error);
            throw error;
        }
    },

    shareProfileViaEmail: async (emailAddresses: string[]) => {
        try {
            const response = await api.post('/profile/share/email', { emailAddresses });
            return response.data; // Returns { message, shareableUrl, recipientCount }
        } catch (error) {
            console.error('Error sharing profile via email:', error);
            throw error;
        }
    },

    getSharedProfile: async (shareToken: string) => {
        try {
            const response = await api.get(`/profile/shared/${shareToken}`);
            return response.data; // Returns { profile, extendedProfile, userType }
        } catch (error) {
            console.error('Error fetching shared profile:', error);
            throw error;
        }
    },

    // Document management methods
    uploadDocument: async (file: File, metadata: { description?: string, documentType?: string, isPublic?: boolean }) => {
        try {
            const formData = new FormData();
            formData.append('document', file);

            if (metadata.description) {
                formData.append('description', metadata.description);
            }

            if (metadata.documentType) {
                formData.append('documentType', metadata.documentType);
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

    updateDocumentMetadata: async (documentId: string, metadata: { description?: string, documentType?: string, isPublic?: boolean }) => {
        try {
            const response = await api.put(`/profile/documents/${documentId}`, metadata);
            return response.data;
        } catch (error) {
            console.error('Error updating document metadata:', error);
            throw error;
        }
    },

    getDocumentDownloadUrl: (documentId: string) => {
        return `${api.defaults.baseURL}/profile/documents/${documentId}/download`;
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

    generateFinancialReport: async (documentIds: string[], companyName: string, reportType: 'analysis' | 'audit') => {
        try {
            const response = await api.post('/financial/generate', {
                documentIds,
                companyName,
                reportType
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
    }
};

export default api;
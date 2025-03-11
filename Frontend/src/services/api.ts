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
        const response = await api.get('/users/profile');
        return response.data;
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




export default api;

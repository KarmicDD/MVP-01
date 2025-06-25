// CSRF Token Management Utility
// This module provides centralized CSRF token management for the application

export interface CSRFTokenManager {
    getToken(): string | null;
    setToken(token: string): void;
    clearToken(): void;
    refreshToken(): Promise<string>;
    isTokenValid(): boolean;
}

class CSRFTokenManagerImpl implements CSRFTokenManager {
    private token: string | null = null;
    private lastRefresh: number = 0;
    private readonly REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

    getToken(): string | null {
        return this.token;
    }

    setToken(token: string): void {
        this.token = token;
        this.lastRefresh = Date.now();
    }

    clearToken(): void {
        this.token = null;
        this.lastRefresh = 0;
    }

    async refreshToken(): Promise<string> {
        try {
            const response = await fetch('/api/csrf-token', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to refresh CSRF token: ${response.status}`);
            }

            const data = await response.json();
            this.setToken(data.csrfToken);
            return data.csrfToken;
        } catch (error) {
            console.error('Failed to refresh CSRF token:', error);
            throw error;
        }
    }

    isTokenValid(): boolean {
        if (!this.token) return false;

        // Token is considered stale after REFRESH_INTERVAL
        const tokenAge = Date.now() - this.lastRefresh;
        return tokenAge < this.REFRESH_INTERVAL;
    }
}

export const csrfTokenManager = new CSRFTokenManagerImpl();

// Helper function for components that need CSRF protection
export const withCSRFProtection = async (apiCall: () => Promise<any>) => {
    try {
        // Ensure we have a valid token
        if (!csrfTokenManager.isTokenValid()) {
            await csrfTokenManager.refreshToken();
        }

        return await apiCall();
    } catch (error: any) {
        // If CSRF error, try refreshing token once
        if (error.response?.status === 403 && error.response?.data?.code === 'CSRF_INVALID') {
            try {
                await csrfTokenManager.refreshToken();
                return await apiCall();
            } catch (retryError) {
                console.error('Failed to retry with new CSRF token:', retryError);
                throw error;
            }
        }
        throw error;
    }
};

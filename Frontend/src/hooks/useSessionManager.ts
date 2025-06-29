import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface SessionState {
    isExpired: boolean;
    reason?: string;
    redirectPath?: string;
    isNotificationVisible: boolean;
}

interface UseSessionManagerReturn {
    sessionState: SessionState;
    showSessionExpiredNotification: (data: {
        title: string;
        message: string;
        reason?: string;
        redirectPath?: string;
    }) => void;
    hideNotification: () => void;
    clearSession: () => void;
    isAuthenticated: boolean;
}

export const useSessionManager = (): UseSessionManagerReturn => {
    const navigate = useNavigate();
    const [sessionState, setSessionState] = useState<SessionState>({
        isExpired: false,
        isNotificationVisible: false
    });

    // Check if user is authenticated
    const isAuthenticated = !!localStorage.getItem('token');

    // Function to show session expired notification
    const showSessionExpiredNotification = useCallback((data: {
        title: string;
        message: string;
        reason?: string;
        redirectPath?: string;
    }) => {
        setSessionState({
            isExpired: true,
            reason: data.reason || 'session_expired',
            redirectPath: data.redirectPath,
            isNotificationVisible: true
        });
    }, []);

    // Function to hide notification
    const hideNotification = useCallback(() => {
        setSessionState(prev => ({
            ...prev,
            isNotificationVisible: false
        }));
    }, []);

    // Function to clear session completely
    const clearSession = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');

        setSessionState({
            isExpired: false,
            isNotificationVisible: false
        });
    }, []);

    // Check for session expiry on component mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        const reason = urlParams.get('reason');
        const redirectPath = urlParams.get('redirect');

        if (error === 'session_expired') {
            // Store the redirect path for after login
            if (redirectPath && redirectPath !== '/auth' && redirectPath !== '/') {
                localStorage.setItem('pendingRedirect', redirectPath);
            }

            showSessionExpiredNotification({
                title: 'Session Expired',
                message: getMessageForReason(reason || 'session_expired'),
                reason: reason || 'session_expired',
                redirectPath: redirectPath || undefined
            });

            // Clean up URL parameters to avoid showing expired session on refresh
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }, [showSessionExpiredNotification]);

    // Make notification function globally available
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).showSessionExpiredNotification = showSessionExpiredNotification;
        }

        return () => {
            if (typeof window !== 'undefined') {
                delete (window as any).showSessionExpiredNotification;
            }
        };
    }, [showSessionExpiredNotification]);

    return {
        sessionState,
        showSessionExpiredNotification,
        hideNotification,
        clearSession,
        isAuthenticated
    };
};

// Helper function to get user-friendly messages
const getMessageForReason = (reason: string): string => {
    const messages = {
        'csrf_invalid': 'Your session was reset for security reasons. This helps protect your account from potential threats.',
        'token_expired': 'Your login session timed out due to inactivity. Please log in again to continue.',
        'session_corrupted': 'There was an issue with your session data. We\'ve started a fresh session for your security.',
        'session_expired': 'Your session has expired for security reasons. Please log in again to continue.'
    };

    return messages[reason as keyof typeof messages] || messages.session_expired;
};

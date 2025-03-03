import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/Auth';
import OAuthCallback from './components/Auth/OAuthCallback';
import { StartupDashboard } from './pages/StartupDashboard';
import { InvestorDashboard } from './pages/InvestorDashboard';
import api, { authService } from './services/api';
import Landing from './pages/Landing';
import ActiveSectionContextProvider from './context/active-section-context';
import ComingSoon from './components/ComingSoon/ComingSoon';
import VentureMatch from './components/Forms/form';
import LoadingSpinner from './components/Loading';

// Protected route component with profile check
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(true);
  const user = authService.getCurrentUser();

  useEffect(() => {
    // Check if user has completed profile setup
    const checkProfile = async () => {
      try {
        // Use the api instance instead of fetch
        const response = await api.get('/profile/check-profile');
        setHasProfile(response.data.profileComplete);
      } catch (error) {
        console.error("Error checking profile:", error);
        setHasProfile(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (authService.isAuthenticated()) {
      checkProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!authService.isAuthenticated() || (requiredRole && user?.role !== requiredRole)) {
    return <Navigate to="/auth" replace />;
  }

  if (!hasProfile) {
    return <Navigate to="/forms" replace />;
  }

  return <>{children}</>;
};

// Forms route with auth check
const FormsRoute = () => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }

  return <VentureMatch />;
};

// Auth route handling redirection
const AuthRoute = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(true);
  const user = authService.getCurrentUser();

  useEffect(() => {
    // Check if authenticated user has completed profile
    const checkProfile = async () => {
      if (authService.isAuthenticated()) {
        try {
          // Use the api instance instead of fetch
          const response = await api.get('/profile/check-profile');
          setHasProfile(response.data.profileComplete);
        } catch (error) {
          console.error("Error checking profile:", error);
          setHasProfile(false);
        }
      }
      setIsLoading(false);
    };

    checkProfile();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (authService.isAuthenticated()) {
    // If authenticated but no profile, redirect to forms
    if (!hasProfile) {
      return <Navigate to="/forms" replace />;
    }

    // If has profile, go to dashboard
    return user?.role === 'startup' ? (
      <Navigate to="/startup/dashboard" replace />
    ) : user?.role === 'investor' ? (
      <Navigate to="/investor/dashboard" replace />
    ) : (
      <Navigate to="/" replace />
    );
  }

  return <AuthPage />;
};

function App() {
  return (
    <ActiveSectionContextProvider>
      <Router>
        <Routes>
          {/* Default Landing Page */}
          <Route path="/" element={<Landing />} />

          {/* Forms Route - Protected but accessible before dashboard */}
          <Route path="/forms" element={<FormsRoute />} />

          {/* Auth Routes */}
          <Route path="/auth" element={<AuthRoute />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route path="/auth/select-role" element={<OAuthCallback />} />

          {/* Open Routes */}
          <Route path="/coming-soon" element={<ComingSoon />} /> {/* Anyone can access */}

          {/* Protected Routes */}
          <Route
            path="/startup/dashboard"
            element={
              <ProtectedRoute requiredRole="startup">
                <StartupDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/investor/dashboard"
            element={
              <ProtectedRoute requiredRole="investor">
                <InvestorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Redirect all unknown routes to Landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ActiveSectionContextProvider>
  );
}

export default App;
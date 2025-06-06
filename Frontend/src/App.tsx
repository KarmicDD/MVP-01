import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/Auth';
import OAuthCallback from './components/Auth/OAuthCallback';
import api, { authService } from './services/api';
import Landing from './pages/Landing';
import ActiveSectionContextProvider from './context/active-section-context';
import ComingSoon from './components/ComingSoon/ComingSoon';
import VentureMatch from './components/Forms/form';
import { LoadingSpinner } from './components/Loading';
import Dashboard from './pages/Dashboard';
import QuestionnairePage from './pages/QuestionnairePage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProfilePage from './pages/ProfilePage';
import ViewProfilePage from './pages/ViewProfilePage';
import DocumentViewerPage from './pages/DocumentViewerPage';
import { TutorialProvider } from './context/TutorialContext';
import TutorialManager from './components/Tutorial/TutorialManager';
import { allTutorials } from './data/tutorials';

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
    // logout
    authService.logout();
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

    // If has profile and has a role, go to dashboard
    return user?.role ? (
      <Navigate to="/dashboard" replace />
    ) : (
      <Navigate to="/" replace />
    );
  }

  return <AuthPage />;
};

const DashboardRoute = () => {
  const user = authService.getCurrentUser();

  if (user?.role) {
    return <Dashboard />;
  } else {
    return <Navigate to="/" replace />;
  }
};

function App() {
  return (
    <TutorialProvider initialTutorials={allTutorials}>
      <ActiveSectionContextProvider>
        <Router>
          <Routes>
            {/* Default Landing Page */}
            <Route
              path="/"
              element={
                authService.isAuthenticated() ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Landing />
                )
              }
            />

            {/* Forms Route - Protected but accessible before dashboard */}
            <Route path="/forms" element={<FormsRoute />} />

            {/* Auth Routes */}
            <Route path="/auth" element={<AuthRoute />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/auth/select-role" element={<OAuthCallback />} />

            {/* Open Routes */}
            <Route path="/coming-soon" element={<ComingSoon />} /> {/* Anyone can access */}
            <Route path="/loading" element={<LoadingSpinner />} /> {/* Anyone can access */}
            <Route
              path="/question"
              element={
                <ProtectedRoute>
                  <QuestionnairePage />
                </ProtectedRoute>
              }
            />


            {/* Profile Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />

            {/* Document Viewer Route - Protected */}
            <Route path="/document/:documentId" element={
              <ProtectedRoute>
                <DocumentViewerPage />
              </ProtectedRoute>
            } />

            {/* Profile Viewing Route */}
            <Route path="/:identifier" element={<ViewProfilePage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRoute />
                </ProtectedRoute>
              }
            />

            {/* Redirect all unknown routes to Landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {/* Add ToastContainer for notifications */}
          <ToastContainer position="bottom-right" />
        </Router>
        {/* Tutorial Manager */}
        <TutorialManager tutorials={allTutorials} />
      </ActiveSectionContextProvider>
    </TutorialProvider>
  );
}


export default App;
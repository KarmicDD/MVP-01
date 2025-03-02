// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/Auth';
import OAuthCallback from './components/Auth/OAuthCallback';
import { StartupDashboard } from './pages/StartupDashboard';
import { InvestorDashboard } from './pages/InvestorDashboard';
import { authService } from './services/api';
import Landing from './pages/Landing';
import ActiveSectionContextProvider from './context/active-section-context';
import ComingSoon from './components/ComingSoon/ComingSoon';
import VentureMatch from './components/Forms/form';

// Protected route component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) => {
  const user = authService.getCurrentUser();

  if (!authService.isAuthenticated() || (requiredRole && user?.role !== requiredRole)) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

// Auth route handling redirection
const AuthRoute = () => {
  const user = authService.getCurrentUser();

  if (authService.isAuthenticated()) {
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
          <Route path="/forms" element={<VentureMatch />} />

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
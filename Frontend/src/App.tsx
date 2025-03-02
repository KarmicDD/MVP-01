// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/Auth';
import OAuthCallback from './components/Auth/OAuthCallback';
import { StartupDashboard } from './pages/StartupDashboard';
import { InvestorDashboard } from './pages/InvestorDashboard';
import { authService } from './services/api';

// Protected route component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: string }) => {
  const user = authService.getCurrentUser();

  // Check if authenticated and has the required role
  if (!authService.isAuthenticated() || (requiredRole && user?.role !== requiredRole)) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route path="/auth/select-role" element={<OAuthCallback />} />

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

        {/* Redirect root to auth for now */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
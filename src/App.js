import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ExplorePage from './pages/ExplorePage';
import TeamsPage from './pages/TeamsPage';
import TeamDetailPage from './pages/TeamDetailPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';
import AuthLayout from './pages/AuthLayout';
import OnboardingPage from './pages/OnboardingPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading"><div className="loader-ring"/></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// const PublicRoute = ({ children }) => {
//   const { user, loading } = useAuth();
//   if (loading) return <div className="app-loading"><div className="loader-ring"/></div>;
//   if (user) return <Navigate to="/dashboard" replace />;
//   return children;
// };

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthLayout />} />
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
      <Route path="/register" element={<AuthLayout />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/explore" element={<ProtectedRoute><ExplorePage /></ProtectedRoute>} />
      <Route path="/teams" element={<ProtectedRoute><TeamsPage /></ProtectedRoute>} />
      <Route path="/teams/:id" element={<ProtectedRoute><TeamDetailPage /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

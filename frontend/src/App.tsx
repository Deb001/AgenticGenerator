import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RegisterForm from './components/Auth/RegisterForm';
import LoginForm from './components/Auth/LoginForm';
import OAuthCallback from './components/Auth/OAuthCallback';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ProfilePage from './components/ProfilePage';
import PortfoliosList from './components/PortfoliosList';
import PortfolioDetail from './components/PortfolioDetail';
import NavBar from './components/Header/NavBar';
import Settings from './components/Settings';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-1 container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Navigate to="/portfolios" replace />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portfolios"
              element={
                <ProtectedRoute>
                  <PortfoliosList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portfolios/:id"
              element={
                <ProtectedRoute>
                  <PortfolioDetail />
                </ProtectedRoute>
              }
            />
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;

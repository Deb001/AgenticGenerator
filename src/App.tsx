import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import Dashboard from './components/Dashboard';
import placeholderAuth from './auth/placeholderAuth';

const App: React.FC = () => {
  const isAuthenticated = placeholderAuth.isAuthenticated();

  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirects based on authentication status */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Protected dashboard route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Public login placeholder (implementation can be replaced) */}
        <Route path="/login" element={<div>Login Page Placeholder</div>} />

        {/* Fallback: redirect any unknown route to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
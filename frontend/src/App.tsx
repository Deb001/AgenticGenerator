import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import SignUpForm from '@/components/SignUpForm';
import LoginForm from '@/components/LoginForm';
import ProfileEditor from '@/components/ProfileEditor';
import PortfolioList from '@/components/PortfolioList';
import PortfolioDetail from '@/components/PortfolioDetail';
import ProtectedRoute from '@/routes/ProtectedRoute';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <EmailVerificationBanner />
      <main className="flex-1 container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/portfolios" replace />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolios"
            element={
              <ProtectedRoute>
                <PortfolioList />
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
        </Routes>
      </main>
    </div>
  );
};

export default App;

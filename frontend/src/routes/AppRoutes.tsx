import React, { FC } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '../components/Auth/LoginForm';
import { RegisterForm } from '../components/Auth/RegisterForm';
import { AdvisorDashboard } from '../components/Dashboard/AdvisorDashboard';
import { ClientDashboard } from '../components/Dashboard/ClientDashboard';
import { PortfolioDetail } from '../components/Portfolio/PortfolioDetail';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../hooks/useAuth';

export const AppRoutes: FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route
        path="/advisor"
        element={
          <ProtectedRoute>
            {user?.role === 'advisor' ? <AdvisorDashboard /> : <Navigate to="/login" replace />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/client"
        element={
          <ProtectedRoute>
            {user?.role === 'client' ? <ClientDashboard /> : <Navigate to="/login" replace />}
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
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

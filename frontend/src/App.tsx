import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import PortfolioList from './components/PortfolioList';
import PortfolioDetail from './components/PortfolioDetail';
import useAuth from './hooks/useAuth';

/**
 * Top‑level component that defines application routes and protects them based on authentication state.
 */
const App: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {isAuthenticated ? (
        <>
          <Route path="/portfolios" element={<PortfolioList />} />
          <Route path="/portfolios/:id" element={<PortfolioDetail />} />
          <Route path="*" element={<Navigate to="/portfolios" replace />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
};

export default App;
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import PortfolioPage from './pages/PortfolioPage';

/**
 * Root component handling routing and authentication guard.
 */
const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className='flex items-center justify-center h-screen'>Loading...</div>;
  }

  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />
      <Route
        path='/'
        element={user ? <PortfolioPage /> : <Navigate to='/login' replace />}
      />
    </Routes>
  );
};

export default App;

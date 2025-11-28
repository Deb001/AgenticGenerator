import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import PortfolioPage from './pages/PortfolioPage';
import { useAuth } from './hooks/useAuth';

const App = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-r from-primary to-secondary text-white">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/portfolios/*"
          element={isAuthenticated ? <PortfolioPage /> : <Navigate to="/login" replace />}
        />
        <Route path="/*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export default App;

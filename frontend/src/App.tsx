import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import PortfolioList from './components/PortfolioList';
import PortfolioDetail from './components/PortfolioDetail';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user } = useAuth();
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/portfolios"
          element={user ? <PortfolioList /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/portfolios/:id"
          element={user ? <PortfolioDetail /> : <Navigate to="/login" replace />}
        />
        <Route
          path="*"
          element={<Navigate to={user ? '/portfolios' : '/login'} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
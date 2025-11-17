import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import PortfolioDashboard from './components/PortfolioDashboard';
import apiClient from './api/client';
import { User } from './types';

/**
 * Shape of authentication state stored in context.
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

/**
 * Context value shape.
 */
interface AuthContextProps {
  auth: AuthState;
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
}

/**
 * Default unauthenticated state.
 */
const defaultAuth: AuthState = {
  user: null,
  token: null,
  loading: true,
};

/**
 * Exported AuthContext for consumption by child components.
 */
export const AuthContext = createContext<AuthContextProps>({
  auth: defaultAuth,
  setAuth: () => {}
});

/**
 * ProtectedRoute component redirects unauthenticated users to /login.
 */
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { auth } = useContext(AuthContext);
  const location = useLocation();
  if (auth.loading) {
    return <div>Loading...</div>;
  }
  if (!auth.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

/**
 * Root application component.
 */
const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>(defaultAuth);

  // On mount, attempt to restore token from localStorage and validate it.
  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    if (!storedToken) {
      setAuth({ user: null, token: null, loading: false });
      return;
    }
    // Attach token temporarily for validation request.
    const validate = async () => {
      try {
        const response = await apiClient.get('/auth/validate', {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        const userData: User = response.data;
        setAuth({ user: userData, token: storedToken, loading: false });
      } catch (error) {
        console.warn('Token validation failed, clearing stored token.', error);
        localStorage.removeItem('jwt_token');
        setAuth({ user: null, token: null, loading: false });
      }
    };
    validate();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PortfolioDashboard />
            </ProtectedRoute>
          }
        />
        {/* Default route handling */}
        <Route
          path="*"
          element={
            auth.token ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </AuthContext.Provider>
  );
};

export default App;

import { useState, useContext, createContext, ReactNode, FormEvent } from 'react';
import api from '../services/api';
import { Token } from '../types';

interface AuthState {
  user: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

/**
 * Provides authentication logic (login, logout) and stores the current user.
 * The JWT payload is decoded to extract the `sub` claim which represents the username.
 */
function useProvideAuth(): AuthState {
  const [user, setUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      const token: Token = await api.login(email, password);
      // Decode JWT payload (base64url) to extract username (sub).
      const payloadBase64 = token.access_token.split('.')[1];
      const decoded = JSON.parse(atob(payloadBase64));
      setUser(decoded.sub);
      setError(null);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return { user, login, logout, error };
}

export const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useProvideAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
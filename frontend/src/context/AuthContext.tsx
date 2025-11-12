import { createContext, useContext, ReactNode, useState } from 'react';
import api from '../services/api';

interface ContextValue {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<ContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('access_token')
  );

  const login = async (email: string, password: string) => {
    const resp = await api.login(email, password);
    setToken(resp.access_token);
    localStorage.setItem('access_token', resp.access_token);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('access_token');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return ctx;
};
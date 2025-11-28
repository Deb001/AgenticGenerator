import React, { createContext, useContext, useState, ReactNode } from 'react';
import { login as apiLogin } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface AuthContextProps {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setAuth] = useState<boolean>(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    const token = await apiLogin(email, password);
    localStorage.setItem('token', token);
    setAuth(true);
    navigate('/portfolios');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};

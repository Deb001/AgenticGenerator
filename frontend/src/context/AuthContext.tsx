import React, { createContext, useState, FC, ReactNode, useEffect } from 'react';
import { apiClient } from '../api/client';

export interface User {
  email: string;
  role: 'advisor' | 'client';
  fullName?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Decodes a JWT payload (base64url) without verification.
 * Used only for extracting user information client‑side.
 */
function decodeJwt(token: string): any {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const login = (newToken: string) => {
    localStorage.setItem('access_token', newToken);
    setToken(newToken);
    const payload = decodeJwt(newToken);
    if (payload && payload.email && payload.role) {
      setUser({ email: payload.email, role: payload.role, fullName: payload.full_name });
    } else {
      setUser(null);
    }
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    delete apiClient.defaults.headers.common['Authorization'];
  };

  // Load token from storage on mount and validate (optional backend call)
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      const payload = decodeJwt(storedToken);
      if (payload && payload.exp * 1000 > Date.now()) {
        login(storedToken);
      } else {
        logout();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue: AuthContextType = {
    user,
    token,
    login,
    logout,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

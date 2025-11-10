import { useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';

interface JwtPayload {
  exp: number;
  [key: string]: any;
}

/**
 * Hook that provides authentication status and utilities.
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwt_decode<JwtPayload>(token);
        const now = Date.now() / 1000;
        if (decoded.exp > now) {
          setIsAuthenticated(true);
          setUser(decoded);
        } else {
          localStorage.removeItem('access_token');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch {
        localStorage.removeItem('access_token');
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('access_token', token);
    const decoded = jwt_decode<JwtPayload>(token);
    setIsAuthenticated(true);
    setUser(decoded);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/login';
  };

  return { isAuthenticated, user, login, logout };
}
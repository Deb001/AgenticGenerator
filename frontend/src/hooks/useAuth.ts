import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';

/**
 * Authentication hook.
 *
 * For security we keep the JWT only in memory (React state) to avoid persisting it
 * in localStorage where it could be accessed by malicious scripts. The token is
 * attached to outgoing Axios requests via an interceptor.
 */
const useAuth = () => {
  const [token, setTokenState] = useState<string | null>(null);

  // Keep Axios instance in sync with token changes
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use((config) => {
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, [token]);

  const setToken = useCallback((newToken: string) => {
    setTokenState(newToken);
  }, []);

  const logout = useCallback(() => {
    setTokenState(null);
  }, []);

  const isAuthenticated = !!token;

  return { token, setToken, logout, isAuthenticated };
};

export default useAuth;

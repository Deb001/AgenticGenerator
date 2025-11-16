import { useState, useEffect } from 'react';
import axios from '../api';
import jwt_decode from 'jwt-decode';

/**
 * Minimal JWT payload used for client‑side expiration checks.
 */
interface JwtPayload {
  sub: string;
  exp: number;
  iat: number;
}

/**
 * Custom React hook that encapsulates authentication logic.
 * It provides login, logout and a boolean indicating whether the user is authenticated.
 */
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  /**
   * Reads the access token from the cookie store and validates its expiration.
   */
  const checkAuth = () => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1];
    if (token) {
      try {
        const payload = jwt_decode<JwtPayload>(token);
        const now = Date.now() / 1000;
        setIsAuthenticated(payload.exp > now);
      } catch {
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  };

  // Run once on component mount to initialise authentication state.
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Performs a login request. The backend is expected to set an HttpOnly cookie
   * named `access_token` on successful authentication.
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      await axios.post('/auth/login', { email, password });
      // After the server sets the cookie, re‑evaluate auth state.
      checkAuth();
    } catch (err) {
      // Propagate a user‑friendly error message.
      const message =
        err.response?.data?.detail || 'Login failed. Please check your credentials.';
      throw new Error(message);
    }
  };

  /**
   * Calls the logout endpoint which clears the HttpOnly cookie.
   */
  const logout = async (): Promise<void> => {
    try {
      await axios.post('/auth/logout');
    } finally {
      setIsAuthenticated(false);
    }
  };

  /**
   * Optional token refresh – not used directly in the UI but kept for completeness.
   */
  const refreshToken = async (): Promise<void> => {
    try {
      await axios.post('/auth/refresh');
      checkAuth();
    } catch {
      setIsAuthenticated(false);
    }
  };

  return { isAuthenticated, login, logout, refreshToken };
};

export default useAuth;
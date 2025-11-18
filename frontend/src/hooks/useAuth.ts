import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Simple user representation extracted from a JWT payload.
 */
interface User {
  id: number;
  role: string;
}

/**
 * Custom hook that reads a JWT token from localStorage, decodes it, and
 * provides the current user and loading state.
 *
 * In a production app you would verify the token server‑side or call a
 * `/me` endpoint. Here we decode the payload client‑side for simplicity.
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const payloadJson = atob(payloadBase64);
        const payload = JSON.parse(payloadJson);
        setUser({ id: payload.sub, role: payload.role });
      } catch (e) {
        console.error('Failed to parse JWT:', e);
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  return { user, loading, setUser };
};

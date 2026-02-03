import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api, { setAccessToken } from '../utils/api';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  fetchProfile: () => Promise<any>;
  updateProfile: (data: any) => Promise<void>;
  handleOAuthCallback: (code: string, state: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  fetchProfile: async () => ({}),
  updateProfile: async () => {},
  handleOAuthCallback: async () => {}
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper to store token in memory and expose to api wrapper
  const storeToken = (token: string) => {
    setAccessToken(token);
    setAccessTokenState(token);
  };

  const clearSession = () => {
    setAccessToken(null);
    setAccessTokenState(null);
    setUser(null);
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { access_token, user } = response.data;
    storeToken(access_token);
    setUser(user);
  };

  const logout = async () => {
    await api.post('/auth/logout');
    clearSession();
  };

  const register = async (email: string, password: string) => {
    await api.post('/auth/signup', { email, password });
  };

  const fetchProfile = async () => {
    const response = await api.get('/users/me');
    return response.data;
  };

  const updateProfile = async (data: any) => {
    await api.put('/users/me', data);
    const refreshed = await fetchProfile();
    setUser(refreshed);
  };

  const handleOAuthCallback = async (code: string, state: string | null) => {
    const response = await api.post('/auth/google/callback', { code, state });
    const { access_token, user } = response.data;
    storeToken(access_token);
    setUser(user);
  };

  // Attempt to refresh token on app start (if refresh cookie exists)
  useEffect(() => {
    const init = async () => {
      try {
        const resp = await api.post('/auth/refresh');
        const { access_token } = resp.data;
        storeToken(access_token);
        const profile = await fetchProfile();
        setUser(profile);
      } catch {
        // No valid refresh token – stay unauthenticated
        clearSession();
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        fetchProfile,
        updateProfile,
        handleOAuthCallback
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

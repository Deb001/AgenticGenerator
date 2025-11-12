import axios from 'axios';
import { Token } from '../types';

// Base URL can be overridden via VITE_API_URL environment variable.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000
});

// Attach JWT token from localStorage to every request if present.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default {
  /**
   * Authenticate user and store JWT token.
   */
  login: async (email: string, password: string): Promise<Token> => {
    const response = await api.post<Token>('/auth/login', {
      username: email,
      password
    });
    localStorage.setItem('access_token', response.data.access_token);
    return response.data;
  },

  /** Retrieve list of portfolios for the logged‑in advisor. */
  getPortfolios: async () => {
    const response = await api.get('/portfolios');
    return response.data;
  },

  /** Retrieve a single portfolio by its ID. */
  getPortfolio: async (id: number) => {
    const response = await api.get(`/portfolios/${id}`);
    return response.data;
  },

  /** Retrieve advisory signals for a portfolio. */
  getAdvisory: async (id: number) => {
    const response = await api.get(`/advisory/${id}`);
    return response.data;
  }
};
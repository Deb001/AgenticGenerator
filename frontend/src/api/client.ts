import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import jwt_decode from 'jwt-decode';

interface JwtPayload {
  exp: number;
  [key: string]: any;
}

// Axios instance with base URL from environment variable
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Request interceptor to add Authorization header and handle token expiration
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwt_decode<JwtPayload>(token);
        const now = Date.now() / 1000;
        if (decoded.exp < now) {
          // Token expired – clear and redirect to login
          localStorage.removeItem('access_token');
          window.location.href = '/login';
          return Promise.reject(new Error('Token expired'));
        }
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      } catch (e) {
        console.error('Invalid JWT token', e);
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return Promise.reject(e);
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor to handle authentication errors globally
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response && [401, 403].includes(error.response.status)) {
      console.warn('Authentication error, redirecting to login');
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const client = {
  get: api.get,
  post: api.post,
  put: api.put,
  delete: api.delete,
};
import axios from 'axios';

/**
 * Pre-configured Axios instance for communicating with the backend API.
 * Base URL defaults to http://localhost:4000/api but can be overridden
 * via the VITE_API_URL environment variable.
 * JWT token (if present) is attached as a Bearer token in the Authorization header.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    'Content-Type': 'application/json',
  },
});

// Global response interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Remove invalid token and redirect to login page
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

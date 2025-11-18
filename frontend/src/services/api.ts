import axios from 'axios';

/**
 * Axios instance pre‑configured with the API base path and JWT interceptor.
 */
const api = axios.create({
  baseURL: '/api'
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

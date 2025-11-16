import axios from 'axios';

// Create an Axios instance with the base URL taken from the environment.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
});

// Response interceptor to handle authentication errors globally.
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Redirect unauthenticated users to the login page.
      window.location.href = '/login';
    }
    // Log detailed error information only in development mode.
    if (process.env.NODE_ENV === 'development') {
      console.error('API error', error);
    }
    return Promise.reject(error);
  }
);

export default api;
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor to handle 401 globally
apiClient.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      // Optional: could trigger logout or token refresh here
      console.warn('Unauthorized request - token may be invalid or expired');
    }
    return Promise.reject(error);
  }
);

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || '',
  withCredentials: true // needed for httpOnly refresh token cookie
});

// Request interceptor to add access token if present
api.interceptors.request.use((config: AxiosRequestConfig) => {
  if (accessToken && config.headers) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor to handle 401 and attempt token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL || ''}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = refreshResponse.data.access_token;
        setAccessToken(newToken);
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        }
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed – clear session and redirect to login
        setAccessToken(null);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

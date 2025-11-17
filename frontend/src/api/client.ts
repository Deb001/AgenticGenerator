import { AxiosInstance, create, AxiosRequestConfig, AxiosError } from 'axios';

/**
 * Create an Axios instance pre‑configured with base URL and JSON headers.
 */
const apiClient: AxiosInstance = create({
  baseURL: process.env.REACT_APP_API_URL ?? '',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

/**
 * Request interceptor adds JWT Authorization header if token exists in localStorage.
 */
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('jwt_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Axios request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor handles 401 Unauthorized globally.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      console.warn('Received 401 – clearing JWT and reloading page.');
      localStorage.removeItem('jwt_token');
      window.location.reload();
    }
    console.error('Axios response error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;

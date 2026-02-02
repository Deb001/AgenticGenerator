import axios from 'axios';
import { API_BASE_URL } from '@/utils/constants';

// Create an Axios instance with base URL and credentials flag.
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true // allow cookies (e.g., httpOnly JWT) to be sent automatically
});

export default api;

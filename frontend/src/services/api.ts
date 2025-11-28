import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email: string, password: string): Promise<string> => {
  const response = await api.post('/auth/login', { email, password });
  return response.data.token;
};

export const fetchPortfolios = async () => {
  const response = await api.get('/portfolios');
  return response.data;
};

export const fetchPortfolioDetail = async (id: number) => {
  const response = await api.get(`/portfolios/${id}`);
  return response.data;
};

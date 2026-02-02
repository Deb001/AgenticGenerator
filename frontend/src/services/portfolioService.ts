import api from '@/services/api';
import { Portfolio, PortfolioItem } from '@/utils/constants';

export const getPortfolios = async (): Promise<Portfolio[]> => {
  const response = await api.get('/api/portfolios');
  return response.data;
};

export const getPortfolio = async (id: string): Promise<Portfolio> => {
  const response = await api.get(`/api/portfolios/${id}`);
  return response.data;
};

export const createPortfolio = async (payload: { name: string; type: string }): Promise<Portfolio> => {
  const response = await api.post('/api/portfolios', payload);
  return response.data;
};

export const updatePortfolio = async (id: string, payload: { name?: string; type?: string }): Promise<Portfolio> => {
  const response = await api.put(`/api/portfolios/${id}`, payload);
  return response.data;
};

export const deletePortfolio = async (id: string): Promise<void> => {
  await api.delete(`/api/portfolios/${id}`);
};

export const createItem = async (
  portfolioId: string,
  item: Omit<PortfolioItem, 'id' | 'currentValue'>
): Promise<PortfolioItem> => {
  const response = await api.post(`/api/portfolios/${portfolioId}/items`, item);
  return response.data;
};

export const updateItem = async (
  portfolioId: string,
  itemId: string,
  item: Omit<PortfolioItem, 'id' | 'currentValue'>
): Promise<PortfolioItem> => {
  const response = await api.put(`/api/portfolios/${portfolioId}/items/${itemId}`, item);
  return response.data;
};

export const deleteItem = async (portfolioId: string, itemId: string): Promise<void> => {
  await api.delete(`/api/portfolios/${portfolioId}/items/${itemId}`);
};

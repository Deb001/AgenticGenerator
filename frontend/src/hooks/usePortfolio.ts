import { useCallback } from 'react';
import api from '../utils/api';

interface Portfolio {
  id: string;
  name: string;
  description?: string;
}

interface PortfolioItem {
  id: string;
  ticker: string;
  shares: number;
  purchase_price: number;
}

export const usePortfolio = () => {
  const getPortfolios = useCallback(async (): Promise<Portfolio[]> => {
    const response = await api.get('/portfolios');
    return response.data;
  }, []);

  const getPortfolio = useCallback(async (id: string): Promise<Portfolio> => {
    const response = await api.get(`/portfolios/${id}`);
    return response.data;
  }, []);

  const createPortfolio = useCallback(async (data: { name: string; description?: string }) => {
    await api.post('/portfolios', data);
  }, []);

  const updatePortfolio = useCallback(async (id: string, data: { name: string; description?: string }) => {
    await api.put(`/portfolios/${id}`, data);
  }, []);

  const deletePortfolio = useCallback(async (id: string) => {
    await api.delete(`/portfolios/${id}`);
  }, []);

  const getPortfolioItems = useCallback(async (portfolioId: string): Promise<PortfolioItem[]> => {
    const response = await api.get(`/portfolios/${portfolioId}/items`);
    return response.data;
  }, []);

  const addItem = useCallback(async (portfolioId: string, item: { ticker: string; shares: number; purchase_price: number }) => {
    await api.post(`/portfolios/${portfolioId}/items`, item);
  }, []);

  const updateItem = useCallback(async (portfolioId: string, itemId: string, item: Partial<PortfolioItem>) => {
    await api.patch(`/portfolios/${portfolioId}/items/${itemId}`, item);
  }, []);

  const deleteItem = useCallback(async (portfolioId: string, itemId: string) => {
    await api.delete(`/portfolios/${portfolioId}/items/${itemId}`);
  }, []);

  return {
    getPortfolios,
    getPortfolio,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    getPortfolioItems,
    addItem,
    updateItem,
    deleteItem
  };
};

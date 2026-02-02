import { useState, useCallback } from 'react';
import {
  getPortfolios,
  getPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  createItem,
  updateItem,
  deleteItem
} from '@/services/portfolioService';
import { Portfolio, PortfolioItem } from '@/utils/constants';

/**
 * Hook that encapsulates portfolio CRUD operations and state management.
 */
const usePortfolios = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPortfolios();
      setPortfolios(data);
    } catch (err: any) {
      setError('Failed to fetch portfolios');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPortfolio = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const p = await getPortfolio(id);
      return p;
    } catch (err: any) {
      setError('Failed to fetch portfolio');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addPortfolio = useCallback(async (payload: { name: string; type: string }) => {
    setLoading(true);
    try {
      const newPort = await createPortfolio(payload);
      setPortfolios((prev) => [...prev, newPort]);
    } catch (err: any) {
      setError('Failed to create portfolio');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const editPortfolio = useCallback(async (id: string, payload: { name?: string; type?: string }) => {
    setLoading(true);
    try {
      const updated = await updatePortfolio(id, payload);
      setPortfolios((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (err: any) {
      setError('Failed to update portfolio');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removePortfolio = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await deletePortfolio(id);
      setPortfolios((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError('Failed to delete portfolio');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Item operations are thin wrappers around service calls; UI components refresh manually.
  const addItem = async (portfolioId: string, item: Omit<PortfolioItem, 'id' | 'currentValue'>) => {
    await createItem(portfolioId, item);
  };

  const editItem = async (portfolioId: string, itemId: string, item: Omit<PortfolioItem, 'id' | 'currentValue'>) => {
    await updateItem(portfolioId, itemId, item);
  };

  const removeItem = async (portfolioId: string, itemId: string) => {
    await deleteItem(portfolioId, itemId);
  };

  return {
    portfolios,
    loading,
    error,
    fetchPortfolios,
    getPortfolio: fetchPortfolio,
    createPortfolio: addPortfolio,
    updatePortfolio: editPortfolio,
    deletePortfolio: removePortfolio,
    createItem: addItem,
    updateItem: editItem,
    deleteItem: removeItem
  };
};

export default usePortfolios;

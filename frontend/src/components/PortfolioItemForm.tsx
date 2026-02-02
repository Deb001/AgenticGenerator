import React, { useState, useEffect } from 'react';
import { createItem, updateItem } from '@/services/portfolioService';
import { PortfolioItem } from '@/utils/constants';

type Props = {
  portfolioId: string;
  existingItem?: PortfolioItem | null;
  onClose: () => void;
  onSaved: () => void;
};

const PortfolioItemForm: React.FC<Props> = ({ portfolioId, existingItem, onClose, onSaved }) => {
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgCost, setAvgCost] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingItem) {
      setTicker(existingItem.ticker);
      setQuantity(existingItem.quantity.toString());
      setAvgCost(existingItem.avgCost.toString());
    }
  }, [existingItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!ticker || !quantity || !avgCost) {
      setError('All fields are required');
      return;
    }
    const qty = Number(quantity);
    const cost = Number(avgCost);
    if (isNaN(qty) || isNaN(cost) || qty <= 0 || cost <= 0) {
      setError('Quantity and cost must be positive numbers');
      return;
    }
    setLoading(true);
    try {
      if (existingItem) {
        await updateItem(portfolioId, existingItem.id, { ticker, quantity: qty, avgCost: cost });
      } else {
        await createItem(portfolioId, { ticker, quantity: qty, avgCost: cost });
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow w-96">
        <h3 className="text-xl font-bold mb-4">
          {existingItem ? 'Edit Item' : 'Add New Item'}
        </h3>
        {error && <p className="text-red-600 mb-2" role="alert">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block mb-1">Ticker</label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              className="w-full border rounded px-2 py-1"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border rounded px-2 py-1"
              min="0"
              step="any"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Average Cost</label>
            <input
              type="number"
              value={avgCost}
              onChange={(e) => setAvgCost(e.target.value)}
              className="w-full border rounded px-2 py-1"
              min="0"
              step="any"
              required
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/80"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PortfolioItemForm;

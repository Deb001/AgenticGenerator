import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usePortfolios from '@/hooks/usePortfolios';
import PortfolioItemForm from '@/components/PortfolioItemForm';
import { Portfolio, PortfolioItem } from '@/utils/constants';

const PortfolioDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getPortfolio,
    deletePortfolio,
    deleteItem,
    fetchPortfolios,
    portfolios
  } = usePortfolios();

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        const p = await getPortfolio(id);
        setPortfolio(p);
      } catch (err: any) {
        setError('Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, getPortfolio]);

  const handleDeletePortfolio = async () => {
    if (!id) return;
    if (!window.confirm('Delete this portfolio?')) return;
    try {
      await deletePortfolio(id);
      await fetchPortfolios();
      navigate('/portfolios');
    } catch {
      setError('Failed to delete portfolio');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!id) return;
    if (!window.confirm('Delete this item?')) return;
    try {
      await deleteItem(id, itemId);
      const updated = await getPortfolio(id);
      setPortfolio(updated);
    } catch {
      setError('Failed to delete item');
    }
  };

  const openNewItemForm = () => {
    setEditingItem(null);
    setShowItemForm(true);
  };

  const openEditItemForm = (item: PortfolioItem) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  const closeItemForm = () => {
    setShowItemForm(false);
    setEditingItem(null);
  };

  const refreshPortfolio = async () => {
    if (!id) return;
    const p = await getPortfolio(id);
    setPortfolio(p);
  };

  if (loading) return <p>Loading portfolio...</p>;
  if (error) return <p className="text-red-600" role="alert">{error}</p>;
  if (!portfolio) return <p>Portfolio not found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{portfolio.name}</h2>
        <div className="space-x-2">
          <button
            onClick={openNewItemForm}
            className="bg-primary text-white px-3 py-1 rounded hover:bg-primary/80"
          >
            Add Item
          </button>
          <button
            onClick={handleDeletePortfolio}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Delete Portfolio
          </button>
        </div>
      </div>
      <table className="w-full table-auto border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-2 py-1">Ticker</th>
            <th className="px-2 py-1">Quantity</th>
            <th className="px-2 py-1">Avg. Cost</th>
            <th className="px-2 py-1">Current Value</th>
            <th className="px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {portfolio.items?.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="px-2 py-1">{item.ticker}</td>
              <td className="px-2 py-1 text-right">{item.quantity}</td>
              <td className="px-2 py-1 text-right">${item.avgCost.toFixed(2)}</td>
              <td className="px-2 py-1 text-right">${item.currentValue.toFixed(2)}</td>
              <td className="px-2 py-1 space-x-2">
                <button
                  onClick={() => openEditItemForm(item)}
                  className="text-primary underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-red-600 underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showItemForm && (
        <PortfolioItemForm
          portfolioId={portfolio.id}
          existingItem={editingItem}
          onClose={closeItemForm}
          onSaved={refreshPortfolio}
        />
      )}
    </div>
  );
};

export default PortfolioDetail;

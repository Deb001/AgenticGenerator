import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePortfolio } from '../hooks/usePortfolio';
import { useToast } from '../components/Toast';
import ConfirmDeleteModal from '../components/Modals/ConfirmDeleteModal';

interface PortfolioItem {
  id: string;
  ticker: string;
  shares: number;
  purchase_price: number;
}

const MAX_TICKER_LENGTH = 20;

const PortfolioDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getPortfolioItems, addItem, deleteItem } = usePortfolio();
  const { addToast } = useToast();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const loadItems = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getPortfolioItems(id);
      setItems(data);
    } catch {
      addToast('Failed to load items.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const ticker = (form.elements.namedItem('ticker') as HTMLInputElement).value.trim();
    const shares = parseFloat((form.elements.namedItem('shares') as HTMLInputElement).value);
    const price = parseFloat((form.elements.namedItem('price') as HTMLInputElement).value);
    if (!ticker || ticker.length > MAX_TICKER_LENGTH || isNaN(shares) || shares <= 0 || isNaN(price) || price <= 0) {
      addToast('Please fill all fields correctly.', 'error');
      return;
    }
    try {
      await addItem(id!, { ticker, shares, purchase_price: price });
      addToast('Item added', 'success');
      loadItems();
    } catch {
      addToast('Add failed. Please try again.', 'error');
    } finally {
      setShowAddForm(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await deleteItem(id!, itemId);
      addToast('Item deleted', 'success');
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch {
      addToast('Delete failed. Please try again.', 'error');
    } finally {
      setItemToDelete(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Portfolio Details</h2>
      {loading ? (
        <p>Loading items...</p>
      ) : (
        <>
          <button
            onClick={() => setShowAddForm(true)}
            className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add Holding
          </button>
          {items.length === 0 ? (
            <p>No holdings yet.</p>
          ) : (
            <table className="min-w-full table-auto border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Ticker</th>
                  <th className="px-4 py-2 border">Shares</th>
                  <th className="px-4 py-2 border">Purchase Price</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 border">{item.ticker}</td>
                    <td className="px-4 py-2 border">{item.shares}</td>
                    <td className="px-4 py-2 border">${item.purchase_price.toFixed(2)}</td>
                    <td className="px-4 py-2 border space-x-2">
                      {/* Edit functionality could be added here */}
                      <button
                        onClick={() => setItemToDelete(item.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
      {showAddForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add Holding</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block mb-1" htmlFor="ticker">
                  Ticker Symbol
                </label>
                <input
                  id="ticker"
                  name="ticker"
                  type="text"
                  required
                  maxLength={MAX_TICKER_LENGTH}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block mb-1" htmlFor="shares">
                  Shares
                </label>
                <input
                  id="shares"
                  name="shares"
                  type="number"
                  step="any"
                  min="0"
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block mb-1" htmlFor="price">
                  Purchase Price
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="any"
                  min="0"
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {itemToDelete && (
        <ConfirmDeleteModal
          title="Delete Holding"
          message="Are you sure you want to delete this holding?"
          onConfirm={() => handleDelete(itemToDelete)}
          onCancel={() => setItemToDelete(null)}
        />
      )}
    </div>
  );
};

export default PortfolioDetail;

import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { useToast } from '../components/Toast';

interface Props {
  portfolioId?: string; // undefined for create
  onClose: () => void;
  onSaved: () => void; // callback to refresh list
}

interface FormData {
  name: string;
  description?: string;
}

const MAX_NAME_LENGTH = 255;
const MAX_DESC_LENGTH = 1000;

const PortfolioEditor: React.FC<Props> = ({ portfolioId, onClose, onSaved }) => {
  const { getPortfolio, createPortfolio, updatePortfolio } = usePortfolio();
  const { addToast } = useToast();
  const [form, setForm] = useState<FormData>({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (portfolioId) {
      setLoading(true);
      getPortfolio(portfolioId)
        .then(p => setForm({ name: p.name, description: p.description || '' }))
        .catch(() => {
          addToast('Failed to load portfolio.', 'error');
        })
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolioId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.name.length > MAX_NAME_LENGTH) {
      addToast('Name is required and must be under 255 characters.', 'error');
      return;
    }
    if (form.description && form.description.length > MAX_DESC_LENGTH) {
      addToast('Description is too long.', 'error');
      return;
    }
    setLoading(true);
    try {
      if (portfolioId) {
        await updatePortfolio(portfolioId, form);
        addToast('Portfolio updated', 'success');
      } else {
        await createPortfolio(form);
        addToast('Portfolio created', 'success');
      }
      onSaved();
      onClose();
    } catch {
      addToast('Operation failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">
          {portfolioId ? 'Edit Portfolio' : 'New Portfolio'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={MAX_NAME_LENGTH}
              className="w-full border rounded px-3 py-2"
              value={form.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block font-medium mb-1" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              maxLength={MAX_DESC_LENGTH}
              className="w-full border rounded px-3 py-2"
              rows={3}
              value={form.description}
              onChange={handleChange}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PortfolioEditor;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../hooks/usePortfolio';
import { useToast } from '../components/Toast';
import ConfirmDeleteModal from '../components/Modals/ConfirmDeleteModal';
import PortfolioEditor from '../components/PortfolioEditor';

interface Portfolio {
  id: string;
  name: string;
  description?: string;
}

const PortfoliosList: React.FC = () => {
  const { getPortfolios, deletePortfolio } = usePortfolio();
  const { addToast } = useToast();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [portfolioToDelete, setPortfolioToDelete] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getPortfolios();
      setPortfolios(data);
    } catch {
      addToast('Failed to load portfolios.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deletePortfolio(id);
      addToast('Portfolio deleted', 'success');
      setPortfolios(prev => prev.filter(p => p.id !== id));
    } catch {
      addToast('Delete failed. Please try again.', 'error');
    } finally {
      setPortfolioToDelete(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">My Portfolios</h2>
        <button
          onClick={() => setShowEditor(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          New Portfolio
        </button>
      </div>
      {loading ? (
        <p>Loading portfolios...</p>
      ) : portfolios.length === 0 ? (
        <p>No portfolios yet. Create one!</p>
      ) : (
        <ul className="space-y-2">
          {portfolios.map(p => (
            <li
              key={p.id}
              className="flex justify-between items-center bg-white p-3 rounded shadow"
            >
              <Link to={`/portfolios/${p.id}`} className="font-medium text-blue-600 hover:underline">
                {p.name}
              </Link>
              <div className="space-x-2">
                <button
                  onClick={() => setShowEditor(true)}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => setPortfolioToDelete(p.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {showEditor && (
        <PortfolioEditor
          onClose={() => setShowEditor(false)}
          onSaved={load}
        />
      )}
      {portfolioToDelete && (
        <ConfirmDeleteModal
          title="Delete Portfolio"
          message="Are you sure you want to delete this portfolio? This action cannot be undone."
          onConfirm={() => handleDelete(portfolioToDelete)}
          onCancel={() => setPortfolioToDelete(null)}
        />
      )}
    </div>
  );
};

export default PortfoliosList;

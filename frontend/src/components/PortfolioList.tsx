import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { PortfolioRead } from '../types';

function PortfolioList() {
  const [portfolios, setPortfolios] = useState<PortfolioRead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getPortfolios()
      .then((data) => {
        setPortfolios(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to fetch portfolios', err);
        setError('Unable to load portfolios');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading portfolios...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Your Portfolios</h2>
      {portfolios.length === 0 ? (
        <p>No portfolios found.</p>
      ) : (
        <ul>
          {portfolios.map((p) => (
            <li key={p.id}>
              <Link to={`/portfolios/${p.id}`}>{p.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PortfolioList;
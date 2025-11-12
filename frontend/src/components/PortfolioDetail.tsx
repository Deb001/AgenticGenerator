import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../services/api';
import AdvisoryChart from './AdvisoryChart';
import { PortfolioRead, AdvisoryResponse } from '../types';

function PortfolioDetail() {
  const { id } = useParams<{ id: string }>();
  const [portfolio, setPortfolio] = useState<PortfolioRead | null>(null);
  const [advisory, setAdvisory] = useState<AdvisoryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .getPortfolio(Number(id))
      .then((data) => {
        setPortfolio(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to fetch portfolio', err);
        setError('Unable to load portfolio');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const fetchAdvisory = async () => {
    if (!id) return;
    try {
      const data = await api.getAdvisory(Number(id));
      setAdvisory(data);
    } catch (err) {
      console.error('Failed to fetch advisory', err);
      setError('Unable to load advisory');
    }
  };

  if (loading) return <p>Loading portfolio...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!portfolio) return <p>No portfolio data.</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h3>{portfolio.name}</h3>
      <table>
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          {portfolio.holdings.map((h) => (
            <tr key={h.id}>
              <td>{h.ticker}</td>
              <td>{h.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={fetchAdvisory}>Get Advisory</button>
      {advisory && <AdvisoryChart data={advisory.signals} />}
    </div>
  );
}

export default PortfolioDetail;
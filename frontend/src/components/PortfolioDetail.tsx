import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { PortfolioDetail as PortfolioDetailType, Holding } from '../types';
import './PortfolioDetail.css';

/**
 * Component that shows detailed information for a single portfolio, including its holdings.
 */
const PortfolioDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [portfolio, setPortfolio] = useState<PortfolioDetailType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get<PortfolioDetailType>(`/portfolios/${id}`);
        setPortfolio(response.data);
      } catch (err) {
        setError('Unable to load portfolio details.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) return <p>Loading portfolio details…</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!portfolio) return <p>No portfolio data.</p>;

  return (
    <div className="portfolio-detail-container">
      <h2>{portfolio.name} (ID: {portfolio.id})</h2>
      <p>Client: {portfolio.clientName}</p>
      <p>Created: {new Date(portfolio.createdAt).toLocaleDateString()}</p>
      <h3>Holdings</h3>
      {portfolio.holdings.length === 0 ? (
        <p>No holdings for this portfolio.</p>
      ) : (
        <table className="holdings-table">
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Quantity</th>
              <th>Avg. Cost</th>
              <th>Current Price</th>
              <th>Market Value</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.holdings.map((h: Holding) => (
              <tr key={h.id}>
                <td>{h.ticker}</td>
                <td>{h.quantity}</td>
                <td>{h.averageCost.toFixed(2)}</td>
                <td>{h.currentPrice.toFixed(2)}</td>
                <td>{(h.quantity * h.currentPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Link to="/portfolios" className="back-link">
        ← Back to Portfolio List
      </Link>
    </div>
  );
};

export default PortfolioDetail;
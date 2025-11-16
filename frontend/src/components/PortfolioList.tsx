import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Portfolio } from '../types';
import './PortfolioList.css';

/**
 * Component that fetches and displays a paginated list of portfolios.
 */
const PortfolioList: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10; // Number of portfolios per page.

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const response = await api.get<Portfolio[]>('/portfolios');
        setPortfolios(response.data);
      } catch (err) {
        setError('Failed to load portfolios.');
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolios();
  }, []);

  const totalPages = Math.ceil(portfolios.length / pageSize);
  const displayed = portfolios.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading) return <p>Loading portfolios…</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="portfolio-list-container">
      <h2>Client Portfolios</h2>
      <table className="portfolio-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Client</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {displayed.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>
                <Link to={`/portfolios/${p.id}`}>{p.name}</Link>
              </td>
              <td>{p.clientName}</td>
              <td>{new Date(p.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination-controls">
        <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default PortfolioList;
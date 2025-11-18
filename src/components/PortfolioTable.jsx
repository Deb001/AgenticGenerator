import React, { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * PortfolioTable fetches portfolio data from the backend and renders it
 * in a styled, responsive table.
 */
function PortfolioTable() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/portfolios')
      .then((response) => {
        setPortfolios(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch portfolios:', err);
        setError('Unable to load portfolios.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-gray-600">Loading portfolios...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (portfolios.length === 0) {
    return <p className="text-gray-600">No portfolios found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
              ID
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
              Client Name
            </th>
            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
              Total Value (₹)
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {portfolios.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-2 text-sm text-gray-900">{p.id}</td>
              <td className="px-4 py-2 text-sm text-gray-900">{p.clientName}</td>
              <td className="px-4 py-2 text-sm text-gray-900">
                {p.totalValue?.toLocaleString('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PortfolioTable;

import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Holding {
  id: number;
  stock_ticker: string;
  quantity: number;
}

const HoldingTable: React.FC<{ holdings: Holding[] }> = ({ holdings }) => {
  const navigate = useNavigate();
  return (
    <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-card">
      <thead className="bg-primary text-white">
        <tr>
          <th className="p-2 text-left">Ticker</th>
          <th className="p-2 text-left">Quantity</th>
          <th className="p-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {holdings.map((h) => (
          <tr key={h.id} className="border-b">
            <td className="p-2">{h.stock_ticker}</td>
            <td className="p-2">{h.quantity}</td>
            <td className="p-2">
              <button
                onClick={() => navigate(`/holdings/${h.id}/signals`)}
                className="bg-secondary text-white px-3 py-1 rounded hover:bg-accent transition"
              >
                View Signals
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default HoldingTable;

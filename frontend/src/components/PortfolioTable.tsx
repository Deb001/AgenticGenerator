import React from 'react';
import SignalBadge from './SignalBadge';
import Chart from './Chart';

interface Portfolio {
  id: number;
  client_name: string;
  holdings: string;
  signal: 'Buy' | 'Hold' | 'Sell';
}

interface Props {
  portfolios: Portfolio[];
}

const PortfolioTable: React.FC<Props> = ({ portfolios }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Holdings</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Signal</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {portfolios.map((p) => (
            <tr key={p.id}>
              <td className="px-6 py-4 whitespace-nowrap">{p.client_name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{p.holdings}</td>
              <td className="px-6 py-4 whitespace-nowrap"><SignalBadge signal={p.signal} /></td>
              <td className="px-6 py-4 whitespace-nowrap"><Chart portfolioId={p.id} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PortfolioTable;
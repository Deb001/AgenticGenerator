import React from 'react';

export interface Holding {
  ticker: string;
  quantity: number;
  average_price: number;
}

export interface Portfolio {
  id: number;
  client_name: string;
  holdings: Holding[];
}

interface Props {
  portfolios: Portfolio[];
  onSelect: (id: number) => void;
}

/**
 * Simple HTML table that lists portfolios.
 * Clicking a row invokes the onSelect callback with the portfolio id.
 */
const PortfolioTable: React.FC<Props> = ({ portfolios, onSelect }) => {
  const handleRowClick = (id: number) => {
    onSelect(id);
  };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Portfolio ID</th>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Client Name</th>
          <th style={{ border: '1px solid #ddd', padding: '8px' }}>Holdings Count</th>
        </tr>
      </thead>
      <tbody>
        {portfolios.map((p) => (
          <tr
            key={p.id}
            onClick={() => handleRowClick(p.id)}
            style={{ cursor: 'pointer', backgroundColor: '#f9f9f9' }}
          >
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{p.id}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{p.client_name}</td>
            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{p.holdings.length}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PortfolioTable;
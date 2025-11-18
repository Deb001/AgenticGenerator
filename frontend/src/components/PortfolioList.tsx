import React from 'react';

interface Props {
  portfolios: any[];
  onSelect: (p: any) => void;
}

/**
 * Renders a scrollable list of portfolios.
 */
const PortfolioList: React.FC<Props> = ({ portfolios, onSelect }) => {
  return (
    <div className='bg-white rounded-lg shadow p-4 overflow-y-auto max-h-96'>
      <h2 className='text-xl font-semibold mb-3 text-secondary'>Portfolios</h2>
      <ul>
        {portfolios.map((p) => (
          <li
            key={p.id}
            className='p-2 rounded hover:bg-primary hover:text-white cursor-pointer transition'
            onClick={() => onSelect(p)}
          >
            {p.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PortfolioList;

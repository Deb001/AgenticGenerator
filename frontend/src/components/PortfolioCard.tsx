import React from 'react';
import { Link } from 'react-router-dom';
import { Portfolio } from '@/utils/constants';

type Props = {
  portfolio: Portfolio;
};

const PortfolioCard: React.FC<Props> = ({ portfolio }) => {
  // Simple placeholder for summary statistics.
  const totalValue = portfolio.items?.reduce((sum, item) => sum + item.currentValue, 0) || 0;

  return (
    <div className="border rounded p-4 shadow hover:shadow-lg transition">
      <h3 className="text-xl font-semibold mb-2">
        <Link to={`/portfolios/${portfolio.id}`} className="text-primary hover:underline">
          {portfolio.name}
        </Link>
      </h3>
      <p className="text-gray-600 mb-1">Type: {portfolio.type}</p>
      <p className="text-gray-800 font-medium">Total Value: ${totalValue.toFixed(2)}</p>
    </div>
  );
};

export default PortfolioCard;

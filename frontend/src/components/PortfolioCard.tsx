import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Portfolio {
  id: number;
  name: string;
  created_at: string;
}

const PortfolioCard: React.FC<{ portfolio: Portfolio }> = ({ portfolio }) => {
  const navigate = useNavigate();
  return (
    <div
      className="bg-white p-4 rounded-lg shadow-card hover:shadow-lg transition cursor-pointer"
      onClick={() => navigate(`/portfolios/${portfolio.id}/holdings`)}
    >
      <h3 className="text-lg font-medium text-primary">{portfolio.name}</h3>
      <p className="text-sm text-gray-500">Created: {new Date(portfolio.created_at).toLocaleDateString()}</p>
    </div>
  );
};

export default PortfolioCard;

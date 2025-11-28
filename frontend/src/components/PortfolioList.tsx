import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';

interface Portfolio {
  id: number;
  name: string;
  description: string;
  totalValue: number;
}

interface Props {
  portfolios: Portfolio[];
  onSelect: (portfolio: Portfolio) => void;
}

const PortfolioList: React.FC<Props> = ({ portfolios, onSelect }) => {
  const navigate = useNavigate();

  const handleView = (p: Portfolio) => {
    onSelect(p);
    navigate(`/portfolios/${p.id}`);
  };

  return (
    <div className="p-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {portfolios.map(p => (
        <div
          key={p.id}
          className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-4 shadow-lg hover:shadow-xl transition"
        >
          <h3 className="text-xl font-semibold mb-2">{p.name}</h3>
          <p className="text-sm mb-4">{p.description}</p>
          <p className="text-lg font-medium mb-4">${p.totalValue.toLocaleString()}</p>
          <Button onClick={() => handleView(p)} className="w-full">
            View Details
          </Button>
        </div>
      ))}
    </div>
  );
};

export default PortfolioList;

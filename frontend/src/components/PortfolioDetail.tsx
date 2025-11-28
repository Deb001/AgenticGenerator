import React from 'react';
import Table from './ui/Table';
import Chart from './Chart';
import Button from './ui/Button';
import { useNavigate } from 'react-router-dom';

interface Holding {
  symbol: string;
  quantity: number;
  price: number;
  marketValue: number;
}

interface Portfolio {
  id: number;
  name: string;
  description: string;
  totalValue: number;
  holdings: Holding[];
  history: { date: string; value: number }[];
}

interface Props {
  portfolio: Portfolio;
}

const PortfolioDetail: React.FC<Props> = ({ portfolio }) => {
  const navigate = useNavigate();

  const holdingsColumns = [
    { header: 'Symbol', accessor: 'symbol' as const },
    { header: 'Quantity', accessor: 'quantity' as const },
    { header: 'Price', accessor: 'price' as const, render: (v: number) => `$${v.toFixed(2)}` },
    { header: 'Market Value', accessor: 'marketValue' as const, render: (v: number) => `$${v.toLocaleString()}` }
  ];

  return (
    <div className="p-6 space-y-6">
      <Button onClick={() => navigate('/portfolios')} className="mb-4">
        ← Back to List
      </Button>
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 shadow">
        <h2 className="text-2xl font-bold mb-2">{portfolio.name}</h2>
        <p className="mb-4 text-gray-200">{portfolio.description}</p>
        <p className="text-xl font-semibold mb-6">Total Value: ${portfolio.totalValue.toLocaleString()}</p>
        <Chart data={portfolio.history} />
        <h3 className="text-xl font-semibold mt-8 mb-4">Holdings</h3>
        <Table columns={holdingsColumns} data={portfolio.holdings} />
      </div>
    </div>
  );
};

export default PortfolioDetail;

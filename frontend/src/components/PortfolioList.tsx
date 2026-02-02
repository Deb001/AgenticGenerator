import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import usePortfolios from '@/hooks/usePortfolios';
import PortfolioCard from '@/components/PortfolioCard';
import { Portfolio } from '@/utils/constants';

const PortfolioList: React.FC = () => {
  const { portfolios, fetchPortfolios, loading, error } = usePortfolios();

  useEffect(() => {
    fetchPortfolios();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Portfolios</h2>
        <Link
          to="/portfolios/new"
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80"
        >
          Create New
        </Link>
      </div>
      {loading && <p>Loading portfolios...</p>}
      {error && <p className="text-red-600" role="alert">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portfolios.map((p: Portfolio) => (
          <PortfolioCard key={p.id} portfolio={p} />
        ))}
      </div>
    </div>
  );
};

export default PortfolioList;

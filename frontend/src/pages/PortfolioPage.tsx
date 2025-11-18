import React, { useEffect, useState } from 'react';
import PortfolioList from '../components/PortfolioList';
import PortfolioDetail from '../components/PortfolioDetail';
import api from '../services/api';

/**
 * Page that fetches the advisor's portfolios and displays them.
 */
const PortfolioPage: React.FC = () => {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const res = await api.get('/portfolios');
        setPortfolios(res.data);
      } catch (err) {
        console.error('Failed to load portfolios:', err);
      }
    };
    fetchPortfolios();
  }, []);

  const handleSelect = (portfolio: any) => {
    setSelected(portfolio);
  };

  return (
    <div className='p-6 bg-gray-100 min-h-screen'>
      <h1 className='text-3xl font-bold mb-4 text-primary'>My Portfolios</h1>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <PortfolioList portfolios={portfolios} onSelect={handleSelect} />
        {selected && <PortfolioDetail portfolio={selected} />}
      </div>
    </div>
  );
};

export default PortfolioPage;

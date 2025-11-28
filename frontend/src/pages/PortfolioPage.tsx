import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PortfolioList from '../components/PortfolioList';
import PortfolioDetail from '../components/PortfolioDetail';
import { fetchPortfolios, fetchPortfolioDetail } from '../services/api';

const PortfolioPage = () => {
  const { id } = useParams<{ id?: string }>();
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPortfolios();
        setPortfolios(data);
        if (id) {
          const detail = await fetchPortfolioDetail(Number(id));
          setSelected(detail);
        }
      } catch {
        // Fallback to mock data if API fails
        const { mockPortfolios } = await import('../mock/data');
        setPortfolios(mockPortfolios);
      }
    };
    load();
  }, [id]);

  if (selected) {
    return <PortfolioDetail portfolio={selected} />;
  }

  return <PortfolioList portfolios={portfolios} onSelect={setSelected} />;
};

export default PortfolioPage;

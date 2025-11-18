import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PortfolioCard from '../components/PortfolioCard';
import useAuth from '../hooks/useAuth';

interface Portfolio {
  id: number;
  name: string;
  created_at: string;
}

const PortfolioListPage: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const fetchPortfolios = async () => {
      const res = await axios.get('/api/portfolios/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPortfolios(res.data);
    };
    fetchPortfolios();
  }, [token, navigate]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Your Portfolios</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portfolios.map((p) => (
          <PortfolioCard key={p.id} portfolio={p} />
        ))}
      </div>
    </div>
  );
};

export default PortfolioListPage;

import React, { useEffect, useState } from 'react';
import api from '../services/api';
import PortfolioTable from '../components/PortfolioTable';
import { useAuth } from '../hooks/useAuth';
import { mockPortfolios } from '../mock/mockPortfolios';

interface Portfolio {
  id: number;
  client_name: string;
  holdings: string;
  signal: 'Buy' | 'Hold' | 'Sell';
  historical_returns: number[];
}

const Dashboard: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const { token, logout } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/portfolios', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPortfolios(response.data);
      } catch (err) {
        console.warn('API failed, using mock data');
        setPortfolios(mockPortfolios as any);
      }
    };
    fetchData();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Advisor Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </header>
      <PortfolioTable portfolios={portfolios} />
    </div>
  );
};

export default Dashboard;
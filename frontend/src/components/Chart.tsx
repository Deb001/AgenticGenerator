import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { mockPortfolios } from '../mock/mockPortfolios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Props {
  portfolioId: number;
}

const ChartComponent: React.FC<Props> = ({ portfolioId }) => {
  const [data, setData] = useState<number[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchChart = async () => {
      try {
        const response = await api.get(`/portfolios/${portfolioId}/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(response.data.returns);
      } catch {
        const mock = mockPortfolios.find((p) => p.id === portfolioId);
        setData(mock?.historical_returns || []);
      }
    };
    fetchChart();
  }, [portfolioId, token]);

  const chartData = {
    labels: data.map((_, i) => i + 1),
    datasets: [
      {
        label: 'Daily Return',
        data,
        borderColor: '#1E3A8A',
        backgroundColor: 'rgba(30,58,138,0.2)',
      },
    ],
  };

  return <Line data={chartData} />;
};

export default ChartComponent;
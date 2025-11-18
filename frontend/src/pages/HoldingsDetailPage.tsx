import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import HoldingTable from '../components/HoldingTable';
import useAuth from '../hooks/useAuth';

interface Holding {
  id: number;
  stock_ticker: string;
  quantity: number;
}

const HoldingsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    const fetchHoldings = async () => {
      const res = await axios.get(`/api/holdings/portfolio/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHoldings(res.data);
    };
    fetchHoldings();
  }, [id, token, navigate]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-primary">Holdings</h2>
      <HoldingTable holdings={holdings} />
    </div>
  );
};

export default HoldingsDetailPage;

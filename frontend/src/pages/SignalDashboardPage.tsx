import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SignalChart from '../components/SignalChart';
import useAuth from '../hooks/useAuth';

interface Signal {
  date: string;
  recommendation: string;
  confidence: number;
}

const SignalDashboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [signals, setSignals] = useState<Signal[]>([]);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    const fetchSignals = async () => {
      const res = await axios.get(`/api/signals/holding/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSignals(res.data);
    };
    fetchSignals();
  }, [id, token, navigate]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-primary">Advisory Signals</h2>
      <SignalChart data={signals} />
    </div>
  );
};

export default SignalDashboardPage;

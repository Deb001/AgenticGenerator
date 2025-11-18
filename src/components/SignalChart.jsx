import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

/**
 * SignalChart visualizes time‑series advisory signals (Buy, Hold, Sell).
 */
function SignalChart() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/signals')
      .then((response) => {
        // Expected format: [{ date: '2024-01-01', buy: 10, hold: 5, sell: 2 }, ...]
        const formatted = response.data.map((item) => ({
          date: item.date,
          Buy: item.buy,
          Hold: item.hold,
          Sell: item.sell,
        }));
        setSignals(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch signals:', err);
        setError('Unable to load signals.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-gray-600">Loading signals...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (signals.length === 0) {
    return <p className="text-gray-600">No signal data available.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={signals} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Buy" stroke="#10B981" />
        <Line type="monotone" dataKey="Hold" stroke="#F59E0B" />
        <Line type="monotone" dataKey="Sell" stroke="#EF4444" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default SignalChart;

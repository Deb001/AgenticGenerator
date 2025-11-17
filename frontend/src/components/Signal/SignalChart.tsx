import React, { FC, useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceDot, ResponsiveContainer } from 'recharts';
import { apiClient } from '../../api/client';
import { Box, CircularProgress, Alert } from '@mui/material';

interface PricePoint {
  date: string; // ISO string
  close: number;
}

interface SignalPoint extends PricePoint {
  signal?: 'Buy' | 'Hold' | 'Sell';
}

interface SignalChartProps {
  ticker: string;
}

export const SignalChart: FC<SignalChartProps> = ({ ticker }) => {
  const [data, setData] = useState<SignalPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [priceRes, signalRes] = await Promise.all([
        apiClient.get<PricePoint[]>(`/historical/${ticker}`),
        apiClient.get<{ signal: 'Buy' | 'Hold' | 'Sell'; date: string }>(`/signals/${ticker}`),
      ]);
      const priceData = priceRes.data;
      const signalInfo = signalRes.data;
      const combined = priceData.map(p => {
        const point: SignalPoint = { date: p.date, close: p.close };
        if (p.date === signalInfo.date) {
          point.signal = signalInfo.signal;
        }
        return point;
      });
      setData(combined);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={2}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box width="100%" height={300} mt={2}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={d => new Date(d).toLocaleDateString()} />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip labelFormatter={d => new Date(d).toLocaleDateString()} />
          <Line type="monotone" dataKey="close" stroke="#1976d2" dot={false} />
          {data.map((d, i) =>
            d.signal ? (
              <ReferenceDot
                key={i}
                x={d.date}
                y={d.close}
                r={6}
                fill={d.signal === 'Buy' ? 'green' : d.signal === 'Sell' ? 'red' : 'orange'}
                stroke="none"
                label={d.signal}
              />
            ) : null
          )}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

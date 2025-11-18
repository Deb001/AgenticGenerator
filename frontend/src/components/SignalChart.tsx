import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

interface Signal {
  date: string;
  recommendation: string;
  confidence: number;
}

const SignalChart: React.FC<{ data: Signal[] }> = ({ data }) => {
  const mapped = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString(),
    value: d.recommendation === 'BUY' ? 2 : d.recommendation === 'HOLD' ? 1 : 0,
    confidence: d.confidence
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={mapped}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis
          domain={[0, 2]}
          ticks={[0, 1, 2]}
          tickFormatter={(v) => (v === 2 ? 'BUY' : v === 1 ? 'HOLD' : 'SELL')}
        />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SignalChart;

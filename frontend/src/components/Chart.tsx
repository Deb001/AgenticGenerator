import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface DataPoint {
  date: string;
  value: number;
}

interface Props {
  data: DataPoint[];
}

const Chart: React.FC<Props> = ({ data }) => {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff33" />
          <XAxis dataKey="date" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Tooltip contentStyle={{ backgroundColor: '#1e3a8a', border: 'none', color: '#fff' }} />
          <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;

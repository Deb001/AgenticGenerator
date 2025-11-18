import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  data: { symbol: string; recommendation: string }[];
}

/**
 * Maps recommendation strings to colors for the chart.
 */
const colorMap: Record<string, string> = {
  Buy: '#10B981',
  Hold: '#F59E0B',
  Sell: '#EF4444'
};

/**
 * Renders a vertical bar chart where each bar represents a stock symbol and its advisory recommendation.
 */
const SignalChart: React.FC<Props> = ({ data }) => {
  const chartData = data.map((d) => ({
    name: d.symbol,
    value: 1,
    fill: colorMap[d.recommendation] || '#8884d8'
  }));

  return (
    <ResponsiveContainer width='100%' height={300}>
      <BarChart data={chartData} layout='vertical'>
        <XAxis type='number' hide />
        <YAxis dataKey='name' type='category' width={80} />
        <Tooltip />
        <Bar dataKey='value'>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SignalChart;

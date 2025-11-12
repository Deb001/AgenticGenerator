import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { AdvisorySignal } from '../types';

interface AdvisoryChartProps {
  data: AdvisorySignal[];
}

function AdvisoryChart({ data }: AdvisoryChartProps) {
  const colorMap: Record<string, string> = {
    Buy: '#4caf50',
    Hold: '#ff9800',
    Sell: '#f44336'
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey="ticker" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="confidence" name="Confidence">
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colorMap[entry.signal] ?? '#8884d8'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default AdvisoryChart;
import React, { useMemo } from 'react';
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
import { Line } from 'react-chartjs-2';

// Register Chart.js components (once)
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PriceChartProps {
  /** Array of historical closing prices (most recent last) */
  prices: number[];
  /** Ticker symbol to display in the chart title */
  ticker: string;
}

/**
 * Renders a line chart of price history.
 * Shows placeholder text when the `prices` array is empty.
 */
const PriceChart: React.FC<PriceChartProps> = ({ prices, ticker }) => {
  // Guard against empty data
  if (!prices || prices.length === 0) {
    return <div>No price data available.</div>;
  }

  // Generate simple sequential labels (e.g., Day 1, Day 2, …)
  const labels = useMemo(
    () => prices.map((_p, idx) => `Day ${idx + 1}`),
    [prices]
  );

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          label: `${ticker} Price`,
          data: prices,
          fill: false,
          borderColor: 'rgba(75,192,192,1)',
          backgroundColor: 'rgba(75,192,192,0.4)',
          tension: 0.1,
          pointRadius: 2,
        },
      ],
    }),
    [labels, prices, ticker]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: `${ticker} Price History`,
          font: {
            size: 16,
          },
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Time',
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Price',
          },
        },
      },
    }),
    [ticker]
  );

  return <Line data={data} options={options} />;
};

export default PriceChart;
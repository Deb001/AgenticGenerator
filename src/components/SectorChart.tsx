import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Holding } from '../types/portfolio';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SectorChartProps {
  holdings: Holding[];
}

/**
 * Aggregates holdings by sector and displays a bar chart of exposure percentages.
 * Shows a friendly message when the holdings array is empty.
 */
export const SectorChart: React.FC<SectorChartProps> = ({ holdings }) => {
  // Guard against empty data
  if (!holdings || holdings.length === 0) {
    return <p>No holdings data available.</p>;
  }

  // Compute sector totals and percentages
  const { labels, percentages } = useMemo(() => {
    const sectorMap: Record<string, number> = {};
    let portfolioValue = 0;

    holdings.forEach((h) => {
      const value = Number(h.marketValue) || 0;
      portfolioValue += value;
      const sector = h.sector ?? 'Other';
      sectorMap[sector] = (sectorMap[sector] ?? 0) + value;
    });

    const labels = Object.keys(sectorMap);
    const percentages = labels.map((sector) =>
      portfolioValue === 0
        ? 0
        : parseFloat(((sectorMap[sector] / portfolioValue) * 100).toFixed(2))
    );

    return { labels, percentages };
  }, [holdings]);

  const data = {
    labels,
    datasets: [
      {
        label: 'Sector Exposure (%)',
        data: percentages,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Portfolio Sector Diversification',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.parsed.y}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value: number) => `${value}%`,
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default SectorChart;
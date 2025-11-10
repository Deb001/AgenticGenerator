import React, { useEffect, useState } from 'react';
import { client } from '../api/client';
import PortfolioTable, { Portfolio, Holding } from './PortfolioTable';
import {
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

export interface Signal {
  ticker: string;
  date: string; // ISO date string
  signal: string;
  explanation: string;
}

/**
 * Dashboard component for advisors.
 * Shows a list of portfolios and, for the selected portfolio,
 * displays a line chart summarising signal counts over time.
 */
const Dashboard: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(null);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loadingPortfolios, setLoadingPortfolios] = useState<boolean>(false);
  const [loadingSignals, setLoadingSignals] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load portfolios on component mount
  useEffect(() => {
    const fetchPortfolios = async () => {
      setLoadingPortfolios(true);
      try {
        const response = await client.get<Portfolio[]>('/api/portfolios');
        setPortfolios(response.data);
      } catch (err) {
        console.error('Error fetching portfolios', err);
        setError('Failed to load portfolios.');
      } finally {
        setLoadingPortfolios(false);
      }
    };
    fetchPortfolios();
  }, []);

  // Load signals whenever a portfolio is selected
  useEffect(() => {
    if (selectedPortfolioId === null) {
      setSignals([]);
      return;
    }
    const selectedPortfolio = portfolios.find((p) => p.id === selectedPortfolioId);
    if (!selectedPortfolio) {
      setError('Selected portfolio not found.');
      return;
    }

    const fetchSignals = async () => {
      setLoadingSignals(true);
      try {
        const allSignals: Signal[] = [];
        for (const holding of selectedPortfolio.holdings) {
          const resp = await client.get<Signal[]>(
            `/api/indicators?ticker=${encodeURIComponent(holding.ticker)}`
          );
          allSignals.push(...resp.data);
        }
        setSignals(allSignals);
      } catch (err) {
        console.error('Error fetching signals', err);
        setError('Failed to load signals for the selected portfolio.');
      } finally {
        setLoadingSignals(false);
      }
    };
    fetchSignals();
  }, [selectedPortfolioId, portfolios]);

  // Transform signals into chart data (date => count)
  const chartData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    signals.forEach((s) => {
      const dateKey = new Date(s.date).toLocaleDateString();
      counts[dateKey] = (counts[dateKey] || 0) + 1;
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  }, [signals]);

  const handlePortfolioSelect = (id: number) => {
    setSelectedPortfolioId(id);
    setError(null);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Advisor Dashboard</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {loadingPortfolios ? (
        <p>Loading portfolios...</p>
      ) : (
        <PortfolioTable portfolios={portfolios} onSelect={handlePortfolioSelect} />
      )}

      {selectedPortfolioId && (
        <div style={{ marginTop: '30px' }}>
          <h3>Signals for Portfolio #{selectedPortfolioId}</h3>
          {loadingSignals ? (
            <p>Loading signals...</p>
          ) : signals.length === 0 ? (
            <p>No signals available for this portfolio.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8884d8" name="Signal Count" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
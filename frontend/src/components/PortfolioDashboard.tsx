import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, Button, Alert, CircularProgress, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import apiClient from '../api/client';
import { AuthContext } from '../App';
import { Portfolio, Holding, AdvisorySignal } from '../types';

/**
 * PortfolioDashboard renders advisor‑only view of portfolios, holdings, performance chart, and advisory signals.
 */
const PortfolioDashboard: React.FC = () => {
  const { auth } = useContext(AuthContext);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number | null>(null);
  const [chartData, setChartData] = useState<Array<{ date: string; value: number }>>([]);
  const [signal, setSignal] = useState<AdvisorySignal | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch portfolios on mount
  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const response = await apiClient.get<Portfolio[]>('/portfolios');
        setPortfolios(response.data);
        if (response.data.length > 0) {
          setSelectedPortfolioId(response.data[0].id);
        }
      } catch (err: any) {
        console.error('Failed to fetch portfolios:', err);
        if (err.response && err.response.status === 401) {
          setError('Session expired. Please log in again.');
        } else {
          setError('Unable to load portfolios.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolios();
  }, []);

  // Fetch chart data and latest signal whenever selected portfolio changes
  useEffect(() => {
    if (selectedPortfolioId === null) return;
    const fetchDetails = async () => {
      try {
        const [metricsRes, signalRes] = await Promise.all([
          apiClient.get<Array<{ date: string; value: number }>>(`/portfolios/${selectedPortfolioId}/metrics`),
          apiClient.get<AdvisorySignal>(`/portfolios/${selectedPortfolioId}/signal/latest`)
        ]);
        setChartData(metricsRes.data);
        setSignal(signalRes.data);
      } catch (err: any) {
        console.error('Error fetching portfolio details:', err);
        setError('Failed to load portfolio details.');
      }
    };
    fetchDetails();
  }, [selectedPortfolioId]);

  const handleGenerateSignal = async () => {
    if (selectedPortfolioId === null) return;
    setLoading(true);
    try {
      const response = await apiClient.post<AdvisorySignal>(`/portfolios/${selectedPortfolioId}/signal`);
      setSignal(response.data);
    } catch (err: any) {
      console.error('Signal generation failed:', err);
      setError('Unable to generate advisory signal.');
    } finally {
      setLoading(false);
    }
  };

  const selectedPortfolio = portfolios.find(p => p.id === selectedPortfolioId) || null;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mx: 2, mt: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Advisor Dashboard
      </Typography>

      {/* Portfolio selector */}
      <FormControl sx={{ minWidth: 200, mb: 3 }}>
        <InputLabel id="portfolio-select-label">Portfolio</InputLabel>
        <Select
          labelId="portfolio-select-label"
          value={selectedPortfolioId ?? ''}
          label="Portfolio"
          onChange={(e) => setSelectedPortfolioId(Number(e.target.value))}
        >
          {portfolios.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.client_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Holdings Table */}
      {selectedPortfolio && (
        <Paper sx={{ mb: 4, p: 2 }} elevation={3}>
          <Typography variant="h6" gutterBottom>
            Holdings for {selectedPortfolio.client_name}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ticker</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Avg. Price</TableCell>
                <TableCell align="right">Last Price</TableCell>
                <TableCell align="right">Market Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedPortfolio.holdings.map((h: Holding) => (
                <TableRow key={h.ticker}>
                  <TableCell>{h.ticker}</TableCell>
                  <TableCell align="right">{h.quantity}</TableCell>
                  <TableCell align="right">{h.avg_price.toFixed(2)}</TableCell>
                  <TableCell align="right">{h.last_price.toFixed(2)}</TableCell>
                  <TableCell align="right">{(h.quantity * h.last_price).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Performance Chart */}
      <Box sx={{ height: 300, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Portfolio Performance (Last 90 Days)
        </Typography>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#1976d2" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Advisory Signal */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Latest Advisory Signal
        </Typography>
        {signal ? (
          <Paper sx={{ p: 2 }} elevation={2}>
            <Typography>Signal Type: {signal.signal_type}</Typography>
            <Typography>Confidence: {(signal.confidence * 100).toFixed(1)}%</Typography>
            <Typography>Rationale: {signal.rationale}</Typography>
            <Typography>Date: {new Date(signal.signal_date).toLocaleString()}</Typography>
          </Paper>
        ) : (
          <Typography>No signal generated yet.</Typography>
        )}
        <Button
          variant="contained"
          color="secondary"
          sx={{ mt: 2 }}
          onClick={handleGenerateSignal}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Generate Signal'}
        </Button>
      </Box>
    </Box>
  );
};

export default PortfolioDashboard;

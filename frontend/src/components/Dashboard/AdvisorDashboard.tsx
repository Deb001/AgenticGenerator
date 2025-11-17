import React, { FC, useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { apiClient } from '../../api/client';
import { PortfolioList } from '../Portfolio/PortfolioList';
import { SignalChart } from '../Signal/SignalChart';

export interface PortfolioRead {
  id: number;
  name: string;
  created_at: string;
  active: boolean;
}

export const AdvisorDashboard: FC = () => {
  const [portfolios, setPortfolios] = useState<PortfolioRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recomputing, setRecomputing] = useState(false);

  const fetchPortfolios = async () => {
    try {
      const response = await apiClient.get<PortfolioRead[]>('/portfolios');
      setPortfolios(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load portfolios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRecompute = async () => {
    setRecomputing(true);
    try {
      await apiClient.post('/signals/recompute');
      // After recompute, you might want to refresh signal charts; for simplicity we just show alert.
      alert('Signal recomputation completed');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to recompute signals');
    } finally {
      setRecomputing(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={4}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Advisor Dashboard
      </Typography>
      <Button variant="contained" color="secondary" onClick={handleRecompute} disabled={recomputing} sx={{ mb: 2 }}>
        {recomputing ? 'Recomputing...' : 'Recompute Signals'}
      </Button>
      <PortfolioList portfolios={portfolios} role="advisor" />
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Sample Signal Charts
        </Typography>
        {/* Example: render a few charts for demonstration */}
        <SignalChart ticker="AAPL" />
        <SignalChart ticker="GOOGL" />
      </Box>
    </Box>
  );
};

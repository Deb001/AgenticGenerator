import React, { FC, useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { apiClient } from '../../api/client';
import { PortfolioList } from '../Portfolio/PortfolioList';

export interface PortfolioRead {
  id: number;
  name: string;
  created_at: string;
  active: boolean;
}

export const ClientDashboard: FC = () => {
  const [portfolios, setPortfolios] = useState<PortfolioRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        Client Dashboard
      </Typography>
      <PortfolioList portfolios={portfolios} role="client" />
    </Box>
  );
};

import React, { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress } from '@mui/material';

interface Holding {
  id: number;
  ticker: string;
  quantity: number;
  purchase_price: number;
}

interface PortfolioDetailData {
  id: number;
  name: string;
  holdings: Holding[];
}

export const PortfolioDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const [portfolio, setPortfolio] = useState<PortfolioDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newHolding, setNewHolding] = useState<{ ticker: string; quantity: string; purchase_price: string }>({
    ticker: '',
    quantity: '',
    purchase_price: '',
  });
  const [dialogError, setDialogError] = useState<string | null>(null);

  const fetchPortfolio = async () => {
    try {
      const response = await apiClient.get<PortfolioDetailData>(`/portfolios/${id}`);
      setPortfolio(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddHolding = async () => {
    if (!newHolding.ticker || !newHolding.quantity || !newHolding.purchase_price) {
      setDialogError('All fields are required');
      return;
    }
    try {
      await apiClient.post(`/portfolios/${id}/holdings`, {
        ticker: newHolding.ticker,
        quantity: Number(newHolding.quantity),
        purchase_price: Number(newHolding.purchase_price),
      });
      setDialogOpen(false);
      setNewHolding({ ticker: '', quantity: '', purchase_price: '' });
      fetchPortfolio();
    } catch (err: any) {
      setDialogError(err.response?.data?.detail || 'Failed to add holding');
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
        Portfolio: {portfolio?.name}
      </Typography>
      <Button variant="contained" color="primary" onClick={() => setDialogOpen(true)} sx={{ mb: 2 }}>
        Add Holding
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Ticker</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Purchase Price</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {portfolio?.holdings.map(h => (
            <TableRow key={h.id}>
              <TableCell>{h.ticker}</TableCell>
              <TableCell>{h.quantity}</TableCell>
              <TableCell>{h.purchase_price}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add Holding Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Add New Holding</DialogTitle>
        <DialogContent>
          {dialogError && <Alert severity="error" sx={{ mb: 2 }}>{dialogError}</Alert>}
          <TextField
            label="Ticker"
            fullWidth
            margin="dense"
            value={newHolding.ticker}
            onChange={e => setNewHolding({ ...newHolding, ticker: e.target.value })}
          />
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            margin="dense"
            value={newHolding.quantity}
            onChange={e => setNewHolding({ ...newHolding, quantity: e.target.value })}
          />
          <TextField
            label="Purchase Price"
            type="number"
            fullWidth
            margin="dense"
            value={newHolding.purchase_price}
            onChange={e => setNewHolding({ ...newHolding, purchase_price: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddHolding} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

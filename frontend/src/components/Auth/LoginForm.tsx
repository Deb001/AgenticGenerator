import React, { FC, useState, FormEvent } from 'react';
import { TextField, Button, Box, Alert, CircularProgress } from '@mui/material';
import { apiClient } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

export const LoginForm: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Both email and password are required');
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const token = response.data.access_token;
      if (token) {
        login(token);
        const redirectPath = location.state?.from?.pathname || (response.data.role === 'advisor' ? '/advisor' : '/client');
        navigate(redirectPath, { replace: true });
      } else {
        setError('Login succeeded but no token received');
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Unable to login. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={8} p={3} component="form" onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        label="Email"
        type="email"
        fullWidth
        required
        margin="normal"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        required
        margin="normal"
        inputProps={{ minLength: 8 }}
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
        {loading ? <CircularProgress size={24} /> : 'Login'}
      </Button>
    </Box>
  );
};

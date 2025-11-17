import React, { FC, useState, FormEvent } from 'react';
import { TextField, Button, Box, Alert, Select, MenuItem, InputLabel, FormControl, CircularProgress } from '@mui/material';
import { apiClient } from '../../api/client';
import { useNavigate } from 'react-router-dom';

export const RegisterForm: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'advisor' | 'client'>('client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const validate = (): string | null => {
    if (!email) return 'Email is required';
    if (!password || password.length < 8) return 'Password must be at least 8 characters';
    if (!fullName) return 'Full name is required';
    if (!['advisor', 'client'].includes(role)) return 'Invalid role selected';
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await apiClient.post('/auth/register', { email, password, full_name: fullName, role });
      navigate('/login', { replace: true });
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Registration failed. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={500} mx="auto" mt={8} p={3} component="form" onSubmit={handleSubmit}>
      <h2>Register</h2>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        label="Full Name"
        fullWidth
        required
        margin="normal"
        value={fullName}
        onChange={e => setFullName(e.target.value)}
      />
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
      <FormControl fullWidth margin="normal" required>
        <InputLabel id="role-label">Role</InputLabel>
        <Select labelId="role-label" value={role} label="Role" onChange={e => setRole(e.target.value as any)}>
          <MenuItem value="client">Client</MenuItem>
          <MenuItem value="advisor">Advisor</MenuItem>
        </Select>
      </FormControl>
      <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
        {loading ? <CircularProgress size={24} /> : 'Register'}
      </Button>
    </Box>
  );
};

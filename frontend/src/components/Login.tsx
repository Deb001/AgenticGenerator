import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './Login.css';

/**
 * Simple login form that authenticates the user via the `useAuth` hook.
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/portfolios');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Advisor Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={loading} className="login-button">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export default Login;
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '@/services/authService';
import useAuth from '@/hooks/useAuth';
import { isValidEmail } from '@/utils/validators';
import { isSafeRedirect } from '@/utils/validators';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setToken, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/portfolios';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isValidEmail(email)) {
      setError('Invalid email address');
      return;
    }
    setLoading(true);
    try {
      const token = await login({ email, password });
      setToken(token);
      // Validate redirect to avoid open‑redirect attacks
      const safeTarget = isSafeRedirect(from) ? from : '/portfolios';
      navigate(safeTarget, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // If the user is already authenticated, redirect them away from the login page
  if (isAuthenticated) {
    navigate('/portfolios', { replace: true });
    return null;
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Log In</h2>
      {error && <p className="text-red-600 mb-2" role="alert">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2 rounded hover:bg-primary/80"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      <div className="mt-4 flex justify-between items-center">
        <Link to="/reset-password" className="text-sm text-primary underline">
          Forgot password?
        </Link>
        <Link to="/signup" className="text-sm text-primary underline">
          Create account
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../Toast';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateState = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
};

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailRegex.test(email) || email.length > 254) {
      addToast('Invalid email address', 'error');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      addToast('Logged in successfully', 'success');
      navigate('/portfolios');
    } catch (err: any) {
      addToast('Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const backend = import.meta.env.VITE_BACKEND_URL || '';
    const state = generateState();
    sessionStorage.setItem('oauth_state', state);
    window.location.href = `${backend}/api/auth/google/login?state=${state}`;
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Log In</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            maxLength={254}
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
      <div className="mt-4 text-center">
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
        >
          Continue with Google
        </button>
      </div>
      <p className="mt-4 text-center text-sm">
        Don't have an account?{' '}
        <Link className="text-blue-600 hover:underline" to="/register">
          Sign up
        </Link>
      </p>
      <p className="mt-2 text-center text-sm">
        <Link className="text-blue-600 hover:underline" to="/reset-password">
          Forgot password?
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;

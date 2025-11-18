import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Navbar: React.FC = () => {
  const { token, setToken } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken('');
    navigate('/login');
  };

  return (
    <nav className="bg-primary text-white px-4 py-3 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">Portfolio Advisory</Link>
      {token && (
        <button onClick={handleLogout} className="bg-secondary px-3 py-1 rounded hover:bg-accent transition">Logout</button>
      )}
    </nav>
  );
};

export default Navbar;

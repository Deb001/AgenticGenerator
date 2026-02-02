import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-primary">
          Portfolio Manager
        </Link>
        <div className="space-x-4">
          {isAuthenticated ? (
            <>
              <Link to="/portfolios" className="text-gray-700 hover:text-primary">
                Portfolios
              </Link>
              <Link to="/profile" className="text-gray-700 hover:text-primary">
                Profile
              </Link>
              <button onClick={handleLogout} className="text-gray-700 hover:text-primary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-700 hover:text-primary">
                Login
              </Link>
              <Link to="/signup" className="text-gray-700 hover:text-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

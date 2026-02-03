import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const NavBar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <Link to="/" className="text-xl font-bold text-gray-800">
          Portfolio Manager
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600" data-testid="navbar-email">
                {user.email}
              </span>
              <Link to="/profile" className="text-sm text-blue-600 hover:underline">
                Profile
              </Link>
              <Link to="/settings" className="text-sm text-blue-600 hover:underline">
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:underline"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-blue-600 hover:underline">
                Log In
              </Link>
              <Link to="/register" className="text-sm text-blue-600 hover:underline">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default NavBar;

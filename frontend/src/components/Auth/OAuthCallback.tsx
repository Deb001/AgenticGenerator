import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../Toast';

const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const code = searchParams.get('code');
    const returnedState = searchParams.get('state');
    const storedState = sessionStorage.getItem('oauth_state');
    if (!code) {
      addToast('Missing OAuth code', 'error');
      navigate('/login');
      return;
    }
    if (returnedState !== storedState) {
      addToast('Invalid OAuth state parameter', 'error');
      navigate('/login');
      return;
    }
    // State validated – clear it
    sessionStorage.removeItem('oauth_state');
    handleOAuthCallback(code, returnedState)
      .then(() => {
        addToast('Logged in with Google', 'success');
        navigate('/portfolios');
      })
      .catch(() => {
        addToast('OAuth login failed. Please try again.', 'error');
        navigate('/login');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-lg">Processing OAuth login...</p>
    </div>
  );
};

export default OAuthCallback;

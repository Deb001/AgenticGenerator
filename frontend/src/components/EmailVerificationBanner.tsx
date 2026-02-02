import React, { useEffect, useState } from 'react';
import { resendVerificationEmail } from '@/services/authService';
import useAuth from '@/hooks/useAuth';

const EmailVerificationBanner: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const [show, setShow] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Assume the backend includes a claim `email_verified` in the JWT payload.
  useEffect(() => {
    if (!isAuthenticated) {
      setShow(false);
      return;
    }
    try {
      const payload = JSON.parse(atob(token!.split('.')[1]));
      if (!payload.email_verified) {
        setShow(true);
      }
    } catch {
      // If token cannot be decoded, hide banner.
      setShow(false);
    }
  }, [token, isAuthenticated]);

  const handleResend = async () => {
    setError(null);
    try {
      await resendVerificationEmail();
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to resend verification email');
    }
  };

  if (!show) return null;

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
      <p className="font-bold">Email not verified</p>
      <p className="mb-2">Please verify your email to access all features.</p>
      {error && <p className="text-red-600" role="alert">{error}</p>}
      {sent ? (
        <p className="text-green-600">Verification email sent!</p>
      ) : (
        <button onClick={handleResend} className="mt-2 bg-primary text-white px-3 py-1 rounded">
          Resend Verification Email
        </button>
      )}
    </div>
  );
};

export default EmailVerificationBanner;

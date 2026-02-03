import React, { useState } from 'react';
import api from '../../utils/api';
import { useToast } from '../Toast';

interface Props {
  onClose: () => void;
}

const PasswordResetModal: React.FC<Props> = ({ onClose }) => {
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordComplexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?\":{}|<>]).{12,}$/;

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailRegex.test(email) || email.length > 254) {
      addToast('Invalid email address', 'error');
      return;
    }
    try {
      await api.post('/auth/password-reset/request', { email });
      addToast('Password reset email sent', 'success');
      setStep('confirm');
    } catch {
      addToast('Request failed. Please try again.', 'error');
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordComplexityRegex.test(newPassword) || newPassword.length > 128) {
      addToast('Password does not meet complexity requirements.', 'error');
      return;
    }
    try {
      await api.post('/auth/password-reset/confirm', { token, new_password: newPassword });
      addToast('Password has been reset', 'success');
      onClose();
    } catch {
      addToast('Reset failed. Please try again.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Password Reset</h3>
        {step === 'request' ? (
          <form onSubmit={handleRequest} className="space-y-4">
            <div>
              <label className="block mb-1" htmlFor="email">
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
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Send Reset Link
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleConfirm} className="space-y-4">
            <div>
              <label className="block mb-1" htmlFor="token">
                Reset Token
              </label>
              <input
                id="token"
                type="text"
                required
                className="w-full border rounded px-3 py-2"
                value={token}
                onChange={e => setToken(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1" htmlFor="newPassword">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                required
                maxLength={128}
                className="w-full border rounded px-3 py-2"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Reset Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PasswordResetModal;

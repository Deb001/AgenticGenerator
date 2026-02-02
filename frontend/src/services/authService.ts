import api from '@/services/api';
import { RegisterPayload, LoginPayload } from '@/utils/constants';

export const register = async (payload: RegisterPayload): Promise<void> => {
  await api.post('/api/auth/register', payload);
};

export const login = async (payload: LoginPayload): Promise<string> => {
  const response = await api.post('/api/auth/login', payload);
  // Backend returns a JWT; we simply return it to the caller.
  return response.data.access_token;
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  await api.post('/api/auth/password-reset/request', { email });
};

export const confirmPasswordReset = async (token: string, newPassword: string): Promise<void> => {
  await api.post('/api/auth/password-reset/confirm', { token, new_password: newPassword });
};

export const resendVerificationEmail = async (): Promise<void> => {
  await api.post('/api/auth/resend-verification');
};

export const googleOAuthRedirect = (): void => {
  window.location.href = `${process.env.VITE_API_BASE_URL ?? ''}/api/auth/google/login`;
};

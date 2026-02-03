import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';
import * as useAuthModule from '../hooks/useAuth';
import * as toastModule from '../components/Toast';

jest.mock('../hooks/useAuth');
jest.mock('../components/Toast');

const mockedUseAuth = useAuthModule.useAuth as jest.Mock;
const mockedUseToast = toastModule.useToast as jest.Mock;

beforeEach(() => {
  mockedUseAuth.mockReturnValue({
    login: jest.fn().mockResolvedValue(undefined),
    logout: jest.fn(),
    register: jest.fn(),
    fetchProfile: jest.fn(),
    updateProfile: jest.fn(),
    handleOAuthCallback: jest.fn(),
    user: null,
    loading: false,
  });
  mockedUseToast.mockReturnValue({ addToast: jest.fn() });
});

test('renders login form and validates email', async () => {
  render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );

  const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
  const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
  const submitBtn = screen.getByRole('button', { name: /log in/i });

  fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
  fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
  fireEvent.click(submitBtn);

  await waitFor(() => {
    expect(mockedUseToast().addToast).toHaveBeenCalledWith('Invalid email address', 'error');
  });
});

test('successful login calls auth hook', async () => {
  const mockLogin = jest.fn().mockResolvedValue(undefined);
  mockedUseAuth.mockReturnValue({
    login: mockLogin,
    logout: jest.fn(),
    register: jest.fn(),
    fetchProfile: jest.fn(),
    updateProfile: jest.fn(),
    handleOAuthCallback: jest.fn(),
    user: null,
    loading: false,
  });

  render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
  fireEvent.click(screen.getByRole('button', { name: /log in/i }));

  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'Password123!');
    expect(mockedUseToast().addToast).toHaveBeenCalledWith('Logged in successfully', 'success');
  });
});

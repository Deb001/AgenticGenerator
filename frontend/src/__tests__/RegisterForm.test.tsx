import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterForm from '../components/Auth/RegisterForm';
import * as useAuthModule from '../hooks/useAuth';
import * as toastModule from '../components/Toast';

jest.mock('../hooks/useAuth');
jest.mock('../components/Toast');

const mockedUseAuth = useAuthModule.useAuth as jest.Mock;
const mockedUseToast = toastModule.useToast as jest.Mock;

beforeEach(() => {
  mockedUseAuth.mockReturnValue({ register: jest.fn().mockResolvedValue(undefined) });
  mockedUseToast.mockReturnValue({ addToast: jest.fn() });
});

test('shows validation errors for weak password', async () => {
  render(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
  fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'short' } });
  fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'short' } });
  fireEvent.click(screen.getByRole('button', { name: /create account/i }));

  await waitFor(() => {
    expect(mockedUseToast().addToast).toHaveBeenCalledWith('Password must be at least 12 characters', 'error');
  });
});

test('successful registration calls register hook', async () => {
  const mockRegister = jest.fn().mockResolvedValue(undefined);
  mockedUseAuth.mockReturnValue({ register: mockRegister });

  render(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'new@example.com' } });
  fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'StrongPassword123!' } });
  fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'StrongPassword123!' } });
  fireEvent.click(screen.getByRole('button', { name: /create account/i }));

  await waitFor(() => {
    expect(mockRegister).toHaveBeenCalledWith('new@example.com', 'StrongPassword123!');
    expect(mockedUseToast().addToast).toHaveBeenCalledWith('Registration successful! Please log in.', 'success');
  });
});

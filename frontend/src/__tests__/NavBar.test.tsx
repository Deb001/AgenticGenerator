import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NavBar from '../components/Header/NavBar';
import * as useAuthModule from '../hooks/useAuth';

jest.mock('../hooks/useAuth');
const mockedUseAuth = useAuthModule.useAuth as jest.Mock;

beforeEach(() => {
  mockedUseAuth.mockReturnValue({
    user: { email: 'user@example.com' },
    logout: jest.fn().mockResolvedValue(undefined),
  });
});

test('displays user email and logout button', () => {
  render(
    <MemoryRouter>
      <NavBar />
    </MemoryRouter>
  );

  expect(screen.getByTestId('navbar-email')).toHaveTextContent('user@example.com');
  const logoutBtn = screen.getByRole('button', { name: /sign out/i });
  fireEvent.click(logoutBtn);
  expect(mockedUseAuth().logout).toHaveBeenCalled();
});

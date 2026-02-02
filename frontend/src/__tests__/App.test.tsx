import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';
import * as useAuthHook from '@/hooks/useAuth';

/**
 * Helper that mocks the default export of the useAuth hook.
 * The hook returns an object that mimics the shape used throughout the app.
 */
function mockUseAuth(isAuthenticated: boolean) {
  jest.spyOn(useAuthHook, 'default').mockReturnValue({
    isAuthenticated,
    token: isAuthenticated ? 'dummy.jwt.token' : null,
    setToken: jest.fn(),
    logout: jest.fn(),
  } as any);
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('App navigation bar', () => {
  test('shows Login and Sign Up links when user is not authenticated', () => {
    mockUseAuth(false);
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Links that should be visible for guests
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
    // Logout button must NOT be present
    expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
  });

  test('shows Logout button and hides guest links when authenticated', () => {
    mockUseAuth(true);
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Authenticated UI
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    // Guest links should disappear
    expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /sign up/i })).not.toBeInTheDocument();
  });
});

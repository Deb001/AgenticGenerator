import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from '@/App';
import * as useAuthHook from '@/hooks/useAuth';

// Mock the ToastProvider to avoid dealing with UI side‑effects
vi.mock('@/components/Toast', () => ({
  useToast: () => ({ addToast: vi.fn() }),
  ToastProvider: ({ children }: any) => <>{children}</>,
}));

// Helper to render the app at a given initial route
function renderWithRouter(initialEntries: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>
  );
}

describe('App routing & ProtectedRoute behaviour', () => {
  beforeEach(() => {
    // Reset the mock before each test
    vi.restoreAllMocks();
  });

  it('redirects unauthenticated users from a protected route to /login', async () => {
    // Mock useAuth to represent a not‑logged‑in state
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      user: null,
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      fetchProfile: vi.fn(),
      updateProfile: vi.fn(),
      handleOAuthCallback: vi.fn(),
    } as any);

    renderWithRouter(['/profile']);

    // The ProtectedRoute should navigate to /login
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
    });
  });

  it('renders the protected component when the user is authenticated', async () => {
    // Mock an authenticated user
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      user: { email: 'test@example.com' },
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      fetchProfile: vi.fn(),
      updateProfile: vi.fn(),
      handleOAuthCallback: vi.fn(),
    } as any);

    renderWithRouter(['/profile']);

    // The ProfilePage component contains a heading "My Profile"
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /my profile/i })).toBeInTheDocument();
    });
  });

  it('navigates from root (/) to /portfolios when authenticated', async () => {
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      user: { email: 'test@example.com' },
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      fetchProfile: vi.fn(),
      updateProfile: vi.fn(),
      handleOAuthCallback: vi.fn(),
    } as any);

    renderWithRouter(['/']);

    // After the redirect, the PortfoliosList component shows "My Portfolios"
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /my portfolios/i })).toBeInTheDocument();
    });
  });

  it('shows a loading indicator while auth state is being resolved', async () => {
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      user: null,
      loading: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      fetchProfile: vi.fn(),
      updateProfile: vi.fn(),
      handleOAuthCallback: vi.fn(),
    } as any);

    renderWithRouter(['/profile']);

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });
});

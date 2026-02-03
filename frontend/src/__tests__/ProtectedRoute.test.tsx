import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import * as useAuthModule from '../hooks/useAuth';

jest.mock('../hooks/useAuth');
const mockedUseAuth = useAuthModule.useAuth as jest.Mock;

const DummyComponent = () => <div>Protected Content</div>;

test('redirects unauthenticated users to login', () => {
  mockedUseAuth.mockReturnValue({ user: null, loading: false });

  render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <DummyComponent />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByText('Login Page')).toBeInTheDocument();
});

test('renders children when user is authenticated', () => {
  mockedUseAuth.mockReturnValue({ user: { email: 'test@example.com' }, loading: false });

  render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <DummyComponent />
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByText('Protected Content')).toBeInTheDocument();
});

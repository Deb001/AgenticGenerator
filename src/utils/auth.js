/**
 * Authentication utility functions for handling JWT tokens.
 */

/**
 * Logs in a user by sending credentials to the backend.
 *
 * @param {string} email - User's email address.
 * @param {string} password - User's password.
 * @returns {Promise<void>} Resolves when login succeeds; rejects on error.
 */
export async function login(email, password) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Login failed');
    }

    const data = await response.json();
    // Expect { token, user }
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    // Optionally redirect after login
    window.location.href = '/';
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Logs out the current user by clearing stored JWT and user data.
 */
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

/**
 * Retrieves the currently authenticated user's information from the stored JWT.
 *
 * @returns {object|null} Decoded JWT payload or null if no valid token exists.
 */
export function getCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (e) {
    console.error('Failed to decode JWT:', e);
    return null;
  }
}

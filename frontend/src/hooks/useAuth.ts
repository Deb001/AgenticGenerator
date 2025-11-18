import { useState, useEffect } from 'react';

const TOKEN_KEY = 'access_token';

/**
 * Custom hook to manage JWT authentication token.
 * The token is persisted in localStorage and kept in React state.
 *
 * @returns An object containing the current token and a setter function.
 */
const useAuth = () => {
  const [token, setTokenState] = useState<string>('');

  // Initialise token from localStorage on first render
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) setTokenState(stored);
  }, []);

  /**
   * Update token both in state and localStorage.
   * Passing an empty string clears the stored token.
   */
  const setToken = (newToken: string) => {
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    setTokenState(newToken);
  };

  return { token, setToken };
};

export default useAuth;

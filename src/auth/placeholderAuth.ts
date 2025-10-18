/**
 * placeholderAuth.ts
 *
 * Simple in‑memory authentication flag used only for demonstration purposes.
 * NOT SECURE – do NOT use in production.
 */

let isAuthenticated = false;

/**
 * Simulates a login action by setting the authentication flag to true.
 * In a real app this would involve credential verification, token handling, etc.
 */
export function login(): void {
  isAuthenticated = true;
}

/**
 * Simulates a logout action by resetting the authentication flag to false.
 */
export function logout(): void {
  isAuthenticated = false;
}

/**
 * Exported mutable flag that other parts of the app (e.g., ProtectedRoute)
 * read to determine if the user is considered authenticated.
 */
export { isAuthenticated };
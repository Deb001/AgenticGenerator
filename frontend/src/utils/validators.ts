/** Simple client‑side validators */
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const isStrongPassword = (pwd: string): boolean => {
  // Minimum 8 characters, at least one letter and one number
  const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return re.test(pwd);
};

export const isValidPassword = (pwd: string): boolean => {
  // Reuse strong password rule for reset
  return isStrongPassword(pwd);
};

/**
 * Validate that a redirect path is internal to the application.
 * Returns true if the path starts with '/' and does not contain a protocol.
 */
export const isSafeRedirect = (path: string): boolean => {
  return /^\/[^\/].*/.test(path);
};

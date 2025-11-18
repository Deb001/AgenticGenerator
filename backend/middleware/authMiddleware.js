import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Middleware to protect routes using JWT authentication.
 *
 * Expected header: Authorization: Bearer <token>
 */
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1]; // Bearer <token>
  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user payload (e.g., id, email) to request for downstream use.
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or malformed token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyJwt(token);
    // Attach payload to request for downstream use if needed
    (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

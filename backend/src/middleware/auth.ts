import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt';
import { User } from '../entities/User';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyJwt(token);
    // In a real app you would fetch the user from DB; here we trust payload
    (req as any).user = { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorizeAdvisor = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (user?.role !== 'advisor') {
    return res.status(403).json({ message: 'Forbidden: Advisor role required' });
  }
  next();
};
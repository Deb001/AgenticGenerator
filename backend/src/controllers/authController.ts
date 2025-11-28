import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { signJwt } from '../utils/jwt';
import { User } from '../models/User';

/**
 * POST /api/auth/login
 * Expects { email, password }
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = signJwt({ userId: user.id, email: user.email });
    res.json({ token });
  } catch (err) {
    next(err);
  }
};

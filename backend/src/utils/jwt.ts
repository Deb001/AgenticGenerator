import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'default_secret';

export interface JwtPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

export const signJwt = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, secret, { expiresIn: '8h' });
};

export const verifyJwt = (token: string): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

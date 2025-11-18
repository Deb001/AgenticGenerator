import { sign, verify, JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'defaultsecret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export const signJwt = (payload: object): string => {
  return sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyJwt = (token: string): JwtPayload => {
  return verify(token, JWT_SECRET) as JwtPayload;
};
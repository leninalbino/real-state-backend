import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';

const rawSecret = process.env.JWT_SECRET;
if (!rawSecret && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET is required in production');
}
const JWT_SECRET: Secret = rawSecret || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export type AuthTokenPayload = {
  userId: string;
  role: string;
};

export const signToken = (payload: AuthTokenPayload) => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string) =>
  jwt.verify(token, JWT_SECRET) as AuthTokenPayload;

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isProduction = process.env.NODE_ENV === 'production';
const rawSecret = process.env.JWT_SECRET?.trim();

if (isProduction && (!rawSecret || rawSecret.length < 16)) {
  console.error('[Security Error] FATAL: JWT_SECRET must be configured with at least 16 characters in production.');
  throw new Error('Fatal Configuration: JWT_SECRET environment variable is missing or insecure.');
}

// Zero hardcoded secrets: if unset in development, generate a dynamic 256-bit runtime key
const JWT_SECRET: string = rawSecret && rawSecret.length >= 16
  ? rawSecret
  : crypto.randomBytes(32).toString('hex');

const JWT_EXPIRES_IN = '7d';



export interface TokenPayload {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  role: 'admin' | 'student';
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};

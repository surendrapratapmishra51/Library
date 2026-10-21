import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.js';
import User from '../models/User.js';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please sign in.' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.status(403).json({ error: 'Invalid or expired session. Please sign in again.' });
  }

  try {
    const userRecord = await User.findByPk(payload.id, {
      attributes: ['id', 'status', 'role']
    });

    if (!userRecord) {
      return res.status(401).json({ error: 'Account not found. Access revoked.' });
    }

    if (userRecord.status === 'Discontinued') {
      return res.status(403).json({ error: 'This account has been deactivated or discontinued. Access revoked.' });
    }

    req.user = {
      ...payload,
      role: userRecord.role as 'admin' | 'student'
    };
    next();
  } catch (err: any) {
    console.error('[authenticateToken error]:', err.message);
    return res.status(500).json({ error: 'Internal error verifying session status.' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
};


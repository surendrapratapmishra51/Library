import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { User } from '../models/index.js';
import { generateToken } from '../utils/jwt.js';
import { AuthRequest } from '../middleware/auth.js';

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please enter registered mobile/email and password.' });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Query user by email or mobile using Sequelize Op.or
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: cleanIdentifier },
          { mobile: identifier.trim() }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Account not found with this email or mobile number.' });
    }

    if (user.status === 'Discontinued') {
      return res.status(403).json({ error: 'This account has been discontinued. Please contact library administration.' });
    }

    if (!user.password) {
      return res.status(500).json({ error: 'Password not configured for this account. Contact administrator.' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Incorrect password. Please verify and try again.' });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email || '',
      mobile: user.mobile,
      role: user.role
    });

    res.json({
      success: true,
      message: 'Sign in successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        seat: user.seat,
        plan: user.plan,
        planId: user.plan_id,
        joiningDate: user.joining_date,
        expiryDate: user.expiry_date,
        status: user.status
      }
    });
  } catch (error: any) {
    console.error('[Auth Error] Login failed:', error.message);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      address: user.address,
      role: user.role,
      seat: user.seat,
      plan: user.plan,
      planId: user.plan_id,
      joiningDate: user.joining_date,
      expiryDate: user.expiry_date,
      status: user.status
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

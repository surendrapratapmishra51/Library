import express, { Request, Response } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import seatRoutes from './seatRoutes.js';
import planRoutes from './planRoutes.js';
import activityRoutes from './activityRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import sequelize from '../config/database.js';

const router = express.Router();

// ----------------- HEALTH CHECK -----------------
router.get('/health', async (_req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', database: 'connected (Sequelize ORM)', timestamp: new Date().toISOString() });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ----------------- MODULAR ROUTE MOUNTING -----------------
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/seats', seatRoutes);
router.use('/plans', planRoutes);
router.use('/activities', activityRoutes);
router.use('/payments', paymentRoutes);

export default router;

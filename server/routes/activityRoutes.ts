import express from 'express';
import { getActivities } from '../controllers/activityController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Admin Only: View system activity audit trail
router.get('/', authenticateToken, requireAdmin, getActivities);

export default router;


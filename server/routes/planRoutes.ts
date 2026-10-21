import express from 'express';
import { getPlans, addPlan, updatePlan } from '../controllers/planController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public: View active membership plans
router.get('/', getPlans);

// Admin Only: Add and edit membership plans
router.post('/', authenticateToken, requireAdmin, addPlan);
router.put('/:id', authenticateToken, requireAdmin, updatePlan);

export default router;


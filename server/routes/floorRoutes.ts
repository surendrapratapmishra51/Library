import express from 'express';
import { getFloors, createFloor, updateFloor, deleteFloor } from '../controllers/floorController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public: View active library floors
router.get('/', getFloors);

// Admin Only: Create, edit, and delete floors
router.post('/', authenticateToken, requireAdmin, createFloor);
router.put('/:id', authenticateToken, requireAdmin, updateFloor);
router.delete('/:id', authenticateToken, requireAdmin, deleteFloor);

export default router;


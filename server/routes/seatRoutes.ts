import express from 'express';
import {
  getSeats,
  getSeatStats,
  addSeat,
  bulkAddSeats,
  updateSeat,
  deleteSeat,
  transferSeat,
  releaseSeat,
  getAllocationHistory
} from '../controllers/seatController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public: View floor/seat layout and availability statistics
router.get('/stats', getSeatStats);
router.get('/', getSeats);

// Admin Only: Allocation history, seat transfers, releases, and seat management
router.get('/allocations/history', authenticateToken, requireAdmin, getAllocationHistory);
router.post('/bulk', authenticateToken, requireAdmin, bulkAddSeats);
router.post('/transfer', authenticateToken, requireAdmin, transferSeat);
router.post('/release', authenticateToken, requireAdmin, releaseSeat);
router.post('/', authenticateToken, requireAdmin, addSeat);
router.put('/:id', authenticateToken, requireAdmin, updateSeat);
router.delete('/:number', authenticateToken, requireAdmin, deleteSeat);

export default router;


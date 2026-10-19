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

const router = express.Router();

router.get('/stats', getSeatStats);
router.get('/allocations/history', getAllocationHistory);
router.get('/', getSeats);
router.post('/bulk', bulkAddSeats);
router.post('/transfer', transferSeat);
router.post('/release', releaseSeat);
router.post('/', addSeat);
router.put('/:id', updateSeat);
router.delete('/:number', deleteSeat);

export default router;

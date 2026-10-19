import express from 'express';
import { getSeats, updateSeat, addSeat, deleteSeat } from '../controllers/seatController.js';

const router = express.Router();

router.get('/', getSeats);
router.put('/:id', updateSeat);
router.post('/', addSeat);
router.delete('/:number', deleteSeat);

export default router;

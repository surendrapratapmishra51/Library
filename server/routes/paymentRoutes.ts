import express from 'express';
import { getPayments, getUserPayments } from '../controllers/paymentController.js';

const router = express.Router();

router.get('/', getPayments);
router.get('/user/:userId', getUserPayments);

export default router;

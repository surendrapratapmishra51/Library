import express from 'express';
import { 
  getPayments, 
  getUserPayments, 
  getFeesSummary, 
  recordPayment, 
  manageDiscount, 
  getUserStatement 
} from '../controllers/paymentController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Fees Summary and Financial Ledgers (Admin Only)
router.get('/summary', authenticateToken, requireAdmin, getFeesSummary);
router.get('/', authenticateToken, requireAdmin, getPayments);
router.post('/', authenticateToken, requireAdmin, recordPayment);
router.put('/discount/:userId', authenticateToken, requireAdmin, manageDiscount);

// Student/Admin Statement & Payments (Protected with Ownership Validation)
router.get('/statement/:userId', authenticateToken, getUserStatement);
router.get('/user/:userId', authenticateToken, getUserPayments);

export default router;


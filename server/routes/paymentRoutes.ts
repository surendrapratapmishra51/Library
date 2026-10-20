import express from 'express';
import { 
  getPayments, 
  getUserPayments, 
  getFeesSummary, 
  recordPayment, 
  manageDiscount, 
  getUserStatement 
} from '../controllers/paymentController.js';

const router = express.Router();

router.get('/summary', getFeesSummary);
router.get('/statement/:userId', getUserStatement);
router.get('/user/:userId', getUserPayments);
router.get('/', getPayments);
router.post('/', recordPayment);
router.put('/discount/:userId', manageDiscount);

export default router;

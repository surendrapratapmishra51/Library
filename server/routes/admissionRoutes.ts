import express from 'express';
import {
  createAdmissionRequest,
  getAdmissionRequests,
  getAdmissionRequestById,
  acceptAdmissionRequest,
  rejectAdmissionRequest,
} from '../controllers/admissionController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public: Candidate submits admission application
router.post('/', createAdmissionRequest);

// Protected: Admin views and manages admission requests
router.get('/', authenticateToken, requireAdmin, getAdmissionRequests);
router.get('/:id', authenticateToken, requireAdmin, getAdmissionRequestById);
router.post('/:id/accept', authenticateToken, requireAdmin, acceptAdmissionRequest);
router.post('/:id/reject', authenticateToken, requireAdmin, rejectAdmissionRequest);

export default router;

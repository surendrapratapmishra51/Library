import express from 'express';
import { login, register, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/login', loginRateLimiter, login);

router.post('/register', (_req, res) => {
  return res.status(403).json({
    error: 'Public signup is disabled. Student accounts are created by Library Administration during admission.'
  });
});
router.post('/signup', (_req, res) => {
  return res.status(403).json({
    error: 'Public signup is disabled. Student accounts are created by Library Administration during admission.'
  });
});
router.get('/me', authenticateToken, getMe);

export default router;

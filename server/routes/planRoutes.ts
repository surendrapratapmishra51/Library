import express from 'express';
import { getPlans, addPlan, updatePlan } from '../controllers/planController.js';

const router = express.Router();

router.get('/', getPlans);
router.post('/', addPlan);
router.put('/:id', updatePlan);

export default router;

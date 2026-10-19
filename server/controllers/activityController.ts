import { Request, Response } from 'express';
import { Activity } from '../models/index.js';

export const getActivities = async (_req: Request, res: Response) => {
  try {
    const activities = await Activity.findAll({
      limit: 20,
      order: [['created_at', 'DESC']]
    });
    res.json(activities);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

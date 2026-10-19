import { Request, Response } from 'express';
import { Payment } from '../models/index.js';

export const getPayments = async (_req: Request, res: Response) => {
  try {
    const payments = await Payment.findAll({
      order: [['created_at', 'DESC']]
    });

    const formatted = payments.map((p) => ({
      id: p.id,
      userId: p.user_id,
      studentName: p.user_name,
      studentMobile: p.user_mobile,
      planName: p.plan_name,
      amount: Number(p.amount),
      paymentMethod: p.payment_method,
      paymentDate: p.payment_date,
      status: p.status,
      transactionId: p.transaction_id || p.id,
      notes: p.notes || '',
      created_at: p.created_at
    }));

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserPayments = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const payments = await Payment.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });

    const formatted = payments.map((p) => ({
      id: p.id,
      userId: p.user_id,
      studentName: p.user_name,
      studentMobile: p.user_mobile,
      planName: p.plan_name,
      amount: Number(p.amount),
      paymentMethod: p.payment_method,
      paymentDate: p.payment_date,
      status: p.status,
      transactionId: p.transaction_id || p.id,
      notes: p.notes || '',
      created_at: p.created_at
    }));

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

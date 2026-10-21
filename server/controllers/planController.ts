import { Request, Response } from 'express';
import { MembershipPlan } from '../models/index.js';

export const getPlans = async (_req: Request, res: Response) => {
  try {
    const plans = await MembershipPlan.findAll({
      order: [['price', 'ASC']]
    });

    const formatted = plans.map((p) => ({
      id: p.id,
      name: p.name,
      duration: p.duration,
      durationUnit: p.duration_unit,
      price: Number(p.price),
      originalPrice: p.original_price ? Number(p.original_price) : undefined,
      billingCycle: p.billing_cycle,
      badge: p.badge,
      isPopular: Boolean(p.is_popular),
      features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features || [],
      timing: p.timing,
      description: p.description,
      status: p.status
    }));

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addPlan = async (req: Request, res: Response) => {
  try {
    const { name, duration, durationUnit, price, originalPrice, billingCycle, badge, isPopular, features, timing, description, status } = req.body;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newPlan = await MembershipPlan.create({
      id,
      name,
      duration,
      duration_unit: durationUnit || 'Months',
      price,
      original_price: originalPrice || null,
      billing_cycle: billingCycle || 'one-time',
      badge: badge || '',
      is_popular: isPopular || false,
      features: features || [],
      timing: timing || '',
      description: description || '',
      status: status || 'Active'
    });

    res.status(201).json({ success: true, message: `Plan ${name} created.`, plan: newPlan });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    await MembershipPlan.update(
      {
        ...(fields.name ? { name: fields.name } : {}),
        ...(fields.duration ? { duration: fields.duration } : {}),
        ...(fields.price ? { price: fields.price } : {}),
        ...(fields.originalPrice !== undefined ? { original_price: fields.originalPrice } : {}),
        ...(fields.billingCycle ? { billing_cycle: fields.billingCycle } : {}),
        ...(fields.badge !== undefined ? { badge: fields.badge } : {}),
        ...(fields.isPopular !== undefined ? { is_popular: fields.isPopular } : {}),
        ...(fields.features ? { features: fields.features } : {}),
        ...(fields.timing !== undefined ? { timing: fields.timing } : {}),
        ...(fields.description !== undefined ? { description: fields.description } : {}),
        ...(fields.status ? { status: fields.status } : {}),
      },
      {
        where: { id }
      }
    );

    res.json({ success: true, message: 'Plan updated.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

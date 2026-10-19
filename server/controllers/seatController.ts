import { Request, Response } from 'express';
import { Seat } from '../models/index.js';

export const getSeats = async (_req: Request, res: Response) => {
  try {
    const seats = await Seat.findAll({
      order: [['floor', 'ASC'], ['section', 'ASC'], ['number', 'ASC']]
    });
    const formatted = seats.map((s) => ({
      id: s.id,
      number: s.number,
      floor: s.floor,
      section: s.section,
      status: s.status,
      hasPowerOutlet: Boolean(s.has_power_outlet),
      hasDeskLamp: Boolean(s.has_desk_lamp),
      isCornerOrWindow: Boolean(s.is_corner_or_window),
      occupiedBy: s.occupied_by,
      assignedUntil: s.assigned_until
    }));
    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSeat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, occupiedBy, assignedUntil } = req.body;

    await Seat.update(
      {
        ...(status ? { status } : {}),
        occupied_by: occupiedBy ?? null,
        assigned_until: assignedUntil ?? null,
      },
      {
        where: {
          number: id
        }
      }
    );

    res.json({ success: true, message: 'Seat updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addSeat = async (req: Request, res: Response) => {
  try {
    const { number, floor, section, status } = req.body;
    const id = `seat-${section.toLowerCase()}-${number.replace(/^[A-Za-z]+/, '')}`;

    const newSeat = await Seat.create({
      id,
      number,
      floor,
      section,
      status: status || 'available',
      has_power_outlet: true,
      has_desk_lamp: true,
      is_corner_or_window: false
    });

    res.status(201).json({ success: true, message: `Seat ${number} created.`, seat: newSeat });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSeat = async (req: Request, res: Response) => {
  try {
    const { number } = req.params;
    await Seat.destroy({ where: { number } });
    res.json({ success: true, message: `Seat ${number} removed.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

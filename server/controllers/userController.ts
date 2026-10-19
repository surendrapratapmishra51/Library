import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { User, Seat, Activity } from '../models/index.js';

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      where: { role: 'student' },
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });

    const formatted = users.map((u) => ({
      id: u.id,
      name: u.name,
      mobile: u.mobile,
      email: u.email,
      role: u.role,
      address: u.address,
      plan: u.plan,
      planId: u.plan_id,
      seat: u.seat,
      joiningDate: u.joining_date,
      expiryDate: u.expiry_date,
      status: u.status,
      previousSeat: u.previous_seat,
      discontinuedDate: u.discontinued_date,
      history: typeof u.history === 'string' ? JSON.parse(u.history) : u.history || [],
      created_at: u.created_at
    }));

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, mobile, email, password, address, plan, planId, seat, joiningDate, expiryDate, status, role } = req.body;

    if (!name || !mobile) {
      return res.status(400).json({ error: 'Name and Mobile number are required.' });
    }

    // Check duplicate mobile or email
    const duplicate = await User.findOne({
      where: {
        [Op.or]: [
          { mobile: mobile.trim() },
          ...(email ? [{ email: email.trim().toLowerCase() }] : [])
        ]
      }
    });

    if (duplicate) {
      return res.status(409).json({ error: 'A member with this mobile number or email already exists.' });
    }

    // Verify seat availability
    if (seat && seat !== 'None') {
      const seatRecord = await Seat.findOne({ where: { number: seat } });
      if (!seatRecord) {
        return res.status(400).json({ error: `Seat ${seat} does not exist.` });
      }
      if (seatRecord.status !== 'available') {
        return res.status(400).json({ error: `Seat ${seat} is currently ${seatRecord.status}. Please choose an available seat.` });
      }
    }

    const rawPassword = password && password.trim() ? password.trim() : 'student123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const id = `usr-${Date.now().toString().slice(-6)}`;
    const userRole = role === 'admin' ? 'admin' : 'student';

    const history = [`Enrolled by Admin on ${joiningDate || new Date().toISOString().split('T')[0]} (Assigned Seat: ${seat || 'None'})`];

    const newUser = await User.create({
      id,
      name,
      mobile: mobile.trim(),
      email: email ? email.trim().toLowerCase() : null,
      password: hashedPassword,
      role: userRole,
      address: address || '',
      plan: plan || 'Monthly Plan',
      plan_id: planId || 'monthly',
      seat: seat || 'None',
      joining_date: joiningDate || new Date().toISOString().split('T')[0],
      expiry_date: expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: status || 'Active',
      history
    });

    // Mark seat as occupied
    if (seat && seat !== 'None') {
      await Seat.update(
        { status: 'occupied', occupied_by: name, assigned_until: expiryDate || null },
        { where: { number: seat } }
      );
    }

    // Log activity
    await Activity.create({
      id: `act-${Date.now()}`,
      type: 'member_added',
      title: 'New Member Registered',
      timestamp: 'Just now',
      details: `${name} enrolled for ${plan || 'Plan'} · Seat ${seat || 'None'}`,
      meta: { userName: name, seatNumber: seat }
    });

    res.status(201).json({
      success: true,
      message: `Account created for ${name} with password "${rawPassword}".`,
      user: { id: newUser.id, name: newUser.name, mobile: newUser.mobile, email: newUser.email, seat: newUser.seat, plan: newUser.plan, role: newUser.role }
    });
  } catch (error: any) {
    console.error('[User Error] Failed to create member:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'Member not found.' });
    }

    // Reallocate seat if changed
    if (fields.seat && fields.seat !== user.seat) {
      // Free old seat
      if (user.seat && user.seat !== 'None') {
        await Seat.update({ status: 'available', occupied_by: null, assigned_until: null }, { where: { number: user.seat } });
      }
      // Occupy new seat
      if (fields.seat !== 'None') {
        await Seat.update({ status: 'occupied', occupied_by: fields.name || user.name, assigned_until: user.expiry_date }, { where: { number: fields.seat } });
      }
    }

    // Handle discontinuation
    if (fields.status === 'Discontinued' && user.status !== 'Discontinued') {
      if (user.seat && user.seat !== 'None') {
        await Seat.update({ status: 'available', occupied_by: null, assigned_until: null }, { where: { number: user.seat } });
      }
      fields.previous_seat = user.seat;
      fields.seat = 'None';
      fields.discontinued_date = new Date().toISOString().split('T')[0];
    }

    // Password hash if updating password
    if (fields.password && fields.password.trim()) {
      fields.password = await bcrypt.hash(fields.password.trim(), 10);
    } else {
      delete fields.password;
    }

    let updatedHistory = Array.isArray(user.history) ? user.history : [];
    if (fields.historyLog) {
      updatedHistory = [fields.historyLog, ...updatedHistory];
    }
    fields.history = updatedHistory;

    await user.update({
      name: fields.name ?? user.name,
      mobile: fields.mobile ?? user.mobile,
      email: fields.email ?? user.email,
      address: fields.address ?? user.address,
      password: fields.password ?? user.password,
      plan: fields.plan ?? user.plan,
      plan_id: fields.planId ?? user.plan_id,
      seat: fields.seat ?? user.seat,
      expiry_date: fields.expiryDate ?? user.expiry_date,
      status: fields.status ?? user.status,
      previous_seat: fields.previous_seat ?? user.previous_seat,
      discontinued_date: fields.discontinued_date ?? user.discontinued_date,
      history: updatedHistory
    });

    res.json({ success: true, message: 'Member details updated.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (user && user.seat && user.seat !== 'None') {
      await Seat.update({ status: 'available', occupied_by: null, assigned_until: null }, { where: { number: user.seat } });
    }

    if (user) {
      await user.destroy();
    }

    res.json({ success: true, message: 'Member deleted.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

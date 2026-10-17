import express, { Request, Response } from 'express';
import { getPool } from '../config/db.js';

const router = express.Router();

// ----------------- HEALTH CHECK -----------------
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const db = getPool();
    await db.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// ----------------- SEATS -----------------
router.get('/seats', async (_req: Request, res: Response) => {
  try {
    const db = getPool();
    const [rows]: any = await db.query('SELECT * FROM seats ORDER BY floor ASC, section ASC, number ASC');
    const formatted = rows.map((s: any) => ({
      ...s,
      hasPowerOutlet: Boolean(s.hasPowerOutlet),
      hasDeskLamp: Boolean(s.hasDeskLamp),
      isCornerOrWindow: Boolean(s.isCornerOrWindow)
    }));
    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/seats/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, occupiedBy, assignedUntil } = req.body;
    const db = getPool();

    await db.query(`
      UPDATE seats
      SET status = COALESCE(?, status),
          occupiedBy = ?,
          assignedUntil = ?
      WHERE id = ? OR number = ?
    `, [status, occupiedBy ?? null, assignedUntil ?? null, id, id]);

    res.json({ success: true, message: 'Seat updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/seats', async (req: Request, res: Response) => {
  try {
    const { number, floor, section, status } = req.body;
    const db = getPool();
    const id = `seat-${section.toLowerCase()}-${number.replace(/^[A-Za-z]+/, '')}`;

    await db.query(`
      INSERT INTO seats (id, number, floor, section, status, hasPowerOutlet, hasDeskLamp, isCornerOrWindow)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, number, floor, section, status || 'available', true, true, false]);

    res.status(201).json({ success: true, message: `Seat ${number} created successfully` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/seats/:number', async (req: Request, res: Response) => {
  try {
    const { number } = req.params;
    const db = getPool();
    await db.query('DELETE FROM seats WHERE number = ? OR id = ?', [number, number]);
    res.json({ success: true, message: `Seat ${number} deleted` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- USERS / MEMBERS -----------------
router.get('/users', async (_req: Request, res: Response) => {
  try {
    const db = getPool();
    const [rows]: any = await db.query('SELECT * FROM users ORDER BY created_at DESC');
    const formatted = rows.map((u: any) => ({
      ...u,
      history: typeof u.history === 'string' ? JSON.parse(u.history) : u.history || []
    }));
    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/users', async (req: Request, res: Response) => {
  try {
    const { name, mobile, email, address, plan, planId, seat, joiningDate, expiryDate, status } = req.body;
    const db = getPool();
    const id = `usr-${Date.now().toString().slice(-5)}`;
    const history = JSON.stringify([`Joined on ${joiningDate} (Assigned Seat ${seat || 'None'})`]);

    await db.query(`
      INSERT INTO users (id, name, mobile, email, address, plan, planId, seat, joiningDate, expiryDate, status, history)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, name, mobile, email, address, plan, planId, seat, joiningDate, expiryDate, status || 'Active', history]);

    // If seat was assigned, update seat in database as occupied
    if (seat && seat !== 'None') {
      await db.query(`
        UPDATE seats SET status = 'occupied', occupiedBy = ?, assignedUntil = ?
        WHERE number = ?
      `, [name, expiryDate, seat]);
    }

    // Record activity
    const actId = `act-${Date.now()}`;
    await db.query(`
      INSERT INTO activities (id, type, title, timestamp, details, meta)
      VALUES (?, 'member_added', 'New Member Registered', 'Just now', ?, ?)
    `, [actId, `${name} enrolled for ${plan}`, JSON.stringify({ userName: name, seatNumber: seat })]);

    res.status(201).json({ success: true, message: `${name} registered successfully with ID ${id}`, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const db = getPool();

    // Check user
    const [existing]: any = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = existing[0];

    // If seat changed
    if (fields.seat && fields.seat !== user.seat) {
      // release old seat
      if (user.seat && user.seat !== 'None') {
        await db.query("UPDATE seats SET status = 'available', occupiedBy = NULL, assignedUntil = NULL WHERE number = ?", [user.seat]);
      }
      // occupy new seat
      if (fields.seat !== 'None') {
        await db.query("UPDATE seats SET status = 'occupied', occupiedBy = ?, assignedUntil = ? WHERE number = ?", [user.name, user.expiryDate, fields.seat]);
      }
    }

    // If discontinued
    if (fields.status === 'Discontinued' && user.status !== 'Discontinued') {
      if (user.seat && user.seat !== 'None') {
        await db.query("UPDATE seats SET status = 'available', occupiedBy = NULL, assignedUntil = NULL WHERE number = ?", [user.seat]);
      }
    }

    // Prepare history update
    let updatedHistory = typeof user.history === 'string' ? JSON.parse(user.history) : user.history || [];
    if (fields.historyLog) {
      updatedHistory = [fields.historyLog, ...updatedHistory];
    }

    await db.query(`
      UPDATE users SET
        name = COALESCE(?, name),
        mobile = COALESCE(?, mobile),
        email = COALESCE(?, email),
        address = COALESCE(?, address),
        plan = COALESCE(?, plan),
        planId = COALESCE(?, planId),
        seat = COALESCE(?, seat),
        expiryDate = COALESCE(?, expiryDate),
        status = COALESCE(?, status),
        previousSeat = COALESCE(?, previousSeat),
        discontinuedDate = COALESCE(?, discontinuedDate),
        history = ?
      WHERE id = ?
    `, [
      fields.name,
      fields.mobile,
      fields.email,
      fields.address,
      fields.plan,
      fields.planId,
      fields.seat,
      fields.expiryDate,
      fields.status,
      fields.previousSeat,
      fields.discontinuedDate,
      JSON.stringify(updatedHistory),
      id
    ]);

    res.json({ success: true, message: 'User updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- MEMBERSHIP PLANS -----------------
router.get('/plans', async (_req: Request, res: Response) => {
  try {
    const db = getPool();
    const [rows]: any = await db.query('SELECT * FROM membership_plans ORDER BY price ASC');
    const formatted = rows.map((p: any) => ({
      ...p,
      features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features || [],
      isPopular: Boolean(p.isPopular),
      price: Number(p.price),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined
    }));
    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/plans', async (req: Request, res: Response) => {
  try {
    const { name, duration, durationUnit, price, originalPrice, billingCycle, badge, isPopular, features, timing, description, status } = req.body;
    const db = getPool();
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    await db.query(`
      INSERT INTO membership_plans (id, name, duration, durationUnit, price, originalPrice, billingCycle, badge, isPopular, features, timing, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, name, duration, durationUnit || 'Months', price, originalPrice || null, billingCycle || 'one-time', badge || '', isPopular || false, JSON.stringify(features || []), timing || '', description || '', status || 'Active']);

    res.status(201).json({ success: true, message: `Plan ${name} created` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/plans/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const db = getPool();

    await db.query(`
      UPDATE membership_plans SET
        name = COALESCE(?, name),
        duration = COALESCE(?, duration),
        price = COALESCE(?, price),
        originalPrice = COALESCE(?, originalPrice),
        billingCycle = COALESCE(?, billingCycle),
        badge = COALESCE(?, badge),
        isPopular = COALESCE(?, isPopular),
        features = COALESCE(?, features),
        timing = COALESCE(?, timing),
        description = COALESCE(?, description),
        status = COALESCE(?, status)
      WHERE id = ?
    `, [
      fields.name,
      fields.duration,
      fields.price,
      fields.originalPrice,
      fields.billingCycle,
      fields.badge,
      fields.isPopular,
      fields.features ? JSON.stringify(fields.features) : null,
      fields.timing,
      fields.description,
      fields.status,
      id
    ]);

    res.json({ success: true, message: 'Plan updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------- ACTIVITIES -----------------
router.get('/activities', async (_req: Request, res: Response) => {
  try {
    const db = getPool();
    const [rows]: any = await db.query('SELECT * FROM activities ORDER BY created_at DESC LIMIT 20');
    const formatted = rows.map((a: any) => ({
      ...a,
      meta: typeof a.meta === 'string' ? JSON.parse(a.meta) : a.meta || {}
    }));
    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Seat, Floor, SeatAllocation, User, Activity, sequelize } from '../models/index.js';
import { getTodayDateString } from '../utils/dateUtils.js';

export const getSeats = async (req: Request, res: Response) => {
  try {
    const { floorId, status, search } = req.query;

    const whereClause: any = {};

    if (floorId && floorId !== 'all') {
      if (floorId === 'unassigned') {
        whereClause[Op.or] = [{ floor_id: null }, { floor_id: '' }];
      } else {
        whereClause.floor_id = floorId;
      }
    }

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      whereClause[Op.or] = [
        sequelize.where(sequelize.fn('LOWER', sequelize.col('number')), { [Op.like]: q }),
        sequelize.where(sequelize.fn('LOWER', sequelize.col('occupied_by')), { [Op.like]: q })
      ];
    }

    const seats = await Seat.findAll({
      where: whereClause,
      order: [['floor', 'ASC'], ['number', 'ASC']]
    });

    const formatted = seats.map((s) => ({
      id: s.id,
      number: s.number,
      floor: s.floor,
      floorId: s.floor_id,
      floorName: s.floor_name || (s.floor ? `Floor ${s.floor}` : 'No Floor'),
      section: s.section || '',
      description: s.description || '',
      status: s.status,
      hasPowerOutlet: Boolean(s.has_power_outlet),
      hasDeskLamp: Boolean(s.has_desk_lamp),
      isCornerOrWindow: Boolean(s.is_corner_or_window),
      occupiedBy: s.occupied_by,
      assignedUntil: s.assigned_until
    }));

    res.json(formatted);
  } catch (error: any) {
    console.error('[Seat Error] getSeats failed:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getSeatStats = async (_req: Request, res: Response) => {
  try {
    const [totalSeats, availableSeats, occupiedSeats, unavailableSeats] = await Promise.all([
      Seat.count(),
      Seat.count({ where: { status: 'available' } }),
      Seat.count({ where: { status: 'occupied' } }),
      Seat.count({ where: { status: 'maintenance' } })
    ]);

    res.json({
      totalSeats,
      availableSeats,
      occupiedSeats,
      unavailableSeats
    });
  } catch (error: any) {
    console.error('[Seat Error] getSeatStats failed:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const addSeat = async (req: Request, res: Response) => {
  try {
    const { number, floorId, description, status } = req.body;

    if (!number || !String(number).trim()) {
      return res.status(400).json({ error: 'Seat Number is required.' });
    }

    const cleanNumber = String(number).trim().toUpperCase();

    // Check duplicate seat number
    const existing = await Seat.findOne({
      where: sequelize.where(sequelize.fn('LOWER', sequelize.col('number')), cleanNumber.toLowerCase())
    });

    if (existing) {
      return res.status(409).json({ error: `Seat "${cleanNumber}" already exists in the library.` });
    }

    let resolvedFloorId: string | null = null;
    let resolvedFloorName: string | null = null;
    let resolvedFloorNumber: number | null = null;

    if (floorId && floorId !== 'none' && floorId !== 'unassigned') {
      const floorRec = await Floor.findByPk(floorId);
      if (!floorRec) {
        return res.status(400).json({ error: 'Selected floor does not exist.' });
      }
      if (floorRec.status === 'Inactive') {
        return res.status(400).json({ error: `Cannot add seats to deactivated floor "${floorRec.name}". Please activate the floor first.` });
      }
      resolvedFloorId = floorRec.id;
      resolvedFloorName = floorRec.name;
      resolvedFloorNumber = floorRec.floor_number || 1;
    }

    const initialStatus = status === 'maintenance' ? 'maintenance' : 'available';

    const newSeat = await Seat.create({
      id: `seat-${Date.now()}-${cleanNumber.toLowerCase()}`,
      number: cleanNumber,
      floor: resolvedFloorNumber,
      floor_id: resolvedFloorId,
      floor_name: resolvedFloorName,
      section: '',
      description: description ? description.trim() : null,
      status: initialStatus,
      has_power_outlet: true,
      has_desk_lamp: true,
      is_corner_or_window: false,
      occupied_by: null,
      assigned_until: null
    });

    res.status(201).json({
      success: true,
      message: `Seat ${cleanNumber} created successfully.`,
      seat: {
        id: newSeat.id,
        number: newSeat.number,
        floor: newSeat.floor,
        floorId: newSeat.floor_id,
        floorName: newSeat.floor_name || 'No Floor',
        status: newSeat.status,
        description: newSeat.description,
        hasPowerOutlet: newSeat.has_power_outlet,
        hasDeskLamp: newSeat.has_desk_lamp,
        isCornerOrWindow: newSeat.is_corner_or_window,
        occupiedBy: null,
        assignedUntil: null
      }
    });
  } catch (error: any) {
    console.error('[Seat Error] addSeat failed:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const bulkAddSeats = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { floorId, count, prefix, startNumber, description } = req.body;

    const seatCount = Number(count);
    const startNum = Number(startNumber);
    const seatPrefix = prefix !== undefined ? String(prefix).trim().toUpperCase() : '';

    if (isNaN(seatCount) || seatCount < 1 || seatCount > 200) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Number of seats to create must be between 1 and 200.' });
    }

    if (isNaN(startNum) || startNum < 1) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Starting number must be at least 1.' });
    }

    let resolvedFloorId: string | null = null;
    let resolvedFloorName: string | null = null;
    let resolvedFloorNumber: number | null = null;

    if (floorId && floorId !== 'none' && floorId !== 'unassigned') {
      const floorRec = await Floor.findByPk(floorId);
      if (!floorRec) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Selected floor does not exist.' });
      }
      if (floorRec.status === 'Inactive') {
        await transaction.rollback();
        return res.status(400).json({ error: `Cannot add seats to deactivated floor "${floorRec.name}". Please activate the floor first.` });
      }
      resolvedFloorId = floorRec.id;
      resolvedFloorName = floorRec.name;
      resolvedFloorNumber = floorRec.floor_number || 1;
    }

    // Generate candidate seat numbers
    const candidateNumbers: string[] = [];
    for (let i = 0; i < seatCount; i++) {
      const currentVal = startNum + i;
      const numStr = currentVal < 10 ? `0${currentVal}` : `${currentVal}`;
      const seatNumber = `${seatPrefix}${numStr}`;
      candidateNumbers.push(seatNumber);
    }

    // Check for existing seat numbers in DB
    const existingSeats = await Seat.findAll({
      where: {
        number: {
          [Op.in]: candidateNumbers
        }
      },
      attributes: ['number'],
      transaction
    });

    const existingSet = new Set(existingSeats.map((s) => s.number.toUpperCase()));

    const toCreate: any[] = [];
    const skippedSeats: { number: string; reason: string }[] = [];

    const now = Date.now();
    for (let i = 0; i < candidateNumbers.length; i++) {
      const seatNum = candidateNumbers[i];
      if (existingSet.has(seatNum.toUpperCase())) {
        skippedSeats.push({
          number: seatNum,
          reason: 'Seat number already exists in library'
        });
      } else {
        toCreate.push({
          id: `seat-${now}-${seatNum.toLowerCase()}`,
          number: seatNum,
          floor: resolvedFloorNumber,
          floor_id: resolvedFloorId,
          floor_name: resolvedFloorName,
          section: '',
          description: description ? description.trim() : null,
          status: 'available',
          has_power_outlet: true,
          has_desk_lamp: true,
          is_corner_or_window: false,
          occupied_by: null,
          assigned_until: null
        });
      }
    }

    if (toCreate.length > 0) {
      await Seat.bulkCreate(toCreate, { transaction });
    }

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: `Bulk creation complete: ${toCreate.length} created, ${skippedSeats.length} skipped.`,
      requestedCount: seatCount,
      createdCount: toCreate.length,
      skippedCount: skippedSeats.length,
      createdSeats: toCreate.map((s) => s.number),
      skippedSeats
    });
  } catch (error: any) {
    await transaction.rollback();
    console.error('[Seat Error] bulkAddSeats failed:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateSeat = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, floorId, description, occupiedBy, assignedUntil } = req.body;

    const seat = await Seat.findOne({
      where: {
        [Op.or]: [{ id }, { number: id }]
      }
    });

    if (!seat) {
      return res.status(404).json({ error: 'Seat not found.' });
    }

    let warning: string | null = null;

    // Strict validation: Do not allow a seat to be marked Available if an active member allocation exists
    if (status === 'available' && seat.status !== 'available') {
      const activeAlloc = await SeatAllocation.findOne({
        where: { seat_number: seat.number, status: 'Active' }
      });
      const activeMember = await User.findOne({
        where: { seat: seat.number, status: 'Active' }
      });

      if (activeAlloc || activeMember || seat.occupied_by) {
        const occupantName = activeMember?.name || activeAlloc?.user_name || seat.occupied_by;
        return res.status(400).json({
          error: `Cannot mark Seat ${seat.number} as Available because it is currently assigned to ${occupantName}. Please transfer or release the member first.`
        });
      }
    }

    // When a seat becomes unavailable, preserve existing allocation and warn if occupied
    if (status === 'maintenance' && seat.status === 'occupied') {
      warning = `Seat ${seat.number} is marked as Maintenance/Unavailable. Occupant assignment (${seat.occupied_by}) remains preserved.`;
    }

    // Floor assignment update
    if (floorId !== undefined) {
      if (floorId === 'none' || floorId === 'unassigned' || !floorId) {
        seat.floor_id = null;
        seat.floor_name = null;
      } else {
        const floorRec = await Floor.findByPk(floorId);
        if (!floorRec) {
          return res.status(400).json({ error: 'Selected floor does not exist.' });
        }
        seat.floor_id = floorRec.id;
        seat.floor_name = floorRec.name;
        seat.floor = floorRec.floor_number || 1;
      }
    }

    if (description !== undefined) {
      seat.description = description ? description.trim() : null;
    }

    if (status) {
      seat.status = status;
    }

    if (occupiedBy !== undefined) {
      seat.occupied_by = occupiedBy;
    }

    if (assignedUntil !== undefined) {
      seat.assigned_until = assignedUntil;
    }

    await seat.save();

    res.json({
      success: true,
      message: `Seat ${seat.number} updated successfully.`,
      warning,
      seat: {
        id: seat.id,
        number: seat.number,
        floor: seat.floor,
        floorId: seat.floor_id,
        floorName: seat.floor_name || 'No Floor',
        status: seat.status,
        description: seat.description,
        occupiedBy: seat.occupied_by,
        assignedUntil: seat.assigned_until
      }
    });
  } catch (error: any) {
    console.error('[Seat Error] updateSeat failed:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteSeat = async (req: Request, res: Response) => {
  try {
    const { number } = req.params;

    const seat = await Seat.findOne({
      where: {
        [Op.or]: [{ number }, { id: number }]
      }
    });

    if (!seat) {
      return res.status(404).json({ error: 'Seat not found.' });
    }

    // Strict validation: Do not allow occupied seats to be deleted
    if (seat.status === 'occupied' || (seat.occupied_by && seat.occupied_by.trim())) {
      return res.status(400).json({
        error: `Cannot delete Seat ${seat.number} because it is currently occupied by ${seat.occupied_by}. Please release or transfer the member first.`
      });
    }

    // Check if any active user is assigned to this seat
    const assignedUser = await User.findOne({
      where: { seat: seat.number, status: 'Active' }
    });
    if (assignedUser) {
      return res.status(400).json({
        error: `Cannot delete Seat ${seat.number} because member ${assignedUser.name} is currently assigned to it.`
      });
    }

    await seat.destroy();

    res.json({ success: true, message: `Seat ${seat.number} removed from library layout.` });
  } catch (error: any) {
    console.error('[Seat Error] deleteSeat failed:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const transferSeat = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { userId, newSeatNumber } = req.body;

    if (!userId || !newSeatNumber) {
      await transaction.rollback();
      return res.status(400).json({ error: 'User ID and Target Seat Number are required.' });
    }

    const user = await User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Member not found.' });
    }

    const targetSeatNum = String(newSeatNumber).trim().toUpperCase();
    const oldSeatNum = user.seat;

    if (oldSeatNum === targetSeatNum) {
      await transaction.rollback();
      return res.status(400).json({ error: `Member is already assigned to Seat ${targetSeatNum}.` });
    }

    // Find and validate target seat
    const targetSeat = await Seat.findOne({ where: { number: targetSeatNum }, transaction });
    if (!targetSeat) {
      await transaction.rollback();
      return res.status(400).json({ error: `Target seat ${targetSeatNum} does not exist.` });
    }

    if (targetSeat.status !== 'available') {
      await transaction.rollback();
      return res.status(400).json({
        error: `Seat ${targetSeatNum} is currently ${targetSeat.status} (assigned to ${targetSeat.occupied_by || 'another member'}).`
      });
    }

    // Check if target seat is on a deactivated floor
    if (targetSeat.floor_id) {
      const floorRec = await Floor.findByPk(targetSeat.floor_id, { transaction });
      if (floorRec && floorRec.status === 'Inactive') {
        await transaction.rollback();
        return res.status(400).json({
          error: `Cannot assign seat on deactivated floor "${floorRec.name}". Please activate the floor first.`
        });
      }
    }

    const todayStr = getTodayDateString();

    // 1. Release old seat if member had one
    if (oldSeatNum && oldSeatNum !== 'None') {
      await Seat.update(
        { status: 'available', occupied_by: null, assigned_until: null },
        { where: { number: oldSeatNum }, transaction }
      );

      // Close previous active allocation
      await SeatAllocation.update(
        {
          status: 'Transferred',
          release_date: todayStr,
          notes: `Transferred to Seat ${targetSeatNum}`
        },
        {
          where: { user_id: user.id, seat_number: oldSeatNum, status: 'Active' },
          transaction
        }
      );
    }

    // 2. Occupy target seat
    await targetSeat.update(
      {
        status: 'occupied',
        occupied_by: user.name,
        assigned_until: user.expiry_date
      },
      { transaction }
    );

    // 3. Create new SeatAllocation record
    await SeatAllocation.create(
      {
        id: `alloc-${Date.now()}`,
        user_id: user.id,
        user_name: user.name,
        user_identifier: user.mobile || user.email,
        seat_id: targetSeat.id,
        seat_number: targetSeatNum,
        floor_id: targetSeat.floor_id,
        floor_name: targetSeat.floor_name || 'No Floor',
        start_date: todayStr,
        end_date: user.expiry_date,
        status: 'Active',
        action_type: 'Transferred',
        notes: `Transferred from ${oldSeatNum || 'None'}`
      },
      { transaction }
    );

    // 4. Update member record
    let updatedHistory = Array.isArray(user.history) ? user.history : [];
    if (typeof user.history === 'string') {
      try {
        updatedHistory = JSON.parse(user.history);
      } catch (e) {
        updatedHistory = [];
      }
    }
    updatedHistory = [
      `Transferred from Seat ${oldSeatNum || 'None'} to Seat ${targetSeatNum} on ${todayStr}`,
      ...updatedHistory
    ];

    await user.update(
      {
        seat: targetSeatNum,
        previous_seat: oldSeatNum && oldSeatNum !== 'None' ? oldSeatNum : user.previous_seat,
        history: updatedHistory
      },
      { transaction }
    );

    // 5. Activity log
    try {
      await Activity.create({
        id: `act-${Date.now()}`,
        type: 'seat_changed',
        title: 'Seat Transfer Completed',
        timestamp: 'Just now',
        details: `${user.name} transferred from Seat ${oldSeatNum} to Seat ${targetSeatNum}`,
        meta: { userName: user.name, oldSeat: oldSeatNum, newSeat: targetSeatNum }
      });
    } catch (e) {}

    await transaction.commit();

    res.json({
      success: true,
      message: `Member ${user.name} successfully transferred to Seat ${targetSeatNum}.`,
      seat: targetSeatNum
    });
  } catch (error: any) {
    await transaction.rollback();
    console.error('[Seat Error] transferSeat failed:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const releaseSeat = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction();
  try {
    const { userId, seatNumber } = req.body;

    let user: User | null = null;
    if (userId) {
      user = await User.findByPk(userId, { transaction });
    } else if (seatNumber) {
      user = await User.findOne({ where: { seat: seatNumber, status: 'Active' }, transaction });
    }

    const targetSeatNum = seatNumber || (user ? user.seat : null);

    if (!targetSeatNum || targetSeatNum === 'None') {
      await transaction.rollback();
      return res.status(400).json({ error: 'No active seat found to release.' });
    }

    const todayStr = getTodayDateString();

    // 1. Free seat in Seat table
    await Seat.update(
      { status: 'available', occupied_by: null, assigned_until: null },
      { where: { number: targetSeatNum }, transaction }
    );

    // 2. Close active allocation
    await SeatAllocation.update(
      {
        status: 'Released',
        release_date: todayStr,
        notes: 'Explicitly released by Administrator'
      },
      {
        where: { seat_number: targetSeatNum, status: 'Active' },
        transaction
      }
    );

    // 3. Update user if found
    if (user) {
      let updatedHistory = Array.isArray(user.history) ? user.history : [];
      if (typeof user.history === 'string') {
        try {
          updatedHistory = JSON.parse(user.history);
        } catch (e) {
          updatedHistory = [];
        }
      }
      updatedHistory = [
        `Seat ${targetSeatNum} released by Admin on ${todayStr}`,
        ...updatedHistory
      ];

      await user.update(
        {
          previous_seat: targetSeatNum,
          seat: 'None',
          history: updatedHistory
        },
        { transaction }
      );
    }

    // 4. Activity log
    try {
      await Activity.create({
        id: `act-${Date.now()}`,
        type: 'seat_changed',
        title: 'Seat Released',
        timestamp: 'Just now',
        details: `Seat ${targetSeatNum} was released${user ? ` from ${user.name}` : ''}.`,
        meta: { seatNumber: targetSeatNum, userName: user?.name }
      });
    } catch (e) {}

    await transaction.commit();

    res.json({
      success: true,
      message: `Seat ${targetSeatNum} released successfully.`
    });
  } catch (error: any) {
    await transaction.rollback();
    console.error('[Seat Error] releaseSeat failed:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getAllocationHistory = async (req: Request, res: Response) => {
  try {
    const { member, seatNumber, floorName, status, startDate, endDate } = req.query;

    const whereClause: any = {};

    if (member && typeof member === 'string' && member.trim()) {
      const q = `%${member.trim().toLowerCase()}%`;
      whereClause[Op.or] = [
        sequelize.where(sequelize.fn('LOWER', sequelize.col('user_name')), { [Op.like]: q }),
        sequelize.where(sequelize.fn('LOWER', sequelize.col('user_identifier')), { [Op.like]: q })
      ];
    }

    if (seatNumber && typeof seatNumber === 'string' && seatNumber.trim()) {
      whereClause.seat_number = seatNumber.trim().toUpperCase();
    }

    if (floorName && typeof floorName === 'string' && floorName !== 'all') {
      whereClause.floor_name = floorName;
    }

    if (status && typeof status === 'string' && status !== 'all') {
      whereClause.status = status;
    }

    if (startDate && typeof startDate === 'string') {
      whereClause.start_date = { [Op.gte]: startDate };
    }

    if (endDate && typeof endDate === 'string') {
      whereClause.start_date = { ...(whereClause.start_date || {}), [Op.lte]: endDate };
    }

    const allocations = await SeatAllocation.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });

    const formatted = allocations.map((a) => ({
      id: a.id,
      userId: a.user_id,
      userName: a.user_name,
      userIdentifier: a.user_identifier,
      seatId: a.seat_id,
      seatNumber: a.seat_number,
      floorId: a.floor_id,
      floorName: a.floor_name || 'No Floor',
      startDate: a.start_date,
      endDate: a.end_date,
      releaseDate: a.release_date,
      status: a.status,
      actionType: a.action_type,
      notes: a.notes,
      createdAt: a.created_at
    }));

    res.json(formatted);
  } catch (error: any) {
    console.error('[Seat Error] getAllocationHistory failed:', error.message);
    res.status(500).json({ error: error.message });
  }
};

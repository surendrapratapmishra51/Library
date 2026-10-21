import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Floor, Seat, SeatAllocation } from '../models/index.js';

export const getFloors = async (_req: Request, res: Response) => {
  try {
    const floors = await Floor.findAll({
      order: [['sort_order', 'ASC'], ['created_at', 'ASC']]
    });

    // Compute live seat statistics directly from actual database records
    const floorsWithStats = await Promise.all(
      floors.map(async (floor) => {
        const [totalSeats, availableSeats, occupiedSeats, unavailableSeats] = await Promise.all([
          Seat.count({ where: { floor_id: floor.id } }),
          Seat.count({ where: { floor_id: floor.id, status: 'available' } }),
          Seat.count({ where: { floor_id: floor.id, status: 'occupied' } }),
          Seat.count({ where: { floor_id: floor.id, status: 'maintenance' } }),
        ]);

        return {
          id: floor.id,
          name: floor.name,
          floorNumber: floor.floor_number,
          description: floor.description || '',
          status: floor.status,
          sortOrder: floor.sort_order,
          stats: {
            totalSeats,
            availableSeats,
            occupiedSeats,
            unavailableSeats,
          },
          createdAt: floor.created_at,
          updatedAt: floor.updated_at,
        };
      })
    );

    // Also compute unassigned / "No Floor" seat counts
    const [noFloorTotal, noFloorAvailable, noFloorOccupied, noFloorUnavailable] = await Promise.all([
      Seat.count({ where: { [Op.or]: [{ floor_id: null }, { floor_id: '' }] } }),
      Seat.count({ where: { [Op.or]: [{ floor_id: null }, { floor_id: '' }], status: 'available' } }),
      Seat.count({ where: { [Op.or]: [{ floor_id: null }, { floor_id: '' }], status: 'occupied' } }),
      Seat.count({ where: { [Op.or]: [{ floor_id: null }, { floor_id: '' }], status: 'maintenance' } }),
    ]);

    res.json({
      floors: floorsWithStats,
      unassignedStats: {
        totalSeats: noFloorTotal,
        availableSeats: noFloorAvailable,
        occupiedSeats: noFloorOccupied,
        unavailableSeats: noFloorUnavailable,
      }
    });
  } catch (error: any) {
    console.error('[Floor Error] getFloors failed:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const createFloor = async (req: Request, res: Response) => {
  try {
    const { name, description, status, floorNumber, sortOrder } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Floor name is required.' });
    }

    const cleanName = name.trim();

    // Case-insensitive duplicate name validation
    const existing = await Floor.findOne({
      where: sequelizeLowerWhere('name', cleanName)
    });

    if (existing) {
      return res.status(409).json({ error: `A floor named "${cleanName}" already exists.` });
    }

    const id = `flr-${Date.now()}`;
    const cleanSortOrder = Number(sortOrder) || (await Floor.count()) + 1;

    const newFloor = await Floor.create({
      id,
      name: cleanName,
      description: description ? description.trim() : null,
      status: status === 'Inactive' ? 'Inactive' : 'Active',
      floor_number: floorNumber ? Number(floorNumber) : null,
      sort_order: cleanSortOrder,
    });

    res.status(201).json({
      success: true,
      message: `Floor "${cleanName}" created successfully.`,
      floor: {
        id: newFloor.id,
        name: newFloor.name,
        floorNumber: newFloor.floor_number,
        description: newFloor.description || '',
        status: newFloor.status,
        sortOrder: newFloor.sort_order,
        stats: {
          totalSeats: 0,
          availableSeats: 0,
          occupiedSeats: 0,
          unavailableSeats: 0,
        }
      }
    });
  } catch (error: any) {
    console.error('[Floor Error] createFloor failed:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateFloor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, status, floorNumber, sortOrder } = req.body;

    const floor = await Floor.findByPk(id);
    if (!floor) {
      return res.status(404).json({ error: 'Floor not found.' });
    }

    let warning: string | null = null;

    if (name && name.trim()) {
      const cleanName = name.trim();
      if (cleanName.toLowerCase() !== floor.name.toLowerCase()) {
        const duplicate = await Floor.findOne({
          where: {
            ...sequelizeLowerWhere('name', cleanName),
            id: { [Op.ne]: id }
          }
        });
        if (duplicate) {
          return res.status(409).json({ error: `A floor named "${cleanName}" already exists.` });
        }
        floor.name = cleanName;

        // Propagate name change to associated seats and active allocations for consistency
        await Seat.update({ floor_name: cleanName }, { where: { floor_id: id } });
        await SeatAllocation.update({ floor_name: cleanName }, { where: { floor_id: id, status: 'Active' } });
      }
    }

    if (description !== undefined) {
      floor.description = description ? description.trim() : null;
    }

    if (floorNumber !== undefined) {
      floor.floor_number = floorNumber ? Number(floorNumber) : null;
    }

    if (sortOrder !== undefined) {
      floor.sort_order = Number(sortOrder) || floor.sort_order;
    }

    if (status && (status === 'Active' || status === 'Inactive')) {
      if (status === 'Inactive' && floor.status === 'Active') {
        // Check for occupied seats on this floor
        const occupiedCount = await Seat.count({ where: { floor_id: id, status: 'occupied' } });
        if (occupiedCount > 0) {
          warning = `Floor "${floor.name}" has been deactivated. Note: ${occupiedCount} active member allocation(s) remain preserved, but new seat assignments on this floor will be blocked.`;
        }
      }
      floor.status = status;
    }

    await floor.save();

    // Recompute stats
    const [totalSeats, availableSeats, occupiedSeats, unavailableSeats] = await Promise.all([
      Seat.count({ where: { floor_id: floor.id } }),
      Seat.count({ where: { floor_id: floor.id, status: 'available' } }),
      Seat.count({ where: { floor_id: floor.id, status: 'occupied' } }),
      Seat.count({ where: { floor_id: floor.id, status: 'maintenance' } }),
    ]);

    res.json({
      success: true,
      message: `Floor "${floor.name}" updated successfully.`,
      warning,
      floor: {
        id: floor.id,
        name: floor.name,
        floorNumber: floor.floor_number,
        description: floor.description || '',
        status: floor.status,
        sortOrder: floor.sort_order,
        stats: {
          totalSeats,
          availableSeats,
          occupiedSeats,
          unavailableSeats,
        }
      }
    });
  } catch (error: any) {
    console.error('[Floor Error] updateFloor failed:', error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteFloor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const floor = await Floor.findByPk(id);
    if (!floor) {
      return res.status(404).json({ error: 'Floor not found.' });
    }

    // Safety check 1: Do not delete floor if it has seats
    const seatCount = await Seat.count({ where: { floor_id: id } });
    if (seatCount > 0) {
      return res.status(400).json({
        error: `Cannot delete "${floor.name}" because it contains ${seatCount} seat(s). Please reassign or remove the seats first, or deactivate the floor instead.`
      });
    }

    // Safety check 2: Do not delete floor if it has historical allocations
    const allocCount = await SeatAllocation.count({ where: { floor_id: id } });
    if (allocCount > 0) {
      return res.status(400).json({
        error: `Cannot delete "${floor.name}" because it is referenced in ${allocCount} allocation history record(s). Please deactivate the floor instead to preserve data integrity.`
      });
    }

    await floor.destroy();

    res.json({
      success: true,
      message: `Floor "${floor.name}" removed successfully.`
    });
  } catch (error: any) {
    console.error('[Floor Error] deleteFloor failed:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Helper for case-insensitive WHERE clause in Sequelize
function sequelizeLowerWhere(field: string, value: string) {
  return {
    [field]: {
      [Op.like]: value
    }
  };
}

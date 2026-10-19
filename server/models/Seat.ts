import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface SeatAttributes {
  id: string;
  number: string;
  floor: number;
  section: string;
  status: 'available' | 'occupied' | 'maintenance';
  has_power_outlet?: boolean;
  has_desk_lamp?: boolean;
  is_corner_or_window?: boolean;
  occupied_by?: string | null;
  assigned_until?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface SeatCreationAttributes extends Optional<SeatAttributes, 'id' | 'status'> {}

class Seat extends Model<SeatAttributes, SeatCreationAttributes> implements SeatAttributes {
  public id!: string;
  public number!: string;
  public floor!: number;
  public section!: string;
  public status!: 'available' | 'occupied' | 'maintenance';
  public has_power_outlet!: boolean;
  public has_desk_lamp!: boolean;
  public is_corner_or_window!: boolean;
  public occupied_by!: string | null;
  public assigned_until!: string | null;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Seat.init(
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    number: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: 'seats_number_unique_idx',
    },
    floor: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    section: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('available', 'occupied', 'maintenance'),
      allowNull: false,
      defaultValue: 'available',
    },
    has_power_outlet: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    has_desk_lamp: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_corner_or_window: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    occupied_by: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    assigned_until: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'seats',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Seat;

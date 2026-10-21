import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface SeatAttributes {
  id: string;
  number: string;
  floor?: number | null;
  floor_id?: string | null;
  floor_name?: string | null;
  section?: string | null;
  description?: string | null;
  status: 'available' | 'occupied' | 'maintenance';
  has_power_outlet?: boolean;
  has_desk_lamp?: boolean;
  is_corner_or_window?: boolean;
  occupied_by?: string | null;
  assigned_until?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface SeatCreationAttributes extends Optional<SeatAttributes, 'id' | 'status' | 'section' | 'floor' | 'floor_id' | 'floor_name' | 'description'> {}

class Seat extends Model<SeatAttributes, SeatCreationAttributes> implements SeatAttributes {
  public id!: string;
  public number!: string;
  public floor!: number | null;
  public floor_id!: string | null;
  public floor_name!: string | null;
  public section!: string | null;
  public description!: string | null;
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
      allowNull: true,
      defaultValue: 1,
    },
    floor_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    floor_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    section: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: '',
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
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

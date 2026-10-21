import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface SeatAllocationAttributes {
  id: string;
  user_id: string;
  user_name: string;
  user_identifier?: string | null;
  seat_id?: string | null;
  seat_number: string;
  floor_id?: string | null;
  floor_name?: string | null;
  start_date: string;
  end_date?: string | null;
  release_date?: string | null;
  status: 'Active' | 'Transferred' | 'Released' | 'Expired';
  action_type: 'Enrolled' | 'Transferred' | 'Released' | 'Renewed';
  notes?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface SeatAllocationCreationAttributes extends Optional<SeatAllocationAttributes, 'id' | 'status' | 'action_type'> {}

class SeatAllocation extends Model<SeatAllocationAttributes, SeatAllocationCreationAttributes> implements SeatAllocationAttributes {
  public id!: string;
  public user_id!: string;
  public user_name!: string;
  public user_identifier!: string | null;
  public seat_id!: string | null;
  public seat_number!: string;
  public floor_id!: string | null;
  public floor_name!: string | null;
  public start_date!: string;
  public end_date!: string | null;
  public release_date!: string | null;
  public status!: 'Active' | 'Transferred' | 'Released' | 'Expired';
  public action_type!: 'Enrolled' | 'Transferred' | 'Released' | 'Renewed';
  public notes!: string | null;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

SeatAllocation.init(
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    user_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    user_identifier: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    seat_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    seat_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    floor_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    floor_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    start_date: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    end_date: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    release_date: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Active', 'Transferred', 'Released', 'Expired'),
      allowNull: false,
      defaultValue: 'Active',
    },
    action_type: {
      type: DataTypes.ENUM('Enrolled', 'Transferred', 'Released', 'Renewed'),
      allowNull: false,
      defaultValue: 'Enrolled',
    },
    notes: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'seat_allocations',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default SeatAllocation;

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface FloorAttributes {
  id: string;
  name: string;
  floor_number?: number | null;
  description?: string | null;
  status: 'Active' | 'Inactive';
  sort_order: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface FloorCreationAttributes extends Optional<FloorAttributes, 'id' | 'status' | 'sort_order'> {}

class Floor extends Model<FloorAttributes, FloorCreationAttributes> implements FloorAttributes {
  public id!: string;
  public name!: string;
  public floor_number!: number | null;
  public description!: string | null;
  public status!: 'Active' | 'Inactive';
  public sort_order!: number;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Floor.init(
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: 'floors_name_unique_idx',
    },
    floor_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive'),
      allowNull: false,
      defaultValue: 'Active',
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'floors',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Floor;

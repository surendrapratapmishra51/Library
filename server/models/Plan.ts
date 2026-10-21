import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface PlanAttributes {
  id: string;
  name: string;
  duration: string;
  duration_unit?: string;
  price: number;
  original_price?: number | null;
  billing_cycle?: string;
  badge?: string | null;
  is_popular?: boolean;
  features?: any;
  timing?: string | null;
  description?: string | null;
  status: 'Active' | 'Inactive';
  created_at?: Date;
  updated_at?: Date;
}

export interface PlanCreationAttributes extends Optional<PlanAttributes, 'status' | 'is_popular'> {}

class MembershipPlan extends Model<PlanAttributes, PlanCreationAttributes> implements PlanAttributes {
  public id!: string;
  public name!: string;
  public duration!: string;
  public duration_unit!: string;
  public price!: number;
  public original_price!: number | null;
  public billing_cycle!: string;
  public badge!: string | null;
  public is_popular!: boolean;
  public features!: any;
  public timing!: string | null;
  public description!: string | null;
  public status!: 'Active' | 'Inactive';

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

MembershipPlan.init(
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    duration: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    duration_unit: {
      type: DataTypes.STRING(20),
      defaultValue: 'Months',
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    original_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    billing_cycle: {
      type: DataTypes.STRING(50),
      defaultValue: 'per month',
    },
    badge: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    is_popular: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    features: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    timing: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive'),
      defaultValue: 'Active',
    },
  },
  {
    sequelize,
    tableName: 'membership_plans',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default MembershipPlan;

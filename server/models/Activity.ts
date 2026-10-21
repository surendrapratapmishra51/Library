import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface ActivityAttributes {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  details?: string | null;
  meta?: any;
  created_at?: Date;
  updated_at?: Date;
}

export interface ActivityCreationAttributes extends Optional<ActivityAttributes, 'id'> {}

class Activity extends Model<ActivityAttributes, ActivityCreationAttributes> implements ActivityAttributes {
  public id!: string;
  public type!: string;
  public title!: string;
  public timestamp!: string;
  public details!: string | null;
  public meta!: any;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Activity.init(
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    meta: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },
  },
  {
    sequelize,
    tableName: 'activities',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

export default Activity;

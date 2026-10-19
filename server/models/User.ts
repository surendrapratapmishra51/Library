import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface UserAttributes {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  password?: string;
  role: 'admin' | 'student';
  address?: string | null;
  plan?: string | null;
  plan_id?: string | null;
  seat?: string | null;
  joining_date?: string | null;
  expiry_date?: string | null;
  status: 'Active' | 'Discontinued';
  previous_seat?: string | null;
  discontinued_date?: string | null;
  history?: any;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role' | 'status'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public name!: string;
  public mobile!: string;
  public email!: string | null;
  public password!: string;
  public role!: 'admin' | 'student';
  public address!: string | null;
  public plan!: string | null;
  public plan_id!: string | null;
  public seat!: string | null;
  public joining_date!: string | null;
  public expiry_date!: string | null;
  public status!: 'Active' | 'Discontinued';
  public previous_seat!: string | null;
  public discontinued_date!: string | null;
  public history!: any;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    mobile: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: 'users_mobile_unique_idx',
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: 'users_email_unique_idx',
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'student'),
      allowNull: false,
      defaultValue: 'student',
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    plan: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Monthly Plan',
    },
    plan_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'monthly',
    },
    seat: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: 'None',
    },
    joining_date: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    expiry_date: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Active', 'Discontinued'),
      allowNull: false,
      defaultValue: 'Active',
    },
    previous_seat: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    discontinued_date: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    history: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: 'users',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default User;

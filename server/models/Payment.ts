import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface PaymentAttributes {
  id: string;
  user_id: string;
  user_name: string;
  user_mobile: string;
  plan_name: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  status: 'Completed' | 'Pending' | 'Failed';
  transaction_id?: string | null;
  notes?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id' | 'status'> {}

class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  public id!: string;
  public user_id!: string;
  public user_name!: string;
  public user_mobile!: string;
  public plan_name!: string;
  public amount!: number;
  public payment_method!: string;
  public payment_date!: string;
  public status!: 'Completed' | 'Pending' | 'Failed';
  public transaction_id!: string | null;
  public notes!: string | null;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Payment.init(
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
    user_mobile: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    plan_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.STRING(50),
      defaultValue: 'Cash',
    },
    payment_date: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Completed', 'Pending', 'Failed'),
      defaultValue: 'Completed',
    },
    transaction_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'payments',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['payment_date'] },
      { fields: ['status'] },
    ],
  }
);

export default Payment;

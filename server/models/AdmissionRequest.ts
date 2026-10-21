import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

export interface AdmissionRequestAttributes {
  id: string;
  name: string;
  mobile: string;
  email?: string | null;
  dob?: string | null;
  address?: string | null;
  plan_id: string;
  plan_name: string;
  preferred_seat: string;
  start_date: string;
  shift_timing?: string | null;
  notes?: string | null;
  status: 'Pending' | 'Accepted' | 'Rejected';
  rejection_reason?: string | null;
  allocated_seat?: string | null;
  allocated_plan_id?: string | null;
  allocated_plan_name?: string | null;
  processed_by?: string | null;
  processed_at?: Date | null;
  created_user_id?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface AdmissionRequestCreationAttributes
  extends Optional<
    AdmissionRequestAttributes,
    'id' | 'status' | 'preferred_seat' | 'shift_timing' | 'rejection_reason' | 'allocated_seat' | 'allocated_plan_id' | 'allocated_plan_name' | 'processed_by' | 'processed_at' | 'created_user_id' | 'created_at' | 'updated_at'
  > {}

class AdmissionRequest
  extends Model<AdmissionRequestAttributes, AdmissionRequestCreationAttributes>
  implements AdmissionRequestAttributes {
  public id!: string;
  public name!: string;
  public mobile!: string;
  public email!: string | null;
  public dob!: string | null;
  public address!: string | null;
  public plan_id!: string;
  public plan_name!: string;
  public preferred_seat!: string;
  public start_date!: string;
  public shift_timing!: string | null;
  public notes!: string | null;
  public status!: 'Pending' | 'Accepted' | 'Rejected';
  public rejection_reason!: string | null;
  public allocated_seat!: string | null;
  public allocated_plan_id!: string | null;
  public allocated_plan_name!: string | null;
  public processed_by!: string | null;
  public processed_at!: Date | null;
  public created_user_id!: string | null;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

AdmissionRequest.init(
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
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    dob: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    plan_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    plan_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    preferred_seat: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'None',
    },
    start_date: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    shift_timing: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: '24/7 All Day',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Accepted', 'Rejected'),
      allowNull: false,
      defaultValue: 'Pending',
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    allocated_seat: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    allocated_plan_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    allocated_plan_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    processed_by: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    processed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_user_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'admission_requests',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['mobile'] },
      { fields: ['status'] },
      { fields: ['preferred_seat'] },
      { fields: ['created_at'] },
    ],
  }
);

export default AdmissionRequest;

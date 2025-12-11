import mongoose, { Document, Schema } from 'mongoose';

export type Department = 'Developer' | 'Ops' | 'Platform';
export type EmployeeStatus = 'Available' | 'On Holiday' | 'On Duty';

export interface IEmployee extends Document {
  name: string;
  email: string;
  department: Department;
  employeeId: string;
  status: EmployeeStatus;
  photoUrl?: string;
  lastDutyDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IEmployee>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  department: {
    type: String,
    required: true,
    enum: ['Developer', 'Ops', 'Platform'],
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    default: 'Available',
    enum: ['Available', 'On Holiday', 'On Duty'],
  },
  photoUrl: {
    type: String,
    required: false,
  },
  lastDutyDate: {
    type: Date,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  versionKey: false,
  timestamps: true,
});

// Index for efficient querying
schema.index({ department: 1, status: 1 });
schema.index({ employeeId: 1 });

const Employee = mongoose.model<IEmployee>('Employee', schema);

export default Employee;

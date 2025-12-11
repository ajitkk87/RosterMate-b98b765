import mongoose, { Document, Schema } from 'mongoose';

export type DutyType = 'Prod Duty - Developer' | 'Non-Prod Duty - Developer' | 'Ops Duty' | 'Platform Duty';

export interface IDutyAssignment {
  _id: mongoose.Types.ObjectId;
  dutyType: DutyType;
  employeeId: mongoose.Types.ObjectId;
}

export interface IRoster extends Document {
  weekStartDate: Date;
  weekEndDate: Date;
  assignments: IDutyAssignment[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const dutyAssignmentSchema = new Schema<IDutyAssignment>({
  dutyType: {
    type: String,
    required: true,
    enum: ['Prod Duty - Developer', 'Non-Prod Duty - Developer', 'Ops Duty', 'Platform Duty'],
  },
  employeeId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Employee',
  },
}, { _id: true });

const schema = new Schema<IRoster>({
  weekStartDate: {
    type: Date,
    required: true,
    index: true,
  },
  weekEndDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(this: IRoster, value: Date) {
        return value > this.weekStartDate;
      },
      message: 'Week end date must be after start date',
    },
  },
  assignments: {
    type: [dutyAssignmentSchema],
    required: true,
    validate: {
      validator: function(value: IDutyAssignment[]) {
        return value.length === 6; // Always 6 assignments (2 prod, 2 non-prod, 1 ops, 1 platform)
      },
      message: 'Roster must have exactly 6 duty assignments',
    },
  },
  createdBy: {
    type: String,
    required: true,
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
schema.index({ weekStartDate: 1 }, { unique: true });

const Roster = mongoose.model<IRoster>('Roster', schema);

export default Roster;

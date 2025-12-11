import mongoose, { Document, Schema } from 'mongoose';

export type HolidayStatus = 'Pending' | 'Approved' | 'Rejected';

export interface IHoliday extends Document {
  employeeId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  days: number;
  notes?: string;
  status: HolidayStatus;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IHoliday>({
  employeeId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Employee',
    index: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(this: IHoliday, value: Date) {
        return value >= this.startDate;
      },
      message: 'End date must be after or equal to start date',
    },
  },
  days: {
    type: Number,
    required: true,
    min: 1,
  },
  notes: {
    type: String,
    required: false,
    trim: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
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
schema.index({ status: 1 });
schema.index({ employeeId: 1, status: 1 });
schema.index({ startDate: 1, endDate: 1 });

const Holiday = mongoose.model<IHoliday>('Holiday', schema);

export default Holiday;

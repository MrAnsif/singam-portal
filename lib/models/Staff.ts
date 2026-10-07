// lib/models/Staff.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStaff extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  phone?: string;
  role: 'driver' | 'attendant';
  monthlySalary: number;
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema = new Schema<IStaff>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    role: { type: String, enum: ['driver', 'attendant'], required: true },
    monthlySalary: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export const Staff: Model<IStaff> =
  mongoose.models.Staff ?? mongoose.model<IStaff>('Staff', StaffSchema);

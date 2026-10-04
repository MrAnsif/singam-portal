// lib/models/Staff.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStaff extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  phone?: string;
  role: 'driver' | 'attendant';
  busId?: mongoose.Types.ObjectId;
  monthlySalary: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const StaffSchema = new Schema<IStaff>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    role: { type: String, enum: ['driver', 'attendant'], required: true },
    busId: { type: Schema.Types.ObjectId, ref: 'Bus' },
    monthlySalary: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const Staff: Model<IStaff> =
  mongoose.models.Staff ?? mongoose.model<IStaff>('Staff', StaffSchema);

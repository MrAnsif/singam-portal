// lib/models/Bus.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBus extends Document {
  _id: mongoose.Types.ObjectId;
  plateNumber: string;
  name?: string;
  status: 'active' | 'inactive';
  defaultDriverId?: mongoose.Types.ObjectId;
  defaultAttendantId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BusSchema = new Schema<IBus>(
  {
    plateNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: { type: String, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    defaultDriverId: { type: Schema.Types.ObjectId, ref: 'Staff' },
    defaultAttendantId: { type: Schema.Types.ObjectId, ref: 'Staff' },
  },
  { timestamps: true }
);

export const Bus: Model<IBus> =
  mongoose.models.Bus ?? mongoose.model<IBus>('Bus', BusSchema);

// lib/models/DailyRecord.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOtherExpense {
  _id?: mongoose.Types.ObjectId;
  category: string;
  amount: number;
  note?: string;
}

export interface IBookingEntry {
  _id?: mongoose.Types.ObjectId;
  reference?: string;
  customerGroup?: string;
  revenue: number;
  cost: number;
  notes?: string;
}

export interface IDailyRecord extends Document {
  _id: mongoose.Types.ObjectId;
  date: Date;
  busId: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  attendantId?: mongoose.Types.ObjectId;
  openingKm?: number;
  closingKm?: number;
  travelledKm: number; // calculated on pre-save or provided directly
  diesel: {
    qty: number;
    total: number;
  };
  adblue: {
    qty: number;
    total: number;
  };
  bookings: IBookingEntry[];
  otherExpenses: IOtherExpense[];
  notes?: string;
  status: 'draft' | 'complete' | 'edited';
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OtherExpenseSchema = new Schema<IOtherExpense>(
  {
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    note: { type: String, trim: true },
  },
  { _id: true }
);

const BookingEntrySchema = new Schema<IBookingEntry>(
  {
    reference: { type: String, trim: true },
    customerGroup: { type: String, trim: true },
    revenue: { type: Number, default: 0, min: 0 },
    cost: { type: Number, default: 0, min: 0 },
    notes: { type: String, trim: true },
  },
  { _id: true }
);

const DailyRecordSchema = new Schema<IDailyRecord>(
  {
    date: { type: Date, required: true },
    busId: { type: Schema.Types.ObjectId, ref: 'Bus', required: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'Staff' },
    attendantId: { type: Schema.Types.ObjectId, ref: 'Staff' },
    openingKm: { type: Number, min: 0 },
    closingKm: { type: Number, min: 0 },
    travelledKm: { type: Number, default: 0, min: 0 },
    diesel: {
      qty: { type: Number, default: 0, min: 0 },
      total: { type: Number, default: 0, min: 0 },
    },
    adblue: {
      qty: { type: Number, default: 0, min: 0 },
      total: { type: Number, default: 0, min: 0 },
    },
    bookings: { type: [BookingEntrySchema], default: [] },
    otherExpenses: { type: [OtherExpenseSchema], default: [] },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ['draft', 'complete', 'edited'],
      default: 'draft',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// One record per bus per date — prevents duplicate data entry
DailyRecordSchema.index({ busId: 1, date: 1 }, { unique: true });

// Pre-save: auto-calculate derived fields so UI never needs to compute them
DailyRecordSchema.pre('save', function () {
  // Calculate travelledKm only when opening/closing KM are both present
  if (typeof this.openingKm === 'number' && typeof this.closingKm === 'number') {
    this.travelledKm = Math.max(0, this.closingKm - this.openingKm);
  }
});

// Always re-register the model so schema changes take effect on hot-reloads.
// In production each serverless instance starts fresh, so this is safe.
if (mongoose.models.DailyRecord) {
  // @ts-ignore — force-overwrite stale compiled model
  delete mongoose.models.DailyRecord;
}

export const DailyRecord: Model<IDailyRecord> =
  mongoose.model<IDailyRecord>('DailyRecord', DailyRecordSchema);

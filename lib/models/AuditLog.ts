// lib/models/AuditLog.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  recordId: mongoose.Types.ObjectId;
  recordType: string;
  changedBy: mongoose.Types.ObjectId;
  changedAt: Date;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
}

const AuditLogSchema = new Schema<IAuditLog>({
  recordId: { type: Schema.Types.ObjectId, required: true, index: true },
  recordType: { type: String, required: true },
  changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  changedAt: { type: Date, default: Date.now },
  before: { type: Schema.Types.Mixed },
  after: { type: Schema.Types.Mixed },
});

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ??
  mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

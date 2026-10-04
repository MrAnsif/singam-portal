// lib/models/index.ts
// Barrel export for all Mongoose models — import from here to avoid circular deps
export { User } from './User';
export type { IUser } from './User';

export { Bus } from './Bus';
export type { IBus } from './Bus';

export { Staff } from './Staff';
export type { IStaff } from './Staff';

export { DailyRecord } from './DailyRecord';
export type { IDailyRecord, IOtherExpense, IBookingEntry } from './DailyRecord';

export { AuditLog } from './AuditLog';
export type { IAuditLog } from './AuditLog';

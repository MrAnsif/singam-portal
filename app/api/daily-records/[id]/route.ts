// app/api/daily-records/[id]/route.ts
// GET /api/daily-records/[id]   — record detail
// PATCH /api/daily-records/[id] — update record + create audit log
// DELETE /api/daily-records/[id] — owner only soft delete
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DailyRecord, AuditLog } from '@/lib/models';
import { requireAuth, requireRole, ok, fail } from '@/lib/api-helpers';
import { z } from 'zod';

const UpdateRecordSchema = z.object({
  openingKm: z.number().min(0).optional(),
  closingKm: z.number().min(0).optional(),
  driverId: z.string().nullable().optional(),
  attendantId: z.string().nullable().optional(),
  diesel: z
    .object({
      qty: z.number().min(0).optional(),
      pricePerL: z.number().min(0).optional(),
    })
    .optional(),
  adblue: z
    .object({
      qty: z.number().min(0).optional(),
      pricePerL: z.number().min(0).optional(),
    })
    .optional(),
  bookings: z.array(z.any()).optional(),
  otherExpenses: z.array(z.any()).optional(),
  notes: z.string().optional(),
  status: z.enum(['draft', 'complete', 'edited']).optional(),
});

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/daily-records/[id]'>
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await ctx.params;
  await connectDB();

  const record = await DailyRecord.findById(id)
    .populate('busId', 'plateNumber name')
    .populate('driverId', 'name phone')
    .populate('attendantId', 'name phone')
    .populate('createdBy', 'name role')
    .populate('updatedBy', 'name role')
    .lean();

  if (!record) return fail('Record not found', 404);
  return ok(record);
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/daily-records/[id]'>
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid JSON body');
  }

  const parsed = UpdateRecordSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  await connectDB();

  const existing = await DailyRecord.findById(id);
  if (!existing) return fail('Record not found', 404);

  // Validate km ordering if both provided
  const newOpening = parsed.data.openingKm ?? existing.openingKm;
  const newClosing = parsed.data.closingKm ?? existing.closingKm;
  if (newClosing < newOpening) {
    return fail('Closing KM cannot be less than opening KM.');
  }

  // Write audit log before update
  const before = existing.toObject();
  
  const updated = await DailyRecord.findByIdAndUpdate(
    id,
    {
      ...parsed.data,
      status: 'edited',
      updatedBy: session!.user.id,
    },
    { new: true, runValidators: true }
  )
    .populate('busId', 'plateNumber name')
    .populate('driverId', 'name')
    .populate('attendantId', 'name');

  // Audit log
  await AuditLog.create({
    recordId: id,
    recordType: 'DailyRecord',
    changedBy: session!.user.id,
    before: JSON.parse(JSON.stringify(before)),
    after: JSON.parse(JSON.stringify(updated?.toObject() || {})),
  });

  return ok(updated);
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<'/api/daily-records/[id]'>
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const roleError = requireRole(session!.user.role, ['owner']);
  if (roleError) return roleError;

  const { id } = await ctx.params;
  await connectDB();

  // Soft delete — keep the record but mark it so it can be excluded
  const record = await DailyRecord.findByIdAndUpdate(
    id,
    { status: 'edited', notes: '[DELETED]', updatedBy: session!.user.id },
    { new: true }
  );

  if (!record) return fail('Record not found', 404);

  // Audit log
  await AuditLog.create({
    recordId: id,
    recordType: 'DailyRecord',
    changedBy: session!.user.id,
    before: {},
    after: { action: 'DELETED' },
  });

  return ok({ message: 'Record deleted' });
}

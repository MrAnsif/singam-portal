// app/api/staff/[id]/route.ts
// PATCH /api/staff/[id] — update staff member (owner only)
// DELETE /api/staff/[id] — soft delete (owner only)
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Staff } from '@/lib/models';
import { requireAuth, requireRole, ok, fail } from '@/lib/api-helpers';
import { z } from 'zod';

const UpdateStaffSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  busId: z.string().nullable().optional(),
  monthlySalary: z.number().min(0).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/staff/[id]'>
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await ctx.params;
  await connectDB();

  const staff = await Staff.findById(id)
    .populate('busId', 'plateNumber name')
    .lean();

  if (!staff) return fail('Staff member not found', 404);
  return ok(staff);
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/staff/[id]'>
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const roleError = requireRole(session!.user.role, ['owner']);
  if (roleError) return roleError;

  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid JSON body');
  }

  const parsed = UpdateStaffSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  await connectDB();
  const staff = await Staff.findByIdAndUpdate(id, parsed.data, { new: true });
  if (!staff) return fail('Staff member not found', 404);

  return ok(staff);
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<'/api/staff/[id]'>
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const roleError = requireRole(session!.user.role, ['owner']);
  if (roleError) return roleError;

  const { id } = await ctx.params;
  await connectDB();

  const staff = await Staff.findByIdAndUpdate(
    id,
    { status: 'inactive' },
    { new: true }
  );
  if (!staff) return fail('Staff member not found', 404);

  return ok({ message: 'Staff member deactivated' });
}

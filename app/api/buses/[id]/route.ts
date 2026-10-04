// app/api/buses/[id]/route.ts
// GET /api/buses/[id]   — bus detail with populated staff
// PATCH /api/buses/[id] — update bus
// DELETE /api/buses/[id] — soft delete (owner only)
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Bus } from '@/lib/models';
import { requireAuth, requireRole, ok, fail } from '@/lib/api-helpers';
import { z } from 'zod';

const UpdateBusSchema = z.object({
  name: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  defaultDriverId: z.string().nullable().optional(),
  defaultAttendantId: z.string().nullable().optional(),
});

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/buses/[id]'>
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await ctx.params;
  await connectDB();

  const bus = await Bus.findById(id)
    .populate('defaultDriverId', 'name phone role monthlySalary')
    .populate('defaultAttendantId', 'name phone role monthlySalary')
    .lean();

  if (!bus) return fail('Bus not found', 404);
  return ok(bus);
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/buses/[id]'>
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

  const parsed = UpdateBusSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  await connectDB();
  const bus = await Bus.findByIdAndUpdate(id, parsed.data, { new: true });
  if (!bus) return fail('Bus not found', 404);

  return ok(bus);
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<'/api/buses/[id]'>
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const roleError = requireRole(session!.user.role, ['owner']);
  if (roleError) return roleError;

  const { id } = await ctx.params;
  await connectDB();

  const bus = await Bus.findByIdAndUpdate(
    id,
    { status: 'inactive' },
    { new: true }
  );
  if (!bus) return fail('Bus not found', 404);

  return ok({ message: 'Bus deactivated successfully' });
}

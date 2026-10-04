// app/api/buses/route.ts
// GET /api/buses  — list active buses
// POST /api/buses — create bus (owner only)
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Bus } from '@/lib/models';
import { requireAuth, requireRole, ok, fail } from '@/lib/api-helpers';
import { z } from 'zod';

const CreateBusSchema = z.object({
  plateNumber: z.string().min(1).max(20),
  name: z.string().optional(),
  defaultDriverId: z.string().optional(),
  defaultAttendantId: z.string().optional(),
});

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  await connectDB();
  const buses = await Bus.find({ status: 'active' })
    .sort({ plateNumber: 1 })
    .populate('defaultDriverId', 'name role')
    .populate('defaultAttendantId', 'name role')
    .lean();

  return ok(buses);
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const roleError = requireRole(session!.user.role, ['owner']);
  if (roleError) return roleError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail('Invalid JSON body');
  }

  const parsed = CreateBusSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0].message, 400);
  }

  await connectDB();

  const existing = await Bus.findOne({
    plateNumber: parsed.data.plateNumber.toUpperCase(),
  });
  if (existing) {
    return fail(`Bus with plate number ${parsed.data.plateNumber} already exists.`, 409);
  }

  const bus = await Bus.create(parsed.data);
  return ok(bus, 201);
}

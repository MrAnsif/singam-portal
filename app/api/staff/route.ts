// app/api/staff/route.ts
// GET /api/staff?role=driver|attendant — list active staff
// POST /api/staff — create staff member (owner only)
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Staff } from '@/lib/models';
import { requireAuth, requireRole, ok, fail } from '@/lib/api-helpers';
import { z } from 'zod';

const CreateStaffSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().optional(),
  role: z.enum(['driver', 'attendant']),
  monthlySalary: z.number().min(0).default(0),
});

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = request.nextUrl;
  const role = searchParams.get('role');

  const filter: Record<string, unknown> = {};
  if (role && ['driver', 'attendant'].includes(role)) {
    filter.role = role;
  }

  await connectDB();
  const staff = await Staff.find(filter)
    .sort({ name: 1 })
    .lean();

  return ok(staff);
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

  const parsed = CreateStaffSchema.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  await connectDB();
  const staff = await Staff.create(parsed.data);
  return ok(staff, 201);
}

import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { AuditLog } from '@/lib/models';
import { requireAuth, requireRole, ok, fail } from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  _ctx: RouteContext<'/api/audit-logs'>
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const roleError = requireRole(session!.user.role, ['owner']);
  if (roleError) return roleError;

  await connectDB();

  try {
    const logs = await AuditLog.find()
      .sort({ changedAt: -1 })
      .limit(100) // Limit to latest 100 for performance initially
      .populate('changedBy', 'name role')
      .lean();

    return ok(logs);
  } catch (err) {
    console.error('Failed to fetch audit logs:', err);
    return fail('Failed to fetch audit logs', 500);
  }
}

// app/api/bookings/route.ts
// GET /api/bookings?from=YYYY-MM-DD&to=YYYY-MM-DD — returns trip hires with optional date range filter
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DailyRecord } from '@/lib/models';
import { requireAuth, ok } from '@/lib/api-helpers';
import { buildMongoDateFilter } from '@/lib/date-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = request.nextUrl;
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const period = searchParams.get('period');

  // Build date filter when range params are provided
  const filter: Record<string, unknown> = { 'bookings.0': { $exists: true } };
  const dateFilter = buildMongoDateFilter(from, to, period);
  if (dateFilter) {
    filter.date = dateFilter;
  }

  await connectDB();
  const records = await DailyRecord.find(filter)
    .sort({ date: -1 })
    .populate('busId', 'plateNumber')
    .lean();

  const bookingsList: any[] = [];

  for (const r of records) {
    const busPlate =
      typeof r.busId === 'object' && (r.busId as any)?.plateNumber
        ? (r.busId as any).plateNumber
        : 'Bus';

    for (let i = 0; i < r.bookings.length; i++) {
      const b = r.bookings[i];
      bookingsList.push({
        id: `${r._id}-b-${i}`,
        date: r.date,
        busPlate,
        reference: b.reference || '—',
        customerGroup: b.customerGroup || 'General Hire',
        revenue: b.revenue || 0,
        // cost is no longer tracked in the manager flow — always 0
        notes: b.notes,
        recordId: r._id,
      });
    }
  }

  return ok({ bookings: bookingsList });
}

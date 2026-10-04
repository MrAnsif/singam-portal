// app/api/bookings/route.ts
// GET /api/bookings — returns list of trip hires & bookings
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DailyRecord } from '@/lib/models';
import { requireAuth, ok } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  await connectDB();
  const records = await DailyRecord.find({ 'bookings.0': { $exists: true } })
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
        cost: b.cost || 0,
        net: (b.revenue || 0) - (b.cost || 0),
        notes: b.notes,
        recordId: r._id,
      });
    }
  }

  return ok({ bookings: bookingsList });
}

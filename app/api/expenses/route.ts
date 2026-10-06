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

  const filter: Record<string, unknown> = {};
  const dateFilter = buildMongoDateFilter(from, to, period);
  if (dateFilter) {
    filter.date = dateFilter;
  }

  await connectDB();
  const records = await DailyRecord.find(filter)
    .sort({ date: -1 })
    .populate('busId', 'plateNumber')
    .populate('createdBy', 'name')
    .lean();

  const expenseItems: any[] = [];

  for (const r of records) {
    const busPlate =
      typeof r.busId === 'object' && (r.busId as any)?.plateNumber
        ? (r.busId as any).plateNumber
        : 'Bus';
    const enteredBy =
      typeof r.createdBy === 'object' && (r.createdBy as any)?.name
        ? (r.createdBy as any).name
        : 'Staff';

    // Diesel
    if (r.diesel?.total > 0) {
      expenseItems.push({
        id: `${r._id}-diesel`,
        date: r.date,
        busPlate,
        category: 'Diesel',
        description: `Diesel refill: ${r.diesel.qty}L — ₹${r.diesel.total}`,
        amount: r.diesel.total,
        enteredBy,
        recordId: r._id,
      });
    }

    // AdBlue
    if (r.adblue?.total > 0) {
      expenseItems.push({
        id: `${r._id}-adblue`,
        date: r.date,
        busPlate,
        category: 'AdBlue',
        description: `AdBlue refill: ${r.adblue.qty}L — ₹${r.adblue.total}`,
        amount: r.adblue.total,
        enteredBy,
        recordId: r._id,
      });
    }

    // Other expenses
    if (r.otherExpenses?.length > 0) {
      for (let i = 0; i < r.otherExpenses.length; i++) {
        const item = r.otherExpenses[i];
        expenseItems.push({
          id: `${r._id}-other-${i}`,
          date: r.date,
          busPlate,
          category: item.category || 'Other',
          description: item.note || item.category,
          amount: item.amount,
          enteredBy,
          recordId: r._id,
        });
      }
    }
  }

  return ok({ expenses: expenseItems });
}

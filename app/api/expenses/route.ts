// app/api/expenses/route.ts
// GET /api/expenses — returns detailed expense line-items for expenses page
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DailyRecord } from '@/lib/models';
import { requireAuth, ok } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  await connectDB();
  const records = await DailyRecord.find({})
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
        description: `Diesel refill: ${r.diesel.qty}L @ ₹${r.diesel.pricePerL}/L`,
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
        description: `AdBlue refill: ${r.adblue.qty}L @ ₹${r.adblue.pricePerL}/L`,
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

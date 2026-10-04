// app/api/reports/route.ts
// GET /api/reports — returns aggregated period comparison report for owner
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DailyRecord, Bus } from '@/lib/models';
import { requireAuth, ok } from '@/lib/api-helpers';

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  await connectDB();

  const [records, buses] = await Promise.all([
    DailyRecord.find({}).sort({ date: -1 }).populate('busId', 'plateNumber').lean(),
    Bus.find({}).lean(),
  ]);

  const totalKm = records.reduce((s, r) => s + (r.travelledKm || 0), 0);
  const totalDieselL = records.reduce((s, r) => s + (r.diesel?.qty || 0), 0);
  const totalDieselCost = records.reduce((s, r) => s + (r.diesel?.total || 0), 0);
  const totalAdblueCost = records.reduce((s, r) => s + (r.adblue?.total || 0), 0);
  const totalOther = records.reduce(
    (s, r) => s + (r.otherExpenses?.reduce((es: number, e: any) => es + (e.amount || 0), 0) || 0),
    0
  );
  const totalExpense = totalDieselCost + totalAdblueCost + totalOther;
  const totalRevenue = records.reduce(
    (s, r) => s + (r.bookings?.reduce((bs: number, b: any) => bs + (b.revenue || 0), 0) || 0),
    0
  );

  return ok({
    summary: {
      totalRecords: records.length,
      activeBuses: buses.length,
      totalKm,
      totalDieselL,
      totalExpense,
      totalRevenue,
      netContribution: totalRevenue - totalExpense,
      kmPerL: totalDieselL > 0 ? +(totalKm / totalDieselL).toFixed(2) : 0,
      costPerKm: totalKm > 0 ? +(totalExpense / totalKm).toFixed(2) : 0,
    },
  });
}

// app/api/dashboard/stats/route.ts
// GET /api/dashboard/stats?period=today|week|month|6months|year|custom&busId=&from=&to=
// Returns aggregated KPIs, expense breakdown, trend, alerts, and recent activity
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { DailyRecord } from '@/lib/models';
import { requireAuth, requireRole, ok } from '@/lib/api-helpers';
import {
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  subMonths, subWeeks, subDays,
  subYears, startOfYear, endOfYear,
  parseISO, isValid,
} from 'date-fns';

export const dynamic = 'force-dynamic';

type Period = 'today' | 'week' | 'month' | '6months' | 'year' | 'custom';

function getDateRange(period: Period, from?: string, to?: string) {
  const now = new Date();

  if (from || to) {
    const s = from && isValid(parseISO(from)) ? parseISO(from) : startOfMonth(now);
    const e = to && isValid(parseISO(to)) ? parseISO(to) : endOfMonth(now);
    const start = startOfDay(s);
    const end = endOfDay(e);
    const diffMs = Math.max(86400000, end.getTime() - start.getTime());
    return {
      start,
      end,
      prevStart: new Date(start.getTime() - diffMs),
      prevEnd: new Date(start.getTime() - 1),
    };
  }

  switch (period) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now), prevStart: startOfDay(subDays(now, 1)), prevEnd: endOfDay(subDays(now, 1)) };
    case 'week':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }), prevStart: startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), prevEnd: endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }) };
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now), prevStart: startOfMonth(subMonths(now, 1)), prevEnd: endOfMonth(subMonths(now, 1)) };
    case '6months':
      return { start: startOfMonth(subMonths(now, 5)), end: endOfMonth(now), prevStart: startOfMonth(subMonths(now, 11)), prevEnd: endOfMonth(subMonths(now, 6)) };
    case 'year':
      return { start: startOfYear(now), end: endOfYear(now), prevStart: startOfYear(subYears(now, 1)), prevEnd: endOfYear(subYears(now, 1)) };
    default:
      return { start: startOfMonth(now), end: endOfMonth(now), prevStart: startOfMonth(subMonths(now, 1)), prevEnd: endOfMonth(subMonths(now, 1)) };
  }
}

export async function GET(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const roleError = requireRole(session.user?.role as string, ['owner', 'manager']);
  if (roleError) return roleError;

  const { searchParams } = request.nextUrl;
  const period = (searchParams.get('period') as Period) ?? 'month';
  const busId = searchParams.get('busId');
  const from = searchParams.get('from') ?? undefined;
  const to = searchParams.get('to') ?? undefined;

  const { start, end, prevStart, prevEnd } = getDateRange(period, from, to);

  await connectDB();

  const baseFilter: Record<string, unknown> = { date: { $gte: start, $lte: end } };
  const prevFilter: Record<string, unknown> = { date: { $gte: prevStart, $lte: prevEnd } };

  if (busId) {
    baseFilter.busId = busId;
    prevFilter.busId = busId;
  }

  // Main aggregation pipeline
  const [agg, prevAgg, recent] = await Promise.all([
    DailyRecord.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: null,
          totalKm: { $sum: '$travelledKm' },
          totalDieselL: { $sum: '$diesel.qty' },
          totalDieselCost: { $sum: '$diesel.total' },
          totalAdblueL: { $sum: '$adblue.qty' },
          totalAdblueCost: { $sum: '$adblue.total' },
          totalBookingRevenue: { $sum: { $sum: '$bookings.revenue' } },
          totalBookingCost: { $sum: { $sum: '$bookings.cost' } },
          totalBookings: { $sum: { $size: '$bookings' } },
          totalOtherExpenses: { $sum: { $sum: '$otherExpenses.amount' } },
          recordCount: { $sum: 1 },
        },
      },
    ]),
    DailyRecord.aggregate([
      { $match: prevFilter },
      {
        $group: {
          _id: null,
          totalExpense: {
            $sum: { $add: ['$diesel.total', '$adblue.total', { $sum: '$otherExpenses.amount' }] },
          },
        },
      },
    ]),
    DailyRecord.find(baseFilter)
      .sort({ date: -1 })
      .limit(5)
      .populate('busId', 'plateNumber')
      .populate('createdBy', 'name')
      .lean(),
  ]);

  const data = agg[0] ?? {
    totalKm: 0, totalDieselL: 0, totalDieselCost: 0,
    totalAdblueL: 0, totalAdblueCost: 0, totalBookingRevenue: 0,
    totalBookingCost: 0, totalBookings: 0, totalOtherExpenses: 0, recordCount: 0,
  };

  const totalExpense =
    data.totalDieselCost + data.totalAdblueCost + data.totalOtherExpenses;
  const prevExpense = prevAgg[0]?.totalExpense ?? 0;
  const percentChange =
    prevExpense > 0
      ? +((((totalExpense - prevExpense) / prevExpense) * 100).toFixed(1))
      : 0;

  const kmPerL =
    data.totalDieselL > 0
      ? +(data.totalKm / data.totalDieselL).toFixed(2)
      : 0;
  const costPerKm =
    data.totalKm > 0
      ? +(totalExpense / data.totalKm).toFixed(2)
      : 0;

  const expenseByCategory = [
    { category: 'Diesel', amount: data.totalDieselCost },
    { category: 'AdBlue', amount: data.totalAdblueCost },
    { category: 'Other', amount: data.totalOtherExpenses },
  ];

  // Optional: We can group revenue by customerGroup by doing a separate aggregate on the un-winded bookings.
  // Instead of a massive facet, let's just do a quick parallel query for it since we need it for the frontend.
  const revenueByCustomerGroupAgg = await DailyRecord.aggregate([
    { $match: baseFilter },
    { $unwind: '$bookings' },
    {
      $group: {
        _id: '$bookings.customerGroup',
        revenue: { $sum: '$bookings.revenue' },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  const revenueByCustomerGroup = revenueByCustomerGroupAgg.map((r) => ({
    group: r._id || 'Unknown',
    revenue: r.revenue,
  }));

  return ok({
    period,
    dateRange: { start: start.toISOString(), end: end.toISOString() },
    prevDateRange: { start: prevStart.toISOString(), end: prevEnd.toISOString() },
    kpis: {
      totalExpense,
      totalKm: data.totalKm,
      totalDieselL: data.totalDieselL,
      totalDieselCost: data.totalDieselCost,
      totalAdblueL: data.totalAdblueL,
      totalAdblueCost: data.totalAdblueCost,
      totalBookings: data.totalBookings,
      totalBookingRevenue: data.totalBookingRevenue,
      totalBookingCost: data.totalBookingCost,
      totalOtherExpenses: data.totalOtherExpenses,
      kmPerL,
      costPerKm,
      recordCount: data.recordCount,
    },
    comparison: {
      prevExpense,
      percentChange,
    },
    expenseByCategory,
    revenueByCustomerGroup,
    recentActivity: recent,
  });
}
